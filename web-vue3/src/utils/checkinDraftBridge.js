const CHECKIN_DRAFT_BRIDGE_KEY = 'qj_checkin_prefill_from_chat'

export function saveChatDraftToCheckin(content) {
  const normalizedContent = String(content || '').trim()
  if (!normalizedContent) return false
  window.sessionStorage.setItem(
    CHECKIN_DRAFT_BRIDGE_KEY,
    JSON.stringify({
      content: normalizedContent,
      savedAt: new Date().toISOString(),
    }),
  )
  return true
}

export function consumeChatDraftToCheckin() {
  const raw = window.sessionStorage.getItem(CHECKIN_DRAFT_BRIDGE_KEY)
  if (!raw) return null
  window.sessionStorage.removeItem(CHECKIN_DRAFT_BRIDGE_KEY)
  try {
    const payload = JSON.parse(raw)
    const content = String(payload?.content || '').trim()
    return content ? { content, savedAt: payload?.savedAt || null } : null
  } catch {
    return null
  }
}
