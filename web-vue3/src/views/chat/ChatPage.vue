<template>
  <div class="chat-page">
    <section class="page-head chat-head">
      <div>
        <p class="eyebrow">聊一聊</p>
        <h2>像聊天一样整理今天</h2>
      </div>
      <div class="chat-head__actions">
        <button class="btn btn-ghost" type="button" :disabled="startingNewTopic || voiceActive || voiceFinalizing" @click="startNewTopic">
          {{ startingNewTopic ? '切换中...' : '新话题' }}
        </button>
        <button class="btn btn-secondary" type="button" @click="moveToCheckin">
          整理成今日记录
          <ArrowUpRight :size="16" />
        </button>
      </div>
    </section>

    <section class="chat-shell">
      <header class="chat-shell__toolbar">
        <div class="chat-shell__mode">
          <span>录音区</span>
          <button
            class="voice-preference-trigger"
            type="button"
            :aria-expanded="voicePreferencePanelOpen"
            aria-controls="voice-preference-panel"
            @click="voicePreferencePanelOpen = !voicePreferencePanelOpen"
          >
            <Settings2 :size="15" />
            <span class="voice-preference-trigger__full">语音偏好：{{ voicePreferenceSummary }}</span>
            <span class="voice-preference-trigger__short">语音偏好</span>
            <strong>调整</strong>
          </button>
          <p class="chat-shell__privacy">最长 {{ recordingMaxSecondsLabel }} · {{ voiceSendPreferenceHint }}</p>
        </div>
        <div class="chat-shell__actions">
          <button class="btn btn-ghost" type="button" :disabled="uploadingVoice || sending || experienceMode.isDemoMode" @click="openVoiceUpload">
            <Upload :size="16" />
            {{ uploadingVoice ? '上传中...' : '上传录音' }}
          </button>
          <button
            class="btn"
            :class="voiceActive ? 'btn-secondary' : 'btn-primary'"
            type="button"
            :disabled="sending || voiceFinalizing"
            @click="toggleVoiceInput"
          >
            <component :is="voiceActive ? StopCircle : Mic" :size="16" />
            {{ voiceButtonLabel }}
          </button>
        </div>
      </header>

      <section
        v-if="voicePreferencePanelOpen"
        id="voice-preference-panel"
        class="voice-preference-panel"
        aria-label="语音偏好设置"
      >
        <div
          v-for="group in voicePreferenceGroups"
          :key="group.key"
          class="voice-preference-panel__group"
        >
          <span>{{ group.label }}</span>
          <div class="voice-preference-panel__options">
            <button
              v-for="option in group.options"
              :key="option.value"
              class="voice-preference-option"
              type="button"
              :class="{ active: voicePreferences[group.key] === option.value }"
              @click="setVoicePreference(group.key, option.value)"
            >
              {{ option.label }}
            </button>
          </div>
        </div>
      </section>

      <article v-if="liveTranscript || voiceStatus" class="chat-live-card">
        <span>语音状态</span>
        <strong>{{ voiceStatus || (voiceActive ? '正在转写这段语音' : '语音已准备好') }}</strong>
        <span v-if="voiceActive" class="chat-live-card__timer">剩余 {{ recordingCountdownLabel }}</span>
        <p v-if="liveTranscript">{{ liveTranscript }}</p>
      </article>

      <article v-if="pendingVoiceEvidence" class="chat-pending-card">
        <div class="chat-pending-card__head">
          <div>
            <span>待发送录音</span>
            <strong>{{ pendingVoiceEvidence.source === 'upload' ? '上传录音' : '实时录音' }}</strong>
          </div>
          <button class="btn btn-ghost btn-sm" type="button" @click="clearPendingVoiceEvidence">
            <Trash2 :size="14" />
            清除
          </button>
        </div>
        <audio
          v-if="displayVoiceUrl(pendingVoiceEvidence)"
          class="chat-audio"
          :src="displayVoiceUrl(pendingVoiceEvidence)"
          controls
          preload="none"
        ></audio>
        <div v-if="hasVisibleVoiceInsight(pendingVoiceEvidence)" class="voice-insight-card">
          <div
            v-if="voiceInsightTags(pendingVoiceEvidence).length || emotionBlendSummary(pendingVoiceEvidence)"
            class="voice-insight-card__body"
          >
            <span>重点感受</span>
            <div v-if="voiceInsightTags(pendingVoiceEvidence).length" class="voice-insight-tags">
              <strong v-for="tag in voiceInsightTags(pendingVoiceEvidence)" :key="tag">{{ tag }}</strong>
            </div>
            <p v-if="emotionBlendSummary(pendingVoiceEvidence)">
              {{ emotionBlendSummary(pendingVoiceEvidence) }}
            </p>
          </div>
          <div v-if="voiceMetaItems(pendingVoiceEvidence).length" class="voice-insight-meta">
            <span v-for="item in voiceMetaItems(pendingVoiceEvidence)" :key="item">{{ item }}</span>
          </div>
        </div>
        <div v-else-if="hasHiddenEmotionNotice(pendingVoiceEvidence)" class="voice-insight-card voice-insight-card--muted">
          <span>情绪线索已保存</span>
        </div>
        <p class="chat-pending-card__transcript">
          {{ pendingVoiceEvidence.transcript_text || '录音已保存，但这次还没整理出稳定文字。' }}
        </p>
      </article>

      <div ref="messageListEl" class="chat-list">
        <div v-if="loadingHistory" class="empty-state">正在加载这段聊天...</div>
        <div v-else-if="!messages.length" class="empty-state">
          先说一句，或者上传一段录音。
        </div>
        <article
          v-for="message in messages"
          :key="message.id"
          class="chat-msg"
          :class="{ 'chat-msg--user': message.role === 'user' }"
        >
          <div class="chat-msg__avatar">{{ message.role === 'user' ? '我' : '亲健' }}</div>
          <div class="chat-msg__bubble">
            <p class="chat-msg__text">{{ message.content }}</p>
            <div v-if="messageVoiceEvidence(message)" class="chat-msg__evidence">
              <audio
                v-if="displayVoiceUrl(messageVoiceEvidence(message))"
                class="chat-audio"
                :src="displayVoiceUrl(messageVoiceEvidence(message))"
                controls
                preload="none"
              ></audio>
              <div v-if="hasVisibleVoiceInsight(messageVoiceEvidence(message))" class="voice-insight-card">
                <div
                  v-if="voiceInsightTags(messageVoiceEvidence(message)).length || emotionBlendSummary(messageVoiceEvidence(message))"
                  class="voice-insight-card__body"
                >
                  <span>重点感受</span>
                  <div v-if="voiceInsightTags(messageVoiceEvidence(message)).length" class="voice-insight-tags">
                    <strong v-for="tag in voiceInsightTags(messageVoiceEvidence(message))" :key="tag">{{ tag }}</strong>
                  </div>
                  <p v-if="emotionBlendSummary(messageVoiceEvidence(message))">
                    {{ emotionBlendSummary(messageVoiceEvidence(message)) }}
                  </p>
                </div>
                <div v-if="voiceMetaItems(messageVoiceEvidence(message)).length" class="voice-insight-meta">
                  <span v-for="item in voiceMetaItems(messageVoiceEvidence(message))" :key="item">{{ item }}</span>
                </div>
              </div>
              <div v-else-if="hasHiddenEmotionNotice(messageVoiceEvidence(message))" class="voice-insight-card voice-insight-card--muted">
                <span>情绪线索已保存</span>
              </div>
              <p
                v-if="messageVoiceEvidence(message)?.transcript_text && messageVoiceEvidence(message)?.transcript_text !== message.content"
                class="chat-msg__transcript"
              >
                {{ messageVoiceEvidence(message).transcript_text }}
              </p>
            </div>
          </div>
        </article>
      </div>

      <footer class="chat-composer">
        <label class="field">
          <span>想说的话</span>
          <textarea
            v-model="draft"
            class="input input-textarea chat-composer__input"
            placeholder="打字或录音。"
          ></textarea>
        </label>
        <div class="chat-composer__actions">
          <button class="btn btn-ghost" type="button" :disabled="uploadingVoice || sending || experienceMode.isDemoMode" @click="openVoiceUpload">
            <Upload :size="16" />
            上传录音
          </button>
          <button
            class="btn"
            :class="voiceActive ? 'btn-secondary' : 'btn-ghost'"
            type="button"
            :disabled="sending || voiceFinalizing"
            @click="toggleVoiceInput"
          >
            <component :is="voiceActive ? StopCircle : Mic" :size="16" />
            {{ voiceButtonLabel }}
          </button>
          <button class="btn btn-primary" type="button" :disabled="!canSend" @click="sendMessage()">
            <SendHorizontal :size="16" />
            {{ sending ? '发送中...' : '发送' }}
          </button>
        </div>
      </footer>

      <input ref="voiceInput" type="file" accept="audio/*" class="hidden" @change="handleVoiceUpload" />
    </section>
  </div>
</template>

<script setup>
import { ArrowUpRight, Mic, SendHorizontal, Settings2, StopCircle, Trash2, Upload } from 'lucide-vue-next'
import { computed, inject, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { api } from '@/api'
import { inspectVoiceFile } from '@/utils/clientAi'
import { saveChatDraftToCheckin } from '@/utils/checkinDraftBridge'
import { AI_WAITING_NOTICE, VOICE_TRANSCRIPTION_WAITING_NOTICE } from '@/utils/aiWaitFeedback'
import { featureUnavailableReason, resolveExperienceMode } from '@/utils/experienceMode'
import {
  DEFAULT_REALTIME_MAX_SECONDS,
  describeVoiceStartError,
  formatRecordingCountdown,
  createBackendRealtimeAsr,
} from '@/utils/realtimeVoice'

const router = useRouter()
const userStore = useUserStore()
const showToast = inject('showToast')

const VOICE_PREFERENCE_STORAGE_KEY = 'qinjian-chat-voice-preferences'
const defaultVoicePreferences = {
  rhythm: 'light',
  emotion: 'gentle',
  sending: 'auto',
}
const voicePreferenceGroups = [
  {
    key: 'rhythm',
    label: '互动节奏',
    options: [
      { value: 'light', label: '轻陪伴' },
      { value: 'organize', label: '边聊边整理' },
      { value: 'lead', label: '主动带节奏' },
    ],
  },
  {
    key: 'emotion',
    label: '情绪呈现',
    options: [
      { value: 'gentle', label: '温柔观察' },
      { value: 'evidence', label: '标签线索' },
      { value: 'hidden', label: '默认隐藏' },
    ],
  },
  {
    key: 'sending',
    label: '录音发送',
    options: [
      { value: 'auto', label: '自动发送' },
      { value: 'manual', label: '手动确认' },
    ],
  },
]

function readStoredVoicePreferences() {
  if (typeof window === 'undefined') return { ...defaultVoicePreferences }
  try {
    const raw = window.localStorage.getItem(VOICE_PREFERENCE_STORAGE_KEY)
    const saved = raw ? JSON.parse(raw) : {}
    return {
      rhythm: voicePreferenceGroups[0].options.some((option) => option.value === saved?.rhythm) ? saved.rhythm : defaultVoicePreferences.rhythm,
      emotion: voicePreferenceGroups[1].options.some((option) => option.value === saved?.emotion) ? saved.emotion : defaultVoicePreferences.emotion,
      sending: voicePreferenceGroups[2].options.some((option) => option.value === saved?.sending) ? saved.sending : defaultVoicePreferences.sending,
    }
  } catch {
    return { ...defaultVoicePreferences }
  }
}

const loadingHistory = ref(false)
const sending = ref(false)
const uploadingVoice = ref(false)
const startingNewTopic = ref(false)
const messages = ref([])
const draft = ref('')
const sessionId = ref('')
const sessionExpiresAt = ref('')
const voicePreferencePanelOpen = ref(false)
const voicePreferences = reactive(readStoredVoicePreferences())
const autoSendVoice = ref(voicePreferences.sending === 'auto')
const voiceInput = ref(null)
const messageListEl = ref(null)
const voiceController = ref(null)
const voiceActive = ref(false)
const voiceFinalizing = ref(false)
const voiceStatus = ref('')
const liveTranscript = ref('')
const pendingVoiceEvidence = ref(null)
const recordingMaxSeconds = DEFAULT_REALTIME_MAX_SECONDS
const recordingRemainingSeconds = ref(DEFAULT_REALTIME_MAX_SECONDS)

const activePairId = computed(() => userStore.activePairId || null)
const experienceMode = computed(() =>
  resolveExperienceMode({
    isDemoMode: userStore.isDemoMode,
    activePairId: userStore.activePairId,
    currentPair: userStore.currentPair,
    pairs: userStore.pairs,
  })
)
const canSend = computed(() => {
  const hasText = Boolean(String(draft.value || '').trim())
  const hasTranscript = Boolean(String(pendingVoiceEvidence.value?.transcript_text || '').trim())
  return !sending.value && !voiceActive.value && !voiceFinalizing.value && (hasText || hasTranscript)
})
const voiceButtonLabel = computed(() => {
  if (voiceFinalizing.value) return '收尾中...'
  if (voiceActive.value) return autoSendVoice.value ? '停止并发送' : '停止录音'
  return '开始录音'
})
const recordingCountdownLabel = computed(() => formatRecordingCountdown(recordingRemainingSeconds.value))
const recordingMaxSecondsLabel = computed(() => {
  if (recordingMaxSeconds >= 60) return `${Math.round(recordingMaxSeconds / 60)} 分钟`
  return `${recordingMaxSeconds} 秒`
})
const voicePreferenceSummary = computed(() => {
  const rhythm = preferenceLabel('rhythm', voicePreferences.rhythm)
  const emotion = preferenceLabel('emotion', voicePreferences.emotion)
  return `${rhythm} · ${emotion}`
})
const voiceSendPreferenceHint = computed(() => (
  voicePreferences.sending === 'auto' ? '停止后自动发送' : '停止后先确认'
))
const emotionDisplayMode = computed(() => voicePreferences.emotion)
const shouldShowEmotionInsight = computed(() => emotionDisplayMode.value !== 'hidden')
const shouldShowDetailedEvidence = computed(() => emotionDisplayMode.value === 'evidence')
const composerHint = computed(() => {
  if (experienceMode.value.isDemoMode) return featureUnavailableReason('demo-online', experienceMode.value)
  if (sending.value) return '亲健正在回复。'
  if (voiceFinalizing.value) return '正在保存录音。'
  if (voiceActive.value) {
    return autoSendVoice.value
      ? `剩余 ${recordingCountdownLabel.value}，停下后发送。`
      : `剩余 ${recordingCountdownLabel.value}，停下后进草稿。`
  }
  if (pendingVoiceEvidence.value && !draft.value.trim()) {
    return '录音已就位，可直接发。'
  }
  return '支持打字、录音、上传。'
})

function notify(message) {
  if (message) showToast?.(message)
}

function preferenceLabel(groupKey, value) {
  const group = voicePreferenceGroups.find((item) => item.key === groupKey)
  return group?.options.find((option) => option.value === value)?.label || ''
}

function persistVoicePreferences() {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(VOICE_PREFERENCE_STORAGE_KEY, JSON.stringify({ ...voicePreferences }))
  } catch {
    // 偏好保存失败不影响当前会话使用。
  }
}

function setVoicePreference(groupKey, value) {
  if (!Object.prototype.hasOwnProperty.call(voicePreferences, groupKey)) return
  voicePreferences[groupKey] = value
  if (groupKey === 'sending') {
    autoSendVoice.value = value === 'auto'
  }
  persistVoicePreferences()
}

function isAgentSessionExpired() {
  if (!sessionExpiresAt.value) return false
  const expiresAt = Date.parse(sessionExpiresAt.value)
  return Number.isFinite(expiresAt) && expiresAt <= Date.now()
}

function normalizeMessage(message) {
  return {
    id: message?.id || `message-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role: message?.role || 'assistant',
    content: String(message?.content || '').trim(),
    payload: message?.payload || null,
  }
}

function normalizeVoiceEvidence(raw) {
  if (!raw || typeof raw !== 'object') return null
  return {
    voice_url: String(raw.voice_url || '').trim(),
    playback_url: String(raw.playback_url || '').trim(),
    transcript_text: String(raw.transcript_text || '').trim(),
    duration_seconds: raw.duration_seconds ?? null,
    source: String(raw.source || '').trim() || 'upload',
    voice_emotion: raw.voice_emotion || null,
    content_emotion: raw.content_emotion || null,
    transcript_language: raw.transcript_language || null,
  }
}

function displayVoiceUrl(evidence) {
  return String(evidence?.playback_url || evidence?.voice_url || '').trim()
}

function voiceEmotionLabel(evidence) {
  return String(evidence?.voice_emotion?.label || evidence?.voice_emotion?.code || '').trim()
}

function uniqueStrings(items, limit = 3) {
  const result = []
  for (const item of Array.isArray(items) ? items : []) {
    const value = String(item || '').trim()
    if (value && !result.includes(value)) result.push(value)
    if (result.length >= limit) break
  }
  return result
}

function firstNonEmptyArray(...candidates) {
  return candidates.find((items) => Array.isArray(items) && items.length) || []
}

function contentEmotionTags(evidence) {
  const emotion = evidence?.content_emotion || {}
  const profile = emotion.emotion_profile || {}
  const userFacing = emotion.user_facing || {}
  return uniqueStrings(
    firstNonEmptyArray(
      userFacing.display_mood_tags,
      emotion.display_mood_tags,
      profile.display_mood_tags,
      emotion.mood_tags,
      [
        emotion.primary_mood,
        ...(Array.isArray(emotion.secondary_moods) ? emotion.secondary_moods : []),
      ],
    ),
    3,
  )
}

function contentEmotionLabel(evidence) {
  const tags = contentEmotionTags(evidence)
  if (tags.length) return tags.join(' · ')
  return String(
    evidence?.content_emotion?.mood_label
    || evidence?.content_emotion?.primary_mood
    || evidence?.content_emotion?.sentiment_label
    || evidence?.content_emotion?.sentiment
    || ''
  ).trim()
}

function voiceInsightTags(evidence) {
  const tags = contentEmotionTags(evidence)
  if (tags.length) return tags
  const fallback = contentEmotionLabel(evidence)
  return fallback ? [fallback] : []
}

function emotionBlendSummary(evidence) {
  const emotion = evidence?.content_emotion || {}
  return String(
    emotion.user_facing?.blend_summary
      || emotion.emotion_blend_summary
      || emotion.emotion_profile?.blend_summary
      || emotion.reason
      || '',
  ).trim()
}

function languageLabel(evidence) {
  return String(evidence?.transcript_language?.label || evidence?.transcript_language?.code || '').trim()
}

function hasHiddenEmotionNotice(evidence) {
  return !shouldShowEmotionInsight.value
    && Boolean(voiceInsightTags(evidence).length || emotionBlendSummary(evidence) || voiceEmotionLabel(evidence))
}

function hasVisibleVoiceInsight(evidence) {
  return shouldShowEmotionInsight.value
    && Boolean(voiceInsightTags(evidence).length || emotionBlendSummary(evidence) || voiceMetaItems(evidence).length)
}

function formatSeconds(value) {
  const seconds = Number(value || 0)
  if (!Number.isFinite(seconds) || seconds <= 0) return '--'
  if (seconds < 60) return `${seconds.toFixed(seconds >= 10 ? 0 : 1)} 秒`
  const minutes = Math.floor(seconds / 60)
  const remain = Math.round(seconds % 60)
  return `${minutes} 分 ${remain} 秒`
}

function voiceMetaItems(evidence) {
  const items = []
  if (evidence?.duration_seconds) items.push(`时长 ${formatSeconds(evidence.duration_seconds)}`)
  if (shouldShowDetailedEvidence.value && voiceEmotionLabel(evidence)) items.push(`语气 ${voiceEmotionLabel(evidence)}`)
  if (languageLabel(evidence)) items.push(languageLabel(evidence))
  return items
}

function messageVoiceEvidence(message) {
  return normalizeVoiceEvidence(message?.payload?.voice_evidence)
}

function mergeTranscriptText(base, transcript) {
  const current = String(base || '').trim()
  const incoming = String(transcript || '').trim()
  if (!incoming) return current
  if (!current) return incoming
  if (current.includes(incoming)) return current
  return `${current}\n${incoming}`
}

function extensionFromMimeType(mimeType) {
  const normalized = String(mimeType || '').toLowerCase()
  if (normalized.includes('ogg')) return 'ogg'
  if (normalized.includes('mp4') || normalized.includes('aac')) return 'm4a'
  if (normalized.includes('mpeg') || normalized.includes('mp3')) return 'mp3'
  if (normalized.includes('wav')) return 'wav'
  return 'webm'
}

function createAudioFileFromBlob(blob) {
  const type = String(blob?.type || 'audio/webm').trim() || 'audio/webm'
  return new File([blob], `chat-voice-${Date.now()}.${extensionFromMimeType(type)}`, { type })
}

function buildEvidenceForRequest(evidence) {
  if (!evidence) return undefined
  return {
    voice_url: evidence.voice_url || null,
    transcript_text: evidence.transcript_text || '',
    duration_seconds: evidence.duration_seconds ?? null,
    source: evidence.source || 'upload',
    voice_emotion: evidence.voice_emotion || null,
    content_emotion: evidence.content_emotion || null,
    transcript_language: evidence.transcript_language || null,
  }
}

function buildEvidenceForDisplay(evidence) {
  if (!evidence) return null
  return {
    ...buildEvidenceForRequest(evidence),
    voice_url: displayVoiceUrl(evidence),
  }
}

function scrollMessagesToBottom() {
  nextTick(() => {
    const container = messageListEl.value
    if (container) container.scrollTop = container.scrollHeight
  })
}

function cleanupVoiceState(status = '') {
  voiceActive.value = false
  voiceFinalizing.value = false
  voiceStatus.value = status
  liveTranscript.value = ''
  recordingRemainingSeconds.value = recordingMaxSeconds
  voiceController.value = null
}

function stopVoiceInput({ discard = false } = {}) {
  if (!voiceController.value) {
    cleanupVoiceState()
    return
  }
  voiceActive.value = false
  voiceFinalizing.value = !discard
  voiceStatus.value = discard ? '' : '正在保存最后一段录音。'
  voiceController.value.stop?.({ discard })
  if (discard) cleanupVoiceState()
}

async function ensureAgentSession({ forceNew = false } = {}) {
  if (experienceMode.value.isDemoMode) {
    throw new Error(featureUnavailableReason('demo-online', experienceMode.value))
  }
  const expired = !forceNew && sessionId.value && isAgentSessionExpired()
  if (expired) {
    sessionId.value = ''
    sessionExpiresAt.value = ''
    messages.value = []
  }
  if (sessionId.value && !forceNew) return sessionId.value

  const session = await api.createAgentSession(activePairId.value, {
    forceNew,
    surface: 'chat',
  })
  sessionId.value = session.session_id || session.id
  sessionExpiresAt.value = session.expires_at || ''
  const history = await api.getAgentMessages(sessionId.value).catch(() => [])
  messages.value = Array.isArray(history)
    ? history.filter((item) => item.role === 'user' || item.role === 'assistant').map(normalizeMessage)
    : []
  scrollMessagesToBottom()
  return sessionId.value
}

async function loadInitialSession() {
  if (experienceMode.value.isDemoMode) return
  loadingHistory.value = true
  try {
    await ensureAgentSession()
  } catch (error) {
    notify(error.message || '暂时无法打开聊天页')
  } finally {
    loadingHistory.value = false
  }
}

function clearPendingVoiceEvidence() {
  pendingVoiceEvidence.value = null
}

async function sendMessage({ overrideContent = null, overrideEvidence = null } = {}) {
  const currentDraft = String(overrideContent ?? draft.value ?? '').trim()
  const currentEvidence = normalizeVoiceEvidence(overrideEvidence ?? pendingVoiceEvidence.value)
  const finalContent = currentDraft || String(currentEvidence?.transcript_text || '').trim()
  if (!finalContent) {
    notify('先写一句，或者先准备一段录音')
    return false
  }
  if (experienceMode.value.isDemoMode) {
    notify(featureUnavailableReason('demo-online', experienceMode.value))
    return false
  }

  const optimisticId = `local-user-${Date.now()}`
  const optimisticMessage = normalizeMessage({
    id: optimisticId,
    role: 'user',
    content: finalContent,
    payload: {
      surface: 'chat',
      ...(currentEvidence ? { voice_evidence: buildEvidenceForDisplay(currentEvidence) } : {}),
    },
  })
  const previousDraft = draft.value
  const previousEvidence = pendingVoiceEvidence.value
  draft.value = ''
  if (!overrideEvidence || overrideEvidence === pendingVoiceEvidence.value) {
    pendingVoiceEvidence.value = null
  }
  messages.value.push(optimisticMessage)
  scrollMessagesToBottom()

  sending.value = true
  try {
    const resolvedSessionId = await ensureAgentSession()
    notify(AI_WAITING_NOTICE)
    const response = await api.chatWithAgent(resolvedSessionId, {
      content: currentDraft,
      surface: 'chat',
      voice_evidence: buildEvidenceForRequest(currentEvidence),
    })
    messages.value.push(normalizeMessage({
      id: `local-assistant-${Date.now()}`,
      role: 'assistant',
      content: response?.reply || response?.content || '我在，我们继续。',
      payload: null,
    }))
    scrollMessagesToBottom()
    return true
  } catch (error) {
    messages.value = messages.value.filter((item) => item.id !== optimisticId)
    draft.value = previousDraft || finalContent
    if (!pendingVoiceEvidence.value && previousEvidence) {
      pendingVoiceEvidence.value = previousEvidence
    }
    notify(error.message || '这轮消息没有发出去，请稍后再试')
    return false
  } finally {
    sending.value = false
  }
}

async function handleUploadedVoiceFile(file) {
  const inspected = await inspectVoiceFile(file).catch(() => null)
  const upload = await api.uploadFile('voice', file)
  let transcription = null
  try {
    notify(VOICE_TRANSCRIPTION_WAITING_NOTICE)
    transcription = await api.transcribeVoice(file)
  } catch (error) {
    notify(error.message || '录音已保存，但这次没能顺利转写')
  }
  pendingVoiceEvidence.value = normalizeVoiceEvidence({
    voice_url: upload?.url || '',
    playback_url: upload?.access_url || upload?.url || '',
    transcript_text: String(transcription?.text || '').trim(),
    duration_seconds: inspected?.deviceMeta?.duration_seconds ?? null,
    source: 'upload',
    voice_emotion: transcription?.voice_emotion || null,
    content_emotion: transcription?.content_emotion || null,
    transcript_language: transcription?.transcript_language || null,
  })
}

async function handleVoiceUpload(event) {
  const file = event.target.files?.[0]
  if (voiceInput.value) voiceInput.value.value = ''
  if (!file) return
  if (experienceMode.value.isDemoMode) {
    notify(featureUnavailableReason('voice', experienceMode.value))
    return
  }
  uploadingVoice.value = true
  try {
    await handleUploadedVoiceFile(file)
    notify('录音已放进待发送材料里')
  } catch (error) {
    notify(error.message || '录音没传上，请稍后再试')
  } finally {
    uploadingVoice.value = false
  }
}

function openVoiceUpload() {
  if (experienceMode.value.isDemoMode) {
    notify(featureUnavailableReason('voice', experienceMode.value))
    return
  }
  voiceInput.value?.click()
}

async function handleRealtimeFinal(result) {
  const transcript = String(result?.text || liveTranscript.value || '').trim()
  let upload = null
  if (result?.rawAudioBlob) {
    try {
      const audioFile = createAudioFileFromBlob(result.rawAudioBlob)
      upload = await api.uploadFile('voice', audioFile)
    } catch (error) {
      notify(error.message || '原始录音没保存上，这轮先保留转写文字')
    }
  }

  const evidence = normalizeVoiceEvidence({
    voice_url: upload?.url || '',
    playback_url: upload?.access_url || upload?.url || '',
    transcript_text: transcript,
    duration_seconds: result?.durationSeconds ?? null,
    source: 'realtime',
    voice_emotion: result?.voiceEmotion || null,
    content_emotion: result?.contentEmotion || null,
    transcript_language: result?.transcriptLanguage || null,
  })

  cleanupVoiceState(transcript ? '这一段已经整理好了。' : '录音结束。')
  pendingVoiceEvidence.value = evidence
  if (!transcript) {
    notify('这段录音没有整理出稳定文字，请再试一次')
    return
  }

  if (autoSendVoice.value) {
    await sendMessage({
      overrideContent: transcript,
      overrideEvidence: evidence,
    })
    return
  }

  draft.value = mergeTranscriptText(draft.value, transcript)
    notify('录音已放进草稿，可改字再发')
}

function handleVoiceError(message) {
  const text = String(message || '').trim() || '这次没识别出来，请重试'
  const partialTranscript = String(liveTranscript.value || '').trim()
  cleanupVoiceState(text)
  if (partialTranscript) {
    draft.value = mergeTranscriptText(draft.value, partialTranscript)
    notify(`${text} 已把听到的文字放进草稿，也可以上传录音或改用文字。`)
    return
  }
  notify(`${text} 可以上传录音或改用文字。`)
}

async function toggleVoiceInput() {
  if (voiceActive.value) {
    stopVoiceInput()
    return
  }
  if (voiceFinalizing.value) {
    notify('正在保存最后一段录音')
    return
  }
  if (!experienceMode.value.canUseVoice) {
    notify(featureUnavailableReason('voice', experienceMode.value))
    return
  }
  try {
    voiceStatus.value = '正在打开麦克风。'
    recordingRemainingSeconds.value = recordingMaxSeconds
    voiceController.value = createBackendRealtimeAsr({
      captureRawAudio: true,
      maxDurationSeconds: recordingMaxSeconds,
      getSocketUrl: () => api.buildRealtimeAsrSocketUrl(),
      onActive: () => {
        voiceActive.value = true
        voiceFinalizing.value = false
      },
      onStatus: (text) => {
        voiceStatus.value = text
      },
      onPartial: (text) => {
        if (!voiceActive.value || voiceFinalizing.value) return
        liveTranscript.value = text
        voiceStatus.value = '正在转写，可能会有少量错字。'
      },
      onTick: ({ remainingSeconds }) => {
        if (!voiceActive.value || voiceFinalizing.value) return
        recordingRemainingSeconds.value = remainingSeconds
      },
      onTimeLimit: () => {
        voiceStatus.value = `已到 ${recordingMaxSecondsLabel.value} 上限，正在保存这段语音。`
      },
      onFinal: handleRealtimeFinal,
      onError: handleVoiceError,
    })
    await voiceController.value.start()
  } catch (error) {
    cleanupVoiceState()
    notify(describeVoiceStartError(error))
  }
}

async function startNewTopic() {
  if (startingNewTopic.value || sending.value || voiceActive.value || voiceFinalizing.value) return
  if (experienceMode.value.isDemoMode) {
    notify(featureUnavailableReason('demo-online', experienceMode.value))
    return
  }
  startingNewTopic.value = true
  try {
    sessionId.value = ''
    sessionExpiresAt.value = ''
    messages.value = []
    await ensureAgentSession({ forceNew: true })
    notify('已经切到新的聊天话题')
  } catch (error) {
    notify(error.message || '暂时不能开启新话题')
  } finally {
    startingNewTopic.value = false
  }
}

function moveToCheckin() {
  const latestUserMessage = [...messages.value].reverse().find((item) => item.role === 'user')
  const draftContent = String(draft.value || '').trim()
  const transcript = String(pendingVoiceEvidence.value?.transcript_text || '').trim()
  const content = draftContent || transcript || String(latestUserMessage?.content || '').trim()
  if (!content) {
    notify('先留下一句，再整理成今日记录')
    return
  }
  saveChatDraftToCheckin(content)
  router.push('/checkin')
}

watch(
  () => messages.value.length,
  () => {
    if (messages.value.length) scrollMessagesToBottom()
  }
)

watch(autoSendVoice, (value) => {
  const nextMode = value ? 'auto' : 'manual'
  if (voicePreferences.sending !== nextMode) {
    voicePreferences.sending = nextMode
    persistVoicePreferences()
  }
})

onMounted(() => {
  loadInitialSession()
})

onBeforeUnmount(() => {
  voiceController.value?.cleanup?.()
  cleanupVoiceState()
})
</script>

<style scoped>
.chat-page {
  width: min(var(--content-max), calc(100% - 32px));
  margin: 0 auto;
  padding-bottom: 32px;
  display: grid;
  gap: 16px;
}

.chat-head {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
}

.chat-head__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.chat-shell {
  display: grid;
  gap: 14px;
  padding: 20px;
  border: 1px solid var(--border-strong);
  border-radius: 28px;
  background:
    radial-gradient(circle at top left, rgba(215, 104, 72, 0.08), transparent 26%),
    linear-gradient(180deg, rgba(255, 252, 247, 0.96), rgba(249, 244, 238, 0.9));
  box-shadow: 0 16px 34px rgba(56, 42, 30, 0.05);
}

.chat-shell__toolbar {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
}

.chat-shell__mode {
  display: grid;
  gap: 8px;
}

.chat-shell__mode > span,
.chat-shell__privacy,
.chat-live-card span,
.chat-live-card__timer,
.chat-pending-card__head span {
  color: var(--ink-soft);
  font-size: 13px;
  line-height: 1.7;
}

.chat-shell__privacy,
.chat-live-card__timer {
  margin: 0;
}

.voice-preference-trigger {
  width: fit-content;
  max-width: 100%;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border: 1px solid rgba(189, 75, 53, 0.18);
  border-radius: 999px;
  background: rgba(255, 253, 250, 0.78);
  color: var(--ink);
  font: inherit;
  font-size: 13px;
  box-shadow: 0 8px 18px rgba(56, 42, 30, 0.05);
  cursor: pointer;
}

.voice-preference-trigger svg {
  color: var(--seal);
}

.voice-preference-trigger strong {
  color: var(--seal-deep);
  font-size: 12px;
}

.voice-preference-trigger__short {
  display: none;
}

.voice-preference-trigger:hover {
  border-color: rgba(189, 75, 53, 0.3);
  background: rgba(255, 250, 246, 0.96);
}

.voice-preference-panel {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  padding: 14px;
  border: 1px solid rgba(68, 52, 40, 0.1);
  border-radius: 22px;
  background: rgba(255, 253, 250, 0.86);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

.voice-preference-panel__group {
  display: grid;
  gap: 8px;
}

.voice-preference-panel__group > span {
  color: var(--ink-soft);
  font-size: 13px;
  font-weight: 700;
}

.voice-preference-panel__options {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.voice-preference-option {
  padding: 7px 10px;
  border: 1px solid rgba(68, 52, 40, 0.1);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.7);
  color: var(--ink);
  font: inherit;
  font-size: 13px;
  cursor: pointer;
}

.voice-preference-option.active {
  border-color: rgba(189, 75, 53, 0.25);
  background: var(--seal-soft);
  color: var(--seal-deep);
  font-weight: 800;
}

.chat-shell__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.chat-live-card,
.chat-pending-card,
.chat-composer,
.chat-list {
  border: 1px solid rgba(68, 52, 40, 0.1);
  border-radius: 24px;
  background: rgba(255, 251, 247, 0.82);
}

.chat-live-card,
.chat-pending-card,
.chat-composer {
  padding: 16px 18px;
  display: grid;
  gap: 8px;
}

.chat-live-card strong,
.chat-pending-card strong {
  color: #17385e;
  font-family: var(--font-serif);
  font-size: 18px;
}

.chat-live-card p,
.chat-pending-card__transcript,
.chat-msg__text,
.chat-msg__transcript,
.voice-insight-card p {
  margin: 0;
  line-height: 1.8;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.chat-live-card p,
.chat-pending-card__transcript,
.chat-msg__transcript {
  max-height: 10.8em;
  overflow-y: auto;
  padding-right: 4px;
}

.chat-pending-card__head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
}

.chat-audio {
  width: 100%;
}

.chat-list {
  min-height: clamp(180px, 26vh, 240px);
  max-height: 56vh;
  overflow-y: auto;
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
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
  width: 34px;
  height: 34px;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  border: 1px solid rgba(67, 98, 115, 0.22);
  border-radius: 16px;
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
  max-width: min(72ch, 78%);
  padding: 14px 16px;
  border: 1px solid var(--border);
  border-radius: 20px;
  background: rgba(255, 253, 250, 0.92);
  display: grid;
  gap: 10px;
}

.chat-msg--user .chat-msg__bubble {
  border-color: rgba(189, 75, 53, 0.22);
  background: rgba(243, 216, 208, 0.52);
}

.chat-msg__evidence {
  padding-top: 10px;
  border-top: 1px dashed rgba(68, 52, 40, 0.12);
  display: grid;
  gap: 8px;
}

.voice-insight-card {
  display: grid;
  gap: 10px;
  padding: 12px;
  border: 1px solid rgba(78, 116, 91, 0.18);
  border-radius: 18px;
  background:
    linear-gradient(135deg, rgba(235, 242, 232, 0.82), rgba(255, 253, 250, 0.88));
}

.voice-insight-card__body {
  display: grid;
  gap: 7px;
}

.voice-insight-card__body > span,
.voice-insight-card--muted > span {
  color: var(--moss-deep);
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.voice-insight-card p {
  color: var(--ink-soft);
  font-size: 13px;
}

.voice-insight-tags,
.voice-insight-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
}

.voice-insight-tags strong {
  padding: 7px 11px;
  border: 1px solid rgba(189, 75, 53, 0.2);
  border-radius: 999px;
  background: rgba(255, 246, 241, 0.92);
  color: var(--seal-deep);
  font-family: var(--font-serif);
  font-size: 15px;
}

.voice-insight-meta span {
  padding: 5px 8px;
  border: 1px solid rgba(68, 52, 40, 0.08);
  border-radius: 999px;
  background: rgba(255, 253, 250, 0.74);
  color: var(--ink-soft);
  font-size: 12px;
  font-weight: 700;
}

.voice-insight-card--muted {
  border-style: dashed;
  background: rgba(255, 253, 250, 0.62);
}

.chat-composer__input {
  min-height: 140px;
  font-size: 16px;
  line-height: 1.85;
  background: rgba(255, 254, 251, 0.92);
}

.chat-composer__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

@media (max-width: 900px) {
  .chat-head,
  .chat-shell__toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .voice-preference-panel {
    grid-template-columns: 1fr;
  }

  .chat-msg__bubble {
    max-width: calc(100% - 48px);
  }
}

@media (max-width: 600px) {
  .chat-page {
    width: min(100% - 20px, var(--content-max));
  }

  .chat-shell {
    padding: 16px;
    border-radius: 24px;
  }

  .chat-list,
  .chat-composer,
  .chat-live-card,
  .chat-pending-card {
    border-radius: 20px;
  }

  .chat-composer__actions,
  .chat-head__actions,
  .chat-shell__actions {
    flex-direction: column;
  }

  .chat-composer__actions .btn,
  .chat-head__actions .btn,
  .chat-shell__actions .btn {
    width: 100%;
  }

  .voice-preference-trigger {
    width: fit-content;
    justify-content: flex-start;
    justify-self: start;
    padding: 6px 9px;
    font-size: 12px;
  }

  .voice-preference-trigger__full {
    display: none;
  }

  .voice-preference-trigger__short {
    display: inline;
  }
}
</style>
