<template>
  <div class="coach-page">
    <div class="page-head coach-head">
      <div>
        <p class="eyebrow">修复协议</p>
        <h2>先止损，再对话</h2>
        <p>根据当前关系状态，给出更稳的修复步骤、禁忌和安全边界。</p>
      </div>
      <div class="coach-head__actions">
        <button class="btn btn-ghost btn-sm" @click="loadProtocol">刷新</button>
        <button class="btn btn-primary btn-sm" @click="$router.push('/alignment')">双视角分析</button>
      </div>
    </div>

    <section v-if="protocol" class="protocol-hero glass-card">
      <div class="protocol-badge">
        <span>{{ protocol.level }}</span>
        <small>{{ protocol.protocol_type }}</small>
      </div>
      <div>
        <p class="eyebrow">当前方案</p>
        <h3>{{ protocol.title }}</h3>
        <p>{{ protocol.summary }}</p>
        <p class="protocol-hint">{{ protocol.timing_hint }}</p>
      </div>
    </section>

    <section v-if="protocol" class="coach-grid">
      <article class="card card-accent" v-for="step in protocol.steps" :key="step.sequence">
        <p class="eyebrow">步骤 {{ step.sequence }}</p>
        <h3>{{ step.title }}</h3>
        <p>{{ step.action }}</p>
        <small>{{ step.why }}</small>
      </article>
    </section>

    <section v-if="protocol" class="coach-lists">
      <article class="card">
        <p class="eyebrow">不要做</p>
        <ul class="plain-list">
          <li v-for="item in protocol.do_not" :key="item">{{ item }}</li>
        </ul>
      </article>
      <article class="card">
        <p class="eyebrow">有效信号</p>
        <h3>{{ protocol.success_signal }}</h3>
        <p>{{ protocol.escalation_rule }}</p>
      </article>
    </section>

    <section v-if="protocol" class="coach-lists">
      <article class="card">
        <p class="eyebrow">证据</p>
        <ul class="plain-list">
          <li v-for="item in protocol.evidence_summary" :key="item">{{ item }}</li>
        </ul>
      </article>
      <article class="card card-accent coach-card--warning">
        <p class="eyebrow">安全边界</p>
        <p>{{ protocol.safety_handoff || protocol.clinical_disclaimer }}</p>
      </article>
    </section>

    <div v-else class="report-empty">
      <strong>{{ loading ? '正在生成修复协议…' : '还没有修复协议' }}</strong>
      <p>需要先绑定关系。</p>
    </div>
  </div>
</template>

<script setup>
import { inject, onMounted, ref } from 'vue'
import { useUserStore } from '@/stores/user'
import { api } from '@/api'
import { cloneDemo, demoFixture } from '@/demo/fixtures'

const userStore = useUserStore()
const showToast = inject('showToast', () => {})
const protocol = ref(null)
const loading = ref(false)

onMounted(loadProtocol)

async function loadProtocol() {
  const pairId = userStore.currentPair?.id
  if (!pairId) {
    showToast('请先绑定关系')
    return
  }
  loading.value = true
  try {
    if (sessionStorage.getItem('qj_token') === 'demo-mode') {
      protocol.value = cloneDemo(demoFixture.repairProtocol)
      return
    }
    protocol.value = await api.getRepairProtocol(pairId)
  } catch (e) {
    protocol.value = null
    showToast(e.message || '修复协议获取失败')
  } finally {
    loading.value = false
  }
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

.protocol-hero {
  display: grid;
  grid-template-columns: 100px minmax(0, 1fr);
  gap: 18px;
  padding: 22px;
  border: 1px solid rgba(189, 75, 53, 0.22);
  margin-bottom: 16px;
}

.protocol-badge {
  display: grid;
  place-items: center;
  min-height: 100px;
  border-radius: var(--radius-lg);
  background: rgba(243, 216, 208, 0.36);
  color: var(--seal-deep);
  text-align: center;
}

.protocol-badge span {
  font-family: var(--font-serif);
  font-size: 24px;
  font-weight: 700;
}

.protocol-hint {
  margin-top: 10px;
  color: var(--ink-soft);
}

.coach-grid,
.coach-lists {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.coach-grid .card h3,
.coach-lists .card h3 {
  margin-top: 4px;
  font-family: var(--font-serif);
  font-size: 18px;
}

.coach-grid .card p:last-child,
.coach-lists .card p:last-child {
  margin-top: 10px;
  color: var(--ink-soft);
  line-height: 1.65;
}

.coach-grid small {
  display: block;
  margin-top: 10px;
  color: var(--ink-faint);
  line-height: 1.55;
}

.coach-card--warning {
  border-color: rgba(189, 75, 53, 0.3);
  background: rgba(243, 216, 208, 0.24);
}

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
  .protocol-hero,
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
