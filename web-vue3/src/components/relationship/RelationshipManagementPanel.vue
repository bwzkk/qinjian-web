<template>
  <section class="relationship-management-panel">
    <div class="relationship-management-panel__header">
      <div>
        <p class="eyebrow">关系管理</p>
        <h3>发起、切换和加入关系</h3>
      </div>
      <div v-if="shortcuts.length" class="relationship-management-panel__tabs">
        <button
          v-for="shortcut in shortcuts"
          :key="shortcut.to || shortcut.label"
          class="relationship-management-panel__tab"
          :class="{ active: shortcut.isActive }"
          type="button"
          @click="emit('shortcut', shortcut)"
        >
          {{ shortcut.label }}
        </button>
      </div>
    </div>

    <div class="relationship-management-panel__grid">
      <div class="relationship-management-panel__card">
        <h4>已有关系</h4>
        <div v-if="pairs.length" class="relationship-management-panel__list">
          <button
            v-for="pair in pairs"
            :key="pair.id"
            class="relationship-management-panel__item"
            :class="{ active: pair.id === currentPairId }"
            type="button"
            @click="emit('select-pair', pair)"
          >
            <strong>{{ pair.label }}</strong>
            <span>{{ pair.meta }}</span>
          </button>
        </div>
        <p v-else class="relationship-management-panel__empty">创建或加入关系后，会在这里出现。</p>
      </div>

      <div class="relationship-management-panel__card">
        <h4>发起邀请</h4>
        <div class="relationship-management-panel__types">
          <button
            v-for="option in createOptions"
            :key="option.value"
            class="relationship-management-panel__type"
            :class="{ active: option.value === selectedType }"
            type="button"
            @click="emit('select-type', option.value)"
          >
            {{ option.label }}
          </button>
        </div>
        <button class="btn btn-secondary btn-block" type="button" :disabled="creating" @click="emit('create')">
          {{ creating ? '生成中...' : '生成邀请码' }}
        </button>
      </div>

      <div class="relationship-management-panel__card">
        <h4>输入邀请码</h4>
        <label class="field">
          <span>10 位邀请码</span>
          <input
            :value="joinCode"
            class="input input--code"
            type="text"
            maxlength="10"
            autocomplete="off"
            autocapitalize="characters"
            spellcheck="false"
            placeholder="例如 8F3K7M2Q9R"
            @input="emit('join-input', $event)"
          />
        </label>
        <button class="btn btn-secondary btn-block" type="button" :disabled="joining" @click="emit('join')">
          {{ joining ? '加入中...' : '加入关系' }}
        </button>
      </div>
    </div>

    <div v-if="inviteCode" class="relationship-management-panel__invite">
      <div>
        <p class="eyebrow">当前邀请</p>
        <strong>{{ inviteCode }}</strong>
      </div>
      <div class="relationship-management-panel__invite-actions">
        <button class="btn btn-ghost btn-sm" type="button" @click="emit('copy-code')">复制邀请码</button>
        <button class="btn btn-ghost btn-sm" type="button" :disabled="refreshing" @click="emit('refresh-status')">
          {{ refreshing ? '查看中...' : '查看加入状态' }}
        </button>
      </div>
    </div>
  </section>
</template>

<script setup>
defineProps({
  shortcuts: { type: Array, default: () => [] },
  pairs: { type: Array, default: () => [] },
  currentPairId: { type: String, default: '' },
  createOptions: { type: Array, default: () => [] },
  selectedType: { type: String, default: '' },
  creating: { type: Boolean, default: false },
  joinCode: { type: String, default: '' },
  joining: { type: Boolean, default: false },
  inviteCode: { type: String, default: '' },
  refreshing: { type: Boolean, default: false },
})

const emit = defineEmits([
  'shortcut',
  'select-pair',
  'select-type',
  'create',
  'join-input',
  'join',
  'copy-code',
  'refresh-status',
])
</script>

<style scoped>
.relationship-management-panel {
  display: grid;
  gap: 16px;
  padding: 20px;
  border: 1px solid rgba(68, 52, 40, 0.08);
  border-radius: 28px;
  background: rgba(255, 250, 244, 0.72);
}

.relationship-management-panel__header {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 16px;
}

.relationship-management-panel__header h3 {
  font-family: var(--font-serif);
  font-size: 24px;
}

.relationship-management-panel__tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.relationship-management-panel__tab {
  min-height: 38px;
  padding: 0 14px;
  border: 1px solid rgba(68, 52, 40, 0.1);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.48);
}

.relationship-management-panel__tab.active {
  border-color: rgba(189, 75, 53, 0.22);
  background: rgba(255, 245, 239, 0.88);
  color: var(--warm-700);
}

.relationship-management-panel__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.relationship-management-panel__card {
  display: grid;
  gap: 12px;
  align-content: start;
  min-height: 100%;
  padding: 16px;
  border: 1px solid rgba(68, 52, 40, 0.08);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.5);
}

.relationship-management-panel__card h4 {
  font-family: var(--font-serif);
  font-size: 20px;
}

.relationship-management-panel__list,
.relationship-management-panel__types {
  display: grid;
  gap: 8px;
}

.relationship-management-panel__item,
.relationship-management-panel__type {
  display: grid;
  gap: 4px;
  justify-items: start;
  min-height: 52px;
  padding: 10px 12px;
  border: 1px solid rgba(68, 52, 40, 0.08);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.56);
}

.relationship-management-panel__item.active,
.relationship-management-panel__type.active {
  border-color: rgba(189, 75, 53, 0.24);
  background: rgba(255, 248, 243, 0.9);
}

.relationship-management-panel__item span,
.relationship-management-panel__empty {
  color: var(--ink-soft);
  font-size: 13px;
  line-height: 1.7;
}

.relationship-management-panel__invite {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px;
  border: 1px dashed rgba(189, 75, 53, 0.2);
  border-radius: 20px;
  background: rgba(255, 248, 243, 0.62);
}

.relationship-management-panel__invite strong {
  color: var(--warm-700);
  font-family: var(--font-serif);
  font-size: 28px;
}

.relationship-management-panel__invite-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

@media (max-width: 980px) {
  .relationship-management-panel__grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .relationship-management-panel__header,
  .relationship-management-panel__invite {
    grid-template-columns: 1fr;
    display: grid;
  }
}
</style>
