/**
 * Interpreter — applies LLM-emitted actions to the SetupDraft.
 *
 * Pure reducer: (draft, envelope) → { draft, appliedActions, rejectedActions, messages }
 * Every mutation goes through here. No DB writes.
 */

import { createTaskStub, genId } from './draft'
import { validateEnvelope } from './validator'

export function interpretResponse(draft, rawEnvelope, ctx = {}) {
  const { ok, envelope, errors } = validateEnvelope(rawEnvelope)
  if (!ok) {
    return {
      draft,
      appliedActions: [],
      rejectedActions: [{ reason: 'envelope invalid', errors }],
      messages: [{ role: 'system', type: 'text', content: '系統收到回應格式有誤，請再試一次。' }],
      suggestions: [],
      needsUserInput: true,
    }
  }

  let d = { ...draft, tasks: [...draft.tasks] }
  const applied = []
  const rejected = errors.map((e) => ({ reason: e }))

  if (envelope.phase) d.phase = envelope.phase
  if (envelope.focus?.taskId !== undefined) d.currentTaskId = envelope.focus.taskId

  for (const action of envelope.actions) {
    const r = applyAction(d, action, ctx)
    if (r.ok) { d = r.draft; applied.push({ ...action, at: new Date().toISOString() }) }
    else rejected.push({ action, reason: r.reason })
  }

  const messages = envelope.say.map((s) => ({
    role: 'assistant',
    type: s.type,
    content: s.content,
    field: s.field,
    at: new Date().toISOString(),
  }))

  d.messages = [...(d.messages || []), ...messages]
  d.actionsLog = [...(d.actionsLog || []), ...applied]
  d.rejectedActionsLog = [...(d.rejectedActionsLog || []), ...rejected]
  d.turns = (d.turns || 0) + 1

  return {
    draft: d,
    appliedActions: applied,
    rejectedActions: rejected,
    messages,
    suggestions: envelope.suggestions,
    needsUserInput: envelope.needs_user_input,
  }
}

function applyAction(d, a, ctx) {
  switch (a.type) {
    case 'set_project_field': {
      const project = { ...d.project, [a.field]: a.value }
      if (a.field === 'owner_id' && a.value && ctx.employees) {
        const emp = ctx.employees.find((e) => String(e.id) === String(a.value))
        if (emp) project.owner_label = emp.name
      }
      return { ok: true, draft: { ...d, project } }
    }
    case 'insert_task': {
      const stub = createTaskStub(a.position)
      const task = { ...stub, ...a.task, id: stub.id, position: a.position }
      const tasks = [...d.tasks]
      tasks.splice(a.position, 0, task)
      return { ok: true, draft: { ...d, tasks: reindex(tasks), currentTaskId: task.id } }
    }
    case 'remove_task': {
      const tasks = d.tasks.filter((t) => t.id !== a.taskId)
      return { ok: true, draft: { ...d, tasks: reindex(tasks) } }
    }
    case 'rename_task': {
      const tasks = d.tasks.map((t) => t.id === a.taskId ? { ...t, title: a.title } : t)
      return { ok: true, draft: { ...d, tasks } }
    }
    case 'reorder_tasks': {
      const byId = new Map(d.tasks.map((t) => [t.id, t]))
      const tasks = a.order.map((id) => byId.get(id)).filter(Boolean)
      for (const t of d.tasks) if (!a.order.includes(t.id)) tasks.push(t)
      return { ok: true, draft: { ...d, tasks: reindex(tasks) } }
    }
    case 'update_task_field': {
      const tasks = d.tasks.map((t) => {
        if (t.id !== a.taskId) return t
        const next = { ...t, [a.field]: a.value }
        if (a.field === 'assignee_id' && a.value && ctx.employees) {
          const emp = ctx.employees.find((e) => String(e.id) === String(a.value))
          if (emp) next.assignee_label = emp.name
        }
        return next
      })
      return { ok: true, draft: { ...d, tasks } }
    }
    case 'pause_task': {
      const stack = [...(d.authoringStack || []), { taskId: a.taskId, at: new Date().toISOString() }]
      return { ok: true, draft: { ...d, authoringStack: stack } }
    }
    case 'resume_task': {
      const stack = [...(d.authoringStack || [])]
      stack.pop()
      return { ok: true, draft: { ...d, authoringStack: stack, currentTaskId: a.taskId } }
    }
    case 'apply_template': {
      return { ok: true, draft: { ...d, templateRef: { sopTemplateId: a.templateId } } }
    }
    case 'propose_template': {
      // advisory only, no state mutation beyond logging
      return { ok: true, draft: d }
    }
    case 'attach_checklist': {
      const tasks = d.tasks.map((t) => t.id === a.taskId ? { ...t, checklist_id: a.checklistId } : t)
      return { ok: true, draft: { ...d, tasks } }
    }
    case 'define_checklist': {
      const entry = { id: genId('cl'), ...a.checklist }
      return { ok: true, draft: { ...d, checklistsDraft: [...d.checklistsDraft, entry] } }
    }
    case 'attach_approval_chain': {
      const tasks = d.tasks.map((t) => t.id === a.taskId ? { ...t, approval_chain_id: a.chainId } : t)
      return { ok: true, draft: { ...d, tasks } }
    }
    case 'define_approval_chain': {
      const entry = { id: genId('ac'), ...a.chain }
      return { ok: true, draft: { ...d, approvalChainsDraft: [...d.approvalChainsDraft, entry] } }
    }
    case 'set_dependency': {
      const tasks = d.tasks.map((t) => {
        if (t.id !== a.taskId) return t
        const deps = new Set(t.dependencies || [])
        deps.add(a.dependsOnTaskId)
        return { ...t, dependencies: Array.from(deps) }
      })
      return { ok: true, draft: { ...d, tasks } }
    }
    case 'remove_dependency': {
      const tasks = d.tasks.map((t) => {
        if (t.id !== a.taskId) return t
        return { ...t, dependencies: (t.dependencies || []).filter((x) => x !== a.dependsOnTaskId) }
      })
      return { ok: true, draft: { ...d, tasks } }
    }
    case 'reference_attachment': {
      // annotate current task with source
      if (!d.currentTaskId) return { ok: true, draft: d }
      const tasks = d.tasks.map((t) => t.id === d.currentTaskId ? { ...t, source_attachment_id: a.fileId } : t)
      return { ok: true, draft: { ...d, tasks } }
    }
    case 'prompt_template_persistence': {
      return { ok: true, draft: { ...d, pendingPersistencePrompt: { scope: a.scope } } }
    }
    case 'request_preview_refresh':
      return { ok: true, draft: d }
    case 'finalize_ready':
      return { ok: true, draft: { ...d, phase: 'review' } }
    case 'update_draft':
      return { ok: true, draft: d }
    default:
      return { ok: false, reason: 'unhandled' }
  }
}

function reindex(tasks) {
  return tasks.map((t, i) => ({ ...t, position: i }))
}
