import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type {
  InHouseResponse,
  RoomOccupancy,
  OccupantStay,
  InHouseSummary,
  CheckOutPayload,
  RoomMovePayload,
  ExportFormat,
} from '../types/inhouse.types'
import { inhouseApi } from '../api/inhouse.api'

export const useInHouseStore = defineStore('inhouse', () => {
  const data = ref<InHouseResponse | null>(null)
  const isLoading = ref(false)
  const error = ref('')
  const propertyIdFilter = ref('')

  const rooms = computed<RoomOccupancy[]>(() => data.value?.rooms ?? [])
  const unassignedWorkers = computed<OccupantStay[]>(() => data.value?.unassignedWorkers ?? [])
  const summary = computed<InHouseSummary | null>(() => data.value?.summary ?? null)

  async function fetchInHouse() {
    if (!propertyIdFilter.value) return
    isLoading.value = true
    error.value = ''
    try {
      data.value = await inhouseApi.getInHouse(propertyIdFilter.value)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load occupancy'
    } finally {
      isLoading.value = false
    }
  }

  async function checkOut(stayId: string, payload?: CheckOutPayload): Promise<void> {
    await inhouseApi.checkOut(stayId, payload)
    await fetchInHouse()
  }

  async function moveRoom(stayId: string, payload: RoomMovePayload): Promise<void> {
    await inhouseApi.moveRoom(stayId, payload)
    await fetchInHouse()
  }

  async function exportData(format: ExportFormat, lang: string): Promise<void> {
    const blob = await inhouseApi.exportInHouse(propertyIdFilter.value, format, lang)
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `in-house-${propertyIdFilter.value}.${format}`
    a.click()
    URL.revokeObjectURL(url)
  }

  return {
    data,
    isLoading,
    error,
    propertyIdFilter,
    rooms,
    unassignedWorkers,
    summary,
    fetchInHouse,
    checkOut,
    moveRoom,
    exportData,
  }
})
