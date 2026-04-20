<template>
  <div class="pair-page page-shell page-shell--wide page-stack">
    <div class="page-head pair-page__head">
      <p class="eyebrow">关系空间</p>
      <h2>先看见你和每段关系现在的距离</h2>
      <p>{{ headSummary }}</p>
      <div class="hero-actions pair-shortcuts">
        <button
          v-for="shortcut in sectionShortcuts"
          :key="shortcut.to"
          class="btn btn-ghost btn-sm pair-shortcuts__button"
          :class="{ active: shortcut.isActive }"
          type="button"
          @click="goToShortcut(shortcut)"
        >
          {{ shortcut.label }}
        </button>
        <button
          v-if="currentPairPending"
          class="btn btn-ghost btn-sm pair-shortcuts__button"
          :class="{ active: route.path === RELATIONSHIP_INVITE_ROUTE }"
          type="button"
          @click="goToCurrentInvite"
        >
          当前邀请
        </button>
      </div>
    </div>

    <section class="pair-overview">
      <RelationshipConstellation
        :center="spaceModel.center"
        :nodes="spaceModel.nodes"
        :selected-pair-id="selectedPairId"
        @select="handleSelectNode"
      />

      <RelationshipSidebarPanel
        class="pair-overview__sidebar"
        :summary="selectedSidebar"
        @open-detail="openRelationshipDetail"
      />
    </section>

    <section class="pair-context">
      <article class="pair-context__card">
        <span>关系规则</span>
        <strong>越靠近你，说明这段关系整体越稳</strong>
        <p>长期总分决定基础距离，最近状态只负责轻微浮动和亮度变化，所以关系图不会乱跳。</p>
      </article>
      <article class="pair-context__card">
        <span>当前关注</span>
        <strong>{{ selectedSidebar?.trendLabel || '先点一个头像看看这段关系最近发生了什么' }}</strong>
        <p>{{ selectedSidebar?.recentSummary || '点头像后右侧会先显示最近动态、关系分和改善建议，再决定要不要进入专属关系页。' }}</p>
      </article>
    </section>

    <RelationshipManagementPanel
      :shortcuts="sectionShortcuts"
      :pairs="pairListItems"
      :current-pair-id="userStore.currentPairId"
      :create-options="createOptions"
      :selected-type="selectedType"
      :creating="creating"
      :join-code="joinCode"
      :joining="joining"
      :invite-code="currentPairPending ? (userStore.currentPair?.invite_code || '') : ''"
      :refreshing="refreshing"
      @shortcut="goToShortcut"
      @select-pair="handleManagementPairSelect"
      @select-type="selectCreateType"
      @create="handleCreate"
      @join-input="handleInviteCodeInput"
      @join="handleJoin"
      @copy-code="copyCode"
      @refresh-status="refreshStatus"
    />
  </div>
</template>

<script setup>
import { computed, inject, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import RelationshipConstellation from '@/components/relationship/RelationshipConstellation.vue'
import RelationshipSidebarPanel from '@/components/relationship/RelationshipSidebarPanel.vue'
import RelationshipManagementPanel from '@/components/relationship/RelationshipManagementPanel.vue'
import { demoFixture } from '@/demo/fixtures'
import { useUserStore } from '@/stores/user'
import { buildRelationshipSpaceModel } from '@/utils/relationshipSpaceModel'
import { CREATABLE_RELATIONSHIP_TYPE_LABELS, pairStatusLabel, relationshipTypeLabel } from '@/utils/displayText'
import {
  RELATIONSHIP_INVITE_ROUTE,
  RELATIONSHIP_JOIN_ROUTE,
  RELATIONSHIP_LIST_ROUTE,
  RELATIONSHIP_MANAGEMENT_ROUTE,
} from '@/utils/relationshipRouting'
import { getPartnerDisplayName } from '@/utils/relationshipSpaces'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const showToast = inject('showToast')

const INVITE_CODE_LENGTH = 10
const INVITE_CODE_PATTERN = /^[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{10}$/
const selectedType = ref('friend')
const joinCode = ref('')
const creating = ref(false)
const joining = ref(false)
const refreshing = ref(false)
const selectedPairId = ref('')

const currentPairPending = computed(() => userStore.currentPair?.status === 'pending')

const sectionShortcuts = computed(() => [
  {
    label: '查看关系',
    to: RELATIONSHIP_LIST_ROUTE,
    isActive: route.path === RELATIONSHIP_LIST_ROUTE,
  },
  {
    label: '发起邀请',
    to: RELATIONSHIP_INVITE_ROUTE,
    isActive: route.path === RELATIONSHIP_INVITE_ROUTE,
  },
  {
    label: '输入邀请码',
    to: RELATIONSHIP_JOIN_ROUTE,
    isActive: route.path === RELATIONSHIP_JOIN_ROUTE,
  },
])

const createOptions = computed(() =>
  Object.entries(CREATABLE_RELATIONSHIP_TYPE_LABELS).map(([value, label]) => ({
    value,
    label,
  }))
)

const pairListItems = computed(() =>
  userStore.pairs.map((pair) => ({
    id: pair.id,
    label: `${relationshipTypeLabel(pair.type)} · ${getPartnerDisplayName(pair)}`,
    meta: `${pair.id === userStore.currentPairId ? '当前关系 · ' : ''}${pairStatusLabel(pair.status)}`,
    raw: pair,
  }))
)

const metricsByPairId = computed(() => {
  if (userStore.isDemoMode) {
    return demoFixture.relationshipMetrics || {}
  }

  return Object.fromEntries(
    userStore.pairs.map((pair) => {
      const isCurrent = pair.id === userStore.currentPairId
      if (pair.status !== 'active') {
        return [pair.id, {
          score: 42,
          trend: 'flat',
          summary: '这段关系还在等待加入，现在先把邀请码发给对方。',
          nextAction: '把邀请码发给对方，等这段关系真正建立起来。',
        }]
      }

      return [pair.id, {
        score: isCurrent ? 76 : 68,
        trend: isCurrent ? 'up' : 'flat',
        summary: isCurrent
          ? '这段关系最近仍有连接，你可以先从一个低压力动作继续靠近。'
          : '这段关系已经建立，可以点开看看最近状态，再决定要不要继续推进。',
        nextAction: isCurrent
          ? '先做一个低压力的靠近动作。'
          : '先点开看看这段关系最近发生了什么。',
      }]
    })
  )
})

const spaceModel = computed(() =>
  buildRelationshipSpaceModel({
    me: userStore.me,
    currentPairId: selectedPairId.value,
    pairs: userStore.pairs,
    metricsByPairId: metricsByPairId.value,
  })
)

const selectedSidebar = computed(() => spaceModel.value.selectedSidebar)

const headSummary = computed(() =>
  selectedSidebar.value?.trendLabel
    ? `${selectedSidebar.value.trendLabel}。点头像先看最近动态、关系分和改善建议。`
    : '关系会按综合分排布。越靠近你，说明这段关系整体越稳。'
)

watch(
  () => [userStore.currentPairId, userStore.pairs.map((pair) => pair.id).join('|')],
  () => {
    if (!userStore.pairs.length) {
      selectedPairId.value = ''
      return
    }
    const stillExists = userStore.pairs.some((pair) => pair.id === selectedPairId.value)
    if (!stillExists) {
      selectedPairId.value = userStore.currentPairId || userStore.pairs[0]?.id || ''
    }
  },
  { immediate: true }
)

function normalizeInviteCode(value) {
  return String(value || '').toUpperCase().replace(/[^0-9A-Z]/g, '').slice(0, INVITE_CODE_LENGTH)
}

function handleSelectNode(pairId) {
  selectedPairId.value = String(pairId || '')
}

function selectCreateType(type) {
  selectedType.value = String(type || 'friend')
}

function handleInviteCodeInput(event) {
  joinCode.value = normalizeInviteCode(event?.target?.value)
}

function goToShortcut(shortcut) {
  if (!shortcut?.to || route.path === shortcut.to) return
  router.push(shortcut.to)
}

function goToCurrentInvite() {
  if (route.path === RELATIONSHIP_INVITE_ROUTE) return
  router.push(RELATIONSHIP_INVITE_ROUTE)
}

async function handleManagementPairSelect(pairItem) {
  const pair = pairItem?.raw
  if (!pair?.id) return
  await userStore.switchPair(pair.id)
  selectedPairId.value = pair.id
  showToast(`已切换到 ${relationshipTypeLabel(pair.type)} · ${getPartnerDisplayName(pair)}`)
}

async function openRelationshipDetail(pairId) {
  const targetPairId = String(pairId || selectedPairId.value || '')
  if (!targetPairId) return
  if (targetPairId !== userStore.currentPairId) {
    await userStore.switchPair(targetPairId)
  }
  router.push(`/relationship-space/${targetPairId}`)
}

async function handleCreate() {
  creating.value = true
  try {
    const pair = await userStore.createPair(selectedType.value)
    selectedPairId.value = pair?.id || selectedPairId.value
    showToast('邀请码已生成，在下方可以直接复制')
    await router.push(RELATIONSHIP_INVITE_ROUTE)
  } catch (e) {
    showToast(e.message || '刚刚没创建成功，稍后再试一次')
  } finally {
    creating.value = false
  }
}

async function handleJoin() {
  const normalizedCode = normalizeInviteCode(joinCode.value)
  joinCode.value = normalizedCode
  if (normalizedCode.length !== INVITE_CODE_LENGTH) { showToast('请输入 10 位邀请代码'); return }
  if (!INVITE_CODE_PATTERN.test(normalizedCode)) { showToast('邀请代码格式不对，请核对后再试'); return }
  joining.value = true
  try {
    const pair = await userStore.joinPair(normalizedCode)
    selectedPairId.value = pair?.id || selectedPairId.value
    showToast('已加入这段关系')
    await router.push(RELATIONSHIP_LIST_ROUTE)
  } catch (e) {
    showToast(e.message || '刚刚没加入成功，稍后再试一次')
  } finally {
    joining.value = false
  }
}

async function copyCode() {
  const code = userStore.currentPair?.invite_code
  if (!code) return
  try {
    await navigator.clipboard.writeText(code)
    showToast('邀请码已复制')
  } catch {
    showToast('刚刚没复制上，可以手动复制')
  }
}

async function refreshStatus() {
  if (userStore.isDemoMode) {
    showToast('演示模式下不会自动更新加入状态')
    return
  }

  refreshing.value = true
  try {
    await userStore.fetchPairs()
    if (userStore.currentPair?.status === 'active') {
      showToast('对方已经加入了')
      return
    }
    showToast('对方还没有加入')
  } catch {
    showToast('刚刚没查到状态，稍后再试一次')
  } finally {
    refreshing.value = false
  }
}
</script>

<style scoped>
.pair-page {
  gap: 18px;
  padding-bottom: 36px;
}

.pair-page__head {
  width: 100%;
  padding-bottom: 0;
}

.pair-shortcuts {
  flex-wrap: wrap;
}

.pair-shortcuts__button.active {
  background: rgba(189, 75, 53, 0.12);
  border-color: rgba(189, 75, 53, 0.24);
  color: var(--warm-700);
}

.pair-overview {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 16px;
  align-items: stretch;
}

.pair-overview__sidebar {
  min-height: 100%;
}

.pair-context {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.pair-context__card {
  min-height: 100%;
  padding: 18px;
  border: 1px solid rgba(68, 52, 40, 0.08);
  border-radius: 24px;
  background: rgba(255, 250, 244, 0.68);
}

.pair-context__card span {
  color: var(--seal);
  font-size: 12px;
  font-weight: 800;
}

.pair-context__card strong {
  display: block;
  margin-top: 6px;
  font-family: var(--font-serif);
  font-size: 24px;
  line-height: 1.4;
}

.pair-context__card p {
  margin-top: 8px;
  color: var(--ink-soft);
  font-size: 14px;
  line-height: 1.75;
}

@media (max-width: 1080px) {
  .pair-overview {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 760px) {
  .pair-page {
    width: min(100% - 24px, 1200px);
  }

  .pair-context {
    grid-template-columns: 1fr;
  }

  .pair-context__card strong {
    font-size: 22px;
  }
}
</style>
