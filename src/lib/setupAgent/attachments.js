/**
 * Attachment intake — upload to Supabase Storage, extract text where possible,
 * and produce metadata the agent can reference.
 *
 * Native Gemini parts: images + PDFs are sent inline (base64).
 * Client-side text extraction: docx, xlsx/csv, txt, md.
 */

import { supabase } from '../supabase'
import { LIMITS, ACCEPTED_MIME } from './constants'
import { genId } from './draft'

const BUCKET = 'setup-agent-uploads'

export function validateFile(file) {
  if (!ACCEPTED_MIME.includes(file.type)) {
    return { ok: false, reason: `不支援的檔案類型：${file.type || '未知'}` }
  }
  if (file.size > LIMITS.MAX_ATTACHMENT_BYTES_EACH) {
    return { ok: false, reason: '檔案過大，單檔上限 10 MB' }
  }
  return { ok: true }
}

export function validateBatch(files) {
  if (files.length > LIMITS.MAX_ATTACHMENTS_PER_TURN) {
    return { ok: false, reason: `一次最多 ${LIMITS.MAX_ATTACHMENTS_PER_TURN} 個檔案` }
  }
  const total = files.reduce((s, f) => s + f.size, 0)
  if (total > LIMITS.MAX_ATTACHMENT_BYTES_TOTAL) {
    return { ok: false, reason: '檔案總大小超過 20 MB' }
  }
  for (const f of files) {
    const r = validateFile(f)
    if (!r.ok) return r
  }
  return { ok: true }
}

async function toBase64(file) {
  const buf = await file.arrayBuffer()
  let binary = ''
  const bytes = new Uint8Array(buf)
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
  return btoa(binary)
}

// Optional text extractors. mammoth / xlsx are not declared deps; if the host
// project installs them later, extraction kicks in automatically. Otherwise we
// fall back to filename-only reference and let the LLM ask the user to describe
// the document's contents.
async function tryImport(name) {
  try { return await import(/* @vite-ignore */ name) } catch { return null }
}

async function extractDocx(file) {
  const mammoth = await tryImport('mammoth/mammoth.browser')
  if (!mammoth) return ''
  try {
    const buf = await file.arrayBuffer()
    const r = await mammoth.extractRawText({ arrayBuffer: buf })
    return sanitizeText(r.value || '')
  } catch (err) {
    console.warn('[setupAgent] docx extract failed:', err)
    return ''
  }
}

async function extractSheet(file) {
  const XLSX = await tryImport('xlsx')
  if (!XLSX) return ''
  try {
    const buf = await file.arrayBuffer()
    const wb = XLSX.read(buf, { type: 'array' })
    const parts = []
    for (const name of wb.SheetNames) {
      const csv = XLSX.utils.sheet_to_csv(wb.Sheets[name])
      parts.push(`【工作表：${name}】\n${csv}`)
    }
    return sanitizeText(parts.join('\n\n'))
  } catch (err) {
    console.warn('[setupAgent] xlsx extract failed:', err)
    return ''
  }
}

async function extractText(file) {
  return sanitizeText(await file.text())
}

/**
 * Strip anything that looks like a role marker or tool-use directive to
 * reduce prompt-injection surface from uploaded documents.
 */
function sanitizeText(t) {
  if (!t) return ''
  return t
    .replace(/^\s*(system|assistant|user)\s*:/gim, '')
    .replace(/<\/?(system|assistant|tool|function)[^>]*>/gi, '')
    .slice(0, 60000)
}

/**
 * Upload one file, extract text where applicable, return attachment record.
 */
export async function processFile(file, { organizationId, sessionId }) {
  const v = validateFile(file)
  if (!v.ok) throw new Error(v.reason)

  const fileId = genId('a')
  const path = `${organizationId || 'anon'}/${sessionId}/${fileId}-${file.name}`

  let url = null
  try {
    const { data, error } = await supabase.storage.from(BUCKET).upload(path, file, {
      contentType: file.type,
      upsert: false,
    })
    if (error) throw error
    const { data: signed } = await supabase.storage.from(BUCKET).createSignedUrl(data.path, 60 * 60 * 24 * 7)
    url = signed?.signedUrl || null
  } catch (err) {
    console.warn('[setupAgent] storage upload failed (continuing with in-memory only):', err?.message)
  }

  let extractedText = ''
  let base64 = null
  if (file.type === 'image/png' || file.type === 'image/jpeg' || file.type === 'image/webp') {
    base64 = await toBase64(file)
  } else if (file.type === 'application/pdf') {
    base64 = await toBase64(file)
  } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    extractedText = await extractDocx(file)
  } else if (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
    extractedText = await extractSheet(file)
  } else if (file.type === 'text/csv' || file.type === 'text/plain' || file.type === 'text/markdown') {
    extractedText = await extractText(file)
  }

  return {
    fileId,
    name: file.name,
    mime: file.type,
    size: file.size,
    url,
    base64,
    extractedText,
    uploadedAt: new Date().toISOString(),
  }
}

export async function processFiles(files, ctx) {
  const v = validateBatch(files)
  if (!v.ok) throw new Error(v.reason)
  const out = []
  for (const f of files) out.push(await processFile(f, ctx))
  return out
}
