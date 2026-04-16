<template>
  <div class="home-page">
    <section class="home-dossier glass-card">
      <div class="dossier-copy">
        <div class="dossier-stamp" style="background: rgba(255, 253, 250, 0.4); backdrop-filter: blur(8px);">
          <FolderHeart :size="28" style="color: var(--seal)" />
          <span>关系档案</span>
        </div>
        <p class="eyebrow">关系档案馆 · 当前总览</p>
        <h2>先把今天发生的事留住，再决定怎么开口</h2>
        <p class="home-hero__lead">
          亲健帮你把关系里的原话、情绪和变化都整理成一份档案。先看结论，再看脉络，再决定下一步怎么靠近。
        </p>
        <div class="hero-actions">
          <button class="btn btn-primary" @click="$router.push('/checkin')">
            <PenLine :size="16" /> 开始今日记录
          </button>
          <button class="btn btn-secondary" @click="$router.push('/alignment')">
            双视角分析 <ChevronRight :size="16" />
          </button>
          <button class="btn btn-ghost" @click="$router.push('/message-simulation')">
            聊天前预演 <ChevronRight :size="16" />
          </button>
          <button class="btn btn-ghost" @click="$router.push('/repair-protocol')">
            修复协议 <ChevronRight :size="16" />
          </button>
          <button class="btn btn-ghost" @click="$router.push('/timeline')">
            进入时间轴 <ChevronRight :size="16" />
          </button>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:24px;">
          <div>
            <span style="font-size:12px;font-weight:700;color:var(--ink-faint);">现在看什么</span>
            <strong style="display:block;font-family:var(--font-serif);font-size:16px;">先把原话和情绪留住</strong>
          </div>
          <div>
            <span style="font-size:12px;font-weight:700;color:var(--ink-faint);">下一步</span>
            <strong style="display:block;font-family:var(--font-serif);font-size:16px;">等脉络完整后再决定怎么开口</strong>
          </div>
        </div>
      </div>

      <div class="dossier-ledger" aria-label="今日摘要">
        <article class="glass-card temperature-slip">
          <div>
            <span style="display:flex; align-items:center; gap: 4px;"><Thermometer :size="14" /> 关系温度</span>
            <strong>{{ crisisLevel === 'none' ? '平稳' : crisisLabel }}</strong>
          </div>
          <div class="progress-track">
            <span class="progress-track__fill" :style="{ width: `${scorePercent}%` }"></span>
          </div>
          <div class="score-card__meta">
            <span>第 {{ streakDays || 1 }}/7 天</span>
            <span>{{ crisisLabel }}</span>
          </div>
        </article>
        <article class="glass-card next-slip">
          <span style="display:flex; align-items:center; gap: 4px;"><Lightbulb :size="14" /> 今天最该做</span>
          <strong>先写下一句真正刺到你的原话</strong>
          <p>结论越晚下，理解通常越准确。</p>
        </article>
        <article class="glass-card" style="padding:14px;border:1px solid var(--border-strong);border-radius:var(--radius-lg);background:rgba(255,253,250,0.62);">
          <span style="font-size:12px;font-weight:700;color:var(--ink-faint);">当前关系</span>
          <strong style="display:block;font-family:var(--font-serif);font-size:17px;">{{ currentRelationLabel }}</strong>
        </article>
      </div>
    </section>

    <div class="home-metrics" aria-label="关系状态摘要">
      <div class="glass-card metric-item">
        <span style="display:flex; align-items:center; gap: 4px;"><CalendarDays :size="14" /> 连续记录</span>
        <strong>{{ streakDays }} 天</strong>
        <p>连续记录会让建议更稳定。</p>
      </div>
      <div class="glass-card metric-item">
        <span style="display:flex; align-items:center; gap: 4px;"><UserCheck :size="14" /> 我的状态</span>
        <strong>{{ myDone ? '已记录' : '未记录' }}</strong>
        <p>{{ myDone ? '今天这半边已经留住了。' : '今天还没记录' }}</p>
      </div>
      <div class="glass-card metric-item">
        <span style="display:flex; align-items:center; gap: 4px;"><Users :size="14" /> 对方状态</span>
        <strong>{{ partnerDone ? '已记录' : '待同步' }}</strong>
        <p>{{ partnerDone ? '对方也记过了' : '还差对方这半边。' }}</p>
      </div>
      <div class="glass-card metric-item">
        <span style="display:flex; align-items:center; gap: 4px;"><Activity :size="14" /> 关系信号</span>
        <strong>{{ crisisLabel }}</strong>
        <p>先看信号提醒，再决定怎么靠近。</p>
      </div>
    </div>

    <div class="home-ledger">
      <div class="home-ledger__main">
        <section class="archive-panel">
          <div class="card-header">
            <div>
              <p class="eyebrow">最近脉络</p>
              <h3>误会不是突然发生的</h3>
            </div>
            <button class="btn btn-ghost btn-sm" @click="$router.push('/timeline')">进入时间轴</button>
          </div>
          <div class="timeline-mini">
            <div class="timeline-mini__item">
              <span class="timeline-mini__time">昨天</span>
              <div>
                <strong>你先解释，她先沉默</strong>
                <p>这不是态度问题，更像节奏没有接上。</p>
              </div>
            </div>
            <div class="timeline-mini__item">
              <span class="timeline-mini__time">今天</span>
              <div>
                <strong>原话还没被完整记录</strong>
                <p>先把那一句留住，比立刻判断谁对谁错更重要。</p>
              </div>
            </div>
            <div class="timeline-mini__item">
              <span class="timeline-mini__time">下一步</span>
              <div>
                <strong>先缓和，再表达事实</strong>
                <p>更容易被接住的话，通常都不是第一反应。</p>
              </div>
            </div>
          </div>
        </section>

        <section class="archive-panel evidence-panel">
          <div class="card-header">
            <div>
              <p class="eyebrow">证据摘录</p>
              <h3>为什么会有这个判断</h3>
            </div>
          </div>
          <div class="evidence-stack">
            <figure class="evidence-card">
              <blockquote>“你根本没懂我为什么会难受。”</blockquote>
              <figcaption>原话保留了情绪重心，比事后总结更能帮助判断。</figcaption>
            </figure>
            <figure class="evidence-card evidence-card--soft">
              <blockquote>“先别急着证明自己是对的。”</blockquote>
              <figcaption>这一步是在帮你把关系从对抗，重新拉回理解。</figcaption>
            </figure>
          </div>
        </section>

        <div class="home-support-grid" aria-label="下一步建议和提示">
          <section class="archive-panel">
            <div class="card-header">
              <div>
                <p class="eyebrow">下一步建议</p>
                <h3>先做一件真的能缓和局面的事</h3>
              </div>
            </div>
            <div class="action-stack">
              <div class="action-card action-card--accent">
                <span>优先做</span>
                <strong>先写下今天最真实的一句</strong>
                <p>不用写很多，先留一句原话和那一瞬间的感受。</p>
              </div>
              <div class="action-card">
                <span>然后做</span>
                <strong>补充上下文和语气</strong>
                <p>中文关系场景里，停顿、顺序和语气都很重要。</p>
              </div>
            </div>
          </section>

          <section class="archive-panel boundary-panel">
            <div class="card-header">
              <div>
                <p class="eyebrow">温馨提示</p>
                <h3>{{ crisisLabel }}</h3>
              </div>
            </div>
            <p>
              亲健提供的是关系整理和建议支持，不会替代专业判断。如果关系遇到严重困难，建议寻求专业帮助。
            </p>
            <div class="hero-actions">
              <button class="btn btn-ghost btn-sm" @click="$router.push('/report')">查看简报页</button>
            </div>
          </section>
        </div>
      </div>

      <aside class="home-ledger__side">
        <section class="archive-panel life-tree-panel">
          <div class="card-header">
            <div>
              <p class="eyebrow">生命树</p>
              <h3>{{ treeLevel }}</h3>
            </div>
            <span class="tree-score">{{ treeProgress }}%</span>
          </div>
          <div class="life-tree-video" aria-label="生命树成长动画">
            <div class="tree-stage-strip">
              <span>种子</span>
              <span>发芽</span>
              <span>小树</span>
              <span>大树</span>
            </div>
            <div class="tree-energy-bubbles" aria-label="绿色能量">
              <span
                v-for="(bubble, index) in treeEnergyBubbles"
                :key="bubble.label"
                class="energy-bubble"
                :class="`energy-bubble--${index + 1}`"
              >
                {{ bubble.label }} {{ bubble.value }}
              </span>
            </div>
            <svg
              class="life-tree-svg"
              :class="{ 'life-tree-svg--decayed': treeDecayPoints > 0 }"
              viewBox="0 0 260 260"
              role="img"
              aria-label="生命树从种子成长为大树"
            >
              <defs>
                <linearGradient id="treeTrunkGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stop-color="#8f5a42" />
                  <stop offset="100%" stop-color="#5b3a2a" />
                </linearGradient>
                <radialGradient id="energyGlow" cx="50%" cy="38%" r="58%">
                  <stop offset="0%" stop-color="#f8fff2" />
                  <stop offset="60%" stop-color="#a9d86b" />
                  <stop offset="100%" stop-color="#5c9f47" />
                </radialGradient>
              </defs>
              <path class="tree-hill tree-hill--back" d="M22 222 C60 184 92 208 130 184 C176 154 204 196 238 174 L238 260 L22 260 Z" />
              <path class="tree-hill tree-hill--front" d="M0 230 C42 204 78 224 116 204 C154 184 191 214 260 194 L260 260 L0 260 Z" />
              <ellipse class="tree-soil" cx="130" cy="218" rx="78" ry="14" />
              <g class="tree-seed">
                <ellipse cx="130" cy="214" rx="13" ry="9" />
              </g>
              <g class="tree-sprout">
                <path d="M130 213 C130 194 130 183 130 165" />
                <path d="M130 184 C113 174 103 161 100 146" />
                <path d="M131 176 C149 166 160 152 164 136" />
              </g>
              <g class="tree-grown">
                <path class="tree-trunk" d="M129 214 C126 184 127 152 132 119 C136 147 140 181 137 214 Z" />
                <path class="tree-branch tree-branch--left" d="M131 155 C109 143 93 127 82 105" />
                <path class="tree-branch tree-branch--right" d="M133 143 C158 130 177 111 188 88" />
                <path class="tree-branch tree-branch--top" d="M132 126 C130 104 133 86 143 66" />
                <circle class="tree-leaf-bloom tree-leaf-bloom--1" cx="78" cy="98" r="30" />
                <circle class="tree-leaf-bloom tree-leaf-bloom--2" cx="113" cy="74" r="36" />
                <circle class="tree-leaf-bloom tree-leaf-bloom--3" cx="154" cy="70" r="38" />
                <circle class="tree-leaf-bloom tree-leaf-bloom--4" cx="191" cy="102" r="33" />
                <circle class="tree-leaf-bloom tree-leaf-bloom--5" cx="135" cy="112" r="42" />
              </g>
              <g class="tree-energy-drops" aria-hidden="true">
                <circle cx="84" cy="154" r="10" />
                <circle cx="182" cy="146" r="8" />
                <circle cx="150" cy="182" r="7" />
              </g>
            </svg>
            <div class="life-tree-caption">
              <strong>{{ treeChapter }}</strong>
              <p>{{ treeGrowth }} 点绿色能量，{{ treeCaption }}</p>
            </div>
          </div>
          <div class="tree-progress-head">
            <span>成长进度</span>
            <strong>{{ treeProgress }}%</strong>
          </div>
          <div class="tree-progress">
            <span :style="{ width: `${treeProgress}%` }"></span>
            <i v-if="treeDecayProgress > 0" :style="{ left: `${treeProgress}%`, width: `${treeDecayProgress}%` }"></i>
          </div>
          <p class="tree-decay-note" :class="{ 'tree-decay-note--warning': treeDecayPoints > 0 }">
            {{ treeDecayNote }}
          </p>
          <div class="tree-actions">
            <button
              class="btn btn-primary btn-sm tree-water-btn"
              :disabled="!treeCanWater || isWatering"
              @click="handleWaterTree"
            >
              {{ treeWaterLabel }}
            </button>
            <button class="btn btn-ghost btn-sm" @click="$router.push('/relationship-spaces')">切换关系空间</button>
          </div>
          <div class="tree-leaves">
            <div v-for="leaf in treeLeaves" :key="leaf.label" class="tree-leaf">
              <span>{{ leaf.label }}</span>
              <strong>{{ leaf.value }}</strong>
              <p>{{ leaf.note }}</p>
            </div>
          </div>
        </section>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { computed, inject, onMounted, ref } from 'vue'
import { FolderHeart, PenLine, ChevronRight, Thermometer, Lightbulb, CalendarDays, UserCheck, Users, Activity } from 'lucide-vue-next'
import { useHomeStore } from '@/stores/home'
import { useUserStore } from '@/stores/user'

const homeStore = useHomeStore()
const userStore = useUserStore()
const showToast = inject('showToast', () => {})
const isWatering = ref(false)

const streakDays = computed(() => homeStore.snapshot?.streak?.streak || 0)
const myDone = computed(() => homeStore.snapshot?.todayStatus?.my_done || false)
const partnerDone = computed(() => homeStore.snapshot?.todayStatus?.partner_done || false)
const crisisLevel = computed(() => homeStore.crisis?.crisis_level || 'none')
const scorePercent = computed(() => {
  const map = { none: 76, mild: 55, moderate: 35, severe: 15 }
  return map[crisisLevel.value] || 76
})

const crisisLabel = computed(() => {
  const map = { none: '平稳', mild: '可以留意', moderate: '需要关注', severe: '建议寻求专业帮助' }
  return map[crisisLevel.value] || '平稳'
})

const relationTypeLabel = computed(() => {
  const map = { couple: '情侣', spouse: '夫妻', friend: '朋友' }
  return map[userStore.currentPair?.type] || '关系'
})
const currentRelationLabel = computed(() => `${relationTypeLabel.value} · ${userStore.partnerName || '对方'}`)
const treeLevel = computed(() => homeStore.tree?.level_name || '关系萌芽期')
const treeProgress = computed(() => Math.min(100, Math.max(0, Number(homeStore.tree?.display_progress_percent ?? homeStore.tree?.progress_percent ?? 0))))
const treeDecayProgress = computed(() => Math.min(100 - treeProgress.value, Math.max(0, Number(homeStore.tree?.decay_progress_percent || 0))))
const treeDecayPoints = computed(() => Math.max(0, Number(homeStore.tree?.decay_points || 0)))
const treeGrowth = computed(() => Number(homeStore.tree?.effective_growth_points ?? homeStore.tree?.growth_points ?? 0))
const treeChapter = computed(() => homeStore.tree?.chapter || '第 1 章：把今天留下来')
const treeWaterBonus = computed(() => Math.max(1, Number(homeStore.tree?.water_bonus || 12)))
const treeCanWater = computed(() => homeStore.tree?.can_water !== false)
const treeDaysWithoutWater = computed(() => Math.max(0, Number(homeStore.tree?.days_without_water || 0)))
const treeWaterLabel = computed(() => {
  if (isWatering.value) return '浇水中...'
  return treeCanWater.value ? `浇水 +${treeWaterBonus.value}` : '今天已浇水'
})
const treeCaption = computed(() => treeDecayPoints.value > 0 ? '叶子有点发黄，浇水后会慢慢恢复。' : '从今天的记录继续长大。')
const treeDecayNote = computed(() => {
  if (treeDecayPoints.value <= 0) return '今天状态稳定，继续浇水能保持成长。'
  return `${treeDaysWithoutWater.value} 天没浇水，回退 ${treeDecayPoints.value} 点绿色能量。`
})
const treeEnergyBubbles = computed(() => homeStore.tree?.energy_bubbles?.length ? homeStore.tree.energy_bubbles : [
  { label: '记录', value: '+12' },
  { label: '共情', value: '+8' },
  { label: '修复', value: '+16' },
])
const treeLeaves = computed(() => homeStore.tree?.leaves?.length ? homeStore.tree.leaves : [
  { label: '原话', value: '0 条', note: '先记录一句真实发生的话。' },
  { label: '修复', value: '0 次', note: '完成小行动后会长出新枝叶。' },
])

async function handleWaterTree() {
  if (!userStore.currentPair?.id) {
    showToast('请先绑定关系')
    return
  }
  if (!treeCanWater.value) {
    showToast('今天已浇过水，明天再来')
    return
  }
  isWatering.value = true
  try {
    const updated = await homeStore.waterTree(userStore.currentPair.id)
    const pointsAdded = updated?.points_added || treeWaterBonus.value
    showToast(`浇水成功，绿色能量 +${pointsAdded}`)
  } catch (e) {
    showToast(e.message || '浇水失败，请稍后再试')
  } finally {
    isWatering.value = false
  }
}

onMounted(async () => {
  if (userStore.currentPair?.id) {
    await homeStore.loadAll(userStore.currentPair.id)
  }
})
</script>

<style scoped>
.home-page {
  width: min(var(--content-max), calc(100% - 32px));
  margin: 0 auto;
  padding: 28px 0 28px;
}

.home-dossier {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 330px;
  gap: 24px;
  align-items: stretch;
  margin-bottom: 18px;
  padding: 28px;
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-lg);
  background:
    linear-gradient(90deg, rgba(189, 75, 53, 0.08), transparent 40%),
    linear-gradient(180deg, rgba(255, 253, 250, 0.92), rgba(244, 247, 239, 0.86));
}

.dossier-copy {
  position: relative;
  min-height: 255px;
  padding-right: 12px;
}

.dossier-stamp {
  position: absolute;
  top: 0;
  right: 0;
  display: grid;
  place-items: center;
  width: 76px;
  height: 76px;
  border: 1px solid rgba(189, 75, 53, 0.42);
  border-radius: var(--radius-lg);
  color: var(--seal-deep);
  background: rgba(255, 253, 250, 0.72);
  transform: rotate(2deg);
}

.dossier-stamp img {
  width: 30px;
  height: 30px;
  border-radius: var(--radius-sm);
}

.dossier-stamp span {
  font-size: 11px;
  font-weight: 700;
}

.dossier-copy h2 {
  max-width: 760px;
  margin: 8px 92px 12px 0;
  color: var(--ink);
  font-family: var(--font-serif);
  font-size: 34px;
  font-weight: 700;
  line-height: 1.28;
}

.home-hero__lead {
  max-width: 680px;
  color: var(--ink-soft);
  font-size: 15px;
  line-height: 1.8;
}

.dossier-ledger {
  display: grid;
  gap: 12px;
}

.temperature-slip,
.next-slip,
.archive-panel,
.metric-item {
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-lg);
  background: rgba(255, 253, 250, 0.72);
}

.temperature-slip,
.next-slip {
  padding: 18px;
}

.temperature-slip div:first-child {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 14px;
}

.temperature-slip span,
.next-slip span,
.metric-item span {
  color: var(--ink-faint);
  font-size: 12px;
  font-weight: 700;
}

.temperature-slip strong,
.next-slip strong {
  display: block;
  color: var(--seal-deep);
  font-family: var(--font-serif);
  font-size: 21px;
  line-height: 1.35;
}

.score-card__meta {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
  color: var(--ink-faint);
  font-size: 12px;
}

.next-slip p {
  margin-top: 8px;
  color: var(--ink-soft);
  font-size: 13px;
}

.home-metrics {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
  margin-bottom: 18px;
}

.metric-item {
  padding: 16px;
  background: rgba(255, 253, 250, 0.62);
}

.metric-item strong {
  display: block;
  margin: 4px 0;
  color: var(--moss-deep);
  font-family: var(--font-serif);
  font-size: 21px;
  font-weight: 700;
}

.metric-item p {
  color: var(--ink-faint);
  font-size: 12px;
  line-height: 1.45;
}

.home-ledger {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 330px;
  gap: 16px;
  align-items: start;
}

.home-ledger__main,
.home-ledger__side {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.home-support-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.archive-panel {
  padding: 22px;
}

.timeline-mini {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.timeline-mini__item {
  position: relative;
  display: grid;
  grid-template-columns: 58px minmax(0, 1fr);
  gap: 16px;
  padding: 14px 0 14px 2px;
  border-top: 1px solid var(--border);
}

.timeline-mini__item:first-child { border-top: 0; }

.timeline-mini__time {
  color: var(--seal);
  font-size: 12px;
  font-weight: 700;
}

.timeline-mini__item strong {
  display: block;
  color: var(--ink);
  font-size: 15px;
}

.timeline-mini__item p {
  margin-top: 3px;
  color: var(--ink-soft);
  font-size: 13px;
  line-height: 1.55;
}

.evidence-stack {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.evidence-card {
  margin: 0;
  padding: 16px;
  border: 1px solid rgba(189, 75, 53, 0.22);
  border-radius: var(--radius-lg);
  background: rgba(243, 216, 208, 0.34);
}

.evidence-card--soft {
  border-color: rgba(78, 116, 91, 0.25);
  background: rgba(220, 231, 218, 0.42);
}

.evidence-card blockquote {
  color: var(--ink);
  font-family: var(--font-serif);
  font-size: 18px;
  line-height: 1.65;
}

.evidence-card figcaption {
  margin-top: 10px;
  color: var(--ink-soft);
  font-size: 12px;
  line-height: 1.55;
}

.action-stack {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.action-card {
  padding: 14px;
  border: 1px solid rgba(78, 116, 91, 0.18);
  border-radius: var(--radius-lg);
  background: rgba(255, 253, 250, 0.58);
}

.action-card--accent {
  border-color: rgba(189, 75, 53, 0.28);
  background: rgba(243, 216, 208, 0.28);
}

.action-card span {
  color: var(--seal);
  font-size: 11px;
  font-weight: 700;
}

.action-card strong {
  display: block;
  margin: 4px 0;
  color: var(--ink);
  font-size: 14px;
}

.action-card p,
.boundary-panel p {
  color: var(--ink-soft);
  font-size: 13px;
  line-height: 1.65;
}

.boundary-panel {
  border-color: rgba(78, 116, 91, 0.25);
  background: rgba(220, 231, 218, 0.38);
}

.life-tree-panel {
  overflow: hidden;
  border-color: rgba(78, 116, 91, 0.28);
  background:
    linear-gradient(180deg, rgba(220, 231, 218, 0.52), rgba(255, 253, 250, 0.76));
}

.tree-score {
  min-width: 54px;
  height: 34px;
  display: grid;
  place-items: center;
  border: 1px solid rgba(78, 116, 91, 0.28);
  border-radius: var(--radius-sm);
  color: var(--moss-deep);
  background: rgba(255, 253, 250, 0.72);
  font-weight: 800;
}

.life-tree-video {
  position: relative;
  display: grid;
  gap: 10px;
  margin: 12px 0 14px;
  padding: 12px;
  overflow: hidden;
  border: 1px solid rgba(78, 116, 91, 0.22);
  border-radius: var(--radius-sm);
  background:
    radial-gradient(circle at 50% 18%, rgba(246, 255, 226, 0.96), rgba(220, 231, 218, 0.72) 36%, rgba(255, 253, 250, 0.76) 74%);
}

.tree-stage-strip {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
  color: var(--moss-deep);
  font-size: 11px;
  font-weight: 800;
}

.tree-stage-strip span {
  padding: 5px 0;
  border-radius: var(--radius-sm);
  background: rgba(255, 253, 250, 0.7);
  text-align: center;
}

.life-tree-svg {
  width: 100%;
  height: clamp(190px, 20vw, 230px);
  min-height: 0;
}

.tree-energy-bubbles {
  position: absolute;
  inset: 46px 12px auto 12px;
  z-index: 2;
  height: 130px;
  pointer-events: none;
}

.energy-bubble {
  position: absolute;
  min-width: 70px;
  height: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 10px;
  border: 1px solid rgba(74, 145, 67, 0.36);
  border-radius: var(--radius-sm);
  background: linear-gradient(180deg, rgba(246, 255, 238, 0.94), rgba(169, 216, 107, 0.82));
  color: #2f6435;
  box-shadow: 0 10px 22px rgba(75, 128, 66, 0.16);
  font-size: 12px;
  font-weight: 900;
  animation: energyFloat 4.6s ease-in-out infinite;
}

.energy-bubble--a,
.energy-bubble--1 {
  left: 6%;
  top: 40px;
}

.energy-bubble--b,
.energy-bubble--2 {
  right: 3%;
  top: 22px;
  animation-delay: 0.7s;
}

.energy-bubble--c,
.energy-bubble--3 {
  left: 38%;
  top: 86px;
  animation-delay: 1.2s;
}

.tree-hill {
  opacity: 0.9;
}

.tree-hill--back {
  fill: rgba(173, 211, 134, 0.5);
}

.tree-hill--front {
  fill: rgba(119, 171, 92, 0.58);
}

.tree-soil {
  fill: rgba(134, 58, 43, 0.24);
  animation: treeSoilPulse 8s ease-in-out infinite;
}

.tree-seed ellipse {
  fill: #7d4d34;
  transform-origin: 130px 214px;
  animation: treeSeed 8s ease-in-out infinite;
}

.tree-sprout {
  fill: none;
  stroke: var(--moss);
  stroke-width: 8;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: 160;
  stroke-dashoffset: 160;
  opacity: 0;
  animation: treeSprout 8s ease-in-out infinite;
}

.tree-grown {
  transform-origin: 130px 218px;
  animation: treeGrow 8s ease-in-out infinite;
}

.tree-trunk {
  fill: url(#treeTrunkGradient);
}

.tree-branch {
  fill: none;
  stroke: #6f4935;
  stroke-width: 10;
  stroke-linecap: round;
  stroke-dasharray: 130;
  stroke-dashoffset: 130;
  animation: treeBranch 8s ease-in-out infinite;
}

.tree-leaf-bloom {
  fill: rgba(78, 116, 91, 0.9);
  transform-box: fill-box;
  transform-origin: center;
  animation: treeLeafBloom 8s ease-in-out infinite;
}

.tree-leaf-bloom--2,
.tree-leaf-bloom--4 {
  fill: rgba(98, 139, 104, 0.92);
}

.tree-leaf-bloom--5 {
  fill: rgba(161, 205, 108, 0.96);
}

.life-tree-svg--decayed .tree-leaf-bloom {
  fill: rgba(199, 169, 73, 0.92);
}

.life-tree-svg--decayed .tree-leaf-bloom--2,
.life-tree-svg--decayed .tree-leaf-bloom--4 {
  fill: rgba(213, 188, 90, 0.9);
}

.life-tree-svg--decayed .tree-leaf-bloom--5 {
  fill: rgba(226, 203, 105, 0.95);
}

.life-tree-svg--decayed .tree-energy-drops circle {
  opacity: 0.5;
}

.tree-energy-drops circle {
  fill: url(#energyGlow);
  stroke: rgba(255, 255, 255, 0.88);
  stroke-width: 2;
  animation: energyDropPulse 3.6s ease-in-out infinite;
}

.tree-energy-drops circle:nth-child(2) {
  animation-delay: 0.7s;
}

.tree-energy-drops circle:nth-child(3) {
  animation-delay: 1.1s;
}

.life-tree-caption {
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  background: rgba(255, 253, 250, 0.72);
  text-align: center;
}

.life-tree-caption strong {
  color: var(--ink);
  font-family: var(--font-serif);
  font-size: 15px;
}

.life-tree-caption p {
  margin-top: 5px;
  color: var(--ink-soft);
  font-size: 12px;
  line-height: 1.55;
}

.tree-progress-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 6px;
  color: var(--ink-faint);
  font-size: 12px;
  font-weight: 800;
}

.tree-progress-head strong {
  color: var(--moss-deep);
  font-size: 13px;
}

.tree-progress {
  position: relative;
  height: 8px;
  overflow: hidden;
  border-radius: var(--radius-sm);
  background: rgba(44, 48, 39, 0.08);
}

.tree-progress span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, var(--moss), var(--seal));
  transition: width 260ms ease;
}

.tree-progress i {
  position: absolute;
  top: 0;
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, rgba(222, 184, 73, 0.96), rgba(177, 128, 41, 0.86));
  transition: left 260ms ease, width 260ms ease;
}

.tree-decay-note {
  margin-top: 6px;
  color: var(--ink-soft);
  font-size: 12px;
  line-height: 1.5;
}

.tree-decay-note--warning {
  color: #806220;
  font-weight: 800;
}

.tree-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.tree-water-btn:disabled {
  cursor: not-allowed;
  opacity: 0.68;
}

.tree-leaves {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  margin: 12px 0;
}

.tree-leaf {
  padding: 9px 8px;
  border: 1px solid rgba(44, 48, 39, 0.1);
  border-radius: var(--radius-sm);
  background: rgba(255, 253, 250, 0.64);
}

.tree-leaf span {
  color: var(--ink-faint);
  font-size: 11px;
  font-weight: 800;
}

.tree-leaf strong {
  display: block;
  margin-top: 2px;
  color: var(--seal-deep);
  font-size: 15px;
}

.tree-leaf p {
  margin-top: 2px;
  color: var(--ink-soft);
  font-size: 11px;
  line-height: 1.35;
}

@keyframes treeSeed {
  0%, 10% { transform: scale(0.75); opacity: 1; }
  22%, 100% { transform: scale(0.2) translateY(18px); opacity: 0; }
}

@keyframes treeSprout {
  0%, 16% { stroke-dashoffset: 160; opacity: 0; }
  26%, 42% { stroke-dashoffset: 0; opacity: 1; }
  58%, 100% { opacity: 0; }
}

@keyframes treeGrow {
  0%, 38% { transform: scale(0.18); opacity: 0; }
  54% { transform: scale(0.74); opacity: 1; }
  72%, 100% { transform: scale(1); opacity: 1; }
}

@keyframes treeBranch {
  0%, 48% { stroke-dashoffset: 130; opacity: 0; }
  66%, 100% { stroke-dashoffset: 0; opacity: 1; }
}

@keyframes treeLeafBloom {
  0%, 56% { transform: scale(0.05); opacity: 0; }
  72% { transform: scale(1.08); opacity: 0.95; }
  86%, 100% { transform: scale(1); opacity: 1; }
}

@keyframes treeSoilPulse {
  0%, 100% { transform: scaleX(0.88); opacity: 0.62; }
  50% { transform: scaleX(1); opacity: 1; }
}

@keyframes energyFloat {
  0%, 100% { transform: translateY(0); opacity: 0.84; }
  50% { transform: translateY(-10px); opacity: 1; }
}

@keyframes energyDropPulse {
  0%, 100% { transform: scale(0.88); opacity: 0.7; }
  50% { transform: scale(1.18); opacity: 1; }
}

@media (max-width: 940px) {
  .home-dossier,
  .home-ledger {
    grid-template-columns: 1fr;
  }

  .dossier-copy { min-height: auto; }
  .dossier-ledger { grid-template-columns: 1fr 1fr; }
  .home-metrics { grid-template-columns: repeat(2, 1fr); }
  .home-support-grid { grid-template-columns: 1fr; }
}

@media (max-width: 600px) {
  .home-page {
    width: min(100% - 24px, var(--content-max));
    padding-top: 18px;
  }

  .home-dossier {
    padding: 18px;
  }

  .dossier-stamp {
    position: static;
    width: 58px;
    height: 58px;
    margin-bottom: 14px;
  }

  .dossier-stamp img {
    width: 24px;
    height: 24px;
  }

  .dossier-copy h2 {
    margin-right: 0;
    font-size: 25px;
  }

  .tree-leaves {
    grid-template-columns: 1fr;
  }

  .dossier-ledger,
  .home-metrics,
  .evidence-stack {
    grid-template-columns: 1fr;
  }

  .archive-panel { padding: 16px; }
}
</style>
