import { useState, useEffect } from 'react'
import { Eye, EyeOff, Paperclip, CheckCircle2, Circle, Loader } from 'lucide-react'
import { narrateStep, narrateProject } from '../../../lib/setupAgent/narrateStep'

const STATUS_ICON = {
  pending: { icon: Circle, color: 'var(--text-muted)', label: '待填寫' },
  in_progress: { icon: Loader, color: 'var(--accent-yellow)', label: '填寫中' },
  complete: { icon: CheckCircle2, color: 'var(--accent-green)', label: '完成' },
}

function taskStatus(task) {
  if (task.status === 'complete') return 'complete'
  if (task.title && (task.assignee_label || task.role) && task.due_date) return 'complete'
  if (task.title) return 'in_progress'
  return 'pending'
}

export default function SetupAgentPreviewPanel({ draft, ctx, onCommit, canCommit, committing }) {
  const [showNarration, setShowNarration] = useState(() => {
    try { return localStorage.getItem('setupAgent.showNarration') !== 'false' } catch { return true }
  })
  const [focusTaskId, setFocusTaskId] = useState(null)

  const toggleNarration = () => {
    setShowNarration((v) => {
      const next = !v
      try { localStorage.setItem('setupAgent.showNarration', next ? 'true' : 'false') } catch { /* noop */ }
      return next
    })
  }

  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'e') {
        e.preventDefault()
        toggleNarration()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const project = draft.project || {}
  const tasks = draft.tasks || []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-secondary)', borderRadius: 12, border: '1px solid var(--border)', overflow: 'hidden' }}>
      <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>📋 任務清單預覽</span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={toggleNarration}
            style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-secondary)', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
            title="Ctrl/Cmd+E">
            {showNarration ? <EyeOff size={12} /> : <Eye size={12} />}
            {showNarration ? '隱藏說明' : '顯示說明'}
          </button>
        </div>
      </div>

      <div style={{ padding: 14, borderBottom: '1px solid var(--border)', background: 'var(--bg-main)' }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
          {project.name || '（尚未命名）'}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          {narrateProject(draft, ctx)}
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <div style={{ flex: showNarration ? '1 1 50%' : '1 1 100%', overflowY: 'auto', padding: 12, borderRight: showNarration ? '1px solid var(--border)' : 'none' }}>
          {tasks.length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
              尚未建立任何任務
            </div>
          ) : (
            tasks.map((t, i) => (
              <TaskCard key={t.id} task={t} index={i} isFocus={t.id === (focusTaskId ?? draft.currentTaskId)}
                onClick={() => setFocusTaskId(t.id)} ctx={ctx} />
            ))
          )}
        </div>
        {showNarration && (
          <div style={{ flex: '1 1 50%', overflowY: 'auto', padding: 14, background: 'var(--bg-main)' }}>
            <NarrationView draft={draft} ctx={ctx} focusTaskId={focusTaskId ?? draft.currentTaskId} />
          </div>
        )}
      </div>

      <div style={{ padding: 12, borderTop: '1px solid var(--border)', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button onClick={onCommit} disabled={!canCommit || committing}
          style={{ padding: '8px 16px', borderRadius: 8, border: 'none',
            background: canCommit ? 'var(--accent-green)' : 'var(--bg-tertiary)',
            color: canCommit ? '#fff' : 'var(--text-muted)',
            cursor: canCommit && !committing ? 'pointer' : 'default',
            fontSize: 14, fontWeight: 500 }}>
          {committing ? '建立中…' : '確認建立'}
        </button>
      </div>
    </div>
  )
}

function TaskCard({ task, index, isFocus, onClick, ctx }) {
  const status = taskStatus(task)
  const S = STATUS_ICON[status]
  const Icon = S.icon
  return (
    <div onClick={onClick}
      style={{ padding: 10, marginBottom: 8, borderRadius: 8,
        border: `1px solid ${isFocus ? 'var(--accent-cyan)' : 'var(--border)'}`,
        background: isFocus ? 'var(--accent-cyan-dim)' : 'var(--bg-main)',
        cursor: 'pointer' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <Icon size={14} color={S.color} />
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>任務 {index + 1}</span>
        <span style={{ flex: 1 }} />
        {task.source_attachment_id && <Paperclip size={12} color="var(--text-muted)" />}
        <span style={{ fontSize: 11, color: S.color }}>{S.label}</span>
      </div>
      <div style={{ fontSize: 14, color: 'var(--text-primary)', marginBottom: 4 }}>
        {task.title || '（待命名）'}
      </div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', fontSize: 11, color: 'var(--text-secondary)' }}>
        {task.assignee_label && <span style={{ padding: '2px 6px', background: 'var(--bg-tertiary)', borderRadius: 4 }}>{task.assignee_label}</span>}
        {task.due_date && <span style={{ padding: '2px 6px', background: 'var(--bg-tertiary)', borderRadius: 4 }}>{task.due_date}</span>}
        {task.priority && task.priority !== '中' && <span style={{ padding: '2px 6px', background: priorityBg(task.priority), borderRadius: 4, color: priorityColor(task.priority) }}>{task.priority}</span>}
        {task.approval_chain_id && <span style={{ padding: '2px 6px', background: 'var(--accent-purple-dim)', color: 'var(--accent-purple)', borderRadius: 4 }}>需簽核</span>}
      </div>
    </div>
  )
}

function NarrationView({ draft, ctx, focusTaskId }) {
  const task = draft.tasks.find((t) => t.id === focusTaskId) || draft.tasks[0]
  if (!task) return <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>選擇一個任務以查看說明。</div>
  const text = narrateStep(task, draft, ctx)
  return (
    <div>
      <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 6 }}>任務說明</div>
      <div style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.7 }}>
        <strong>{task.title || '（待命名）'}：</strong>{text}
      </div>
    </div>
  )
}

function priorityBg(p) {
  if (p === '高') return 'var(--accent-red-dim)'
  if (p === '低') return 'var(--accent-green-dim)'
  return 'var(--bg-tertiary)'
}
function priorityColor(p) {
  if (p === '高') return 'var(--accent-red)'
  if (p === '低') return 'var(--accent-green)'
  return 'var(--text-secondary)'
}
