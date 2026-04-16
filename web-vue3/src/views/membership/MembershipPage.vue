<template>
  <div class="membership-page page-shell page-shell--wide page-stack">
    <div class="page-head membership-head">
      <div>
        <p class="eyebrow">会员</p>
        <h2>会员方案</h2>
        <p>解锁更多功能，获得更深入的分析。</p>
      </div>
      <button class="btn btn-ghost btn-sm" @click="$router.push('/discover')">返回</button>
    </div>
    <div class="pricing-grid">
      <article v-for="plan in plans" :key="plan.name" class="card pricing-card" :class="{ 'pricing-card--featured': plan.featured }">
        <span class="pill" :class="plan.pillClass">{{ plan.tier }}</span>
        <h3>{{ plan.name }}</h3>
        <strong>{{ plan.price }}<span>{{ plan.unit }}</span></strong>
        <p>{{ plan.desc }}</p>
        <button class="btn btn-block btn-sm" :class="plan.buttonClass" type="button" @click="activePlan = plan">
          {{ plan.button }}
        </button>
      </article>
    </div>

    <div v-if="activePlan" class="service-modal" role="dialog" aria-modal="true" @click.self="activePlan = null">
      <section class="service-modal__paper">
        <p class="eyebrow">{{ activePlan.tier }}</p>
        <h3>{{ activePlan.name }}</h3>
        <strong class="modal-price">{{ activePlan.price }}{{ activePlan.unit }}</strong>
        <div class="service-modal__list">
          <span v-for="item in activePlan.features" :key="item">{{ item }}</span>
        </div>
        <div class="hero-actions">
          <button class="btn btn-primary btn-sm" type="button" @click="activePlan = null">{{ activePlan.button }}</button>
          <button class="btn btn-ghost btn-sm" type="button" @click="activePlan = null">再想想</button>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const activePlan = ref(null)

const plans = [
  {
    tier: '免费版',
    name: '基础功能',
    price: '¥0',
    unit: '',
    desc: '基础打卡、日报和关系树成长。',
    button: '当前方案',
    buttonClass: 'btn-ghost',
    pillClass: '',
    features: ['基础打卡', '基础日报', '关系树成长'],
  },
  {
    tier: '进阶版',
    name: '深度周报',
    price: '¥29',
    unit: '/月',
    desc: '趋势汇总、任务推荐和重点提醒。',
    button: '升级',
    buttonClass: 'btn-primary',
    pillClass: 'pill-warning',
    featured: true,
    features: ['深度周报', '趋势汇总', '任务推荐', '重点提醒'],
  },
  {
    tier: '年度版',
    name: '完整版',
    price: '¥199',
    unit: '/年',
    desc: '完整报告、课程、活动和咨询入口。',
    button: '选择',
    buttonClass: 'btn-secondary',
    pillClass: 'pill-success',
    features: ['完整报告', '课程入口', '活动建议', '咨询服务'],
  },
]
</script>

<style scoped>
.pricing-grid {
  width: min(1040px, calc(100% - 56px));
  margin-left: auto;
  margin-right: auto;
}

.membership-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.pricing-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}
.pricing-card {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 28px 20px;
}
.pricing-card h3 {
  font-family: var(--font-serif);
  font-size: 20px;
  font-weight: 700;
}
.pricing-card strong {
  font-size: 32px;
  font-weight: 700;
  color: var(--seal-deep);
  font-family: var(--font-serif);
}
.pricing-card strong span {
  font-size: 14px;
  font-weight: 400;
  color: var(--ink-faint);
}
.pricing-card p {
  font-size: 13px;
  color: var(--ink-soft);
  line-height: 1.5;
}
.pricing-card--featured {
  border: 2px solid rgba(189, 75, 53, 0.32);
  background: rgba(243, 216, 208, 0.26);
  position: relative;
}

.service-modal {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: grid;
  place-items: center;
  padding: 20px;
  background: rgba(44, 48, 39, 0.28);
}

.service-modal__paper {
  width: min(440px, 100%);
  padding: 22px;
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-lg);
  background: var(--paper);
}

.service-modal__paper h3 {
  margin: 4px 0 10px;
  font-family: var(--font-serif);
  font-size: 23px;
}

.modal-price {
  display: block;
  margin-bottom: 14px;
  color: var(--seal-deep);
  font-family: var(--font-serif);
  font-size: 30px;
}

.service-modal__list {
  display: grid;
  gap: 8px;
  margin: 16px 0;
}

.service-modal__list span {
  padding: 9px 10px;
  border: 1px solid rgba(78, 116, 91, 0.22);
  border-radius: var(--radius-md);
  background: var(--moss-soft);
  color: var(--moss-deep);
  font-size: 13px;
  font-weight: 700;
}

@media (max-width: 520px) {
  .membership-page .page-head,
  .pricing-grid {
    width: min(100% - 24px, 1040px);
  }
  .membership-head {
    flex-direction: column;
  }
}
</style>
