<template>
  <div class="alignment-page">
    <div class="page-head alignment-head">
      <div>
        <p class="eyebrow">双视角</p>
        <h2>双视角分析</h2>
        <p>把双方视角放在一起看，识别最容易发生误读或混淆的地方。</p>
      </div>
      <div class="alignment-head__actions">
        <button class="btn btn-ghost btn-sm" @click="loadAlignment">刷新</button>
        <button class="btn btn-primary btn-sm" @click="$router.push('/report')">去简报页</button>
      </div>
    </div>

    <section v-if="alignment" class="alignment-hero glass-card">
      <div class="alignment-score">
        <span>{{ alignment.alignment_score }}</span>
        <small>对齐度</small>
      </div>
      <div class="alignment-summary">
        <p class="eyebrow">共同版本</p>
        <h3>{{ alignment.shared_story }}</h3>
        <p>{{ alignment.coach_note }}</p>
      </div>
    </section>

    <section v-if="alignment" class="alignment-grid">
      <article class="card card-accent">
        <p class="eyebrow">A 方视角</p>
        <h3>{{ alignment.user_a_label }}</h3>
        <p>{{ alignment.view_a_summary }}</p>
      </article>
      <article class="card card-accent">
        <p class="eyebrow">B 方视角</p>
        <h3>{{ alignment.user_b_label }}</h3>
        <p>{{ alignment.view_b_summary }}</p>
      </article>
      <article class="card card-accent alignment-card--warning">
        <p class="eyebrow">最容易混淆的点</p>
        <h3>误读 / 错位</h3>
        <p>{{ alignment.misread_risk }}</p>
      </article>
      <article class="card card-accent">
        <p class="eyebrow">建议开头</p>
        <h3>更容易对齐的第一句</h3>
        <p>{{ alignment.suggested_opening || '暂时没有可用的开场白。' }}</p>
      </article>
    </section>

    <section v-if="alignment" class="alignment-lists">
      <article class="card">
        <div class="card-header">
          <div>
            <p class="eyebrow">分歧点</p>
            <h3>双方看到的不是同一件事</h3>
          </div>
        </div>
        <ul class="plain-list">
          <li v-for="item in alignment.divergence_points" :key="item">{{ item }}</li>
        </ul>
      </article>
      <article class="card">
        <div class="card-header">
          <div>
            <p class="eyebrow">桥接动作</p>
            <h3>先做哪一步更稳</h3>
          </div>
        </div>
        <ul class="plain-list">
          <li v-for="item in alignment.bridge_actions" :key="item">{{ item }}</li>
        </ul>
      </article>
    </section>

    <div v-else class="report-empty">
      <strong>{{ loading ? '正在生成双视角分析…' : '还没有双视角分析数据' }}</strong>
      <p>{{ loading ? '请稍候。' : '需要双方都有记录后才能生成。' }}</p>
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
const alignment = ref(null)
const loading = ref(false)

onMounted(loadAlignment)

async function loadAlignment() {
  const pairId = userStore.currentPair?.id
  if (!pairId) {
    showToast('请先绑定关系')
    return
  }

  loading.value = true
  try {
    if (sessionStorage.getItem('qj_token') === 'demo-mode') {
      alignment.value = cloneDemo(demoFixture.narrativeAlignment)
      return
    }
    alignment.value = await api.getLatestNarrativeAlignment(pairId)
  } catch (e) {
    alignment.value = null
    showToast(e.message || '双视角分析失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.alignment-page {
  width: min(var(--content-max), calc(100% - 32px));
  margin: 0 auto;
  padding-bottom: 28px;
}

.alignment-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.alignment-head__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.alignment-hero {
  display: grid;
  grid-template-columns: 120px minmax(0, 1fr);
  gap: 20px;
  padding: 22px;
  border: 1px solid rgba(189, 75, 53, 0.22);
  margin-bottom: 16px;
}

.alignment-score {
  display: grid;
  place-items: center;
  min-height: 120px;
  border-radius: var(--radius-lg);
  background: rgba(243, 216, 208, 0.36);
  color: var(--seal-deep);
}

.alignment-score span {
  font-family: var(--font-serif);
  font-size: 42px;
  font-weight: 700;
  line-height: 1;
}

.alignment-summary h3 {
  font-family: var(--font-serif);
  font-size: 24px;
  line-height: 1.45;
}

.alignment-summary p:last-child {
  margin-top: 10px;
  color: var(--ink-soft);
  line-height: 1.7;
}

.alignment-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.alignment-grid .card h3 {
  margin-top: 4px;
  font-family: var(--font-serif);
  font-size: 18px;
}

.alignment-grid .card p:last-child {
  margin-top: 10px;
  color: var(--ink-soft);
  line-height: 1.65;
}

.alignment-card--warning {
  border-color: rgba(189, 75, 53, 0.3);
  background: rgba(243, 216, 208, 0.22);
}

.alignment-lists {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
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
  .alignment-head,
  .alignment-hero,
  .alignment-grid,
  .alignment-lists {
    grid-template-columns: 1fr;
  }

  .alignment-head {
    display: grid;
  }
}

@media (max-width: 600px) {
  .alignment-page {
    width: min(100% - 24px, var(--content-max));
  }

  .alignment-hero {
    padding: 16px;
  }

  .alignment-summary h3 {
    font-size: 21px;
  }
}
</style>
