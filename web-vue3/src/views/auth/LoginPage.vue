<template>
  <div class="auth-page">
    <div class="ambient-blob ambient-blob--seal"></div>
    <div class="ambient-blob ambient-blob--moss"></div>
    <div class="ambient-blob ambient-blob--ochre"></div>

    <div class="auth-container">
      <div class="auth-intro">
        <div class="auth-hero-art">
          <div class="art-circle art-circle-1"><HeartHandshake :size="48" stroke-width="1.5" /></div>
          <div class="art-circle art-circle-2"><Sparkles :size="32" stroke-width="1.5" /></div>
          <div class="art-pill">
            <span class="pill-dot"></span> 泛亲密关系智能感知
          </div>
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

        <div class="segmented" style="margin-bottom: 12px;">
          <button :class="{ active: !isRegister }" @click="isRegister = false">登录</button>
          <button :class="{ active: isRegister }" @click="isRegister = true">注册</button>
        </div>

        <div class="segmented" style="margin-bottom: 24px;">
          <button :class="{ active: authMethod === 'email' }" @click="authMethod = 'email'">邮箱</button>
          <button :class="{ active: authMethod === 'phone' }" @click="authMethod = 'phone'">手机号</button>
        </div>

        <form @submit.prevent="handleSubmit" class="form-stack">
          <label v-if="isRegister && authMethod === 'email'" class="field">
            <span>昵称</span>
            <input v-model="form.nickname" class="input" type="text" placeholder="希望对方怎么称呼你" />
          </label>

          <label v-if="authMethod === 'email'" class="field">
            <span>邮箱</span>
            <input v-model="form.email" class="input" type="email" placeholder="你的邮箱" required />
          </label>

          <label v-if="authMethod === 'email'" class="field">
            <span>密码</span>
            <input v-model="form.password" class="input" type="password" placeholder="密码" :minlength="isRegister ? 8 : 6" required />
          </label>

          <template v-if="authMethod === 'phone'">
            <label class="field">
              <span>手机号</span>
              <input v-model="form.phone" class="input" type="tel" inputmode="numeric" maxlength="11" placeholder="手机号" />
            </label>
            <div class="field">
              <span>验证码</span>
              <div class="code-row">
                <input v-model="form.phoneCode" class="input" type="text" inputmode="numeric" maxlength="6" placeholder="6 位验证码" />
                <button type="button" class="btn btn-secondary btn-sm" :disabled="cooldown > 0" @click="sendCode">
                  {{ cooldown > 0 ? `${cooldown}s` : '获取验证码' }}
                </button>
              </div>
            </div>
          </template>

          <div style="margin-top: 10px;">
            <button type="submit" class="btn btn-primary btn-block" style="border-radius: 999px; height: 46px; font-size: 16px;" :disabled="submitting">
              {{ submitting ? '处理中...' : (isRegister ? '创建账号' : '进入亲健') }}
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
import { HeartHandshake, Sparkles, PenLine, Activity, FolderHeart } from 'lucide-vue-next'

const router = useRouter()
const userStore = useUserStore()
const showToast = inject('showToast')

const isRegister = ref(false)
const authMethod = ref('email')
const submitting = ref(false)
const cooldown = ref(0)

const form = reactive({
  email: '',
  password: '',
  nickname: '',
  phone: '',
  phoneCode: '',
})

const backendOk = ref(true)

onMounted(async () => {
  try {
    await api.health()
    backendOk.value = true
  } catch {
    backendOk.value = false
  }
})

async function handleSubmit() {
  if (!form.email || !form.password) { showToast('请填写邮箱和密码'); return }
  if (isRegister.value && !form.nickname) { showToast('请填写昵称'); return }
  try {
    if (authMethod.value === 'phone') {
      if (!/^1\d{10}$/.test(form.phone)) { showToast('请输入正确的手机号'); return }
      if (!/^\d{6}$/.test(form.phoneCode)) { showToast('请输入 6 位验证码'); return }
      await userStore.phoneLogin(form.phone, form.phoneCode)
    } else {
      if (isRegister.value) await userStore.register(form.email, form.nickname, form.password)
      else await userStore.login(form.email, form.password)
    }
    showToast('登录成功，欢迎回来')
    router.push('/')
  } catch (e) {
    showToast(e.message || '操作失败，请稍后再试')
  } finally {
    submitting.value = false
  }
}

async function sendCode() {
  if (!/^1\d{10}$/.test(form.phone)) { showToast('请输入正确的手机号'); return }
  try {
    const res = await api.sendPhoneCode(form.phone)
    showToast(res.debug_code ? `验证码已发送：${res.debug_code}` : '验证码已发送，请查收')
    cooldown.value = 60
    const timer = setInterval(() => {
      cooldown.value--
      if (cooldown.value <= 0) clearInterval(timer)
    }, 1000)
  } catch (e) {
    showToast(e.message || '发送失败，请稍后再试')
  }
}

function enterDemo() {
  userStore.enterDemo()
  showToast('已进入预览模式')
  router.push('/')
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
  filter: blur(72px);
  opacity: 0.38;
  pointer-events: none;
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
  position: relative;
  width: 90px;
  height: 90px;
  margin-bottom: 24px;
}

.art-circle {
  position: absolute;
  border-radius: 50%;
  display: grid;
  place-items: center;
}
.art-circle-1 {
  width: 72px; height: 72px;
  top: 0; left: 0;
  background: var(--seal-soft);
  color: var(--seal);
}
.art-circle-2 {
  width: 48px; height: 48px;
  bottom: 0; right: 0;
  background: var(--moss-soft);
  color: var(--moss);
}

.art-pill {
  position: absolute;
  top: 80px; left: 72px;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border-radius: 999px;
  background: rgba(255, 253, 250, 0.82);
  border: 1px solid var(--border-strong);
  backdrop-filter: blur(8px);
  font-size: 12px;
  font-weight: 700;
  color: var(--ink-soft);
}
.pill-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: var(--seal);
  animation: pulse 2s ease-in-out infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(0.85); }
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

.code-row {
  display: flex;
  gap: 8px;
}

.code-row .input {
  flex: 1;
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
    width: 72px;
    height: 72px;
  }
  .art-circle-1 { width: 56px; height: 56px; }
  .art-circle-2 { width: 38px; height: 38px; }
  .art-pill { top: 64px; left: 56px; }
}
</style>
