<template>
  <aside class="relationship-sidebar" :class="{ 'is-empty': !summary }">
    <span class="relationship-sidebar__handle" aria-hidden="true"></span>
    <div class="relationship-sidebar__header">
      <p class="eyebrow">当前关系</p>
      <h3>{{ summary?.title || '还没有选中关系' }}</h3>
      <div class="relationship-sidebar__meta">
        <span class="relationship-sidebar__type">{{ summary?.typeLabel || '先点一个头像' }}</span>
        <span v-if="summary?.statusLabel" class="relationship-sidebar__status">{{ summary.statusLabel }}</span>
      </div>
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
  position: relative;
  display: grid;
  gap: 14px;
  min-height: 100%;
  padding: 20px;
  border: 1px solid rgba(255, 231, 196, 0.12);
  border-radius: 28px;
  background:
    linear-gradient(180deg, rgba(26, 19, 32, 0.96), rgba(37, 28, 42, 0.92));
  box-shadow: var(--shadow-md);
  backdrop-filter: blur(18px);
}

.relationship-sidebar__header h3 {
  color: rgba(255, 239, 218, 0.96);
  font-family: var(--font-serif);
  font-size: 26px;
  line-height: 1.35;
}

.relationship-sidebar__handle {
  display: none;
}

.relationship-sidebar__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 4px;
}

.relationship-sidebar__type,
.relationship-sidebar__label,
.relationship-sidebar__score span {
  color: rgba(255, 226, 187, 0.72);
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.04em;
}

.relationship-sidebar__status {
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  padding: 0 10px;
  border-radius: 999px;
  background: rgba(255, 243, 224, 0.08);
  color: rgba(255, 233, 196, 0.88);
  font-size: 11px;
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
    bottom: 12px;
    z-index: 3;
    padding: 14px 18px 18px;
    border-radius: 26px;
    background:
      linear-gradient(180deg, rgba(26, 19, 32, 0.98), rgba(37, 28, 42, 0.96));
    box-shadow: 0 22px 40px rgba(8, 12, 22, 0.34);
  }

  .relationship-sidebar__handle {
    display: block;
    width: 54px;
    height: 4px;
    margin: 0 auto 2px;
    border-radius: 999px;
    background: rgba(255, 231, 196, 0.26);
  }

  .relationship-sidebar__body {
    max-height: min(54vh, 420px);
    overflow: auto;
    padding-right: 4px;
  }

  .relationship-sidebar__actions {
    position: sticky;
    bottom: -4px;
    padding-top: 6px;
    background: linear-gradient(180deg, rgba(37, 28, 42, 0), rgba(37, 28, 42, 0.94) 44%);
  }

  .relationship-sidebar.is-empty {
    bottom: 0;
  }
}
</style>
