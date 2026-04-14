/**
 * Sync engine: on reconnect, replay queued offline actions in order.
 * Conflicting actions (e.g. already checked-in) are moved to the conflict inbox.
 */
import { ref } from 'vue'
import { defineStore } from 'pinia'
import {
  getPendingActions,
  removeAction,
  getQueueLength,
} from '@/shared/services/actionQueue'
import type { QueuedAction } from '@/shared/services/actionQueue'
import { arrivalsApi } from '@/modules/arrivals/api/arrivals.api'
import { inhouseApi } from '@/modules/inhouse/api/inhouse.api'
import type { CheckInPayload, NoShowPayload, MovePayload } from '@/modules/arrivals/types/arrival.types'
import type { CheckOutPayload, RoomMovePayload } from '@/modules/inhouse/types/inhouse.types'

export interface SyncConflict {
  action: QueuedAction
  error: string
  detectedAt: string
}

export const useSyncStore = defineStore('sync', () => {
  const isSyncing = ref(false)
  const queueLength = ref(0)
  const conflicts = ref<SyncConflict[]>([])
  const lastSyncAt = ref<string | null>(null)

  async function refreshQueueLength() {
    queueLength.value = await getQueueLength()
  }

  async function replayAction(action: QueuedAction): Promise<void> {
    switch (action.type) {
      case 'CHECK_IN': {
        const p = action.payload as CheckInPayload | undefined
        await arrivalsApi.checkIn(action.stayId, p)
        break
      }
      case 'NO_SHOW': {
        const p = action.payload as NoShowPayload
        await arrivalsApi.noShow(action.stayId, p)
        break
      }
      case 'MOVE': {
        const p = action.payload as MovePayload | RoomMovePayload
        await arrivalsApi.move(action.stayId, p as MovePayload)
        break
      }
      case 'CHECK_OUT': {
        const p = action.payload as CheckOutPayload | undefined
        await inhouseApi.checkOut(action.stayId, p)
        break
      }
    }
  }

  async function syncQueue(): Promise<void> {
    if (isSyncing.value || !navigator.onLine) return

    isSyncing.value = true

    try {
      const actions = await getPendingActions()

      for (const action of actions) {
        try {
          await replayAction(action)
          await removeAction(action.id)
        } catch (e) {
          conflicts.value.push({
            action,
            error: e instanceof Error ? e.message : 'Unknown error',
            detectedAt: new Date().toISOString(),
          })
          await removeAction(action.id)
        }
      }

      lastSyncAt.value = new Date().toISOString()
    } finally {
      isSyncing.value = false
      await refreshQueueLength()
    }
  }

  function dismissConflict(index: number) {
    conflicts.value.splice(index, 1)
  }

  function clearConflicts() {
    conflicts.value = []
  }

  return {
    isSyncing,
    queueLength,
    conflicts,
    lastSyncAt,
    syncQueue,
    refreshQueueLength,
    dismissConflict,
    clearConflicts,
  }
})
