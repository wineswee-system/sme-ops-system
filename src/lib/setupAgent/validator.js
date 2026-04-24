/**
 * Response-envelope validator.
 *
 * Hard-stops the LLM output before the interpreter applies any state change.
 * Returns { ok, envelope?, errors[] }.
 */

import {
  ACTION_TYPES,
  ALLOWED_TASK_FIELDS,
  ALLOWED_PROJECT_FIELDS,
  PRIORITIES,
  DATE_RE,
  LIMITS,
} from './constants'

function isObj(v) { return v && typeof v === 'object' && !Array.isArray(v) }

export function validateEnvelope(raw) {
  const errors = []
  if (!isObj(raw)) return { ok: false, errors: ['envelope is not an object'] }

  const env = {
    phase: typeof raw.phase === 'string' ? raw.phase : 'intake',
    focus: isObj(raw.focus) ? raw.focus : { taskId: null },
    say: Array.isArray(raw.say) ? raw.say : [],
    actions: Array.isArray(raw.actions) ? raw.actions : [],
    suggestions: Array.isArray(raw.suggestions) ? raw.suggestions : [],
    needs_user_input: raw.needs_user_input !== false,
  }

  env.say = env.say.filter((s) => {
    if (!isObj(s) || typeof s.content !== 'string') return false
    if (s.type !== 'text' && s.type !== 'question') s.type = 'text'
    return true
  })

  env.suggestions = env.suggestions.filter((s) => isObj(s) && typeof s.label === 'string')

  const validActions = []
  for (const a of env.actions) {
    const r = validateAction(a)
    if (r.ok) validActions.push(r.action)
    else errors.push(`dropped action ${a?.type || '?'}: ${r.reason}`)
  }
  env.actions = validActions

  return { ok: true, envelope: env, errors }
}

export function validateAction(a) {
  if (!isObj(a)) return { ok: false, reason: 'not an object' }
  if (!ACTION_TYPES.includes(a.type)) return { ok: false, reason: 'unknown action type' }

  switch (a.type) {
    case 'set_project_field': {
      if (!ALLOWED_PROJECT_FIELDS.includes(a.field)) return { ok: false, reason: 'field not allowed' }
      if (a.field === 'priority' && a.value && !PRIORITIES.includes(a.value)) return { ok: false, reason: 'invalid priority' }
      if ((a.field === 'start_date' || a.field === 'end_date') && a.value && !DATE_RE.test(a.value))
        return { ok: false, reason: 'date must be YYYY-MM-DD' }
      return { ok: true, action: a }
    }
    case 'insert_task': {
      if (typeof a.position !== 'number' || a.position < 0) return { ok: false, reason: 'invalid position' }
      if (!isObj(a.task)) return { ok: false, reason: 'task missing' }
      return { ok: true, action: a }
    }
    case 'remove_task':
    case 'pause_task':
    case 'resume_task':
    case 'rename_task':
      if (typeof a.taskId !== 'string') return { ok: false, reason: 'taskId missing' }
      if (a.type === 'rename_task' && typeof a.title !== 'string') return { ok: false, reason: 'title missing' }
      return { ok: true, action: a }
    case 'reorder_tasks':
      if (!Array.isArray(a.order)) return { ok: false, reason: 'order missing' }
      return { ok: true, action: a }
    case 'update_task_field': {
      if (typeof a.taskId !== 'string') return { ok: false, reason: 'taskId missing' }
      if (!ALLOWED_TASK_FIELDS.includes(a.field)) return { ok: false, reason: 'field not allowed' }
      if (a.field === 'priority' && a.value && !PRIORITIES.includes(a.value)) return { ok: false, reason: 'invalid priority' }
      if (a.field === 'due_date' && a.value && !DATE_RE.test(a.value)) return { ok: false, reason: 'date must be YYYY-MM-DD' }
      return { ok: true, action: a }
    }
    case 'propose_template':
    case 'apply_template':
      if (a.templateId == null) return { ok: false, reason: 'templateId missing' }
      return { ok: true, action: a }
    case 'attach_checklist':
      if (typeof a.taskId !== 'string') return { ok: false, reason: 'taskId missing' }
      if (a.checklistId == null) return { ok: false, reason: 'checklistId missing' }
      return { ok: true, action: a }
    case 'define_checklist': {
      if (!isObj(a.checklist)) return { ok: false, reason: 'checklist missing' }
      const items = a.checklist.items || []
      if (items.length > LIMITS.MAX_CHECKLIST_ITEMS_PER_TASK)
        return { ok: false, reason: 'too many items' }
      return { ok: true, action: a }
    }
    case 'attach_approval_chain':
      if (typeof a.taskId !== 'string') return { ok: false, reason: 'taskId missing' }
      if (a.chainId == null) return { ok: false, reason: 'chainId missing' }
      return { ok: true, action: a }
    case 'define_approval_chain': {
      if (!isObj(a.chain)) return { ok: false, reason: 'chain missing' }
      const steps = a.chain.steps || []
      if (steps.length > LIMITS.MAX_APPROVAL_STEPS) return { ok: false, reason: 'too many steps' }
      return { ok: true, action: a }
    }
    case 'set_dependency':
    case 'remove_dependency':
      if (typeof a.taskId !== 'string' || typeof a.dependsOnTaskId !== 'string')
        return { ok: false, reason: 'missing taskId or dependsOnTaskId' }
      return { ok: true, action: a }
    case 'reference_attachment':
      if (typeof a.fileId !== 'string') return { ok: false, reason: 'fileId missing' }
      return { ok: true, action: a }
    case 'prompt_template_persistence':
      if (a.scope !== 'sop' && a.scope !== 'approval_chain') return { ok: false, reason: 'invalid scope' }
      return { ok: true, action: a }
    case 'request_preview_refresh':
    case 'finalize_ready':
    case 'update_draft':
      return { ok: true, action: a }
    default:
      return { ok: false, reason: 'unhandled action type' }
  }
}

/**
 * Validates the final draft before commit. Covers server-side contract:
 * required fields, referential integrity against the injected context,
 * no circular dependencies, size caps.
 */
export function validateDraftForCommit(draft, ctx = {}) {
  const errors = []
  if (!draft.project?.name?.trim()) errors.push('專案名稱為必填')
  if (!draft.project?.owner_id && !draft.project?.owner_label) errors.push('請指定專案負責人')
  if (!draft.tasks?.length) errors.push('至少需要一個任務')
  if (draft.tasks.length > LIMITS.MAX_TASKS) errors.push(`任務數超過上限 ${LIMITS.MAX_TASKS}`)

  const taskIds = new Set(draft.tasks.map(t => t.id))
  for (const t of draft.tasks) {
    if (!t.title?.trim()) errors.push(`任務「${t.id}」缺少標題`)
    for (const dep of t.dependencies || []) {
      if (!taskIds.has(dep)) errors.push(`任務「${t.title}」的依賴指向不存在的任務`)
    }
    if (t.assignee_id && ctx.employees && !ctx.employees.some(e => String(e.id) === String(t.assignee_id))) {
      errors.push(`任務「${t.title}」指派的員工不存在`)
    }
    if (t.checklist_id && ctx.checklists && !ctx.checklists.some(c => String(c.id) === String(t.checklist_id))) {
      errors.push(`任務「${t.title}」附加的檢核清單不存在`)
    }
    if (t.approval_chain_id && ctx.approvalChains && !ctx.approvalChains.some(c => String(c.id) === String(t.approval_chain_id))) {
      errors.push(`任務「${t.title}」附加的簽核流程不存在`)
    }
  }

  if (hasCycle(draft.tasks)) errors.push('任務依賴存在循環')

  return { ok: errors.length === 0, errors }
}

function hasCycle(tasks) {
  const graph = new Map(tasks.map(t => [t.id, t.dependencies || []]))
  const WHITE = 0, GRAY = 1, BLACK = 2
  const color = new Map()
  for (const id of graph.keys()) color.set(id, WHITE)
  const visit = (id) => {
    color.set(id, GRAY)
    for (const dep of graph.get(id) || []) {
      if (!graph.has(dep)) continue
      if (color.get(dep) === GRAY) return true
      if (color.get(dep) === WHITE && visit(dep)) return true
    }
    color.set(id, BLACK)
    return false
  }
  for (const id of graph.keys()) {
    if (color.get(id) === WHITE && visit(id)) return true
  }
  return false
}
