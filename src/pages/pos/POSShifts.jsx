import { useState, useEffect } from 'react'
import { Plus, Search } from 'lucide-react'
import { getPOSShifts, createPOSShift } from '../../lib/db'
import LoadingSpinner from '../../components/LoadingSpinner'
import Modal, { Field } from '../../components/Modal'

const STATUS_BADGE = { '營業中': 'badge-success', '已結班': 'badge-info' }

export default function POSShifts() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [search, setSearch] = useState('')
  const [form, setForm] = useState({ store: '', cashier: '', shift_start: '', shift_end: '', total_sales: 0, total_transactions: 0, cash_difference: 0, status: '營業中' })

  useEffect(() => {
    getPOSShifts().then(({ data }) => { setItems(data || []); setLoading(false) })
  }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async () => {
    if (!form.store || !form.cashier) return
    const { data } = await createPOSShift({ ...form, total_sales: Number(form.total_sales), total_transactions: Number(form.total_transactions), cash_difference: Number(form.cash_difference) })
    if (data) {
      setItems(prev => [...prev, data])
      setShowModal(false)
      setForm({ store: '', cashier: '', shift_start: '', shift_end: '', total_sales: 0, total_transactions: 0, cash_difference: 0, status: '營業中' })
    }
  }

  if (loading) return <LoadingSpinner />

  const filtered = items.filter(s =>
    search === '' || s.store?.includes(search) || s.cashier?.includes(search)
  )

  const open = filtered.filter(s => s.status === '營業中').length
  const closed = filtered.filter(s => s.status === '已結班').length
  const today = new Date().toISOString().slice(0, 10)
  const todayRevenue = filtered
    .filter(s => s.shift_start?.startsWith(today))
    .reduce((sum, s) => sum + (s.total_sales || 0), 0)

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h2><span className="header-icon">💰</span> 交班日結</h2>
            <p>收銀班別與日結管理</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={14} /> 新增班別</button>
        </div>
      </div>

      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="stat-card" style={{ '--card-accent': 'var(--accent-green)', '--card-accent-dim': 'var(--accent-green-dim)' }}>
          <div className="stat-card-label">營業中</div>
          <div className="stat-card-value">{open}</div>
        </div>
        <div className="stat-card" style={{ '--card-accent': 'var(--accent-cyan)', '--card-accent-dim': 'var(--accent-cyan-dim)' }}>
          <div className="stat-card-label">已結班</div>
          <div className="stat-card-value">{closed}</div>
        </div>
        <div className="stat-card" style={{ '--card-accent': 'var(--accent-orange)', '--card-accent-dim': 'var(--accent-orange-dim)' }}>
          <div className="stat-card-label">今日營收</div>
          <div className="stat-card-value">NT$ {todayRevenue.toLocaleString()}</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title"><span className="card-title-icon">📋</span> 班別列表</div>
          <div className="search-bar">
            <Search className="search-icon" />
            <input type="text" placeholder="搜尋門市/收銀員..." className="form-input" style={{ paddingLeft: 38 }} value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr><th>門市</th><th>收銀員</th><th>班別時間</th><th>營業額</th><th>交易數</th><th>現金差異</th><th>狀態</th></tr>
            </thead>
            <tbody>
              {filtered.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>尚無班別紀錄</td></tr>}
              {filtered.map(s => (
                <tr key={s.id}>
                  <td style={{ fontWeight: 600 }}>{s.store}</td>
                  <td>{s.cashier}</td>
                  <td style={{ fontSize: 12 }}>{s.shift_start} ~ {s.shift_end || '進行中'}</td>
                  <td>NT$ {(s.total_sales || 0).toLocaleString()}</td>
                  <td>{s.total_transactions || 0}</td>
                  <td style={{ color: (s.cash_difference || 0) !== 0 ? 'var(--accent-red)' : 'var(--text-primary)', fontWeight: (s.cash_difference || 0) !== 0 ? 700 : 400 }}>
                    NT$ {(s.cash_difference || 0).toLocaleString()}
                  </td>
                  <td>
                    <span className={`badge ${STATUS_BADGE[s.status] || 'badge-info'}`}>
                      <span className="badge-dot"></span>{s.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <Modal title="新增班別" onClose={() => setShowModal(false)} onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="門市 *">
              <input className="form-input" type="text" style={{ width: '100%' }} placeholder="門市名稱" value={form.store} onChange={e => set('store', e.target.value)} />
            </Field>
            <Field label="收銀員 *">
              <input className="form-input" type="text" style={{ width: '100%' }} placeholder="收銀員姓名" value={form.cashier} onChange={e => set('cashier', e.target.value)} />
            </Field>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="開始時間">
              <input className="form-input" type="datetime-local" style={{ width: '100%' }} value={form.shift_start} onChange={e => set('shift_start', e.target.value)} />
            </Field>
            <Field label="結束時間">
              <input className="form-input" type="datetime-local" style={{ width: '100%' }} value={form.shift_end} onChange={e => set('shift_end', e.target.value)} />
            </Field>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <Field label="營業額">
              <input className="form-input" type="number" style={{ width: '100%' }} placeholder="0" value={form.total_sales} onChange={e => set('total_sales', e.target.value)} />
            </Field>
            <Field label="交易數">
              <input className="form-input" type="number" style={{ width: '100%' }} placeholder="0" value={form.total_transactions} onChange={e => set('total_transactions', e.target.value)} />
            </Field>
            <Field label="現金差異">
              <input className="form-input" type="number" style={{ width: '100%' }} placeholder="0" value={form.cash_difference} onChange={e => set('cash_difference', e.target.value)} />
            </Field>
          </div>
          <Field label="狀態">
            <select className="form-input" style={{ width: '100%' }} value={form.status} onChange={e => set('status', e.target.value)}>
              <option>營業中</option>
              <option>已結班</option>
            </select>
          </Field>
        </Modal>
      )}
    </div>
  )
}
