import { useState, useRef, useEffect } from 'react'
import { Send, Paperclip, X, Image as ImageIcon, FileText } from 'lucide-react'
import { LIMITS, ACCEPTED_MIME } from '../../../lib/setupAgent/constants'

function fileIcon(mime) {
  if (mime?.startsWith('image/')) return <ImageIcon size={14} />
  return <FileText size={14} />
}

function formatBytes(n) {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / (1024 * 1024)).toFixed(1)} MB`
}

export default function SetupAgentChatPanel({
  messages, suggestions, pendingAttachments, onPickFiles, onRemoveAttachment,
  onSend, busy, disabled, turnsUsed,
}) {
  const [text, setText] = useState('')
  const scrollRef = useRef(null)
  const fileRef = useRef(null)

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages, busy])

  const send = () => {
    if (busy || disabled) return
    if (!text.trim() && !pendingAttachments.length) return
    onSend(text.trim())
    setText('')
  }

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  const handleFiles = (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length) onPickFiles(files)
    e.target.value = ''
  }

  const turnsLeft = LIMITS.MAX_TURNS_PER_SESSION - (turnsUsed || 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-secondary)', borderRadius: 12, border: '1px solid var(--border)', overflow: 'hidden' }}>
      <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, color: 'var(--text-secondary)' }}>
        <span>💬 專案設定對話</span>
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>剩餘輪數 {turnsLeft}</span>
      </div>

      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {messages.map((m, i) => (
          <Bubble key={i} message={m} />
        ))}
        {busy && <Bubble message={{ role: 'assistant', type: 'text', content: '思考中…' }} />}
      </div>

      {suggestions && suggestions.length > 0 && (
        <div style={{ padding: '8px 14px', borderTop: '1px solid var(--border)', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {suggestions.map((s, i) => (
            <button key={i} onClick={() => { setText(s.label); setTimeout(send, 0) }}
              style={{ padding: '4px 10px', borderRadius: 14, border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-primary)', fontSize: 12, cursor: 'pointer' }}>
              {s.label}
            </button>
          ))}
        </div>
      )}

      {pendingAttachments.length > 0 && (
        <div style={{ padding: '8px 14px', borderTop: '1px solid var(--border)', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {pendingAttachments.map((a) => (
            <div key={a.fileId} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 8px', background: 'var(--bg-main)', borderRadius: 8, fontSize: 12, color: 'var(--text-secondary)' }}>
              {fileIcon(a.mime)} {a.name} <span style={{ color: 'var(--text-muted)' }}>{formatBytes(a.size)}</span>
              <button onClick={() => onRemoveAttachment(a.fileId)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0, display: 'flex' }}>
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div style={{ padding: 12, borderTop: '1px solid var(--border)', display: 'flex', gap: 8, alignItems: 'flex-end' }}>
        <input ref={fileRef} type="file" multiple accept={ACCEPTED_MIME.join(',')} style={{ display: 'none' }} onChange={handleFiles} />
        <button onClick={() => fileRef.current?.click()} disabled={busy || disabled}
          style={{ padding: 8, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-secondary)', cursor: busy ? 'default' : 'pointer' }}
          title="附加檔案">
          <Paperclip size={16} />
        </button>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={disabled ? '對話已結束' : '輸入訊息… (Enter 送出，Shift+Enter 換行)'}
          disabled={busy || disabled}
          rows={2}
          style={{ flex: 1, resize: 'none', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-primary)', fontSize: 14, fontFamily: 'inherit' }}
        />
        <button onClick={send} disabled={busy || disabled || (!text.trim() && !pendingAttachments.length)}
          style={{ padding: '10px 14px', borderRadius: 8, border: 'none', background: 'var(--accent-cyan)', color: '#fff', cursor: busy ? 'default' : 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Send size={14} />
        </button>
      </div>
    </div>
  )
}

function Bubble({ message }) {
  const isUser = message.role === 'user'
  const isSystem = message.role === 'system'
  const align = isUser ? 'flex-end' : 'flex-start'
  const bg = isUser ? 'var(--accent-cyan)' : isSystem ? 'var(--accent-red-dim)' : 'var(--bg-main)'
  const color = isUser ? '#fff' : 'var(--text-primary)'
  return (
    <div style={{ display: 'flex', justifyContent: align }}>
      <div style={{ maxWidth: '85%', padding: '8px 12px', borderRadius: 12, background: bg, color, fontSize: 14, whiteSpace: 'pre-wrap', border: isUser ? 'none' : '1px solid var(--border)' }}>
        {message.content}
        {message.attachmentsLabel && (
          <div style={{ fontSize: 11, marginTop: 4, opacity: 0.8 }}>📎 {message.attachmentsLabel}</div>
        )}
      </div>
    </div>
  )
}
