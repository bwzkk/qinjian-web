<template>
  <div class="experts-page page-shell page-shell--wide page-stack">
    <div class="page-head page-head--split">
      <div>
        <p class="eyebrow">咨询</p>
        <h2>咨询服务展示位</h2>
        <p>当关系需要更稳的支持时，这里接住你。</p>
      </div>
      <button class="btn btn-ghost btn-sm" @click="$router.push('/discover')">返回总览</button>
    </div>

    <div class="expert-grid">
      <article v-for="item in experts" :key="item.name" class="card expert-card">
        <div class="expert-card__avatar">{{ item.name[0] }}</div>
        <h3>{{ item.name }}</h3>
        <p>{{ item.focus }}</p>
        <span class="pill">{{ item.title }}</span>
        <button class="btn btn-secondary btn-sm" type="button" @click="activeExpert = item">了解服务</button>
      </article>
    </div>

    <div v-if="activeExpert" class="service-modal" role="dialog" aria-modal="true" @click.self="activeExpert = null">
      <section class="service-modal__paper">
        <p class="eyebrow">咨询服务</p>
        <h3>{{ activeExpert.name }}</h3>
        <p>{{ activeExpert.focus }}</p>
        <div class="service-modal__list">
          <span>{{ activeExpert.title }}</span>
          <span>{{ activeExpert.slot }}</span>
          <span>{{ activeExpert.note }}</span>
        </div>
        <div class="hero-actions">
          <button class="btn btn-primary btn-sm" type="button" @click="activeExpert = null">预约咨询</button>
          <button class="btn btn-ghost btn-sm" type="button" @click="activeExpert = null">先收藏</button>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const activeExpert = ref(null)

const experts = [
  {
    name: '张心怡',
    focus: '婚恋沟通、关系修复、情绪共情训练',
    title: '国家二级心理咨询师',
    slot: '适合：高频争吵后的修复复盘',
    note: '首次可先做 20 分钟关系议题梳理',
  },
  {
    name: '李明辉',
    focus: '家庭系统、亲子协作、夫妻沟通策略',
    title: '家庭治疗师',
    slot: '适合：家庭议题和长期协作卡点',
    note: '可带着最近一份简报进入咨询',
  },
  {
    name: '王婷婷',
    focus: '年轻人恋爱教练、自我成长与关系边界',
    title: '情感教练',
    slot: '适合：边界表达和恋爱节奏调整',
    note: '更偏行动陪练，不替代临床诊断',
  },
]
</script>

<style scoped>
.expert-grid {
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
.expert-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}
.expert-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 10px;
}
.expert-card__avatar {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-lg);
  display: grid;
  place-items: center;
  border: 1px solid rgba(189, 75, 53, 0.28);
  background: var(--seal-soft);
  color: var(--seal-deep);
  font-size: 22px;
  font-weight: 700;
}
.expert-card h3 {
  font-family: var(--font-serif);
  font-size: 20px;
}
.expert-card p {
  color: var(--ink-soft);
  font-size: 14px;
  line-height: 1.6;
}
@media (max-width: 520px) {
  .experts-page .page-head,
  .expert-grid {
    width: min(100% - 24px, 1040px);
  }
  .page-head--split { flex-direction: column; }
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

.service-modal__paper p {
  color: var(--ink-soft);
  line-height: 1.6;
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
</style>
