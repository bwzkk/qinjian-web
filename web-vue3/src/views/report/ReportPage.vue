<template>
  <div class="report-page">
    <div class="page-head report-head">
      <div>
        <p class="eyebrow">关系简报</p>
        <h2>读懂这段时间的关系状态</h2>
        <p>把复杂的感受整理成一份能看懂、能行动的关系报告。</p>
      </div>
      <button class="btn btn-primary btn-sm" @click="generateReport">刷新</button>
    </div>

    <div class="segmented report-tabs">
      <button :class="{ active: reportStore.reportType === 'daily' }" @click="switchType('daily')">日报</button>
      <button :class="{ active: reportStore.reportType === 'weekly' }" @click="switchType('weekly')">周报</button>
      <button :class="{ active: reportStore.reportType === 'monthly' }" @click="switchType('monthly')">月报</button>
    </div>

    <article v-if="report" class="report-paper">
      <header class="report-paper__head">
        <div>
          <p class="eyebrow">核心结论</p>
          <h3>{{ reportSummary }}</h3>
        </div>
        <div v-if="healthScore" class="report-score">
          <span>{{ healthScore }}</span>
          <small>关系温度</small>
        </div>
      </header>

      <div class="report-columns">
        <section v-if="insights.length" class="report-section">
          <p class="eyebrow">关键发现</p>
          <ul>
            <li v-for="(insight, i) in insights" :key="i">{{ insight }}</li>
          </ul>
        </section>
        <section v-if="recommendations.length" class="report-section report-section--accent">
          <p class="eyebrow">行动建议</p>
          <ul>
            <li v-for="(rec, i) in recommendations" :key="i">{{ rec }}</li>
          </ul>
        </section>
      </div>
    </article>

    <div v-else class="report-empty">
      <img src="/favicon.svg" alt="亲健" />
      <strong>还没有简报数据</strong>
      <p>点击“刷新”生成最新简报。</p>
    </div>

    <section v-if="history.length" class="report-history">
      <div class="report-history__head">
        <p class="eyebrow">历史简报</p>
        <h3>过往记录</h3>
      </div>
      <div class="history-timeline">
        <button v-for="item in history" :key="item.id" class="history-item" @click="loadReport(item)" type="button">
          <span>{{ formatDate(item.created_at) }}</span>
          <strong>{{ reportTypeLabel(item.report_type || item.type) }}</strong>
          <small v-if="item.health_score">健康分 {{ item.health_score }}</small>
          <i v-if="item.status === 'completed'">已完成</i>
        </button>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, inject } from 'vue'
import { useReportStore } from '@/stores/report'
import { useUserStore } from '@/stores/user'
import { cloneDemo, demoFixture } from '@/demo/fixtures'

const reportStore = useReportStore()
const userStore = useUserStore()
const showToast = inject('showToast')

const report = ref(null)
const history = ref([])

const healthScore = computed(() => report.value?.health_score || report.value?.content?.health_score || 0)
const reportSummary = computed(() =>
  report.value?.summary
  || report.value?.content?.insight
  || report.value?.content?.suggestion
  || '暂无结论'
)
const insights = computed(() =>
  report.value?.key_insights
  || report.value?.content?.highlights
  || report.value?.evidence_summary
  || []
)
const recommendations = computed(() =>
  report.value?.recommendations
  || report.value?.content?.recommendations
  || report.value?.content?.concerns
  || []
)

onMounted(async () => {
  await loadData()
})

async function loadData() {
  if (sessionStorage.getItem('qj_token') === 'demo-mode') {
    report.value = cloneDemo(demoFixture.latestReport)
    history.value = cloneDemo(demoFixture.reportHistory)
    return
  }
  const pairId = userStore.currentPair?.id || null
  try {
    report.value = await reportStore.loadLatest(pairId, reportStore.reportType)
  } catch {}
  try {
    await reportStore.loadHistory(pairId, reportStore.reportType)
    history.value = reportStore.reportHistory || []
  } catch {}
}

async function switchType(type) {
  reportStore.reportType = type
  await loadData()
}

async function generateReport() {
  const pairId = userStore.currentPair?.id || null
  try {
    await reportStore.generate(pairId, reportStore.reportType)
    showToast('简报生成中，请稍候...')
    setTimeout(() => loadData(), 3000)
  } catch (e) {
    showToast(e.message || '生成失败')
  }
}

function loadReport(item) {
  report.value = item.id === demoFixture.latestReport.id
    ? cloneDemo(demoFixture.latestReport)
    : item
}

function reportTypeLabel(type) {
  return type === 'weekly' ? '周报' : type === 'monthly' ? '月报' : '日报'
}

function formatDate(v) {
  if (!v) return ''
  const d = new Date(v)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
</script>

<style scoped>
.report-page {
  width: min(var(--content-max), calc(100% - 32px));
  margin: 0 auto;
  padding-bottom: 28px;
}

.report-head {
  width: 100%;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.report-tabs {
  width: min(430px, 100%);
  margin-bottom: 18px;
}

.report-paper {
  padding: 24px;
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-lg);
  background:
    linear-gradient(90deg, rgba(78, 116, 91, 0.08), transparent 34%),
    rgba(255, 253, 250, 0.78);
}

.report-paper__head {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 134px;
  gap: 22px;
  align-items: start;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--border);
}

.report-paper__head h3 {
  max-width: 800px;
  font-family: var(--font-serif);
  font-size: 27px;
  line-height: 1.55;
}

.report-score {
  display: grid;
  place-items: center;
  min-height: 118px;
  border: 1px solid rgba(189, 75, 53, 0.35);
  border-radius: var(--radius-lg);
  background: rgba(243, 216, 208, 0.34);
  color: var(--seal-deep);
  text-align: center;
}

.report-score span {
  font-family: var(--font-serif);
  font-size: 42px;
  font-weight: 700;
  line-height: 1;
}

.report-score small {
  color: var(--seal-deep);
  font-size: 12px;
  font-weight: 700;
}

.report-columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  margin-top: 18px;
}

.report-section {
  padding: 18px;
  border: 1px solid rgba(78, 116, 91, 0.22);
  border-radius: var(--radius-lg);
  background: rgba(255, 253, 250, 0.58);
}

.report-section--accent {
  border-color: rgba(189, 75, 53, 0.24);
  background: rgba(243, 216, 208, 0.22);
}

.report-section ul {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 10px;
  padding-left: 18px;
  color: var(--ink-soft);
  font-size: 14px;
  line-height: 1.75;
}

.report-empty {
  display: grid;
  place-items: center;
  min-height: 260px;
  padding: 36px 20px;
  border: 1px dashed rgba(78, 116, 91, 0.34);
  border-radius: var(--radius-lg);
  color: var(--ink-soft);
  background: rgba(255, 253, 250, 0.52);
  text-align: center;
}

.report-empty img {
  width: 44px;
  height: 44px;
  margin-bottom: 12px;
  border-radius: var(--radius-lg);
}

.report-empty strong {
  color: var(--ink);
  font-family: var(--font-serif);
  font-size: 18px;
}

.report-history {
  margin-top: 18px;
  padding-top: 18px;
  border-top: 1px solid var(--border-strong);
}

.report-history__head h3 {
  font-family: var(--font-serif);
  font-size: 21px;
}

.history-timeline {
  display: grid;
  gap: 8px;
  margin-top: 12px;
}

.history-item {
  display: grid;
  grid-template-columns: 120px 1fr auto auto;
  gap: 12px;
  align-items: center;
  width: 100%;
  padding: 12px 14px;
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  background: rgba(255, 253, 250, 0.64);
  text-align: left;
  transition: transform 0.18s ease, background 0.18s ease, border-color 0.18s ease;
}

.history-item:hover {
  transform: translateY(-1px);
  border-color: rgba(189, 75, 53, 0.28);
  background: rgba(255, 253, 250, 0.92);
}

.history-item span,
.history-item small {
  color: var(--ink-faint);
  font-size: 12px;
}

.history-item strong {
  color: var(--ink);
  font-size: 14px;
}

.history-item i {
  padding: 3px 8px;
  border: 1px solid rgba(77, 122, 85, 0.24);
  border-radius: var(--radius-md);
  color: var(--success);
  background: var(--success-soft);
  font-size: 12px;
  font-style: normal;
  font-weight: 700;
}

@media (max-width: 760px) {
  .report-head,
  .report-paper__head,
  .report-columns,
  .history-item {
    grid-template-columns: 1fr;
  }

  .report-head {
    display: grid;
  }

  .report-score {
    min-height: 96px;
  }
}

@media (max-width: 600px) {
  .report-page {
    width: min(100% - 24px, var(--content-max));
  }

  .report-paper {
    padding: 16px;
  }

  .report-paper__head h3 {
    font-size: 21px;
  }
}
</style>
