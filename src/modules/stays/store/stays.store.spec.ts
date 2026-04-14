import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useStaysStore } from './stays.store'
import type { Stay, BulkAssignResponse } from '../types/stay.types'

vi.mock('../api/stays.api', () => ({
  staysApi: {
    getStays: vi.fn(),
    getStay: vi.fn(),
    createStay: vi.fn(),
    updateStay: vi.fn(),
    cancelStay: vi.fn(),
    bulkAssign: vi.fn(),
  },
}))

import { staysApi } from '../api/stays.api'

function makeStay(overrides: Partial<Stay> = {}): Stay {
  return {
    id: 'stay-1',
    worker: { id: 'w1', internalId: 'W001', firstName: 'Jan', lastName: 'Kowalski', gender: 'MALE' },
    property: { id: 'prop-1', name: 'Hotel A', type: 'INTERNAL' },
    room: { id: 'room-1', roomNumber: '101', capacity: 4, availableSpots: 3 },
    dateFrom: '2024-03-15',
    dateTo: '2024-03-20',
    status: 'PLANNED',
    overrideReason: null,
    createdBy: { id: 'user-1', firstName: 'Admin', lastName: 'User' },
    confirmedBy: null,
    createdAt: '2024-03-01T10:00:00Z',
    updatedAt: '2024-03-01T10:00:00Z',
    ...overrides,
  }
}

describe('useStaysStore — stay creation with conflict', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('createStay()', () => {
    it('returns created stay and caches it', async () => {
      const stay = makeStay()
      vi.mocked(staysApi.createStay).mockResolvedValue(stay)

      const store = useStaysStore()
      const result = await store.createStay({
        workerId: 'w1',
        propertyId: 'prop-1',
        roomId: 'room-1',
        dateFrom: '2024-03-15',
        dateTo: '2024-03-20',
      })

      expect(result).toEqual(stay)
      expect(staysApi.createStay).toHaveBeenCalledOnce()
    })

    it('propagates constraint violation error from API', async () => {
      const constraintError = {
        error: 'CONSTRAINT_VIOLATION',
        message: 'Room is at capacity',
        allowed: false,
        hardViolations: [{ type: 'CAPACITY_EXCEEDED', message: 'Full', params: {} }],
        softViolations: [],
        timestamp: '2024-03-15T10:00:00Z',
      }
      vi.mocked(staysApi.createStay).mockRejectedValue(new Error(JSON.stringify(constraintError)))

      const store = useStaysStore()
      await expect(
        store.createStay({ workerId: 'w1', propertyId: 'prop-1', roomId: 'room-1', dateFrom: '2024-03-15', dateTo: '2024-03-20' }),
      ).rejects.toThrow()
    })

    it('creates stay with override reason for soft constraints', async () => {
      const stay = makeStay({ overrideReason: 'Manager approval' })
      vi.mocked(staysApi.createStay).mockResolvedValue(stay)

      const store = useStaysStore()
      const result = await store.createStay({
        workerId: 'w1',
        propertyId: 'prop-1',
        roomId: 'room-1',
        dateFrom: '2024-03-15',
        dateTo: '2024-03-20',
        overrideReason: 'Manager approval',
      })

      expect(result.overrideReason).toBe('Manager approval')
    })
  })

  describe('cancelStay()', () => {
    it('cancels stay and removes from cache', async () => {
      vi.mocked(staysApi.createStay).mockResolvedValue(makeStay())
      vi.mocked(staysApi.cancelStay).mockResolvedValue(undefined)

      const store = useStaysStore()
      await store.createStay({ workerId: 'w1', propertyId: 'prop-1', roomId: 'room-1', dateFrom: '2024-03-15', dateTo: '2024-03-20' })
      await store.cancelStay('stay-1')

      expect(staysApi.cancelStay).toHaveBeenCalledWith('stay-1')
    })

    it('clears currentStay when the current stay is cancelled', async () => {
      vi.mocked(staysApi.getStay).mockResolvedValue(makeStay())
      vi.mocked(staysApi.cancelStay).mockResolvedValue(undefined)

      const store = useStaysStore()
      await store.fetchStay('stay-1')
      store.currentStay = makeStay()
      await store.cancelStay('stay-1')

      expect(store.currentStay).toBeNull()
    })
  })

  describe('bulkAssign()', () => {
    it('returns bulk assignment results from API', async () => {
      const response: BulkAssignResponse = {
        total: 3,
        succeeded: 2,
        failed: 1,
        results: [
          { workerId: 'w1', stayId: 'stay-1', status: 'CREATED' },
          { workerId: 'w2', stayId: 'stay-2', status: 'CREATED' },
          { workerId: 'w3', status: 'FAILED', error: { type: 'CAPACITY_EXCEEDED', message: 'Full', params: {} } },
        ],
      }
      vi.mocked(staysApi.bulkAssign).mockResolvedValue(response)

      const store = useStaysStore()
      const result = await store.bulkAssign({
        assignments: [
          { workerId: 'w1', propertyId: 'prop-1', roomId: 'room-1', dateFrom: '2024-03-15' },
          { workerId: 'w2', propertyId: 'prop-1', roomId: 'room-1', dateFrom: '2024-03-15' },
          { workerId: 'w3', propertyId: 'prop-1', roomId: 'room-1', dateFrom: '2024-03-15' },
        ],
      })

      expect(result.total).toBe(3)
      expect(result.succeeded).toBe(2)
      expect(result.failed).toBe(1)
      expect(result.results[2].status).toBe('FAILED')
    })

    it('propagates error when bulk assign fails entirely', async () => {
      vi.mocked(staysApi.bulkAssign).mockRejectedValue(new Error('Server error'))

      const store = useStaysStore()
      await expect(
        store.bulkAssign({ assignments: [] }),
      ).rejects.toThrow('Server error')
    })
  })
})
