<template>
  <div class="ld-page page-shell page-shell--narrow page-stack">
    <div class="page-head page-head--split">
      <div>
        <p class="eyebrow">异地</p>
        <h2>异地关系</h2>
      </div>
      <button class="btn btn-ghost btn-sm" @click="$router.push('/discover')">返回</button>
    </div>
    <div class="card card-accent">
      <div class="card-header"><div><p class="eyebrow">健康指数</p><h3>关系健康度</h3></div></div>
      <div v-if="health.health_index !== undefined" class="ld-score">
        <span class="ld-score__num">{{ health.health_index }}</span>
        <span class="ld-score__label">/ 100</span>
      </div>
      <div v-else class="empty-state">加载中...</div>
    </div>
    <div class="card">
      <div class="card-header"><div><p class="eyebrow">快捷</p><h3>创建同步活动</h3></div></div>
      <div class="option-grid option-grid--compact">
        <button v-for="(label, type) in ACTIVITIES" :key="type" class="select-card" @click="createActivity(type)" type="button">{{ label }}</button>
      </div>
    </div>
    <div class="card">
      <div class="card-header"><div><p class="eyebrow">活动</p><h3>近期的异地互动</h3></div></div>
      <div v-if="activities.length" class="stack-list">
        <div v-for="a in activities" :key="a.id" class="stack-item">
          <div class="stack-item__icon stack-item__icon--sage">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m12 2 1.9 5.8L20 10l-6.1 2.2L12 18l-1.9-5.8L4 10l6.1-2.2z" stroke-linejoin="round"/></svg>
          </div>
          <div class="stack-item__content">
            <strong>{{ ACTIVITIES[a.activity_type] || a.activity_type }}</strong>
            <div class="stack-item__meta">{{ a.status === 'completed' ? '已完成' : '进行中' }}</div>
          </div>
        </div>
      </div>
      <div v-else class="empty-state">还没有异地互动记录。</div>
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
const ACTIVITIES = { movie: '一起看电影', meal: '共享一顿饭', chat: '视频深聊', gift: '寄一份礼物', exercise: '同步运动' }
const health = ref({})
const activities = ref([])

onMounted(() => loadData())

async function loadData() {
  if (sessionStorage.getItem('qj_token') === 'demo-mode') {
    health.value = cloneDemo(demoFixture.longDistance.health)
    activities.value = cloneDemo(demoFixture.longDistance.activities)
    return
  }
  const pairId = userStore.currentPair?.id
  if (!pairId) return
  try { health.value = await api.getLongDistanceHealth(pairId) } catch {}
  try { const res = await api.getLongDistanceActivities(pairId); activities.value = Array.isArray(res) ? res : [] } catch {}
}

async function createActivity(type) {
  if (sessionStorage.getItem('qj_token') === 'demo-mode') {
    activities.value = [
      { id: `ld-demo-${Date.now()}`, activity_type: type, status: 'pending' },
      ...activities.value,
    ]
    showToast('预览里已创建同步活动')
    return
  }
  const pairId = userStore.currentPair?.id
  if (!pairId) { showToast('请先绑定关系'); return }
  try {
    await api.createLongDistanceActivity(pairId, type, ACTIVITIES[type])
    showToast('活动已创建')
    await loadData()
  } catch (e) { showToast(e.message || '创建失败') }
}
</script>

<style scoped>
.ld-score { text-align: center; padding: 16px 0; }
.ld-score__num { font-size: 48px; font-weight: 700; color: var(--warm-600); font-family: var(--font-serif); }
.ld-score__label { font-size: 16px; color: var(--ink-faint); }
</style>
