<template>
  <header class="app-header">
    <div class="header-left">
      <span class="header-logo-wrap">
        <img src="/qinjian-logo.jpg" alt="亲健 logo" class="header-logo" />
      </span>
      <div class="header-copy">
        <span class="header-brand">亲健</span>
        <span class="header-sub">先看见，再靠近</span>
      </div>
    </div>
    <div class="header-right">
      <button class="btn btn-secondary btn-sm" @click="$router.push('/checkin')">今日记录</button>
      <button v-if="userStore.notifications.length" class="header-bell" @click="showNotif = !showNotif">
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
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { api } from '@/api'

const route = useRoute()
const userStore = useUserStore()
const showNotif = ref(false)

const titleMap = {
  home: '关系档案馆', checkin: '今日记录', discover: '目录',
  report: '关系简报', profile: '我的', pair: '建立关系',
  milestones: '关系纪念日', longdistance: '异地关系',
  'health-test': '关系体检', 'attachment-test': '依恋类型',
  community: '关系技巧', challenges: '今日任务',
  courses: '成长内容', experts: '专业支持', membership: '会员',
  timeline: '时间轴',
}
const pageTitle = computed(() => titleMap[route.name] || '亲健 - 先看见，再靠近')

function formatDate(v) {
  if (!v) return ''
  const d = new Date(v)
  return `${d.getMonth() + 1}-${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

async function markRead() {
  try { await api.markNotificationsRead() } catch {}
  userStore.notifications.forEach((n) => { n.is_read = true })
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
    linear-gradient(90deg, rgba(189, 75, 53, 0.1), transparent 28%),
    rgba(251, 250, 246, 0.9);
  backdrop-filter: blur(18px);
}
.header-left {
  display: flex;
  align-items: center;
  min-width: 0;
  gap: 11px;
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
  background: #fffdfa;
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
  background: rgba(255, 253, 250, 0.56);
  transition: transform 0.18s ease, background 0.18s ease, border-color 0.18s ease;
}
.header-bell:hover {
  transform: translateY(-1px);
  border-color: rgba(189, 75, 53, 0.32);
  background: rgba(255, 253, 250, 0.94);
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
  background: var(--paper-soft);
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
  .notif-drawer { width: 100vw; }
}
</style>
