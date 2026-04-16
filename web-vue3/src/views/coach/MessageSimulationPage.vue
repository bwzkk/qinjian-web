<template>
  <div class="coach-page">
    <div class="page-head coach-head">
      <div>
        <p class="eyebrow">聊天前预演</p>
        <h2>发出去之前先看一眼可能的后果</h2>
        <p>识别对方可能先听成什么、这句话最容易卡在哪里。</p>
      </div>
      <div class="coach-head__actions">
        <button class="btn btn-ghost btn-sm" @click="loadPreview">刷新</button>
        <button class="btn btn-primary btn-sm" @click="$router.push('/alignment')">双视角分析</button>
      </div>
    </div>

    <section class="card card-accent coach-form">
      <div class="card-header">
        <div>
          <p class="eyebrow">消息草稿</p>
          <h3>先把准备发的话贴进来</h3>
        </div>
        <button class="btn btn-secondary btn-sm" :disabled="loading" @click="runSimulation">
          {{ loading ? '预演中...' : '开始预演' }}
        </button>
      </div>
      <label class="field">
        <span>草稿内容</span>
        <textarea v-model="draft" class="input input-textarea" rows="5" placeholder="输入你准备发出去的话"></textarea>
      </label>
    </section>

    <section v-if="result" class="coach-grid">
      <article class="card">
        <p class="eyebrow">对方视角</p>
        <h3>{{ result.partner_view }}</h3>
        <p>{{ result.likely_impact }}</p>
      </article>
      <article class="card card-accent" :class="riskClass">
        <p class="eyebrow">风险</p>
        <h3>{{ riskLabel }}</h3>
        <p>{{ result.risk_reason }}</p>
      </article>
      <article class="card">
        <p class="eyebrow">更安全的说法</p>
        <h3>改写版本</h3>
        <p>{{ result.safer_rewrite }}</p>
      </article>
      <article class="card">
        <p class="eyebrow">建议目标</p>
        <h3>{{ result.conversation_goal }}</h3>
        <p>{{ result.suggested_tone }}</p>
      </article>
    </section>

    <section v-if="result" class="coach-lists">
      <article class="card">
        <p class="eyebrow">建议做</p>
        <ul class="plain-list">
          <li v-for="item in result.do_list" :key="item">{{ item }}</li>
        </ul>
      </article>
      <article class="card">
        <p class="eyebrow">先别做</p>
        <ul class="plain-list">
          <li v-for="item in result.avoid_list" :key="item">{{ item }}</li>
        </ul>
      </article>
    </section>

    <div v-else class="report-empty">
      <strong>{{ loading ? '正在预演这条消息…' : '还没有预演结果' }}</strong>
      <p>输入内容后点击开始预演。</p>
    </div>
  </div>
</template>

<script setup>
import { computed, inject, onMounted, ref } from 'vue'
import { useUserStore } from '@/stores/user'
import { api } from '@/api'
import { cloneDemo, demoFixture } from '@/demo/fixtures'

const userStore = useUserStore()
const showToast = inject('showToast', () => {})
const draft = ref('')
const result = ref(null)
const loading = ref(false)

const riskLabel = computed(() => {
  const map = { low: '低风险', medium: '中风险', high: '高风险', severe: '高风险' }
  return map[result.value?.risk_level] || '未评估'
})

const riskClass = computed(() => {
  const level = result.value?.risk_level
  if (level === 'high' || level === 'severe') return 'coach-risk--high'
  if (level === 'medium') return 'coach-risk--medium'
  return 'coach-risk--low'
})

onMounted(() => {
  if (sessionStorage.getItem('qj_token') === 'demo-mode') {
    draft.value = demoFixture.messageSimulation.draft
  }
})

async function loadPreview() {
  const pairId = userStore.currentPair?.id
  if (!pairId) {
    showToast('请先绑定关系')
    return
  }
  loading.value = true
  try {
    if (sessionStorage.getItem('qj_token') === 'demo-mode') {
      result.value = cloneDemo(demoFixture.messageSimulation)
      if (!draft.value) draft.value = demoFixture.messageSimulation.draft
      return
    }
    result.value = await api.simulateMessage(pairId, draft.value)
  } catch (e) {
    result.value = null
    showToast(e.message || '预演失败')
  } finally {
    loading.value = false
  }
}

async function runSimulation() {
  if (!draft.value.trim()) {
    showToast('请先输入准备发出的内容')
    return
  }
  await loadPreview()
}
</script>

<style scoped>
.coach-page {
  width: min(var(--content-max), calc(100% - 32px));
  margin: 0 auto;
  padding-bottom: 28px;
}

.coach-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.coach-head__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.coach-form {
  margin-bottom: 16px;
}

.coach-grid,
.coach-lists {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.coach-grid .card h3 {
  margin-top: 4px;
  font-family: var(--font-serif);
  font-size: 18px;
}

.coach-grid .card p:last-child {
  margin-top: 10px;
  color: var(--ink-soft);
  line-height: 1.65;
}

.coach-risk--low { border-color: rgba(77, 122, 85, 0.25); }
.coach-risk--medium { border-color: rgba(189, 134, 53, 0.25); background: rgba(244, 233, 209, 0.24); }
.coach-risk--high { border-color: rgba(189, 75, 53, 0.3); background: rgba(243, 216, 208, 0.24); }

.plain-list {
  display: grid;
  gap: 10px;
  margin-top: 10px;
  padding-left: 18px;
  color: var(--ink-soft);
  line-height: 1.65;
}

.report-empty {
  display: grid;
  place-items: center;
  min-height: 220px;
  padding: 28px;
  border: 1px dashed rgba(78, 116, 91, 0.34);
  border-radius: var(--radius-lg);
  text-align: center;
}

@media (max-width: 760px) {
  .coach-head,
  .coach-grid,
  .coach-lists {
    grid-template-columns: 1fr;
  }

  .coach-head {
    display: grid;
  }
}

@media (max-width: 600px) {
  .coach-page {
    width: min(100% - 24px, var(--content-max));
  }
}
</style>
