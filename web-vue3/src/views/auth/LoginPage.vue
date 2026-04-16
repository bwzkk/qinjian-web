<template>
  <div class="auth-page">
    <div class="ambient-blob ambient-blob--seal"></div>
    <div class="ambient-blob ambient-blob--moss"></div>
    <div class="ambient-blob ambient-blob--ochre"></div>

    <div class="auth-container page-shell">
      <div class="auth-intro">
        <div class="auth-hero-art">
          <img src="/qinjian-logo.jpg" alt="亲健 logo" class="auth-logo" />
        </div>

        <h1>亲健</h1>
        <p class="auth-tagline">先看见，再靠近</p>
        <p class="auth-lead">
          无论你是情侣、夫妻还是亲密好友，亲健帮你把关系里的故事记下来——看看卡在哪里，然后一起往前走。
        </p>

        <div class="auth-features">
          <div class="feature-item">
            <div class="feature-icon"><PenLine :size="18" /></div>
            <div>
              <strong>先留住刚发生的事</strong>
              <p>一句话、一段语音，把重要的片段记下来。</p>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon"><Activity :size="18" /></div>
            <div>
              <strong>再看清关系现在怎么样</strong>
              <p>不说空话，直接告诉你现在更需要注意什么。</p>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon"><FolderHeart :size="18" /></div>
            <div>
              <strong>最后给出更容易开口的下一步</strong>
              <p>适合情侣、伴侣、夫妻和亲密搭子，也可以先一个人慢慢整理。</p>
            </div>
          </div>
        </div>

        <div class="service-status glass-card" style="margin-top: 24px;">
          <span class="pill" :class="backendOk ? 'pill-success' : 'pill-warning'">
            {{ backendOk ? '服务正常' : '仅预览' }}
          </span>
          <p>{{ backendOk ? '一切就绪，欢迎回来。' : '可以先逛逛界面，不着急。' }}</p>
        </div>
      </div>

      <div class="auth-form-wrapper glass-card">
        <div class="auth-form-head">
          <p class="eyebrow">欢迎回来</p>
          <h2>{{ isRegister ? '创建账号' : '登录' }}</h2>
        </div>

        <div v-if="userStore.isDemoMode" class="service-status" style="margin-bottom: 16px;">
          <span class="pill pill-warning">当前是预览模式</span>
          <p>登录正式账号后会切换到真实数据，不再显示演示内容。</p>
        </div>

        <div class="segmented" style="margin-bottom: 12px;">
          <button :class="{ active: !isRegister }" @click="isRegister = false">登录</button>
          <button :class="{ active: isRegister }" @click="isRegister = true">注册</button>
        </div>

        <form @submit.prevent="handleSubmit" class="form-stack">
          <label v-if="isRegister" class="field">
            <span>昵称</span>
            <input v-model="form.nickname" class="input" type="text" placeholder="希望对方怎么称呼你" />
          </label>

          <label class="field">
            <span>邮箱或手机号</span>
            <input
              v-model="form.account"
              class="input"
              type="text"
              placeholder="请输入邮箱或手机号"
              autocomplete="username"
              required
            />
            <p class="field-hint">支持邮箱或中国大陆 11 位手机号作为账号</p>
          </label>

          <label class="field">
            <span>密码</span>
            <input
              v-model="form.password"
              class="input"
              type="password"
              placeholder="密码"
              minlength="6"
              :autocomplete="isRegister ? 'new-password' : 'current-password'"
              required
            />
          </label>

          <div v-if="!isRegister" class="auth-options">
            <label class="check-row">
              <input v-model="loginOptions.autoLogin" type="checkbox" />
              <span>自动登录</span>
            </label>
            <label class="check-row">
              <input v-model="loginOptions.rememberPassword" type="checkbox" />
              <span>记住密码</span>
            </label>
          </div>

          <div style="margin-top: 10px;">
            <button type="submit" class="btn btn-primary btn-block" style="border-radius: 999px; height: 46px; font-size: 16px;" :disabled="submitting">
              {{ submitting ? (isRegister ? '创建中...' : '登录中...') : (isRegister ? '创建账号' : '进入亲健') }}
            </button>
          </div>
          <button type="button" class="btn btn-ghost btn-block" style="border-radius: 999px; height: 46px;" @click="enterDemo">
            先看看界面
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, inject } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { api } from '@/api'
import { loadLoginPreferences } from '@/utils/auth'
import { PenLine, Activity, FolderHeart } from 'lucide-vue-next'

const router = useRouter()
const userStore = useUserStore()
const showToast = inject('showToast')
const savedLoginPreferences = loadLoginPreferences()
const ACCOUNT_PHONE_RE = /^1\d{10}$/
const ACCOUNT_EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const isRegister = ref(false)
const submitting = ref(false)
const backendOk = ref(true)
const loginOptions = reactive({
  autoLogin: savedLoginPreferences.autoLogin,
  rememberPassword: savedLoginPreferences.rememberPassword,
})

const form = reactive({
  account: savedLoginPreferences.account || '',
  password: savedLoginPreferences.password || '',
  nickname: '',
})

onMounted(async () => {
  try {
    await api.health()
    backendOk.value = true
  } catch {
    backendOk.value = false
  }
})

function isValidAccount(value) {
  const normalized = value.trim()
  return ACCOUNT_PHONE_RE.test(normalized) || ACCOUNT_EMAIL_RE.test(normalized.toLowerCase())
}

async function handleSubmit() {
  const account = form.account.trim()
  if (!isValidAccount(account)) { showToast('请输入正确的邮箱或手机号'); return }
  if (!form.password) { showToast('请填写密码'); return }
  if (form.password.length < 6) { showToast('密码至少需要 6 位'); return }
  if (isRegister.value && !form.nickname.trim()) { showToast('请填写昵称'); return }

  submitting.value = true
  try {
    if (isRegister.value) {
      await userStore.register(account, form.nickname.trim(), form.password)
      showToast('注册成功，欢迎来到亲健')
    } else {
      await userStore.login(account, form.password, loginOptions)
      showToast('登录成功，欢迎回来')
    }
    router.replace('/')
  } catch (e) {
    showToast(e.message || '操作失败，请稍后再试')
  } finally {
    submitting.value = false
  }
}

function enterDemo() {
  userStore.enterDemo()
  showToast('已进入预览模式')
  router.replace('/')
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
  background: var(--paper);
  overflow-y: auto;
}

.ambient-blob {
  position: fixed;
  border-radius: 50%;
  filter: blur(48px);
  opacity: 0.38;
  pointer-events: none;
  will-change: transform;
}
.ambient-blob--seal {
  width: 340px; height: 340px;
  top: -90px; left: -80px;
  background: var(--seal-soft);
}
.ambient-blob--moss {
  width: 280px; height: 280px;
  bottom: -60px; right: -60px;
  background: var(--moss-soft);
}
.ambient-blob--ochre {
  width: 200px; height: 200px;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  background: var(--amber-soft);
  opacity: 0.18;
}

.auth-container {
  position: relative;
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 32px;
  max-width: 860px;
  width: 100%;
  align-items: start;
}

.auth-intro {
  padding: 32px 8px;
}

.auth-hero-art {
  width: 74px;
  height: 74px;
  margin-bottom: 20px;
  padding: 7px;
  border: 1px solid rgba(189, 75, 53, 0.2);
  border-radius: var(--radius-lg);
  background: rgba(255, 253, 250, 0.82);
  box-shadow: 0 14px 30px rgba(189, 75, 53, 0.13);
}

.auth-logo {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: calc(var(--radius-lg) - 6px);
}

.auth-intro h1 {
  font-family: var(--font-serif);
  font-size: 42px;
  font-weight: 700;
  color: var(--seal-deep);
  line-height: 1.2;
  margin-bottom: 8px;
}

.auth-tagline {
  font-size: 18px;
  color: var(--ink-soft);
  margin-bottom: 16px;
  font-weight: 600;
}

.auth-lead {
  font-size: 15px;
  color: var(--ink-soft);
  line-height: 1.75;
  max-width: 420px;
  margin-bottom: 28px;
}

.auth-features {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 400px;
}

.feature-item {
  display: flex;
  gap: 14px;
  align-items: flex-start;
}

.feature-icon {
  width: 36px; height: 36px;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  border-radius: var(--radius-md);
  background: var(--seal-soft);
  color: var(--seal);
}

.feature-item strong {
  display: block;
  font-size: 14px;
  font-weight: 700;
  color: var(--ink);
  margin-bottom: 2px;
}

.feature-item p {
  font-size: 13px;
  color: var(--ink-soft);
  line-height: 1.55;
}

.service-status {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 14px 16px;
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  background: rgba(255, 253, 250, 0.72);
}

.service-status .pill {
  align-self: flex-start;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 800;
}
.pill-success {
  background: var(--moss-soft);
  color: var(--moss-deep);
}
.pill-warning {
  background: var(--amber-soft);
  color: var(--amber-deep);
}

.service-status p {
  font-size: 13px;
  color: var(--ink-soft);
}

.auth-form-wrapper {
  padding: 28px 24px;
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-lg);
  background: rgba(255, 253, 250, 0.92);
}

.auth-form-head {
  margin-bottom: 20px;
}

.auth-form-head .eyebrow {
  font-size: 11px;
  font-weight: 800;
  color: var(--ink-faint);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 4px;
}

.auth-form-head h2 {
  font-family: var(--font-serif);
  font-size: 24px;
  font-weight: 700;
  color: var(--ink);
}

.segmented {
  display: flex;
  background: var(--paper);
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-md);
  padding: 3px;
  gap: 3px;
}

.segmented button {
  flex: 1;
  padding: 8px;
  border: none;
  border-radius: calc(var(--radius-md) - 2px);
  background: transparent;
  font-size: 13px;
  font-weight: 600;
  color: var(--ink-soft);
  cursor: pointer;
  transition: all 0.15s ease;
}

.segmented button.active {
  background: var(--paper-soft);
  color: var(--ink);
  box-shadow: var(--shadow-xs);
}

.form-stack {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.field span {
  font-size: 12px;
  font-weight: 700;
  color: var(--ink-soft);
}

.input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-md);
  background: var(--paper);
  font-size: 14px;
  color: var(--ink);
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.input:focus {
  outline: none;
  border-color: var(--seal);
  box-shadow: 0 0 0 3px rgba(189, 75, 53, 0.1);
}

.input::placeholder {
  color: var(--ink-faint);
}

.field-hint {
  font-size: 11px;
  color: var(--ink-faint);
  margin-top: 2px;
  opacity: 0.8;
}

.auth-options {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.check-row {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--ink-soft);
  font-size: 13px;
  font-weight: 600;
}

.check-row input {
  accent-color: var(--seal);
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 18px;
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
  text-decoration: none;
}

.btn-primary {
  background: var(--seal);
  color: #fff;
}
.btn-primary:hover:not(:disabled) {
  background: var(--seal-deep);
  transform: translateY(-1px);
}
.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: var(--paper-soft);
  color: var(--ink);
  border-color: var(--border-strong);
}
.btn-secondary:hover:not(:disabled) {
  border-color: var(--seal);
  color: var(--seal);
}

.btn-ghost {
  background: transparent;
  color: var(--ink-soft);
}
.btn-ghost:hover {
  color: var(--ink);
  background: var(--paper);
}

.btn-block {
  width: 100%;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 12px;
}

@media (max-width: 700px) {
  .auth-container {
    grid-template-columns: 1fr;
    gap: 24px;
  }
  .auth-intro {
    padding: 16px 4px;
  }
  .auth-intro h1 {
    font-size: 32px;
  }
  .auth-hero-art {
    width: 64px;
    height: 64px;
  }
}
</style>
