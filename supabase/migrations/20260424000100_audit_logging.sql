-- ============================================================
-- Full Audit Logging
-- Enhances the existing audit_logs table (created in init schema)
-- with JSONB snapshot columns, then installs a SECURITY DEFINER
-- trigger on 8 sensitive tables.
--
-- Every INSERT / UPDATE / DELETE writes one row to audit_logs
-- with the actor's email, role, org, and before/after JSON.
-- The trigger is SECURITY DEFINER so denials are always recorded
-- (bypasses RLS on the audit_logs table itself).
-- ============================================================

BEGIN;

-- ─── 1. Extend audit_logs with snapshot + actor columns ─────
-- Existing columns are preserved; new ones added if not present.

ALTER TABLE audit_logs
  ADD COLUMN IF NOT EXISTS old_data        JSONB,
  ADD COLUMN IF NOT EXISTS new_data        JSONB,
  ADD COLUMN IF NOT EXISTS user_email      TEXT,
  ADD COLUMN IF NOT EXISTS user_role       TEXT,
  ADD COLUMN IF NOT EXISTS organization_id INT REFERENCES organizations(id) ON DELETE SET NULL;

-- ─── 2. Additional indexes ───────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_audit_logs_email ON audit_logs(user_email);
CREATE INDEX IF NOT EXISTS idx_audit_logs_org   ON audit_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table ON audit_logs(target_table);

-- ─── 3. RLS on audit_logs ───────────────────────────────────
-- Only admins and super_admins may read audit records.
-- Writes come exclusively from the SECURITY DEFINER trigger.

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "audit_select" ON audit_logs;
CREATE POLICY "audit_select" ON audit_logs FOR SELECT USING (
  current_employee_role() IN ('admin', 'super_admin')
);

-- ─── 4. Trigger function ────────────────────────────────────

CREATE OR REPLACE FUNCTION audit_trigger_fn()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE
  v_email   TEXT;
  v_role    TEXT;
  v_org_id  INT;
  v_row_id  BIGINT;
  v_old     JSONB;
  v_new     JSONB;
BEGIN
  BEGIN v_email := auth.jwt()->>'email'; EXCEPTION WHEN OTHERS THEN v_email := NULL; END;
  BEGIN v_role  := current_employee_role(); EXCEPTION WHEN OTHERS THEN v_role  := NULL; END;

  IF TG_OP = 'DELETE' THEN
    v_old    := to_jsonb(OLD);
    v_row_id := NULLIF(v_old->>'id', '')::BIGINT;
    v_org_id := NULLIF(v_old->>'organization_id', '')::INT;
    INSERT INTO audit_logs("user", action, target_table, target_id, old_data, new_data, user_email, user_role, organization_id)
    VALUES (coalesce(v_email,'system'), TG_OP, TG_TABLE_NAME, v_row_id::INT, v_old, NULL, v_email, v_role, v_org_id);
    RETURN OLD;

  ELSIF TG_OP = 'INSERT' THEN
    v_new    := to_jsonb(NEW);
    v_row_id := NULLIF(v_new->>'id', '')::BIGINT;
    v_org_id := NULLIF(v_new->>'organization_id', '')::INT;
    INSERT INTO audit_logs("user", action, target_table, target_id, old_data, new_data, user_email, user_role, organization_id)
    VALUES (coalesce(v_email,'system'), TG_OP, TG_TABLE_NAME, v_row_id::INT, NULL, v_new, v_email, v_role, v_org_id);
    RETURN NEW;

  ELSE -- UPDATE
    v_old    := to_jsonb(OLD);
    v_new    := to_jsonb(NEW);
    v_row_id := NULLIF(v_new->>'id', '')::BIGINT;
    v_org_id := NULLIF(v_new->>'organization_id', '')::INT;
    INSERT INTO audit_logs("user", action, target_table, target_id, old_data, new_data, user_email, user_role, organization_id)
    VALUES (coalesce(v_email,'system'), TG_OP, TG_TABLE_NAME, v_row_id::INT, v_old, v_new, v_email, v_role, v_org_id);
    RETURN NEW;
  END IF;
END;
$$;

-- ─── 5. Install triggers on sensitive tables ─────────────────

DROP TRIGGER IF EXISTS audit_employees         ON employees;
DROP TRIGGER IF EXISTS audit_salary_records    ON salary_records;
DROP TRIGGER IF EXISTS audit_payroll_records   ON payroll_records;
DROP TRIGGER IF EXISTS audit_leave_requests    ON leave_requests;
DROP TRIGGER IF EXISTS audit_overtime_requests ON overtime_requests;
DROP TRIGGER IF EXISTS audit_roles             ON roles;
DROP TRIGGER IF EXISTS audit_permissions       ON permissions;
DROP TRIGGER IF EXISTS audit_role_permissions  ON role_permissions;

CREATE TRIGGER audit_employees
  AFTER INSERT OR UPDATE OR DELETE ON employees
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_fn();

CREATE TRIGGER audit_salary_records
  AFTER INSERT OR UPDATE OR DELETE ON salary_records
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_fn();

CREATE TRIGGER audit_payroll_records
  AFTER INSERT OR UPDATE OR DELETE ON payroll_records
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_fn();

CREATE TRIGGER audit_leave_requests
  AFTER INSERT OR UPDATE OR DELETE ON leave_requests
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_fn();

CREATE TRIGGER audit_overtime_requests
  AFTER INSERT OR UPDATE OR DELETE ON overtime_requests
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_fn();

CREATE TRIGGER audit_roles
  AFTER INSERT OR UPDATE OR DELETE ON roles
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_fn();

CREATE TRIGGER audit_permissions
  AFTER INSERT OR UPDATE OR DELETE ON permissions
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_fn();

CREATE TRIGGER audit_role_permissions
  AFTER INSERT OR UPDATE OR DELETE ON role_permissions
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_fn();

COMMIT;
