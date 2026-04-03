import { useState, useEffect } from 'react'
import { Plus, Search } from 'lucide-react'
import { getSalesOrders, createSalesOrder } from '../../lib/db'
import LoadingSpinner from '../../components/LoadingSpinner'
import Modal, { Field } from '../../components/Modal'

const PAYMENT_BADGE = { '已付款': 'badge-success', '未付款': 'badge-danger', '部分付款': 'badge-warning' }
const SHIPPING_BADGE = { '已出貨': 'badge-success', '待出貨': 'badge-warning', '已取消': 'badge-danger' }

export default function SalesOrders() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [search, setSearch] = useState('')
  const [form, setForm] = useState({ order_number: '', customer: '', total: 0, payment_status: '未付款', shipping_status: '待出貨', credit_check: '通過' })

  useEffect(() => {
    getSalesOrders().then(({ data }) => { setItems(data || []); setLoading(false) })
  }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async () => {
    if (!form.order_number || !form.customer) return
    const { data } = await createSalesOrder({ ...form, total: Number(form.total) })
    if (data) {
      setItems(prev => [...prev, data])
      setShowModal(false)
      setForm({ order_number: '', customer: '', total: 0, payment_status: '未付款', shipping_status: '待出貨', credit_check: '通過' })
    }
  }

  if (loading) return <LoadingSpinner />

  const filtered = items.filter(s =>
    search === '' || s.order_number?.includes(search) || s.customer?.includes(search)
  )

  const pendingShip = filtered.filter(s => s.shipping_status === '待出貨').length
  const shipped = filtered.filter(s => s.shipping_status === '已出貨').length
  const unpaid = filtered.filter(s => s.payment_status === '未付款').length
  const now = new Date()
  const monthRevenue = filtered
    .filter(s => { const d = new Date(s.created_at); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() })
    .reduce((sum, s) => sum + (s.total || 0), 0)

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h2><span className="header-icon">📦</span> 銷售訂單</h2>
            <p>訂單管理、出貨與收款追蹤</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={14} /> 新增訂單</button>
        </div>
      </div>

      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="stat-card" style={{ '--card-accent': 'var(--accent-orange)', '--card-accent-dim': 'var(--accent-orange-dim)' }}>
          <div className="stat-card-label">待出貨</div>
          <div className="stat-card-value">{pendingShip}</div>
        </div>
        <div className="stat-card" style={{ '--card-accent': 'var(--accent-green)', '--card-accent-dim': 'var(--accent-green-dim)' }}>
          <div className="stat-card-label">已出貨</div>
          <div className="stat-card-value">{shipped}</div>
        </div>
        <div className="stat-card" style={{ '--card-accent': 'var(--accent-red)', '--card-accent-dim': 'var(--accent-red-dim)' }}>
          <div className="stat-card-label">未付款</div>
          <div className="stat-card-value">{unpaid}</div>
        </div>
        <div className="stat-card" style={{ '--card-accent': 'var(--accent-cyan)', '--card-accent-dim': 'var(--accent-cyan-dim)' }}>
          <div className="stat-card-label">本月營收</div>
          <div className="stat-card-value">NT$ {monthRevenue.toLocaleString()}</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title"><span className="card-title-icon">📋</span> 訂單列表</div>
          <div className="search-bar">
            <Search className="search-icon" />
            <input type="text" placeholder="搜尋訂單..." className="form-input" style={{ paddingLeft: 38 }} value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr><th>訂單編號</th><th>客戶</th><th>金額</th><th>付款狀態</th><th>出貨狀態</th><th>信用檢核</th><th>建立時間</th></tr>
            </thead>
            <tbody>
              {filtered.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>尚無訂單</td></tr>}
              {filtered.map(s => (
                <tr key={s.id}>
                  <td style={{ fontWeight: 600 }}>{s.order_number}</td>
                  <td>{s.customer}</td>
                  <td>NT$ {(s.total || 0).toLocaleString()}</td>
                  <td>
                    <span className={`badge ${PAYMENT_BADGE[s.payment_status] || 'badge-info'}`}>
                      <span className="badge-dot"></span>{s.payment_status}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${SHIPPING_BADGE[s.shipping_status] || 'badge-info'}`}>
                      <span className="badge-dot"></span>{s.shipping_status}
                    </span>
                  </td>
                  <td>
                    <span style={{ color: s.credit_check === '通過' ? 'var(--accent-green)' : 'var(--accent-red)', fontWeight: 600 }}>
                      {s.credit_check}
                    </span>
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{s.created_at ? new Date(s.created_at).toLocaleDateString() : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <Modal title="新增銷售訂單" onClose={() => setShowModal(false)} onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="訂單編號 *">
              <input className="form-input" type="text" style={{ width: '100%' }} placeholder="SO-2026-001" value={form.order_number} onChange={e => set('order_number', e.target.value)} />
            </Field>
            <Field label="客戶 *">
              <input className="form-input" type="text" style={{ width: '100%' }} placeholder="客戶名稱" value={form.customer} onChange={e => set('customer', e.target.value)} />
            </Field>
          </div>
          <Field label="金額">
            <input className="form-input" type="number" style={{ width: '100%' }} placeholder="0" value={form.total} onChange={e => set('total', e.target.value)} />
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <Field label="付款狀態">
              <select className="form-input" style={{ width: '100%' }} value={form.payment_status} onChange={e => set('payment_status', e.target.value)}>
                <option>未付款</option>
                <option>部分付款</option>
                <option>已付款</option>
              </select>
            </Field>
            <Field label="出貨狀態">
              <select className="form-input" style={{ width: '100%' }} value={form.shipping_status} onChange={e => set('shipping_status', e.target.value)}>
                <option>待出貨</option>
                <option>已出貨</option>
                <option>已取消</option>
              </select>
            </Field>
            <Field label="信用檢核">
              <select className="form-input" style={{ width: '100%' }} value={form.credit_check} onChange={e => set('credit_check', e.target.value)}>
                <option>通過</option>
                <option>鎖定</option>
              </select>
            </Field>
          </div>
        </Modal>
      )}
    </div>
  )
}
