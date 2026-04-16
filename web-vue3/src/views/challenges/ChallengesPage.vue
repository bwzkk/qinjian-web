<template>
  <div class="challenges-page page-shell page-shell--wide page-stack">
    <div class="page-head page-head--split">
      <div>
        <p class="eyebrow">任务</p>
        <h2>今日任务</h2>
        <p>每天完成一点点，关系会慢慢变好。</p>
      </div>
      <button class="btn btn-ghost btn-sm" @click="$router.push('/discover')">返回</button>
    </div>

    <div class="challenge-shell">
      <div class="card card-accent">
        <p class="eyebrow">进度</p>
        <h3>今日完成 {{ percent }}%</h3>
        <p>连续打卡 {{ streakDays }} 天 · 已完成 {{ completed }}/{{ tasks.length }} 项。</p>
        <p v-if="strategy.reason" class="strategy-note">{{ strategy.reason }}</p>
        <p v-if="copyModeReason" class="strategy-note">{{ copyModeReason }}</p>
        <div class="progress-track" style="margin-top:14px;">
          <span class="progress-track__fill" :style="{ width: `${percent}%` }"></span>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <div>
            <p class="eyebrow">任务列表</p>
            <h3>今天可以做的事</h3>
          </div>
          <button class="btn btn-ghost btn-sm" @click="loadData">刷新</button>
        </div>
        <div v-if="tasks.length" class="stack-list">
          <div v-for="task in tasks" :key="task.id" class="stack-item challenge-item">
            <div class="stack-item__icon" :class="task.status === 'completed' ? 'done' : 'pending'">
              <svg v-if="task.status === 'completed'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m5 13 4 4L19 7" stroke-linecap="round" stroke-linejoin="round"/></svg>
              <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m12 2 1.9 5.8L20 10l-6.1 2.2L12 18l-1.9-5.8L4 10l6.1-2.2z" stroke-linejoin="round"/></svg>
            </div>
            <div class="stack-item__content">
              <strong>{{ task.title }}</strong>
              <div class="stack-item__meta">{{ task.description }}</div>
              <div v-if="task.copy_mode" class="stack-item__meta">{{ taskCopyText(task) }}</div>
              <div v-if="task.feedback?.note" class="stack-item__meta stack-item__meta--accent">{{ task.feedback.note }}</div>
            </div>
            <span v-if="task.status === 'completed'" class="pill">已完成</span>
            <button v-else class="btn btn-secondary btn-sm" @click="completeTask(task.id)">完成</button>
          </div>
        </div>
        <div v-else class="empty-state">今天还没有任务。</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, inject, onMounted, ref } from 'vue'
import { api } from '@/api'
import { useUserStore } from '@/stores/user'
import { cloneDemo, demoFixture } from '@/demo/fixtures'

const userStore = useUserStore()
const showToast = inject('showToast')

const tasksPayload = ref({ tasks: [] })
const streakPayload = ref({ streak: 0 })

const tasks = computed(() => tasksPayload.value.tasks || [])
const strategy = computed(() => tasksPayload.value.adaptive_strategy || {})
const completed = computed(() => tasks.value.filter((item) => item.status === 'completed').length)
const percent = computed(() => tasks.value.length ? Math.round((completed.value / tasks.value.length) * 100) : 0)
const streakDays = computed(() => streakPayload.value.streak || 0)
const copyModeReason = computed(() => {
  const count = Number(strategy.value.copy_feedback_count || 0)
  const suffix = count ? `（基于最近 ${count} 次反馈）` : ''
  const map = {
    clear: `你更偏好具体、一步一步的任务${suffix}。`,
    gentle: `你更适合低压力、允许缓冲的表达${suffix}。`,
    compact: `你更喜欢简短直接的任务描述${suffix}。`,
    example: `你更适合带参考示例的任务提示${suffix}。`,
  }
  return map[strategy.value.copy_mode] || ''
})

onMounted(loadData)

async function loadData() {
  if (sessionStorage.getItem('qj_token') === 'demo-mode') {
    tasksPayload.value = cloneDemo(demoFixture.tasks)
    streakPayload.value = cloneDemo(demoFixture.streak)
    return
  }
  const pairId = userStore.currentPair?.id
  if (!pairId) {
    tasksPayload.value = { tasks: [] }
    streakPayload.value = { streak: 0 }
    return
  }
  const [tasksResult, streakResult] = await Promise.allSettled([
    api.getDailyTasks(pairId),
    api.getCheckinStreak(pairId),
  ])
  tasksPayload.value = tasksResult.status === 'fulfilled' ? tasksResult.value : { tasks: [] }
  streakPayload.value = streakResult.status === 'fulfilled' ? streakResult.value : { streak: 0 }
}

async function completeTask(taskId) {
  if (sessionStorage.getItem('qj_token') === 'demo-mode') {
    const task = tasksPayload.value.tasks.find((item) => item.id === taskId)
    if (task) task.status = 'completed'
    showToast('任务已完成')
    return
  }
  try {
    await api.completeTask(taskId)
    showToast('任务已完成')
    await loadData()
  } catch (e) {
    showToast(e.message || '操作失败')
  }
}

function taskCopyText(task) {
  const category = {
    communication: '沟通类',
    repair: '修复类',
    activity: '陪伴类',
    reflection: '调节类',
    connection: '连接类',
  }[task.category] || '这类'
  const mode = {
    clear: '更具体',
    gentle: '更温和',
    compact: '更简短',
    example: '带示例',
  }[task.copy_mode] || ''
  return task.copy_mode_source === 'category'
    ? `${category}任务已调整为${mode}风格`
    : `任务说明已调整为${mode}风格`
}
</script>

<style scoped>
.challenge-shell {
  width: min(1040px, calc(100% - 56px));
  margin-left: auto;
  margin-right: auto;
}
.page-head--split {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}
.challenge-shell {
  display: grid;
  gap: 16px;
}
.challenge-shell h3 {
  font-family: var(--font-serif);
  font-size: 20px;
  margin-bottom: 6px;
}
.challenge-shell p {
  color: var(--ink-soft);
  font-size: 14px;
  line-height: 1.6;
}
.strategy-note {
  margin-top: 8px;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  background: var(--warm-50);
}
.challenge-item {
  align-items: flex-start;
}
.stack-item__icon.pending {
  background: var(--warm-100);
  color: var(--warm-600);
}
.stack-item__icon.done {
  background: var(--success-soft);
  color: var(--success);
}
.stack-item__meta--accent {
  color: var(--warm-600);
}
@media (max-width: 520px) {
  .challenges-page .page-head,
  .challenge-shell {
    width: min(100% - 24px, 1040px);
  }
  .page-head--split { flex-direction: column; }
  .challenge-item { flex-wrap: wrap; }
}
</style>
