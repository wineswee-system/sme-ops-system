import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Sidebar from './components/Sidebar'
import OnboardingWizard from './components/OnboardingWizard'
import DemoLanding from './pages/DemoLanding'
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
import PortalLayout from './pages/portal/PortalLayout'
import PortalHome from './pages/portal/PortalHome'
import Suppliers from './pages/purchase/Suppliers'
import PurchaseRequests from './pages/purchase/PurchaseRequests'
import PurchaseOrders from './pages/purchase/PurchaseOrders'
import GoodsReceipts from './pages/purchase/GoodsReceipts'
import FinanceOverview from './pages/finance/Overview'
import JournalEntries from './pages/finance/JournalEntries'
import AccountsReceivable from './pages/finance/AccountsReceivable'
import AccountsPayable from './pages/finance/AccountsPayable'
import BOM from './pages/manufacturing/BOM'
import MRP from './pages/manufacturing/MRP'
import QualityInspection from './pages/manufacturing/QualityInspection'
import Contracts from './pages/purchase/Contracts'
import Budgets from './pages/finance/Budgets'
import BankReconciliation from './pages/finance/BankReconciliation'
import ManufacturingOrders from './pages/manufacturing/ManufacturingOrders'
import Lots from './pages/wms/Lots'
import StockCount from './pages/wms/StockCount'
import Quotations from './pages/sales/Quotations'
import SalesOrders from './pages/sales/SalesOrders'
import Promotions from './pages/sales/Promotions'
import Returns from './pages/sales/Returns'
import POSTerminal from './pages/pos/POSTerminal'
import POSShifts from './pages/pos/POSShifts'
import Shipments from './pages/sales/Shipments'
import Members from './pages/crm/Members'
import Invoices from './pages/finance/Invoices'
import SalesForecast from './pages/analytics/SalesForecast'

function AdminApp() {
  const [showOnboarding, setShowOnboarding] = useState(() => !localStorage.getItem('sme_onboarded'))

  return (
    <div className="app-layout">
      {showOnboarding && <OnboardingWizard onComplete={() => setShowOnboarding(false)} />}
      <Sidebar />
      <main className="main-content">
        <div className="page-container">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/analytics/forecast" element={<SalesForecast />} />
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
            <Route path="/crm/members" element={<Members />} />
            {/* WMS */}
            <Route path="/wms/overview" element={<WMSOverview />} />
            <Route path="/wms/skus" element={<SKUs />} />
            <Route path="/wms/inbound" element={<Inbound />} />
            <Route path="/wms/inventory" element={<Inventory />} />
            <Route path="/wms/outbound" element={<Outbound />} />
            <Route path="/wms/reports" element={<WMSReports />} />
            <Route path="/wms/lots" element={<Lots />} />
            <Route path="/wms/stock-count" element={<StockCount />} />
            {/* Sales */}
            <Route path="/sales/quotations" element={<Quotations />} />
            <Route path="/sales/orders" element={<SalesOrders />} />
            <Route path="/sales/promotions" element={<Promotions />} />
            <Route path="/sales/returns" element={<Returns />} />
            <Route path="/sales/shipments" element={<Shipments />} />
            {/* POS */}
            <Route path="/pos/terminal" element={<POSTerminal />} />
            <Route path="/pos/shifts" element={<POSShifts />} />
            {/* Purchase */}
            <Route path="/purchase/suppliers" element={<Suppliers />} />
            <Route path="/purchase/requests" element={<PurchaseRequests />} />
            <Route path="/purchase/orders" element={<PurchaseOrders />} />
            <Route path="/purchase/receipts" element={<GoodsReceipts />} />
            <Route path="/purchase/contracts" element={<Contracts />} />
            {/* Finance */}
            <Route path="/finance/overview" element={<FinanceOverview />} />
            <Route path="/finance/journal" element={<JournalEntries />} />
            <Route path="/finance/ar" element={<AccountsReceivable />} />
            <Route path="/finance/ap" element={<AccountsPayable />} />
            <Route path="/finance/budgets" element={<Budgets />} />
            <Route path="/finance/bank" element={<BankReconciliation />} />
            <Route path="/finance/invoices" element={<Invoices />} />
            {/* Manufacturing & QM */}
            <Route path="/manufacturing/bom" element={<BOM />} />
            <Route path="/manufacturing/mrp" element={<MRP />} />
            <Route path="/manufacturing/qm" element={<QualityInspection />} />
            <Route path="/manufacturing/orders" element={<ManufacturingOrders />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/demo" element={<DemoLanding />} />
        <Route path="/portal" element={<PortalLayout />}>
          <Route index element={<PortalHome />} />
        </Route>
        <Route path="/*" element={<AdminApp />} />
      </Routes>
    </AuthProvider>
  )
}
