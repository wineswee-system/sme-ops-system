/**
 * SetupDraft — in-memory representation of the project bundle the agent is
 * composing. Persisted to localStorage so page refresh doesn't lose work.
 */

import { TASK_STATUS_DEFAULT } from './constants'

const STORAGE_KEY = 'setupAgent.draft'

let _idCounter = 0
const genId = (prefix) => `${prefix}_${Date.now().toString(36)}_${(_idCounter++).toString(36)}`

export function createEmptyDraft(organizationId) {
  return {
    sessionId: genId('ses'),
    organizationId: organizationId || null,
    phase: 'intake',
    project: {
      name: '',
      description: '',
      owner_id: null,
      owner_label: '',
      department: '',
      store: '',
      start_date: '',
      end_date: '',
      budget: null,
      priority: '中',
      tags: [],
    },
    tasks: [],
    templateRef: null,           // { sopTemplateId } when an existing template applied
    templatePersistence: null,   // 'save' | 'one-off' | null
    templateDraft: null,         // { name, category, description } if save-as-template
    approvalChainsDraft: [],     // new chains defined during conversation
    checklistsDraft: [],         // new checklists defined during conversation
    authoringStack: [],          // LIFO stack of { taskId, lastField } for pause/resume
    currentTaskId: null,
    attachments: [],             // { fileId, name, mime, size, url, uploadedAt, extractedText }
    turns: 0,
    messages: [],                // chat transcript
    actionsLog: [],              // applied actions with timestamps
    rejectedActionsLog: [],      // rejected actions with reasons
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

export function createTaskStub(position) {
  return {
    id: genId('t'),
    position: position ?? 0,
    status: TASK_STATUS_DEFAULT,
    title: '',
    description: '',
    assignee_id: null,
    assignee_label: '',
    role: '',
    department: '',
    due_date: '',
    priority: '中',
    checklist_id: null,
    approval_chain_id: null,
    dependencies: [],
    notes: '',
    source_attachment_id: null,
  }
}

export function loadDraft() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function saveDraft(draft) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...draft, updatedAt: new Date().toISOString() }))
  } catch {
    // quota exceeded or private mode — fail quietly
  }
}

export function clearDraft() {
  try { localStorage.removeItem(STORAGE_KEY) } catch { /* noop */ }
}

export { genId }
