import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import LoadingSpinner from '../../components/LoadingSpinner'

const SHIFT_TYPES = [
  { label: '08-17', color: 'var(--accent-cyan)', dim: 'var(--accent-cyan-dim)' },
  { label: '09-18', color: 'var(--accent-blue)', dim: 'var(--accent-blue-dim)' },
  { label: '10-19', color: 'var(--accent-purple)', dim: 'var(--accent-purple-dim)' },
  { label: '11-20', color: 'var(--accent-orange)', dim: 'var(--accent-orange-dim)' },
  { label: '12-21', color: 'var(--accent-pink)', dim: 'var(--accent-pink-dim)' },
  { label: '輪值', color: 'var(--accent-yellow)', dim: 'var(--accent-yellow-dim)' },
  { label: '休', color: 'var(--text-muted)', dim: 'var(--glass-medium)' },
]

const DAY_LABELS = ['一', '二', '三', '四', '五', '六', '日']

function getWeekDates(offset = 0) {
  const now = new Date()
  const dayOfWeek = now.getDay() || 7
  const monday = new Date(now)
  monday.setDate(now.getDate() - dayOfWeek + 1 + offset * 7)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d.toISOString().slice(0, 10)
  })
}

export default function Schedule() {
  const [employees, setEmployees] = useState([])
  const [departments, setDepartments] = useState([])
  const [locations, setLocations] = useState([])
  const [schedules, setSchedules] = useState([])
  const [loading, setLoading] = useState(true)
  const [weekOffset, setWeekOffset] = useState(0)
  const [deptFilter, setDeptFilter] = useState('')
  const [storeFilter, setStoreFilter] = useState('')
  const [editCell, setEditCell] = useState(null)

  const weekDates = getWeekDates(weekOffset)
  const weekStart = weekDates[0]
  const weekEnd = weekDates[6]

  useEffect(() => {
    Promise.all([
      supabase.from('employees').select('id, name, dept, position, store').eq('status', '在職').order('name'),
      supabase.from('departments').select('*').order('name'),
      supabase.from('locations').select('*').order('name'),
    ]).then(([e, d, l]) => {
      setEmployees(e.data || [])
      setDepartments(d.data || [])
      setLocations(l.data || [])
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    supabase.from('schedules').select('*')
      .gte('date', weekStart).lte('date', weekEnd)
      .then(({ data }) => setSchedules(data || []))
  }, [weekStart])

  const getShift = (empName, date) => {
    const s = schedules.find(s => s.employee === empName && s.date === date)
    return s?.shift || ''
  }

  const handleSetShift = async (empName, date, shift) => {
    const existing = schedules.find(s => s.employee === empName && s.date === date)
    if (existing) {
      const { data } = await supabase.from('schedules').update({ shift }).eq('id', existing.id).select().single()
      if (data) setSchedules(prev => prev.map(s => s.id === existing.id ? data : s))
    } else {
      const { data } = await supabase.from('schedules').insert({ employee: empName, date, shift }).select().single()
      if (data) setSchedules(prev => [...prev, data])
    }
    setEditCell(null)
  }

  if (loading) return <LoadingSpinner />

  const filtered = employees.filter(e =>
    (deptFilter === '' || e.dept === deptFilter) &&
    (storeFilter === '' || e.store === storeFilter)
  )

  const btnStyle = (active) => ({
    padding: '5px 12px', borderRadius: 8, border: '1px solid var(--border-medium)',
    background: active ? 'var(--accent-cyan)' : 'var(--bg-card)',
    color: active ? '#fff' : 'var(--text-secondary)',
    cursor: 'pointer', fontSize: 12, fontWeight: 500,
  })

  const getShiftStyle = (shift) => {
    const type = SHIFT_TYPES.find(t => t.label === shift)
    if (!type) return {}
    return { background: type.dim, color: type.color, border: `1px solid ${type.color}30` }
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h2><span className="header-icon">📅</span> 排班</h2>
            <p>員工每週排班管理（點擊格子排班）</p>
          </div>
        </div>
      </div>

      {/* Week Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <button onClick={() => setWeekOffset(w => w - 1)} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-medium)', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', color: 'var(--text-secondary)' }}>
          <ChevronLeft size={16} />
        </button>
        <div style={{ fontSize: 15, fontWeight: 700 }}>
          {weekStart} ~ {weekEnd}
        </div>
        <button onClick={() => setWeekOffset(w => w + 1)} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-medium)', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', color: 'var(--text-secondary)' }}>
          <ChevronRight size={16} />
        </button>
        <button onClick={() => setWeekOffset(0)} style={{ ...btnStyle(weekOffset === 0), marginLeft: 4 }}>本週</button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: '28px' }}>門市</span>
        <button style={btnStyle(storeFilter === '')} onClick={() => setStoreFilter('')}>全部</button>
        {locations.map(l => <button key={l.id} style={btnStyle(storeFilter === l.name)} onClick={() => setStoreFilter(l.name)}>{l.name}</button>)}
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: '28px' }}>部門</span>
        <button style={btnStyle(deptFilter === '')} onClick={() => setDeptFilter('')}>全部</button>
        {departments.map(d => <button key={d.id} style={btnStyle(deptFilter === d.name)} onClick={() => setDeptFilter(d.name)}>{d.name}</button>)}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {SHIFT_TYPES.map(t => (
          <span key={t.label} style={{ padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600, ...getShiftStyle(t.label) }}>
            {t.label}
          </span>
        ))}
      </div>

      {/* Schedule Table */}
      <div className="card" style={{ padding: 0 }}>
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ minWidth: 100 }}>員工</th>
                {weekDates.map((date, i) => (
                  <th key={date} style={{ textAlign: 'center', minWidth: 80 }}>
                    <div>週{DAY_LABELS[i]}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 400 }}>{date.slice(5)}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && <tr><td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>無員工</td></tr>}
              {filtered.map(emp => (
                <tr key={emp.id}>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{emp.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{emp.dept}</div>
                  </td>
                  {weekDates.map(date => {
                    const shift = getShift(emp.name, date)
                    const isEditing = editCell?.empName === emp.name && editCell?.date === date
                    return (
                      <td key={date} style={{ textAlign: 'center', padding: '6px 4px', position: 'relative' }}>
                        {isEditing ? (
                          <div style={{
                            position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)',
                            zIndex: 50, background: 'var(--bg-card)', border: '1px solid var(--border-strong)',
                            borderRadius: 10, padding: 8, boxShadow: 'var(--shadow-lg)',
                            display: 'flex', flexDirection: 'column', gap: 4, minWidth: 90,
                          }}>
                            {SHIFT_TYPES.map(t => (
                              <button key={t.label} onClick={() => handleSetShift(emp.name, date, t.label)}
                                style={{
                                  padding: '5px 10px', borderRadius: 6, border: 'none', cursor: 'pointer',
                                  fontSize: 12, fontWeight: 600, textAlign: 'center',
                                  background: t.dim, color: t.color,
                                }}>
                                {t.label}
                              </button>
                            ))}
                            <button onClick={() => setEditCell(null)} style={{
                              padding: '4px', borderRadius: 6, border: '1px solid var(--border-medium)',
                              background: 'none', color: 'var(--text-muted)', fontSize: 11, cursor: 'pointer',
                            }}>取消</button>
                          </div>
                        ) : null}
                        <span
                          onClick={() => setEditCell(isEditing ? null : { empName: emp.name, date })}
                          style={{
                            display: 'inline-block', padding: '4px 12px', borderRadius: 8,
                            fontSize: 12, fontWeight: 600, cursor: 'pointer',
                            transition: 'all 0.15s',
                            ...(shift ? getShiftStyle(shift) : { background: 'var(--glass-light)', color: 'var(--text-muted)', border: '1px dashed var(--border-medium)' }),
                          }}
                        >
                          {shift || '+'}
                        </span>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
