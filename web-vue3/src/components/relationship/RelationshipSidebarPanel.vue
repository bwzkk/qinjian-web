<template>
  <aside class="relationship-sidebar">
    <div class="relationship-sidebar__header">
      <p class="eyebrow">当前关系</p>
      <h3>{{ summary?.title || '还没有选中关系' }}</h3>
      <span class="relationship-sidebar__type">{{ summary?.typeLabel || '先点一个头像' }}</span>
    </div>

    <div v-if="summary" class="relationship-sidebar__body">
      <div class="relationship-sidebar__score">
        <span>综合分</span>
        <strong>{{ summary.score }}</strong>
      </div>

      <div class="relationship-sidebar__card">
        <p class="relationship-sidebar__label">最近趋势</p>
        <strong>{{ summary.trendLabel }}</strong>
      </div>

      <div class="relationship-sidebar__card">
        <p class="relationship-sidebar__label">最近发生了什么</p>
        <span>{{ summary.recentSummary }}</span>
      </div>

      <div class="relationship-sidebar__card">
        <p class="relationship-sidebar__label">当前建议</p>
        <span>{{ summary.nextAction }}</span>
      </div>

      <div class="relationship-sidebar__actions">
        <button class="btn btn-primary btn-block" type="button" @click="emit('open-detail', summary.pairId)">
          进入专属关系页
        </button>
      </div>
    </div>

    <div v-else class="relationship-sidebar__empty">
      <p>点一下关系头像，先看看这段关系最近发生了什么。</p>
    </div>
  </aside>
</template>

<script setup>
defineProps({
  summary: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['open-detail'])
</script>

<style scoped>
.relationship-sidebar {
  display: grid;
  gap: 14px;
  min-height: 100%;
  padding: 20px;
  border: 1px solid rgba(255, 231, 196, 0.12);
  border-radius: 28px;
  background:
    linear-gradient(180deg, rgba(26, 19, 32, 0.96), rgba(37, 28, 42, 0.92));
  box-shadow: var(--shadow-md);
}

.relationship-sidebar__header h3 {
  color: rgba(255, 239, 218, 0.96);
  font-family: var(--font-serif);
  font-size: 26px;
  line-height: 1.35;
}

.relationship-sidebar__type,
.relationship-sidebar__label,
.relationship-sidebar__score span {
  color: rgba(255, 226, 187, 0.72);
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.04em;
}

.relationship-sidebar__body {
  display: grid;
  gap: 12px;
}

.relationship-sidebar__score {
  display: flex;
  align-items: end;
  justify-content: space-between;
  padding: 16px;
  border: 1px solid rgba(255, 231, 196, 0.12);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.03);
}

.relationship-sidebar__score strong {
  color: rgba(255, 241, 220, 0.98);
  font-family: var(--font-serif);
  font-size: 42px;
  line-height: 1;
}

.relationship-sidebar__card {
  display: grid;
  gap: 6px;
  padding: 14px;
  border: 1px solid rgba(255, 231, 196, 0.1);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.03);
}

.relationship-sidebar__card strong,
.relationship-sidebar__card span,
.relationship-sidebar__empty p {
  color: rgba(255, 239, 218, 0.84);
  font-size: 14px;
  line-height: 1.75;
}

.relationship-sidebar__empty {
  padding: 16px;
  border: 1px dashed rgba(255, 231, 196, 0.16);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.03);
}

@media (max-width: 900px) {
  .relationship-sidebar {
    position: sticky;
    bottom: 10px;
    padding: 18px;
    border-radius: 24px;
    background:
      linear-gradient(180deg, rgba(26, 19, 32, 0.98), rgba(37, 28, 42, 0.96));
  }
}
</style>
