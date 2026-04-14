import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type {
  Inspection,
  RoomInspection,
  InspectionSummary,
  MarkPresencePayload,
  AddUnexpectedPayload,
  DiscrepancyReason,
  PresenceStatus,
} from '../types/inspection.types'
import { inspectionApi } from '../api/inspection.api'

export const useInspectionStore = defineStore('inspection', () => {
  const inspection = ref<Inspection | null>(null)
  const isLoading = ref(false)
  const error = ref('')
  const currentRoomIndex = ref(0)

  const rooms = computed<RoomInspection[]>(() => inspection.value?.rooms ?? [])
  const currentRoom = computed<RoomInspection | null>(() => rooms.value[currentRoomIndex.value] ?? null)
  const summary = computed<InspectionSummary | null>(() => inspection.value?.summary ?? null)
  const totalRooms = computed(() => rooms.value.length)
  const isLastRoom = computed(() => currentRoomIndex.value >= totalRooms.value - 1)
  const isFirstRoom = computed(() => currentRoomIndex.value === 0)
  const allVerified = computed(() => rooms.value.every((r) => r.verified))

  async function startInspection(propertyId: string): Promise<void> {
    isLoading.value = true
    error.value = ''
    try {
      inspection.value = await inspectionApi.start({ propertyId })
      currentRoomIndex.value = 0
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to start inspection'
    } finally {
      isLoading.value = false
    }
  }

  async function loadInspection(id: string): Promise<void> {
    isLoading.value = true
    error.value = ''
    try {
      inspection.value = await inspectionApi.get(id)
      currentRoomIndex.value = 0
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load inspection'
    } finally {
      isLoading.value = false
    }
  }

  async function markPresence(
    stayId: string,
    presence: PresenceStatus,
    discrepancyReason?: DiscrepancyReason,
    discrepancyNote?: string,
  ): Promise<void> {
    if (!inspection.value) return
    const payload: MarkPresencePayload = { stayId, presence, discrepancyReason, discrepancyNote }
    inspection.value = await inspectionApi.markPresence(inspection.value.id, payload)
  }

  async function addUnexpected(
    roomId: string,
    description: string,
    reason: DiscrepancyReason,
    note?: string,
  ): Promise<void> {
    if (!inspection.value) return
    const payload: AddUnexpectedPayload = { roomId, description, reason, note }
    inspection.value = await inspectionApi.addUnexpected(inspection.value.id, payload)
  }

  async function verifyRoom(roomId: string): Promise<void> {
    if (!inspection.value) return
    inspection.value = await inspectionApi.verifyRoom(inspection.value.id, { roomId })
  }

  async function completeInspection(): Promise<void> {
    if (!inspection.value) return
    inspection.value = await inspectionApi.complete(inspection.value.id)
  }

  async function exportReport(format: 'csv' | 'pdf', lang: string): Promise<void> {
    if (!inspection.value) return
    const blob = await inspectionApi.exportReport(inspection.value.id, format, lang)
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `inspection-${inspection.value.id}.${format}`
    a.click()
    URL.revokeObjectURL(url)
  }

  function nextRoom() {
    if (!isLastRoom.value) currentRoomIndex.value++
  }

  function previousRoom() {
    if (!isFirstRoom.value) currentRoomIndex.value--
  }

  function goToRoom(index: number) {
    if (index >= 0 && index < totalRooms.value) currentRoomIndex.value = index
  }

  return {
    inspection,
    isLoading,
    error,
    currentRoomIndex,
    rooms,
    currentRoom,
    summary,
    totalRooms,
    isLastRoom,
    isFirstRoom,
    allVerified,
    startInspection,
    loadInspection,
    markPresence,
    addUnexpected,
    verifyRoom,
    completeInspection,
    exportReport,
    nextRoom,
    previousRoom,
    goToRoom,
  }
})
