import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type {
  ArrivalStay,
  GetArrivalsParams,
  CheckInPayload,
  NoShowPayload,
  MovePayload,
} from '../types/arrival.types'
import { arrivalsApi } from '../api/arrivals.api'
import { enqueueAction } from '@/shared/services/actionQueue'
import type { QueuedActionType } from '@/shared/services/actionQueue'
import { useSyncStore } from '@/modules/ops/store/sync.store'

export const useArrivalsStore = defineStore('arrivals', () => {
  const arrivals = ref<ArrivalStay[]>([])
  const isLoading = ref(false)
  const error = ref('')
  const page = ref(0)
  const totalPages = ref(0)
  const totalElements = ref(0)
  const size = ref(50)

  // Filters
  const propertyIdFilter = ref('')
  const dateFilter = ref(new Date().toISOString().slice(0, 10))

  const hasNextPage = computed(() => page.value < totalPages.value - 1)
  const hasPreviousPage = computed(() => page.value > 0)

  const checkedInCount = computed(() =>
    arrivals.value.filter((a) => a.status === 'CHECKED_IN').length,
  )
  const pendingCount = computed(() =>
    arrivals.value.filter((a) => a.status === 'EXPECTED_TODAY').length,
  )

  function buildParams(): GetArrivalsParams {
    return {
      propertyId: propertyIdFilter.value,
      date: dateFilter.value,
      page: page.value,
      size: size.value,
    }
  }

  async function fetchArrivals() {
    if (!propertyIdFilter.value) return
    isLoading.value = true
    error.value = ''
    try {
      const response = await arrivalsApi.getArrivals(buildParams())
      arrivals.value = response.content
      totalPages.value = response.totalPages
      totalElements.value = response.totalElements
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load arrivals'
    } finally {
      isLoading.value = false
    }
  }

  // Queue an action and refresh the counter, so the offline banner reflects
  // the queue depth immediately rather than only on reconnect.
  async function queueOffline(type: QueuedActionType, stayId: string, payload: unknown) {
    await enqueueAction(type, stayId, payload)
    await useSyncStore().refreshQueueLength()
  }

  async function checkIn(stayId: string, payload?: CheckInPayload): Promise<ArrivalStay> {
    if (!navigator.onLine) {
      await queueOffline('CHECK_IN', stayId, payload ?? {})
      const stay = arrivals.value.find((a) => a.id === stayId)
      if (stay) {
        const optimistic = { ...stay, status: 'CHECKED_IN' as const }
        updateStayInList(stayId, optimistic)
        return optimistic
      }
      throw new Error('Arrival not found locally')
    }
    const updated = await arrivalsApi.checkIn(stayId, payload)
    updateStayInList(stayId, updated)
    return updated
  }

  async function noShow(stayId: string, payload: NoShowPayload): Promise<ArrivalStay> {
    if (!navigator.onLine) {
      await queueOffline('NO_SHOW', stayId, payload)
      const stay = arrivals.value.find((a) => a.id === stayId)
      if (stay) {
        const optimistic = { ...stay, status: 'NO_SHOW' as const }
        updateStayInList(stayId, optimistic)
        return optimistic
      }
      throw new Error('Arrival not found locally')
    }
    const updated = await arrivalsApi.noShow(stayId, payload)
    updateStayInList(stayId, updated)
    return updated
  }

  async function move(stayId: string, payload: MovePayload): Promise<ArrivalStay> {
    if (!navigator.onLine) {
      await queueOffline('MOVE', stayId, payload)
      const stay = arrivals.value.find((a) => a.id === stayId)
      if (stay) {
        const optimistic = { ...stay, status: 'MOVED' as const }
        updateStayInList(stayId, optimistic)
        return optimistic
      }
      throw new Error('Arrival not found locally')
    }
    const updated = await arrivalsApi.move(stayId, payload)
    updateStayInList(stayId, updated)
    return updated
  }

  function updateStayInList(stayId: string, updated: ArrivalStay) {
    const idx = arrivals.value.findIndex((a) => a.id === stayId)
    if (idx !== -1) {
      arrivals.value[idx] = updated
    }
  }

  function setPage(p: number) {
    page.value = p
    return fetchArrivals()
  }

  return {
    arrivals,
    isLoading,
    error,
    page,
    totalPages,
    totalElements,
    size,
    propertyIdFilter,
    dateFilter,
    hasNextPage,
    hasPreviousPage,
    checkedInCount,
    pendingCount,
    fetchArrivals,
    checkIn,
    noShow,
    move,
    setPage,
  }
})
