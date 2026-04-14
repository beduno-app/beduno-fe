import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { Worker, GetWorkersParams, WorkerStatus, Gender } from '../types/worker.types'
import { workersApi } from '../api/workers.api'

export const useWorkersStore = defineStore('workers', () => {
  const workers = ref<Worker[]>([])
  const currentWorker = ref<Worker | null>(null)
  const isLoading = ref(false)
  const error = ref('')
  const page = ref(0)
  const totalPages = ref(0)
  const totalElements = ref(0)
  const size = ref(20)

  // Filters
  const search = ref('')
  const statusFilter = ref<WorkerStatus | ''>('')
  const genderFilter = ref<Gender | ''>('')
  const tagFilter = ref('')

  // Cache
  const workerCache = ref<Map<string, Worker>>(new Map())

  const hasNextPage = computed(() => page.value < totalPages.value - 1)
  const hasPreviousPage = computed(() => page.value > 0)

  function buildParams(): GetWorkersParams {
    const params: GetWorkersParams = {
      page: page.value,
      size: size.value,
      sort: 'lastName,asc',
    }
    if (search.value) params.search = search.value
    if (statusFilter.value) params.status = statusFilter.value
    if (genderFilter.value) params.gender = genderFilter.value
    if (tagFilter.value) params.tag = tagFilter.value
    return params
  }

  async function fetchWorkers() {
    isLoading.value = true
    error.value = ''
    try {
      const response = await workersApi.getWorkers(buildParams())
      workers.value = response.content
      totalPages.value = response.totalPages
      totalElements.value = response.totalElements
      for (const w of response.content) {
        workerCache.value.set(w.id, w)
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load workers'
    } finally {
      isLoading.value = false
    }
  }

  async function fetchWorker(id: string) {
    const cached = workerCache.value.get(id)
    if (cached) {
      currentWorker.value = cached
    }
    try {
      const worker = await workersApi.getWorker(id)
      currentWorker.value = worker
      workerCache.value.set(id, worker)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load worker'
    }
  }

  function setPage(p: number) {
    page.value = p
    return fetchWorkers()
  }

  function resetFilters() {
    search.value = ''
    statusFilter.value = ''
    genderFilter.value = ''
    tagFilter.value = ''
    page.value = 0
  }

  return {
    workers,
    currentWorker,
    isLoading,
    error,
    page,
    totalPages,
    totalElements,
    size,
    search,
    statusFilter,
    genderFilter,
    tagFilter,
    hasNextPage,
    hasPreviousPage,
    fetchWorkers,
    fetchWorker,
    setPage,
    resetFilters,
  }
})
