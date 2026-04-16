<template>
  <div class="profile-page page-shell page-shell--narrow page-stack">
    <div class="page-head">
      <p class="eyebrow">我的</p>
      <h2>个人中心</h2>
    </div>

  <div class="profile-shell">
      <div class="glass-card" style="text-align:center; padding: 24px 16px;">
        <div class="profile-avatar">{{ (userStore.me?.nickname || '用')[0] }}</div>
        <h3 style="font-size: 20px; color: var(--ink);">{{ userStore.me?.nickname || '亲健用户' }}</h3>
        <p class="profile-channels">{{ channels }}</p>
      </div>

      <div>
        <p class="eyebrow" style="margin-left: 12px; margin-bottom: 8px;">关系</p>
        <div class="ios-list-group">
          <div v-if="userStore.currentPair" class="ios-list-item" @click="$router.push('/pair')">
            <div class="ios-item-icon" style="background: linear-gradient(135deg, var(--warm-300), var(--seal));">
              <HeartHandshake :size="18" stroke-width="2.5" />
            </div>
            <div class="ios-item-content">
              <span>{{ pairLabel }}空间</span>
              <div class="ios-item-value">
                <span>{{ userStore.partnerName }}</span>
                <ChevronRight :size="16" />
              </div>
            </div>
          </div>
          <div v-else class="empty-state-art">
            <div class="art-icon">
              <Heart :size="28" stroke-width="2" />
            </div>
            <p>还没有绑定关系。<br/>可以先邀请对方一起记录，也可以先一个人体验。</p>
            <button class="btn btn-primary btn-sm" style="margin-top: 12px; border-radius: 20px; padding: 0 20px;" @click="$router.push('/pair')">
              <PlusCircle :size="16" /> 建立关系
            </button>
          </div>
        </div>
      </div>

      <div>
        <p class="eyebrow" style="margin-left: 12px; margin-bottom: 8px;">账号</p>
        <div class="ios-list-group">
          <div class="ios-list-item">
            <div class="ios-item-icon" style="background: var(--sand);">
              <User :size="18" stroke-width="2.5" />
            </div>
            <div class="ios-item-content">
              <span>昵称</span>
              <div class="ios-item-value">
                <span>{{ userStore.me?.nickname || '未设置' }}</span>
              </div>
            </div>
          </div>
          <div class="ios-list-item">
            <div class="ios-item-icon" style="background: var(--moss-soft); color: var(--moss-deep);">
              <Mail :size="18" stroke-width="2.5" />
            </div>
            <div class="ios-item-content">
              <span>邮箱</span>
              <div class="ios-item-value">
                <span>{{ visibleEmail }}</span>
              </div>
            </div>
          </div>
          <div class="ios-list-item">
            <div class="ios-item-icon" style="background: var(--moss-soft); color: var(--moss-deep);">
              <Smartphone :size="18" stroke-width="2.5" />
            </div>
            <div class="ios-item-content">
              <span>手机号</span>
              <div class="ios-item-value">
                <span>{{ maskPhone(userStore.me?.phone) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div class="ios-list-group">
          <div class="ios-list-item" @click="$router.push('/health-test')">
            <div class="ios-item-icon" style="background: var(--sage); color: var(--ink-reverse);">
              <Shield :size="18" stroke-width="2.5" />
            </div>
            <div class="ios-item-content">
              <span>隐私与安全</span>
              <div class="ios-item-value">
                <ChevronRight :size="16" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="ios-list-group" style="margin-top: 10px;">
        <div class="ios-list-item" style="justify-content: center; background: rgba(185, 61, 50, 0.05);" @click="handleLogout">
          <div class="ios-item-content" style="justify-content: center; gap: 8px;">
            <LogOut :size="18" style="color: var(--danger)" stroke-width="2.5" />
            <span style="color: var(--danger); font-weight: 600;">退出登录</span>
          </div>
        </div>
      </div>

      <!-- Subtle Delete Account Entry -->
      <div style="text-align: center; margin-top: 32px; padding-bottom: 40px;">
        <button type="button" class="subtle-delete-btn" @click="showDeleteModal = true">
          注销账号
        </button>
      </div>

    </div>

    <div v-if="showDeleteModal" class="account-delete-modal" role="dialog" aria-modal="true" @click.self="closeDeleteModal">
      <section class="account-delete-modal__paper">
        <p class="eyebrow">注销账号</p>
        <h3>确认发起账号注销请求</h3>
        <p>
          注销账号会进入删除流程，关系记录、简报、上传内容和账号资料都将被纳入删除处理。真实账号会先进入宽限期，预览模式只会模拟这个流程。
        </p>
        <label class="field">
          <span>输入“注销账号”确认</span>
          <input v-model="deleteConfirmText" class="input" type="text" placeholder="注销账号" />
        </label>
        <div class="hero-actions">
          <button class="btn btn-danger btn-sm" type="button" :disabled="!canDeleteAccount || deletingAccount" @click="requestDeleteAccount">
            {{ deletingAccount ? '处理中...' : '确认注销账号' }}
          </button>
          <button class="btn btn-ghost btn-sm" type="button" @click="closeDeleteModal">取消</button>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, inject, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { api } from '@/api'
import { HeartHandshake, User, Smartphone, Mail, Shield, LogOut, ChevronRight, Heart, PlusCircle, Trash2 } from 'lucide-vue-next'

const router = useRouter()
const userStore = useUserStore()
const showToast = inject('showToast')
const showDeleteModal = ref(false)
const deleteConfirmText = ref('')
const deletingAccount = ref(false)

const TYPE_LABELS = { couple: '情侣', spouse: '夫妻', friend: '朋友', bestfriend: '挚友', parent: '育儿夫妻' }

const channels = computed(() => {
  const list = []
  if (userStore.me?.email && !userStore.me.email.endsWith('@qinjian.local')) list.push('邮箱')
  if (userStore.me?.phone) list.push('手机号')
  return list.length ? list.join(' / ') : '亲健数字账号'
})
const visibleEmail = computed(() => {
  const email = String(userStore.me?.email || '')
  return email && !email.endsWith('@qinjian.local') ? email : '未绑定'
})

const pairLabel = computed(() => TYPE_LABELS[userStore.currentPair?.type] || '关系')
const canDeleteAccount = computed(() => deleteConfirmText.value.trim() === '注销账号')

function maskPhone(phone) {
  if (!phone) return '未绑定'
  return String(phone).replace(/^(\d{3})\d+(\d{4})$/, '$1****$2')
}

function handleLogout() {
  userStore.logout()
  showToast('已安全退出')
  router.push('/auth')
}

function closeDeleteModal() {
  showDeleteModal.value = false
  deleteConfirmText.value = ''
  deletingAccount.value = false
}

async function requestDeleteAccount() {
  if (!canDeleteAccount.value) return
  deletingAccount.value = true
  try {
    if (!userStore.isDemoMode) {
      await api.requestAccountDeletion()
    }
    userStore.logout()
    showToast('已发起账号注销请求')
    router.replace('/auth')
  } catch (e) {
    showToast(e.message || '注销请求提交失败')
    deletingAccount.value = false
  }
}
</script>

<style scoped>
.profile-shell {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-bottom: 30px;
}

.profile-avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--warm-400), var(--seal-deep));
  color: #fff;
  font-size: 26px;
  font-weight: 700;
  display: grid;
  place-items: center;
  margin: 0 auto 12px;
  box-shadow: 0 8px 24px rgba(134, 58, 43, 0.25);
  border: 2px solid rgba(255, 255, 255, 0.6);
}
.profile-channels {
  font-size: 13px;
  color: var(--ink-faint);
  margin-top: 6px;
  letter-spacing: 0.5px;
}

.subtle-delete-btn {
  background: none;
  border: none;
  color: var(--ink-faint);
  font-size: 13px;
  opacity: 0.6;
  cursor: pointer;
  padding: 8px 16px;
  transition: opacity 0.2s ease;
}

.subtle-delete-btn:hover {
  opacity: 1;
  text-decoration: underline;
}

.account-delete-modal {
  position: fixed;
  inset: 0;
  z-index: 240;
  display: grid;
  place-items: center;
  padding: 20px;
  background: rgba(37, 40, 33, 0.34);
}

.account-delete-modal__paper {
  width: min(460px, 100%);
  display: grid;
  gap: 14px;
  padding: 22px;
  border: 1px solid rgba(185, 61, 50, 0.24);
  border-radius: var(--radius-lg);
  background: var(--paper-soft);
  box-shadow: var(--shadow-lg);
}

.account-delete-modal__paper h3 {
  color: var(--danger);
  font-family: var(--font-serif);
  font-size: 22px;
}

.account-delete-modal__paper p {
  color: var(--ink-soft);
  font-size: 14px;
  line-height: 1.7;
}

@media (max-width: 640px) {
  .profile-page .page-head,
  .profile-shell {
    width: min(100% - 24px, 760px);
  }
}
</style>
