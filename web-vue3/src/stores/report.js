import { defineStore } from 'pinia'
import { api } from '@/api'
import { ref } from 'vue'

export const useReportStore = defineStore('report', () => {
  const currentReport = ref(null)
  const reportHistory = ref([])
  const reportType = ref('daily')

  function reset() {
    currentReport.value = null
    reportHistory.value = []
    reportType.value = 'daily'
  }

  async function generate(pairId, type = 'daily') {
    reportType.value = type
    return api.generateReport(pairId, type)
  }

  async function loadLatest(pairId, type = 'daily') {
    reportType.value = type
    currentReport.value = await api.getLatestReport(pairId, type)
    return currentReport.value
  }

  async function loadHistory(pairId, type = 'daily', limit = 7) {
    reportHistory.value = await api.getReportHistory(pairId, type, limit)
  }

  return { currentReport, reportHistory, reportType, generate, loadLatest, loadHistory, reset }
})
