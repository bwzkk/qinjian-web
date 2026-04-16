<template>
  <div class="community-page page-shell page-shell--wide page-stack">
    <div class="page-head page-head--split">
      <div>
        <p class="eyebrow">技巧</p>
        <h2>关系经营技巧</h2>
      </div>
      <button class="btn btn-ghost btn-sm" @click="$router.push('/discover')">返回</button>
    </div>
    <div class="card">
      <div class="card-header">
        <div><p class="eyebrow">推荐</p><h3>实用建议</h3></div>
        <div class="page-head__aside">
          <button class="btn btn-ghost btn-sm" @click="loadTips">刷新</button>
          <button class="btn btn-secondary btn-sm" @click="generateTip">生成建议</button>
        </div>
      </div>
      <div v-if="tips.length" class="stack-list">
        <div v-for="tip in tips" :key="tip.id" class="stack-item">
          <div class="stack-item__icon stack-item__icon--gold">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m12 2 1.9 5.8L20 10l-6.1 2.2L12 18l-1.9-5.8L4 10l6.1-2.2z" stroke-linejoin="round"/></svg>
          </div>
          <div class="stack-item__content">
            <strong>{{ tip.title || tip.content }}</strong>
            <div v-if="tip.description" class="stack-item__meta">{{ tip.description }}</div>
          </div>
        </div>
      </div>
      <div v-else class="empty-state">点击"生成建议"获取推荐。</div>
    </div>

    <div class="card">
      <div class="card-header">
        <div><p class="eyebrow">通知</p><h3>消息</h3></div>
        <button class="btn btn-ghost btn-sm" @click="loadNotifications">刷新</button>
      </div>
      <div v-if="notifications.length" class="stack-list">
        <div v-for="item in notifications" :key="item.id || item.created_at" class="stack-item">
          <div class="stack-item__icon stack-item__icon--warm">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M18 15V11a6 6 0 1 0-12 0v4l-2 2h16z"/><path d="M10 19a2 2 0 0 0 4 0"/></svg>
          </div>
          <div class="stack-item__content">
            <strong>{{ item.content }}</strong>
            <div class="stack-item__meta">{{ formatDate(item.created_at) }}</div>
          </div>
          <span v-if="!item.is_read" class="pill pill-warning">未读</span>
        </div>
      </div>
      <div v-else class="empty-state">暂无通知。</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, inject } from 'vue'
import { useUserStore } from '@/stores/user'
import { api } from '@/api'
import { cloneDemo, demoFixture } from '@/demo/fixtures'

const userStore = useUserStore()
const showToast = inject('showToast')
const tips = ref([])
const notifications = ref([])

onMounted(() => {
  loadTips()
  loadNotifications()
})

async function loadTips() {
  if (sessionStorage.getItem('qj_token') === 'demo-mode') {
    tips.value = cloneDemo(demoFixture.communityTips)
    return
  }
  try {
    const res = await api.getCommunityTips(userStore.currentPair?.type || 'couple')
    tips.value = Array.isArray(res) ? res : res.tips || []
  } catch { tips.value = [] }
}

async function generateTip() {
  if (sessionStorage.getItem('qj_token') === 'demo-mode') {
    tips.value = [
      { id: `tip-demo-${Date.now()}`, title: '先给对方一个可回答的问题', content: '把“你到底怎么想”换成“今晚你更想先休息，还是先聊 10 分钟？”' },
      ...tips.value,
    ]
    showToast('已生成一条样例建议')
    return
  }
  try {
    await api.generateTip(userStore.currentPair?.type || 'couple')
    showToast('建议生成中')
    setTimeout(() => loadTips(), 2000)
  } catch (e) { showToast(e.message || '生成失败') }
}

async function loadNotifications() {
  await userStore.loadNotifications()
  notifications.value = userStore.notifications
}

function formatDate(v) {
  if (!v) return ''
  const d = new Date(v)
  return `${d.getMonth() + 1}-${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}
</script>
