<template>
  <div class="pair-page page-shell page-shell--narrow page-stack">
    <div class="page-head">
      <p class="eyebrow">关系</p>
      <h2>{{ pageHead.title }}</h2>
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
          :class="{ active: route.hash === '#pair-invite' }"
          type="button"
          @click="goToCurrentInvite"
        >
          当前邀请
        </button>
      </div>
    </div>

    <div class="pair-shell">
      <div v-if="false" aria-hidden="true">
        <RelationshipConstellation
          :center="placeholderCenter"
          :nodes="placeholderNodes"
          :selected-pair-id="placeholderSelectedPairId"
          @select="noop"
        />
        <RelationshipSidebarPanel
          :summary="placeholderSummary"
          @open-detail="noop"
        />
        <RelationshipManagementPanel />
      </div>

      <div id="pair-list" class="card">
        <div class="card-header">
          <div>
            <p class="eyebrow">已有关系</p>
            <h3>切换当前关系</h3>
          </div>
        </div>
        <div v-if="userStore.pairs.length" class="stack-list">
          <div
            v-for="pair in userStore.pairs"
            :key="pair.id"
            class="stack-item"
            :class="{ 'stack-item--active': pair.id === userStore.currentPair?.id }"
            @click="handleSelectPair(pair)"
          >
            <div class="stack-item__icon" :style="{ background: pair.status === 'active' ? 'var(--warm-100)' : 'var(--cream-deep)', color: pair.status === 'active' ? 'var(--warm-600)' : 'var(--ink-faint)' }">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m12 20.7-7.1-7A4.8 4.8 0 0 1 11.7 7L12 7.3l.3-.3a4.8 4.8 0 0 1 6.8 6.8z" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </div>
            <div class="stack-item__content">
              <strong>{{ relationshipTypeLabel(pair.type) }} · {{ getPartnerName(pair) }}</strong>
              <div class="stack-item__meta">{{ pair.id === userStore.currentPair?.id ? '当前关系 · ' : '' }}{{ pairStatusLabel(pair.status) }}</div>
            </div>
            <span class="stack-item__aside">{{ pair.id === userStore.currentPair?.id ? '当前' : '切换' }}</span>
          </div>
        </div>
        <div v-else class="empty-state">创建或加入的关系会显示在这里。</div>
      </div>

      <div v-if="currentPairPending" id="pair-invite" class="card card-accent pair-invite-card">
        <div class="card-header">
          <div>
            <p class="eyebrow">当前邀请</p>
            <h3>把邀请码发给对方</h3>
          </div>
        </div>
        <div class="invite-code">{{ userStore.currentPair?.invite_code || '----------' }}</div>
        <div class="hero-actions">
          <button class="btn btn-secondary" type="button" @click="copyCode">复制邀请码</button>
          <button class="btn btn-ghost" type="button" :disabled="refreshing" @click="refreshStatus">
            {{ refreshing ? '查看中...' : '查看加入状态' }}
          </button>
        </div>
      </div>

      <div id="pair-create" class="card">
        <div class="card-header">
          <div>
            <p class="eyebrow">发起邀请</p>
            <h3>选关系类型</h3>
          </div>
        </div>
        <div class="option-grid option-grid--two pair-section-actions">
          <button
            v-for="(label, type) in CREATABLE_RELATIONSHIP_TYPE_LABELS"
            :key="type"
            class="select-card"
            :class="{ active: selectedType === type }"
            type="button"
            @click="selectedType = type"
          >
            {{ label }}
          </button>
        </div>
        <button class="btn btn-primary btn-block" :disabled="creating" @click="handleCreate">
          {{ creating ? '生成中...' : '生成邀请码' }}
        </button>
      </div>

      <div id="pair-join" class="card">
        <div class="card-header">
          <div>
            <p class="eyebrow">输入邀请码</p>
            <h3>输入邀请码加入</h3>
          </div>
        </div>
        <div class="form-stack">
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
              @input="handleInviteCodeInput"
            />
          </label>
          <button class="btn btn-secondary btn-block" :disabled="joining" @click="handleJoin">
            {{ joining ? '加入中...' : '加入关系' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, inject, nextTick, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import RelationshipConstellation from '@/components/relationship/RelationshipConstellation.vue'
import RelationshipSidebarPanel from '@/components/relationship/RelationshipSidebarPanel.vue'
import RelationshipManagementPanel from '@/components/relationship/RelationshipManagementPanel.vue'
import { useUserStore } from '@/stores/user'
import { CREATABLE_RELATIONSHIP_TYPE_LABELS, pairStatusLabel, relationshipTypeLabel } from '@/utils/displayText'
import {
  getRelationshipRouteSection,
  RELATIONSHIP_INVITE_ROUTE,
  RELATIONSHIP_JOIN_ROUTE,
  RELATIONSHIP_LIST_ROUTE,
  RELATIONSHIP_MANAGEMENT_ROUTE,
} from '@/utils/relationshipRouting'

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
const placeholderCenter = { label: '我' }
const placeholderNodes = []
const placeholderSelectedPairId = ''
const placeholderSummary = null
const currentPairPending = computed(() => userStore.currentPair?.status === 'pending')
const pairPageMeta = {
  pair: {
    title: '关系管理',
  },
  'pair-list': {
    title: '查看关系',
  },
  'pair-invite': {
    title: '发起邀请',
  },
  'pair-join': {
    title: '输入邀请码',
  },
}

const pageHead = computed(() => pairPageMeta[String(route.name || 'pair')] || pairPageMeta.pair)
const sectionShortcuts = computed(() => [
  {
    label: '查看关系',
    to: RELATIONSHIP_LIST_ROUTE,
    sectionId: 'pair-list',
    isActive: route.path === RELATIONSHIP_LIST_ROUTE,
  },
  {
    label: '发起邀请',
    to: RELATIONSHIP_INVITE_ROUTE,
    sectionId: 'pair-create',
    isActive: route.path === RELATIONSHIP_INVITE_ROUTE,
  },
  {
    label: '输入邀请码',
    to: RELATIONSHIP_JOIN_ROUTE,
    sectionId: 'pair-join',
    isActive: route.path === RELATIONSHIP_JOIN_ROUTE,
  },
])

function noop() {}

function getPartnerName(pair) {
  return pair.custom_partner_nickname || pair.partner_nickname || pair.partner_email || pair.partner_phone || '对方'
}

function normalizeInviteCode(value) {
  return String(value || '').toUpperCase().replace(/[^0-9A-Z]/g, '').slice(0, INVITE_CODE_LENGTH)
}

function handleInviteCodeInput(event) {
  joinCode.value = normalizeInviteCode(event.target.value)
}

function scrollToSection(sectionId, behavior = 'smooth') {
  if (typeof document === 'undefined') return
  document.getElementById(sectionId)?.scrollIntoView({ behavior, block: 'start' })
}

function goToShortcut(shortcut) {
  if (!shortcut?.to) return
  if (route.path === shortcut.to) {
    scrollToSection(shortcut.sectionId)
    return
  }
  router.push(shortcut.to)
}

function goToCurrentInvite() {
  const inviteRoute = `${RELATIONSHIP_MANAGEMENT_ROUTE}#pair-invite`
  if (route.path === RELATIONSHIP_MANAGEMENT_ROUTE && route.hash === '#pair-invite') {
    scrollToSection('pair-invite')
    return
  }
  router.push(inviteRoute)
}

function syncRouteSection(path, hash) {
  const sectionId = getRelationshipRouteSection(path, hash)
  if (!sectionId) return
  nextTick(() => {
    let attempts = 0
    const tryScroll = () => {
      const target = document.getElementById(sectionId)
      if (!target) {
        if (attempts < 8) {
          attempts += 1
          window.setTimeout(tryScroll, 120)
        }
        return
      }
      target.scrollIntoView({ behavior: 'auto', block: 'start' })
      const top = target.getBoundingClientRect().top
      if (top > 160 && attempts < 8) {
        attempts += 1
        window.setTimeout(tryScroll, 120)
      }
    }
    window.setTimeout(tryScroll, 80)
  })
}

async function handleSelectPair(pair) {
  if (!pair?.id) return
  await userStore.switchPair(pair.id)
  showToast(`已切换到 ${relationshipTypeLabel(pair.type)} · ${getPartnerName(pair)}`)
}

async function handleCreate() {
  creating.value = true
  try {
    await userStore.createPair(selectedType.value)
    showToast('邀请码已生成，在上面可以直接复制')
    await router.push(`${RELATIONSHIP_MANAGEMENT_ROUTE}#pair-invite`)
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
    await userStore.joinPair(normalizedCode)
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

watch(() => [route.path, route.hash], ([path, hash]) => {
  syncRouteSection(path, hash)
})

onMounted(() => {
  syncRouteSection(route.path, route.hash)
})
</script>

<style scoped>
.pair-shell {
  display: grid;
  gap: 14px;
  padding-bottom: 30px;
}

.pair-shortcuts {
  flex-wrap: wrap;
}

.pair-shortcuts__button.active {
  background: rgba(189, 75, 53, 0.12);
  border-color: rgba(189, 75, 53, 0.24);
  color: var(--warm-700);
}

.pair-section-actions {
  margin-bottom: 16px;
}

.invite-code {
  font-size: 32px;
  font-weight: 700;
  font-family: var(--font-serif);
  letter-spacing: 0;
  color: var(--warm-600);
  padding: 18px;
  background: var(--warm-50);
  border-radius: var(--radius-lg);
  border: 2px dashed var(--warm-300);
}

.stack-item--active {
  border-color: rgba(189, 75, 53, 0.24);
  background: rgba(255, 248, 243, 0.78);
}

@media (max-width: 640px) {
  .pair-page .page-head,
  .pair-shell {
    width: min(100% - 24px, 760px);
  }

  .invite-code {
    font-size: 26px;
  }
}
</style>
