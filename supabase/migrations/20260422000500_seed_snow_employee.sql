-- ============================================================
-- Seed "Snow" employee and link to auth user astrops.psych@gmail.com
-- so that LINE /註冊 Snow matches the same identity used for web login.
--
-- cmdRegister queries employees by name/name_en ILIKE + status='在職',
-- but Snow was only present as mock UI data and free-text assignee
-- strings — never as an employees row. Web login works through
-- employees.auth_user_id / email mapping, which also had no Snow row.
-- ============================================================

BEGIN;

INSERT INTO public.employees
  (name, name_en, dept, position, store, status, email, join_date, role_id)
VALUES
  ('Snow', 'Snow', '總經理室', '主管', '台北總部', '在職',
   'astrops.psych@gmail.com', '2023-01-01', 2)
ON CONFLICT (email) DO UPDATE
  SET name    = EXCLUDED.name,
      name_en = EXCLUDED.name_en,
      status  = '在職';

UPDATE public.employees e
SET auth_user_id = u.id
FROM auth.users u
WHERE e.email = 'astrops.psych@gmail.com'
  AND u.email = 'astrops.psych@gmail.com'
  AND e.auth_user_id IS NULL;

COMMIT;
