-- ================================================
-- RLS 補齊 — 角色制資料隔離
-- attendance_records, salary_records, leave_requests,
-- punch_corrections, overtime_requests
--
-- Uses current_employee_role() (defined in 20260418000005 /
-- 20260420020100). Admin = role IN ('admin', 'super_admin').
-- Employee self-match falls back to employees.email = auth.jwt email
-- for parity with other policies in this codebase.
-- ================================================

BEGIN;

-- ============ attendance_records ============
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_attendance ON attendance_records;
DROP POLICY IF EXISTS org_scope_select_attendance ON attendance_records;
DROP POLICY IF EXISTS org_scope_modify_attendance ON attendance_records;
DROP POLICY IF EXISTS org_scope_insert_attendance ON attendance_records;
DROP POLICY IF EXISTS org_scope_delete_attendance ON attendance_records;
DROP POLICY IF EXISTS "attendance_select" ON attendance_records;
DROP POLICY IF EXISTS "attendance_insert" ON attendance_records;
DROP POLICY IF EXISTS "attendance_update" ON attendance_records;
DROP POLICY IF EXISTS "attendance_delete" ON attendance_records;

CREATE POLICY "attendance_select" ON attendance_records FOR SELECT USING (
  current_employee_role() IN ('admin', 'super_admin')
  OR employee = (SELECT name FROM employees WHERE email = auth.jwt()->>'email' LIMIT 1)
);
CREATE POLICY "attendance_insert" ON attendance_records FOR INSERT WITH CHECK (true);
CREATE POLICY "attendance_update" ON attendance_records FOR UPDATE
  USING (current_employee_role() IN ('admin', 'super_admin'));
CREATE POLICY "attendance_delete" ON attendance_records FOR DELETE
  USING (current_employee_role() IN ('admin', 'super_admin'));

-- ============ salary_records ============
ALTER TABLE salary_records ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_salary_records ON salary_records;
DROP POLICY IF EXISTS org_scope_select_salary_records ON salary_records;
DROP POLICY IF EXISTS org_scope_modify_salary_records ON salary_records;
DROP POLICY IF EXISTS "salary_select" ON salary_records;
DROP POLICY IF EXISTS "salary_modify" ON salary_records;
DROP POLICY IF EXISTS "salary_update" ON salary_records;
DROP POLICY IF EXISTS "salary_delete" ON salary_records;

CREATE POLICY "salary_select" ON salary_records FOR SELECT USING (
  current_employee_role() IN ('admin', 'super_admin')
  OR employee = (SELECT name FROM employees WHERE email = auth.jwt()->>'email' LIMIT 1)
);
CREATE POLICY "salary_modify" ON salary_records FOR INSERT
  WITH CHECK (current_employee_role() IN ('admin', 'super_admin'));
CREATE POLICY "salary_update" ON salary_records FOR UPDATE
  USING (current_employee_role() IN ('admin', 'super_admin'));
CREATE POLICY "salary_delete" ON salary_records FOR DELETE
  USING (current_employee_role() IN ('admin', 'super_admin'));

-- ============ leave_requests ============
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_leave_requests ON leave_requests;
DROP POLICY IF EXISTS org_scope_select_leave_requests ON leave_requests;
DROP POLICY IF EXISTS "leave_select" ON leave_requests;
DROP POLICY IF EXISTS "leave_insert" ON leave_requests;
DROP POLICY IF EXISTS "leave_update" ON leave_requests;

CREATE POLICY "leave_select" ON leave_requests FOR SELECT USING (
  current_employee_role() IN ('admin', 'super_admin')
  OR employee = (SELECT name FROM employees WHERE email = auth.jwt()->>'email' LIMIT 1)
);
CREATE POLICY "leave_insert" ON leave_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "leave_update" ON leave_requests FOR UPDATE USING (
  current_employee_role() IN ('admin', 'super_admin')
  OR employee = (SELECT name FROM employees WHERE email = auth.jwt()->>'email' LIMIT 1)
);

-- ============ punch_corrections ============
ALTER TABLE punch_corrections ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_clock_corrections ON punch_corrections;
DROP POLICY IF EXISTS anon_punch_corrections ON punch_corrections;
DROP POLICY IF EXISTS "clock_corrections_select" ON punch_corrections;
DROP POLICY IF EXISTS "clock_corrections_insert" ON punch_corrections;
DROP POLICY IF EXISTS "clock_corrections_update" ON punch_corrections;

CREATE POLICY "clock_corrections_select" ON punch_corrections FOR SELECT USING (
  current_employee_role() IN ('admin', 'super_admin')
  OR employee = (SELECT name FROM employees WHERE email = auth.jwt()->>'email' LIMIT 1)
);
CREATE POLICY "clock_corrections_insert" ON punch_corrections FOR INSERT WITH CHECK (true);
CREATE POLICY "clock_corrections_update" ON punch_corrections FOR UPDATE
  USING (current_employee_role() IN ('admin', 'super_admin'));

-- ============ overtime_requests ============
ALTER TABLE overtime_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_overtime_requests ON overtime_requests;
DROP POLICY IF EXISTS "overtime_select" ON overtime_requests;
DROP POLICY IF EXISTS "overtime_insert" ON overtime_requests;
DROP POLICY IF EXISTS "overtime_update" ON overtime_requests;

CREATE POLICY "overtime_select" ON overtime_requests FOR SELECT USING (
  current_employee_role() IN ('admin', 'super_admin')
  OR employee = (SELECT name FROM employees WHERE email = auth.jwt()->>'email' LIMIT 1)
);
CREATE POLICY "overtime_insert" ON overtime_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "overtime_update" ON overtime_requests FOR UPDATE USING (
  current_employee_role() IN ('admin', 'super_admin')
  OR employee = (SELECT name FROM employees WHERE email = auth.jwt()->>'email' LIMIT 1)
);

COMMIT;
