import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type {
  Stay,
  GetStaysParams,
  StayStatus,
  BulkAssignPayload,
  BulkAssignResponse,
  StayCreatePayload,
  UpdateStayPayload,
} from '../types/stay.types'
import { staysApi } from '../api/stays.api'

export const useStaysStore = defineStore('stays', () => {
  const stays = ref<Stay[]>([])
  const currentStay = ref<Stay | null>(null)
  const isLoading = ref(false)
  const error = ref('')
  const page = ref(0)
  const totalPages = ref(0)
  const totalElements = ref(0)
  const size = ref(20)

  // Filters
  const statusFilter = ref<StayStatus | ''>('')
  const workerIdFilter = ref('')
  const propertyIdFilter = ref('')
  const dateFromFilter = ref('')
  const dateToFilter = ref('')

  // Cache
  const stayCache = ref<Map<string, Stay>>(new Map())

  const hasNextPage = computed(() => page.value < totalPages.value - 1)
  const hasPreviousPage = computed(() => page.value > 0)

  function buildParams(): GetStaysParams {
    const params: GetStaysParams = {
      page: page.value,
      size: size.value,
      sort: 'dateFrom,desc',
    }
    if (statusFilter.value) params.status = statusFilter.value
    if (workerIdFilter.value) params.workerId = workerIdFilter.value
    if (propertyIdFilter.value) params.propertyId = propertyIdFilter.value
    if (dateFromFilter.value) params.dateFrom = dateFromFilter.value
    if (dateToFilter.value) params.dateTo = dateToFilter.value
    return params
  }

  async function fetchStays() {
    isLoading.value = true
    error.value = ''
    try {
      const response = await staysApi.getStays(buildParams())
      stays.value = response.content
      totalPages.value = response.totalPages
      totalElements.value = response.totalElements
      for (const s of response.content) {
        stayCache.value.set(s.id, s)
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load stays'
    } finally {
      isLoading.value = false
    }
  }

  async function fetchStay(id: string) {
    const cached = stayCache.value.get(id)
    if (cached) {
      currentStay.value = cached
    }
    try {
      const stay = await staysApi.getStay(id)
      currentStay.value = stay
      stayCache.value.set(id, stay)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load stay'
    }
  }

  async function createStay(payload: StayCreatePayload): Promise<Stay> {
    const stay = await staysApi.createStay(payload)
    stayCache.value.set(stay.id, stay)
    return stay
  }

  async function updateStay(id: string, payload: UpdateStayPayload): Promise<Stay> {
    const stay = await staysApi.updateStay(id, payload)
    currentStay.value = stay
    stayCache.value.set(id, stay)
    return stay
  }

  async function cancelStay(id: string): Promise<void> {
    await staysApi.cancelStay(id)
    stayCache.value.delete(id)
    if (currentStay.value?.id === id) {
      currentStay.value = null
    }
  }

  async function bulkAssign(payload: BulkAssignPayload): Promise<BulkAssignResponse> {
    return staysApi.bulkAssign(payload)
  }

  function setPage(p: number) {
    page.value = p
    return fetchStays()
  }

  function resetFilters() {
    statusFilter.value = ''
    workerIdFilter.value = ''
    propertyIdFilter.value = ''
    dateFromFilter.value = ''
    dateToFilter.value = ''
    page.value = 0
  }

  return {
    stays,
    currentStay,
    isLoading,
    error,
    page,
    totalPages,
    totalElements,
    size,
    statusFilter,
    workerIdFilter,
    propertyIdFilter,
    dateFromFilter,
    dateToFilter,
    hasNextPage,
    hasPreviousPage,
    fetchStays,
    fetchStay,
    createStay,
    updateStay,
    cancelStay,
    bulkAssign,
    setPage,
    resetFilters,
  }
})
