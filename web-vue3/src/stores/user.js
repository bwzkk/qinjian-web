import { defineStore } from 'pinia'
import { api } from '@/api'
import { ref, computed } from 'vue'
import { DEMO_TOKEN, cloneDemo, demoFixture } from '@/demo/fixtures'
import { useHomeStore } from '@/stores/home'
import { useReportStore } from '@/stores/report'
import { useCheckinStore } from '@/stores/checkin'
import { getAuthToken, saveLoginPreferences } from '@/utils/auth'

export const useUserStore = defineStore('user', () => {
  const me = ref(null)
  const token = ref(getAuthToken())
  const pairs = ref([])
  const currentPair = ref(null)
  const notifications = ref([])

  const isLoggedIn = computed(() => Boolean(token.value))
  const isDemoMode = computed(() => token.value === DEMO_TOKEN)
  const hasActivePair = computed(() => currentPair.value?.status === 'active')
  const currentPairId = computed(() => currentPair.value?.id || '')
  const partnerName = computed(() => {
    if (!currentPair.value) return ''
    return currentPair.value.custom_partner_nickname
      || currentPair.value.partner_nickname
      || currentPair.value.partner_email
      || currentPair.value.partner_phone
      || '对方'
  })

  function resetState() {
    me.value = null
    pairs.value = []
    currentPair.value = null
    notifications.value = []
    useHomeStore().reset()
    useReportStore().reset()
    useCheckinStore().reset()
  }

  async function hydrateSession(accessToken, { autoLogin = false, clearPersisted = !autoLogin } = {}) {
    resetState()
    token.value = accessToken
    api.setToken(accessToken, { persist: autoLogin, clearPersisted })
    const ready = await bootstrap()
    if (!ready) {
      throw new Error('登录状态初始化失败，请重新登录')
    }
  }

  async function login(account, password, options = {}) {
    const res = await api.login(account, password)
    saveLoginPreferences({
      account,
      password,
      autoLogin: Boolean(options.autoLogin),
      rememberPassword: Boolean(options.rememberPassword),
    })
    await hydrateSession(res.access_token, { autoLogin: Boolean(options.autoLogin) })
    return res
  }

  async function register(account, nickname, password) {
    const res = await api.register(account, nickname, password)
    await hydrateSession(res.access_token)
    return res
  }

  async function phoneLogin(phone, code) {
    const res = await api.phoneLogin(phone, code)
    await hydrateSession(res.access_token)
    return res
  }

  function logout(options = {}) {
    token.value = ''
    resetState()
    localStorage.removeItem('qj_current_pair')
    api.clearToken({ clearPersisted: options.clearPersisted !== false })
  }

  function applyDemo() {
    resetState()
    token.value = DEMO_TOKEN
    api.setToken(DEMO_TOKEN, { persist: false, clearPersisted: false })
    me.value = cloneDemo(demoFixture.me)
    pairs.value = cloneDemo(demoFixture.pairs)
    currentPair.value = pairs.value.find((p) => p.id === demoFixture.currentPairId) || pairs.value[0] || null
    notifications.value = cloneDemo(demoFixture.notifications)
  }

  function enterDemo() {
    applyDemo()
    localStorage.setItem('qj_current_pair', demoFixture.currentPairId)
  }

  async function fetchMe() {
    me.value = await api.getMe()
    return me.value
  }

  async function updateMe(payload) {
    me.value = await api.updateMe(payload)
    return me.value
  }

  async function fetchPairs() {
    pairs.value = await api.getMyPairs()
    const storedId = localStorage.getItem('qj_current_pair')
    const active = pairs.value.filter((p) => p.status === 'active')
    const pending = pairs.value.filter((p) => p.status === 'pending')
    currentPair.value = pairs.value.find((p) => p.id === storedId)
      || active[0]
      || pending[0]
      || null
    return pairs.value
  }

  async function switchPair(pairId) {
    const match = pairs.value.find((p) => p.id === pairId)
    if (match) {
      currentPair.value = match
      localStorage.setItem('qj_current_pair', pairId)
    }
  }

  async function createPair(type) {
    const pair = await api.createPair(type)
    pairs.value = [...pairs.value.filter((p) => p.id !== pair.id), pair]
    currentPair.value = pair
    localStorage.setItem('qj_current_pair', pair.id)
    return pair
  }

  async function joinPair(code) {
    const pair = await api.joinPair(code)
    localStorage.setItem('qj_current_pair', pair.id)
    await fetchPairs()
    return pair
  }

  async function bootstrap() {
    if (!isLoggedIn.value) return false
    if (isDemoMode.value) {
      applyDemo()
      return true
    }
    try {
      await Promise.all([fetchMe(), fetchPairs(), loadNotifications()])
      return true
    } catch {
      logout()
      return false
    }
  }

  async function loadNotifications() {
    if (isDemoMode.value) {
      notifications.value = cloneDemo(demoFixture.notifications)
      return
    }
    try {
      notifications.value = await api.getNotifications()
    } catch {
      notifications.value = []
    }
  }

  const unreadCount = computed(() =>
    notifications.value.filter((n) => !n.is_read).length
  )

  return {
    me, token, pairs, currentPair, notifications,
    isLoggedIn, isDemoMode, hasActivePair, currentPairId, partnerName, unreadCount,
    login, register, phoneLogin, logout,
    fetchMe, fetchPairs, switchPair, createPair, joinPair,
    bootstrap, loadNotifications, enterDemo, updateMe,
  }
})
