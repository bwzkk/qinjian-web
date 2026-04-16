<template>
  <div class="coach-page">
    <div class="page-head coach-head">
      <div>
        <p class="eyebrow">判断说明</p>
        <h2>系统为什么会给出这些建议</h2>
        <p>把现在的判断模型、重点模块和当前关注点说明白。</p>
      </div>
      <button class="btn btn-ghost btn-sm" @click="loadMethodology">刷新</button>
    </div>

    <section v-if="methodology" class="card card-accent">
      <div class="card-header">
        <div>
          <p class="eyebrow">系统</p>
          <h3>{{ methodology.system_name }}</h3>
        </div>
      </div>
      <p class="methodology-note">{{ methodology.disclaimer }}</p>
      <div class="methodology-grid">
        <article>
          <p class="eyebrow">测量方式</p>
          <ul class="plain-list">
            <li v-for="item in methodology.measurement_model" :key="item">{{ item }}</li>
          </ul>
        </article>
        <article>
          <p class="eyebrow">决策方式</p>
          <ul class="plain-list">
            <li v-for="item in methodology.decision_model" :key="item">{{ item }}</li>
          </ul>
        </article>
      </div>
      <div class="methodology-grid">
        <article>
          <p class="eyebrow">当前模块</p>
          <ul class="plain-list">
            <li v-for="item in methodology.active_modules" :key="item">{{ item }}</li>
          </ul>
        </article>
        <article>
          <p class="eyebrow">当前关注</p>
          <ul class="plain-list">
            <li v-for="item in methodology.current_focus" :key="item">{{ item }}</li>
          </ul>
        </article>
      </div>
    </section>

    <div v-else class="report-empty">
      <strong>{{ loading ? '正在加载判断说明…' : '还没有判断说明' }}</strong>
    </div>
  </div>
</template>

<script setup>
import { inject, onMounted, ref } from 'vue'
import { useUserStore } from '@/stores/user'
import { api } from '@/api'
import { cloneDemo, demoFixture } from '@/demo/fixtures'

const userStore = useUserStore()
const showToast = inject('showToast', () => {})
const methodology = ref(null)
const loading = ref(false)

onMounted(loadMethodology)

async function loadMethodology() {
  loading.value = true
  try {
    if (sessionStorage.getItem('qj_token') === 'demo-mode') {
      methodology.value = cloneDemo(demoFixture.methodology)
      return
    }
    methodology.value = await api.getMethodology(userStore.currentPair?.id || null)
  } catch (e) {
    methodology.value = null
    showToast(e.message || '判断说明加载失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.coach-page {
  width: min(var(--content-max), calc(100% - 32px));
  margin: 0 auto;
  padding-bottom: 28px;
}

.coach-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.methodology-note {
  color: var(--ink-soft);
  line-height: 1.7;
  margin-bottom: 14px;
}

.methodology-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  margin-top: 12px;
}

.plain-list {
  display: grid;
  gap: 10px;
  margin-top: 10px;
  padding-left: 18px;
  color: var(--ink-soft);
  line-height: 1.65;
}

.report-empty {
  display: grid;
  place-items: center;
  min-height: 220px;
  padding: 28px;
  border: 1px dashed rgba(78, 116, 91, 0.34);
  border-radius: var(--radius-lg);
  text-align: center;
}

@media (max-width: 760px) {
  .coach-head,
  .methodology-grid {
    grid-template-columns: 1fr;
  }

  .coach-head {
    display: grid;
  }
}

@media (max-width: 600px) {
  .coach-page {
    width: min(100% - 24px, var(--content-max));
  }
}
</style>
