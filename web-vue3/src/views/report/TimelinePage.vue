<template>
  <div class="timeline-page">
    <div class="page-head page-head--split">
      <div>
        <p class="eyebrow">关系时间轴</p>
        <h2>最近发生了什么</h2>
      </div>
      <div class="page-head__aside">
        <button class="btn btn-ghost" @click="openReportPage">回简报</button>
        <button class="btn btn-primary" :disabled="loadingEvents" @click="handleRefreshTimelinePage">
          {{ loadingEvents ? '整理中...' : '刷新时间轴' }}
        </button>
      </div>
    </div>

    <section class="timeline-hero card card-accent">
      <div class="timeline-hero__copy">
        <p class="eyebrow">总览</p>
        <h3>时间轴节点</h3>
      </div>
      <div class="timeline-hero__stats" aria-label="关系档案摘要">
        <div class="timeline-hero__stat">
          <span>事件</span>
          <strong>{{ timelineEventCount }}</strong>
        </div>
        <div class="timeline-hero__stat">
          <span>最新</span>
          <strong>{{ latestEventLabel }}</strong>
        </div>
      </div>
    </section>

    <section class="timeline-events card">
      <div class="timeline-events__head">
        <div>
          <p class="eyebrow">关系事件</p>
          <h3>关键动作</h3>
        </div>
        <span class="timeline-events__latest">
          {{ latestEventLabel === '暂无' ? '暂无新动作' : latestEventLabel }}
        </span>
      </div>

      <div v-if="timelineHighlights.length" class="tag-cloud timeline-events__highlights">
        <span v-for="highlight in timelineHighlights" :key="highlight" class="tag">{{ highlight }}</span>
      </div>

      <div v-if="loadingEvents && !timelineEvents.length" class="timeline-events__empty">
        正在整理最近事件…
      </div>
      <div v-else-if="timelineEvents.length" class="timeline-events__list">
        <article
          v-for="event in timelineEvents"
          :key="event.id"
          class="timeline-event"
        >
          <div class="timeline-event__topline">
            <span class="timeline-event__time">{{ formatTimelineStamp(event.occurred_at) }}</span>
            <div class="timeline-event__chips">
              <span class="timeline-event__chip">
                {{ event.label }}
              </span>
              <span class="timeline-event__chip" :class="`is-${event.tone || 'neutral'}`">
                {{ event.tone_label || '已记录' }}
              </span>
            </div>
          </div>

          <div class="timeline-event__body">
            <strong>{{ event.summary }}</strong>
            <p v-if="event.detail">{{ event.detail }}</p>

            <div v-if="eventTags(event).length" class="tag-cloud timeline-event__tags">
              <span v-for="tag in eventTags(event)" :key="`${event.id}-${tag}`" class="tag">{{ tag }}</span>
            </div>
          </div>
        </article>
      </div>
      <div v-else class="timeline-events__empty">
        还没有关系节点。
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, inject, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { api } from '@/api'
import { cloneDemo, demoFixture } from '@/demo/fixtures'
import { resolveExperienceMode } from '@/utils/experienceMode'
import { buildPairQuery, resolveScopedPairId } from '@/utils/reportScopeSelection'
import { createRefreshAttemptGuard } from '@/utils/refreshGuards'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const showToast = inject('showToast', null)
const experienceMode = computed(() =>
  resolveExperienceMode({
    isDemoMode: userStore.isDemoMode,
    activePairId: userStore.activePairId,
    currentPair: userStore.currentPair,
    pairs: userStore.pairs,
  })
)

const availablePairIds = computed(() =>
  (userStore.pairs || [])
    .filter((pair) => pair.status === 'active')
    .map((pair) => pair.id)
)
const pairId = computed(() =>
  resolveScopedPairId({
    preferredPairId: route.query.pair_id,
    fallbackPairId: userStore.activePairId,
    availablePairs: availablePairIds.value,
  }) || null
)
const timelineState = ref(createEmptyTimelineResponse())
const loadingEvents = ref(false)
const timelineRefreshGuard = createRefreshAttemptGuard({ maxAttempts: 3, windowMs: 60 * 1000 })

const timelineEvents = computed(() => Array.isArray(timelineState.value?.events) ? timelineState.value.events : [])
const timelineHighlights = computed(() => Array.isArray(timelineState.value?.highlights) ? timelineState.value.highlights.filter(Boolean) : [])
const timelineEventCount = computed(() => timelineState.value?.event_count || timelineEvents.value.length)
const latestTimelineEvent = computed(() => timelineEvents.value[0] || null)
const latestEventLabel = computed(() => {
  const value = latestTimelineEvent.value?.occurred_at || timelineState.value?.latest_event_at
  return formatTimelineStamp(value) || '暂无'
})
function timelineEventTime(event) {
  const date = new Date(event?.occurred_at || event?.created_at || event?.timestamp || 0)
  return Number.isNaN(date.getTime()) ? 0 : date.getTime()
}

function sortTimelineEventsByDate(events) {
  return [...(Array.isArray(events) ? events : [])].sort((a, b) => timelineEventTime(b) - timelineEventTime(a))
}

onMounted(() => {
  refreshTimelinePage()
})

watch(
  () => pairId.value,
  (nextPairId, previousPairId) => {
    if (nextPairId === previousPairId) return
    timelineState.value = createEmptyTimelineResponse()
    void refreshTimelinePage()
  }
)

function notify(message) {
  if (message) showToast?.(message)
}

function openReportPage() {
  router.push({ path: '/report', query: buildPairQuery(pairId.value) })
}

function createEmptyTimelineResponse() {
  return {
    scope: pairId.value ? 'pair' : 'solo',
    pair_id: pairId.value || null,
    user_id: null,
    event_count: 0,
    latest_event_at: null,
    highlights: [],
    events: [],
  }
}

function fallbackEventTypeText(eventType) {
  return String(eventType || '').trim().replaceAll('.', ' / ').replaceAll('_', ' ')
}

function looksLikeRawEventText(text, eventType) {
  const normalizedText = String(text || '').trim().toLowerCase()
  if (!normalizedText) return true
  const rawEventType = String(eventType || '').trim().toLowerCase()
  const fallbackText = fallbackEventTypeText(eventType).toLowerCase()
  return normalizedText === rawEventType || normalizedText === fallbackText
}

function normalizeTimelineEvent(event) {
  const payload = event?.payload || {}
  const payloadLabel = String(payload.event_label || '').trim()
  const payloadSummary = String(payload.summary || '').trim()
  const currentLabel = String(event?.label || '').trim()
  const currentSummary = String(event?.summary || '').trim()
  const label = looksLikeRawEventText(currentLabel, event?.event_type) && payloadLabel
    ? payloadLabel
    : (currentLabel || payloadLabel || fallbackEventTypeText(event?.event_type))
  const summary = looksLikeRawEventText(currentSummary, event?.event_type) && payloadSummary
    ? payloadSummary
    : (currentSummary || payloadSummary || label)

  return {
    ...event,
    label,
    summary,
  }
}

function buildDemoTimelineResponse() {
  const events = cloneDemo(demoFixture.timelineEvents || [])
    .map((item) => ({
      id: item.id,
      occurred_at: item.timestamp,
      event_type: 'timeline.demo',
      label: '样例节点',
      summary: item.title,
      detail: item.description,
      category: 'action',
      category_label: '行动',
      tone: 'movement',
      tone_label: '状态切换',
      entity_type: 'relationship_event',
      entity_id: item.id,
      tags: Array.isArray(item.tags) ? item.tags : [],
      payload: {},
    }))
  const sortedEvents = sortTimelineEventsByDate(events)

  return {
    scope: pairId.value ? 'pair' : 'solo',
    pair_id: pairId.value || null,
    user_id: null,
    event_count: sortedEvents.length,
    latest_event_at: sortedEvents[0]?.occurred_at || null,
    highlights: sortedEvents.slice(0, 3).map((item) => item.summary),
    events: sortedEvents,
  }
}

async function refreshTimelinePage() {
  await loadTimeline()
}

function handleRefreshTimelinePage() {
  const remainingSeconds = timelineRefreshGuard.getRemainingSeconds()
  if (remainingSeconds > 0) {
    notify(`时间轴刷新得有点频繁了，请 ${remainingSeconds} 秒后再试`)
    return
  }
  timelineRefreshGuard.markRun()
  return refreshTimelinePage()
}

async function loadTimeline() {
  loadingEvents.value = true
  try {
    if (experienceMode.value.isDemoMode) {
      timelineState.value = buildDemoTimelineResponse()
      return
    }

    const res = await api.getRelationshipTimeline(pairId.value, 24)
    const events = sortTimelineEventsByDate(Array.isArray(res?.events) ? res.events.map(normalizeTimelineEvent) : [])
    const normalizedHighlights = events
      .map((item) => String(item?.summary || '').trim())
      .filter(Boolean)
      .slice(0, 3)
    const highlights = normalizedHighlights.length
      ? normalizedHighlights
      : (Array.isArray(res?.highlights) ? res.highlights.filter(Boolean) : [])
    timelineState.value = {
      ...createEmptyTimelineResponse(),
      ...(res || {}),
      highlights,
      events,
      event_count: Number(res?.event_count) || events.length,
      latest_event_at: events[0]?.occurred_at || res?.latest_event_at || null,
    }
  } catch (error) {
    timelineState.value = createEmptyTimelineResponse()
    notify(error.message || '关系时间轴暂时没有加载出来')
  } finally {
    loadingEvents.value = false
  }
}

function formatTimelineStamp(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  const day = `${date.getMonth() + 1}月${date.getDate()}日 ${weekdays[date.getDay()]}`
  const moment = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
  return [day, moment].filter(Boolean).join(' ')
}

function eventTags(event) {
  const payload = event?.payload || {}
  const candidates = [
    event?.category_label,
    payload.request_kind_label,
    payload.requested_type_label,
    ...(Array.isArray(event?.tags) ? event.tags : []),
  ]

  return Array.from(new Set(candidates.map((item) => String(item || '').trim()).filter(Boolean))).slice(0, 4)
}
</script>

<style scoped>
.timeline-page {
  width: min(var(--content-max), calc(100% - 32px));
  margin: 0 auto;
  padding-bottom: 32px;
  display: grid;
  gap: 16px;
}

.timeline-page .page-head {
  width: 100%;
  padding-bottom: 0;
}

.timeline-page .btn-primary {
  border-color: var(--seal-deep);
  background: linear-gradient(135deg, var(--seal) 0%, var(--ochre) 100%);
  box-shadow: 0 12px 24px rgba(170, 77, 51, 0.18);
}

.timeline-page .btn-primary:hover {
  background: linear-gradient(135deg, var(--seal-deep) 0%, #bb7d31 100%);
  box-shadow: 0 14px 28px rgba(170, 77, 51, 0.22);
}

.timeline-page .btn-ghost {
  border-color: rgba(215, 104, 72, 0.2);
  background: rgba(255, 250, 244, 0.84);
}

.timeline-page .btn-ghost:hover {
  border-color: rgba(215, 104, 72, 0.34);
  background: linear-gradient(135deg, rgba(240, 213, 184, 0.24), rgba(232, 240, 244, 0.24));
}

.timeline-page .empty-state {
  min-height: 160px;
  border-color: rgba(215, 104, 72, 0.2);
  background:
    radial-gradient(circle at top right, rgba(215, 104, 72, 0.14), transparent 30%),
    linear-gradient(135deg, rgba(240, 213, 184, 0.2), rgba(232, 240, 244, 0.18)),
    rgba(255, 250, 244, 0.88);
}

.timeline-hero {
  display: grid;
  grid-template-columns: minmax(180px, 0.56fr) minmax(0, 1fr);
  gap: 16px;
  align-items: stretch;
  margin: 0;
  padding: 20px;
  border-color: rgba(56, 42, 30, 0.08);
  background:
    linear-gradient(180deg, rgba(255, 252, 247, 0.96), rgba(249, 245, 239, 0.9)),
    rgba(255, 255, 255, 0.56);
  box-shadow: 0 14px 32px rgba(56, 42, 30, 0.05);
}

.timeline-hero__copy {
  max-width: 62ch;
}

.timeline-hero h3 {
  margin: 0;
  color: var(--ink);
  font-family: var(--font-serif);
  font-size: 24px;
  line-height: 1.25;
}

.timeline-hero__stats {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.timeline-hero__stat {
  display: grid;
  gap: 6px;
  min-height: 82px;
  padding: 14px 16px;
  border: 1px solid rgba(56, 42, 30, 0.07);
  border-radius: var(--radius-lg);
  background: rgba(255, 255, 255, 0.62);
}

.timeline-hero__stat span {
  font-size: 12px;
  font-weight: 700;
}

.timeline-hero__stat strong {
  font-family: var(--font-serif);
  font-size: 18px;
  line-height: 1.35;
}

.timeline-events {
  display: grid;
  gap: 16px;
  margin: 0;
  padding: 20px;
  border-color: rgba(215, 104, 72, 0.14);
  background:
    linear-gradient(180deg, rgba(255, 252, 247, 0.96), rgba(249, 245, 239, 0.9)),
    rgba(255, 255, 255, 0.56);
}

.timeline-events__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.timeline-events__head h3 {
  margin: 0;
  font-family: var(--font-serif);
  font-size: 22px;
  line-height: 1.3;
}

.timeline-events__latest {
  display: inline-flex;
  align-items: center;
  min-height: 34px;
  padding: 0 14px;
  border: 1px solid rgba(215, 104, 72, 0.14);
  border-radius: 999px;
  background: rgba(255, 250, 244, 0.9);
  color: var(--ink-soft);
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
}

.timeline-events__highlights .tag {
  border-color: rgba(215, 104, 72, 0.18);
  background: rgba(240, 213, 184, 0.22);
}

.timeline-events__list {
  position: relative;
  display: grid;
  gap: 10px;
  padding-left: 14px;
}

.timeline-events__list::before {
  content: "";
  position: absolute;
  left: 5px;
  top: 10px;
  bottom: 10px;
  width: 2px;
  border-radius: 999px;
  background: linear-gradient(180deg, rgba(215, 104, 72, 0.42), rgba(67, 98, 115, 0.18));
}

.timeline-event {
  position: relative;
  display: grid;
  gap: 12px;
  padding: 14px 16px;
  border: 1px solid rgba(215, 104, 72, 0.14);
  border-radius: var(--radius-lg);
  background:
    linear-gradient(180deg, rgba(255, 252, 248, 0.96), rgba(255, 248, 243, 0.88)),
    rgba(255, 251, 247, 0.94);
}

.timeline-event::before {
  content: "";
  position: absolute;
  left: -15px;
  top: 20px;
  width: 10px;
  height: 10px;
  border: 2px solid #fffdfa;
  border-radius: 999px;
  background: var(--seal);
  box-shadow: 0 0 0 3px rgba(215, 104, 72, 0.14);
}

.timeline-event__topline {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.timeline-event__time {
  color: var(--ink-soft);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.timeline-event__chips {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
}

.timeline-event__chip {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0 11px;
  border-radius: 999px;
  background: rgba(215, 104, 72, 0.1);
  color: var(--seal-deep);
  font-size: 12px;
  font-weight: 700;
}

.timeline-event__chip.is-progress {
  background: rgba(232, 240, 244, 0.88);
  color: var(--sky-deep);
}

.timeline-event__chip.is-movement {
  background: rgba(199, 138, 63, 0.16);
  color: #8a5a17;
}

.timeline-event__chip.is-warning {
  background: rgba(189, 75, 53, 0.16);
  color: var(--seal-deep);
}

.timeline-event__chip.is-neutral {
  background: rgba(120, 112, 104, 0.12);
  color: var(--ink-soft);
}

.timeline-event__body {
  display: grid;
  gap: 8px;
}

.timeline-event__body strong {
  font-size: 18px;
  line-height: 1.45;
}

.timeline-event__body p {
  margin: 0;
  color: var(--ink-soft);
  line-height: 1.72;
}

.timeline-events__empty {
  display: grid;
  place-items: center;
  min-height: 120px;
  padding: 18px;
  border: 1px dashed rgba(215, 104, 72, 0.18);
  border-radius: var(--radius-lg);
  background: rgba(255, 251, 247, 0.78);
  color: var(--ink-soft);
  text-align: center;
}

@media (max-width: 900px) {
  .timeline-hero {
    grid-template-columns: 1fr;
  }

  .timeline-events__head,
  .timeline-event__topline {
    flex-direction: column;
  }

  .timeline-event__chips {
    justify-content: flex-start;
  }
}

@media (max-width: 640px) {
  .timeline-page {
    width: min(100% - 20px, var(--content-max));
  }

  .timeline-page .page-head--split {
    flex-direction: column;
  }

  .timeline-page .page-head__aside {
    width: 100%;
    justify-content: flex-start;
  }

  .timeline-hero__stats {
    grid-template-columns: 1fr;
  }
}
</style>
