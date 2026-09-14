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

  // Filters
  const propertyIdFilter = ref('')
  const dateFilter = ref(new Date().toISOString().slice(0, 10))

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
    }
  }

  async function fetchArrivals() {
    if (!propertyIdFilter.value) return
    isLoading.value = true
    error.value = ''
    try {
      arrivals.value = await arrivalsApi.getArrivals(buildParams())
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
        // The real move operation checks this stay out and creates a new one
        // in the target room — CHECKED_OUT is the closest local approximation
        // until the queued action replays and the real result comes back.
        const optimistic = { ...stay, status: 'CHECKED_OUT' as const }
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

  return {
    arrivals,
    isLoading,
    error,
    propertyIdFilter,
    dateFilter,
    checkedInCount,
    pendingCount,
    fetchArrivals,
    checkIn,
    noShow,
    move,
  }
})
