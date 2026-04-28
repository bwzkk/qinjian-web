<template>
  <div class="alignment-page">
    <div class="page-head alignment-head">
      <div>
        <p class="eyebrow">双方看法</p>
        <h2>双方怎么理解这件事</h2>
      </div>
      <div class="alignment-head__actions">
        <button
          class="btn btn-ghost btn-sm"
          :disabled="loading || generating || !canGenerate"
          @click="handleGenerateAlignment"
        >
          {{ generateButtonLabel }}
        </button>
        <button class="btn btn-primary btn-sm" @click="$router.push('/report')">去看简报</button>
      </div>
    </div>

    <section v-if="alignment" class="alignment-hero">
      <div class="alignment-score">
        <span>{{ alignment.alignment_score }}</span>
      </div>
      <div class="alignment-summary">
        <p class="eyebrow">两边都在意的点</p>
        <h3>{{ alignment.shared_story }}</h3>
        <p>{{ alignment.coach_note }}</p>
      </div>
    </section>

    <section v-if="alignment" class="alignment-feedback-strip">
      <article class="card alignment-feedback-card">
        <div class="card-header">
          <div>
            <p class="eyebrow">这次反馈</p>
            <h3>这版不对就直接标出来</h3>
          </div>
        </div>
        <div class="feedback-row">
          <button v-for="option in feedbackOptions" :key="option.value" class="btn btn-ghost btn-sm" @click="submitFeedback(option.value)">
            {{ option.label }}
          </button>
        </div>
        <label class="field">
          <span>备注</span>
          <textarea v-model="feedbackNote" class="input input-textarea" rows="3" placeholder="哪里不对，写一句就行。"></textarea>
        </label>
      </article>
    </section>

    <section v-if="alignment" class="alignment-grid">
      <article class="card card-accent">
        <p class="eyebrow">你这边看到的</p>
        <p>{{ alignment.view_a_summary }}</p>
      </article>
      <article class="card card-accent">
        <p class="eyebrow">对方那边看到的</p>
        <p>{{ alignment.view_b_summary }}</p>
      </article>
      <article class="card card-accent alignment-card--warning">
        <p class="eyebrow">容易错位的地方</p>
        <h3>你们听成的可能不是一回事</h3>
        <p>{{ alignment.misread_risk }}</p>
      </article>
      <article class="card card-accent">
        <p class="eyebrow">可以这样开口</p>
        <h3>先让对方听进去</h3>
        <p>{{ alignment.suggested_opening || '暂时还没有合适的开场白。' }}</p>
      </article>
      <article class="card alignment-card--wide">
        <p class="eyebrow">和平时相比</p>
        <h3>{{ reactionShiftLabel }}</h3>
      </article>
    </section>

    <section v-if="alignment" class="alignment-lists">
      <article class="card">
        <div class="card-header">
          <div>
            <p class="eyebrow">没说到一起的地方</p>
            <h3>可能不是不在乎，只是理解位置不同</h3>
          </div>
        </div>
        <ul class="plain-list">
          <li v-for="item in alignment.divergence_points" :key="item">{{ item }}</li>
        </ul>
      </article>
      <article class="card">
        <div class="card-header">
          <div>
            <p class="eyebrow">下一步</p>
            <h3>先做哪一步更容易聊下去</h3>
          </div>
        </div>
        <ul class="plain-list">
          <li v-for="item in alignment.bridge_actions" :key="item">{{ item }}</li>
        </ul>
      </article>
      <article v-if="displayDeviationReasons.length" class="card alignment-list-card--wide">
        <div class="card-header">
          <div>
            <p class="eyebrow">和平时不一样的地方</p>
            <h3>这一次为什么更容易走偏</h3>
          </div>
        </div>
        <ul class="plain-list">
          <li v-for="item in displayDeviationReasons" :key="item">{{ item }}</li>
        </ul>
      </article>
    </section>

    <div v-else class="report-empty">
      <strong>{{ emptyStateTitle }}</strong>
      <p>{{ emptyStateBody }}</p>
      <div class="empty-actions">
        <button class="btn btn-primary btn-sm" @click="$router.push('/checkin')">去记录</button>
        <button v-if="showPairAction" class="btn btn-ghost btn-sm" @click="$router.push('/pair')">
          去建立关系
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, inject, onMounted, ref } from 'vue'
import { useUserStore } from '@/stores/user'
import { api } from '@/api'
import { cloneDemo, demoFixture } from '@/demo/fixtures'
import { decisionFeedbackLabel } from '@/utils/displayText'
import { featureUnavailableReason, resolveExperienceMode } from '@/utils/experienceMode'
import { createRefreshAttemptGuard } from '@/utils/refreshGuards'

const userStore = useUserStore()
const showToast = inject('showToast', () => {})
const alignment = ref(null)
const loading = ref(false)
const generating = ref(false)
const emptyHint = ref('')
const feedbackNote = ref('')
const alignmentRefreshGuard = createRefreshAttemptGuard({ maxAttempts: 2, windowMs: 60 * 1000 })

const experienceMode = computed(() =>
  resolveExperienceMode({
    isDemoMode: userStore.isDemoMode,
    testingUnrestricted: userStore.testingUnrestricted,
    activePairId: userStore.activePairId,
    currentPair: userStore.currentPair,
    pairs: userStore.pairs,
  })
)

const feedbackOptions = [
  { value: 'judgement_too_high', label: decisionFeedbackLabel('judgement_too_high') },
  { value: 'judgement_too_low', label: decisionFeedbackLabel('judgement_too_low') },
  { value: 'direction_off', label: decisionFeedbackLabel('direction_off') },
  { value: 'copy_unnatural', label: decisionFeedbackLabel('copy_unnatural') },
  { value: 'acceptable', label: decisionFeedbackLabel('acceptable') },
]

const inlineCodeLabels = {
  long: '偏长',
  medium: '适中',
  short: '偏短',
  intense: '强烈',
  gentle: '温和',
  warm: '温暖',
  neutral: '平稳',
  withdraw: '退开',
  defend: '防御',
  urgent: '急着追问',
  repair: '缓和',
  seek_support: '寻求安慰',
  clarify: '澄清',
  reflect: '复盘',
  zh: '中文',
  en: '英文',
  mixed: '中英混合',
}

const reactionShiftCopy = {
  more_defensive: '这次更像在防御或顶回去。',
  more_withdrawn: '这次更像在退开或关掉沟通。',
  more_urgent: '这次更急，更容易把压力推高。',
  more_repair_oriented: '这次更想缓和，或重新接上。',
  more_support_seeking: '这次更像在寻求安慰和回应。',
  more_clarifying: '这次更像在试图先对齐理解。',
  more_reflective: '这次更像在复盘和整理。',
  shifted: '这次的反应模式和近期常态有变化。',
}

const reactionShiftLabel = computed(() => {
  const shift = String(alignment.value?.reaction_shift || '').trim()
  if (!shift || shift === 'stable') return '双方这次的反应大体还在各自平时范围内'
  if (shift === 'unknown') return '之前记录还不够，先按这一次的内容和前后情况来看'
  return shift
    .split(/[；;]/)
    .map((part) => renderReactionShift(part.trim()))
    .filter(Boolean)
    .join('；')
})

const historyLabel = computed(() => {
  const map = {
    sufficient: '这次参考了比较稳定的近期记录。',
    limited: '这次只参考了少量记录，先当提醒看。',
    insufficient: '记录还不够，暂时不把它当成“异常”。',
  }
  return map[alignment.value?.history_sufficiency] || '亲健会继续参考后面的记录，再看这是不是和平时不太一样。'
})

const displayDeviationReasons = computed(() =>
  (alignment.value?.deviation_reasons || []).map(translateInlineCodes)
)

const confidenceLine = computed(() => {
  const confidence = Number(alignment.value?.confidence)
  const parts = []
   if (Number.isFinite(confidence)) parts.push(`把握度 ${confidence.toFixed(2)}`)
   if (alignment.value?.is_fallback) parts.push('备用说法')
  return parts.join(' · ')
})

const canGenerate = computed(() =>
  experienceMode.value.canUseDualPerspective
  && (
    experienceMode.value.canBypassFeatureGates
    || !String(emptyHint.value || '').includes('还没有足够的双方记录')
  )
)

const generateButtonLabel = computed(() => {
  if (generating.value) return '整理中…'
  if (experienceMode.value.isDemoMode) return alignment.value ? '刷新样例' : '查看样例'
  if (!experienceMode.value.canUseDualPerspective) return '需要双方记录'
  return alignment.value ? '重新整理' : '整理双视角'
})

const modeIntro = computed(() => {
  if (experienceMode.value.isDemoMode) {
    return '双视角样例。'
  }
  if (experienceMode.value.canUseDualPerspective) {
    return '对照双方真实记录。'
  }
  return '双方都留下记录后再看。'
})

const showPairAction = computed(() =>
  !experienceMode.value.isDemoMode && experienceMode.value.isSoloExperience
)

const emptyStateTitle = computed(() => {
  if (loading.value) return '正在查看最近一次结果…'
  if (generating.value) return '正在把两边的话放到一起…'
  if (String(emptyHint.value || '').includes('还没有现成的双视角分析')) {
    return '还没有双视角结果'
  }
  if (!experienceMode.value.canUseDualPerspective) return '双视角需要双方记录'
  return '还没凑齐双方记录'
})

const emptyStateBody = computed(() => {
  if (loading.value) return '正在读取最近结果。'
  if (generating.value) return '这次会按最新记录重新整理。'
  return emptyHint.value || '双方都有记录后可整理。'
})

onMounted(loadAlignment)

function renderReactionShift(value) {
  if (!value) return ''
  const [label, code] = value.split(/[：:]/).map((item) => item.trim())
  if (code && reactionShiftCopy[code]) return reactionShiftCopy[code]
  if (code) return translateInlineCodes(code)
  if (reactionShiftCopy[label]) return reactionShiftCopy[label]
  return translateInlineCodes(value)
}

function translateInlineCodes(value) {
  const pattern = new RegExp(`\\b(${Object.keys(inlineCodeLabels).join('|')})\\b`, 'g')
  return String(value || '').replace(pattern, (match) => inlineCodeLabels[match] || match)
}

async function loadAlignment() {
  try {
    if (experienceMode.value.isDemoMode) {
      alignment.value = cloneDemo(demoFixture.narrativeAlignment)
      emptyHint.value = ''
      feedbackNote.value = ''
      return
    }
    if (!experienceMode.value.canUseDualPerspective) {
      alignment.value = null
      emptyHint.value = featureUnavailableReason('dual-perspective', experienceMode.value)
      feedbackNote.value = ''
      return
    }
    loading.value = true
    const pairId = experienceMode.value.activePairId
    const latestAlignment = await api.getLatestNarrativeAlignment(pairId)
    if (!latestAlignment) {
      alignment.value = null
      emptyHint.value = '还没有双视角结果，点“整理双视角”试试。'
      feedbackNote.value = ''
      return
    }
    alignment.value = latestAlignment
    emptyHint.value = ''
    feedbackNote.value = ''
  } catch (e) {
    alignment.value = null
    if (e.statusCode === 404) {
      emptyHint.value = e.message || '还没有双视角结果。'
      return
    }
    emptyHint.value = ''
    showToast(e.message || '这次没整理出来，请稍后再试')
  } finally {
    loading.value = false
  }
}

async function generateAlignment({ force = false } = {}) {
  generating.value = true
  try {
    if (experienceMode.value.isDemoMode) {
      alignment.value = cloneDemo(demoFixture.narrativeAlignment)
      emptyHint.value = ''
      feedbackNote.value = ''
      return
    }
    if (!experienceMode.value.canUseDualPerspective) {
      alignment.value = null
      emptyHint.value = featureUnavailableReason('dual-perspective', experienceMode.value)
      return
    }
    const pairId = experienceMode.value.activePairId
    alignment.value = await api.generateNarrativeAlignment(pairId, { force })
    emptyHint.value = ''
    feedbackNote.value = ''
  } catch (e) {
    if (e.statusCode === 404) {
      alignment.value = null
      emptyHint.value = e.message || '还没有足够的双方记录。'
      return
    }
    showToast(e.message || '这次没整理出来，请稍后再试')
  } finally {
    generating.value = false
  }
}

function handleGenerateAlignment() {
  const remainingSeconds = alignmentRefreshGuard.getRemainingSeconds()
  if (remainingSeconds > 0) {
    showToast(`双视角整理得有点频繁了，请 ${remainingSeconds} 秒后再试`)
    return
  }
  alignmentRefreshGuard.markRun()
  return generateAlignment({ force: Boolean(alignment.value) })
}

async function submitFeedback(feedbackType) {
  if (experienceMode.value.isDemoMode) {
    showToast('演示模式下不写回反馈')
    return
  }
  const eventId = alignment.value?.event_id
  if (!eventId) {
    showToast('这条结果还不能反馈')
    return
  }
  try {
    await api.submitDecisionFeedback(eventId, feedbackType, feedbackNote.value.trim())
    showToast('反馈已记录')
    feedbackNote.value = ''
  } catch (e) {
    showToast(e.message || '反馈没提交上')
  }
}
</script>

<style scoped>
.alignment-page {
  width: min(var(--content-max), calc(100% - 32px));
  margin: 0 auto;
  padding-bottom: 28px;
}

.alignment-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.alignment-head__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.alignment-hero {
  position: relative;
  display: grid;
  grid-template-columns: 120px minmax(0, 1fr);
  gap: 20px;
  padding: 22px;
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-lg);
  background:
    radial-gradient(circle at 90% 0%, rgba(240, 213, 184, 0.34), transparent 28%),
    linear-gradient(180deg, rgba(255, 252, 247, 0.95), rgba(247, 239, 230, 0.86));
  box-shadow: 0 18px 36px rgba(91, 67, 51, 0.06);
  margin-bottom: 16px;
}
.alignment-hero::before {
  content: "";
  position: absolute;
  left: 22px;
  top: 0;
  width: 80px;
  height: 1px;
  background: linear-gradient(90deg, rgba(215, 104, 72, 0.5), rgba(215, 104, 72, 0));
}

.alignment-score {
  display: grid;
  place-items: center;
  min-height: 120px;
  border-radius: var(--radius-lg);
  border: 1px solid rgba(189, 75, 53, 0.16);
  background: rgba(255, 247, 242, 0.86);
  color: var(--seal-deep);
}

.alignment-score span {
  font-family: var(--font-serif);
  font-size: 42px;
  font-weight: 700;
  line-height: 1;
}

.alignment-summary h3 {
  font-family: var(--font-serif);
  font-size: 24px;
  line-height: 1.45;
}

.alignment-summary p:last-child {
  margin-top: 10px;
  color: var(--ink-soft);
  line-height: 1.7;
}

.alignment-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.alignment-feedback-strip {
  display: grid;
  margin-bottom: 16px;
}

.alignment-feedback-card {
  height: auto;
}

.alignment-grid .card h3 {
  margin-top: 4px;
  font-family: var(--font-serif);
  font-size: 18px;
}

.alignment-grid .card p:last-child {
  margin-top: 10px;
  color: var(--ink-soft);
  line-height: 1.72;
}

.alignment-card--warning {
  border-color: rgba(189, 75, 53, 0.3);
  background:
    linear-gradient(180deg, rgba(243, 216, 208, 0.38), rgba(255, 251, 247, 0.82));
}

.alignment-card--wide {
  grid-column: 1 / -1;
}

.alignment-lists {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.alignment-lists > .card {
  height: 100%;
}

.alignment-list-card--wide {
  grid-column: 1 / -1;
}

.plain-list {
  display: grid;
  gap: 10px;
  margin-top: 10px;
  padding-left: 18px;
  color: var(--ink-soft);
  line-height: 1.65;
}

.feedback-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.empty-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 14px;
}

.field {
  display: grid;
  gap: 8px;
  margin-top: 14px;
}

.report-empty {
  display: grid;
  place-items: center;
  min-height: 220px;
  padding: 28px;
  border: 1px dashed rgba(67, 98, 115, 0.28);
  border-radius: var(--radius-lg);
  background: rgba(255, 253, 250, 0.72);
  text-align: center;
}

@media (max-width: 760px) {
  .alignment-head,
  .alignment-hero,
  .alignment-grid,
  .alignment-lists,
  .alignment-feedback-strip {
    grid-template-columns: 1fr;
  }

  .alignment-head {
    display: grid;
  }
}

@media (max-width: 600px) {
  .alignment-page {
    width: min(100% - 20px, var(--content-max));
  }

  .alignment-hero {
    padding: 16px;
  }

  .alignment-summary h3 {
    font-size: 21px;
  }
}
</style>
