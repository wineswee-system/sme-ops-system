import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users, GitBranch, Building2, HeadphonesIcon, Warehouse, Settings,
  Bot, LayoutDashboard, BarChart3, Sparkles, ArrowRight, ArrowLeft
} from 'lucide-react'

const systems = [
  {
    id: 'dashboard',
    title: '營運儀表板',
    subtitle: 'Operations Dashboard',
    description: '即時 KPI 數據總覽、出勤統計、任務進度追蹤，一目瞭然掌握全店營運狀況。',
    icon: LayoutDashboard,
    accent: 'var(--accent-cyan)',
    accentDim: 'var(--accent-cyan-dim)',
    glow: 'rgba(34, 211, 238, 0.2)',
    path: '/',
    features: ['KPI 總覽', '出勤統計', '任務追蹤', '流程監控'],
    moduleCount: 2,
  },
  {
    id: 'hr',
    title: '人事管理系統',
    subtitle: 'HR Management',
    description: '涵蓋考勤、請假、加班、薪資、排班、績效考核、招募等完整人事生命週期管理。',
    icon: Users,
    accent: 'var(--accent-blue)',
    accentDim: 'var(--accent-blue-dim)',
    glow: 'rgba(59, 130, 246, 0.2)',
    path: '/hr/report',
    features: ['考勤打卡', '請假管理', '薪資計算', '排班系統', '績效考核', '招募管理'],
    moduleCount: 15,
  },
  {
    id: 'process',
    title: '流程管理系統',
    subtitle: 'Process Management',
    description: '工作流程自動化、任務分派追蹤、SOP 標準作業程序管理，提升團隊協作效率。',
    icon: GitBranch,
    accent: 'var(--accent-purple)',
    accentDim: 'var(--accent-purple-dim)',
    glow: 'rgba(167, 139, 250, 0.2)',
    path: '/process/overview',
    features: ['工作流程', '任務管理', '檢核表', 'SOP 模板'],
    moduleCount: 5,
  },
  {
    id: 'org',
    title: '組織管理系統',
    subtitle: 'Organization Management',
    description: '多公司架構、門市據點、部門管理、員工目錄、LINE 整合，組織架構一覽無遺。',
    icon: Building2,
    accent: 'var(--accent-green)',
    accentDim: 'var(--accent-green-dim)',
    glow: 'rgba(52, 211, 153, 0.2)',
    path: '/org/overview',
    features: ['組織圖', '門市管理', '部門管理', 'LINE 整合'],
    moduleCount: 8,
  },
  {
    id: 'crm',
    title: '客戶關係管理',
    subtitle: 'CRM System',
    description: '客戶資料管理、銷售漏斗追蹤、行銷自動化、客服工單管理，驅動業績成長。',
    icon: HeadphonesIcon,
    accent: 'var(--accent-orange)',
    accentDim: 'var(--accent-orange-dim)',
    glow: 'rgba(251, 146, 60, 0.2)',
    path: '/crm/overview',
    features: ['客戶管理', '銷售管線', '行銷自動化', '客服系統'],
    moduleCount: 5,
  },
  {
    id: 'wms',
    title: '倉儲管理系統',
    subtitle: 'Warehouse Management',
    description: 'SKU 商品管理、入庫出庫作業、庫存即時追蹤、異常報表分析，精準掌控庫存。',
    icon: Warehouse,
    accent: 'var(--accent-yellow)',
    accentDim: 'var(--accent-yellow-dim)',
    glow: 'rgba(251, 191, 36, 0.2)',
    path: '/wms/overview',
    features: ['SKU 管理', '入庫管理', '庫存追蹤', '出庫管理'],
    moduleCount: 6,
  },
  {
    id: 'system',
    title: '系統管理',
    subtitle: 'System Administration',
    description: '使用者權限、自動觸發器、通知設定、稽核日誌、系統效能監控與全域設定。',
    icon: Settings,
    accent: 'var(--accent-red)',
    accentDim: 'var(--accent-red-dim)',
    glow: 'rgba(248, 113, 113, 0.2)',
    path: '/system/triggers',
    features: ['權限管理', '觸發器', '稽核日誌', '系統監控'],
    moduleCount: 6,
  },
  {
    id: 'ai',
    title: 'AI 智能工具',
    subtitle: 'AI Tools',
    description: 'AI 助理、智能客服 Agent、幫助中心，讓 AI 成為您的營運好幫手。',
    icon: Bot,
    accent: 'var(--accent-pink)',
    accentDim: 'var(--accent-pink-dim)',
    glow: 'rgba(244, 114, 182, 0.2)',
    path: '/ai/help',
    features: ['幫助中心', 'Agent 控制台'],
    moduleCount: 2,
  },
]

export default function DemoLanding() {
  const navigate = useNavigate()
  const [hoveredId, setHoveredId] = useState(null)

  const handleEnterSystem = (path) => {
    navigate(path)
  }

  return (
    <div style={styles.wrapper}>
      {/* Background decorations */}
      <div style={styles.bgOrb1} />
      <div style={styles.bgOrb2} />
      <div style={styles.bgOrb3} />

      <div style={styles.container}>
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          style={styles.backBtn}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--glass-strong)'; e.currentTarget.style.borderColor = 'var(--border-strong)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'var(--glass-medium)'; e.currentTarget.style.borderColor = 'var(--border-medium)' }}
        >
          <ArrowLeft size={16} />
          <span>返回儀表板</span>
        </button>

        {/* Header */}
        <header style={styles.header}>
          <div style={styles.badge}>
            <Sparkles size={14} />
            <span>SME Operations Platform</span>
          </div>
          <h1 style={styles.title}>
            中小企業<span style={styles.titleAccent}>智慧營運系統</span>
          </h1>
          <p style={styles.subtitle}>
            模組化設計，依照您的需求自由組合。點擊任一系統開始體驗。
          </p>
          <div style={styles.stats}>
            <div style={styles.statItem}>
              <span style={styles.statValue}>8</span>
              <span style={styles.statLabel}>大系統模組</span>
            </div>
            <div style={styles.statDivider} />
            <div style={styles.statItem}>
              <span style={styles.statValue}>52</span>
              <span style={styles.statLabel}>功能頁面</span>
            </div>
            <div style={styles.statDivider} />
            <div style={styles.statItem}>
              <span style={styles.statValue}>100%</span>
              <span style={styles.statLabel}>自由組合</span>
            </div>
          </div>
        </header>

        {/* System Cards Grid */}
        <div style={styles.grid}>
          {systems.map((sys) => {
            const Icon = sys.icon
            const isHovered = hoveredId === sys.id
            return (
              <div
                key={sys.id}
                style={{
                  ...styles.card,
                  borderColor: isHovered ? sys.accent : 'var(--border-subtle)',
                  boxShadow: isHovered ? `0 8px 40px ${sys.glow}, var(--shadow-lg)` : 'var(--shadow-md)',
                  transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
                }}
                onMouseEnter={() => setHoveredId(sys.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => handleEnterSystem(sys.path)}
              >
                {/* Card Header */}
                <div style={styles.cardHeader}>
                  <div style={{
                    ...styles.iconWrapper,
                    background: sys.accentDim,
                    color: sys.accent,
                    boxShadow: isHovered ? `0 0 20px ${sys.glow}` : 'none',
                  }}>
                    <Icon size={24} />
                  </div>
                  <div style={styles.moduleTag}>
                    <BarChart3 size={12} />
                    <span>{sys.moduleCount} 個模組</span>
                  </div>
                </div>

                {/* Card Body */}
                <h3 style={styles.cardTitle}>{sys.title}</h3>
                <p style={styles.cardSubtitle}>{sys.subtitle}</p>
                <p style={styles.cardDesc}>{sys.description}</p>

                {/* Features */}
                <div style={styles.features}>
                  {sys.features.map((f) => (
                    <span key={f} style={{
                      ...styles.featureTag,
                      background: sys.accentDim,
                      color: sys.accent,
                    }}>
                      {f}
                    </span>
                  ))}
                </div>

                {/* Card Footer */}
                <div style={{
                  ...styles.cardFooter,
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

        {/* Footer */}
        <footer style={styles.footer}>
          <p style={styles.footerText}>
            Powered by SME OPS Platform — 為中小企業量身打造的智慧營運解決方案
          </p>
        </footer>
      </div>
    </div>
  )
}

const styles = {
  wrapper: {
    minHeight: '100vh',
    background: 'var(--bg-primary)',
    position: 'relative',
    overflowX: 'hidden',
    overflowY: 'auto',
  },
  backBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    borderRadius: 'var(--radius-full)',
    background: 'var(--glass-medium)',
    border: '1px solid var(--border-medium)',
    color: 'var(--text-secondary)',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    marginBottom: '24px',
  },
  bgOrb1: {
    position: 'fixed',
    top: '-20%',
    right: '-10%',
    width: '600px',
    height: '600px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(34, 211, 238, 0.06) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  bgOrb2: {
    position: 'fixed',
    bottom: '-15%',
    left: '-10%',
    width: '500px',
    height: '500px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(167, 139, 250, 0.06) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  bgOrb3: {
    position: 'fixed',
    top: '40%',
    left: '50%',
    width: '400px',
    height: '400px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(59, 130, 246, 0.04) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  container: {
    position: 'relative',
    zIndex: 1,
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '48px 32px 32px',
  },
  header: {
    textAlign: 'center',
    marginBottom: '48px',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 16px',
    borderRadius: 'var(--radius-full)',
    background: 'var(--accent-cyan-dim)',
    color: 'var(--accent-cyan)',
    fontSize: '13px',
    fontWeight: 600,
    marginBottom: '20px',
    letterSpacing: '0.5px',
  },
  title: {
    fontSize: '40px',
    fontWeight: 800,
    color: 'var(--text-primary)',
    margin: '0 0 12px',
    lineHeight: 1.2,
    letterSpacing: '-0.5px',
  },
  titleAccent: {
    background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-blue))',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  subtitle: {
    fontSize: '16px',
    color: 'var(--text-secondary)',
    margin: '0 0 28px',
    maxWidth: '500px',
    marginLeft: 'auto',
    marginRight: 'auto',
    lineHeight: 1.6,
  },
  stats: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '24px',
    padding: '16px 32px',
    borderRadius: 'var(--radius-lg)',
    background: 'var(--glass-medium)',
    border: '1px solid var(--border-subtle)',
    backdropFilter: 'blur(12px)',
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2px',
  },
  statValue: {
    fontSize: '24px',
    fontWeight: 800,
    color: 'var(--accent-cyan)',
  },
  statLabel: {
    fontSize: '12px',
    color: 'var(--text-tertiary)',
    fontWeight: 500,
  },
  statDivider: {
    width: '1px',
    height: '32px',
    background: 'var(--border-medium)',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '20px',
    marginBottom: '48px',
  },
  card: {
    background: 'var(--bg-card)',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--border-subtle)',
    padding: '28px',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    backdropFilter: 'blur(12px)',
    display: 'flex',
    flexDirection: 'column',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '16px',
  },
  iconWrapper: {
    width: '48px',
    height: '48px',
    borderRadius: 'var(--radius-md)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'box-shadow 0.3s ease',
  },
  moduleTag: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '12px',
    color: 'var(--text-tertiary)',
    fontWeight: 500,
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: 700,
    color: 'var(--text-primary)',
    margin: '0 0 4px',
  },
  cardSubtitle: {
    fontSize: '12px',
    color: 'var(--text-tertiary)',
    margin: '0 0 12px',
    fontWeight: 500,
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
  },
  cardDesc: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    margin: '0 0 16px',
    lineHeight: 1.6,
    flex: 1,
  },
  features: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
    marginBottom: '16px',
  },
  featureTag: {
    padding: '3px 10px',
    borderRadius: 'var(--radius-full)',
    fontSize: '11px',
    fontWeight: 600,
  },
  cardFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '4px',
    fontSize: '13px',
    fontWeight: 600,
    transition: 'color 0.2s ease',
    paddingTop: '12px',
    borderTop: '1px solid var(--border-subtle)',
  },
  footer: {
    textAlign: 'center',
    paddingTop: '16px',
    borderTop: '1px solid var(--border-subtle)',
  },
  footerText: {
    fontSize: '13px',
    color: 'var(--text-muted)',
  },
}
