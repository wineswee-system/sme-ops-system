-- ============================================================
-- Consolidate to single LINE channel: make 'workflow' the default.
--
-- Previously the 'default' placeholder row (no channel_id / liff_id)
-- was is_default=true, so resolveChannel() in the webhook fell back
-- to a row with no credentials. Now that 'workflow' is the only
-- real channel, promote it and deactivate the placeholder.
-- ============================================================

BEGIN;

-- 1. Demote any existing defaults (only one row may have is_default=true
--    in practice, but the column has no partial-unique index, so be safe).
UPDATE public.line_channels
SET is_default = false
WHERE is_default = true;

-- 2. Promote 'workflow' as the new default.
UPDATE public.line_channels
SET is_default = true,
    status     = 'active',
    updated_at = now()
WHERE code = 'workflow';

-- 3. Deactivate the stale 'default' placeholder so resolveChannel()
--    won't pick it up as a fallback.
UPDATE public.line_channels
SET status = 'inactive',
    updated_at = now()
WHERE code = 'default';

COMMIT;
