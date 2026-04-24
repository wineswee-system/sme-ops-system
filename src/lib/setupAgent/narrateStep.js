/**
 * narrateStep — plain-language (繁體中文) natural description of a task
 * using template sentences. Deterministic; no LLM call per render.
 */

function fmtDate(iso) {
  if (!iso) return ''
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!m) return iso
  return `${m[1]} 年 ${Number(m[2])} 月 ${Number(m[3])} 日`
}

function employeeLabel(task, employees) {
  if (task.assignee_label) return task.assignee_label
  if (task.assignee_id && employees) {
    const e = employees.find((x) => String(x.id) === String(task.assignee_id))
    if (e) return `${e.name}${e.position ? `（${e.position}）` : ''}`
  }
  if (task.role) return `${task.role}（依角色指派）`
  return null
}

export function narrateStep(task, draft, ctx = {}) {
  if (!task) return ''
  const { employees = [], checklists = [], approvalChains = [], attachments = [] } = ctx
  const lines = []

  // 1. 做什麼
  const who = employeeLabel(task, employees)
  const due = fmtDate(task.due_date)
  const openers = []
  if (who) openers.push(`此任務由 ${who} 負責`)
  if (due) openers.push(`需於 ${due} 前完成`)
  if (task.priority && task.priority !== '中') openers.push(`優先級為${task.priority}`)
  if (openers.length) lines.push(`${openers.join('，')}。`)

  if (task.description) lines.push(task.description.trim())

  // 2. 前置條件
  if (task.dependencies?.length && draft?.tasks) {
    const byId = new Map(draft.tasks.map((t) => [t.id, t]))
    const deps = task.dependencies.map((id) => byId.get(id)?.title).filter(Boolean)
    if (deps.length) lines.push(`必須先完成「${deps.join('」、「')}」才能開始此任務。`)
  }

  // 3. 檢核清單
  if (task.checklist_id) {
    const cl = checklists.find((c) => String(c.id) === String(task.checklist_id))
    if (cl) lines.push(`進行中需依循檢核清單「${cl.name}」逐項確認。`)
  }

  // 4. 觸發下游任務
  if (draft?.tasks) {
    const downstream = draft.tasks.filter((t) => (t.dependencies || []).includes(task.id))
    if (downstream.length) {
      lines.push(`完成後將觸發「${downstream.map((t) => t.title).join('」、「')}」。`)
    }
  }

  // 5. 簽核流程
  if (task.approval_chain_id) {
    const chain = approvalChains.find((c) => String(c.id) === String(task.approval_chain_id))
    if (chain) {
      const steps = chain.steps_summary || chain.role_names
      if (Array.isArray(steps) && steps.length) {
        lines.push(`送出後需依序經過：${steps.join(' → ')} 核准。`)
      } else {
        lines.push(`送出後須經「${chain.name}」簽核流程核准。`)
      }
    }
  }

  // 6. 資料來源
  if (task.source_attachment_id) {
    const att = attachments.find((a) => a.fileId === task.source_attachment_id)
    if (att) lines.push(`此任務依據您上傳的「${att.name}」建立。`)
  }

  if (!lines.length) return '（此任務尚未填寫說明）'
  return lines.join(' ')
}

export function narrateProject(draft, ctx = {}) {
  const p = draft.project || {}
  const lines = []
  if (p.name) lines.push(`專案「${p.name}」`)
  if (p.owner_label) lines.push(`由 ${p.owner_label} 負責`)
  const s = fmtDate(p.start_date)
  const e = fmtDate(p.end_date)
  if (s && e) lines.push(`期間自 ${s} 至 ${e}`)
  else if (e) lines.push(`需於 ${e} 前完成`)
  if (p.department) lines.push(`所屬部門：${p.department}`)
  if (p.budget) lines.push(`預算：新台幣 ${Number(p.budget).toLocaleString()} 元`)
  if (!lines.length) return '（尚未填寫專案基本資料）'
  return lines.join('，') + '。共計 ' + (draft.tasks?.length || 0) + ' 個任務。'
}
