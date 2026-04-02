import { useState, useEffect } from 'react'
import { Download, ChevronDown, ChevronRight, Plus } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { exportSalaryPdf } from '../../lib/exportPdf'
import LoadingSpinner from '../../components/LoadingSpinner'
import Modal, { Field } from '../../components/Modal'

// EmpSelect defined at module level after employees/departments are passed in
function EmpSelect({ value, onChange, employees, departments }) {
  return (
    <select className="form-input" style={{ width: '100%' }} value={value} onChange={e => onChange(e.target.value)}>
      <option value="">請選擇員工</option>
      {departments.map(d => (
        <optgroup key={d.id} label={d.name}>
          {employees.filter(e => e.department === d.name).map(e => (
            <option key={e.id} value={e.name}>{e.name}｜{e.position}</option>
          ))}
        </optgroup>
      ))}
    </select>
  )
}

const emptyForm = {
  employee: '', month: new Date().toISOString().slice(0, 7),
  base_salary: '', allowance: '', overtime: '', bonus: '',
  absence_deduction: '', late_deduction: '', other_deduction: '', deduction_note: '',
  insurance: ''
}

function calcNet(f) {
  return (Number(f.base_salary) || 0)
    + (Number(f.allowance) || 0)
    + (Number(f.overtime) || 0)
    + (Number(f.bonus) || 0)
    - (Number(f.absence_deduction) || 0)
    - (Number(f.late_deduction) || 0)
    - (Number(f.other_deduction) || 0)
    - (Number(f.insurance) || 0)
}

export default function Salary() {
  const [records, setRecords] = useState([])
  const [bonusRecords, setBonusRecords] = useState([])
  const [employees, setEmployees] = useState([])
  const [departments, setDepartments] = useState([])
  const [deptFilter, setDeptFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7))
  const [expanded, setExpanded] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(emptyForm)

  useEffect(() => {
    Promise.all([
      supabase.from('salary_records').select('*').order('id'),
      supabase.from('bonus_records').select('*'),
      supabase.from('employees').select('id, name, department, position').eq('status', '在職').order('name'),
      supabase.from('departments').select('*').order('name'),
    ]).then(([s, b, e, d]) => {
      setRecords(s.data || [])
      setBonusRecords(b.data || [])
      setEmployees(e.data || [])
      setDepartments(d.data || [])
      setLoading(false)
    })
  }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async () => {
    if (!form.employee) return
    const totalDeductions = (Number(form.absence_deduction) || 0) + (Number(form.late_deduction) || 0) + (Number(form.other_deduction) || 0)
    const net = calcNet(form)
    const { data } = await supabase.from('salary_records').insert({
      ...form,
      base_salary: Number(form.base_salary) || 0,
      allowance: Number(form.allowance) || 0,
      overtime: Number(form.overtime) || 0,
      bonus: Number(form.bonus) || 0,
      absence_deduction: Number(form.absence_deduction) || 0,
      late_deduction: Number(form.late_deduction) || 0,
      other_deduction: Number(form.other_deduction) || 0,
      deductions: totalDeductions,
      insurance: Number(form.insurance) || 0,
      net_salary: net,
    }).select().single()
    if (data) { setRecords(prev => [...prev, data]); setShowModal(false); setForm(emptyForm) }
  }

  if (loading) return <LoadingSpinner />

  const getEmpDept = (name) => employees.find(e => e.name === name)?.department || ''

  const deptBtnStyle = (active) => ({
    padding: '5px 12px', borderRadius: 8, border: '1px solid var(--border-medium)',
    background: active ? 'var(--accent-cyan)' : 'var(--bg-card)',
    color: active ? '#fff' : 'var(--text-secondary)',
    cursor: 'pointer', fontSize: 12, fontWeight: 500
  })

  const filtered = records.filter(r =>
    (!month || !r.month || r.month === month) &&
    (deptFilter === '' || getEmpDept(r.employee) === deptFilter)
  )
  const total = filtered.reduce((s, r) => s + (r.net_salary || 0), 0)
  const totalBonus = filtered.reduce((s, r) => s + (r.bonus || 0), 0)
  const totalDeductions = filtered.reduce((s, r) => s + (r.absence_deduction || 0) + (r.late_deduction || 0) + (r.other_deduction || 0), 0)

  const getBonusDetail = (name) => bonusRecords.filter(b => b.employee_name === name && b.period === month)

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h2><span className="header-icon">💰</span> 薪資管理</h2>
            <p>員工薪資計算與發放管理</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input type="month" className="form-input" value={month} onChange={e => setMonth(e.target.value)} style={{ fontSize: 13 }} />
            <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={14} /> 新增薪資</button>
            <button className="btn btn-secondary" onClick={() => exportSalaryPdf(filtered, month)}><Download size={14} /> 匯出 PDF</button>
          </div>
        </div>
      </div>

      {/* 部門篩選 */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <button style={deptBtnStyle(deptFilter === '')} onClick={() => setDeptFilter('')}>全部部門</button>
        {departments.map(d => (
          <button key={d.id} style={deptBtnStyle(deptFilter === d.name)} onClick={() => setDeptFilter(d.name)}>{d.name}</button>
        ))}
      </div>

      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="stat-card" style={{ '--card-accent': 'var(--accent-green)', '--card-accent-dim': 'var(--accent-green-dim)' }}>
          <div className="stat-card-label">本月實發總額</div>
          <div className="stat-card-value">NT$ {total.toLocaleString()}</div>
        </div>
        <div className="stat-card" style={{ '--card-accent': 'var(--accent-purple)', '--card-accent-dim': 'var(--accent-purple-dim)' }}>
          <div className="stat-card-label">獎金合計</div>
          <div className="stat-card-value">NT$ {totalBonus.toLocaleString()}</div>
        </div>
        <div className="stat-card" style={{ '--card-accent': 'var(--accent-red)', '--card-accent-dim': 'var(--accent-red-dim)' }}>
          <div className="stat-card-label">扣款合計</div>
          <div className="stat-card-value">NT$ {totalDeductions.toLocaleString()}</div>
        </div>
        <div className="stat-card" style={{ '--card-accent': 'var(--accent-cyan)', '--card-accent-dim': 'var(--accent-cyan-dim)' }}>
          <div className="stat-card-label">人數</div>
          <div className="stat-card-value">{filtered.length}</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title"><span className="card-title-icon">📋</span> 薪資明細</div>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>點擊列展開完整計算過程</span>
        </div>
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th></th>
                <th>員工</th>
                <th>部門</th>
                <th>底薪</th>
                <th>津貼</th>
                <th>加班費</th>
                <th style={{ color: 'var(--accent-purple)' }}>績效獎金</th>
                <th style={{ color: 'var(--accent-red)' }}>事假扣薪</th>
                <th style={{ color: 'var(--accent-red)' }}>遲到扣薪</th>
                <th style={{ color: 'var(--accent-red)' }}>其他扣款</th>
                <th style={{ color: 'var(--accent-orange)' }}>勞健保</th>
                <th>實發薪資</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && <tr><td colSpan={12} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>本月尚無薪資紀錄</td></tr>}
              {filtered.map(r => {
                const bonusDetail = getBonusDetail(r.employee)
                const isExpanded = expanded === r.id
                return (
                  <>
                    <tr key={r.id} style={{ cursor: 'pointer' }} onClick={() => setExpanded(isExpanded ? null : r.id)}>
                      <td style={{ width: 32 }}>{isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}</td>
                      <td style={{ fontWeight: 600 }}>{r.employee}</td>
                      <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{getEmpDept(r.employee) || '-'}</td>
                      <td>NT$ {(r.base_salary || 0).toLocaleString()}</td>
                      <td style={{ color: 'var(--accent-green)' }}>+{(r.allowance || 0).toLocaleString()}</td>
                      <td style={{ color: 'var(--accent-cyan)' }}>+{(r.overtime || 0).toLocaleString()}</td>
                      <td style={{ color: 'var(--accent-purple)', fontWeight: 700 }}>+{(r.bonus || 0).toLocaleString()}</td>
                      <td style={{ color: 'var(--accent-red)' }}>{r.absence_deduction > 0 ? `-${(r.absence_deduction || 0).toLocaleString()}` : '-'}</td>
                      <td style={{ color: 'var(--accent-red)' }}>{r.late_deduction > 0 ? `-${(r.late_deduction || 0).toLocaleString()}` : '-'}</td>
                      <td style={{ color: 'var(--accent-red)' }}>
                        {r.other_deduction > 0 ? (
                          <span title={r.deduction_note || ''}>-{(r.other_deduction || 0).toLocaleString()} {r.deduction_note && '📝'}</span>
                        ) : '-'}
                      </td>
                      <td style={{ color: 'var(--accent-orange)' }}>-{(r.insurance || 0).toLocaleString()}</td>
                      <td style={{ fontWeight: 800, color: 'var(--accent-green)', fontSize: 15 }}>NT$ {(r.net_salary || 0).toLocaleString()}</td>
                    </tr>

                    {isExpanded && (
                      <tr key={`${r.id}-detail`}>
                        <td colSpan={11} style={{ padding: 0 }}>
                          <div style={{ background: 'var(--glass-light)', padding: '16px 24px', borderTop: '1px solid var(--border-subtle)' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

                              {/* 計算過程 */}
                              <div>
                                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 10 }}>📐 薪資計算過程</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                                  {[
                                    { label: '底薪', value: r.base_salary || 0, color: 'var(--text-primary)', sign: '', note: '' },
                                    { label: '津貼', value: r.allowance || 0, color: 'var(--accent-green)', sign: '+', note: '' },
                                    { label: '加班費', value: r.overtime || 0, color: 'var(--accent-cyan)', sign: '+', note: '' },
                                    { label: '績效獎金', value: r.bonus || 0, color: 'var(--accent-purple)', sign: '+', note: '依績效獎金頁發放紀錄' },
                                    { label: '事假扣薪', value: r.absence_deduction || 0, color: 'var(--accent-red)', sign: '-', note: '依事假天數計算' },
                                    { label: '遲到扣薪', value: r.late_deduction || 0, color: 'var(--accent-red)', sign: '-', note: '依打卡紀錄計算' },
                                    { label: `其他扣款${r.deduction_note ? `（${r.deduction_note}）` : ''}`, value: r.other_deduction || 0, color: 'var(--accent-red)', sign: '-', note: r.deduction_note || '' },
                                    { label: '勞健保（員工自付）', value: r.insurance || 0, color: 'var(--accent-orange)', sign: '-', note: '依薪資級距投保' },
                                  ].map((item, i) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', borderRadius: 7, background: 'var(--bg-card)', fontSize: 13 }}>
                                      <div>
                                        <span style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
                                        {item.note && <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{item.note}</div>}
                                      </div>
                                      <span style={{ color: item.value === 0 ? 'var(--text-muted)' : item.color, fontWeight: 600 }}>
                                        {item.value === 0 ? '—' : `${item.sign} NT$ ${item.value.toLocaleString()}`}
                                      </span>
                                    </div>
                                  ))}
                                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 8, background: 'var(--accent-green-dim)', border: '1px solid var(--accent-green)', fontSize: 14, marginTop: 6 }}>
                                    <span style={{ fontWeight: 700 }}>實發薪資</span>
                                    <span style={{ color: 'var(--accent-green)', fontWeight: 800 }}>NT$ {(r.net_salary || 0).toLocaleString()}</span>
                                  </div>
                                </div>
                              </div>

                              {/* 獎金明細 */}
                              <div>
                                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 10 }}>🏆 獎金明細</div>
                                {bonusDetail.length === 0 ? (
                                  <div style={{ fontSize: 12, color: 'var(--text-muted)', padding: '16px', background: 'var(--bg-card)', borderRadius: 8, textAlign: 'center' }}>
                                    本月尚無獎金紀錄<br />
                                    <span style={{ fontSize: 11 }}>可至「績效獎金」頁面新增</span>
                                  </div>
                                ) : bonusDetail.map(b => (
                                  <div key={b.id} style={{ padding: '10px 12px', borderRadius: 8, background: 'var(--bg-card)', marginBottom: 8, border: '1px solid var(--border-subtle)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                      <span style={{ fontSize: 13, fontWeight: 700 }}>{b.role_type} 獎金</span>
                                      <span style={{ color: 'var(--accent-purple)', fontWeight: 800 }}>NT$ {(b.total_bonus || 0).toLocaleString()}</span>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)' }}>
                                        <span>基本績效獎</span><span>NT$ {(b.base_bonus || 0).toLocaleString()}</span>
                                      </div>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)' }}>
                                        <span>數據達標獎</span><span>NT$ {(b.data_bonus || 0).toLocaleString()}</span>
                                      </div>
                                    </div>
                                    {b.notes && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6, padding: '4px 8px', background: 'var(--glass-light)', borderRadius: 6 }}>說明：{b.notes}</div>}
                                  </div>
                                ))}
                              </div>

                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <Modal title="新增薪資紀錄" onClose={() => setShowModal(false)} onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="員工 *"><EmpSelect value={form.employee} onChange={v => set('employee', v)} employees={employees} departments={departments} /></Field>
            <Field label="月份"><input className="form-input" type="month" style={{ width: '100%' }} value={form.month} onChange={e => set('month', e.target.value)} /></Field>
          </div>

          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent-green)', margin: '8px 0 4px' }}>▲ 加項</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10 }}>
            <Field label="底薪"><input className="form-input" type="number" style={{ width: '100%' }} placeholder="0" value={form.base_salary} onChange={e => set('base_salary', e.target.value)} /></Field>
            <Field label="津貼"><input className="form-input" type="number" style={{ width: '100%' }} placeholder="0" value={form.allowance} onChange={e => set('allowance', e.target.value)} /></Field>
            <Field label="加班費"><input className="form-input" type="number" style={{ width: '100%' }} placeholder="0" value={form.overtime} onChange={e => set('overtime', e.target.value)} /></Field>
            <Field label="績效獎金"><input className="form-input" type="number" style={{ width: '100%', borderColor: 'var(--accent-purple)' }} placeholder="0" value={form.bonus} onChange={e => set('bonus', e.target.value)} /></Field>
          </div>

          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent-red)', margin: '8px 0 4px' }}>▼ 扣項</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            <Field label="事假扣薪"><input className="form-input" type="number" style={{ width: '100%' }} placeholder="0（依事假天數）" value={form.absence_deduction} onChange={e => set('absence_deduction', e.target.value)} /></Field>
            <Field label="遲到扣薪"><input className="form-input" type="number" style={{ width: '100%' }} placeholder="0（依打卡紀錄）" value={form.late_deduction} onChange={e => set('late_deduction', e.target.value)} /></Field>
            <Field label="勞健保"><input className="form-input" type="number" style={{ width: '100%' }} placeholder="0（員工自付額）" value={form.insurance} onChange={e => set('insurance', e.target.value)} /></Field>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 10 }}>
            <Field label="其他扣款"><input className="form-input" type="number" style={{ width: '100%' }} placeholder="0" value={form.other_deduction} onChange={e => set('other_deduction', e.target.value)} /></Field>
            <Field label="其他扣款說明"><input className="form-input" type="text" style={{ width: '100%' }} placeholder="例：預支薪資扣還、公司借款..." value={form.deduction_note} onChange={e => set('deduction_note', e.target.value)} /></Field>
          </div>

          <div style={{ padding: '12px 16px', borderRadius: 10, background: 'var(--accent-green-dim)', border: '1px solid var(--accent-green)', fontSize: 14, fontWeight: 700, color: 'var(--accent-green)', textAlign: 'center' }}>
            預估實發薪資：NT$ {calcNet(form).toLocaleString()}
          </div>
        </Modal>
      )}
    </div>
  )
}
