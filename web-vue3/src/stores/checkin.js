import { defineStore } from 'pinia'
import { api } from '@/api'
import { ref } from 'vue'

export const useCheckinStore = defineStore('checkin', () => {
  const streak = ref({})
  const todayStatus = ref({})
  const history = ref([])

  function reset() {
    streak.value = {}
    todayStatus.value = {}
    history.value = []
  }

  async function loadStreak(pairId) {
    streak.value = await api.getCheckinStreak(pairId)
  }

  async function loadTodayStatus(pairId) {
    todayStatus.value = await api.getTodayStatus(pairId)
  }

  async function loadHistory(pairId, limit = 14) {
    history.value = await api.getCheckinHistory(pairId, limit)
  }

  async function submit(pairId, payload) {
    return api.submitCheckin(pairId, payload)
  }

  return { streak, todayStatus, history, loadStreak, loadTodayStatus, loadHistory, submit, reset }
})
