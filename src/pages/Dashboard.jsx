import { useState, useEffect } from 'react'
import { Users, CheckCircle, AlertTriangle, Clock, FileX, RotateCcw, TrendingUp, Target } from 'lucide-react'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Filler } from 'chart.js'
import { Doughnut, Bar, Line } from 'react-chartjs-2'
import { getEmployees, getTasks, getWorkflows, getAttendance, getLeaveRequests } from '../lib/db'
import LoadingSpinner from '../components/LoadingSpinner'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Filler)

// Chart theme helper
const chartColors = {
  cyan: '#22d3ee',
  blue: '#3b82f6',
  purple: '#a78bfa',
  green: '#34d399',
  orange: '#fb923c',
  red: '#f87171',
  pink: '#f472b6',
  yellow: '#fbbf24',
}

const chartDefaults = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: { color: '#94a3b8', font: { size: 11, weight: 600 }, padding: 16, usePointStyle: true, pointStyleWidth: 8 },
    },
    tooltip: {
      backgroundColor: 'rgba(15, 23, 55, 0.95)',
      titleColor: '#f1f5f9',
      bodyColor: '#94a3b8',
      borderColor: 'rgba(148, 163, 184, 0.15)',
      borderWidth: 1,
      padding: 12,
      cornerRadius: 10,
      titleFont: { size: 13, weight: 700 },
      bodyFont: { size: 12 },
    },
  },
}

export default function Dashboard() {
  const [employees, setEmployees] = useState([])
  const [tasks, setTasks] = useState([])
  const [workflows, setWorkflows] = useState([])
  const [attendance, setAttendance] = useState([])
  const [leaves, setLeaves] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getEmployees(),
      getTasks(),
      getWorkflows(),
      getAttendance(),
      getLeaveRequests(),
    ]).then(([e, t, w, a, l]) => {
      setEmployees(e.data || [])
      setTasks(t.data || [])
      setWorkflows(w.data || [])
      setAttendance(a.data || [])
      setLeaves(l.data || [])
      setLoading(false)
    })
  }, [])

  if (loading) return <LoadingSpinner />

  const activeEmployees = employees.filter(e => e.status === '在職').length
  const completedTasks = tasks.filter(t => t.status === '已完成').length
  const inProgressTasks = tasks.filter(t => t.status === '進行中').length
  const notStartedTasks = tasks.filter(t => t.status === '未開始').length
  const activeWorkflows = workflows.filter(w => w.active_instances > 0).length
  const workflowProgress = tasks.length ? Math.round(completedTasks / tasks.length * 100) : 0
  const lateCount = attendance.filter(a => a.status === '遲到').length
  const resignedCount = employees.filter(e => e.status === '離職').length

  // ── Chart Data ──

  // Task status doughnut
  const taskDoughnutData = {
    labels: ['已完成', '進行中', '未開始'],
    datasets: [{
      data: [completedTasks, inProgressTasks, notStartedTasks],
      backgroundColor: [chartColors.green, chartColors.blue, chartColors.orange],
      borderWidth: 0,
      hoverOffset: 6,
    }],
  }

  // Department headcount bar chart
  const deptCounts = {}
  employees.filter(e => e.status === '在職').forEach(e => {
    deptCounts[e.dept || '未分類'] = (deptCounts[e.dept || '未分類'] || 0) + 1
  })
  const deptBarData = {
    labels: Object.keys(deptCounts),
    datasets: [{
      label: '人數',
      data: Object.values(deptCounts),
      backgroundColor: [chartColors.cyan, chartColors.blue, chartColors.purple, chartColors.green, chartColors.orange, chartColors.pink],
      borderRadius: 8,
      borderSkipped: false,
      barThickness: 32,
    }],
  }

  // Weekly attendance trend (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return d.toISOString().slice(0, 10)
  })
  const attendanceByDay = last7Days.map(date => {
    const dayRecords = attendance.filter(a => a.date === date)
    return {
      date,
      label: `${parseInt(date.slice(5, 7))}/${parseInt(date.slice(8))}`,
      normal: dayRecords.filter(a => a.status === '正常').length,
      late: dayRecords.filter(a => a.status === '遲到').length,
      total: dayRecords.length,
    }
  })
  const attendanceLineData = {
    labels: attendanceByDay.map(d => d.label),
    datasets: [
      {
        label: '正常出勤',
        data: attendanceByDay.map(d => d.normal),
        borderColor: chartColors.green,
        backgroundColor: 'rgba(52, 211, 153, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: chartColors.green,
      },
      {
        label: '遲到',
        data: attendanceByDay.map(d => d.late),
        borderColor: chartColors.orange,
        backgroundColor: 'rgba(251, 146, 60, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: chartColors.orange,
      },
    ],
  }

  // Leave type breakdown
  const leaveTypes = {}
  leaves.forEach(l => {
    leaveTypes[l.type || '其他'] = (leaveTypes[l.type || '其他'] || 0) + 1
  })
  const leaveColors = [chartColors.blue, chartColors.purple, chartColors.cyan, chartColors.pink, chartColors.yellow, chartColors.orange]
  const leaveDoughnutData = {
    labels: Object.keys(leaveTypes).length > 0 ? Object.keys(leaveTypes) : ['無資料'],
    datasets: [{
      data: Object.keys(leaveTypes).length > 0 ? Object.values(leaveTypes) : [1],
      backgroundColor: Object.keys(leaveTypes).length > 0 ? leaveColors.slice(0, Object.keys(leaveTypes).length) : ['rgba(148,163,184,0.2)'],
      borderWidth: 0,
      hoverOffset: 6,
    }],
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <h2><span className="header-icon">📊</span> 營運儀表板</h2>
        <p>所有門市營運概覽</p>
      </div>

      {/* ── KPI Cards ── */}
      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(6, 1fr)' }}>
        <div className="stat-card" style={{ '--card-accent': 'var(--accent-cyan)', '--card-accent-dim': 'var(--accent-cyan-dim)' }}>
          <div className="stat-card-icon"><Users size={16} /></div>
          <div className="stat-card-label">在職人數</div>
          <div className="stat-card-value">{activeEmployees}</div>
        </div>
        <div className="stat-card" style={{ '--card-accent': 'var(--accent-blue)', '--card-accent-dim': 'var(--accent-blue-dim)' }}>
          <div className="stat-card-icon"><CheckCircle size={16} /></div>
          <div className="stat-card-label">全勤</div>
          <div className="stat-card-value">{activeEmployees}</div>
        </div>
        <div className="stat-card" style={{ '--card-accent': 'var(--accent-orange)', '--card-accent-dim': 'var(--accent-orange-dim)' }}>
          <div className="stat-card-icon"><AlertTriangle size={16} /></div>
          <div className="stat-card-label">遲到</div>
          <div className="stat-card-value">{lateCount}</div>
        </div>
        <div className="stat-card" style={{ '--card-accent': 'var(--accent-purple)', '--card-accent-dim': 'var(--accent-purple-dim)' }}>
          <div className="stat-card-icon"><Clock size={16} /></div>
          <div className="stat-card-label">列假</div>
          <div className="stat-card-value">{leaves.filter(l => l.status === '已核准').length}</div>
        </div>
        <div className="stat-card" style={{ '--card-accent': 'var(--accent-red)', '--card-accent-dim': 'var(--accent-red-dim)' }}>
          <div className="stat-card-icon"><FileX size={16} /></div>
          <div className="stat-card-label">列離</div>
          <div className="stat-card-value">0</div>
        </div>
        <div className="stat-card" style={{ '--card-accent': 'var(--accent-pink)', '--card-accent-dim': 'var(--accent-pink-dim)' }}>
          <div className="stat-card-icon"><RotateCcw size={16} /></div>
          <div className="stat-card-label">離職</div>
          <div className="stat-card-value">{resignedCount}</div>
        </div>
      </div>

      {/* ── Second Row Stats ── */}
      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(8, 1fr)' }}>
        {[
          { label: '進行中流程', value: activeWorkflows, color: 'cyan' },
          { label: '總任務數', value: tasks.length, color: 'green' },
          { label: '未開始', value: notStartedTasks, color: 'orange' },
          { label: '進行中', value: inProgressTasks, color: 'blue' },
          { label: '已完成', value: completedTasks, color: 'green' },
          { label: '已逾期', value: 0, color: 'red' },
          { label: '待審報告', value: 0, color: 'purple' },
          { label: '待審確認', value: 0, color: 'yellow' },
        ].map((s, i) => (
          <div key={i} className="stat-card" style={{ [`--card-accent`]: `var(--accent-${s.color})`, [`--card-accent-dim`]: `var(--accent-${s.color}-dim)` }}>
            <div className="stat-card-label">{s.label}</div>
            <div className="stat-card-value">{s.value}</div>
          </div>
        ))}
      </div>

      {/* ── Progress Bar ── */}
      <div className="card mb-6">
        <div className="card-body">
          <div className="progress-bar-container">
            <div className="progress-header">
              <span className="progress-label"><span>📋</span> 進行中流程</span>
              <span className="progress-value">{workflowProgress}%</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${workflowProgress}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Charts Row 1 ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* Attendance Trend */}
        <div className="card">
          <div className="card-header">
            <div className="card-title"><span className="card-title-icon"><TrendingUp size={14} /></span> 近 7 天出勤趨勢</div>
          </div>
          <div style={{ height: 260, padding: '0 8px 8px' }}>
            <Line
              data={attendanceLineData}
              options={{
                ...chartDefaults,
                scales: {
                  x: {
                    grid: { color: 'rgba(148,163,184,0.06)' },
                    ticks: { color: '#64748b', font: { size: 11 } },
                  },
                  y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(148,163,184,0.06)' },
                    ticks: { color: '#64748b', font: { size: 11 }, stepSize: 1 },
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Task Status Doughnut */}
        <div className="card">
          <div className="card-header">
            <div className="card-title"><span className="card-title-icon"><Target size={14} /></span> 任務完成狀態</div>
          </div>
          <div style={{ padding: '8px 8px 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: 180, height: 180, position: 'relative' }}>
              <Doughnut
                data={taskDoughnutData}
                options={{
                  ...chartDefaults,
                  cutout: '65%',
                  plugins: {
                    ...chartDefaults.plugins,
                    legend: { display: false },
                  },
                }}
              />
              <div style={{
                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)' }}>{workflowProgress}%</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>完成率</div>
              </div>
            </div>
            {/* Custom legend */}
            <div style={{ display: 'flex', gap: 16, padding: '14px 0 12px' }}>
              {[
                { label: '已完成', color: chartColors.green, value: completedTasks },
                { label: '進行中', color: chartColors.blue, value: inProgressTasks },
                { label: '未開始', color: chartColors.orange, value: notStartedTasks },
              ].map(l => (
                <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: l.color }} />
                  <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{l.label}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-primary)' }}>{l.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Charts Row 2 ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* Department Headcount */}
        <div className="card">
          <div className="card-header">
            <div className="card-title"><span className="card-title-icon"><Users size={14} /></span> 部門人數分布</div>
          </div>
          <div style={{ height: 240, padding: '0 8px 8px' }}>
            <Bar
              data={deptBarData}
              options={{
                ...chartDefaults,
                plugins: { ...chartDefaults.plugins, legend: { display: false } },
                scales: {
                  x: {
                    grid: { display: false },
                    ticks: { color: '#64748b', font: { size: 11 } },
                  },
                  y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(148,163,184,0.06)' },
                    ticks: { color: '#64748b', font: { size: 11 }, stepSize: 1 },
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Leave Type Doughnut */}
        <div className="card">
          <div className="card-header">
            <div className="card-title"><span className="card-title-icon">📋</span> 請假類型分布</div>
          </div>
          <div style={{ height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 8px 8px' }}>
            <Doughnut
              data={leaveDoughnutData}
              options={{
                ...chartDefaults,
                cutout: '60%',
                plugins: {
                  ...chartDefaults.plugins,
                  legend: { ...chartDefaults.plugins.legend, position: 'bottom' },
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* ── Tasks Table ── */}
      <div className="card">
        <div className="card-header">
          <div className="card-title"><span className="card-title-icon">📋</span> 最近任務</div>
        </div>
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead><tr><th>#</th><th>任務</th><th>狀態</th><th>負責人</th></tr></thead>
            <tbody>
              {tasks.map(task => (
                <tr key={task.id}>
                  <td style={{ color: 'var(--text-muted)' }}>{task.id}</td>
                  <td>{task.title}</td>
                  <td>
                    <span className={`badge ${task.status === '已完成' ? 'badge-success' : task.status === '進行中' ? 'badge-info' : 'badge-warning'}`}>
                      <span className="badge-dot"></span>{task.status}
                    </span>
                  </td>
                  <td>{task.assignee}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
