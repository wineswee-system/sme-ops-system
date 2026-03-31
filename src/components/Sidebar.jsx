import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, BarChart3, Users, ClipboardList, Building2,
  GitBranch, ChevronRight, Clock, CalendarOff, CalendarPlus,
  DollarSign, Calendar, CalendarDays, Workflow, Star,
  UserSearch, FolderOpen, ArrowRightLeft, Plane, Receipt,
  Eye, ListChecks, CheckSquare, Building, MapPin, Network,
  UserCircle, MessageCircle, FileText, Zap, Bell, UserCog,
  ScrollText, Settings, BookOpen, Bot, Globe, Award, LogOut,
  Warehouse, PackageOpen, Truck, BarChart2, Package,
  Handshake, TrendingUp, Megaphone, HeadphonesIcon
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const navSections = [
  {
    label: '主選單',
    items: [
      { icon: LayoutDashboard, label: '儀表板', path: '/' },
      { icon: BarChart3, label: '營運看板', path: '/analytics' },
    ]
  },
  {
    label: '人資管理',
    items: [
      {
        icon: Users, label: '人資管理', path: '/hr',
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
        icon: GitBranch, label: '流程管理', path: '/process',
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
        icon: Building2, label: '組織管理', path: '/org',
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
        icon: Handshake, label: 'CRM 客戶管理', path: '/crm',
        children: [
          { icon: Eye, label: '總覽', path: '/crm/overview' },
          { icon: Users, label: '客戶管理', path: '/crm/customers' },
          { icon: TrendingUp, label: '銷售漏斗', path: '/crm/pipeline' },
          { icon: Megaphone, label: '行銷自動化', path: '/crm/marketing' },
          { icon: HeadphonesIcon, label: '客服工單', path: '/crm/service' },
        ]
      }
    ]
  },
  {
    label: 'WMS 倉儲管理',
    items: [
      {
        icon: Warehouse, label: 'WMS 倉儲管理', path: '/wms',
        children: [
          { icon: BarChart2, label: '倉庫總覽', path: '/wms/overview' },
          { icon: Package, label: '商品主檔', path: '/wms/skus' },
          { icon: PackageOpen, label: '進貨管理', path: '/wms/inbound' },
          { icon: BarChart3, label: '庫存管理', path: '/wms/inventory' },
          { icon: Truck, label: '出貨管理', path: '/wms/outbound' },
          { icon: BarChart2, label: '異常與報表', path: '/wms/reports' },
        ]
      }
    ]
  },
  {
    label: '系統',
    items: [
      { icon: Zap, label: '觸發器', path: '/system/triggers' },
      { icon: Bell, label: '通知管理', path: '/system/notifications' },
      { icon: UserCog, label: '使用者管理', path: '/system/users' },
      { icon: ScrollText, label: '操作紀錄', path: '/system/audit' },
      { icon: Award, label: '績效管理', path: '/system/performance' },
      { icon: Settings, label: '系統設定', path: '/system/settings' },
    ]
  },
  {
    label: 'AI 工具',
    items: [
      { icon: BookOpen, label: '說明中心', path: '/ai/help' },
      { icon: Bot, label: 'Agent 控制台', path: '/ai/agent' },
    ]
  },
]

export default function Sidebar() {
  const location = useLocation()
  const { profile, signOut } = useAuth()
  const [openMenus, setOpenMenus] = useState({ '/hr': true, '/process': true, '/org': true })

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
        <div className="sidebar-brand-icon">AI</div>
        <div className="sidebar-brand-text">
          <h1>SME Ops</h1>
          <span>Operations System</span>
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
                      <Icon className="nav-item-icon" />
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
                  <Icon className="nav-item-icon" />
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
        <div className="sidebar-lang-toggle">
          <Globe size={14} />
          <span>切換為 English</span>
        </div>
      </div>
    </aside>
  )
}
