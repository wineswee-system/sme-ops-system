import { useState } from 'react'

const DIFFICULTY_STYLE = {
  '入門': 'badge-success',
  '進階': 'badge-info',
  '專業': 'badge-purple',
}

const CATEGORIES = [
  {
    key: 'quickstart',
    icon: '🚀',
    title: '快速入門',
    items: [
      { title: '系統設定', time: '5 分鐘', difficulty: '入門' },
      { title: '建立第一筆員工', time: '5 分鐘', difficulty: '入門' },
      { title: '第一次排班', time: '10 分鐘', difficulty: '入門' },
    ],
  },
  {
    key: 'hr',
    icon: '👥',
    title: '人事管理',
    items: [
      { title: '打卡設定', time: '5 分鐘', difficulty: '入門' },
      { title: '請假流程', time: '10 分鐘', difficulty: '進階' },
      { title: '薪資計算', time: '15 分鐘', difficulty: '進階' },
      { title: '排班規則', time: '10 分鐘', difficulty: '進階' },
    ],
  },
  {
    key: 'sales',
    icon: '💰',
    title: '銷售與客戶',
    items: [
      { title: 'CRM 使用', time: '10 分鐘', difficulty: '進階' },
      { title: 'POS 結帳', time: '5 分鐘', difficulty: '入門' },
      { title: '會員管理', time: '10 分鐘', difficulty: '進階' },
    ],
  },
  {
    key: 'warehouse',
    icon: '📦',
    title: '倉儲與採購',
    items: [
      { title: '庫存管理', time: '10 分鐘', difficulty: '進階' },
      { title: '採購流程', time: '15 分鐘', difficulty: '進階' },
      { title: '盤點作業', time: '10 分鐘', difficulty: '專業' },
    ],
  },
  {
    key: 'finance',
    icon: '📊',
    title: '財務報表',
    items: [
      { title: '傳票操作', time: '15 分鐘', difficulty: '專業' },
      { title: '應收應付', time: '10 分鐘', difficulty: '進階' },
      { title: '電子發票', time: '10 分鐘', difficulty: '進階' },
    ],
  },
  {
    key: 'line',
    icon: '💬',
    title: 'LINE 整合',
    items: [
      { title: '綁定帳號', time: '5 分鐘', difficulty: '入門' },
      { title: '打卡設定', time: '5 分鐘', difficulty: '入門' },
      { title: '推播通知', time: '10 分鐘', difficulty: '進階' },
    ],
  },
]

export default function Tutorial() {
  const [expanded, setExpanded] = useState(
    Object.fromEntries(CATEGORIES.map(c => [c.key, true]))
  )

  const toggle = (key) => {
    setExpanded(prev => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h2><span className="header-icon">📚</span> 教學中心</h2>
            <p>從入門到進階，快速掌握系統操作</p>
          </div>
        </div>
      </div>

      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 24 }}>
        <div className="stat-card" style={{ '--card-accent': 'var(--accent-blue)', '--card-accent-dim': 'var(--accent-blue-dim)' }}>
          <div className="stat-card-label">教學分類</div>
          <div className="stat-card-value">{CATEGORIES.length}</div>
        </div>
        <div className="stat-card" style={{ '--card-accent': 'var(--accent-green)', '--card-accent-dim': 'var(--accent-green-dim)' }}>
          <div className="stat-card-label">教學項目</div>
          <div className="stat-card-value">{CATEGORIES.reduce((sum, c) => sum + c.items.length, 0)}</div>
        </div>
        <div className="stat-card" style={{ '--card-accent': 'var(--accent-purple)', '--card-accent-dim': 'var(--accent-purple-dim)' }}>
          <div className="stat-card-label">預估總時長</div>
          <div className="stat-card-value">{CATEGORIES.reduce((sum, c) => sum + c.items.reduce((s, i) => s + parseInt(i.time), 0), 0)} 分</div>
        </div>
      </div>

      {CATEGORIES.map(cat => (
        <div key={cat.key} className="card" style={{ marginBottom: 16 }}>
          <div
            className="card-header"
            style={{ cursor: 'pointer', userSelect: 'none' }}
            onClick={() => toggle(cat.key)}
          >
            <div className="card-title">
              <span className="card-title-icon">{cat.icon}</span> {cat.title}
              <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 400, marginLeft: 8 }}>
                ({cat.items.length} 篇)
              </span>
            </div>
            <span style={{ fontSize: 18, color: 'var(--text-muted)', transition: 'transform 0.2s', transform: expanded[cat.key] ? 'rotate(0deg)' : 'rotate(-90deg)' }}>
              ▼
            </span>
          </div>
          {expanded[cat.key] && (
            <div style={{ padding: '4px 20px 16px' }}>
              {cat.items.map((item, i) => (
                <div key={i} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 0',
                  borderBottom: i < cat.items.length - 1 ? '1px solid var(--border-color)' : 'none',
                }}>
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: 'var(--bg-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 14,
                    fontWeight: 600,
                    color: 'var(--text-muted)',
                    border: '1px solid var(--border-color)',
                    flexShrink: 0,
                  }}>{i + 1}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>{item.title}</div>
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>⏱ {item.time}</span>
                  <span className={`badge ${DIFFICULTY_STYLE[item.difficulty] || 'badge-info'}`}>
                    <span className="badge-dot"></span>{item.difficulty}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
