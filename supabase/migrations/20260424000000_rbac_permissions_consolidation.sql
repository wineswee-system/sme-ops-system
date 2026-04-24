-- ============================================================
-- RBAC Permissions Consolidation
-- Fixes two issues introduced by 20260417000007_rbac_5_roles.sql:
--   1. DELETE FROM role_permissions wiped all new operational
--      permissions assigned in 20260416100008_rbac_org_scoping.sql
--   2. admin.system permission code was added as a duplicate of
--      the canonical system.admin (original seed, ID 14)
--
-- This migration:
--   a. Removes the admin.system duplicate
--   b. Re-assigns lost operational permissions to admin and manager
--   c. Adds leave.request + org.read to office_staff and store_staff
--   d. Expands leave_requests and overtime_requests UPDATE policy
--      so managers can actually approve (RLS was blocking them)
-- ============================================================

BEGIN;

-- ─── 1. Remove admin.system duplicate ───────────────────────
-- Canonical code is system.admin (original seed ID 14).
-- admin.system was added in 20260416100008 but its role_permissions
-- link was wiped by the DELETE in 20260417000007 and never restored.

DELETE FROM role_permissions
  WHERE permission_id = (SELECT id FROM permissions WHERE code = 'admin.system');
DELETE FROM permissions WHERE code = 'admin.system';

-- ─── 2. Re-assign operational permissions to admin ──────────
-- Lost when 20260417000007 ran DELETE FROM role_permissions and only
-- restored IDs 1,2,3,4,5,6,14,15 (original seed subset).

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'admin'
  AND p.code IN (
    'org.read', 'org.write',
    'employee.read', 'employee.write',
    'schedule.read', 'schedule.write',
    'leave.request',
    'pos.operate', 'pos.refund',
    'finance.read', 'finance.write',
    'wms.read', 'wms.write',
    'crm.read', 'crm.write',
    'pr.approve', 'po.create',
    'inventory.edit',
    'customer.view_full', 'customer.edit',
    'report.view',
    'line.manage'
  )
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- ─── 3. Re-assign operational permissions to manager ────────

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'manager'
  AND p.code IN (
    'org.read',
    'employee.read', 'employee.write',
    'schedule.read', 'schedule.write',
    'leave.request',
    'pos.operate', 'pos.refund',
    'finance.read',
    'wms.read', 'wms.write',
    'crm.read', 'crm.write',
    'pr.approve',
    'report.view'
  )
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- ─── 4. Add leave.request + schedule.read to office_staff ───

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'office_staff'
  AND p.code IN ('org.read', 'leave.request', 'schedule.read', 'leave.approve')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- ─── 5. Add leave.request + org.read to store_staff ─────────

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'store_staff'
  AND p.code IN ('org.read', 'leave.request')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- ─── 6. Fix RLS: allow managers to approve leave_requests ───
-- The UPDATE policy in 20260421020000 only allowed admin/super_admin
-- or the employee themselves, blocking managers from approving.

DROP POLICY IF EXISTS "leave_update" ON leave_requests;

CREATE POLICY "leave_update" ON leave_requests FOR UPDATE USING (
  current_employee_role() IN ('admin', 'super_admin', 'manager')
  OR employee = (SELECT name FROM employees WHERE email = auth.jwt()->>'email' LIMIT 1)
);

-- ─── 7. Fix RLS: allow managers to approve overtime_requests ─

DROP POLICY IF EXISTS "overtime_update" ON overtime_requests;

CREATE POLICY "overtime_update" ON overtime_requests FOR UPDATE USING (
  current_employee_role() IN ('admin', 'super_admin', 'manager')
  OR employee = (SELECT name FROM employees WHERE email = auth.jwt()->>'email' LIMIT 1)
);

COMMIT;
