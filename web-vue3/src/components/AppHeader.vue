<template>
  <header class="app-header">
    <button class="header-back" aria-label="返回上一页" @click="goBack">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M15 18l-6-6 6-6" />
      </svg>
    </button>
    <div class="header-left">
      <span class="header-logo-wrap">
        <img src="/qinjian-logo.jpg" alt="亲健 logo" class="header-logo" />
      </span>
      <div class="header-copy">
        <span class="header-brand">亲健</span>
        <span class="header-sub">先看见，再靠近</span>
      </div>
    </div>
    <form class="header-search" @submit.prevent="goSearch">
      <input
        v-model="searchQuery"
        class="input header-search__input"
        type="search"
        placeholder="搜索双视角、预演、修复协议、判断说明"
        @focus="searchOpen = true"
        @blur="handleSearchBlur"
      />
      <div v-if="showSearchResults" class="header-search__menu">
        <button
          v-for="item in searchResults"
          :key="item.to"
          class="header-search__item"
          type="button"
          @mousedown.prevent="goTo(item.to)"
        >
          <span>{{ item.label }}</span>
          <strong>{{ item.title }}</strong>
          <p>{{ item.desc }}</p>
        </button>
      </div>
    </form>
    <div class="header-right">
      <button v-if="userStore.isDemoMode" class="btn btn-ghost btn-sm header-action--optional" @click="$router.push('/auth')">正式登录</button>
      <button class="btn btn-ghost btn-sm header-action--optional" @click="$router.push('/relationship-spaces')">关系空间</button>
      <button class="btn btn-secondary btn-sm" @click="$router.push('/checkin')">今日记录</button>
      <button v-if="userStore.notifications.length" class="header-bell" @click="toggleNotifications">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M18 15V11a6 6 0 1 0-12 0v4l-2 2h16z"/><path d="M10 19a2 2 0 0 0 4 0"/></svg>
        <span v-if="userStore.unreadCount > 0" class="bell-badge">{{ userStore.unreadCount > 9 ? '9+' : userStore.unreadCount }}</span>
      </button>
    </div>
  </header>

  <Teleport to="body">
    <div v-if="showNotif" class="notif-overlay" @click.self="showNotif = false">
      <div class="notif-drawer">
        <div class="notif-drawer__head">
          <h3>消息</h3>
          <button class="btn btn-ghost btn-sm" @click="markRead">全部已读</button>
        </div>
        <div class="notif-drawer__body">
          <div v-if="!userStore.notifications.length" class="empty-state">暂无消息</div>
          <div v-else class="stack-list">
            <div v-for="n in userStore.notifications" :key="n.id" class="stack-item">
              <div class="stack-item__icon" style="background:var(--warm-100);color:var(--warm-600);">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M18 15V11a6 6 0 1 0-12 0v4l-2 2h16z"/></svg>
              </div>
              <div class="stack-item__content">
                <strong>{{ n.content }}</strong>
                <div class="stack-item__meta">{{ formatDate(n.created_at) }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, inject } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { api } from '@/api'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const showNotif = ref(false)
const showToast = inject('showToast', null)
const searchQuery = ref('')
const searchOpen = ref(false)

const searchCatalog = [
  { label: '双视角', title: '双视角分析', desc: '看双方版本、误读点和桥接动作。', to: '/alignment', keywords: ['双视角', '双方视角', '混淆', '误读', '对齐'] },
  { label: '预演', title: '聊天前预演', desc: '先看这句话会不会把局面推歪。', to: '/message-simulation', keywords: ['预演', '聊天前', '发消息', '模拟'] },
  { label: '修复', title: '修复协议', desc: '先止损，再按步骤对话。', to: '/repair-protocol', keywords: ['修复协议', '止损', '冲突', '协议'] },
  { label: '说明', title: '判断说明', desc: '看系统怎么做出判断。', to: '/methodology', keywords: ['判断说明', '方法说明', '机制', '解释'] },
  { label: '简报', title: '关系简报', desc: '查看日报、周报和月报。', to: '/report', keywords: ['简报', '报告', '分析'] },
  { label: '时间轴', title: '关系时间轴', desc: '按时间回看关键节点。', to: '/timeline', keywords: ['时间轴', '历史', '回看'] },
  { label: '依恋', title: '依恋类型分析', desc: '了解双方依恋模式。', to: '/attachment-test', keywords: ['依恋', '依恋类型', 'attachment'] },
  { label: '体检', title: '关系体检', desc: '快速查看关系状态。', to: '/health-test', keywords: ['体检', '健康', '状态'] },
  { label: '记录', title: '今日记录', desc: '写下今天发生的事。', to: '/checkin', keywords: ['记录', '今天', '输入'] },
]

const searchResults = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return []
  return searchCatalog.filter((item) =>
    [item.label, item.title, item.desc, ...item.keywords].some((text) => String(text).toLowerCase().includes(q))
  ).slice(0, 6)
})

const showSearchResults = computed(() => searchOpen.value && searchResults.value.length > 0)

const titleMap = {
  home: '关系档案馆', checkin: '今日记录', discover: '目录',
  report: '关系简报', profile: '我的', pair: '建立关系',
  milestones: '关系纪念日', longdistance: '异地关系',
  'health-test': '关系体检', 'attachment-test': '依恋类型',
  community: '关系技巧', challenges: '今日任务', alignment: '双视角分析',
  'message-simulation': '聊天前预演', 'repair-protocol': '修复协议', methodology: '判断说明',
  courses: '成长内容', experts: '专业支持', membership: '会员',
  timeline: '时间轴', 'relationship-spaces': '关系空间',
}
const pageTitle = computed(() => titleMap[route.name] || '亲健 - 先看见，再靠近')

function formatDate(v) {
  if (!v) return ''
  const d = new Date(v)
  return `${d.getMonth() + 1}-${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

async function markRead() {
  const hadUnread = userStore.notifications.some((n) => !n.is_read)
  userStore.notifications.forEach((n) => { n.is_read = true })
  if (!hadUnread) return
  try { await api.markNotificationsRead() } catch {}
}

async function toggleNotifications() {
  showNotif.value = !showNotif.value
  if (showNotif.value) {
    await markRead()
  }
}

function goSearch() {
  const first = searchResults.value[0]
  if (first) {
    goTo(first.to)
    return
  }
  if (showToast) {
    showToast('没有找到匹配页面')
  }
}

function goTo(path) {
  searchQuery.value = ''
  searchOpen.value = false
  router.push(path)
}

function handleSearchBlur() {
  window.setTimeout(() => {
    searchOpen.value = false
  }, 120)
}

function handleLogout() {
  showNotif.value = false
  userStore.logout()
  router.replace('/auth')
}

function goBack() {
  showNotif.value = false
  if (window.history.length > 1) {
    router.back()
    return
  }
  router.push('/')
}
</script>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  height: var(--header-height);
  padding: 0 max(18px, calc((100vw - var(--content-max)) / 2));
  border-bottom: 1px solid rgba(44, 48, 39, 0.14);
  background:
    linear-gradient(105deg, rgba(240, 213, 184, 0.28), rgba(215, 104, 72, 0.12) 42%, rgba(223, 233, 221, 0.16)),
    rgba(255, 250, 244, 0.9);
  backdrop-filter: blur(18px);
  box-shadow: 0 8px 20px rgba(170, 77, 51, 0.08);
}
.header-back {
  flex: 0 0 auto;
  display: inline-grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: var(--seal-deep);
  cursor: pointer;
}
.header-back:hover {
  background: rgba(189, 75, 53, 0.08);
}
.header-left {
  display: flex;
  align-items: center;
  min-width: 0;
  gap: 11px;
}
.header-search {
  position: relative;
  flex: 1 1 320px;
  max-width: 520px;
  min-width: 180px;
}
.header-search__input {
  width: 100%;
  min-height: 38px;
  border-radius: 999px;
  padding: 0 16px;
  background: linear-gradient(135deg, rgba(240, 213, 184, 0.24), rgba(220, 235, 238, 0.18), rgba(255, 250, 244, 0.92));
}
.header-search__menu {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  z-index: 120;
  display: grid;
  gap: 6px;
  padding: 8px;
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-lg);
  background:
    linear-gradient(145deg, rgba(240, 213, 184, 0.24), rgba(215, 104, 72, 0.1), rgba(223, 233, 221, 0.14)),
    rgba(255, 250, 244, 0.94);
  box-shadow: var(--shadow-lg);
}
.header-search__item {
  display: grid;
  gap: 2px;
  width: 100%;
  padding: 10px 12px;
  border: 0;
  border-radius: var(--radius-md);
  background: transparent;
  text-align: left;
}
.header-search__item:hover {
  background: linear-gradient(135deg, rgba(240, 213, 184, 0.22), rgba(215, 104, 72, 0.08));
}
.header-search__item span {
  color: var(--seal);
  font-size: 11px;
  font-weight: 700;
}
.header-search__item strong {
  color: var(--ink);
  font-size: 14px;
}
.header-search__item p {
  color: var(--ink-soft);
  font-size: 12px;
  line-height: 1.45;
}
.header-logo-wrap {
  position: relative;
  width: 34px;
  height: 34px;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  border: 1px solid rgba(189, 75, 53, 0.32);
  border-radius: var(--radius-lg);
  background: linear-gradient(145deg, rgba(240, 213, 184, 0.26), rgba(215, 104, 72, 0.14), rgba(255, 250, 244, 0.92));
  box-shadow: var(--shadow-xs);
}
.header-logo {
  width: 26px;
  height: 26px;
  border-radius: var(--radius-md);
  object-fit: cover;
}
.header-copy {
  display: flex;
  align-items: baseline;
  min-width: 0;
  gap: 10px;
}
.header-brand {
  font-family: var(--font-serif);
  font-size: 18px;
  font-weight: 700;
  color: var(--seal-deep);
}
.header-sub {
  position: relative;
  padding-left: 10px;
  color: var(--ink-soft);
  font-size: 13px;
  font-weight: 700;
}
.header-sub::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0.45em;
  width: 1px;
  height: 0.9em;
  background: rgba(44, 48, 39, 0.22);
}
.header-right {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  gap: 8px;
}
.header-bell {
  position: relative;
  width: 36px;
  height: 36px;
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-lg);
  display: grid;
  place-items: center;
  color: var(--ink-soft);
  background: linear-gradient(145deg, rgba(240, 213, 184, 0.24), rgba(220, 235, 238, 0.12), rgba(255, 250, 244, 0.88));
  transition: transform 0.18s ease, background 0.18s ease, border-color 0.18s ease;
}
.header-bell:hover {
  transform: translateY(-1px);
  border-color: rgba(189, 75, 53, 0.32);
  background: linear-gradient(145deg, rgba(240, 213, 184, 0.3), rgba(215, 104, 72, 0.12), rgba(255, 250, 244, 0.94));
}

.bell-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  border-radius: var(--radius-sm);
  background: var(--danger);
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  display: grid;
  place-items: center;
}
.notif-overlay {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: rgba(37, 40, 33, 0.28);
  display: flex;
  justify-content: flex-end;
}
.notif-drawer {
  width: min(380px, 90vw);
  background:
    linear-gradient(160deg, rgba(240, 213, 184, 0.24), rgba(215, 104, 72, 0.1), rgba(223, 233, 221, 0.14)),
    rgba(255, 250, 244, 0.94);
  box-shadow: var(--shadow-lg);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.notif-drawer__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid var(--border-strong);
}
.notif-drawer__head h3 {
  font-family: var(--font-serif);
  font-size: 18px;
  font-weight: 700;
}
.notif-drawer__body {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

@media (max-width: 480px) {
  .app-header { padding: 0 12px; }
  .header-sub { display: none; }
  .header-action--optional { display: none; }
  .header-search { flex-basis: 180px; }
  .notif-drawer { width: 100vw; }
}
</style>
