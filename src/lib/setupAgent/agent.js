/**
 * Setup Agent — Gemini session wrapper with JSON mode.
 */

import { GoogleGenerativeAI } from '@google/generative-ai'
import { buildSystemPrompt, buildRepairPrompt } from './prompt'

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY
let client = null
const sessions = new Map()

function getClient() {
  if (!API_KEY || API_KEY === 'your_gemini_api_key_here') {
    throw new Error('請在 .env 設定 VITE_GEMINI_API_KEY')
  }
  if (!client) client = new GoogleGenerativeAI(API_KEY)
  return client
}

function todayIso() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function resetSession(sessionId) {
  sessions.delete(sessionId)
}

export function initSession(sessionId, context) {
  const genAI = getClient()
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.3,
    },
  })
  const systemPrompt = buildSystemPrompt({ today: todayIso(), context })
  const chat = model.startChat({
    history: [
      { role: 'user', parts: [{ text: systemPrompt }] },
      { role: 'model', parts: [{ text: '{"phase":"intake","focus":{"taskId":null},"say":[{"type":"text","content":"您好，我是專案設定助理。我會陪您一步步建立一個新的專案套件，包含專案資料、任務清單、簽核流程與檢核清單。"},{"type":"question","content":"首先請簡單描述這個專案的目標、範圍與期限。也可以上傳相關文件或流程圖作為參考。","field":"intake"}],"actions":[],"suggestions":[],"needs_user_input":true}' }] },
    ],
  })
  sessions.set(sessionId, { chat, context })
  return sessions.get(sessionId)
}

/**
 * Send user input (text + optional attachments) to the agent.
 * Returns raw JSON envelope (or null if both attempts failed).
 */
export async function sendToAgent(sessionId, { text, attachments = [] }) {
  const s = sessions.get(sessionId)
  if (!s) throw new Error('session not initialized')

  const parts = []
  if (text && text.trim()) parts.push({ text })
  for (const att of attachments) {
    if (att.mime?.startsWith('image/') || att.mime === 'application/pdf') {
      if (att.base64) parts.push({ inlineData: { mimeType: att.mime, data: att.base64 } })
    }
    if (att.extractedText) {
      parts.push({ text: `【使用者上傳檔案「${att.name}」內容】\n${att.extractedText}` })
    }
  }
  if (parts.length === 0) parts.push({ text: '(使用者未輸入內容)' })

  let raw
  try {
    const res = await s.chat.sendMessage(parts)
    raw = res.response.text()
    return parseJson(raw)
  } catch (err) {
    console.warn('[setupAgent] first send failed:', err?.message)
  }

  try {
    const res = await s.chat.sendMessage(buildRepairPrompt())
    raw = res.response.text()
    return parseJson(raw)
  } catch {
    return null
  }
}

function parseJson(raw) {
  if (!raw) return null
  const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  try { return JSON.parse(cleaned) } catch { return null }
}

export function isConfigured() {
  return !!API_KEY && API_KEY !== 'your_gemini_api_key_here'
}
