import { useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, BarChart3, Users, ClipboardList, Building2,
  GitBranch, ChevronRight, Clock, CalendarOff, CalendarPlus,
  DollarSign, Calendar, CalendarDays, Workflow, Star,
  UserSearch, FolderOpen, ArrowRightLeft, Plane, Receipt,
  Eye, ListChecks, CheckSquare, Building, MapPin, Network,
  UserCircle, MessageCircle, FileText, Zap, Bell, UserCog,
  ScrollText, Settings, BookOpen, Bot, Award, LogOut, Sun, Moon,
  Warehouse, PackageOpen, Truck, BarChart2, Package,
  Handshake, TrendingUp, Megaphone, HeadphonesIcon, Sparkles,
  ShoppingCart, CreditCard, BookText, FileCheck,
  FileEdit, Tag, Monitor, RotateCcw
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import NotificationCenter from './NotificationCenter'

// Init theme from localStorage
const savedTheme = typeof window !== 'undefined' ? localStorage.getItem('theme') : null
if (savedTheme) document.documentElement.setAttribute('data-theme', savedTheme)

const navSections = [
  {
    label: '主選單',
    items: [
      { icon: LayoutDashboard, label: '儀表板', path: '/', color: '#22d3ee' },
      { icon: BarChart3, label: '營運看板', path: '/analytics', color: '#3b82f6' },
      { icon: TrendingUp, label: '銷售預測', path: '/analytics/forecast', color: '#a78bfa' },
    ]
  },
  {
    label: '人資管理',
    items: [
      {
        icon: Users, label: '人資管理', path: '/hr', color: '#22d3ee',
        children: [
          { icon: BarChart3, label: 'HR 報表', path: '/hr/report' },
          { icon: Clock, label: '打卡追蹤', path: '/hr/attendance' },
          { icon: CalendarOff, label: '請假管理', path: '/hr/leave' },
          { icon: CalendarPlus, label: '加班申請', path: '/hr/overtime' },
          { icon: DollarSign, label: '薪資管理', path: '/hr/salary' },
          { icon: Calendar, label: '排班', path: '/hr/schedule' },
          { icon: CalendarDays, label: '假日管理', path: '/hr/holidays' },
          { icon: Workflow, label: '排班規則', path: '/hr/schedule-rules' },
          { icon: Star, label: '績效管理', path: '/hr/performance' },
          { icon: UserSearch, label: '招募管理', path: '/hr/recruitment' },
          { icon: FolderOpen, label: '文件管理', path: '/hr/documents' },
          { icon: ArrowRightLeft, label: '轉調紀錄', path: '/hr/transfer' },
          { icon: Plane, label: '公出差旅', path: '/hr/travel' },
          { icon: Receipt, label: '費用核銷', path: '/hr/expenses' },
          { icon: DollarSign, label: '績效獎金', path: '/hr/bonus' },
        ]
      }
    ]
  },
  {
    label: '流程管理',
    items: [
      {
        icon: GitBranch, label: '流程管理', path: '/process', color: '#a78bfa',
        children: [
          { icon: Eye, label: '總覽', path: '/process/overview' },
          { icon: Workflow, label: '流程', path: '/process/workflows' },
          { icon: ListChecks, label: '任務', path: '/process/tasks' },
          { icon: CheckSquare, label: '查核清單', path: '/process/checklists' },
          { icon: ScrollText, label: 'SOP 範本', path: '/process/sop' },
        ]
      }
    ]
  },
  {
    label: '組織管理',
    items: [
      {
        icon: Building2, label: '組織管理', path: '/org', color: '#fb923c',
        children: [
          { icon: Eye, label: '總覽', path: '/org/overview' },
          { icon: Network, label: '組織', path: '/org/chart' },
          { icon: Building, label: '公司', path: '/org/companies' },
          { icon: MapPin, label: '門市', path: '/org/locations' },
          { icon: ClipboardList, label: '部門', path: '/org/departments' },
          { icon: UserCircle, label: '員工', path: '/org/employees' },
          { icon: MessageCircle, label: 'LINE', path: '/org/line' },
          { icon: FileText, label: '模單', path: '/org/templates' },
        ]
      },
    ]
  },
  {
    label: 'CRM 客戶管理',
    items: [
      {
        icon: Handshake, label: 'CRM 客戶管理', path: '/crm', color: '#3b82f6',
        children: [
          { icon: Eye, label: '總覽', path: '/crm/overview' },
          { icon: Users, label: '客戶管理', path: '/crm/customers' },
          { icon: TrendingUp, label: '銷售漏斗', path: '/crm/pipeline' },
          { icon: Megaphone, label: '行銷自動化', path: '/crm/marketing' },
          { icon: HeadphonesIcon, label: '客服工單', path: '/crm/service' },
          { icon: Award, label: '會員管理', path: '/crm/members' },
        ]
      }
    ]
  },
  {
    label: 'WMS 倉儲管理',
    items: [
      {
        icon: Warehouse, label: 'WMS 倉儲管理', path: '/wms', color: '#34d399',
        children: [
          { icon: BarChart2, label: '倉庫總覽', path: '/wms/overview' },
          { icon: Package, label: '商品主檔', path: '/wms/skus' },
          { icon: PackageOpen, label: '進貨管理', path: '/wms/inbound' },
          { icon: BarChart3, label: '庫存管理', path: '/wms/inventory' },
          { icon: Truck, label: '出貨管理', path: '/wms/outbound' },
          { icon: BarChart2, label: '異常與報表', path: '/wms/reports' },
          { icon: Package, label: '批號追蹤', path: '/wms/lots' },
          { icon: CheckSquare, label: '盤點作業', path: '/wms/stock-count' },
        ]
      }
    ]
  },
  {
    label: '銷售管理',
    items: [
      {
        icon: FileEdit, label: '銷售管理', path: '/sales', color: '#f472b6',
        children: [
          { icon: FileText, label: '報價管理', path: '/sales/quotations' },
          { icon: ClipboardList, label: '銷售訂單', path: '/sales/orders' },
          { icon: Tag, label: '促銷活動', path: '/sales/promotions' },
          { icon: RotateCcw, label: '退貨管理', path: '/sales/returns' },
          { icon: Truck, label: '物流追蹤', path: '/sales/shipments' },
        ]
      }
    ]
  },
  {
    label: 'POS 收銀',
    items: [
      {
        icon: Monitor, label: 'POS 系統', path: '/pos', color: '#22d3ee',
        children: [
          { icon: Monitor, label: '收銀台', path: '/pos/terminal' },
          { icon: DollarSign, label: '交班日結', path: '/pos/shifts' },
        ]
      }
    ]
  },
  {
    label: '採購管理',
    items: [
      {
        icon: ShoppingCart, label: '採購管理', path: '/purchase', color: '#fbbf24',
        children: [
          { icon: Users, label: '供應商', path: '/purchase/suppliers' },
          { icon: ClipboardList, label: '採購申請', path: '/purchase/requests' },
          { icon: FileText, label: '採購單', path: '/purchase/orders' },
          { icon: FileCheck, label: '進貨驗收', path: '/purchase/receipts' },
          { icon: FileText, label: '合約管理', path: '/purchase/contracts' },
        ]
      }
    ]
  },
  {
    label: '財務會計',
    items: [
      {
        icon: CreditCard, label: '財務會計', path: '/finance', color: '#34d399',
        children: [
          { icon: Eye, label: '財務總覽', path: '/finance/overview' },
          { icon: BookText, label: '傳票管理', path: '/finance/journal' },
          { icon: TrendingUp, label: '應收帳款', path: '/finance/ar' },
          { icon: Receipt, label: '應付帳款', path: '/finance/ap' },
          { icon: BarChart3, label: '預算管理', path: '/finance/budgets' },
          { icon: CreditCard, label: '銀行對帳', path: '/finance/bank' },
          { icon: FileText, label: '電子發票', path: '/finance/invoices' },
        ]
      }
    ]
  },
  {
    label: '製造 & 品質',
    items: [
      {
        icon: Settings, label: '製造管理', path: '/manufacturing', color: '#f87171',
        children: [
          { icon: ClipboardList, label: 'BOM 物料清單', path: '/manufacturing/bom' },
          { icon: BarChart3, label: 'MRP 需求計畫', path: '/manufacturing/mrp' },
          { icon: CheckSquare, label: '品質管理', path: '/manufacturing/qm' },
          { icon: ClipboardList, label: '製令管理', path: '/manufacturing/orders' },
        ]
      }
    ]
  },
  {
    label: '系統',
    items: [
      { icon: Zap, label: '觸發器', path: '/system/triggers', color: '#fbbf24' },
      { icon: Bell, label: '通知管理', path: '/system/notifications', color: '#fb923c' },
      { icon: UserCog, label: '使用者管理', path: '/system/users', color: '#a78bfa' },
      { icon: ScrollText, label: '操作紀錄', path: '/system/audit', color: '#64748b' },
      { icon: Award, label: '績效管理', path: '/system/performance', color: '#f472b6' },
      { icon: Settings, label: '系統設定', path: '/system/settings', color: '#94a3b8' },
      { icon: BarChart3, label: '資料庫管理', path: '/system/database', color: '#22d3ee' },
      { icon: FileText, label: '資料匯入匯出', path: '/system/import-export', color: '#34d399' },
    ]
  },
  {
    label: 'AI 工具',
    items: [
      { icon: BookOpen, label: '說明中心', path: '/ai/help', color: '#22d3ee' },
      { icon: Bot, label: 'Agent 控制台', path: '/ai/agent', color: '#f472b6' },
      { icon: BookOpen, label: '教學中心', path: '/ai/tutorial', color: '#34d399' },
      { icon: FileText, label: '電商串接', path: '/integration/ecommerce', color: '#fb923c' },
      { icon: Settings, label: 'API 文件', path: '/integration/api', color: '#64748b' },
    ]
  },
]

export default function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { profile, signOut } = useAuth()
  const [openMenus, setOpenMenus] = useState({ '/hr': true, '/process': true, '/org': true })
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark')

  const toggleMenu = (path) => {
    setOpenMenus(prev => ({ ...prev, [path]: !prev[path] }))
  }

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon" style={{ background: 'linear-gradient(135deg, #22d3ee, #3b82f6, #a78bfa)', boxShadow: '0 4px 16px rgba(34,211,238,0.3)' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1.5"/>
            <rect x="14" y="3" width="7" height="7" rx="1.5"/>
            <rect x="3" y="14" width="7" height="7" rx="1.5"/>
            <rect x="14" y="14" width="7" height="7" rx="1.5"/>
            <path d="M10 6.5h4" opacity="0.5"/>
            <path d="M6.5 10v4" opacity="0.5"/>
            <path d="M17.5 10v4" opacity="0.5"/>
            <path d="M10 17.5h4" opacity="0.5"/>
          </svg>
        </div>
        <div className="sidebar-brand-text" style={{ flex: 1, minWidth: 0 }}>
          <h1>SME Ops</h1>
          <span>智慧營運系統</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          <button
            onClick={() => navigate('/demo')}
            title="Demo 展示頁"
            style={{
              background: 'linear-gradient(135deg, var(--accent-cyan-dim), var(--accent-purple-dim))',
              border: '1px solid var(--border-medium)',
              color: 'var(--accent-cyan)',
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: 'var(--radius-full)',
              fontSize: 10,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 3,
              transition: 'var(--transition-fast)',
            }}
          >
            <Sparkles size={10} />
            Demo
          </button>
          <NotificationCenter />
        </div>
      </div>

      <nav className="sidebar-nav">
        {navSections.map((section, si) => (
          <div className="nav-section" key={si}>
            <div className="nav-section-label">{section.label}</div>
            {section.items.map((item, ii) => {
              const Icon = item.icon
              const hasChildren = item.children && item.children.length > 0
              const menuOpen = openMenus[item.path]

              if (hasChildren) {
                return (
                  <div key={ii}>
                    <div
                      className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
                      onClick={() => toggleMenu(item.path)}
                    >
                      <Icon className="nav-item-icon" style={item.color ? { color: item.color, background: `${item.color}15`, opacity: 1 } : undefined} />
                      <span>{item.label}</span>
                      <ChevronRight className={`nav-item-chevron ${menuOpen ? 'open' : ''}`} />
                    </div>
                    <div className={`nav-sub-items ${menuOpen ? 'open' : ''}`}>
                      {item.children.map((child, ci) => {
                        const ChildIcon = child.icon
                        return (
                          <NavLink
                            to={child.path}
                            key={ci}
                            className={({ isActive: active }) => `nav-sub-item ${active ? 'active' : ''}`}
                          >
                            <ChildIcon className="nav-sub-item-icon" />
                            <span>{child.label}</span>
                          </NavLink>
                        )
                      })}
                    </div>
                  </div>
                )
              }

              return (
                <NavLink
                  to={item.path}
                  key={ii}
                  className={({ isActive: active }) => `nav-item ${active ? 'active' : ''}`}
                >
                  <Icon className="nav-item-icon" style={item.color ? { color: item.color, background: `${item.color}15`, opacity: 1 } : undefined} />
                  <span>{item.label}</span>
                </NavLink>
              )
            })}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div style={{ padding: '8px 12px', marginBottom: 8, borderRadius: 8, background: 'var(--glass-light)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: profile?.avatar || 'var(--accent-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
            {profile?.name?.[0]}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profile?.name}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{profile?.position}</div>
          </div>
          <button onClick={signOut} title="登出" style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4, flexShrink: 0 }}>
            <LogOut size={15} />
          </button>
        </div>
        <div className="sidebar-lang-toggle" onClick={() => {
          const current = document.documentElement.getAttribute('data-theme')
          const next = current === 'light' ? 'dark' : 'light'
          document.documentElement.setAttribute('data-theme', next)
          localStorage.setItem('theme', next)
          setTheme(next)
        }} style={{ cursor: 'pointer', userSelect: 'none' }}>
          {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
          <span>{theme === 'light' ? '深色模式' : '淺色模式'}</span>
        </div>
      </div>
    </aside>
  )
}
