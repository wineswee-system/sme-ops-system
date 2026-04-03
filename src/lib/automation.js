import { supabase } from './supabase'

/**
 * SME OPS 自動化引擎
 *
 * 勾稽邏輯:
 * 1. CRM 訂單 → 檢查 WMS 庫存 → 不足自動產生採購建議 (PR)
 * 2. WMS 出貨完成 → 自動拋轉 AR 應收帳款
 * 3. 成本核算: WMS 進貨成本 + HR 人工成本 = 毛利
 */

// ── 1. CRM → WMS → 採購建議 ──
// 當 CRM 建立銷售訂單時，檢查 WMS 庫存，不足則自動產生採購申請
export async function checkStockAndCreatePR(orderItems, requester = '系統') {
  const shortages = []

  for (const item of orderItems) {
    // 查 WMS 庫存
    const { data: stock } = await supabase
      .from('stock_levels')
      .select('*')
      .eq('sku_name', item.name)
      .maybeSingle()

    const available = stock?.quantity || 0
    const needed = item.qty || 0

    if (available < needed) {
      shortages.push({
        name: item.name,
        current_stock: available,
        needed: needed,
        shortage: needed - available,
        // 建議採購量 = 缺少量 × 1.5 (安全係數)
        suggested_qty: Math.ceil((needed - available) * 1.5),
        unit: stock?.unit || item.unit || '個',
        price: stock?.unit_cost || item.price || 0,
      })
    }
  }

  if (shortages.length === 0) return { ok: true, shortages: [], pr: null }

  // 自動產生採購申請
  const prItems = shortages.map(s => ({
    name: s.name,
    qty: s.suggested_qty,
    unit: s.unit,
    price: s.price,
  }))
  const totalAmount = prItems.reduce((sum, i) => sum + i.qty * i.price, 0)

  const prNumber = `PR-${new Date().toISOString().slice(0, 4)}-${String(Date.now()).slice(-3)}`

  const { data: pr } = await supabase.from('purchase_requests').insert({
    pr_number: prNumber,
    requester,
    department: '系統自動',
    items: prItems,
    total_amount: totalAmount,
    reason: `庫存不足自動產生（${shortages.map(s => s.name).join('、')}）`,
    status: '待審核',
  }).select().single()

  return { ok: false, shortages, pr }
}

// ── 2. WMS 出貨 → AR 應收帳款 ──
// 當 WMS 出貨單完成時，自動建立應收帳款
export async function createARFromShipment(shipment) {
  const invoiceNumber = `INV-${new Date().toISOString().slice(0, 4)}-${String(Date.now()).slice(-3)}`

  const { data: ar } = await supabase.from('accounts_receivable').insert({
    invoice_number: invoiceNumber,
    customer: shipment.customer,
    order_ref: shipment.order_ref || shipment.id,
    amount: shipment.total_amount,
    paid_amount: 0,
    due_date: getDueDate(30), // NET30
    status: '未收款',
  }).select().single()

  // 同時產生傳票
  if (ar) {
    const entryNumber = `JE-${new Date().toISOString().slice(0, 4)}-${String(Date.now()).slice(-3)}`
    const { data: entry } = await supabase.from('journal_entries').insert({
      entry_number: entryNumber,
      entry_date: new Date().toISOString().slice(0, 10),
      description: `出貨產生應收 - ${shipment.customer} (${invoiceNumber})`,
      source: '出貨',
      source_id: shipment.id,
      status: '已過帳',
      created_by: '系統',
    }).select().single()

    if (entry) {
      await supabase.from('journal_lines').insert([
        {
          entry_id: entry.id,
          account_code: '1300',
          account_name: '應收帳款',
          debit: shipment.total_amount,
          credit: 0,
          memo: `${shipment.customer} - ${invoiceNumber}`,
        },
        {
          entry_id: entry.id,
          account_code: '4100',
          account_name: '營業收入',
          debit: 0,
          credit: shipment.total_amount,
          memo: `${shipment.customer} - ${invoiceNumber}`,
        },
      ])
    }
  }

  return ar
}

// ── 3. 採購入庫 → AP 應付帳款 ──
// 當進貨驗收完成，自動建立應付帳款
export async function createAPFromReceipt(receipt, po) {
  const billNumber = `BILL-${new Date().toISOString().slice(0, 4)}-${String(Date.now()).slice(-3)}`
  const amount = (po.total_amount || 0) + (po.tax || 0) + (po.shipping || 0)
  const paymentDays = parsePaymentTerms(po.payment_terms)

  const { data: ap } = await supabase.from('accounts_payable').insert({
    bill_number: billNumber,
    supplier: po.supplier,
    po_ref: po.po_number,
    amount,
    paid_amount: 0,
    due_date: getDueDate(paymentDays),
    status: '未付款',
  }).select().single()

  // 產生傳票
  if (ap) {
    const entryNumber = `JE-${new Date().toISOString().slice(0, 4)}-${String(Date.now()).slice(-3)}A`
    const { data: entry } = await supabase.from('journal_entries').insert({
      entry_number: entryNumber,
      entry_date: new Date().toISOString().slice(0, 10),
      description: `採購入庫 - ${po.supplier} (${po.po_number})`,
      source: '採購',
      source_id: po.id,
      status: '已過帳',
      created_by: '系統',
    }).select().single()

    if (entry) {
      await supabase.from('journal_lines').insert([
        {
          entry_id: entry.id,
          account_code: '5100',
          account_name: '營業成本',
          debit: amount,
          credit: 0,
          memo: `${po.supplier} - ${po.po_number}`,
        },
        {
          entry_id: entry.id,
          account_code: '2100',
          account_name: '應付帳款',
          debit: 0,
          credit: amount,
          memo: `${po.supplier} - ${po.po_number}`,
        },
      ])
    }
  }

  return ap
}

// ── 4. 成本核算 ──
// 計算指定期間的毛利
export async function calculateProfitability(month) {
  // month format: '2026-04'

  // 收入: AR 已收款金額
  const { data: arRecords } = await supabase
    .from('accounts_receivable')
    .select('amount, paid_amount')

  const revenue = (arRecords || []).reduce((s, r) => s + (r.paid_amount || 0), 0)

  // 進貨成本: AP 金額
  const { data: apRecords } = await supabase
    .from('accounts_payable')
    .select('amount, paid_amount')

  const purchaseCost = (apRecords || []).reduce((s, r) => s + (r.amount || 0), 0)

  // 人工成本: 薪資
  const { data: salaryRecords } = await supabase
    .from('salary_records')
    .select('net_salary')
    .eq('month', month)

  const laborCost = (salaryRecords || []).reduce((s, r) => s + (r.net_salary || 0), 0)

  const totalCost = purchaseCost + laborCost
  const grossProfit = revenue - totalCost
  const grossMargin = revenue > 0 ? Math.round((grossProfit / revenue) * 100) : 0

  return {
    revenue,
    purchaseCost,
    laborCost,
    totalCost,
    grossProfit,
    grossMargin,
  }
}

// ── Helpers ──

function getDueDate(days) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

function parsePaymentTerms(terms) {
  if (!terms) return 30
  if (terms === 'COD') return 0
  const match = terms.match(/NET(\d+)/)
  return match ? parseInt(match[1]) : 30
}
