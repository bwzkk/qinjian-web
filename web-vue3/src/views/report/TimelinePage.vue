<template>
  <div class="timeline-page">
    <div class="page-head page-head--split">
      <div>
        <p class="eyebrow">时间轴</p>
        <h2>回到这段关系是怎么走到这里的</h2>
      </div>
      <div class="page-head__aside">
        <button class="btn btn-ghost" @click="$router.push('/report')">回简报</button>
        <button class="btn btn-primary" @click="loadTimeline">刷新时间轴</button>
      </div>
    </div>

    <section class="timeline-hero card card-accent">
      <div class="timeline-hero__copy">
        <p class="eyebrow">时间轴总览</p>
        <h3>把每次记录串成一条可回放的脉络</h3>
        <p>沿用旧版 web 的暖橘、鼠尾草和纸本底色，先看节点概览，再往下读每一条变化。</p>
      </div>
      <div class="timeline-hero__stats" aria-label="时间轴摘要">
        <div class="timeline-hero__stat">
          <span>节点数</span>
          <strong>{{ events.length }}</strong>
        </div>
        <div class="timeline-hero__stat">
          <span>最近更新</span>
          <strong>{{ latestEventLabel }}</strong>
        </div>
      </div>
    </section>

    <div v-if="events.length" class="timeline-list">
      <div v-for="event in events" :key="event.id" class="timeline-card card">
        <div class="timeline-card__marker">
          <span class="timeline-card__dot"></span>
        </div>
        <div class="timeline-card__body">
          <div class="timeline-card__meta">{{ formatDate(event.timestamp || event.created_at) }}</div>
          <strong>{{ event.title || event.summary || '记录' }}</strong>
          <p v-if="event.description">{{ event.description }}</p>
          <div v-if="event.tags?.length" class="tag-cloud">
            <span v-for="tag in event.tags" :key="tag" class="tag">{{ tag }}</span>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      还没有时间轴事件，开始打卡记录后这里会自动更新。
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { api } from '@/api'
import { cloneDemo, demoFixture } from '@/demo/fixtures'

const userStore = useUserStore()
const events = ref([])
const latestEvent = computed(() => {
  let latest = null
  let latestTime = -1

  for (const event of events.value) {
    const time = getEventTime(event)
    if (time >= latestTime) {
      latestTime = time
      latest = event
    }
  }

  return latest
})
const latestEventLabel = computed(() => {
  const item = latestEvent.value
  const label = item ? formatDate(item.timestamp || item.created_at) : ''
  return label || '暂无'
})

onMounted(() => loadTimeline())

async function loadTimeline() {
  if (sessionStorage.getItem('qj_token') === 'demo-mode') {
    events.value = cloneDemo(demoFixture.timelineEvents)
    return
  }
  const pairId = userStore.currentPair?.id || null
  try {
    const res = await api.getRelationshipTimeline(pairId)
    events.value = Array.isArray(res) ? res : res.events || []
  } catch {
    events.value = []
  }
}

function formatDate(v) {
  if (!v) return ''
  const d = new Date(v)
  return `${d.getMonth() + 1}月${d.getDate()}日 ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function getEventTime(event) {
  const time = new Date(event?.timestamp || event?.created_at || 0).getTime()
  return Number.isFinite(time) ? time : 0
}
</script>

<style scoped>
.timeline-page {
  position: relative;
  isolation: isolate;
  width: min(var(--content-max), calc(100% - 32px));
  margin: 0 auto;
  padding-bottom: 28px;
  background:
    radial-gradient(circle at top left, rgba(215, 104, 72, 0.18), transparent 30%),
    radial-gradient(circle at top right, rgba(240, 213, 184, 0.38), transparent 34%),
    radial-gradient(circle at bottom center, rgba(95, 135, 111, 0.14), transparent 34%),
    linear-gradient(180deg, #fbf6f1 0%, #f7efe7 54%, #f4ece4 100%);
}

.timeline-page::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background:
    repeating-linear-gradient(90deg, rgba(215, 104, 72, 0.03) 0 1px, transparent 1px 46px),
    repeating-linear-gradient(0deg, rgba(95, 135, 111, 0.024) 0 1px, transparent 1px 46px);
  opacity: 0.95;
}

.timeline-page > * {
  position: relative;
  z-index: 1;
}

.timeline-page .page-head {
  width: 100%;
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
  background: linear-gradient(135deg, rgba(240, 213, 184, 0.26), rgba(223, 233, 221, 0.2));
}

.timeline-page .empty-state {
  min-height: 160px;
  border-color: rgba(215, 104, 72, 0.2);
  background:
    radial-gradient(circle at top right, rgba(215, 104, 72, 0.14), transparent 30%),
    linear-gradient(135deg, rgba(240, 213, 184, 0.22), rgba(223, 233, 221, 0.12)),
    rgba(255, 250, 244, 0.88);
}

.timeline-hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 16px;
  align-items: start;
  margin-top: 12px;
  margin-bottom: 16px;
  padding: 20px 22px;
  border-color: rgba(215, 104, 72, 0.18);
  background:
    radial-gradient(circle at top right, rgba(215, 104, 72, 0.18), transparent 28%),
    radial-gradient(circle at left bottom, rgba(95, 135, 111, 0.16), transparent 24%),
    linear-gradient(135deg, rgba(240, 213, 184, 0.28), rgba(215, 104, 72, 0.1), rgba(220, 235, 238, 0.12)),
    rgba(255, 251, 247, 0.96);
  box-shadow: 0 22px 48px rgba(170, 77, 51, 0.1);
}

.timeline-hero__copy {
  max-width: 58ch;
}

.timeline-hero h3 {
  margin: 0;
  color: var(--ink);
  font-family: var(--font-serif);
  font-size: 24px;
  line-height: 1.25;
}

.timeline-hero p {
  margin-top: 8px;
  color: var(--ink-soft);
  font-size: 14px;
  line-height: 1.7;
}

.timeline-hero__stats {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 150px));
  gap: 10px;
}

.timeline-hero__stat {
  display: grid;
  gap: 6px;
  padding: 14px 16px;
  border: 1px solid rgba(215, 104, 72, 0.12);
  border-radius: var(--radius-lg);
  background: rgba(255, 250, 244, 0.9);
}

.timeline-hero__stat:first-child {
  background: linear-gradient(180deg, rgba(240, 213, 184, 0.42), rgba(255, 250, 244, 0.94));
}

.timeline-hero__stat:last-child {
  background: linear-gradient(180deg, rgba(223, 233, 221, 0.42), rgba(255, 250, 244, 0.94));
}

.timeline-hero__stat span {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.timeline-hero__stat strong {
  font-family: var(--font-serif);
  font-size: 18px;
  line-height: 1.35;
}

.timeline-page .tag-cloud {
  margin-top: 8px;
}

.timeline-page .tag {
  border-color: rgba(215, 104, 72, 0.18);
  background: rgba(240, 213, 184, 0.24);
}

.timeline-page .tag:hover {
  border-color: rgba(215, 104, 72, 0.32);
  background: rgba(223, 233, 221, 0.22);
}

.timeline-list {
  position: relative;
  padding: 8px 0 0 26px;
}
.timeline-list::before {
  content: '';
  position: absolute;
  left: 31px;
  top: 0;
  bottom: 0;
  width: 3px;
  background: linear-gradient(180deg, var(--seal) 0%, var(--ochre) 56%, var(--moss) 100%);
  box-shadow: 0 0 0 1px rgba(215, 104, 72, 0.12), 0 0 18px rgba(199, 138, 63, 0.12);
}
.timeline-card {
  position: relative;
  margin-bottom: 14px;
  margin-left: 16px;
  border-color: rgba(215, 104, 72, 0.16);
  background:
    linear-gradient(135deg, rgba(240, 213, 184, 0.28) 0%, rgba(215, 104, 72, 0.1) 54%, rgba(223, 233, 221, 0.1) 100%),
    rgba(255, 250, 244, 0.94);
  box-shadow: 0 14px 30px rgba(170, 77, 51, 0.08);
  transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease;
}

.timeline-card:nth-child(3n + 1) {
  border-color: rgba(215, 104, 72, 0.22);
  background:
    linear-gradient(135deg, rgba(215, 104, 72, 0.16) 0%, rgba(255, 250, 244, 0.94) 58%, rgba(220, 235, 238, 0.12) 100%),
    rgba(255, 250, 244, 0.94);
}

.timeline-card:nth-child(3n + 2) {
  border-color: rgba(199, 138, 63, 0.22);
  background:
    linear-gradient(135deg, rgba(240, 213, 184, 0.32) 0%, rgba(255, 250, 244, 0.94) 58%, rgba(215, 104, 72, 0.08) 100%),
    rgba(255, 250, 244, 0.94);
}

.timeline-card:nth-child(3n + 3) {
  border-color: rgba(95, 135, 111, 0.22);
  background:
    linear-gradient(135deg, rgba(223, 233, 221, 0.34) 0%, rgba(255, 250, 244, 0.94) 58%, rgba(240, 213, 184, 0.12) 100%),
    rgba(255, 250, 244, 0.94);
}

.timeline-card:hover {
  transform: translateY(-2px);
  border-color: rgba(215, 104, 72, 0.26);
  box-shadow: 0 20px 40px rgba(170, 77, 51, 0.12);
}

.timeline-card__body {
  display: grid;
  gap: 2px;
}
.timeline-card__marker {
  position: absolute;
  left: -24px;
  top: 20px;
}
.timeline-card__dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--seal), var(--ochre));
  border: 2px solid rgba(255, 255, 255, 0.92);
  display: block;
  box-shadow: 0 0 0 5px rgba(215, 104, 72, 0.1);
}
.timeline-card__meta {
  font-size: 12px;
  margin-bottom: 4px;
}
.timeline-card strong {
  display: block;
  font-size: 15px;
  margin-bottom: 4px;
}

.timeline-card:nth-child(3n + 2) .timeline-card__dot {
  background: linear-gradient(135deg, var(--ochre), var(--seal));
}

.timeline-card:nth-child(3n + 3) .timeline-card__dot {
  background: linear-gradient(135deg, var(--moss), var(--ochre));
}
.timeline-card p {
  font-size: 13px;
  line-height: 1.5;
}

@media (max-width: 640px) {
  .timeline-page {
    width: min(100% - 24px, var(--content-max));
  }

  .timeline-hero {
    grid-template-columns: 1fr;
  }

  .timeline-hero__stats {
    grid-template-columns: 1fr 1fr;
  }

  .timeline-page .page-head--split {
    flex-direction: column;
  }

  .timeline-page .page-head__aside {
    width: 100%;
    justify-content: flex-start;
  }

  .timeline-list {
    padding-left: 20px;
  }

  .timeline-list::before {
    left: 26px;
  }

  .timeline-card {
    margin-left: 12px;
  }
}

@media (max-width: 480px) {
  .timeline-hero__stats {
    grid-template-columns: 1fr;
  }
}
</style>
