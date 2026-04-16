<template>
  <div class="pair-page page-shell page-shell--narrow page-stack">
    <div class="page-head">
      <p class="eyebrow">关系</p>
      <h2>建立关系，或者先单人体验</h2>
      <p>首次登录建议先建立关系；如果你想先看看产品主链路，也可以先跳过，用单人模式体验记录和 AI 陪伴。</p>
      <div class="hero-actions">
        <button class="btn btn-ghost" @click="$router.push('/')">先单人体验</button>
      </div>
    </div>

  <div class="pair-shell">
      <div class="card" style="margin-bottom: 12px;">
        <div class="card-header">
          <div>
            <p class="eyebrow">现有关系</p>
            <h3>多关系管理</h3>
          </div>
        </div>
        <div v-if="userStore.pairs.length" class="stack-list">
          <div v-for="pair in userStore.pairs" :key="pair.id" class="stack-item" @click="userStore.switchPair(pair.id); $router.push('/')">
            <div class="stack-item__icon" :style="{ background: pair.status === 'active' ? 'var(--warm-100)' : 'var(--cream-deep)', color: pair.status === 'active' ? 'var(--warm-600)' : 'var(--ink-faint)' }">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m12 20.7-7.1-7A4.8 4.8 0 0 1 11.7 7L12 7.3l.3-.3a4.8 4.8 0 0 1 6.8 6.8z" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </div>
            <div class="stack-item__content">
              <strong>{{ TYPE_LABELS[pair.type] || pair.type }} · {{ getPartnerName(pair) }}</strong>
              <div class="stack-item__meta">{{ pair.status === 'active' ? '已绑定' : '待确认' }}</div>
            </div>
            <span class="stack-item__aside">›</span>
          </div>
        </div>
        <div v-else class="empty-state">这里会列出你创建或加入的全部关系。一个账号可以同时管理多段关系，并随时切换当前查看对象。</div>
      </div>

      <div class="card" style="margin-bottom: 12px;">
        <div class="card-header">
          <div>
            <p class="eyebrow">新建关系</p>
            <h3>选择关系类型</h3>
          </div>
        </div>
        <div class="option-grid option-grid--two" style="margin-bottom: 16px;">
          <button v-for="(label, type) in TYPE_LABELS" :key="type" class="select-card"
            :class="{ active: selectedType === type }" @click="selectedType = type" type="button">
            {{ label }}
          </button>
        </div>
        <button class="btn btn-primary btn-block" :disabled="creating" @click="handleCreate">
          {{ creating ? '创建中...' : '创建邀请码' }}
        </button>
      </div>

      <div class="card">
        <div class="card-header">
          <div>
            <p class="eyebrow">加入关系</p>
            <h3>输入邀请码</h3>
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
              placeholder="例如 A3H7K8M9Q2"
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
import { ref, inject } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()
const showToast = inject('showToast')

const TYPE_LABELS = { couple: '情侣', spouse: '夫妻', bestfriend: '挚友', parent: '育儿夫妻' }
const INVITE_CODE_LENGTH = 10
const INVITE_CODE_PATTERN = /^[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{10}$/
const selectedType = ref('couple')
const joinCode = ref('')
const creating = ref(false)
const joining = ref(false)

function getPartnerName(pair) {
  return pair.custom_partner_nickname || pair.partner_nickname || pair.partner_email || pair.partner_phone || '对方'
}

function normalizeInviteCode(value) {
  return String(value || '').toUpperCase().replace(/[^0-9A-Z]/g, '').slice(0, INVITE_CODE_LENGTH)
}

function handleInviteCodeInput(event) {
  joinCode.value = normalizeInviteCode(event.target.value)
}

async function handleCreate() {
  creating.value = true
  try {
    const pair = await userStore.createPair(selectedType.value)
    showToast('邀请码已生成，发给对方即可')
    router.push('/pair-waiting')
  } catch (e) {
    showToast(e.message || '创建失败，请稍后再试')
  } finally {
    creating.value = false
  }
}

async function handleJoin() {
  const normalizedCode = normalizeInviteCode(joinCode.value)
  joinCode.value = normalizedCode
  if (normalizedCode.length !== INVITE_CODE_LENGTH) { showToast('请输入 10 位邀请码'); return }
  if (!INVITE_CODE_PATTERN.test(normalizedCode)) { showToast('邀请码格式不对，请核对后再试'); return }
  joining.value = true
  try {
    await userStore.joinPair(normalizedCode)
    showToast('已加入关系')
    router.push('/')
  } catch (e) {
    showToast(e.message || '加入失败，请稍后再试')
  } finally {
    joining.value = false
  }
}
</script>

<style scoped>
.pair-shell {
  display: grid;
  gap: 14px;
  padding-bottom: 30px;
}

@media (max-width: 640px) {
  .pair-page .page-head,
  .pair-shell {
    width: min(100% - 24px, 760px);
  }
}
</style>
