/**
 * commitSetupDraft — persists a SetupDraft into the live DB.
 *
 * Order of writes:
 *   1. (optional) sop_templates + approval_chains rows (if templatePersistence === 'save')
 *   2. projects row
 *   3. project_sections (default 待辦/進行中/已完成)
 *   4. workflow_instances row (project-linked)
 *   5. tasks rows (bucket=Workflow)
 *   6. task_checklists + workflow_step_checklists junctions
 *   7. task dependencies
 *   8. optional approval_forms for 簽核-requiring tasks
 *
 * Client-side, non-transactional today — wrap in a Supabase RPC in P3 for atomicity.
 * `dryRun` skips all writes and returns what would be written.
 */

import { supabase } from '../supabase'
import { validateDraftForCommit } from './validator'

const DEFAULT_SECTIONS = [
  { name: '待辦', color: 'var(--accent-blue)' },
  { name: '進行中', color: 'var(--accent-cyan)' },
  { name: '已完成', color: 'var(--accent-green)' },
]

export async function commitSetupDraft(draft, { dryRun = false, organizationId, currentUser, ctx } = {}) {
  const val = validateDraftForCommit(draft, ctx || {})
  if (!val.ok) return { ok: false, errors: val.errors }

  const plan = buildPlan(draft, { organizationId, currentUser })
  if (dryRun) return { ok: true, dryRun: true, plan }

  const written = { templateIds: {}, chainIds: {}, checklistIds: {}, projectId: null, instanceId: null, taskIds: {}, formIds: [] }

  try {
    // 1. persist new templates if requested
    if (draft.templatePersistence === 'save' && draft.templateDraft) {
      const tpl = draft.templateDraft
      const { data, error } = await supabase.from('sop_templates').insert({
        name: tpl.name || draft.project.name,
        category: tpl.category || '',
        description: tpl.description || draft.project.description || '',
        steps: draft.tasks.map((t, i) => ({
          title: t.title,
          role: t.role,
          priority: t.priority,
          description: t.description,
          checklist_id: t.checklist_id || null,
          approval_chain_id: t.approval_chain_id || null,
          step_order: i + 1,
        })),
        organization_id: organizationId || null,
      }).select().single()
      if (error) throw error
      written.templateIds.sop = data.id
    }

    // 1b. persist new approval chains defined inline
    for (const chain of (draft.approvalChainsDraft || [])) {
      const { data: chainRow, error } = await supabase.from('approval_chains').insert({
        name: chain.name,
        category: chain.category || '',
        description: chain.description || '',
        organization_id: organizationId || null,
      }).select().single()
      if (error) throw error
      written.chainIds[chain.id] = chainRow.id
      if (Array.isArray(chain.steps) && chain.steps.length) {
        const rows = chain.steps.map((s, idx) => ({
          chain_id: chainRow.id,
          step_order: idx + 1,
          role_name: s.role || s.role_name || '',
          label: s.label || '',
        }))
        await supabase.from('approval_chain_steps').insert(rows)
      }
    }

    // 1c. persist new checklists defined inline
    for (const cl of (draft.checklistsDraft || [])) {
      const { data: row, error } = await supabase.from('checklists').insert({
        name: cl.name,
        category: cl.category || '',
        organization_id: organizationId || null,
      }).select().single()
      if (error) throw error
      written.checklistIds[cl.id] = row.id
      if (Array.isArray(cl.items) && cl.items.length) {
        const itemRows = cl.items.map((it, i) => ({
          checklist_id: row.id,
          title: typeof it === 'string' ? it : it.title,
          sort_order: i,
          checked: false,
        }))
        await supabase.from('checklist_items').insert(itemRows)
      }
    }

    // 2. project
    const p = draft.project
    const { data: project, error: pErr } = await supabase.from('projects').insert({
      name: p.name,
      description: p.description || '',
      status: '規劃中',
      priority: p.priority || '中',
      owner: p.owner_label || '',
      owner_id: p.owner_id || null,
      department: p.department || '',
      store: p.store || '',
      start_date: p.start_date || null,
      end_date: p.end_date || null,
      budget: p.budget || null,
      progress: 0,
      organization_id: organizationId || null,
      tags: p.tags || [],
    }).select().single()
    if (pErr) throw pErr
    written.projectId = project.id

    // 3. default sections
    await supabase.from('project_sections').insert(
      DEFAULT_SECTIONS.map((s, i) => ({
        project_id: project.id,
        name: s.name,
        color: s.color,
        sort_order: i,
      }))
    )

    // 4. workflow instance
    const { data: instance, error: iErr } = await supabase.from('workflow_instances').insert({
      template_name: draft.templateRef?.sopTemplateId
        ? (ctx?.sopTemplates?.find((t) => String(t.id) === String(draft.templateRef.sopTemplateId))?.name || p.name)
        : p.name,
      status: '進行中',
      started_by: currentUser || null,
      project_id: project.id,
      store: p.store || '',
      organization_id: organizationId || null,
    }).select().single()
    if (iErr) throw iErr
    written.instanceId = instance.id

    // 5. tasks
    const taskRows = draft.tasks.map((t, i) => ({
      workflow_instance_id: instance.id,
      step_order: i + 1,
      title: t.title,
      description: t.description || '',
      role: t.role || '',
      assignee: t.assignee_label || '',
      assignee_id: t.assignee_id || null,
      store: p.store || '',
      status: '待處理',
      bucket: 'Workflow',
      category: 'Workflow',
      priority: t.priority || '中',
      due_date: t.due_date || null,
      approval_chain_id: resolveChainId(t.approval_chain_id, written.chainIds),
      organization_id: organizationId || null,
    }))
    const { data: insertedTasks, error: tErr } = await supabase.from('tasks').insert(taskRows).select()
    if (tErr) throw tErr
    insertedTasks.forEach((row, i) => { written.taskIds[draft.tasks[i].id] = row.id })

    // 6. checklist junctions
    for (let i = 0; i < draft.tasks.length; i++) {
      const t = draft.tasks[i]
      const clId = resolveChecklistId(t.checklist_id, written.checklistIds)
      if (clId && insertedTasks[i]) {
        await supabase.from('task_checklists').insert({
          task_id: insertedTasks[i].id,
          checklist_id: clId,
        })
      }
    }

    // 7. dependencies
    for (const t of draft.tasks) {
      for (const depId of (t.dependencies || [])) {
        const fromId = written.taskIds[t.id]
        const toId = written.taskIds[depId]
        if (fromId && toId) {
          await supabase.from('task_dependencies').insert({
            task_id: fromId,
            depends_on_task_id: toId,
            dep_type: 'prerequisite',
          })
        }
      }
    }

    // 8. approval forms for tasks with chains
    for (let i = 0; i < draft.tasks.length; i++) {
      const t = draft.tasks[i]
      const chainId = resolveChainId(t.approval_chain_id, written.chainIds)
      if (!chainId) continue
      const { data: form } = await supabase.from('approval_forms').insert({
        chain_id: chainId,
        title: `${p.name} — ${t.title}`,
        applicant: p.owner_label || '',
        store: p.store || '',
        status: '待簽',
        notes: '由專案設定助理自動建立',
        organization_id: organizationId || null,
      }).select().single()
      if (form) written.formIds.push(form.id)
    }

    return { ok: true, written }
  } catch (err) {
    return { ok: false, errors: [err.message || String(err)], partial: written }
  }
}

function resolveChainId(id, localMap) {
  if (!id) return null
  // client-generated ids start with 'ac_' — map to real inserted id
  if (typeof id === 'string' && id.startsWith('ac_')) return localMap[id] || null
  return id
}

function resolveChecklistId(id, localMap) {
  if (!id) return null
  if (typeof id === 'string' && id.startsWith('cl_')) return localMap[id] || null
  return id
}

function buildPlan(draft, ctx) {
  return {
    willCreateTemplate: draft.templatePersistence === 'save',
    projectName: draft.project.name,
    taskCount: draft.tasks.length,
    approvalFormCount: draft.tasks.filter((t) => t.approval_chain_id).length,
    checklistLinks: draft.tasks.filter((t) => t.checklist_id).length,
    newChains: (draft.approvalChainsDraft || []).length,
    newChecklists: (draft.checklistsDraft || []).length,
  }
}
