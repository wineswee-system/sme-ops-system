import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Login from './pages/Login'
import Demo from './pages/Demo'
import PortalLayout from './pages/portal/PortalLayout'
import PortalHome from './pages/portal/PortalHome'
import Clock from './pages/portal/Clock'
import MyLeave from './pages/portal/MyLeave'
import MyExpenses from './pages/portal/MyExpenses'
import MyTravel from './pages/portal/MyTravel'
import MyPerformance from './pages/portal/MyPerformance'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Analytics from './pages/Analytics'
import HRReport from './pages/hr/HRReport'
import Attendance from './pages/hr/Attendance'
import Leave from './pages/hr/Leave'
import Overtime from './pages/hr/Overtime'
import Salary from './pages/hr/Salary'
import Schedule from './pages/hr/Schedule'
import Holidays from './pages/hr/Holidays'
import ScheduleRules from './pages/hr/ScheduleRules'
import Performance from './pages/hr/Performance'
import Recruitment from './pages/hr/Recruitment'
import Documents from './pages/hr/Documents'
import Transfer from './pages/hr/Transfer'
import Bonus from './pages/hr/Bonus'
import BusinessTravel from './pages/hr/BusinessTravel'
import Expenses from './pages/hr/Expenses'
import ProcessOverview from './pages/process/Overview'
import Workflows from './pages/process/Workflows'
import Tasks from './pages/process/Tasks'
import Checklists from './pages/process/Checklists'
import SOPTemplates from './pages/process/SOPTemplates'
import OrgOverview from './pages/org/Overview'
import OrgChart from './pages/org/OrgChart'
import Companies from './pages/org/Companies'
import Locations from './pages/org/Locations'
import Departments from './pages/org/Departments'
import Employees from './pages/org/Employees'
import LineIntegration from './pages/org/LineIntegration'
import Templates from './pages/org/Templates'
import Triggers from './pages/system/Triggers'
import Notifications from './pages/system/Notifications'
import Users from './pages/system/Users'
import AuditLog from './pages/system/AuditLog'
import PerformanceMgmt from './pages/system/PerformanceMgmt'
import SystemSettings from './pages/system/Settings'
import HelpCenter from './pages/ai/HelpCenter'
import AgentConsole from './pages/ai/AgentConsole'
import CRMOverview from './pages/crm/Overview'
import Customers from './pages/crm/Customers'
import Pipeline from './pages/crm/Pipeline'
import CRMMarketing from './pages/crm/Marketing'
import CRMService from './pages/crm/Service'
import WMSOverview from './pages/wms/Overview'
import SKUs from './pages/wms/SKUs'
import Inbound from './pages/wms/Inbound'
import Inventory from './pages/wms/Inventory'
import Outbound from './pages/wms/Outbound'
import WMSReports from './pages/wms/Reports'

function AdminApp() {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-container">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/analytics" element={<Analytics />} />
            {/* HR */}
            <Route path="/hr/report" element={<HRReport />} />
            <Route path="/hr/attendance" element={<Attendance />} />
            <Route path="/hr/leave" element={<Leave />} />
            <Route path="/hr/overtime" element={<Overtime />} />
            <Route path="/hr/salary" element={<Salary />} />
            <Route path="/hr/schedule" element={<Schedule />} />
            <Route path="/hr/holidays" element={<Holidays />} />
            <Route path="/hr/schedule-rules" element={<ScheduleRules />} />
            <Route path="/hr/performance" element={<Performance />} />
            <Route path="/hr/recruitment" element={<Recruitment />} />
            <Route path="/hr/documents" element={<Documents />} />
            <Route path="/hr/transfer" element={<Transfer />} />
            <Route path="/hr/travel" element={<BusinessTravel />} />
            <Route path="/hr/expenses" element={<Expenses />} />
            <Route path="/hr/bonus" element={<Bonus />} />
            {/* Process */}
            <Route path="/process/overview" element={<ProcessOverview />} />
            <Route path="/process/workflows" element={<Workflows />} />
            <Route path="/process/tasks" element={<Tasks />} />
            <Route path="/process/checklists" element={<Checklists />} />
            <Route path="/process/sop" element={<SOPTemplates />} />
            {/* Organization */}
            <Route path="/org/overview" element={<OrgOverview />} />
            <Route path="/org/chart" element={<OrgChart />} />
            <Route path="/org/companies" element={<Companies />} />
            <Route path="/org/locations" element={<Locations />} />
            <Route path="/org/departments" element={<Departments />} />
            <Route path="/org/employees" element={<Employees />} />
            <Route path="/org/line" element={<LineIntegration />} />
            <Route path="/org/templates" element={<Templates />} />
            {/* System */}
            <Route path="/system/triggers" element={<Triggers />} />
            <Route path="/system/notifications" element={<Notifications />} />
            <Route path="/system/users" element={<Users />} />
            <Route path="/system/audit" element={<AuditLog />} />
            <Route path="/system/performance" element={<PerformanceMgmt />} />
            <Route path="/system/settings" element={<SystemSettings />} />
            {/* AI */}
            <Route path="/ai/help" element={<HelpCenter />} />
            <Route path="/ai/agent" element={<AgentConsole />} />
            {/* CRM */}
            <Route path="/crm/overview" element={<CRMOverview />} />
            <Route path="/crm/customers" element={<Customers />} />
            <Route path="/crm/pipeline" element={<Pipeline />} />
            <Route path="/crm/marketing" element={<CRMMarketing />} />
            <Route path="/crm/service" element={<CRMService />} />
            {/* WMS */}
            <Route path="/wms/overview" element={<WMSOverview />} />
            <Route path="/wms/skus" element={<SKUs />} />
            <Route path="/wms/inbound" element={<Inbound />} />
            <Route path="/wms/inventory" element={<Inventory />} />
            <Route path="/wms/outbound" element={<Outbound />} />
            <Route path="/wms/reports" element={<WMSReports />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  )
}

function AppRoutes() {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
        <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>載入中...</div>
      </div>
    )
  }

  if (!user) return (
    <Routes>
      <Route path="/demo" element={<Demo />} />
      <Route path="*" element={<Login />} />
    </Routes>
  )

  if (profile?.role === 'admin') {
    return <AdminApp />
  }

  // Employee portal
  return (
    <Routes>
      <Route path="/portal" element={<PortalLayout />}>
        <Route index element={<PortalHome />} />
        <Route path="clock" element={<Clock />} />
        <Route path="leave" element={<MyLeave />} />
        <Route path="expenses" element={<MyExpenses />} />
        <Route path="travel" element={<MyTravel />} />
        <Route path="performance" element={<MyPerformance />} />
      </Route>
      <Route path="*" element={<Navigate to="/portal" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
