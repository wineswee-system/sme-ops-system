import { useState } from 'react'
import { Search, Plus, Minus, Trash2, ShoppingCart } from 'lucide-react'

const MOCK_PRODUCTS = [
  { id: 1, name: '美式咖啡', price: 60, category: '飲品' },
  { id: 2, name: '拿鐵咖啡', price: 80, category: '飲品' },
  { id: 3, name: '巧克力蛋糕', price: 120, category: '甜點' },
  { id: 4, name: '起司三明治', price: 90, category: '輕食' },
  { id: 5, name: '鮮果汁', price: 75, category: '飲品' },
  { id: 6, name: '提拉米蘇', price: 150, category: '甜點' },
  { id: 7, name: '總匯沙拉', price: 130, category: '輕食' },
  { id: 8, name: '紅茶', price: 40, category: '飲品' },
]

const PAYMENT_METHODS = ['現金', '信用卡', 'LINE Pay', '街口']

export default function POSTerminal() {
  const [search, setSearch] = useState('')
  const [cart, setCart] = useState([])
  const [discount, setDiscount] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState('現金')

  const filtered = MOCK_PRODUCTS.filter(p =>
    search === '' || p.name.includes(search) || p.category.includes(search)
  )

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(c => c.id === product.id)
      if (existing) return prev.map(c => c.id === product.id ? { ...c, qty: c.qty + 1 } : c)
      return [...prev, { ...product, qty: 1 }]
    })
  }

  const updateQty = (id, delta) => {
    setCart(prev => prev.map(c => c.id === id ? { ...c, qty: Math.max(1, c.qty + delta) } : c))
  }

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(c => c.id !== id))
  }

  const subtotal = cart.reduce((sum, c) => sum + c.price * c.qty, 0)
  const tax = Math.round(subtotal * 0.05)
  const total = subtotal - discount + tax

  const handleCheckout = () => {
    if (cart.length === 0) return
    alert(`結帳完成！\n付款方式：${paymentMethod}\n總計：NT$ ${total.toLocaleString()}`)
    setCart([])
    setDiscount(0)
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h2><span className="header-icon">🖥️</span> POS 收銀台</h2>
            <p>銷售結帳作業</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 20, minHeight: 520 }}>
        {/* Left: Product Selection */}
        <div style={{ flex: '1 1 55%', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card" style={{ marginBottom: 0 }}>
            <div className="card-header">
              <div className="card-title"><span className="card-title-icon">🛒</span> 商品選擇</div>
              <div className="search-bar">
                <Search className="search-icon" />
                <input type="text" placeholder="搜尋商品..." className="form-input" style={{ paddingLeft: 38 }} value={search} onChange={e => setSearch(e.target.value)} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12, padding: 16 }}>
              {filtered.map(p => (
                <div
                  key={p.id}
                  onClick={() => addToCart(p)}
                  style={{
                    border: '1px solid var(--border-primary)',
                    borderRadius: 10,
                    padding: 14,
                    cursor: 'pointer',
                    textAlign: 'center',
                    background: 'var(--bg-secondary)',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-cyan)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-primary)'; e.currentTarget.style.transform = 'none' }}
                >
                  <div style={{ width: 48, height: 48, borderRadius: 8, background: 'var(--bg-tertiary)', margin: '0 auto 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                    {p.category === '飲品' ? '☕' : p.category === '甜點' ? '🍰' : '🥗'}
                  </div>
                  <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{p.name}</div>
                  <div style={{ color: 'var(--accent-cyan)', fontWeight: 700, fontSize: 14 }}>NT$ {p.price}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{p.category}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Cart & Payment */}
        <div style={{ flex: '1 1 40%', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card" style={{ marginBottom: 0, flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div className="card-header">
              <div className="card-title"><ShoppingCart size={16} style={{ marginRight: 6 }} /> 購物車 ({cart.reduce((s, c) => s + c.qty, 0)})</div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px' }}>
              {cart.length === 0 && (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>購物車是空的</div>
              )}
              {cart.map(c => (
                <div key={c.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-primary)' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{c.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>NT$ {c.price} x {c.qty}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <button onClick={() => updateQty(c.id, -1)} style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)', borderRadius: 6, padding: '2px 6px', cursor: 'pointer', color: 'var(--text-primary)' }}><Minus size={12} /></button>
                    <span style={{ minWidth: 20, textAlign: 'center', fontWeight: 600 }}>{c.qty}</span>
                    <button onClick={() => updateQty(c.id, 1)} style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)', borderRadius: 6, padding: '2px 6px', cursor: 'pointer', color: 'var(--text-primary)' }}><Plus size={12} /></button>
                    <button onClick={() => removeFromCart(c.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-red)', padding: '2px 4px' }}><Trash2 size={14} /></button>
                  </div>
                  <div style={{ minWidth: 80, textAlign: 'right', fontWeight: 600 }}>NT$ {(c.price * c.qty).toLocaleString()}</div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div style={{ padding: 16, borderTop: '1px solid var(--border-primary)', background: 'var(--bg-secondary)', borderRadius: '0 0 12px 12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
                <span>小計</span><span>NT$ {subtotal.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, fontSize: 13 }}>
                <span>折扣</span>
                <input
                  type="number" min={0} value={discount}
                  onChange={e => setDiscount(Math.max(0, Number(e.target.value)))}
                  style={{ width: 80, textAlign: 'right', background: 'var(--bg-primary)', border: '1px solid var(--border-primary)', borderRadius: 6, padding: '2px 8px', color: 'var(--text-primary)', fontSize: 13 }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
                <span>稅金 (5%)</span><span>NT$ {tax.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 18, margin: '12px 0', color: 'var(--accent-cyan)' }}>
                <span>合計</span><span>NT$ {total.toLocaleString()}</span>
              </div>

              {/* Payment method */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                {PAYMENT_METHODS.map(m => (
                  <button
                    key={m}
                    onClick={() => setPaymentMethod(m)}
                    style={{
                      flex: '1 1 auto',
                      padding: '8px 12px',
                      borderRadius: 8,
                      border: paymentMethod === m ? '2px solid var(--accent-cyan)' : '1px solid var(--border-primary)',
                      background: paymentMethod === m ? 'var(--accent-cyan-dim)' : 'var(--bg-primary)',
                      color: 'var(--text-primary)',
                      fontWeight: paymentMethod === m ? 700 : 400,
                      cursor: 'pointer',
                      fontSize: 13,
                    }}
                  >{m}</button>
                ))}
              </div>

              <button
                className="btn btn-primary"
                style={{ width: '100%', padding: '12px 0', fontSize: 16, fontWeight: 700 }}
                onClick={handleCheckout}
                disabled={cart.length === 0}
              >
                結帳
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
