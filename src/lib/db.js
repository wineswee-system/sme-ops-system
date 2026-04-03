import { supabase } from './supabase'

// ── Employees ──────────────────────────────────────────────
export const getEmployees = () =>
  supabase.from('employees').select('*').order('id')

export const createEmployee = (data) =>
  supabase.from('employees').insert(data).select().single()

export const updateEmployee = (id, data) =>
  supabase.from('employees').update(data).eq('id', id).select().single()

export const deleteEmployee = (id) =>
  supabase.from('employees').delete().eq('id', id)

// ── Attendance ─────────────────────────────────────────────
export const getAttendance = (date) => {
  const q = supabase.from('attendance_records').select('*').order('id')
  return date ? q.eq('date', date) : q
}

export const upsertAttendance = (data) =>
  supabase.from('attendance_records').upsert(data).select().single()

// ── Leave Requests ─────────────────────────────────────────
export const getLeaveRequests = () =>
  supabase.from('leave_requests').select('*').order('id')

export const createLeaveRequest = (data) =>
  supabase.from('leave_requests').insert(data).select().single()

export const updateLeaveStatus = (id, status, approver) =>
  supabase.from('leave_requests').update({ status, approver }).eq('id', id).select().single()

export const deleteLeaveRequest = (id) =>
  supabase.from('leave_requests').delete().eq('id', id)

// ── Overtime ───────────────────────────────────────────────
export const getOvertimeRequests = () =>
  supabase.from('overtime_requests').select('*').order('id')

export const createOvertimeRequest = (data) =>
  supabase.from('overtime_requests').insert(data).select().single()

export const updateOvertimeStatus = (id, status) =>
  supabase.from('overtime_requests').update({ status }).eq('id', id).select().single()

// ── Salary ─────────────────────────────────────────────────
export const getSalaryRecords = (month) => {
  const q = supabase.from('salary_records').select('*').order('id')
  return month ? q.eq('month', month) : q
}

export const upsertSalaryRecord = (data) =>
  supabase.from('salary_records').upsert(data).select().single()

// ── Schedule ───────────────────────────────────────────────
export const getScheduleData = () =>
  supabase.from('schedule_data').select('*').order('id')

export const updateSchedule = (id, data) =>
  supabase.from('schedule_data').update(data).eq('id', id).select().single()

// ── Holidays ───────────────────────────────────────────────
export const getHolidays = () =>
  supabase.from('holidays').select('*').order('date')

export const createHoliday = (data) =>
  supabase.from('holidays').insert(data).select().single()

export const deleteHoliday = (id) =>
  supabase.from('holidays').delete().eq('id', id)

// ── Performance Reviews ────────────────────────────────────
export const getPerformanceReviews = () =>
  supabase.from('performance_reviews').select('*').order('id')

export const updatePerformanceReview = (id, data) =>
  supabase.from('performance_reviews').update(data).eq('id', id).select().single()

// ── Recruitment ────────────────────────────────────────────
export const getRecruitmentJobs = () =>
  supabase.from('recruitment_jobs').select('*').order('id')

export const createRecruitmentJob = (data) =>
  supabase.from('recruitment_jobs').insert(data).select().single()

export const updateRecruitmentJob = (id, data) =>
  supabase.from('recruitment_jobs').update(data).eq('id', id).select().single()

export const deleteRecruitmentJob = (id) =>
  supabase.from('recruitment_jobs').delete().eq('id', id)

// ── Documents ──────────────────────────────────────────────
export const getDocuments = () =>
  supabase.from('documents').select('*').order('upload_date', { ascending: false })

export const createDocument = (data) =>
  supabase.from('documents').insert(data).select().single()

export const deleteDocument = (id) =>
  supabase.from('documents').delete().eq('id', id)

// ── Business Trips ─────────────────────────────────────────
export const getBusinessTrips = () =>
  supabase.from('business_trips').select('*').order('id')

export const createBusinessTrip = (data) =>
  supabase.from('business_trips').insert(data).select().single()

export const updateBusinessTripStatus = (id, status) =>
  supabase.from('business_trips').update({ status }).eq('id', id).select().single()

// ── Expenses ───────────────────────────────────────────────
export const getExpenses = () =>
  supabase.from('expenses').select('*').order('id')

export const createExpense = (data) =>
  supabase.from('expenses').insert(data).select().single()

export const updateExpenseStatus = (id, status) =>
  supabase.from('expenses').update({ status }).eq('id', id).select().single()

// ── Workflows ──────────────────────────────────────────────
export const getWorkflows = () =>
  supabase.from('workflows').select('*').order('id')

export const createWorkflow = (data) =>
  supabase.from('workflows').insert(data).select().single()

export const updateWorkflow = (id, data) =>
  supabase.from('workflows').update(data).eq('id', id).select().single()

// ── Tasks ──────────────────────────────────────────────────
export const getTasks = () =>
  supabase.from('tasks').select('*').order('id')

export const createTask = (data) =>
  supabase.from('tasks').insert(data).select().single()

export const updateTask = (id, data) =>
  supabase.from('tasks').update(data).eq('id', id).select().single()

export const deleteTask = (id) =>
  supabase.from('tasks').delete().eq('id', id)

// ── Checklists ─────────────────────────────────────────────
export const getChecklists = () =>
  supabase.from('checklists').select('*').order('id')

export const createChecklist = (data) =>
  supabase.from('checklists').insert(data).select().single()

export const updateChecklist = (id, data) =>
  supabase.from('checklists').update(data).eq('id', id).select().single()

// ── Organizations ──────────────────────────────────────────
export const getCompanies = () =>
  supabase.from('companies').select('*').order('id')

export const createCompany = (data) =>
  supabase.from('companies').insert(data).select().single()

export const getStores = () =>
  supabase.from('stores').select('*').order('id')

export const createStore = (data) =>
  supabase.from('stores').insert(data).select().single()

export const getDepartments = () =>
  supabase.from('departments').select('*').order('id')

export const createDepartment = (data) =>
  supabase.from('departments').insert(data).select().single()

// ── System ─────────────────────────────────────────────────
export const getTriggers = () =>
  supabase.from('triggers').select('*').order('id')

export const updateTrigger = (id, data) =>
  supabase.from('triggers').update(data).eq('id', id).select().single()

export const getNotifications = (userId) => {
  const q = supabase.from('notifications').select('*').order('created_at', { ascending: false })
  return userId ? q.eq('user_id', userId) : q
}

export const markNotificationRead = (id) =>
  supabase.from('notifications').update({ read: true }).eq('id', id)

export const markAllNotificationsRead = () =>
  supabase.from('notifications').update({ read: true }).eq('read', false)

export const getAuditLogs = () =>
  supabase.from('audit_logs').select('*').order('time', { ascending: false })

export const createAuditLog = (data) =>
  supabase.from('audit_logs').insert(data)

export const getKpiData = () =>
  supabase.from('kpi_data').select('*').order('id')

// ── Purchase Management ──
export const getSuppliers = () =>
  supabase.from('suppliers').select('*').order('id')
export const createSupplier = (data) =>
  supabase.from('suppliers').insert(data).select().single()
export const getPurchaseRequests = () =>
  supabase.from('purchase_requests').select('*').order('id', { ascending: false })
export const createPurchaseRequest = (data) =>
  supabase.from('purchase_requests').insert(data).select().single()
export const getPurchaseOrders = () =>
  supabase.from('purchase_orders').select('*').order('id', { ascending: false })
export const createPurchaseOrder = (data) =>
  supabase.from('purchase_orders').insert(data).select().single()
export const getGoodsReceipts = () =>
  supabase.from('goods_receipts').select('*').order('id', { ascending: false })
export const createGoodsReceipt = (data) =>
  supabase.from('goods_receipts').insert(data).select().single()

// ── Finance & Accounting ──
export const getAccounts = () =>
  supabase.from('accounts').select('*').order('code')
export const getJournalEntries = () =>
  supabase.from('journal_entries').select('*').order('id', { ascending: false })
export const getJournalLines = (entryId) =>
  supabase.from('journal_lines').select('*').eq('entry_id', entryId).order('id')
export const createJournalEntry = (data) =>
  supabase.from('journal_entries').insert(data).select().single()
export const createJournalLine = (data) =>
  supabase.from('journal_lines').insert(data).select().single()
export const getAccountsReceivable = () =>
  supabase.from('accounts_receivable').select('*').order('id', { ascending: false })
export const createAccountReceivable = (data) =>
  supabase.from('accounts_receivable').insert(data).select().single()
export const getAccountsPayable = () =>
  supabase.from('accounts_payable').select('*').order('id', { ascending: false })
export const createAccountPayable = (data) =>
  supabase.from('accounts_payable').insert(data).select().single()

// ── Manufacturing & QM ──
export const getBOMs = () =>
  supabase.from('bom').select('*').order('id')
export const createBOM = (data) =>
  supabase.from('bom').insert(data).select().single()
export const getMRPResults = () =>
  supabase.from('mrp_results').select('*').order('id', { ascending: false })
export const createMRPResult = (data) =>
  supabase.from('mrp_results').insert(data).select().single()
export const getQualityInspections = () =>
  supabase.from('quality_inspections').select('*').order('id', { ascending: false })
export const createQualityInspection = (data) =>
  supabase.from('quality_inspections').insert(data).select().single()

// ── Enterprise Features ──
export const getSupplierContracts = () =>
  supabase.from('supplier_contracts').select('*').order('id', { ascending: false })
export const createSupplierContract = (data) =>
  supabase.from('supplier_contracts').insert(data).select().single()
export const getBudgets = () =>
  supabase.from('budgets').select('*').order('id')
export const createBudget = (data) =>
  supabase.from('budgets').insert(data).select().single()
export const updateBudget = (id, data) =>
  supabase.from('budgets').update(data).eq('id', id).select().single()
export const getBankTransactions = () =>
  supabase.from('bank_transactions').select('*').order('transaction_date', { ascending: false })
export const getManufacturingOrders = () =>
  supabase.from('manufacturing_orders').select('*').order('id', { ascending: false })
export const createManufacturingOrder = (data) =>
  supabase.from('manufacturing_orders').insert(data).select().single()
export const updateManufacturingOrder = (id, data) =>
  supabase.from('manufacturing_orders').update(data).eq('id', id).select().single()
export const getInventoryLots = () =>
  supabase.from('inventory_lots').select('*').order('id', { ascending: false })
export const getStockCounts = () =>
  supabase.from('stock_counts').select('*').order('id', { ascending: false })
export const createStockCount = (data) =>
  supabase.from('stock_counts').insert(data).select().single()
export const getInsuranceSettings = () =>
  supabase.from('insurance_settings').select('*').order('id')

// ── Sales & POS ──
export const getQuotations = () =>
  supabase.from('quotations').select('*').order('id', { ascending: false })
export const createQuotation = (data) =>
  supabase.from('quotations').insert(data).select().single()
export const updateQuotation = (id, data) =>
  supabase.from('quotations').update(data).eq('id', id).select().single()
export const getSalesOrders = () =>
  supabase.from('sales_orders').select('*').order('id', { ascending: false })
export const createSalesOrder = (data) =>
  supabase.from('sales_orders').insert(data).select().single()
export const getPromotions = () =>
  supabase.from('promotions').select('*').order('id', { ascending: false })
export const createPromotion = (data) =>
  supabase.from('promotions').insert(data).select().single()
export const getPOSTransactions = () =>
  supabase.from('pos_transactions').select('*').order('id', { ascending: false })
export const createPOSTransaction = (data) =>
  supabase.from('pos_transactions').insert(data).select().single()
export const getPOSShifts = () =>
  supabase.from('pos_shifts').select('*').order('id', { ascending: false })
export const createPOSShift = (data) =>
  supabase.from('pos_shifts').insert(data).select().single()
export const getReturns = () =>
  supabase.from('returns').select('*').order('id', { ascending: false })
export const createReturn = (data) =>
  supabase.from('returns').insert(data).select().single()
