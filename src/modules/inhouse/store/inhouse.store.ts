import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { RoomOccupancy, CheckOutPayload, RoomMovePayload, RoomOccupancyStatus } from '../types/inhouse.types'
import { inhouseApi } from '../api/inhouse.api'
import { usePropertiesStore } from '@/modules/properties/store/properties.store'
import { enqueueAction } from '@/shared/services/actionQueue'
import type { QueuedActionType } from '@/shared/services/actionQueue'
import { useSyncStore } from '@/modules/ops/store/sync.store'

export interface InHouseSummary {
  totalRooms: number
  totalCapacity: number
  totalOccupants: number
  overCapacityRooms: number
  nearCapacityRooms: number
  blockedRooms: number
}

export const useInHouseStore = defineStore('inhouse', () => {
  const rooms = ref<RoomOccupancy[]>([])
  const isLoading = ref(false)
  const error = ref('')
  const propertyIdFilter = ref('')

  function roomStatus(room: RoomOccupancy): RoomOccupancyStatus {
    const properties = usePropertiesStore()
    const roomDetail = properties.rooms.find((r) => r.id === room.roomId)
    if (roomDetail?.status === 'BLOCKED') return 'BLOCKED'
    if (room.occupiedSpots > room.bedCount) return 'OVER_CAPACITY'
    if (room.bedCount > 0 && room.occupiedSpots === room.bedCount) return 'NEAR_CAPACITY'
    return 'OK'
  }

  const summary = computed<InHouseSummary>(() => ({
    totalRooms: rooms.value.length,
    totalCapacity: rooms.value.reduce((sum, r) => sum + r.bedCount, 0),
    totalOccupants: rooms.value.reduce((sum, r) => sum + r.occupiedSpots, 0),
    overCapacityRooms: rooms.value.filter((r) => roomStatus(r) === 'OVER_CAPACITY').length,
    nearCapacityRooms: rooms.value.filter((r) => roomStatus(r) === 'NEAR_CAPACITY').length,
    blockedRooms: rooms.value.filter((r) => roomStatus(r) === 'BLOCKED').length,
  }))

  async function fetchInHouse() {
    if (!propertyIdFilter.value) return
    isLoading.value = true
    error.value = ''
    try {
      const properties = usePropertiesStore()
      await properties.fetchRooms(propertyIdFilter.value)
      rooms.value = await inhouseApi.getOccupancy(propertyIdFilter.value)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load occupancy'
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

  async function checkOut(stayId: string, payload?: CheckOutPayload): Promise<void> {
    if (!navigator.onLine) {
      await queueOffline('CHECK_OUT', stayId, payload ?? {})
      return
    }
    await inhouseApi.checkOut(stayId, payload)
    await fetchInHouse()
  }

  async function moveRoom(stayId: string, payload: RoomMovePayload): Promise<void> {
    if (!navigator.onLine) {
      await queueOffline('MOVE', stayId, payload)
      return
    }
    await inhouseApi.moveRoom(stayId, payload)
    await fetchInHouse()
  }

  async function bulkCheckout(stayIds: string[]): Promise<{ checkedOut: number; errors: number }> {
    const result = await inhouseApi.bulkCheckout(stayIds)
    await fetchInHouse()
    return result
  }

  async function exportData(lang: string): Promise<void> {
    const blob = await inhouseApi.exportOccupancy(propertyIdFilter.value, lang)
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `occupancy-${propertyIdFilter.value}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return {
    rooms,
    isLoading,
    error,
    propertyIdFilter,
    summary,
    roomStatus,
    fetchInHouse,
    checkOut,
    moveRoom,
    bulkCheckout,
    exportData,
  }
})
