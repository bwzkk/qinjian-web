<template>
  <div class="courses-page page-shell page-shell--wide page-stack">
    <div class="page-head page-head--split">
      <div>
        <p class="eyebrow">课程</p>
        <h2>关系成长内容</h2>
        <p>学习更好的沟通和相处方式。</p>
      </div>
      <button class="btn btn-ghost btn-sm" @click="$router.push('/discover')">返回</button>
    </div>

    <div class="content-grid">
      <article v-for="item in courses" :key="item.title" class="card content-card">
        <span class="pill">{{ item.tag }}</span>
        <h3>{{ item.title }}</h3>
        <p>{{ item.desc }}</p>
        <button class="btn btn-ghost btn-sm" type="button" @click="activeCourse = item">查看内容</button>
      </article>
    </div>

    <div v-if="activeCourse" class="service-modal" role="dialog" aria-modal="true" @click.self="activeCourse = null">
      <section class="service-modal__paper">
        <p class="eyebrow">{{ activeCourse.tag }}</p>
        <h3>{{ activeCourse.title }}</h3>
        <p>{{ activeCourse.desc }}</p>
        <div class="service-modal__list">
          <span v-for="point in activeCourse.points" :key="point">{{ point }}</span>
        </div>
        <div class="hero-actions">
          <button class="btn btn-primary btn-sm" type="button" @click="activeCourse = null">加入学习</button>
          <button class="btn btn-ghost btn-sm" type="button" @click="activeCourse = null">稍后再看</button>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const activeCourse = ref(null)

const courses = [
  {
    tag: '沟通',
    title: '高效沟通技巧',
    desc: '学习非暴力沟通、情绪识别和修复对话。',
    points: ['观察事实，不急着下结论', '把自己的需求说清楚', '用修复的话收尾'],
  },
  {
    tag: '修复',
    title: '冲突管理',
    desc: '围绕戈特曼理论整理可执行的关系修复方法。',
    points: ['识别争吵升级点', '学会暂停和回到对话', '把复盘落到具体行动'],
  },
  {
    tag: '成长',
    title: '亲密关系提升',
    desc: '从亲密表达、边界共识到共同愿景。',
    points: ['梳理双方的边界', '建立共同的目标', '保持稳定的陪伴节奏'],
  },
]
</script>

<style scoped>
.content-grid {
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
.content-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}
.content-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
}
.content-card h3 {
  font-family: var(--font-serif);
  font-size: 20px;
}
.content-card p {
  color: var(--ink-soft);
  font-size: 14px;
  line-height: 1.6;
  flex: 1;
}
@media (max-width: 520px) {
  .courses-page .page-head,
  .content-grid {
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
