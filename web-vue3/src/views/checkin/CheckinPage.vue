<template>
  <div class="checkin-page">
    <div class="page-head checkin-head">
      <p class="eyebrow">关系记录</p>
      <h2>把今天想说的一句话先留住</h2>
      <p>一句话、一段语音，都可以记进今天的关系笔记里。</p>
    </div>

    <div class="segmented checkin-mode">
      <button type="button" :class="{ active: mode === 'form' }" @click="switchMode('form')">手写记录</button>
      <button type="button" :class="{ active: mode === 'voice' }" @click="switchMode('voice')">陪伴整理</button>
    </div>

    <form v-if="mode === 'form'" class="checkin-workbench" @submit.prevent="handleSubmit">
      <section class="record-editor">
        <div class="record-editor__head">
          <div>
            <p class="eyebrow">今日记录</p>
            <h3>想说点什么？</h3>
          </div>
          <span class="record-index">01</span>
        </div>

        <label class="field">
          <span>今天发生了什么？</span>
          <textarea
            v-model="form.content"
            class="input input-textarea record-textarea"
            placeholder="例如：她说“你根本没懂我为什么会难受”，我第一反应是想解释。"
          ></textarea>
        </label>

        <section class="emotion-paper" :class="`emotion-paper--${emotionTone}`" aria-live="polite">
          <div class="emotion-paper__main">
            <span>情绪感受</span>
            <strong>{{ emotionTitle }}</strong>
            <small>{{ emotionConfidence }}</small>
          </div>
          <p>{{ precheckGuidance }}</p>
          <div class="emotion-paper__tags">
            <span v-for="tag in detectedMoodTags" :key="tag" class="seal-tag">{{ tag }}</span>
            <span v-if="!detectedMoodTags.length" class="seal-tag seal-tag--muted">等你写下</span>
            <button v-if="detectedMoodTags.length" type="button" class="text-button" @click="applyDetectedMoods">套用这些标签</button>
          </div>
        </section>

        <div class="field mood-field">
          <span>此刻心情</span>
          <div class="tag-cloud mood-tags">
            <button
              v-for="mood in moods"
              :key="mood"
              class="tag"
              :class="{ active: form.moods.includes(mood) }"
              type="button"
              @click="toggleMood(mood)"
            >
              {{ mood }}
            </button>
          </div>
        </div>

        <button type="submit" class="btn btn-primary btn-block" :disabled="submitting || uploading">
          {{ submitting ? '提交中...' : '提交' }}
        </button>
      </section>

      <aside class="record-aside">
        <details class="context-panel" open>
          <summary>补充上下文</summary>
          <div class="form-stack">
            <div class="field">
              <span style="display:flex;align-items:center;gap:6px;"><Smile :size="16" />今天整体感受</span>
              <div class="option-grid" style="grid-template-columns: repeat(5, 1fr);">
                <button v-for="n in 10" :key="n" class="select-card" type="button" :class="{ active: form.moodScore === n }" @click="form.moodScore = n" style="padding: 8px;">
                  {{ n }}
                </button>
              </div>
            </div>
            <label class="field" style="margin-top: 12px;">
              <span style="display:flex;align-items:center;gap:6px;"><Activity :size="16" />互动频率</span>
              <input v-model="form.interactionFreq" class="input" type="number" min="0" max="10" />
            </label>
            <div class="field" style="margin-top: 4px;">
              <span style="display:flex;align-items:center;gap:6px;"><UserCheck :size="16" />谁先开口</span>
              <div class="option-grid option-grid--three">
                <button class="select-card" :class="{ active: form.initiative === 'me' }" type="button" @click="form.initiative = 'me'">我</button>
                <button class="select-card" :class="{ active: form.initiative === 'partner' }" type="button" @click="form.initiative = 'partner'">对方</button>
                <button class="select-card" :class="{ active: form.initiative === 'equal' }" type="button" @click="form.initiative = 'equal'">差不多</button>
              </div>
            </div>
            <div class="field">
              <span>有没有深聊</span>
              <div class="option-grid option-grid--two">
                <button class="select-card" :class="{ active: form.deepConversation === true }" type="button" @click="form.deepConversation = true">有</button>
                <button class="select-card" :class="{ active: form.deepConversation === false }" type="button" @click="form.deepConversation = false">没有</button>
              </div>
            </div>
            <div class="field">
              <span>之前的约定</span>
              <div class="option-grid option-grid--two">
                <button class="select-card" :class="{ active: form.taskCompleted === true }" type="button" @click="form.taskCompleted = true">做到了</button>
                <button class="select-card" :class="{ active: form.taskCompleted === false }" type="button" @click="form.taskCompleted = false">还没</button>
              </div>
            </div>
          </div>
        </details>
      </aside>

      <div class="record-support-grid">
        <section class="attachment-panel">
          <div>
            <p class="eyebrow">补充材料</p>
            <h3>图片或语音</h3>
          </div>
          <div class="upload-row">
            <button class="btn btn-ghost btn-sm" type="button" @click="imageInput?.click()">添加图片</button>
            <button class="btn btn-ghost btn-sm" type="button" @click="voiceInput?.click()">添加语音</button>
          </div>
          <input ref="imageInput" type="file" accept="image/*" class="hidden" @change="handleImageUpload" />
          <input ref="voiceInput" type="file" accept="audio/*" class="hidden" @change="handleVoiceUpload" />
          <div v-if="imagePreview" class="upload-preview">
            <img :src="imagePreview" alt="已上传图片" />
          </div>
          <div v-if="voiceMeta" class="voice-preview">
            <strong>语音已读取</strong>
            <span>时长 {{ voiceMeta.duration_seconds || '--' }}s · 静音比 {{ voiceMeta.silence_ratio ?? '--' }}</span>
          </div>
        </section>

        <section class="client-ai-panel">
          <div class="client-ai-panel__head">
            <div>
              <p class="eyebrow">本地先替你看一眼</p>
              <h3>{{ clientAiTitle }}</h3>
            </div>
            <span class="status-chip" :class="clientAiStatusClass">{{ clientAiStatus }}</span>
          </div>
          <p>{{ precheckGuidance }}</p>
          <div class="evidence-strip">
            <span v-for="pill in evidencePills" :key="pill" class="evidence-pill">{{ pill }}</span>
          </div>
          <article class="precheck-note">
            <span>情绪识别</span>
            <strong>{{ precheck?.emotion?.moodLabel || '等你写下' }}</strong>
            <p>{{ precheck?.emotion?.reason || '写完后会自动识别，所有分析只在本地进行。' }}</p>
          </article>
        </section>
      </div>
    </form>

    <section v-else class="voice-draft">
      <div class="voice-draft__head">
        <div>
          <p class="eyebrow">对话整理</p>
          <h3>说出来，AI 帮你整理成记录</h3>
        </div>
        <span :class="{ 'voice-live': asrActive }">AI</span>
      </div>

      <div class="voice-toolbar" aria-live="polite">
        <div>
          <strong>{{ asrActive ? '正在听你说' : asrFinalizing ? '正在整理最后一句' : '可以开始说话了' }}</strong>
          <p>{{ voiceStatus || '可以直接打字，也可以点按钮用麦克风把话实时转成文字。' }}</p>
        </div>
        <button class="btn btn-ghost btn-sm" type="button" :disabled="asrFinalizing" @click="toggleVoiceInput">
          {{ asrActive ? '停止说话' : asrFinalizing ? '整理中...' : '开始说话' }}
        </button>
      </div>

      <div v-if="!messages.length" class="empty-state">从一句“今天其实有点累”开始就行。</div>
      <div v-else class="chat-list">
        <div v-for="(msg, i) in messages" :key="i" class="chat-msg" :class="{ 'chat-msg--user': msg.role === 'user' }">
          <div class="chat-msg__avatar">{{ msg.role === 'user' ? '我' : 'AI' }}</div>
          <div class="chat-msg__bubble">{{ msg.content }}</div>
        </div>
      </div>

      <div class="form-stack voice-input">
        <label class="field">
          <span>想说点什么？</span>
          <textarea ref="chatInputEl" v-model="chatInput" class="input input-textarea" placeholder="例如：今天其实有点累，但晚饭时我们把误会说开了。"></textarea>
        </label>
        <div class="voice-emotion-line">
          <span>情绪感受</span>
          <strong>{{ voiceEmotionText }}</strong>
        </div>
        <div class="hero-actions">
          <button class="btn btn-primary" type="button" :disabled="agentSending || asrFinalizing" @click="sendChat">
            {{ agentSending ? '发送中...' : '发给 AI 陪伴' }}
          </button>
          <button class="btn btn-ghost" type="button" @click="replayAgentReply">朗读上一条</button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { Mic, CheckCircle2, ChevronRight, X, Loader2, Send, StopCircle, CornerDownLeft, Info, HelpCircle, Image as ImageIcon, Wand2, ArrowUpRight, Smile, UserCheck, Activity } from 'lucide-vue-next'
import { computed, inject, nextTick, onBeforeUnmount, reactive, ref, watch } from 'vue'
import { useUserStore } from '@/stores/user'
import { useCheckinStore } from '@/stores/checkin'
import { api } from '@/api'
import { analyzeEmotion, buildClientGuidance, inspectVoiceFile, precheckText } from '@/utils/clientAi'
import { createBackendRealtimeAsr, startBrowserSpeech } from '@/utils/realtimeVoice'

const userStore = useUserStore()
const checkinStore = useCheckinStore()
const showToast = inject('showToast')

const mode = ref('form')
const submitting = ref(false)
const uploading = ref(false)
const agentSending = ref(false)
const moods = ['开心', '平静', '感动', '期待', '焦虑', '委屈', '生气', '疲惫']

const imageInput = ref(null)
const voiceInput = ref(null)
const chatInputEl = ref(null)
const imageFile = ref(null)
const imagePreview = ref('')
const imageMeta = ref(null)
const voiceFile = ref(null)
const voiceMeta = ref(null)
const precheck = ref(null)
const messages = ref([])
const chatInput = ref('')
const agentSessionId = ref('')
const lastAgentReply = ref('')
const asrActive = ref(false)
const asrFinalizing = ref(false)
const voiceStatus = ref('')
const voiceController = ref(null)

const form = reactive({
  content: '',
  moods: [],
  moodScore: null,
  interactionFreq: '',
  initiative: '',
  deepConversation: null,
  taskCompleted: null,
})

let precheckTimer = null
let voiceFallbackTried = false

const detectedMoodTags = computed(() => precheck.value?.emotion?.moodTags || [])
const emotionTone = computed(() => precheck.value?.emotion?.sentiment || 'neutral')
const emotionTitle = computed(() => {
  const emotion = precheck.value?.emotion
  if (!emotion || !form.content.trim()) return '等你写下'
  return `${emotion.moodLabel} · ${emotion.sentimentLabel}`
})
const emotionConfidence = computed(() => {
  const value = precheck.value?.emotion?.confidence
  return value ? `${Math.round(value * 100)}%` : '0%'
})
const precheckGuidance = computed(() => buildClientGuidance(precheck.value))
const clientAiTitle = computed(() => {
  if (!precheck.value) return '先替你看一眼'
  if (precheck.value.intent === 'crisis') return '需要保护'
  if (precheck.value.intent === 'emergency') return '冲突缓和'
  if (precheck.value.intent === 'reflection') return '复盘建议'
  return '日常'
})
const clientAiStatus = computed(() => {
  if (!precheck.value) return '等你写下'
  if (precheck.value.risk_level === 'high') return '需要保护'
  if (precheck.value.risk_level === 'watch') return '留意'
  return '已就绪'
})
const clientAiStatusClass = computed(() => ({
  'status-chip--danger': precheck.value?.risk_level === 'high',
  'status-chip--warning': precheck.value?.risk_level === 'watch',
}))
const evidencePills = computed(() => {
  if (!precheck.value) return ['隐私：云端', 'AI 陪伴：开启', '来源：你写的']
  const pills = [
    `风险：${precheck.value.risk_level}`,
    `路径：${precheck.value.intent}`,
    `上传：${precheck.value.upload_policy}`,
    `情绪：${precheck.value.emotion?.sentimentLabel || '平静'}`,
  ]
  if (precheck.value.pii_summary?.total_hits) pills.push(`隐私线索：${precheck.value.pii_summary.total_hits} 项`)
  if (voiceMeta.value) pills.push('语音：已分析')
  if (imageMeta.value) pills.push('图片：已读取')
  return pills
})
const voiceEmotionText = computed(() => {
  const emotion = analyzeEmotion(chatInput.value)
  if (!chatInput.value.trim()) return '等你开口'
  return `${emotion.moodLabel} · ${emotion.sentimentLabel}`
})

watch(() => form.content, schedulePrecheck)

function notify(message) {
  if (message) showToast?.(message)
}

function switchMode(nextMode) {
  if (nextMode !== 'voice') stopVoiceInput({ discard: true })
  mode.value = nextMode
  if (nextMode === 'voice') nextTick(() => chatInputEl.value?.focus())
}

function toggleMood(mood) {
  const idx = form.moods.indexOf(mood)
  if (idx >= 0) form.moods.splice(idx, 1)
  else form.moods.push(mood)
}

function applyDetectedMoods() {
  for (const mood of detectedMoodTags.value) {
    if (!form.moods.includes(mood)) form.moods.push(mood)
  }
  notify('已套用识别到的情绪')
}

function buildDeviceMeta() {
  const meta = {}
  if (imageMeta.value) meta.image = imageMeta.value
  if (voiceMeta.value) meta.voice = voiceMeta.value
  return Object.keys(meta).length ? meta : null
}

function runPrecheck() {
  if (!form.content.trim()) {
    precheck.value = null
    return null
  }
  precheck.value = precheckText(form.content, {
    privacyMode: 'cloud',
    aiAssistEnabled: true,
    deviceMeta: buildDeviceMeta(),
  })
  return precheck.value
}

function schedulePrecheck() {
  window.clearTimeout(precheckTimer)
  precheckTimer = window.setTimeout(runPrecheck, 180)
}

function sanitizeClientContext(source) {
  if (!source) return null
  return {
    source_type: source.source_type,
    intent: source.intent,
    risk_level: source.risk_level,
    risk_hits: source.risk_hits || [],
    pii_summary: source.pii_summary || { total_hits: 0, categories: {} },
    privacy_mode: source.privacy_mode,
    upload_policy: source.upload_policy,
    redacted_text: source.redacted_text || null,
    client_tags: source.client_tags || [],
    device_meta: source.device_meta || null,
    ai_assist_enabled: source.ai_assist_enabled,
  }
}

function handleImageUpload(event) {
  const file = event.target.files?.[0]
  if (!file) return
  imageFile.value = file
  imagePreview.value = URL.createObjectURL(file)
  imageMeta.value = { original_type: file.type, original_size: file.size, compressed_size: file.size, exif_removed: false }
  runPrecheck()
  notify('图片已加入本地分析')
}

async function handleVoiceUpload(event) {
  const file = event.target.files?.[0]
  if (!file) return
  uploading.value = true
  try {
    const inspected = await inspectVoiceFile(file)
    voiceFile.value = inspected.file
    voiceMeta.value = inspected.deviceMeta
    runPrecheck()
    notify('语音已完成本地分析')
  } catch (error) {
    notify(error.message || '语音读取失败')
  } finally {
    uploading.value = false
  }
}

async function uploadAttachment(type, file) {
  if (!file) return null
  const result = await api.uploadFile(type, file)
  return result?.url || result?.file_url || result?.path || null
}

function resetForm() {
  form.content = ''
  form.moods = []
  form.moodScore = null
  form.interactionFreq = ''
  form.initiative = ''
  form.deepConversation = null
  form.taskCompleted = null
  imageFile.value = null
  voiceFile.value = null
  imageMeta.value = null
  voiceMeta.value = null
  imagePreview.value = ''
  precheck.value = null
  if (imageInput.value) imageInput.value.value = ''
  if (voiceInput.value) voiceInput.value.value = ''
}

async function handleSubmit() {
  const content = form.content.trim()
  if (!content) {
    notify('先写一句原话吧')
    return
  }
  submitting.value = true
  try {
    const currentPrecheck = runPrecheck()
    const payload = {
      content,
      mood_tags: form.moods,
      image_url: null,
      voice_url: null,
      mood_score: form.moodScore,
      interaction_freq: Number.isFinite(Number(form.interactionFreq)) ? Number(form.interactionFreq) : null,
      interaction_initiative: form.initiative || null,
      deep_conversation: form.deepConversation,
      task_completed: form.taskCompleted,
      client_context: sanitizeClientContext(currentPrecheck),
    }
    if (payload.client_context?.upload_policy === 'redacted_only' && payload.client_context.redacted_text) {
      payload.content = payload.client_context.redacted_text
    }
    if (sessionStorage.getItem('qj_token') === 'demo-mode') {
      notify('预览记录已归档')
      resetForm()
      return
    }
    if (imageFile.value) payload.image_url = await uploadAttachment('image', imageFile.value)
    if (voiceFile.value) payload.voice_url = await uploadAttachment('voice', voiceFile.value)
    await checkinStore.submit(userStore.currentPair?.id || null, payload)
    notify(currentPrecheck?.risk_level === 'high' ? '记录已提交，我们会持续关注这个信号' : '已提交')
    resetForm()
  } catch (error) {
    notify(error.message || '提交失败，请稍后再试')
  } finally {
    submitting.value = false
  }
}

async function ensureAgentSession() {
  if (agentSessionId.value) return agentSessionId.value
  const session = await api.createAgentSession(userStore.currentPair?.id || null)
  agentSessionId.value = session.session_id || session.id
  const history = await api.getAgentMessages(agentSessionId.value).catch(() => [])
  if (Array.isArray(history) && history.length && !messages.value.length) {
    messages.value = history.filter((item) => item.role === 'user' || item.role === 'assistant')
  }
  return agentSessionId.value
}

async function sendChat() {
  const input = chatInput.value.trim()
  if (!input || agentSending.value) return
  agentSending.value = true
  messages.value.push({ role: 'user', content: input })
  chatInput.value = ''
  if (sessionStorage.getItem('qj_token') === 'demo-mode') {
    const reply = '我先帮你把它拆成两层：表面是这句话让你很累，底下更像是希望对方能看见你的负担。可以把原话和当时的感受一起归档。'
    messages.value.push({ role: 'assistant', content: reply })
    lastAgentReply.value = reply
    agentSending.value = false
    return
  }
  try {
    const sessionId = await ensureAgentSession()
    const res = await api.chatWithAgent(sessionId, input)
    const reply = res.reply || res.content || '收到，我帮你整理一下。'
    messages.value.push({ role: 'assistant', content: reply })
    lastAgentReply.value = reply
    if (res.action === 'checkin_extracted') notify('已帮你整理好今天的记录')
  } catch (error) {
    messages.value.push({ role: 'assistant', content: error.message || '暂时无法回复，请稍后再试。' })
  } finally {
    agentSending.value = false
  }
}

function replayAgentReply() {
  if (!lastAgentReply.value) {
    notify('还没有回复')
    return
  }
  if (!('speechSynthesis' in window)) {
    notify('浏览器不支持朗读')
    return
  }
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(lastAgentReply.value)
  utterance.lang = 'zh-CN'
  window.speechSynthesis.speak(utterance)
}

async function toggleVoiceInput() {
  if (asrActive.value) {
    stopVoiceInput()
    return
  }
  if (asrFinalizing.value) {
    notify('正在整理最后一句')
    return
  }
  try {
    voiceFallbackTried = false
    if (sessionStorage.getItem('qj_token') === 'demo-mode') {
      startBrowserVoice()
    } else {
      await ensureAgentSession()
      voiceController.value = createBackendRealtimeAsr({
        getSocketUrl: () => api.buildRealtimeAsrSocketUrl(),
        onActive: () => { asrActive.value = true; asrFinalizing.value = false },
        onStatus: (text) => { voiceStatus.value = text },
        onPartial: (text) => { chatInput.value = text; voiceStatus.value = '正在把语音转成文字。' },
        onFinal: handleVoiceFinal,
        onError: handleBackendVoiceError,
      })
      await voiceController.value.start()
    }
  } catch (error) {
    try {
      startBrowserVoice(error.message)
    } catch (fallbackError) {
      cleanupVoiceState()
      notify(fallbackError.message || error.message || '无法开启语音')
    }
  }
}

function handleBackendVoiceError(message) {
  cleanupVoiceState()
  if (!voiceFallbackTried && mode.value === 'voice') {
    voiceFallbackTried = true
    try {
      startBrowserVoice(message)
      return
    } catch {
      // Fall through to the backend message if browser speech is unavailable.
    }
  }
  notify(message)
}

function startBrowserVoice(reason = '') {
  voiceController.value = startBrowserSpeech({
    reason,
    onActive: () => { asrActive.value = true; asrFinalizing.value = false },
    onStatus: (text) => { voiceStatus.value = text },
    onPartial: (text) => { chatInput.value = text },
    onFinal: handleVoiceFinal,
    onError: (message) => { cleanupVoiceState(); notify(message) },
  })
}

async function handleVoiceFinal(text) {
  const finalText = String(text || chatInput.value || '').trim()
  if (finalText) chatInput.value = finalText
  cleanupVoiceState('转写完成。')
  if (finalText) await sendChat()
}

function cleanupVoiceState(status = '') {
  asrActive.value = false
  asrFinalizing.value = false
  voiceStatus.value = status
  voiceController.value = null
}

function stopVoiceInput(options = {}) {
  if (!voiceController.value) {
    cleanupVoiceState()
    return
  }
  asrActive.value = false
  asrFinalizing.value = !options.discard
  voiceStatus.value = options.discard ? '' : '正在整理最后一句。'
  voiceController.value.stop?.({ discard: Boolean(options.discard) })
  if (options.discard) cleanupVoiceState()
}

onBeforeUnmount(() => {
  window.clearTimeout(precheckTimer)
  voiceController.value?.cleanup?.()
  cleanupVoiceState()
  if (imagePreview.value) URL.revokeObjectURL(imagePreview.value)
})
</script>

<style scoped>
.checkin-page {
  width: min(var(--content-max), calc(100% - 32px));
  margin: 0 auto;
  padding-bottom: 28px;
}
.checkin-mode {
  width: min(420px, 100%);
  margin: 0 0 18px;
}
.checkin-workbench {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 360px;
  gap: 16px;
  align-items: start;
}
.record-editor,
.context-panel,
.attachment-panel,
.client-ai-panel,
.voice-draft {
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: var(--radius-lg);
  background: rgba(255, 253, 250, 0.72);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  box-shadow: 0 4px 24px rgba(37, 40, 33, 0.04);
}
.record-editor,
.voice-draft {
  padding: 24px;
}
.record-editor__head,
.voice-draft__head,
.client-ai-panel__head {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
}
.record-editor__head h3,
.voice-draft__head h3,
.attachment-panel h3,
.client-ai-panel h3 {
  font-family: var(--font-serif);
  font-size: 21px;
}
.record-index,
.voice-draft__head > span {
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  border: 1px solid rgba(189, 75, 53, 0.38);
  border-radius: var(--radius-lg);
  color: var(--seal-deep);
  background: var(--seal-soft);
  font-family: var(--font-serif);
  font-weight: 700;
}
.record-textarea {
  min-height: 240px;
  font-family: var(--font-serif);
  font-size: 18px;
  line-height: 1.85;
}
.emotion-paper {
  margin: 16px 0 18px;
  padding: 14px;
  border: 1px solid rgba(78, 116, 91, 0.24);
  border-radius: var(--radius-lg);
  background: rgba(235, 242, 232, 0.56);
}
.emotion-paper--negative {
  border-color: rgba(189, 75, 53, 0.28);
  background: rgba(243, 216, 208, 0.34);
}
.emotion-paper__main {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 8px;
}
.emotion-paper__main strong {
  flex: 1;
  font-family: var(--font-serif);
  font-size: 18px;
}
.emotion-paper p,
.client-ai-panel p,
.precheck-note p,
.voice-toolbar p {
  color: var(--ink-soft);
  font-size: 13px;
  line-height: 1.6;
}
.emotion-paper__tags,
.evidence-strip,
.upload-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}
.seal-tag,
.evidence-pill {
  padding: 5px 9px;
  border: 1px solid rgba(189, 75, 53, 0.22);
  border-radius: var(--radius-md);
  background: rgba(255, 253, 250, 0.68);
  color: var(--seal-deep);
  font-size: 12px;
  font-weight: 700;
}
.seal-tag--muted,
.evidence-pill {
  color: var(--ink-soft);
  border-color: var(--border);
}
.text-button {
  border: 0;
  background: transparent;
  color: var(--seal-deep);
  font-weight: 700;
  cursor: pointer;
}
.mood-field {
  margin: 18px 0;
}
.mood-tags .tag {
  border-style: dashed;
}
.record-aside {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.record-support-grid {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}
.context-panel,
.attachment-panel,
.client-ai-panel {
  padding: 16px;
}
.context-panel summary {
  cursor: pointer;
  color: var(--seal-deep);
  font-family: var(--font-serif);
  font-size: 17px;
  font-weight: 700;
}
.context-panel .form-stack {
  margin-top: 14px;
}
.upload-preview,
.voice-preview {
  margin-top: 12px;
}
.upload-preview img {
  max-width: 220px;
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-lg);
}
.voice-preview,
.precheck-note,
.voice-toolbar,
.voice-emotion-line {
  padding: 10px;
  border: 1px dashed rgba(78, 116, 91, 0.3);
  border-radius: var(--radius-lg);
  background: rgba(235, 242, 232, 0.4);
}
.voice-preview {
  display: grid;
  gap: 4px;
  font-size: 13px;
}
.precheck-note span,
.voice-emotion-line span {
  color: var(--seal);
  font-size: 12px;
  font-weight: 800;
}
.voice-live {
  box-shadow: inset 0 -3px 0 rgba(189, 75, 53, 0.24);
}
.voice-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
}
.voice-toolbar strong {
  font-family: var(--font-serif);
  font-size: 17px;
}
.chat-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 360px;
  overflow-y: auto;
  padding: 4px 0 18px;
}
.chat-msg {
  display: flex;
  gap: 10px;
  align-items: flex-start;
}
.chat-msg--user {
  flex-direction: row-reverse;
}
.chat-msg__avatar {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  border: 1px solid rgba(78, 116, 91, 0.25);
  border-radius: var(--radius-lg);
  background: var(--moss-soft);
  color: var(--moss-deep);
  font-size: 12px;
  font-weight: 700;
}
.chat-msg--user .chat-msg__avatar {
  border-color: rgba(189, 75, 53, 0.28);
  background: var(--seal-soft);
  color: var(--seal-deep);
}
.chat-msg__bubble {
  max-width: 75%;
  padding: 12px 14px;
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  background: rgba(255, 253, 250, 0.7);
  font-size: 14px;
  line-height: 1.65;
}
.chat-msg--user .chat-msg__bubble {
  border-color: rgba(189, 75, 53, 0.24);
  background: rgba(243, 216, 208, 0.42);
}
.voice-input {
  padding-top: 16px;
  border-top: 1px solid var(--border);
}
.voice-emotion-line {
  display: flex;
  gap: 10px;
}
.voice-emotion-line strong {
  color: var(--seal-deep);
  font-size: 13px;
}
@media (max-width: 900px) {
  .checkin-workbench {
    grid-template-columns: 1fr;
  }
  .record-support-grid {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 600px) {
  .checkin-page {
    width: min(100% - 24px, var(--content-max));
  }
  .record-editor,
  .voice-draft {
    padding: 16px;
  }
  .record-support-grid {
    grid-template-columns: 1fr;
  }
  .record-textarea {
    min-height: 160px;
    font-size: 16px;
  }
  .emotion-paper__main,
  .voice-toolbar {
    align-items: flex-start;
    flex-direction: column;
  }
  .chat-msg__bubble {
    max-width: calc(100% - 48px);
  }
}
</style>
