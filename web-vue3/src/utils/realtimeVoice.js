function downsampleFloat32Buffer(buffer, inputRate, outputRate = 16000) {
  if (!buffer?.length) return new Float32Array()
  if (inputRate === outputRate) return buffer.slice(0)
  const ratio = inputRate / outputRate
  const newLength = Math.max(1, Math.round(buffer.length / ratio))
  const result = new Float32Array(newLength)
  let offset = 0
  for (let index = 0; index < newLength; index += 1) {
    const nextOffset = Math.min(buffer.length, Math.round((index + 1) * ratio))
    let sum = 0
    let count = 0
    for (let cursor = offset; cursor < nextOffset; cursor += 1) {
      sum += buffer[cursor]
      count += 1
    }
    result[index] = count ? sum / count : 0
    offset = nextOffset
  }
  return result
}

function float32ToPCM16Bytes(buffer) {
  const arrayBuffer = new ArrayBuffer(buffer.length * 2)
  const view = new DataView(arrayBuffer)
  for (let index = 0; index < buffer.length; index += 1) {
    const sample = Math.max(-1, Math.min(1, buffer[index] || 0))
    view.setInt16(index * 2, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true)
  }
  return new Uint8Array(arrayBuffer)
}

function uint8ArrayToBase64(bytes) {
  if (!bytes?.length) return ''
  let binary = ''
  const chunkSize = 0x8000
  for (let index = 0; index < bytes.length; index += chunkSize) {
    const chunk = bytes.subarray(index, index + chunkSize)
    binary += String.fromCharCode(...chunk)
  }
  return window.btoa(binary)
}

function assertSecureVoiceContext() {
  const hostname = String(window.location.hostname || '').replace(/^\[|\]$/g, '')
  const isLoopbackHost = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1'
  if (!window.isSecureContext && !isLoopbackHost) {
    throw new Error('实时语音输入需要 HTTPS 或 localhost 访问')
  }
}

export function createBackendRealtimeAsr(options) {
  const state = {
    socket: null,
    stream: null,
    audioContext: null,
    sourceNode: null,
    processorNode: null,
    sinkNode: null,
    active: false,
    stopping: false,
    finalDelivered: false,
  }

  function cleanupAudio() {
    if (state.processorNode) {
      state.processorNode.onaudioprocess = null
      state.processorNode.disconnect()
      state.processorNode = null
    }
    if (state.sourceNode) {
      state.sourceNode.disconnect()
      state.sourceNode = null
    }
    if (state.sinkNode) {
      state.sinkNode.disconnect()
      state.sinkNode = null
    }
    if (state.stream) {
      state.stream.getTracks().forEach((track) => track.stop())
      state.stream = null
    }
    if (state.audioContext) {
      state.audioContext.close?.().catch(() => null)
      state.audioContext = null
    }
  }

  function cleanup() {
    cleanupAudio()
    if (state.socket) {
      try {
        state.socket.close()
      } catch {
        // ignore close errors
      }
      state.socket = null
    }
    state.active = false
    state.stopping = false
  }

  async function start() {
    assertSecureVoiceContext()
    if (!navigator.mediaDevices?.getUserMedia || !(window.AudioContext || window.webkitAudioContext) || !window.WebSocket) {
      throw new Error('当前浏览器不支持实时语音')
    }

    const socketUrl = await options.getSocketUrl()
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true },
    })
    const AudioContextCtor = window.AudioContext || window.webkitAudioContext
    const audioContext = new AudioContextCtor()
    await audioContext.resume?.()
    const sourceNode = audioContext.createMediaStreamSource(stream)
    const processorNode = audioContext.createScriptProcessor(4096, 1, 1)
    const sinkNode = audioContext.createGain()
    sinkNode.gain.value = 0

    const socket = new WebSocket(socketUrl)
    Object.assign(state, {
      socket,
      stream,
      audioContext,
      sourceNode,
      processorNode,
      sinkNode,
      active: false,
      stopping: false,
      finalDelivered: false,
    })

    sourceNode.connect(processorNode)
    processorNode.connect(sinkNode)
    sinkNode.connect(audioContext.destination)

    processorNode.onaudioprocess = (event) => {
      if (!state.active || state.stopping || state.socket?.readyState !== WebSocket.OPEN) return
      const samples = event.inputBuffer.getChannelData(0)
      const downsampled = downsampleFloat32Buffer(samples, audioContext.sampleRate, 16000)
      const audio = uint8ArrayToBase64(float32ToPCM16Bytes(downsampled))
      if (audio) state.socket.send(JSON.stringify({ type: 'audio.chunk', audio }))
    }

    socket.addEventListener('open', () => {
      state.active = true
      options.onActive?.()
      options.onStatus?.('麦克风已开启，正在听你说。')
      socket.send(JSON.stringify({
        type: 'session.start',
        format: 'pcm',
        sample_rate: 16000,
        language: 'zh',
      }))
    })

    socket.addEventListener('message', async (event) => {
      let payload
      try {
        payload = JSON.parse(event.data)
      } catch {
        return
      }
      if (payload.type === 'partial') {
        options.onPartial?.(payload.text || '')
        return
      }
      if (payload.type === 'final') {
        state.finalDelivered = true
        const text = payload.text || ''
        cleanup()
        await options.onFinal?.(text)
        return
      }
      if (payload.type === 'error') {
        cleanup()
        options.onError?.(payload.message || '实时识别失败，请重试')
      }
    })

    socket.addEventListener('close', () => {
      const shouldNotify = !state.finalDelivered && !state.stopping
      cleanup()
      if (shouldNotify) options.onError?.('语音已中断，请重试')
    })

    socket.addEventListener('error', () => {
      cleanup()
      options.onError?.('语音连接失败')
    })
  }

  function stop({ discard = false } = {}) {
    state.stopping = true
    cleanupAudio()
    if (discard) {
      cleanup()
      return false
    }
    if (state.socket?.readyState === WebSocket.OPEN) {
      state.socket.send(JSON.stringify({ type: 'session.stop' }))
      return true
    }
    cleanup()
    return false
  }

  return { start, stop, cleanup, get active() { return state.active } }
}

export function startBrowserSpeech(options = {}) {
  const SpeechRecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition
  if (!SpeechRecognitionCtor) throw new Error('浏览器不支持语音识别')

  const recognition = new SpeechRecognitionCtor()
  let finalTranscript = ''
  let discarded = false
  recognition.lang = 'zh-CN'
  recognition.continuous = true
  recognition.interimResults = true

  recognition.onstart = () => {
    options.onActive?.()
    options.onStatus?.(options.reason ? `已切到浏览器转写：${options.reason}` : '浏览器语音识别已开启，正在听你说。')
  }
  recognition.onresult = (event) => {
    let interim = ''
    for (let index = event.resultIndex; index < event.results.length; index += 1) {
      const transcript = event.results[index][0]?.transcript || ''
      if (event.results[index].isFinal) finalTranscript += transcript
      else interim += transcript
    }
    options.onPartial?.(`${finalTranscript}${interim}`.trim())
  }
  recognition.onerror = (event) => {
    const message = event.error === 'not-allowed' ? '麦克风权限被拒绝' : '语音识别失败'
    options.onError?.(message)
  }
  recognition.onend = () => {
    options.onFinal?.(discarded ? '' : finalTranscript.trim())
  }
  recognition.start()

  return {
    stop({ discard = false } = {}) {
      discarded = discard
      try {
        recognition.stop()
      } catch {
        options.onFinal?.('')
      }
    },
    cleanup() {
      discarded = true
      recognition.onend = null
      try {
        recognition.stop()
      } catch {
        // ignore cleanup errors
      }
    },
  }
}
