<template>
  <div class="relationship-space-detail page-shell page-shell--wide page-stack">
    <div class="page-head relationship-space-detail__head">
      <p class="eyebrow">专属关系页</p>
      <h2>{{ detailModel.hero.title }}</h2>
      <p>{{ detailModel.hero.summary }}</p>
      <div class="hero-actions">
        <button class="btn btn-ghost btn-sm" type="button" @click="router.push('/pair')">返回关系空间</button>
        <button class="btn btn-ghost btn-sm" type="button" @click="router.push('/timeline')">看时间线</button>
      </div>
    </div>

    <section v-if="pair" class="relationship-space-detail__hero">
      <article class="relationship-space-detail__hero-card relationship-space-detail__hero-card--main">
        <span>{{ detailModel.hero.subtitle }}</span>
        <strong>{{ detailModel.hero.stageLabel }}</strong>
        <p>{{ detailModel.hero.trendLabel }}</p>
      </article>

      <article class="relationship-space-detail__hero-card relationship-space-detail__hero-card--score">
        <span>当前综合分</span>
        <strong>{{ detailModel.hero.score }}</strong>
        <p>{{ detailModel.scoreCard.trendLabel }}</p>
      </article>
    </section>

    <section v-if="pair" class="relationship-space-detail__grid">
      <article class="relationship-space-detail__card">
        <p class="eyebrow">最近动态</p>
        <h3>这段关系最近发生了什么</h3>
        <div class="relationship-space-detail__moments">
          <div v-for="(moment, index) in detailModel.moments" :key="`${index}-${moment}`">
            <span>{{ String(index + 1).padStart(2, '0') }}</span>
            <p>{{ moment }}</p>
          </div>
        </div>
      </article>

      <article class="relationship-space-detail__card">
        <p class="eyebrow">当前建议</p>
        <h3>{{ detailModel.primaryAction.label }}</h3>
        <p class="relationship-space-detail__lead">{{ detailModel.primaryAction.description }}</p>
        <div class="relationship-space-detail__actions">
          <button class="btn btn-primary btn-sm" type="button" @click="router.push('/checkin')">先去记录这段关系</button>
          <button class="btn btn-ghost btn-sm" type="button" @click="router.push('/repair-protocol')">看修复建议</button>
          <button class="btn btn-ghost btn-sm" type="button" @click="router.push('/alignment')">看双视角判断</button>
        </div>
      </article>

      <article class="relationship-space-detail__card">
        <p class="eyebrow">关系回顾</p>
        <h3>这段关系值得被留下的东西</h3>
        <p class="relationship-space-detail__lead">{{ detailModel.scoreCard.summary }}</p>
        <ul class="relationship-space-detail__notes">
          <li>这段关系会和其他关系分开保存。</li>
          <li>之后的记录、简报和建议都会继续围绕这段关系更新。</li>
          <li>如果状态变化，你会先在总览页看到距离和亮度变化。</li>
        </ul>
      </article>
    </section>

    <section v-else class="relationship-space-detail__empty">
      <p class="eyebrow">还没有找到这段关系</p>
      <h3>先回关系空间重新选一段关系</h3>
      <p>你可以回到关系空间总览，重新选择要查看的关系对象。</p>
      <button class="btn btn-primary btn-sm" type="button" @click="router.push('/pair')">返回关系空间</button>
    </section>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { demoFixture } from '@/demo/fixtures'
import { useUserStore } from '@/stores/user'
import { buildRelationshipSpaceDetailModel } from '@/utils/relationshipSpaceModel'
import { buildRelationshipSpaces } from '@/utils/relationshipSpaces'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const pairId = computed(() => String(route.params.pairId || userStore.currentPairId || ''))

const pair = computed(() =>
  userStore.pairs.find((item) => item.id === pairId.value) || null
)

const detailMoments = computed(() => {
  if (!pair.value) return []

  if (userStore.isDemoMode) {
    return demoFixture.relationshipSpaces.find((space) => space.pair_id === pair.value.id)?.moments || []
  }

  return buildRelationshipSpaces({ pairs: [pair.value], me: userStore.me })[0]?.moments || []
})

const detailModel = computed(() =>
  buildRelationshipSpaceDetailModel({
    me: userStore.me,
    pair: pair.value,
    metricsByPairId: userStore.isDemoMode ? (demoFixture.relationshipMetrics || {}) : {},
    moments: detailMoments.value,
  })
)
</script>

<style scoped>
.relationship-space-detail {
  gap: 18px;
  padding-bottom: 36px;
}

.relationship-space-detail__head {
  width: 100%;
}

.relationship-space-detail__hero {
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(240px, 0.8fr);
  gap: 16px;
}

.relationship-space-detail__hero-card,
.relationship-space-detail__card,
.relationship-space-detail__empty {
  padding: 22px;
  border: 1px solid rgba(68, 52, 40, 0.08);
  border-radius: 28px;
  background: rgba(255, 250, 244, 0.74);
}

.relationship-space-detail__hero-card--main {
  color: rgba(255, 239, 218, 0.94);
  background:
    radial-gradient(circle at 50% 18%, rgba(240, 184, 116, 0.18), transparent 28%),
    linear-gradient(180deg, var(--relationship-night-900), var(--relationship-night-700) 58%, var(--relationship-night-500));
  box-shadow: var(--shadow-lg);
}

.relationship-space-detail__hero-card span,
.relationship-space-detail__card .eyebrow {
  color: var(--seal);
}

.relationship-space-detail__hero-card--main span {
  color: rgba(255, 226, 187, 0.78);
  font-size: 12px;
  font-weight: 800;
}

.relationship-space-detail__hero-card strong {
  display: block;
  margin-top: 8px;
  font-family: var(--font-serif);
  font-size: 30px;
  line-height: 1.4;
}

.relationship-space-detail__hero-card p {
  margin-top: 8px;
  color: rgba(255, 239, 218, 0.82);
  font-size: 14px;
  line-height: 1.75;
}

.relationship-space-detail__hero-card--score {
  display: grid;
  align-content: center;
  justify-items: start;
}

.relationship-space-detail__hero-card--score strong {
  font-size: 54px;
  line-height: 1;
}

.relationship-space-detail__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.relationship-space-detail__card h3,
.relationship-space-detail__empty h3 {
  font-family: var(--font-serif);
  font-size: 24px;
  line-height: 1.45;
}

.relationship-space-detail__lead,
.relationship-space-detail__empty p:last-of-type {
  margin-top: 10px;
  color: var(--ink-soft);
  font-size: 14px;
  line-height: 1.8;
}

.relationship-space-detail__moments {
  display: grid;
  gap: 10px;
  margin-top: 14px;
}

.relationship-space-detail__moments div {
  display: grid;
  gap: 6px;
  padding: 12px;
  border: 1px solid rgba(68, 52, 40, 0.08);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.52);
}

.relationship-space-detail__moments span {
  color: var(--seal);
  font-size: 12px;
  font-weight: 900;
}

.relationship-space-detail__moments p,
.relationship-space-detail__notes li {
  color: var(--ink);
  font-size: 14px;
  line-height: 1.75;
}

.relationship-space-detail__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
}

.relationship-space-detail__notes {
  display: grid;
  gap: 8px;
  margin-top: 14px;
  padding-left: 18px;
}

@media (max-width: 1080px) {
  .relationship-space-detail__grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 900px) {
  .relationship-space-detail__hero {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 760px) {
  .relationship-space-detail {
    width: min(100% - 24px, 1200px);
  }
}
</style>
