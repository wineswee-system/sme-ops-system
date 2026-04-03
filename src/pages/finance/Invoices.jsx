import { useState, useEffect } from 'react'
import { Plus, Search, XCircle } from 'lucide-react'
import { getInvoices, createInvoice, updateInvoice } from '../../lib/db'
import LoadingSpinner from '../../components/LoadingSpinner'
import Modal, { Field } from '../../components/Modal'

const CARRIER_TYPES = ['手機條碼', '自然人憑證', '無']

export default function Invoices() {
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [search, setSearch] = useState('')
  const [form, setForm] = useState({ invoice_number: '', invoice_date: '', buyer_name: '', buyer_tax_id: '', total: 0, carrier_type: '無', status: '已開立', order_ref: '' })

  useEffect(() => {
    getInvoices().then(({ data }) => { setInvoices(data || []); setLoading(false) })
  }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async () => {
    if (!form.invoice_number || !form.buyer_name) return
    const { data } = await createInvoice(form)
    if (data) {
      setInvoices(prev => [...prev, data])
      setShowModal(false)
      setForm({ invoice_number: '', invoice_date: '', buyer_name: '', buyer_tax_id: '', total: 0, carrier_type: '無', status: '已開立', order_ref: '' })
    }
  }

  const handleVoid = async (invoice) => {
    if (!confirm(`確定要作廢發票 ${invoice.invoice_number} 嗎？`)) return
    const { data } = await updateInvoice(invoice.id, { status: '已作廢' })
    if (data) {
      setInvoices(prev => prev.map(inv => inv.id === invoice.id ? { ...inv, status: '已作廢' } : inv))
    }
  }

  if (loading) return <LoadingSpinner />

  const filtered = invoices.filter(inv =>
    search === '' || inv.invoice_number?.includes(search) || inv.buyer_name?.includes(search) || inv.buyer_tax_id?.includes(search)
  )

  const issued = filtered.filter(inv => inv.status === '已開立').length
  const voided = filtered.filter(inv => inv.status === '已作廢').length
  const now = new Date()
  const thisMonthTotal = filtered
    .filter(inv => {
      const d = new Date(inv.invoice_date || inv.created_at)
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && inv.status === '已開立'
    })
    .reduce((sum, inv) => sum + (inv.total || 0), 0)

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h2><span className="header-icon">🧾</span> 電子發票</h2>
            <p>電子發票開立與管理</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={14} /> 開立發票</button>
        </div>
      </div>

      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="stat-card" style={{ '--card-accent': 'var(--accent-green)', '--card-accent-dim': 'var(--accent-green-dim)' }}>
          <div className="stat-card-label">已開立</div>
          <div className="stat-card-value">{issued}</div>
        </div>
        <div className="stat-card" style={{ '--card-accent': 'var(--accent-red)', '--card-accent-dim': 'var(--accent-red-dim)' }}>
          <div className="stat-card-label">已作廢</div>
          <div className="stat-card-value">{voided}</div>
        </div>
        <div className="stat-card" style={{ '--card-accent': 'var(--accent-blue)', '--card-accent-dim': 'var(--accent-blue-dim)' }}>
          <div className="stat-card-label">本月開立額</div>
          <div className="stat-card-value">NT$ {thisMonthTotal.toLocaleString()}</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title"><span className="card-title-icon">📋</span> 發票列表</div>
          <div className="search-bar">
            <Search className="search-icon" />
            <input type="text" placeholder="搜尋發票..." className="form-input" style={{ paddingLeft: 38 }} value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr><th>發票號碼</th><th>開立日期</th><th>買受人</th><th>統一編號</th><th>金額</th><th>載具類型</th><th>狀態</th><th>訂單參考</th><th>操作</th></tr>
            </thead>
            <tbody>
              {filtered.length === 0 && <tr><td colSpan={9} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>尚無發票</td></tr>}
              {filtered.map(inv => (
                <tr key={inv.id}>
                  <td style={{ fontWeight: 600 }}>{inv.invoice_number}</td>
                  <td>{inv.invoice_date}</td>
                  <td>{inv.buyer_name}</td>
                  <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{inv.buyer_tax_id}</td>
                  <td>NT$ {(inv.total || 0).toLocaleString()}</td>
                  <td>{inv.carrier_type}</td>
                  <td>
                    <span className={`badge ${inv.status === '已開立' ? 'badge-success' : 'badge-danger'}`}>
                      <span className="badge-dot"></span>{inv.status}
                    </span>
                  </td>
                  <td>{inv.order_ref}</td>
                  <td>
                    {inv.status === '已開立' && (
                      <button className="btn btn-sm" style={{ color: 'var(--accent-red)', background: 'transparent', border: '1px solid var(--accent-red)', padding: '2px 8px', fontSize: 12, borderRadius: 6, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }} onClick={() => handleVoid(inv)}>
                        <XCircle size={12} /> 作廢
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <Modal title="開立發票" onClose={() => setShowModal(false)} onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="發票號碼 *">
              <input className="form-input" type="text" style={{ width: '100%' }} placeholder="AB-12345678" value={form.invoice_number} onChange={e => set('invoice_number', e.target.value)} />
            </Field>
            <Field label="開立日期">
              <input className="form-input" type="date" style={{ width: '100%' }} value={form.invoice_date} onChange={e => set('invoice_date', e.target.value)} />
            </Field>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="買受人 *">
              <input className="form-input" type="text" style={{ width: '100%' }} placeholder="買受人名稱" value={form.buyer_name} onChange={e => set('buyer_name', e.target.value)} />
            </Field>
            <Field label="統一編號">
              <input className="form-input" type="text" style={{ width: '100%' }} placeholder="12345678" value={form.buyer_tax_id} onChange={e => set('buyer_tax_id', e.target.value)} />
            </Field>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <Field label="金額">
              <input className="form-input" type="number" style={{ width: '100%' }} value={form.total} onChange={e => set('total', Number(e.target.value))} />
            </Field>
            <Field label="載具類型">
              <select className="form-input" style={{ width: '100%' }} value={form.carrier_type} onChange={e => set('carrier_type', e.target.value)}>
                {CARRIER_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="訂單參考">
              <input className="form-input" type="text" style={{ width: '100%' }} placeholder="SO-001" value={form.order_ref} onChange={e => set('order_ref', e.target.value)} />
            </Field>
          </div>
        </Modal>
      )}
    </div>
  )
}
