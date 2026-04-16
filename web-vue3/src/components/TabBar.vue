<template>
  <nav class="tab-bar">
    <router-link
      v-for="tab in tabs"
      :key="tab.to"
      :to="tab.to"
      class="tab-item"
      :class="{ active: isActive(tab.to) }"
    >
      <span class="tab-icon" v-html="tab.icon" />
      <span class="tab-label">{{ tab.label }}</span>
    </router-link>
  </nav>
</template>

<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()

const tabs = [
  { to: '/', label: '首页', icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/><path d="M9 21v-6h6v6"/></svg>' },
  { to: '/checkin', label: '今日记录', icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>' },
  { to: '/discover', label: '总览', icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="m14.8 9.2-2.3 6.1-6.1 2.3 2.3-6.1z" stroke-linecap="round"/></svg>' },
  { to: '/report', label: '简报', icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 19h16"/><path d="M7 16v-4"/><path d="M12 16V8"/><path d="M17 16V5"/></svg>' },
  { to: '/profile', label: '我的', icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="8" r="4"/><path d="M5 20a7 7 0 0 1 14 0" stroke-linecap="round"/></svg>' },
]

function isActive(path) {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}
</script>

<style scoped>
.tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
  display: flex;
  align-items: stretch;
  height: var(--tabbar-height);
  padding-bottom: env(safe-area-inset-bottom, 0px);
  border-top: 1px solid rgba(44, 48, 39, 0.16);
  background:
    linear-gradient(95deg, rgba(240, 213, 184, 0.26), rgba(215, 104, 72, 0.12) 50%, rgba(223, 233, 221, 0.14)),
    rgba(255, 250, 244, 0.92);
  backdrop-filter: blur(18px);
  box-shadow: 0 -8px 20px rgba(170, 77, 51, 0.08);
}
.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  text-decoration: none;
  color: var(--ink-faint);
  transition: color 0.2s, transform 0.2s;
  position: relative;
}
.tab-item::before {
  content: "";
  position: absolute;
  top: 7px;
  width: 22px;
  height: 3px;
  border-radius: var(--radius-sm);
  background: transparent;
  transition: background 0.2s;
}
.tab-item.active {
  color: var(--seal-deep);
}
.tab-item.active::before {
  background: var(--seal);
}
.tab-item.active .tab-icon {
  transform: translateY(-1px);
}
.tab-icon {
  display: flex;
  margin-top: 5px;
  transition: transform 0.2s;
}
.tab-label {
  font-size: 11px;
  font-weight: 700;
}
.tab-item:hover {
  color: var(--moss-deep);
}
</style>
