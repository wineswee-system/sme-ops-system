import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import {
  Users, GitBranch, Building2, HeadphonesIcon, Warehouse, Settings,
  Bot, LayoutDashboard, BarChart3, ArrowRight, Send, CheckCircle
} from 'lucide-react'

// Animated counter hook
function useCounter(target, duration = 1800, start = false) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!start) return
    let startTime = null
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * target))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [target, duration, start])
  return count
}

// ── Intro section data ──
const MODULES_INTRO = [
  {
    icon: '👥', title: '人資管理', color: 'var(--accent-cyan)', dim: 'var(--accent-cyan-dim)',
    features: ['打卡追蹤', '請假 / 加班審核', '薪資計算與獎金', '績效考核', '招募管理', '差旅費核銷'], tag: 'HR',
  },
  {
    icon: '🤝', title: 'CRM 客戶管理', color: 'var(--accent-blue)', dim: 'var(--accent-blue-dim)',
    features: ['客戶 360° 檢視', '銷售漏斗追蹤', '行銷自動化', '客服工單', '信用額度警示', '跨分店篩選'], tag: 'CRM',
  },
  {
    icon: '📦', title: 'WMS 倉儲管理', color: 'var(--accent-green)', dim: 'var(--accent-green-dim)',
    features: ['進貨 / 出貨管理', '即時庫存盤點', '庫存異動紀錄', 'SKU 品項管理', '倉庫篩選', '即將到期預警'], tag: 'WMS',
  },
  {
    icon: '⚙️', title: '流程管理', color: 'var(--accent-purple)', dim: 'var(--accent-purple-dim)',
    features: ['標準作業流程', '任務指派追蹤', '查核清單', '流程進度看板', '部門任務篩選', '優先度管理'], tag: 'PROCESS',
  },
  {
    icon: '🏢', title: '組織管理', color: 'var(--accent-orange)', dim: 'var(--accent-orange-dim)',
    features: ['公司 / 分店管理', '部門架構', '員工資料庫', '組織圖', 'LINE 整合', '通知範本'], tag: 'ORG',
  },
  {
    icon: '🏆', title: '績效獎金', color: 'var(--accent-yellow)', dim: 'var(--accent-yellow-dim)',
    features: ['業務獎金自動計算', '倉管績效評分', '跨部門合戰', 'CRM 數據連動', 'WMS 數據連動', '獎金發放紀錄'], tag: 'BONUS',
  },
  {
    icon: '🤖', title: 'AI 工具', color: 'var(--accent-pink)', dim: 'var(--accent-pink-dim)',
    features: ['AI 助理問答', '流程建議', '數據分析輔助', '異常預警解讀', '自動化規則推薦', '智慧報表摘要'], tag: 'AI',
  },
  {
    icon: '🔐', title: '員工 Portal', color: '#34d399', dim: 'rgba(52,211,153,0.12)',
    features: ['自助打卡', '我的假單', '費用申請', '差旅申報', '績效自評', '個人行事曆'], tag: 'PORTAL',
  },
]

const INTEGRATIONS = [
  { from: 'CRM', to: 'WMS', desc: '出貨單自動帶入客戶信用額度警示', icon: '⚡' },
  { from: 'WMS', to: 'CRM', desc: '客戶頁顯示最新出貨紀錄與狀態', icon: '🔗' },
  { from: 'CRM', to: '獎金', desc: '業務獎金直接抓 CRM 成交數據', icon: '🏆' },
  { from: 'WMS', to: '獎金', desc: '倉管績效串接出貨量與錯誤率', icon: '📊' },
  { from: '組織', to: '全模組', desc: '員工、部門資料統一來源、全系統同步', icon: '🏢' },
  { from: 'HR', to: '薪資', desc: '事假/遲到自動連動薪資扣款明細', icon: '💰' },
]

const STATS = [
  { label: '功能模組', value: 8, suffix: '' },
  { label: '功能頁面', value: 50, suffix: '+' },
  { label: '跨模組整合', value: 6, suffix: '項' },
  { label: '資料表串接', value: 30, suffix: '+' },
]

const HIGHLIGHTS = [
  {
    icon: '🔗', title: '組織系統統一來源',
    desc: '員工、部門、分店資料只需維護一次。HR、CRM、WMS、流程管理全部引用同一份資料，不再出現員工姓名打錯找不到的問題。',
    color: 'var(--accent-cyan)',
  },
  {
    icon: '📊', title: '獎金計算全自動',
    desc: '業務獎金從 CRM 成交數據直接計算；倉管獎金從 WMS 出貨量和錯誤率自動評分。不需要手動整理報表，減少爭議。',
    color: 'var(--accent-purple)',
  },
  {
    icon: '⚠️', title: '信用風險即時預警',
    desc: '出貨單建立時，系統自動比對客戶信用額度。超過 80% 顯示橘色警示，超過 100% 顯示紅色警告，業務主動管控應收帳款。',
    color: 'var(--accent-orange)',
  },
  {
    icon: '🏦', title: '薪資明細透明化',
    desc: '每筆扣款都有明確分類：事假扣薪、遲到扣薪、其他扣款（附備註）。點開薪資列即可看到完整計算過程，避免勞資糾紛。',
    color: 'var(--accent-green)',
  },
  {
    icon: '🌐', title: '分店 / 部門全域篩選',
    desc: '系統所有頁面均支援按分店或部門篩選，管理者可快速聚焦特定單位的數據，不需要匯出 Excel 再過濾。',
    color: 'var(--accent-blue)',
  },
  {
    icon: '👤', title: '員工自助 Portal',
    desc: '員工透過獨立 Portal 自助打卡、申請假單、報銷費用、查看績效目標，減少 HR 行政負擔，也讓員工掌握自己的資訊。',
    color: 'var(--accent-pink)',
  },
]

// ── System entry cards data ──
const systems = [
  {
    id: 'dashboard', title: '營運儀表板', subtitle: 'Operations Dashboard',
    description: '即時 KPI 數據總覽、出勤統計、任務進度追蹤，一目瞭然掌握全店營運狀況。',
    icon: LayoutDashboard, accent: 'var(--accent-cyan)', accentDim: 'var(--accent-cyan-dim)',
    glow: 'rgba(34, 211, 238, 0.2)', path: '/',
    features: ['KPI 總覽', '出勤統計', '任務追蹤', '流程監控'], moduleCount: 2,
  },
  {
    id: 'hr', title: '人事管理系統', subtitle: 'HR Management',
    description: '涵蓋考勤、請假、加班、薪資、排班、績效考核、招募等完整人事生命週期管理。',
    icon: Users, accent: 'var(--accent-blue)', accentDim: 'var(--accent-blue-dim)',
    glow: 'rgba(59, 130, 246, 0.2)', path: '/hr/report',
    features: ['考勤打卡', '請假管理', '薪資計算', '排班系統', '績效考核', '招募管理'], moduleCount: 15,
  },
  {
    id: 'process', title: '流程管理系統', subtitle: 'Process Management',
    description: '工作流程自動化、任務分派追蹤、SOP 標準作業程序管理，提升團隊協作效率。',
    icon: GitBranch, accent: 'var(--accent-purple)', accentDim: 'var(--accent-purple-dim)',
    glow: 'rgba(167, 139, 250, 0.2)', path: '/process/overview',
    features: ['工作流程', '任務管理', '檢核表', 'SOP 模板'], moduleCount: 5,
  },
  {
    id: 'org', title: '組織管理系統', subtitle: 'Organization Management',
    description: '多公司架構、門市據點、部門管理、員工目錄、LINE 整合，組織架構一覽無遺。',
    icon: Building2, accent: 'var(--accent-green)', accentDim: 'var(--accent-green-dim)',
    glow: 'rgba(52, 211, 153, 0.2)', path: '/org/overview',
    features: ['組織圖', '門市管理', '部門管理', 'LINE 整合'], moduleCount: 8,
  },
  {
    id: 'crm', title: '客戶關係管理', subtitle: 'CRM System',
    description: '客戶資料管理、銷售漏斗追蹤、行銷自動化、客服工單管理，驅動業績成長。',
    icon: HeadphonesIcon, accent: 'var(--accent-orange)', accentDim: 'var(--accent-orange-dim)',
    glow: 'rgba(251, 146, 60, 0.2)', path: '/crm/overview',
    features: ['客戶管理', '銷售管線', '行銷自動化', '客服系統'], moduleCount: 5,
  },
  {
    id: 'wms', title: '倉儲管理系統', subtitle: 'Warehouse Management',
    description: 'SKU 商品管理、入庫出庫作業、庫存即時追蹤、異常報表分析，精準掌控庫存。',
    icon: Warehouse, accent: 'var(--accent-yellow)', accentDim: 'var(--accent-yellow-dim)',
    glow: 'rgba(251, 191, 36, 0.2)', path: '/wms/overview',
    features: ['SKU 管理', '入庫管理', '庫存追蹤', '出庫管理'], moduleCount: 6,
  },
  {
    id: 'system', title: '系統管理', subtitle: 'System Administration',
    description: '使用者權限、自動觸發器、通知設定、稽核日誌、系統效能監控與全域設定。',
    icon: Settings, accent: 'var(--accent-red)', accentDim: 'var(--accent-red-dim)',
    glow: 'rgba(248, 113, 113, 0.2)', path: '/system/triggers',
    features: ['權限管理', '觸發器', '稽核日誌', '系統監控'], moduleCount: 6,
  },
  {
    id: 'ai', title: 'AI 智能工具', subtitle: 'AI Tools',
    description: 'AI 助理、智能客服 Agent、幫助中心，讓 AI 成為您的營運好幫手。',
    icon: Bot, accent: 'var(--accent-pink)', accentDim: 'var(--accent-pink-dim)',
    glow: 'rgba(244, 114, 182, 0.2)', path: '/ai/help',
    features: ['幫助中心', 'Agent 控制台'], moduleCount: 2,
  },
]

export default function DemoLanding() {
  const navigate = useNavigate()
  const [visible, setVisible] = useState(false)
  const [activeModule, setActiveModule] = useState(null)
  const [hoveredId, setHoveredId] = useState(null)

  // Inquiry form
  const [inquiry, setInquiry] = useState({ company_name: '', contact_name: '', phone: '', email: '', company_size: '', interested_modules: [] })
  const [inquiryStatus, setInquiryStatus] = useState(null) // null | 'sending' | 'success' | 'error'
  const MODULE_OPTIONS = ['HR 人資管理', 'CRM 客戶管理', 'WMS 倉儲管理', '流程管理', '組織管理', 'AI 工具', '全部都要']

  const toggleModule = (mod) => {
    setInquiry(prev => ({
      ...prev,
      interested_modules: prev.interested_modules.includes(mod)
        ? prev.interested_modules.filter(m => m !== mod)
        : [...prev.interested_modules, mod],
    }))
  }

  const handleInquirySubmit = async () => {
    if (!inquiry.company_name || !inquiry.contact_name || !inquiry.phone) return
    setInquiryStatus('sending')
    try {
      await supabase.from('inquiries').insert({
        company_name: inquiry.company_name,
        contact_name: inquiry.contact_name,
        phone: inquiry.phone,
        email: inquiry.email,
        company_size: inquiry.company_size,
        interested_modules: inquiry.interested_modules,
      })
      setInquiryStatus('success')
    } catch {
      setInquiryStatus('error')
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 300)
    return () => clearTimeout(timer)
  }, [])

  const c0 = useCounter(STATS[0].value, 1200, visible)
  const c1 = useCounter(STATS[1].value, 1600, visible)
  const c2 = useCounter(STATS[2].value, 1400, visible)
  const c3 = useCounter(STATS[3].value, 1800, visible)
  const counts = [c0, c1, c2, c3]

  return (
    <div style={{
      height: '100vh',
      background: 'var(--bg-primary)',
      color: 'var(--text-primary)',
      fontFamily: "'Inter', 'Noto Sans TC', sans-serif",
      overflowX: 'hidden',
      overflowY: 'auto',
      scrollbarWidth: 'thin',
      scrollbarColor: 'var(--text-muted) transparent',
    }}>

      {/* ── Navbar ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 40px', height: 64,
        background: 'rgba(6, 9, 26, 0.85)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-subtle)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-blue))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, fontWeight: 800, color: '#fff',
          }}>S</div>
          <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.3px' }}>SME OPS</span>
          <span style={{
            fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20,
            background: 'var(--accent-cyan-dim)', color: 'var(--accent-cyan)',
            border: '1px solid rgba(34,211,238,0.3)', marginLeft: 4,
          }}>DEMO</span>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button
            onClick={() => navigate('/')}
            style={{
              padding: '8px 20px', borderRadius: 10,
              background: 'linear-gradient(135deg, var(--accent-cyan), #3b82f6)',
              border: 'none', color: '#fff', fontSize: 13, fontWeight: 600,
              cursor: 'pointer', letterSpacing: '0.3px',
            }}
          >
            進入系統 →
          </button>
        </div>
      </nav>

      {/* ══════════════════════════════════════════
          SECTION 1: Hero 介紹
         ══════════════════════════════════════════ */}
      <section style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '120px 40px 80px',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', width: 600, height: 600, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(34,211,238,0.06) 0%, transparent 70%)',
          top: '10%', left: '15%', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', width: 500, height: 500, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(167,139,250,0.06) 0%, transparent 70%)',
          bottom: '10%', right: '10%', pointerEvents: 'none',
        }} />

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '6px 16px', borderRadius: 999,
          background: 'var(--accent-cyan-dim)', border: '1px solid rgba(34,211,238,0.25)',
          fontSize: 12, fontWeight: 600, color: 'var(--accent-cyan)',
          marginBottom: 28,
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(16px)',
          transition: 'all 0.6s ease',
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-cyan)', display: 'inline-block', animation: 'pulse 2s infinite' }} />
          中小企業一體化營運管理平台
        </div>

        <h1 style={{
          fontSize: 'clamp(36px, 6vw, 72px)',
          fontWeight: 800, lineHeight: 1.1, textAlign: 'center',
          margin: '0 0 20px',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(24px)',
          transition: 'all 0.7s ease 0.1s',
        }}>
          <span style={{ background: 'linear-gradient(135deg, var(--text-primary) 0%, var(--text-tertiary) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            人資 · 倉儲 · 客戶
          </span>
          <br />
          <span style={{ background: 'linear-gradient(135deg, var(--accent-cyan) 0%, var(--accent-blue) 50%, var(--accent-purple) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            全部整合，一套搞定
          </span>
        </h1>

        <p style={{
          fontSize: 17, color: 'var(--text-secondary)', textAlign: 'center',
          maxWidth: 560, lineHeight: 1.7, margin: '0 0 44px',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 0.7s ease 0.2s',
        }}>
          從員工打卡、客戶開發、倉庫出貨到績效獎金，
          <br />所有核心業務流程串連成一個智慧系統。
        </p>

        <div style={{
          display: 'flex', gap: 12,
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(16px)',
          transition: 'all 0.7s ease 0.3s',
        }}>
          <button
            onClick={() => document.getElementById('enter-system').scrollIntoView({ behavior: 'smooth' })}
            style={{
              padding: '13px 32px', borderRadius: 12, border: 'none',
              background: 'linear-gradient(135deg, var(--accent-cyan), #3b82f6)',
              color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer',
              boxShadow: '0 0 30px rgba(34,211,238,0.25)',
            }}
          >
            選擇系統體驗 →
          </button>
          <button
            onClick={() => document.getElementById('modules').scrollIntoView({ behavior: 'smooth' })}
            style={{
              padding: '13px 32px', borderRadius: 12,
              background: 'var(--glass-medium)', border: '1px solid var(--border-medium)',
              color: 'var(--text-secondary)', fontSize: 15, fontWeight: 600, cursor: 'pointer',
            }}
          >
            了解功能
          </button>
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1,
          marginTop: 72, width: '100%', maxWidth: 680,
          background: 'var(--border-subtle)', borderRadius: 16,
          overflow: 'hidden', border: '1px solid var(--border-subtle)',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 0.8s ease 0.4s',
        }}>
          {STATS.map((s, i) => (
            <div key={i} style={{
              background: 'var(--bg-card)', padding: '24px 20px', textAlign: 'center',
            }}>
              <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--accent-cyan)', lineHeight: 1 }}>
                {counts[i]}{s.suffix}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 2: 8 大核心模組介紹
         ══════════════════════════════════════════ */}
      <section id="modules" style={{ padding: '80px 40px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 52 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent-cyan)', letterSpacing: '2px', marginBottom: 12 }}>MODULES</div>
          <h2 style={{ fontSize: 36, fontWeight: 800, margin: 0 }}>8 大核心模組</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: 12, fontSize: 15 }}>覆蓋企業日常營運所有面向，模組間資料全面互通</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {MODULES_INTRO.map((m, i) => (
            <div
              key={i}
              onMouseEnter={() => setActiveModule(i)}
              onMouseLeave={() => setActiveModule(null)}
              style={{
                background: activeModule === i ? m.dim : 'var(--bg-card)',
                border: `1px solid ${activeModule === i ? m.color + '40' : 'var(--border-subtle)'}`,
                borderRadius: 16, padding: '24px 22px',
                cursor: 'default', transition: 'all 0.25s ease',
                transform: activeModule === i ? 'translateY(-3px)' : 'none',
                boxShadow: activeModule === i ? `0 8px 32px ${m.color}18` : 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: m.dim, border: `1px solid ${m.color}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
                }}>{m.icon}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{m.title}</div>
                  <div style={{ fontSize: 10, color: m.color, fontWeight: 600, letterSpacing: '1px', marginTop: 2 }}>{m.tag}</div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {m.features.map((f, j) => (
                  <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
                    <span style={{ width: 4, height: 4, borderRadius: '50%', background: m.color, flexShrink: 0 }} />
                    {f}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 3: 模組間深度整合
         ══════════════════════════════════════════ */}
      <section style={{ padding: '80px 40px', background: 'var(--bg-secondary)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent-purple)', letterSpacing: '2px', marginBottom: 12 }}>INTEGRATION</div>
            <h2 style={{ fontSize: 36, fontWeight: 800, margin: 0 }}>模組間深度整合</h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: 12, fontSize: 15 }}>資料不再孤立，各系統即時互通，讓決策更即時、獎金更透明</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
            {INTEGRATIONS.map((item, i) => (
              <div key={i} style={{
                background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
                borderRadius: 14, padding: '20px 20px',
              }}>
                <div style={{ fontSize: 24, marginBottom: 10 }}>{item.icon}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <span style={{
                    padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700,
                    background: 'var(--accent-cyan-dim)', color: 'var(--accent-cyan)',
                  }}>{item.from}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>→</span>
                  <span style={{
                    padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700,
                    background: 'var(--accent-purple-dim)', color: 'var(--accent-purple)',
                  }}>{item.to}</span>
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 4: 核心設計理念
         ══════════════════════════════════════════ */}
      <section style={{ padding: '80px 40px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 52 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent-green)', letterSpacing: '2px', marginBottom: 12 }}>HIGHLIGHTS</div>
          <h2 style={{ fontSize: 36, fontWeight: 800, margin: 0 }}>核心設計理念</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
          {HIGHLIGHTS.map((item, i) => (
            <div key={i} style={{
              background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
              borderRadius: 16, padding: '28px 24px',
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: 14, fontSize: 22,
                background: `${item.color}15`, border: `1px solid ${item.color}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 16,
              }}>{item.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 10 }}>{item.title}</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 5: 完整功能清單
         ══════════════════════════════════════════ */}
      <section style={{ padding: '80px 40px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 52 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent-blue)', letterSpacing: '2px', marginBottom: 12 }}>FULL FEATURES</div>
          <h2 style={{ fontSize: 36, fontWeight: 800, margin: 0 }}>完整功能清單</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: 12, fontSize: 15 }}>54 個功能頁面、23 張資料表、涵蓋企業營運每一個面向</p>
        </div>

        {/* Feature modules */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
          {[
            {
              icon: '👥', title: '人資管理', tag: '15 項功能', color: 'var(--accent-cyan)',
              items: ['HR 報表總覽', '打卡追蹤（GPS 地理圍籬）', '請假管理（審核流程）', '加班申請', '薪資管理 + PDF 匯出', '排班系統', '假日管理', '排班規則', '績效考核', '招募管理', '文件管理', '轉調紀錄', '公出差旅', '費用核銷', '績效獎金'],
            },
            {
              icon: '🤝', title: 'CRM 客戶管理', tag: '5 項功能', color: 'var(--accent-blue)',
              items: ['CRM 總覽儀表板', '客戶 360° 管理', '銷售漏斗追蹤', '行銷自動化', '客服工單系統'],
            },
            {
              icon: '📦', title: 'WMS 倉儲管理', tag: '6 項功能', color: 'var(--accent-green)',
              items: ['倉庫總覽', 'SKU 商品主檔', '入庫管理', '庫存即時追蹤', '出庫管理', '異常與報表分析'],
            },
            {
              icon: '⚙️', title: '流程管理', tag: '5 項功能', color: 'var(--accent-purple)',
              items: ['流程進度總覽', '工作流程設計', '任務分派追蹤', '查核清單', 'SOP 標準作業程序'],
            },
            {
              icon: '🏢', title: '組織管理', tag: '8 項功能', color: 'var(--accent-orange)',
              items: ['組織總覽', '組織圖', '多公司管理', '門市管理（GPS 座標）', '部門管理', '員工目錄', 'LINE 整合', '模板管理'],
            },
            {
              icon: '🔐', title: '系統管理', tag: '6 項功能', color: 'var(--accent-red)',
              items: ['自動觸發器', '通知管理', '使用者權限', '操作紀錄時間軸', '系統效能監控', '全域設定'],
            },
            {
              icon: '🤖', title: 'AI 工具', tag: '2 項功能', color: 'var(--accent-pink)',
              items: ['AI 幫助中心', 'Agent 控制台'],
            },
            {
              icon: '📱', title: 'LINE 整合', tag: '員工行動端', color: '#34d399',
              items: ['LINE 打卡（GPS 驗證）', 'LINE 查薪資', 'LINE 請假查詢', 'LINE 任務回報', 'LINE 查庫存', '排休申請（月曆）', '推播：班表提醒', '推播：低庫存警示', '推播：薪資通知'],
            },
          ].map((mod, i) => (
            <div key={i} style={{
              background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
              borderRadius: 16, padding: '24px', backdropFilter: 'blur(12px)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 12,
                    background: `${mod.color}15`, border: `1px solid ${mod.color}25`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
                  }}>{mod.icon}</div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>{mod.title}</div>
                  </div>
                </div>
                <span style={{
                  padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                  background: `${mod.color}15`, color: mod.color,
                }}>{mod.tag}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {mod.items.map((item, j) => (
                  <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
                    <span style={{ width: 4, height: 4, borderRadius: '50%', background: mod.color, flexShrink: 0 }} />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Special features */}
        <div style={{ marginTop: 32 }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent-yellow)', letterSpacing: '2px', marginBottom: 8 }}>BONUS</div>
            <h3 style={{ fontSize: 24, fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>額外特色功能</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
            {[
              { icon: '📊', label: 'Dashboard 即時圖表', desc: '4 張互動式圖表' },
              { icon: '📄', label: 'PDF 報表匯出', desc: '考勤 / 薪資一鍵下載' },
              { icon: '🔔', label: '即時通知中心', desc: '待審 / 低庫存 / 逾期' },
              { icon: '🎯', label: '首次登入導覽', desc: '4 步驟精靈引導設定' },
              { icon: '📍', label: 'GPS 打卡圍籬', desc: '門市 300m 內才能打卡' },
              { icon: '👤', label: '員工自助 Portal', desc: '獨立入口查出勤薪資' },
              { icon: '🌙', label: '深淺色主題切換', desc: '護眼暗色 / 清爽淺色' },
              { icon: '💬', label: 'LINE Rich Menu', desc: '精緻 6 格快捷選單' },
            ].map((f, i) => (
              <div key={i} style={{
                background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
                borderRadius: 14, padding: '18px 16px',
                display: 'flex', alignItems: 'flex-start', gap: 12,
              }}>
                <div style={{ fontSize: 24, lineHeight: 1 }}>{f.icon}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>{f.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats bar */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 1,
          marginTop: 32, background: 'var(--border-subtle)', borderRadius: 14,
          overflow: 'hidden', border: '1px solid var(--border-subtle)',
        }}>
          {[
            { value: '54', label: '功能頁面' },
            { value: '23', label: '資料表' },
            { value: '8', label: '系統模組' },
            { value: '9', label: 'LINE 指令' },
            { value: '3', label: '推播類型' },
          ].map((s, i) => (
            <div key={i} style={{ background: 'var(--bg-card)', padding: '20px', textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--accent-cyan)' }}>{s.value}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 6: 聯繫我們
         ══════════════════════════════════════════ */}
      <section style={{ padding: '80px 40px', background: 'var(--bg-secondary)' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent-cyan)', letterSpacing: '2px', marginBottom: 12 }}>CONTACT US</div>
            <h2 style={{ fontSize: 36, fontWeight: 800, margin: 0 }}>聯繫我們</h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: 12, fontSize: 15 }}>留下您的資訊，我們將盡快與您聯繫</p>
          </div>

          {inquiryStatus === 'success' ? (
            <div style={{
              background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
              borderRadius: 20, padding: '60px 40px', textAlign: 'center',
              backdropFilter: 'blur(16px)',
            }}>
              <CheckCircle size={48} style={{ color: 'var(--accent-green)', marginBottom: 16 }} />
              <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8, color: 'var(--text-primary)' }}>感謝您的諮詢！</h3>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>我們會在 1 個工作天內與您聯繫。</p>
            </div>
          ) : (
            <div style={{
              background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
              borderRadius: 20, padding: '32px', backdropFilter: 'blur(16px)',
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                {[
                  { key: 'company_name', label: '公司名稱 *', placeholder: '例：好吃餐飲有限公司' },
                  { key: 'contact_name', label: '聯絡人姓名 *', placeholder: '王小明' },
                  { key: 'phone', label: '電話 *', placeholder: '0912-345-678' },
                  { key: 'email', label: 'Email', placeholder: 'example@company.com' },
                ].map(f => (
                  <div key={f.key}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>{f.label}</label>
                    <input
                      type="text"
                      placeholder={f.placeholder}
                      value={inquiry[f.key]}
                      onChange={e => setInquiry(prev => ({ ...prev, [f.key]: e.target.value }))}
                      style={{
                        width: '100%', padding: '10px 14px', borderRadius: 10,
                        background: 'var(--glass-medium)', border: '1px solid var(--border-medium)',
                        color: 'var(--text-primary)', fontSize: 14, outline: 'none',
                      }}
                    />
                  </div>
                ))}
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>公司人數</label>
                <select
                  value={inquiry.company_size}
                  onChange={e => setInquiry(prev => ({ ...prev, company_size: e.target.value }))}
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: 10,
                    background: 'var(--glass-medium)', border: '1px solid var(--border-medium)',
                    color: 'var(--text-primary)', fontSize: 14, outline: 'none', appearance: 'none',
                  }}
                >
                  <option value="">請選擇</option>
                  <option>1-10 人</option>
                  <option>11-30 人</option>
                  <option>31-50 人</option>
                  <option>51-100 人</option>
                  <option>100 人以上</option>
                </select>
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 10 }}>感興趣的模組</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {MODULE_OPTIONS.map(mod => {
                    const selected = inquiry.interested_modules.includes(mod)
                    return (
                      <button
                        key={mod}
                        onClick={() => toggleModule(mod)}
                        style={{
                          padding: '6px 16px', borderRadius: 99, fontSize: 13, fontWeight: 600,
                          cursor: 'pointer', transition: 'all 0.15s', border: 'none',
                          background: selected ? 'var(--accent-cyan-dim)' : 'var(--glass-medium)',
                          color: selected ? 'var(--accent-cyan)' : 'var(--text-tertiary)',
                          outline: selected ? '1.5px solid var(--accent-cyan)' : '1px solid var(--border-medium)',
                        }}
                      >
                        {mod}
                      </button>
                    )
                  })}
                </div>
              </div>

              {inquiryStatus === 'error' && (
                <div style={{ color: 'var(--accent-red)', fontSize: 13, marginBottom: 12, textAlign: 'center' }}>
                  提交失敗，請稍後再試
                </div>
              )}

              <button
                onClick={handleInquirySubmit}
                disabled={inquiryStatus === 'sending' || !inquiry.company_name || !inquiry.contact_name || !inquiry.phone}
                style={{
                  width: '100%', padding: '14px', borderRadius: 12, border: 'none',
                  background: (!inquiry.company_name || !inquiry.contact_name || !inquiry.phone)
                    ? 'var(--glass-medium)'
                    : 'linear-gradient(135deg, var(--accent-cyan), var(--accent-blue))',
                  color: (!inquiry.company_name || !inquiry.contact_name || !inquiry.phone) ? 'var(--text-muted)' : '#fff',
                  fontSize: 15, fontWeight: 700, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  boxShadow: (inquiry.company_name && inquiry.contact_name && inquiry.phone) ? '0 4px 20px rgba(34,211,238,0.2)' : 'none',
                }}
              >
                <Send size={16} />
                {inquiryStatus === 'sending' ? '提交中...' : '提交諮詢'}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 6: 選擇系統進入體驗
         ══════════════════════════════════════════ */}
      <section id="enter-system" style={{
        padding: '80px 40px',
        background: 'linear-gradient(180deg, var(--bg-secondary) 0%, var(--bg-primary) 100%)',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent-cyan)', letterSpacing: '2px', marginBottom: 12 }}>TRY IT NOW</div>
            <h2 style={{ fontSize: 36, fontWeight: 800, margin: 0 }}>選擇系統，開始體驗</h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: 12, fontSize: 15 }}>點擊任一模組，直接進入系統操作介面</p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '20px',
          }}>
            {systems.map((sys) => {
              const Icon = sys.icon
              const isHovered = hoveredId === sys.id
              return (
                <div
                  key={sys.id}
                  style={{
                    background: 'var(--bg-card)',
                    borderRadius: 'var(--radius-lg)',
                    border: `1px solid ${isHovered ? sys.accent : 'var(--border-subtle)'}`,
                    padding: '28px',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    backdropFilter: 'blur(12px)',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: isHovered ? `0 8px 40px ${sys.glow}, var(--shadow-lg)` : 'var(--shadow-md)',
                    transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
                  }}
                  onMouseEnter={() => setHoveredId(sys.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onClick={() => navigate(sys.path)}
                >
                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    alignItems: 'flex-start', marginBottom: '16px',
                  }}>
                    <div style={{
                      width: '48px', height: '48px', borderRadius: 'var(--radius-md)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: sys.accentDim, color: sys.accent,
                      boxShadow: isHovered ? `0 0 20px ${sys.glow}` : 'none',
                      transition: 'box-shadow 0.3s ease',
                    }}>
                      <Icon size={24} />
                    </div>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '4px',
                      fontSize: '12px', color: 'var(--text-tertiary)', fontWeight: 500,
                    }}>
                      <BarChart3 size={12} />
                      <span>{sys.moduleCount} 個模組</span>
                    </div>
                  </div>

                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px' }}>{sys.title}</h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', margin: '0 0 12px', fontWeight: 500, letterSpacing: '0.5px', textTransform: 'uppercase' }}>{sys.subtitle}</p>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 16px', lineHeight: 1.6, flex: 1 }}>{sys.description}</p>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                    {sys.features.map((f) => (
                      <span key={f} style={{
                        padding: '3px 10px', borderRadius: 'var(--radius-full)',
                        fontSize: '11px', fontWeight: 600,
                        background: sys.accentDim, color: sys.accent,
                      }}>{f}</span>
                    ))}
                  </div>

                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
                    gap: '4px', fontSize: '13px', fontWeight: 600,
                    transition: 'color 0.2s ease', paddingTop: '12px',
                    borderTop: '1px solid var(--border-subtle)',
                    color: isHovered ? sys.accent : 'var(--text-tertiary)',
                  }}>
                    <span>進入系統</span>
                    <ArrowRight size={16} style={{
                      transform: isHovered ? 'translateX(4px)' : 'translateX(0)',
                      transition: 'transform 0.2s ease',
                    }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{
        padding: '24px 40px', borderTop: '1px solid var(--border-subtle)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontSize: 12, color: 'var(--text-muted)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 24, height: 24, borderRadius: 7,
            background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-blue))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 800, color: '#fff',
          }}>S</div>
          <span>SME OPS — 企業營運管理系統</span>
        </div>
        <div>Built with React + Supabase</div>
      </footer>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(0.8); }
        }
      `}</style>
    </div>
  )
}
