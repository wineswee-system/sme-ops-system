import { useState } from 'react'

const METHOD_STYLES = {
  GET: { bg: 'var(--accent-green)', label: 'GET' },
  POST: { bg: 'var(--accent-blue)', label: 'POST' },
  PUT: { bg: 'var(--accent-orange)', label: 'PUT' },
  DELETE: { bg: 'var(--accent-red)', label: 'DELETE' },
}

const API_GROUPS = [
  {
    module: '員工 API',
    icon: '👥',
    endpoints: [
      { method: 'GET', path: '/api/employees', desc: '取得所有員工清單' },
      { method: 'POST', path: '/api/employees', desc: '新增員工資料' },
    ],
  },
  {
    module: '客戶 API',
    icon: '🤝',
    endpoints: [
      { method: 'GET', path: '/api/customers', desc: '取得所有客戶清單' },
      { method: 'POST', path: '/api/customers', desc: '新增客戶資料' },
    ],
  },
  {
    module: '庫存 API',
    icon: '📦',
    endpoints: [
      { method: 'GET', path: '/api/inventory', desc: '取得庫存品項列表' },
      { method: 'PUT', path: '/api/inventory/:id', desc: '更新指定品項庫存' },
    ],
  },
  {
    module: '訂單 API',
    icon: '🛒',
    endpoints: [
      { method: 'GET', path: '/api/orders', desc: '取得所有訂單' },
      { method: 'POST', path: '/api/orders', desc: '建立新訂單' },
    ],
  },
  {
    module: '發票 API',
    icon: '🧾',
    endpoints: [
      { method: 'POST', path: '/api/invoices', desc: '開立電子發票' },
    ],
  },
]

export default function APIDocumentation() {
  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h2><span className="header-icon">📡</span> API 開放介面</h2>
            <p>系統 API 端點文件與使用說明</p>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header">
          <div className="card-title"><span className="card-title-icon">🔑</span> 基本資訊</div>
        </div>
        <div style={{ padding: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            <div style={{
              background: 'var(--bg-secondary)',
              borderRadius: 12,
              padding: 16,
              border: '1px solid var(--border-color)',
            }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase' }}>API Base URL</div>
              <div style={{
                fontFamily: 'monospace',
                fontSize: 14,
                color: 'var(--accent-cyan)',
                background: 'var(--bg-primary)',
                padding: '8px 12px',
                borderRadius: 8,
                marginTop: 6,
              }}>https://api.sme-ops.com/v1</div>
            </div>
            <div style={{
              background: 'var(--bg-secondary)',
              borderRadius: 12,
              padding: 16,
              border: '1px solid var(--border-color)',
            }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase' }}>Authentication</div>
              <div style={{
                fontFamily: 'monospace',
                fontSize: 14,
                color: 'var(--accent-cyan)',
                background: 'var(--bg-primary)',
                padding: '8px 12px',
                borderRadius: 8,
                marginTop: 6,
              }}>Authorization: Bearer {'<your_token>'}</div>
            </div>
          </div>
        </div>
      </div>

      {API_GROUPS.map(group => (
        <div key={group.module} className="card" style={{ marginBottom: 16 }}>
          <div className="card-header">
            <div className="card-title"><span className="card-title-icon">{group.icon}</span> {group.module}</div>
          </div>
          <div style={{ padding: '8px 20px 20px' }}>
            {group.endpoints.map((ep, i) => {
              const style = METHOD_STYLES[ep.method]
              return (
                <div key={i} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 0',
                  borderBottom: i < group.endpoints.length - 1 ? '1px solid var(--border-color)' : 'none',
                }}>
                  <span style={{
                    background: style.bg,
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: 11,
                    padding: '3px 10px',
                    borderRadius: 6,
                    minWidth: 52,
                    textAlign: 'center',
                    fontFamily: 'monospace',
                  }}>{style.label}</span>
                  <span style={{
                    fontFamily: 'monospace',
                    fontSize: 14,
                    color: 'var(--text-primary)',
                    fontWeight: 500,
                  }}>{ep.path}</span>
                  <span style={{ fontSize: 13, color: 'var(--text-muted)', marginLeft: 'auto' }}>{ep.desc}</span>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
