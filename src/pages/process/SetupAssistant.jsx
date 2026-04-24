import { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, RotateCcw } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { useTenant } from '../../contexts/TenantContext'
import LoadingSpinner from '../../components/LoadingSpinner'
import SetupAgentChatPanel from './components/SetupAgentChatPanel'
import SetupAgentPreviewPanel from './components/SetupAgentPreviewPanel'

import { createEmptyDraft, loadDraft, saveDraft, clearDraft } from '../../lib/setupAgent/draft'
import { interpretResponse } from '../../lib/setupAgent/interpreter'
import { initSession, sendToAgent, resetSession, isConfigured } from '../../lib/setupAgent/agent'
import { processFiles } from '../../lib/setupAgent/attachments'
import { commitSetupDraft } from '../../lib/setupAgent/commitDraft'
import { validateDraftForCommit } from '../../lib/setupAgent/validator'
import { LIMITS } from '../../lib/setupAgent/constants'

export default function SetupAssistant() {
  const navigate = useNavigate()
  const { profile } = useAuth()
  const { organization } = useTenant()
  const organizationId = organization?.id || profile?.organization_id || null

  const [loading, setLoading] = useState(true)
  const [ctx, setCtx] = useState(null)
  const [draft, setDraft] = useState(() => loadDraft() || createEmptyDraft(organizationId))
  const [messages, setMessages] = useState(() => draft.messages || [])
  const [suggestions, setSuggestions] = useState([])
  const [pendingAttachments, setPendingAttachments] = useState([])
  const [busy, setBusy] = useState(false)
  const [committing, setCommitting] = useState(false)
  const [commitResult, setCommitResult] = useState(null)
  const [error, setError] = useState(null)

  // Load organization-scoped context for LLM
  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const q = (b) => organizationId ? b.eq('organization_id', organizationId) : b
        const [empRes, storeRes, sopRes, chainRes, chainStepRes, clRes, deptRes] = await Promise.all([
          q(supabase.from('employees').select('id, name, position, department, department_id, is_manager, status')).limit(200),
          q(supabase.from('stores').select('id, name')).limit(50),
          q(supabase.from('sop_templates').select('id, name, category, description, steps')).limit(100),
          q(supabase.from('approval_chains').select('id, name, category, description, min_amount, max_amount')).limit(100),
          supabase.from('approval_chain_steps').select('chain_id, step_order, role_name, label').limit(500),
          q(supabase.from('checklists').select('id, name, category')).limit(100),
          q(supabase.from('departments').select('id, name')).limit(100),
        ])
        if (cancelled) return
        const stepsByChain = new Map()
        for (const s of (chainStepRes.data || [])) {
          const arr = stepsByChain.get(s.chain_id) || []
          arr.push(s)
          stepsByChain.set(s.chain_id, arr)
        }
        const approvalChains = (chainRes.data || []).map((c) => ({
          ...c,
          steps_summary: (stepsByChain.get(c.id) || []).sort((a, b) => a.step_order - b.step_order).map((s) => s.role_name || s.label),
        }))
        const employees = (empRes.data || []).filter((e) => e.status !== '離職')
        setCtx({
          employees,
          stores: storeRes.data || [],
          sopTemplates: sopRes.data || [],
          approvalChains,
          checklists: clRes.data || [],
          departments: deptRes.data || [],
          roles: [],
        })
      } catch (err) {
        setError('載入組織資料失敗：' + (err.message || '未知錯誤'))
      } finally {
        setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [organizationId])

  // Initialize LLM session once context is loaded
  useEffect(() => {
    if (!ctx || !isConfigured()) return
    try {
      initSession(draft.sessionId, ctx)
      // seed the opening assistant message if transcript empty
      if ((draft.messages || []).length === 0) {
        const opening = [
          { role: 'assistant', type: 'text', content: '您好，我是專案設定助理。我會陪您一步步建立一個新的專案套件，包含專案資料、任務清單、簽核流程與檢核清單。', at: new Date().toISOString() },
          { role: 'assistant', type: 'question', content: '首先請簡單描述這個專案的目標、範圍與期限。也可以上傳相關文件或流程圖作為參考。', field: 'intake', at: new Date().toISOString() },
        ]
        const next = { ...draft, messages: opening }
        setDraft(next); saveDraft(next); setMessages(opening)
      }
    } catch (err) {
      setError(err.message)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctx])

  const onPickFiles = useCallback(async (files) => {
    try {
      const processed = await processFiles(files, { organizationId, sessionId: draft.sessionId })
      setPendingAttachments((prev) => [...prev, ...processed])
    } catch (err) {
      alert(err.message)
    }
  }, [organizationId, draft.sessionId])

  const onRemoveAttachment = useCallback((fileId) => {
    setPendingAttachments((prev) => prev.filter((a) => a.fileId !== fileId))
  }, [])

  const onSend = useCallback(async (text) => {
    if (busy) return
    if ((draft.turns || 0) >= LIMITS.MAX_TURNS_PER_SESSION) {
      alert('對話已達上限，請確認目前內容後送出，或重新開始。')
      return
    }

    const attachmentsForAgent = pendingAttachments
    const userMsg = {
      role: 'user',
      type: 'text',
      content: text || '(已附加檔案)',
      attachmentsLabel: attachmentsForAgent.length ? attachmentsForAgent.map((a) => a.name).join(', ') : null,
      at: new Date().toISOString(),
    }
    const withUser = [...messages, userMsg]
    setMessages(withUser)
    setPendingAttachments([])
    setSuggestions([])
    setBusy(true)
    setError(null)

    try {
      const envelope = await sendToAgent(draft.sessionId, { text, attachments: attachmentsForAgent })
      if (!envelope) {
        setMessages((prev) => [...prev, { role: 'system', type: 'text', content: '系統收到回應格式有誤，請再試一次。' }])
        setBusy(false)
        return
      }
      const draftWithUser = {
        ...draft,
        messages: withUser,
        attachments: [...(draft.attachments || []), ...attachmentsForAgent.map(({ base64, ...rest }) => rest)],
      }
      const result = interpretResponse(draftWithUser, envelope, ctx || {})
      setDraft(result.draft)
      saveDraft(result.draft)
      setMessages(result.draft.messages)
      setSuggestions(result.suggestions || [])
    } catch (err) {
      setError('對話失敗：' + (err.message || '未知錯誤'))
    } finally {
      setBusy(false)
    }
  }, [busy, draft, messages, pendingAttachments, ctx])

  const reset = () => {
    if (!confirm('確定要放棄目前草稿，重新開始嗎？')) return
    resetSession(draft.sessionId)
    clearDraft()
    const next = createEmptyDraft(organizationId)
    setDraft(next)
    setMessages([])
    setSuggestions([])
    setPendingAttachments([])
    setCommitResult(null)
    if (ctx) initSession(next.sessionId, ctx)
  }

  const canCommit = useMemo(() => {
    const v = validateDraftForCommit(draft, ctx || {})
    return v.ok
  }, [draft, ctx])

  const handleCommit = async () => {
    if (!canCommit || committing) return
    if (!confirm(`將建立 1 個專案 + ${draft.tasks.length} 個任務，是否確認？`)) return
    setCommitting(true)
    setError(null)
    try {
      const res = await commitSetupDraft(draft, {
        organizationId,
        currentUser: profile?.name || profile?.email || '',
        ctx,
      })
      if (!res.ok) {
        setError('建立失敗：' + (res.errors || []).join('；'))
      } else {
        setCommitResult(res)
        clearDraft()
      }
    } catch (err) {
      setError('建立失敗：' + (err.message || '未知錯誤'))
    } finally {
      setCommitting(false)
    }
  }

  if (loading) return <LoadingSpinner />

  if (!isConfigured()) {
    return (
      <div style={{ padding: 32 }}>
        <div style={{ padding: 24, background: 'var(--accent-yellow-dim)', color: 'var(--accent-yellow)', borderRadius: 8, textAlign: 'center' }}>
          請先在 .env 設定 VITE_GEMINI_API_KEY 才能使用專案設定助理。
        </div>
      </div>
    )
  }

  if (commitResult) {
    return (
      <div style={{ padding: 32, maxWidth: 640, margin: '0 auto' }}>
        <div style={{ padding: 24, background: 'var(--accent-green-dim)', color: 'var(--text-primary)', borderRadius: 12, textAlign: 'center' }}>
          <h2 style={{ marginBottom: 12, color: 'var(--accent-green)' }}>✅ 專案建立完成</h2>
          <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16 }}>
            已建立 1 個專案、{draft.tasks.length} 個任務、{commitResult.written?.formIds?.length || 0} 份簽核表單。
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button onClick={() => navigate('/process/projects')} style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: 'var(--accent-cyan)', color: '#fff', cursor: 'pointer' }}>
              前往專案列表
            </button>
            <button onClick={reset} style={{ padding: '10px 20px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-primary)', cursor: 'pointer' }}>
              建立另一個
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 100px)', padding: 16, gap: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => navigate('/process/projects')}
            style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
            <ArrowLeft size={14} /> 返回
          </button>
          <h2 style={{ margin: 0, fontSize: 18, color: 'var(--text-primary)' }}>
            🤖 AI 專案設定助理
          </h2>
        </div>
        <button onClick={reset}
          style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 13 }}>
          <RotateCcw size={13} /> 重新開始
        </button>
      </div>

      {error && (
        <div style={{ padding: 10, background: 'var(--accent-red-dim)', color: 'var(--accent-red)', borderRadius: 8, fontSize: 13 }}>
          {error}
        </div>
      )}

      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, minHeight: 0 }}>
        <SetupAgentChatPanel
          messages={messages}
          suggestions={suggestions}
          pendingAttachments={pendingAttachments}
          onPickFiles={onPickFiles}
          onRemoveAttachment={onRemoveAttachment}
          onSend={onSend}
          busy={busy}
          disabled={!!commitResult}
          turnsUsed={draft.turns || 0}
        />
        <SetupAgentPreviewPanel
          draft={draft}
          ctx={ctx || {}}
          onCommit={handleCommit}
          canCommit={canCommit}
          committing={committing}
        />
      </div>
    </div>
  )
}
