import { useState, useEffect } from 'react'
import { Plus, Search, ArrowRightCircle } from 'lucide-react'
import { getQuotations, createQuotation, updateQuotation } from '../../lib/db'
import LoadingSpinner from '../../components/LoadingSpinner'
import Modal, { Field } from '../../components/Modal'

const STATUS_BADGE = { '草稿': 'badge-warning', '已送出': 'badge-info', '已成交': 'badge-success', '已失效': 'badge-danger' }

export default function Quotations() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [search, setSearch] = useState('')
  const [form, setForm] = useState({ quote_number: '', customer: '', version: 1, total: 0, valid_until: '', status: '草稿', created_by: '' })

  useEffect(() => {
    getQuotations().then(({ data }) => { setItems(data || []); setLoading(false) })
  }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async () => {
    if (!form.quote_number || !form.customer) return
    const { data } = await createQuotation({ ...form, total: Number(form.total) })
    if (data) {
      setItems(prev => [...prev, data])
      setShowModal(false)
      setForm({ quote_number: '', customer: '', version: 1, total: 0, valid_until: '', status: '草稿', created_by: '' })
    }
  }

  const handleConvertToOrder = async (item) => {
    const { data } = await updateQuotation(item.id, { status: '已成交' })
    if (data) {
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, status: '已成交' } : i))
    }
  }

  if (loading) return <LoadingSpinner />

  const filtered = items.filter(s =>
    search === '' || s.quote_number?.includes(search) || s.customer?.includes(search)
  )

  const draft = filtered.filter(s => s.status === '草稿').length
  const sent = filtered.filter(s => s.status === '已送出').length
  const won = filtered.filter(s => s.status === '已成交').length
  const now = new Date()
  const monthTotal = filtered
    .filter(s => { const d = new Date(s.created_at); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() })
    .reduce((sum, s) => sum + (s.total || 0), 0)

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h2><span className="header-icon">📝</span> 報價管理</h2>
            <p>報價單建立、追蹤與轉換</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={14} /> 新增報價</button>
        </div>
      </div>

      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="stat-card" style={{ '--card-accent': 'var(--accent-orange)', '--card-accent-dim': 'var(--accent-orange-dim)' }}>
          <div className="stat-card-label">草稿</div>
          <div className="stat-card-value">{draft}</div>
        </div>
        <div className="stat-card" style={{ '--card-accent': 'var(--accent-cyan)', '--card-accent-dim': 'var(--accent-cyan-dim)' }}>
          <div className="stat-card-label">已送出</div>
          <div className="stat-card-value">{sent}</div>
        </div>
        <div className="stat-card" style={{ '--card-accent': 'var(--accent-green)', '--card-accent-dim': 'var(--accent-green-dim)' }}>
          <div className="stat-card-label">已成交</div>
          <div className="stat-card-value">{won}</div>
        </div>
        <div className="stat-card" style={{ '--card-accent': 'var(--accent-purple)', '--card-accent-dim': 'var(--accent-purple-dim)' }}>
          <div className="stat-card-label">本月報價額</div>
          <div className="stat-card-value">NT$ {monthTotal.toLocaleString()}</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title"><span className="card-title-icon">📋</span> 報價單列表</div>
          <div className="search-bar">
            <Search className="search-icon" />
            <input type="text" placeholder="搜尋報價單..." className="form-input" style={{ paddingLeft: 38 }} value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr><th>報價單號</th><th>客戶</th><th>版本</th><th>金額</th><th>有效期限</th><th>狀態</th><th>建立者</th><th>操作</th></tr>
            </thead>
            <tbody>
              {filtered.length === 0 && <tr><td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>尚無報價單</td></tr>}
              {filtered.map(s => (
                <tr key={s.id}>
                  <td style={{ fontWeight: 600 }}>{s.quote_number}</td>
                  <td>{s.customer}</td>
                  <td>v{s.version}</td>
                  <td>NT$ {(s.total || 0).toLocaleString()}</td>
                  <td>{s.valid_until}</td>
                  <td>
                    <span className={`badge ${STATUS_BADGE[s.status] || 'badge-info'}`}>
                      <span className="badge-dot"></span>{s.status}
                    </span>
                  </td>
                  <td>{s.created_by}</td>
                  <td>
                    {s.status === '已送出' && (
                      <button className="btn btn-primary" style={{ fontSize: 12, padding: '4px 10px' }} onClick={() => handleConvertToOrder(s)}>
                        <ArrowRightCircle size={12} /> 轉為訂單
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
        <Modal title="新增報價單" onClose={() => setShowModal(false)} onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="報價單號 *">
              <input className="form-input" type="text" style={{ width: '100%' }} placeholder="Q-2026-001" value={form.quote_number} onChange={e => set('quote_number', e.target.value)} />
            </Field>
            <Field label="客戶 *">
              <input className="form-input" type="text" style={{ width: '100%' }} placeholder="客戶名稱" value={form.customer} onChange={e => set('customer', e.target.value)} />
            </Field>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <Field label="版本">
              <input className="form-input" type="number" style={{ width: '100%' }} min={1} value={form.version} onChange={e => set('version', Number(e.target.value))} />
            </Field>
            <Field label="金額">
              <input className="form-input" type="number" style={{ width: '100%' }} placeholder="0" value={form.total} onChange={e => set('total', e.target.value)} />
            </Field>
            <Field label="有效期限">
              <input className="form-input" type="date" style={{ width: '100%' }} value={form.valid_until} onChange={e => set('valid_until', e.target.value)} />
            </Field>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="狀態">
              <select className="form-input" style={{ width: '100%' }} value={form.status} onChange={e => set('status', e.target.value)}>
                <option>草稿</option>
                <option>已送出</option>
                <option>已成交</option>
                <option>已失效</option>
              </select>
            </Field>
            <Field label="建立者">
              <input className="form-input" type="text" style={{ width: '100%' }} placeholder="姓名" value={form.created_by} onChange={e => set('created_by', e.target.value)} />
            </Field>
          </div>
        </Modal>
      )}
    </div>
  )
}
