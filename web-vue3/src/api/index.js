import axios from 'axios'
import { clearAuthToken, getAuthToken, setAuthToken } from '@/utils/auth'

let API_ROOT = '/api/v1'

function toWebSocketUrl(url) {
  const parsed = new URL(url, window.location.origin)
  parsed.protocol = parsed.protocol === 'https:' ? 'wss:' : 'ws:'
  return parsed.toString().replace(/\/$/, '')
}

const apiClient = axios.create({
  baseURL: API_ROOT,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

apiClient.interceptors.request.use((config) => {
  const token = getAuthToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const msg = err.response?.data?.detail || err.response?.data?.message || err.message || '请求失败，请稍后再试'
    return Promise.reject(new Error(msg))
  }
)

async function checkBackend() {
  try {
    await axios.get('/api/health', { timeout: 3000 })
    return true
  } catch {
    return false
  }
}

export const api = {
  checkBackend,
  health: checkBackend,

  login(account, password) {
    return apiClient.post('/auth/login', { account, password })
  },

  register(account, nickname, password) {
    return apiClient.post('/auth/register', { account, nickname, password })
  },

  sendPhoneCode(phone) {
    return apiClient.post('/auth/phone/send-code', { phone })
  },

  phoneLogin(phone, code) {
    return apiClient.post('/auth/phone/login', { phone, code })
  },

  getMe() {
    return apiClient.get('/auth/me')
  },

  updateMe(payload) {
    return apiClient.put('/auth/me', payload)
  },

  changePassword(currentPassword, newPassword) {
    return apiClient.post('/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    })
  },

  createPair(type) {
    return apiClient.post('/pairs/create', { type })
  },

  joinPair(inviteCode) {
    return apiClient.post('/pairs/join', { invite_code: inviteCode })
  },

  getMyPairs() {
    return apiClient.get('/pairs/me')
  },

  getPairSummary() {
    return apiClient.get('/pairs/summary')
  },

  requestUnbind(pairId) {
    return apiClient.post(`/pairs/request-unbind?pair_id=${pairId}`)
  },

  confirmUnbind(pairId) {
    return apiClient.post(`/pairs/confirm-unbind?pair_id=${pairId}`)
  },

  cancelUnbind(pairId) {
    return apiClient.post(`/pairs/cancel-unbind?pair_id=${pairId}`)
  },

  updatePartnerNickname(pairId, customNickname) {
    return apiClient.post(`/pairs/${pairId}/partner-nickname`, { custom_nickname: customNickname })
  },

  submitCheckin(pairId, payload) {
    const url = pairId ? '/checkins/' : '/checkins/?mode=solo'
    return apiClient.post(url, pairId ? { pair_id: pairId, ...payload } : payload)
  },

  getTodayStatus(pairId) {
    const url = pairId ? `/checkins/today?pair_id=${pairId}` : '/checkins/today?mode=solo'
    return apiClient.get(url)
  },

  getCheckinStreak(pairId) {
    const url = pairId ? `/checkins/streak?pair_id=${pairId}` : '/checkins/streak?mode=solo'
    return apiClient.get(url)
  },

  getCheckinHistory(pairId, limit = 14) {
    const url = pairId ? `/checkins/history?pair_id=${pairId}&limit=${limit}` : `/checkins/history?mode=solo&limit=${limit}`
    return apiClient.get(url)
  },

  generateReport(pairId, reportType = 'daily') {
    const map = { daily: 'generate-daily', weekly: 'generate-weekly', monthly: 'generate-monthly' }
    const endpoint = map[reportType] || 'generate-daily'
    const url = pairId ? `/reports/${endpoint}?pair_id=${pairId}` : `/reports/${endpoint}?mode=solo`
    return apiClient.post(url)
  },

  getLatestReport(pairId, reportType = 'daily') {
    const url = pairId ? `/reports/latest?pair_id=${pairId}&report_type=${reportType}` : `/reports/latest?mode=solo&report_type=${reportType}`
    return apiClient.get(url)
  },

  getLatestNarrativeAlignment(pairId) {
    return apiClient.get(`/insights/alignment/latest?pair_id=${pairId}`)
  },

  simulateMessage(pairId, draft) {
    if (!pairId) throw new Error('请先绑定关系')
    return apiClient.post(`/agent/simulate-message?pair_id=${pairId}`, { draft })
  },

  getRepairProtocol(pairId) {
    if (!pairId) throw new Error('请先绑定关系')
    return apiClient.get(`/crisis/protocol/${pairId}`)
  },

  getMethodology(pairId = null) {
    const url = pairId ? `/insights/methodology?pair_id=${pairId}` : '/insights/methodology?mode=solo'
    return apiClient.get(url)
  },

  getReportHistory(pairId, reportType = 'daily', limit = 7) {
    const url = pairId ? `/reports/history?pair_id=${pairId}&report_type=${reportType}&limit=${limit}` : `/reports/history?mode=solo&report_type=${reportType}&limit=${limit}`
    return apiClient.get(url)
  },

  getRelationshipTimeline(pairId, limit = 24) {
    const params = new URLSearchParams({ limit: String(limit) })
    if (pairId) params.set('pair_id', pairId)
    else params.set('mode', 'solo')
    return apiClient.get(`/insights/timeline?${params.toString()}`)
  },

  getSafetyStatus(pairId) {
    const url = pairId ? `/insights/safety/status?pair_id=${pairId}` : '/insights/safety/status?mode=solo'
    return apiClient.get(url)
  },

  getTreeStatus(pairId) {
    return apiClient.get(`/tree/status?pair_id=${pairId}`)
  },

  waterTree(pairId) {
    return apiClient.post(`/tree/water?pair_id=${pairId}`)
  },

  getCrisisStatus(pairId) {
    return apiClient.get(`/crisis/status/${pairId}`)
  },

  getDailyTasks(pairId) {
    return apiClient.get(`/tasks/daily/${pairId}`)
  },

  completeTask(taskId) {
    return apiClient.post(`/tasks/${taskId}/complete`)
  },

  getMilestones(pairId) {
    return apiClient.get(`/milestones/${pairId}`)
  },

  createMilestone(pairId, milestoneType, title, milestoneDate) {
    return apiClient.post(`/milestones/?pair_id=${pairId}&milestone_type=${milestoneType}&title=${encodeURIComponent(title)}&milestone_date=${milestoneDate}`)
  },

  getLongDistanceHealth(pairId) {
    return apiClient.get(`/longdistance/health-index/${pairId}`)
  },

  getLongDistanceActivities(pairId, limit = 20) {
    return apiClient.get(`/longdistance/activities/${pairId}?limit=${limit}`)
  },

  createLongDistanceActivity(pairId, activityType, title = '') {
    const params = new URLSearchParams({ pair_id: pairId, activity_type: activityType })
    if (title) params.set('title', title)
    return apiClient.post(`/longdistance/activities?${params.toString()}`)
  },

  getAttachmentAnalysis(pairId) {
    return apiClient.get(`/tasks/attachment/${pairId}`)
  },

  triggerAttachmentAnalysis(pairId) {
    return apiClient.post(`/tasks/attachment/${pairId}/analyze`)
  },

  getCommunityTips(pairType = 'couple') {
    return apiClient.get(`/community/tips?pair_type=${pairType}`)
  },

  generateTip(pairType = 'couple') {
    return apiClient.post(`/community/tips/generate?pair_type=${pairType}`)
  },

  getNotifications(limit = 20) {
    return apiClient.get(`/community/notifications?limit=${limit}`)
  },

  markNotificationsRead() {
    return apiClient.post('/community/notifications/read-all')
  },

  requestAccountDeletion() {
    return apiClient.post('/privacy/delete-request')
  },

  cancelAccountDeletion() {
    return apiClient.post('/privacy/delete-request/cancel')
  },

  createAgentSession(pairId = null) {
    const query = pairId ? `?pair_id=${pairId}` : ''
    return apiClient.post(`/agent/sessions${query}`)
  },

  getAgentMessages(sessionId) {
    return apiClient.get(`/agent/sessions/${sessionId}/messages`)
  },

  chatWithAgent(sessionId, content) {
    return apiClient.post(`/agent/sessions/${sessionId}/chat`, { content })
  },

  buildRealtimeAsrSocketUrl() {
    const token = getAuthToken()
    if (!token) throw new Error('请先登录')
    if (token === 'demo-mode') throw new Error('预览模式不支持实时语音')
    const absoluteApiRoot = API_ROOT.startsWith('http')
      ? API_ROOT
      : `${window.location.origin}${API_ROOT.startsWith('/') ? '' : '/'}${API_ROOT}`
    const socketUrl = new URL(`${toWebSocketUrl(absoluteApiRoot)}/agent/asr/realtime`)
    socketUrl.searchParams.set('token', token)
    return socketUrl.toString()
  },

  uploadFile(type, file) {
    const formData = new FormData()
    formData.append('file', file)
    return apiClient.post(`/upload/${type}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  isLoggedIn() {
    return Boolean(getAuthToken())
  },

  setToken(token, options) {
    setAuthToken(token, options)
  },

  clearToken(options) {
    clearAuthToken(options)
  },
}

export default api
