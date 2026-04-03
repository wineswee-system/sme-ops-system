import { useState, useEffect } from 'react'
import { Plus, Search } from 'lucide-react'
import { getMembers, createMember } from '../../lib/db'
import LoadingSpinner from '../../components/LoadingSpinner'
import Modal, { Field } from '../../components/Modal'

const LEVELS = ['一般', '銀卡', '金卡', '白金', '鑽石']

export default function Members() {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [search, setSearch] = useState('')
  const [form, setForm] = useState({ member_number: '', name: '', phone: '', level: '一般', total_points: 0, available_points: 0, total_spent: 0 })

  useEffect(() => {
    getMembers().then(({ data }) => { setMembers(data || []); setLoading(false) })
  }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async () => {
    if (!form.name || !form.member_number) return
    const { data } = await createMember({ ...form, visit_count: 0, last_visit: new Date().toISOString().slice(0, 10) })
    if (data) {
      setMembers(prev => [...prev, data])
      setShowModal(false)
      setForm({ member_number: '', name: '', phone: '', level: '一般', total_points: 0, available_points: 0, total_spent: 0 })
    }
  }

  if (loading) return <LoadingSpinner />

  const filtered = members.filter(m =>
    search === '' || m.name?.includes(search) || m.member_number?.includes(search) || m.phone?.includes(search)
  )

  const total = filtered.length
  const now = new Date()
  const newThisMonth = filtered.filter(m => {
    const d = new Date(m.created_at)
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
  }).length
  const vipCount = filtered.filter(m => m.level && m.level !== '一般').length
  const totalAvailablePoints = filtered.reduce((sum, m) => sum + (m.available_points || 0), 0)

  const levelBadge = (level) => {
    const map = { '一般': 'badge-info', '銀卡': 'badge-cyan', '金卡': 'badge-warning', '白金': 'badge-purple', '鑽石': 'badge-pink' }
    return map[level] || 'badge-info'
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h2><span className="header-icon">👑</span> 會員管理</h2>
            <p>會員資料與等級管理</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={14} /> 新增會員</button>
        </div>
      </div>

      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="stat-card" style={{ '--card-accent': 'var(--accent-blue)', '--card-accent-dim': 'var(--accent-blue-dim)' }}>
          <div className="stat-card-label">總會員</div>
          <div className="stat-card-value">{total}</div>
        </div>
        <div className="stat-card" style={{ '--card-accent': 'var(--accent-green)', '--card-accent-dim': 'var(--accent-green-dim)' }}>
          <div className="stat-card-label">本月新增</div>
          <div className="stat-card-value">{newThisMonth}</div>
        </div>
        <div className="stat-card" style={{ '--card-accent': 'var(--accent-purple)', '--card-accent-dim': 'var(--accent-purple-dim)' }}>
          <div className="stat-card-label">VIP會員</div>
          <div className="stat-card-value">{vipCount}</div>
        </div>
        <div className="stat-card" style={{ '--card-accent': 'var(--accent-orange)', '--card-accent-dim': 'var(--accent-orange-dim)' }}>
          <div className="stat-card-label">總可用點數</div>
          <div className="stat-card-value">{totalAvailablePoints.toLocaleString()}</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title"><span className="card-title-icon">📋</span> 會員列表</div>
          <div className="search-bar">
            <Search className="search-icon" />
            <input type="text" placeholder="搜尋會員..." className="form-input" style={{ paddingLeft: 38 }} value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr><th>會員編號</th><th>姓名</th><th>電話</th><th>等級</th><th>總點數</th><th>可用點數</th><th>累計消費</th><th>到店次數</th><th>最後到店</th></tr>
            </thead>
            <tbody>
              {filtered.length === 0 && <tr><td colSpan={9} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>尚無會員</td></tr>}
              {filtered.map(m => (
                <tr key={m.id}>
                  <td style={{ fontWeight: 600 }}>{m.member_number}</td>
                  <td>{m.name}</td>
                  <td>{m.phone}</td>
                  <td>
                    <span className={`badge ${levelBadge(m.level)}`}>
                      <span className="badge-dot"></span>{m.level}
                    </span>
                  </td>
                  <td>{(m.total_points || 0).toLocaleString()}</td>
                  <td>{(m.available_points || 0).toLocaleString()}</td>
                  <td>NT$ {(m.total_spent || 0).toLocaleString()}</td>
                  <td>{m.visit_count || 0}</td>
                  <td>{m.last_visit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <Modal title="新增會員" onClose={() => setShowModal(false)} onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="會員編號 *">
              <input className="form-input" type="text" style={{ width: '100%' }} placeholder="MEM-001" value={form.member_number} onChange={e => set('member_number', e.target.value)} />
            </Field>
            <Field label="姓名 *">
              <input className="form-input" type="text" style={{ width: '100%' }} placeholder="會員姓名" value={form.name} onChange={e => set('name', e.target.value)} />
            </Field>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="電話">
              <input className="form-input" type="text" style={{ width: '100%' }} placeholder="0912-345-678" value={form.phone} onChange={e => set('phone', e.target.value)} />
            </Field>
            <Field label="等級">
              <select className="form-input" style={{ width: '100%' }} value={form.level} onChange={e => set('level', e.target.value)}>
                {LEVELS.map(l => <option key={l}>{l}</option>)}
              </select>
            </Field>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <Field label="總點數">
              <input className="form-input" type="number" style={{ width: '100%' }} value={form.total_points} onChange={e => set('total_points', Number(e.target.value))} />
            </Field>
            <Field label="可用點數">
              <input className="form-input" type="number" style={{ width: '100%' }} value={form.available_points} onChange={e => set('available_points', Number(e.target.value))} />
            </Field>
            <Field label="累計消費">
              <input className="form-input" type="number" style={{ width: '100%' }} value={form.total_spent} onChange={e => set('total_spent', Number(e.target.value))} />
            </Field>
          </div>
        </Modal>
      )}
    </div>
  )
}
