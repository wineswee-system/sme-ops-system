/**
 * Setup Agent — constants, enums, and action whitelist.
 *
 * Scope: conversational project + workflow + task + 簽核 + checklist setup.
 * Guardrails enforced here are the authoritative list the interpreter uses.
 */

export const PHASES = ['intake', 'outline', 'authoring', 'review', 'commit']

export const PRIORITIES = ['高', '中', '低']

export const TASK_STATUS_DEFAULT = 'pending'

// Whitelist of action types the LLM can emit.
// Any action outside this set is dropped by the interpreter.
export const ACTION_TYPES = [
  'update_draft',
  'set_project_field',
  'insert_task',
  'remove_task',
  'rename_task',
  'reorder_tasks',
  'update_task_field',
  'pause_task',
  'resume_task',
  'propose_template',
  'apply_template',
  'attach_checklist',
  'define_checklist',
  'attach_approval_chain',
  'define_approval_chain',
  'set_dependency',
  'remove_dependency',
  'reference_attachment',
  'prompt_template_persistence',
  'request_preview_refresh',
  'finalize_ready',
]

// Fields on a task that update_task_field can write.
export const ALLOWED_TASK_FIELDS = [
  'title', 'description', 'assignee_id', 'assignee_label',
  'role', 'department', 'due_date', 'priority',
  'checklist_id', 'approval_chain_id',
  'notes', 'source_attachment_id',
]

// Fields on the project object the agent may set.
export const ALLOWED_PROJECT_FIELDS = [
  'name', 'description', 'owner_id', 'owner_label',
  'department', 'store', 'start_date', 'end_date',
  'budget', 'priority', 'tags',
]

// Size limits (guardrails #2 max-counts).
export const LIMITS = {
  MAX_TASKS: 50,
  MAX_CHECKLIST_ITEMS_PER_TASK: 20,
  MAX_APPROVAL_STEPS: 10,
  MAX_TURNS_PER_SESSION: 30,
  MAX_ATTACHMENTS_PER_TURN: 5,
  MAX_ATTACHMENT_BYTES_TOTAL: 20 * 1024 * 1024,
  MAX_ATTACHMENT_BYTES_EACH: 10 * 1024 * 1024,
}

export const ACCEPTED_MIME = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/csv',
  'text/plain',
  'text/markdown',
  'image/png',
  'image/jpeg',
  'image/webp',
]

// Default authoring question order per task.
export const STEP_AUTHORING_FIELDS = [
  'title', 'description', 'assignee', 'due_date',
  'priority', 'checklist', 'dependencies', 'approval_chain',
]

// Date regex for Gregorian YYYY-MM-DD.
export const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
