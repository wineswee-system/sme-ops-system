import { useState } from 'react'
import { Wifi, WifiOff, RefreshCw, Settings } from 'lucide-react'

const PLATFORMS = [
  {
    key: 'shopee', name: '蝦皮 Shopee', icon: '🛒',
    color: 'var(--accent-orange)', colorDim: 'var(--accent-orange-dim)',
    apiKeyLabel: 'Partner ID', secretLabel: 'Partner Key',
    shopIdLabel: '商店 ID', docUrl: 'https://open.shopee.com',
    syncOptions: ['訂單自動匯入', '庫存即時同步', '出貨狀態回傳', '商品上架同步'],
  },
  {
    key: 'momo', name: 'Momo 購物', icon: '🏬',
    color: 'var(--accent-purple)', colorDim: 'var(--accent-purple-dim)',
    apiKeyLabel: 'API Key', secretLabel: 'API Secret',
    shopIdLabel: '賣家編號', docUrl: '#',
    syncOptions: ['訂單匯入', '庫存同步', '出貨回傳'],
  },
  {
    key: 'pchome', name: 'PChome 商店街', icon: '💻',
    color: 'var(--accent-blue)', colorDim: 'var(--accent-blue-dim)',
    apiKeyLabel: 'App Key', secretLabel: 'App Secret',
    shopIdLabel: '商店代碼', docUrl: '#',
    syncOptions: ['訂單匯入', '庫存同步', '商品同步'],
  },
  {
    key: 'line', name: 'LINE 購物', icon: '💬',
    color: 'var(--accent-green)', colorDim: 'var(--accent-green-dim)',
    apiKeyLabel: 'Channel ID', secretLabel: 'Channel Secret',
    shopIdLabel: '商店 ID', docUrl: '#',
    syncOptions: ['訂單匯入', '庫存同步', '推播通知'],
  },
  {
    key: 'website', name: '自有官網', icon: '🌐',
    color: 'var(--accent-cyan)', colorDim: 'var(--accent-cyan-dim)',
    apiKeyLabel: 'API Token', secretLabel: 'Webhook Secret',
    shopIdLabel: '網站網址', docUrl: '#',
    syncOptions: ['訂單 Webhook', '庫存 API', '會員同步'],
  },
]

export default function Ecommerce() {
  const [connections, setConnections] = useState(
    Object.fromEntries(PLATFORMS.map(p => [p.key, { connected: false, apiKey: '', secret: '', shopId: '', syncEnabled: {}, testing: false, lastSync: null }]))
  )
  const [expanded, setExpanded] = useState(null)
  const [msg, setMsg] = useState('')

  const updateField = (key, field, value) => {
    setConnections(prev => ({ ...prev, [key]: { ...prev[key], [field]: value } }))
  }

  const toggleSync = (platformKey, option) => {
    setConnections(prev => ({
      ...prev,
      [platformKey]: {
        ...prev[platformKey],
        syncEnabled: { ...prev[platformKey].syncEnabled, [option]: !prev[platformKey].syncEnabled[option] },
      },
    }))
  }

  const handleTestConnection = async (key) => {
    updateField(key, 'testing', true)
    const conn = connections[key]
    const platform = PLATFORMS.find(p => p.key === key)

    // 模擬連線測試
    await new Promise(r => setTimeout(r, 1500))

    if (!conn.apiKey || !conn.secret) {
      updateField(key, 'testing', false)
      setMsg(`❌ ${platform.name} 連線失敗：請填寫完整的 API 金鑰`)
      setTimeout(() => setMsg(''), 4000)
      return
    }

    updateField(key, 'testing', false)
    updateField(key, 'connected', true)
    updateField(key, 'lastSync', new Date().toLocaleString('zh-TW'))
    setMsg(`✅ ${platform.name} 連線成功！已建立連接`)
    setTimeout(() => setMsg(''), 4000)
  }

  const handleDisconnect = (key) => {
    const platform = PLATFORMS.find(p => p.key === key)
    setConnections(prev => ({
      ...prev,
      [key]: { connected: false, apiKey: '', secret: '', shopId: '', syncEnabled: {}, testing: false, lastSync: null },
    }))
    setExpanded(null)
    setMsg(`${platform.name} 已中斷連線`)
    setTimeout(() => setMsg(''), 3000)
  }

  const connectedCount = Object.values(connections).filter(c => c.connected).length

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

      {/* Stats */}
      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="stat-card" style={{ '--card-accent': 'var(--accent-green)', '--card-accent-dim': 'var(--accent-green-dim)' }}>
          <div className="stat-card-label">已連接平台</div>
          <div className="stat-card-value">{connectedCount}</div>
        </div>
        <div className="stat-card" style={{ '--card-accent': 'var(--accent-orange)', '--card-accent-dim': 'var(--accent-orange-dim)' }}>
          <div className="stat-card-label">未連接</div>
          <div className="stat-card-value">{PLATFORMS.length - connectedCount}</div>
        </div>
        <div className="stat-card" style={{ '--card-accent': 'var(--accent-cyan)', '--card-accent-dim': 'var(--accent-cyan-dim)' }}>
          <div className="stat-card-label">可串接平台</div>
          <div className="stat-card-value">{PLATFORMS.length}</div>
        </div>
      </div>

      {msg && (
        <div style={{
          marginBottom: 16, padding: '12px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600,
          background: msg.startsWith('✅') ? 'var(--accent-green-dim)' : msg.startsWith('❌') ? 'var(--accent-red-dim)' : 'var(--accent-orange-dim)',
          color: msg.startsWith('✅') ? 'var(--accent-green)' : msg.startsWith('❌') ? 'var(--accent-red)' : 'var(--accent-orange)',
        }}>{msg}</div>
      )}

      {/* Platform Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {PLATFORMS.map(p => {
          const conn = connections[p.key]
          const isExpanded = expanded === p.key
          return (
            <div key={p.key} className="card" style={{ overflow: 'hidden' }}>
              <div style={{ height: 3, background: conn.connected ? 'var(--accent-green)' : p.color }} />
              <div style={{ padding: '16px 20px' }}>
                {/* Header Row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 28 }}>{p.icon}</span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>{p.name}</div>
                      {conn.lastSync && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>上次同步：{conn.lastSync}</div>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span className={`badge ${conn.connected ? 'badge-success' : 'badge-warning'}`}>
                      <span className="badge-dot"></span>{conn.connected ? '已連接' : '未連接'}
                    </span>
                    <button
                      onClick={() => setExpanded(isExpanded ? null : p.key)}
                      style={{
                        padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                        border: '1px solid var(--border-medium)',
                        background: isExpanded ? p.colorDim : 'var(--bg-card)',
                        color: isExpanded ? p.color : 'var(--text-secondary)',
                      }}
                    >
                      <Settings size={12} style={{ marginRight: 4, verticalAlign: -2 }} />
                      {conn.connected ? '管理' : '設定'}
                    </button>
                  </div>
                </div>

                {/* Expanded Settings */}
                {isExpanded && (
                  <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border-subtle)' }}>
                    {/* API Credentials */}
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 10 }}>API 連線設定</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 16 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>{p.apiKeyLabel}</label>
                        <input
                          className="form-input" type="text" style={{ width: '100%', fontSize: 13 }}
                          placeholder={`輸入 ${p.apiKeyLabel}`}
                          value={conn.apiKey} onChange={e => updateField(p.key, 'apiKey', e.target.value)}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>{p.secretLabel}</label>
                        <input
                          className="form-input" type="password" style={{ width: '100%', fontSize: 13 }}
                          placeholder={`輸入 ${p.secretLabel}`}
                          value={conn.secret} onChange={e => updateField(p.key, 'secret', e.target.value)}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>{p.shopIdLabel}</label>
                        <input
                          className="form-input" type="text" style={{ width: '100%', fontSize: 13 }}
                          placeholder={`輸入 ${p.shopIdLabel}`}
                          value={conn.shopId} onChange={e => updateField(p.key, 'shopId', e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Sync Options */}
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 10 }}>同步項目</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                      {p.syncOptions.map(opt => {
                        const enabled = conn.syncEnabled[opt]
                        return (
                          <button
                            key={opt}
                            onClick={() => toggleSync(p.key, opt)}
                            style={{
                              padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                              cursor: 'pointer', border: 'none',
                              background: enabled ? p.colorDim : 'var(--glass-medium)',
                              color: enabled ? p.color : 'var(--text-muted)',
                              outline: `1.5px solid ${enabled ? p.color : 'var(--border-medium)'}`,
                            }}
                          >
                            {enabled ? '✓ ' : ''}{opt}
                          </button>
                        )
                      })}
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: 10 }}>
                      {!conn.connected ? (
                        <button
                          className="btn btn-primary"
                          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                          onClick={() => handleTestConnection(p.key)}
                          disabled={conn.testing}
                        >
                          {conn.testing ? (
                            <><RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> 連線測試中...</>
                          ) : (
                            <><Wifi size={14} /> 測試連線並啟用</>
                          )}
                        </button>
                      ) : (
                        <>
                          <button
                            className="btn btn-secondary"
                            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                            onClick={() => { updateField(p.key, 'lastSync', new Date().toLocaleString('zh-TW')); setMsg(`✅ ${p.name} 手動同步完成`); setTimeout(() => setMsg(''), 3000) }}
                          >
                            <RefreshCw size={14} /> 手動同步
                          </button>
                          <button
                            className="btn btn-secondary"
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: 'var(--accent-red)' }}
                            onClick={() => handleDisconnect(p.key)}
                          >
                            <WifiOff size={14} /> 中斷
                          </button>
                        </>
                      )}
                    </div>

                    {/* Doc link */}
                    {p.docUrl !== '#' && (
                      <div style={{ marginTop: 10, fontSize: 11, color: 'var(--text-muted)' }}>
                        📖 API 文件：<span style={{ color: 'var(--accent-cyan)' }}>{p.docUrl}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Integration Flow */}
      <div className="card" style={{ marginTop: 24 }}>
        <div className="card-header">
          <div className="card-title"><span className="card-title-icon">🔄</span> 串接後的自動流程</div>
        </div>
        <div style={{ padding: '16px 20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}>
            {[
              { icon: '📥', title: '訂單自動匯入', desc: '電商平台新訂單即時同步到銷售訂單模組，不用手動建單' },
              { icon: '📦', title: '庫存即時同步', desc: '系統庫存變動自動更新到所有連接的電商平台，避免超賣' },
              { icon: '🚚', title: '出貨狀態回傳', desc: 'WMS 出貨後自動將物流單號回傳給電商平台，買家即時追蹤' },
              { icon: '💰', title: '帳務自動拋轉', desc: '電商訂單完成後自動產生應收帳款與會計傳票' },
            ].map((f, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, padding: '12px', borderRadius: 10, background: 'var(--glass-light)' }}>
                <span style={{ fontSize: 24 }}>{f.icon}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>{f.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
