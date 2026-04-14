import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useSyncStore } from './sync.store'
import type { QueuedAction } from '@/shared/services/actionQueue'

vi.mock('@/shared/services/actionQueue', () => ({
  getPendingActions: vi.fn(),
  removeAction: vi.fn(),
  getQueueLength: vi.fn(),
}))

vi.mock('@/modules/arrivals/api/arrivals.api', () => ({
  arrivalsApi: {
    checkIn: vi.fn(),
    noShow: vi.fn(),
    move: vi.fn(),
    getArrivals: vi.fn(),
  },
}))

vi.mock('@/modules/inhouse/api/inhouse.api', () => ({
  inhouseApi: {
    checkOut: vi.fn(),
    getInHouse: vi.fn(),
    moveRoom: vi.fn(),
    exportInHouse: vi.fn(),
  },
}))

import { getPendingActions, removeAction, getQueueLength } from '@/shared/services/actionQueue'
import { arrivalsApi } from '@/modules/arrivals/api/arrivals.api'
import { inhouseApi } from '@/modules/inhouse/api/inhouse.api'
import type { ArrivalStay } from '@/modules/arrivals/types/arrival.types'

const mockArrivalStay: ArrivalStay = {
  id: 'stay-1',
  worker: { id: 'w1', internalId: 'W001', firstName: 'Jan', lastName: 'Kowalski', gender: 'MALE' },
  property: { id: 'prop-1', name: 'Hotel A', type: 'INTERNAL' },
  room: { id: 'room-1', roomNumber: '101', capacity: 4, availableSpots: 3 },
  dateFrom: '2024-03-15',
  dateTo: null,
  status: 'CHECKED_IN',
}

function makeAction(overrides: Partial<QueuedAction> = {}): QueuedAction {
  return {
    id: 'action-1',
    type: 'CHECK_IN',
    stayId: 'stay-1',
    payload: {},
    queuedAt: '2024-03-15T10:00:00Z',
    ...overrides,
  }
}

describe('useSyncStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    Object.defineProperty(navigator, 'onLine', { value: true, configurable: true })
    vi.mocked(getQueueLength).mockResolvedValue(0)
    vi.mocked(removeAction).mockResolvedValue(undefined)
  })

  afterEach(() => {
    Object.defineProperty(navigator, 'onLine', { value: true, configurable: true })
  })

  describe('initial state', () => {
    it('starts with empty queue and no conflicts', () => {
      const store = useSyncStore()
      expect(store.isSyncing).toBe(false)
      expect(store.queueLength).toBe(0)
      expect(store.conflicts).toHaveLength(0)
      expect(store.lastSyncAt).toBeNull()
    })
  })

  describe('syncQueue()', () => {
    it('replays queued CHECK_IN action', async () => {
      vi.mocked(getPendingActions).mockResolvedValue([makeAction({ type: 'CHECK_IN', stayId: 'stay-1' })])
      vi.mocked(arrivalsApi.checkIn).mockResolvedValue(mockArrivalStay)
      vi.mocked(getQueueLength).mockResolvedValue(0)

      const store = useSyncStore()
      const result = await store.syncQueue()

      expect(arrivalsApi.checkIn).toHaveBeenCalledWith('stay-1', {})
      expect(removeAction).toHaveBeenCalledWith('action-1')
      expect(result.synced).toBe(1)
      expect(result.conflicted).toBe(0)
      expect(store.lastSyncAt).not.toBeNull()
    })

    it('replays queued NO_SHOW action', async () => {
      const action = makeAction({ type: 'NO_SHOW', stayId: 'stay-2', payload: { reason: 'DID_NOT_ARRIVE' } })
      vi.mocked(getPendingActions).mockResolvedValue([action])
      vi.mocked(arrivalsApi.noShow).mockResolvedValue(mockArrivalStay)

      const store = useSyncStore()
      const result = await store.syncQueue()

      expect(arrivalsApi.noShow).toHaveBeenCalledWith('stay-2', { reason: 'DID_NOT_ARRIVE' })
      expect(result.synced).toBe(1)
    })

    it('replays queued CHECK_OUT action', async () => {
      const action = makeAction({ type: 'CHECK_OUT', stayId: 'stay-3', payload: { note: 'Early checkout' } })
      vi.mocked(getPendingActions).mockResolvedValue([action])
      vi.mocked(inhouseApi.checkOut).mockResolvedValue(undefined)

      const store = useSyncStore()
      const result = await store.syncQueue()

      expect(inhouseApi.checkOut).toHaveBeenCalledWith('stay-3', { note: 'Early checkout' })
      expect(result.synced).toBe(1)
    })

    it('replays queued MOVE action', async () => {
      const action = makeAction({ type: 'MOVE', stayId: 'stay-4', payload: { targetPropertyId: 'p2', targetRoomId: 'r2' } })
      vi.mocked(getPendingActions).mockResolvedValue([action])
      vi.mocked(arrivalsApi.move).mockResolvedValue(mockArrivalStay)

      const store = useSyncStore()
      const result = await store.syncQueue()

      expect(arrivalsApi.move).toHaveBeenCalledWith('stay-4', { targetPropertyId: 'p2', targetRoomId: 'r2' })
      expect(result.synced).toBe(1)
    })

    it('moves failed action to conflict inbox', async () => {
      vi.mocked(getPendingActions).mockResolvedValue([makeAction()])
      vi.mocked(arrivalsApi.checkIn).mockRejectedValue(new Error('Already checked in'))

      const store = useSyncStore()
      const result = await store.syncQueue()

      expect(result.synced).toBe(0)
      expect(result.conflicted).toBe(1)
      expect(store.conflicts).toHaveLength(1)
      expect(store.conflicts[0].error).toBe('Already checked in')
      expect(store.conflicts[0].action.id).toBe('action-1')
      // Still removed from queue after conflict
      expect(removeAction).toHaveBeenCalledWith('action-1')
    })

    it('handles mixed success and conflict', async () => {
      const actions = [
        makeAction({ id: 'a1', stayId: 'stay-1' }),
        makeAction({ id: 'a2', stayId: 'stay-2' }),
      ]
      vi.mocked(getPendingActions).mockResolvedValue(actions)
      vi.mocked(arrivalsApi.checkIn)
        .mockResolvedValueOnce(mockArrivalStay)
        .mockRejectedValueOnce(new Error('Conflict'))

      const store = useSyncStore()
      const result = await store.syncQueue()

      expect(result.synced).toBe(1)
      expect(result.conflicted).toBe(1)
      expect(store.conflicts).toHaveLength(1)
    })

    it('does nothing when offline', async () => {
      Object.defineProperty(navigator, 'onLine', { value: false, configurable: true })

      const store = useSyncStore()
      const result = await store.syncQueue()

      expect(getPendingActions).not.toHaveBeenCalled()
      expect(result.synced).toBe(0)
      expect(result.conflicted).toBe(0)
    })

    it('does not run concurrently when already syncing', async () => {
      vi.mocked(getPendingActions).mockResolvedValue([])

      const store = useSyncStore()
      store.isSyncing = true

      const result = await store.syncQueue()

      expect(getPendingActions).not.toHaveBeenCalled()
      expect(result.synced).toBe(0)
    })

    it('resets isSyncing to false after completion', async () => {
      vi.mocked(getPendingActions).mockResolvedValue([])

      const store = useSyncStore()
      await store.syncQueue()

      expect(store.isSyncing).toBe(false)
    })

    it('resets isSyncing to false on error', async () => {
      vi.mocked(getPendingActions).mockRejectedValue(new Error('IDB failure'))

      const store = useSyncStore()
      await expect(store.syncQueue()).rejects.toThrow('IDB failure')
      expect(store.isSyncing).toBe(false)
    })
  })

  describe('dismissConflict()', () => {
    it('removes conflict at the given index', async () => {
      vi.mocked(getPendingActions).mockResolvedValue([makeAction()])
      vi.mocked(arrivalsApi.checkIn).mockRejectedValue(new Error('Error'))

      const store = useSyncStore()
      await store.syncQueue()
      expect(store.conflicts).toHaveLength(1)

      store.dismissConflict(0)
      expect(store.conflicts).toHaveLength(0)
    })
  })

  describe('clearConflicts()', () => {
    it('removes all conflicts', async () => {
      vi.mocked(getPendingActions).mockResolvedValue([
        makeAction({ id: 'a1' }),
        makeAction({ id: 'a2' }),
      ])
      vi.mocked(arrivalsApi.checkIn).mockRejectedValue(new Error('Error'))

      const store = useSyncStore()
      await store.syncQueue()
      expect(store.conflicts.length).toBeGreaterThan(0)

      store.clearConflicts()
      expect(store.conflicts).toHaveLength(0)
    })
  })

  describe('refreshQueueLength()', () => {
    it('updates queueLength from IndexedDB', async () => {
      vi.mocked(getQueueLength).mockResolvedValue(3)

      const store = useSyncStore()
      await store.refreshQueueLength()

      expect(store.queueLength).toBe(3)
    })
  })
})
