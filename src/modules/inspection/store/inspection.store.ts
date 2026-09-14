import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { InspectionRoomEntry, InspectionReportPayload, RoomDiscrepancy } from '../types/inspection.types'
import { inspectionApi } from '../api/inspection.api'

export interface InspectionSummary {
  totalRooms: number
  verifiedRooms: number
  totalExpected: number
  presentCount: number
  absentCount: number
  unexpectedCount: number
  discrepancyCount: number
}

// The real API has no inspection "session" — it's a roster read (present
// occupancy per room) followed by a single report submission for the whole
// property, which returns computed discrepancies. Presence marking during the
// walkthrough is local-only state until that final submit.
export const useInspectionStore = defineStore('inspection', () => {
  const propertyId = ref('')
  const date = ref('')
  const rooms = ref<InspectionRoomEntry[]>([])
  const presentByRoom = ref<Map<string, Set<string>>>(new Map())
  const verifiedRooms = ref<Set<string>>(new Set())
  const currentRoomIndex = ref(0)
  const isLoading = ref(false)
  const error = ref('')
  const discrepancies = ref<RoomDiscrepancy[] | null>(null)
  const completedAt = ref<string | null>(null)

  const currentRoom = computed<InspectionRoomEntry | null>(() => rooms.value[currentRoomIndex.value] ?? null)
  const totalRooms = computed(() => rooms.value.length)
  const isLastRoom = computed(() => currentRoomIndex.value >= totalRooms.value - 1)
  const isFirstRoom = computed(() => currentRoomIndex.value === 0)
  const allVerified = computed(
    () => rooms.value.length > 0 && rooms.value.every((r) => verifiedRooms.value.has(r.roomId)),
  )

  const summary = computed<InspectionSummary>(() => {
    let totalExpected = 0
    let presentCount = 0
    let unexpectedCount = 0
    for (const room of rooms.value) {
      const present = presentByRoom.value.get(room.roomId) ?? new Set<string>()
      const expectedIds = new Set(room.expectedOccupants.map((o) => o.workerId))
      totalExpected += room.expectedOccupants.length
      presentCount += room.expectedOccupants.filter((o) => present.has(o.workerId)).length
      for (const workerId of present) {
        if (!expectedIds.has(workerId)) unexpectedCount++
      }
    }
    return {
      totalRooms: rooms.value.length,
      verifiedRooms: verifiedRooms.value.size,
      totalExpected,
      presentCount,
      absentCount: totalExpected - presentCount,
      unexpectedCount,
      discrepancyCount: discrepancies.value?.reduce((sum, d) => sum + d.items.length, 0) ?? 0,
    }
  })

  function isPresent(roomId: string, workerId: string): boolean {
    return presentByRoom.value.get(roomId)?.has(workerId) ?? false
  }

  function isRoomVerified(roomId: string): boolean {
    return verifiedRooms.value.has(roomId)
  }

  function presentSet(roomId: string): Set<string> {
    return presentByRoom.value.get(roomId) ?? new Set<string>()
  }

  function unexpectedWorkerIds(roomId: string): string[] {
    const room = rooms.value.find((r) => r.roomId === roomId)
    if (!room) return []
    const present = presentByRoom.value.get(roomId) ?? new Set<string>()
    const expectedIds = new Set(room.expectedOccupants.map((o) => o.workerId))
    return [...present].filter((id) => !expectedIds.has(id))
  }

  async function startInspection(pid: string, forDate?: string): Promise<void> {
    propertyId.value = pid
    date.value = forDate ?? new Date().toISOString().slice(0, 10)
    isLoading.value = true
    error.value = ''
    try {
      rooms.value = await inspectionApi.getRoster(pid, date.value)
      presentByRoom.value = new Map(
        rooms.value.map((r) => [r.roomId, new Set(r.checkedInOccupants.map((o) => o.workerId))]),
      )
      verifiedRooms.value = new Set()
      currentRoomIndex.value = 0
      discrepancies.value = null
      completedAt.value = null
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load inspection roster'
    } finally {
      isLoading.value = false
    }
  }

  function markPresence(roomId: string, workerId: string, present: boolean) {
    const set = presentByRoom.value.get(roomId) ?? new Set<string>()
    if (present) {
      set.add(workerId)
    } else {
      set.delete(workerId)
    }
    presentByRoom.value.set(roomId, set)
  }

  function addUnexpectedWorker(roomId: string, workerId: string) {
    markPresence(roomId, workerId, true)
  }

  function removeUnexpectedWorker(roomId: string, workerId: string) {
    markPresence(roomId, workerId, false)
  }

  function verifyRoom(roomId: string) {
    verifiedRooms.value.add(roomId)
  }

  async function completeInspection(): Promise<void> {
    const payload: InspectionReportPayload = {
      rooms: rooms.value.map((r) => ({
        roomId: r.roomId,
        presentWorkerIds: [...(presentByRoom.value.get(r.roomId) ?? [])],
      })),
    }
    const result = await inspectionApi.submitReport(propertyId.value, payload, date.value)
    discrepancies.value = result.discrepancies
    completedAt.value = new Date().toISOString()
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
    propertyId,
    date,
    rooms,
    isLoading,
    error,
    currentRoomIndex,
    currentRoom,
    summary,
    discrepancies,
    completedAt,
    totalRooms,
    isLastRoom,
    isFirstRoom,
    allVerified,
    isPresent,
    isRoomVerified,
    presentSet,
    unexpectedWorkerIds,
    startInspection,
    markPresence,
    addUnexpectedWorker,
    removeUnexpectedWorker,
    verifyRoom,
    completeInspection,
    nextRoom,
    previousRoom,
    goToRoom,
  }
})
