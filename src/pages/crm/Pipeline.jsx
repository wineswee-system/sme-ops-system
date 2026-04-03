import { useState, useEffect } from 'react'
import { Plus, AlertTriangle } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { checkStockAndCreatePR, createARFromShipment } from '../../lib/automation'
import LoadingSpinner from '../../components/LoadingSpinner'
import Modal, { Field } from '../../components/Modal'

const STAGES = ['初步接觸', '需求分析', '報價', '議價', '贏單', '輸單']
const STAGE_COLORS = {
  '初步接觸': { accent: 'var(--accent-blue)', dim: 'var(--accent-blue-dim)' },
  '需求分析': { accent: 'var(--accent-cyan)', dim: 'var(--accent-cyan-dim)' },
  '報價': { accent: 'var(--accent-purple)', dim: 'var(--accent-purple-dim)' },
  '議價': { accent: 'var(--accent-orange)', dim: 'var(--accent-orange-dim)' },
  '贏單': { accent: 'var(--accent-green)', dim: 'var(--accent-green-dim)' },
  '輸單': { accent: 'var(--accent-red)', dim: 'var(--accent-red-dim)' },
}
const PROB_MAP = { '初步接觸': 10, '需求分析': 25, '報價': 50, '議價': 75, '贏單': 100, '輸單': 0 }

export default function Pipeline() {
  const [opps, setOpps] = useState([])
  const [customers, setCustomers] = useState([])
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('kanban')
  const [locFilter, setLocFilter] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ customer_name: '', title: '', stage: '初步接觸', amount: '', probability: 10, expected_close: '', assignee: '', notes: '', location_id: '' })

  useEffect(() => {
    Promise.all([
      supabase.from('opportunities').select('*').order('created_at', { ascending: false }),
      supabase.from('customers').select('id, name'),
      supabase.from('locations').select('*'),
    ]).then(([o, c, l]) => {
      setOpps(o.data || [])
      setCustomers(c.data || [])
      setLocations(l.data || [])
      setLoading(false)
    })
  }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async () => {
    if (!form.title || !form.customer_name) return
    const { data } = await supabase.from('opportunities').insert({ ...form, amount: Number(form.amount) || 0, location_id: form.location_id || null }).select().single()
    if (data) { setOpps(prev => [data, ...prev]); setShowModal(false); setForm({ customer_name: '', title: '', stage: '初步接觸', amount: '', probability: 10, expected_close: '', assignee: '', notes: '', location_id: '' }) }
  }

  const [autoMsg, setAutoMsg] = useState('')

  const updateStage = async (id, stage) => {
    const { data } = await supabase.from('opportunities').update({ stage, probability: PROB_MAP[stage] }).eq('id', id).select().single()
    if (data) {
      setOpps(prev => prev.map(o => o.id === id ? data : o))
      // 贏單觸發自動化
      if (stage === '贏單' && data.amount > 0) {
        // 自動產生 AR 應收帳款
        const ar = await createARFromShipment({
          customer: data.customer_name,
          order_ref: `OPP-${data.id}`,
          total_amount: data.amount,
          id: data.id,
        })
        if (ar) setAutoMsg(`✅ 已自動建立應收帳款 ${ar.invoice_number}（NT$ ${data.amount.toLocaleString()}）`)
        setTimeout(() => setAutoMsg(''), 5000)
      }
    }
  }

  if (loading) return <LoadingSpinner />

  const filtered = opps.filter(o => locFilter === '' || String(o.location_id) === locFilter)
  const activeOpps = filtered.filter(o => !['贏單', '輸單'].includes(o.stage))
  const totalForecast = activeOpps.reduce((s, o) => s + (o.amount || 0) * ((o.probability || 0) / 100), 0)

  const filterBtnStyle = (active) => ({
    padding: '6px 14px', borderRadius: 8, border: '1px solid var(--border-medium)',
    background: active ? 'var(--accent-cyan)' : 'var(--bg-card)',
    color: active ? '#fff' : 'var(--text-secondary)',
    cursor: 'pointer', fontSize: 12, fontWeight: 500
  })

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-row">
          <div><h2><span className="header-icon">📈</span> 銷售漏斗</h2><p>商機管理與業績預測</p></div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={14} /> 新增商機</button>
        </div>
        {autoMsg && (
          <div style={{ marginTop: 8, padding: '10px 16px', borderRadius: 10, background: 'var(--accent-green-dim)', color: 'var(--accent-green)', fontSize: 13, fontWeight: 600 }}>
            {autoMsg}
          </div>
        )}
      </div>

      {/* 分店篩選 */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <button style={filterBtnStyle(locFilter === '')} onClick={() => setLocFilter('')}>全部分店</button>
        {locations.map(l => (
          <button key={l.id} style={filterBtnStyle(locFilter === String(l.id))} onClick={() => setLocFilter(String(l.id))}>{l.name}</button>
        ))}
      </div>

      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="stat-card" style={{ '--card-accent': 'var(--accent-cyan)', '--card-accent-dim': 'var(--accent-cyan-dim)' }}>
          <div className="stat-card-label">進行中商機</div><div className="stat-card-value">{activeOpps.length}</div>
        </div>
        <div className="stat-card" style={{ '--card-accent': 'var(--accent-purple)', '--card-accent-dim': 'var(--accent-purple-dim)' }}>
          <div className="stat-card-label">商機總金額</div><div className="stat-card-value">$ {activeOpps.reduce((s, o) => s + (o.amount || 0), 0).toLocaleString()}</div>
        </div>
        <div className="stat-card" style={{ '--card-accent': 'var(--accent-green)', '--card-accent-dim': 'var(--accent-green-dim)' }}>
          <div className="stat-card-label">預計成交金額</div><div className="stat-card-value">$ {Math.round(totalForecast).toLocaleString()}</div>
        </div>
        <div className="stat-card" style={{ '--card-accent': 'var(--accent-orange)', '--card-accent-dim': 'var(--accent-orange-dim)' }}>
          <div className="stat-card-label">本月贏單</div><div className="stat-card-value">{filtered.filter(o => o.stage === '贏單').length}</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 4, marginBottom: 16, background: 'var(--bg-card)', borderRadius: 10, padding: 4, border: '1px solid var(--border-subtle)', width: 'fit-content' }}>
        {[['kanban', '📋 看板'], ['table', '📊 列表']].map(([k, l]) => (
          <button key={k} onClick={() => setView(k)} style={{ padding: '6px 16px', borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, background: view === k ? 'var(--accent-cyan)' : 'transparent', color: view === k ? '#fff' : 'var(--text-muted)' }}>{l}</button>
        ))}
      </div>

      {view === 'kanban' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12, overflowX: 'auto' }}>
          {STAGES.map(stage => {
            const stageOpps = filtered.filter(o => o.stage === stage)
            const color = STAGE_COLORS[stage]
            return (
              <div key={stage} style={{ minWidth: 160 }}>
                <div style={{ padding: '8px 12px', borderRadius: '8px 8px 0 0', background: color.dim, borderBottom: `2px solid ${color.accent}`, marginBottom: 8 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: color.accent }}>{stage}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{stageOpps.length} 筆 · ${stageOpps.reduce((s, o) => s + (o.amount || 0), 0).toLocaleString()}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {stageOpps.map(o => (
                    <div key={o.id} className="card" style={{ padding: '10px 12px' }}>
                      <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>{o.title}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>{o.customer_name}</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: color.accent, marginBottom: 6 }}>$ {(o.amount || 0).toLocaleString()}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>成交率 {o.probability}% · {o.expected_close || '未設定'}</div>
                      <select className="form-input" style={{ fontSize: 11, padding: '2px 6px', width: '100%' }} value={o.stage} onChange={e => updateStage(o.id, e.target.value)}>
                        {STAGES.map(s => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {view === 'table' && (
        <div className="card">
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead><tr><th>商機名稱</th><th>客戶</th><th>分店</th><th>金額</th><th>成交率</th><th>預計成交</th><th>負責人</th><th>階段</th></tr></thead>
              <tbody>
                {filtered.length === 0 && <tr><td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>尚無商機</td></tr>}
                {filtered.map(o => (
                  <tr key={o.id}>
                    <td style={{ fontWeight: 600 }}>{o.title}</td>
                    <td>{o.customer_name}</td>
                    <td style={{ fontSize: 12 }}>{locations.find(l => l.id === o.location_id)?.name || '-'}</td>
                    <td style={{ fontWeight: 700 }}>$ {(o.amount || 0).toLocaleString()}</td>
                    <td>{o.probability}%</td>
                    <td style={{ fontSize: 12 }}>{o.expected_close || '-'}</td>
                    <td>{o.assignee}</td>
                    <td>
                      <select className="form-input" style={{ fontSize: 12, padding: '2px 6px' }} value={o.stage} onChange={e => updateStage(o.id, e.target.value)}>
                        {STAGES.map(s => <option key={s}>{s}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <Modal title="新增商機" onClose={() => setShowModal(false)} onSubmit={handleSubmit}>
          <Field label="商機名稱 *"><input className="form-input" type="text" style={{ width: '100%' }} placeholder="Q3 大單採購..." value={form.title} onChange={e => set('title', e.target.value)} /></Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="客戶名稱 *">
              <input className="form-input" type="text" style={{ width: '100%' }} list="customer-list" value={form.customer_name} onChange={e => set('customer_name', e.target.value)} />
              <datalist id="customer-list">{customers.map(c => <option key={c.id} value={c.name} />)}</datalist>
            </Field>
            <Field label="所屬分店">
              <select className="form-input" style={{ width: '100%' }} value={form.location_id} onChange={e => set('location_id', e.target.value)}>
                <option value="">請選擇分店</option>
                {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </Field>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="金額"><input className="form-input" type="number" style={{ width: '100%' }} value={form.amount} onChange={e => set('amount', e.target.value)} /></Field>
            <Field label="預計成交日"><input className="form-input" type="date" style={{ width: '100%' }} value={form.expected_close} onChange={e => set('expected_close', e.target.value)} /></Field>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="負責業務"><input className="form-input" type="text" style={{ width: '100%' }} value={form.assignee} onChange={e => set('assignee', e.target.value)} /></Field>
            <Field label="階段">
              <select className="form-input" style={{ width: '100%' }} value={form.stage} onChange={e => set('stage', e.target.value)}>
                {STAGES.map(s => <option key={s}>{s}</option>)}
              </select>
            </Field>
          </div>
          <Field label="備註"><textarea className="form-input" style={{ width: '100%', minHeight: 60 }} value={form.notes} onChange={e => set('notes', e.target.value)} /></Field>
        </Modal>
      )}
    </div>
  )
}
