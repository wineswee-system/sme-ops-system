import { useState } from 'react'

const PLATFORMS = [
  { key: 'shopee', name: '蝦皮 Shopee', icon: '🛒', color: 'var(--accent-orange)', colorDim: 'var(--accent-orange-dim)' },
  { key: 'momo', name: 'Momo', icon: '🏬', color: 'var(--accent-purple)', colorDim: 'var(--accent-purple-dim)' },
  { key: 'pchome', name: 'PChome', icon: '💻', color: 'var(--accent-blue)', colorDim: 'var(--accent-blue-dim)' },
  { key: 'line', name: 'LINE 購物', icon: '💬', color: 'var(--accent-green)', colorDim: 'var(--accent-green-dim)' },
  { key: 'website', name: '自有官網', icon: '🌐', color: 'var(--accent-cyan)', colorDim: 'var(--accent-cyan-dim)' },
]

const FEATURES = ['訂單同步', '庫存同步', '出貨同步']

const STEPS = [
  { num: '1', title: '取得 API 金鑰', desc: '至各平台後台申請 API 串接權限' },
  { num: '2', title: '輸入系統設定', desc: '將金鑰與商店資訊填入本系統' },
  { num: '3', title: '測試連線', desc: '執行連線測試確認串接正常' },
  { num: '4', title: '啟用同步', desc: '開啟自動同步，資料即時更新' },
]

export default function Ecommerce() {
  const [status, setStatus] = useState(
    Object.fromEntries(PLATFORMS.map(p => [p.key, false]))
  )

  const handleConnect = (key) => {
    alert('功能開發中')
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h2><span className="header-icon">🛍️</span> 電商平台串接</h2>
            <p>整合主流電商平台，統一管理訂單與庫存</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16, marginBottom: 24 }}>
        {PLATFORMS.map(p => (
          <div key={p.key} className="card" style={{ overflow: 'hidden' }}>
            <div style={{
              height: 4,
              background: p.color,
            }} />
            <div style={{ padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 28 }}>{p.icon}</span>
                  <span style={{ fontWeight: 600, fontSize: 16, color: 'var(--text-primary)' }}>{p.name}</span>
                </div>
                <span className={`badge ${status[p.key] ? 'badge-success' : 'badge-warning'}`}>
                  <span className="badge-dot"></span>{status[p.key] ? '已連接' : '未連接'}
                </span>
              </div>

              <div style={{ marginBottom: 16 }}>
                {FEATURES.map(f => (
                  <div key={f} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: 13,
                    color: 'var(--text-muted)',
                    padding: '4px 0',
                  }}>
                    <span style={{ color: 'var(--text-muted)' }}>•</span> {f}
                  </div>
                ))}
              </div>

              <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => handleConnect(p.key)}>
                連接
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title"><span className="card-title-icon">📖</span> 串接說明</div>
        </div>
        <div style={{ padding: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
            {STEPS.map(s => (
              <div key={s.num} style={{
                background: 'var(--bg-secondary)',
                borderRadius: 12,
                padding: 20,
                border: '1px solid var(--border-color)',
                textAlign: 'center',
              }}>
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: 'var(--accent-blue)',
                  color: '#fff',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: 16,
                  marginBottom: 10,
                }}>{s.num}</div>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4, color: 'var(--text-primary)' }}>{s.title}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
