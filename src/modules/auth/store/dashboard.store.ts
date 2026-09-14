import { ref } from 'vue'
import { defineStore } from 'pinia'
import { dashboardApi } from '../api/dashboard.api'
import type { DashboardSummary } from '../types/dashboard.types'

export const useDashboardStore = defineStore('dashboard', () => {
  const summary = ref<DashboardSummary | null>(null)
  const isLoading = ref(false)
  const error = ref('')

  async function fetchSummary() {
    isLoading.value = true
    error.value = ''
    try {
      summary.value = await dashboardApi.getSummary()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load dashboard'
    } finally {
      isLoading.value = false
    }
  }

  return { summary, isLoading, error, fetchSummary }
})
