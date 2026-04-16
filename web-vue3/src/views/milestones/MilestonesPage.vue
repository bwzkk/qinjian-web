<template>
  <div class="milestones-page page-shell page-shell--narrow page-stack">
    <div class="page-head page-head--split">
      <div>
        <p class="eyebrow">里程碑</p>
        <h2>记录重要时刻</h2>
      </div>
      <button class="btn btn-ghost btn-sm" @click="$router.push('/discover')">返回</button>
    </div>

    <div class="card">
      <div class="card-header">
        <div>
          <p class="eyebrow">新建</p>
          <h3>添加里程碑</h3>
        </div>
      </div>
      <form @submit.prevent="handleSubmit" class="form-stack">
        <label class="field">
          <span>类型</span>
          <select v-model="form.type" class="input">
            <option value="anniversary">纪念日</option>
            <option value="proposal">重要承诺</option>
            <option value="wedding">结婚</option>
            <option value="friendship_day">关系起点</option>
            <option value="custom">自定义</option>
          </select>
        </label>
        <label class="field">
          <span>标题</span>
          <input v-model="form.title" class="input" type="text" maxlength="32" placeholder="例如：第一次旅行" />
        </label>
        <label class="field">
          <span>日期</span>
          <input v-model="form.date" class="input" type="date" />
        </label>
        <button type="submit" class="btn btn-primary btn-block" :disabled="submitting">
          {{ submitting ? '保存中...' : '保存' }}
        </button>
      </form>
    </div>

    <div class="card">
      <div class="card-header">
        <div>
          <p class="eyebrow">时间线</p>
          <h3>已记录的时刻</h3>
        </div>
      </div>
      <div v-if="milestones.length" class="stack-list">
        <div v-for="item in milestones" :key="item.id" class="stack-item">
          <div class="stack-item__icon stack-item__icon--gold">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m12 3 2.4 5 5.6.8-4 3.9.9 5.5L12 15.6 7.1 18.2 8 12.7 4 8.8l5.6-.8z" stroke-linejoin="round"/></svg>
          </div>
          <div class="stack-item__content">
            <strong>{{ item.title || '未命名' }}</strong>
            <div class="stack-item__meta">{{ TYPE_LABELS[item.type] || item.type }} · {{ formatDate(item.date) }}</div>
          </div>
        </div>
      </div>
      <div v-else class="empty-state">还没有记录重要时刻。</div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, inject } from 'vue'
import { useUserStore } from '@/stores/user'
import { api } from '@/api'
import { cloneDemo, demoFixture } from '@/demo/fixtures'

const userStore = useUserStore()
const showToast = inject('showToast')
const TYPE_LABELS = { anniversary: '纪念日', proposal: '重要承诺', wedding: '婚礼', friendship_day: '关系节点', custom: '自定义' }

const milestones = ref([])
const submitting = ref(false)
const form = reactive({ type: 'anniversary', title: '', date: '' })

onMounted(() => loadMilestones())

async function loadMilestones() {
  if (sessionStorage.getItem('qj_token') === 'demo-mode') {
    milestones.value = cloneDemo(demoFixture.milestones)
    return
  }
  const pairId = userStore.currentPair?.id
  if (!pairId) return
  try { milestones.value = await api.getMilestones(pairId) } catch { milestones.value = [] }
}

async function handleSubmit() {
  if (!form.title || !form.date) { showToast('请填写标题和日期'); return }
  if (sessionStorage.getItem('qj_token') === 'demo-mode') {
    milestones.value = [
      {
        id: `milestone-demo-${Date.now()}`,
        type: form.type,
        title: form.title,
        date: form.date,
      },
      ...milestones.value,
    ]
    showToast('预览里已添加这个时刻')
    form.title = ''
    form.date = ''
    return
  }
  const pairId = userStore.currentPair?.id
  if (!pairId) { showToast('请先绑定关系'); return }
  submitting.value = true
  try {
    await api.createMilestone(pairId, form.type, form.title, form.date)
    showToast('里程碑已保存')
    form.title = ''
    form.date = ''
    await loadMilestones()
  } catch (e) {
    showToast(e.message || '保存失败')
  } finally { submitting.value = false }
}

function formatDate(v) {
  if (!v) return ''
  const d = new Date(v)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
</script>
