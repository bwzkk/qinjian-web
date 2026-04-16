<template>
  <div class="attach-page page-shell page-shell--narrow page-stack">
    <div class="page-head page-head--split">
      <div>
        <p class="eyebrow">依恋</p>
        <h2>依恋类型分析</h2>
      </div>
      <button class="btn btn-ghost btn-sm" @click="$router.push('/discover')">返回</button>
    </div>
    <div class="card card-accent">
      <div class="card-header">
        <div><p class="eyebrow">分析</p><h3>双方依恋类型</h3></div>
        <button class="btn btn-primary btn-sm" :disabled="analyzing" @click="runAnalysis">
          {{ analyzing ? '分析中...' : '开始分析' }}
        </button>
      </div>
      <div v-if="result" class="attach-result">
        <div class="attach-item">
          <span>我的类型</span>
          <strong>{{ LABELS[result.my_style] || result.my_style || '未分析' }}</strong>
        </div>
        <div class="attach-item">
          <span>对方类型</span>
          <strong>{{ LABELS[result.partner_style] || result.partner_style || '未分析' }}</strong>
        </div>
      </div>
      <div v-else class="empty-state">点击"开始分析"查看结果。</div>
    </div>
  </div>
</template>

<script setup>
import { ref, inject } from 'vue'
import { useUserStore } from '@/stores/user'
import { api } from '@/api'

const userStore = useUserStore()
const showToast = inject('showToast')
const LABELS = { secure: '安全型', anxious: '焦虑型', avoidant: '回避型', fearful: '恐惧型', unknown: '未分析' }
const analyzing = ref(false)
const result = ref(null)

async function runAnalysis() {
  const pairId = userStore.currentPair?.id
  if (!pairId) { showToast('请先绑定关系'); return }
  analyzing.value = true
  try {
    await api.triggerAttachmentAnalysis(pairId)
    const res = await api.getAttachmentAnalysis(pairId)
    result.value = res
    showToast('分析完成')
  } catch (e) {
    showToast(e.message || '分析失败')
  } finally { analyzing.value = false }
}
</script>

<style scoped>
.attach-result {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 16px;
}
.attach-item {
  padding: 16px;
  border-radius: var(--radius-md);
  background: var(--warm-50);
  text-align: center;
}
.attach-item span { display: block; font-size: 12px; color: var(--ink-faint); margin-bottom: 6px; }
.attach-item strong { font-size: 18px; color: var(--warm-600); font-family: var(--font-serif); }
</style>
