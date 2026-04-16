<template>
  <div class="health-page page-shell page-shell--narrow page-stack">
    <div class="page-head page-head--split">
      <div>
        <p class="eyebrow">体检</p>
        <h2>关系体检</h2>
      </div>
      <button class="btn btn-ghost btn-sm" @click="$router.push('/discover')">返回</button>
    </div>

    <div class="card" v-if="!finished">
      <div class="progress-track" style="margin-bottom:20px;">
        <span class="progress-track__fill" :style="{ width: `${((current + 1) / questions.length) * 100}%` }"></span>
      </div>
      <div class="health-progress-meta">
        <span>问题 {{ current + 1 }}/{{ questions.length }}</span>
        <span>{{ current }}/{{ questions.length }}</span>
      </div>
      <h3 class="health-question">{{ questions[current]?.q }}</h3>
      <div class="stack-list">
        <button
          v-for="(opt, i) in questions[current]?.options"
          :key="i"
          class="stack-item"
          :class="{ active: answers[current] === i }"
          @click="selectAnswer(i)"
          type="button"
        >
          <div class="stack-item__content"><strong>{{ opt }}</strong></div>
        </button>
      </div>
      <div class="hero-actions" style="margin-top:20px;">
        <button v-if="current > 0" class="btn btn-ghost" @click="current--">上一题</button>
        <button v-if="current < questions.length - 1" class="btn btn-primary" :disabled="answers[current] === undefined" @click="current++">下一题</button>
        <button v-else class="btn btn-primary" :disabled="answers[current] === undefined" @click="finishTest">查看结果</button>
      </div>
    </div>

    <div class="card" v-else>
      <div class="result-ring">
        <span>{{ score }}</span>
      </div>
      <h3 class="health-result-title">{{ levelLabel }}</h3>
      <p class="health-result-desc">{{ levelDesc }}</p>
      <div class="hero-actions health-result-actions">
        <button class="btn btn-secondary" @click="resetTest">重新测试</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const questions = [
  { q: '你和TA的沟通质量如何？', dim: '沟通质量', options: ['非常好', '比较好', '一般', '较差', '很差'] },
  { q: '你是否经常感受到TA的支持？', dim: '情感支持', options: ['总是', '经常', '有时', '偶尔', '从不'] },
  { q: '你们之间的信任程度如何？', dim: '信任程度', options: ['完全信任', '比较信任', '一般', '较弱', '很弱'] },
  { q: '你们能否说出自己的真实需求？', dim: '表达能力', options: ['总是可以', '大多可以', '有时可以', '不太可以', '几乎不能'] },
  { q: '冲突过后你们能修复关系吗？', dim: '修复能力', options: ['很快修复', '大多能修复', '有时能', '很难', '几乎不能'] },
  { q: '你是否觉得自己被尊重？', dim: '尊重感', options: ['非常强', '比较强', '一般', '较弱', '很弱'] },
  { q: '你们是否有共同的生活目标？', dim: '共同愿景', options: ['非常一致', '比较一致', '一般', '较少一致', '几乎没有'] },
  { q: '这段关系是否给你带来稳定感？', dim: '安全感', options: ['非常强', '比较强', '一般', '较弱', '很弱'] },
  { q: '你们相处时是否能感到轻松？', dim: '幸福感', options: ['总是', '经常', '有时', '偶尔', '从不'] },
  { q: '总体而言，你对这段关系满意吗？', dim: '总体满意', options: ['非常满意', '比较满意', '一般', '不太满意', '很不满意'] },
]

const current = ref(0)
const answers = ref(Array(questions.length).fill(undefined))
const finished = ref(false)

function selectAnswer(idx) {
  answers.value[current.value] = idx
}

const score = computed(() => {
  let total = 0
  answers.value.forEach((a) => { if (a !== undefined) total += (4 - a) * 10 })
  return total
})

const levelLabel = computed(() => {
  if (score.value >= 80) return '关系很健康'
  if (score.value >= 60) return '关系还不错'
  if (score.value >= 40) return '需要关注'
  return '需要重视'
})

const levelDesc = computed(() => {
  if (score.value >= 80) return '你们的关系状态很好，继续保持。'
  if (score.value >= 60) return '整体不错，还有一些提升空间。'
  if (score.value >= 40) return '有些方面需要注意，建议多沟通。'
  return '关系遇到了一些困难，建议寻求专业帮助。'
})

function finishTest() { finished.value = true }
function resetTest() {
  current.value = 0
  answers.value = Array(questions.length).fill(undefined)
  finished.value = false
}
</script>

<style scoped>
.health-progress-meta {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
  color: var(--ink-faint);
  font-size: 12px;
  font-weight: 700;
}

.health-question {
  margin-bottom: 16px;
  font-family: var(--font-serif);
  font-size: 18px;
}

.stack-item.active {
  border: 2px solid var(--seal-deep);
  background: linear-gradient(180deg, rgba(240, 213, 184, 0.3), rgba(255, 250, 244, 0.94));
}

.result-ring {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(240, 213, 184, 0.6), rgba(215, 104, 72, 0.24), rgba(223, 233, 221, 0.2));
  display: grid;
  place-items: center;
  margin: 20px auto;
}

.result-ring span {
  font-size: 32px;
  font-weight: 700;
  color: var(--seal-deep);
  font-family: var(--font-serif);
}

.health-result-title {
  text-align: center;
  font-family: var(--font-serif);
  font-size: 20px;
}

.health-result-desc {
  text-align: center;
  color: var(--ink-soft);
  font-size: 14px;
  margin: 8px 0 20px;
}

.health-result-actions {
  justify-content: center;
}
</style>
