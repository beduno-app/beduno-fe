import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useArrivalsStore } from './arrivals.store'
import type { ArrivalStay } from '../types/arrival.types'

// Mock the API and actionQueue modules
vi.mock('../api/arrivals.api', () => ({
  arrivalsApi: {
    getArrivals: vi.fn(),
    checkIn: vi.fn(),
    noShow: vi.fn(),
    move: vi.fn(),
  },
}))

vi.mock('@/shared/services/actionQueue', () => ({
  enqueueAction: vi.fn(),
}))

import { arrivalsApi } from '../api/arrivals.api'
import { enqueueAction } from '@/shared/services/actionQueue'

function makeArrival(overrides: Partial<ArrivalStay> = {}): ArrivalStay {
  return {
    id: 'stay-1',
    worker: { id: 'w1', internalId: 'W001', firstName: 'Jan', lastName: 'Kowalski', gender: 'MALE' },
    property: { id: 'prop-1', name: 'Hotel A', type: 'INTERNAL' },
    room: { id: 'room-1', roomNumber: '101', capacity: 4, availableSpots: 3 },
    dateFrom: '2024-03-15',
    dateTo: null,
    status: 'EXPECTED_TODAY',
    ...overrides,
  }
}

describe('useArrivalsStore — stay status transitions', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    // Default to online
    Object.defineProperty(navigator, 'onLine', { value: true, configurable: true })
  })

  afterEach(() => {
    Object.defineProperty(navigator, 'onLine', { value: true, configurable: true })
  })

  describe('checkIn (online)', () => {
    it('calls API and updates status to CHECKED_IN', async () => {
      const store = useArrivalsStore()
      const arrival = makeArrival()
      store.arrivals = [arrival]

      const updated = makeArrival({ status: 'CHECKED_IN' })
      vi.mocked(arrivalsApi.checkIn).mockResolvedValue(updated)

      const result = await store.checkIn('stay-1')

      expect(arrivalsApi.checkIn).toHaveBeenCalledWith('stay-1', undefined)
      expect(result.status).toBe('CHECKED_IN')
      expect(store.arrivals[0].status).toBe('CHECKED_IN')
    })

    it('passes qrCode payload to API', async () => {
      const store = useArrivalsStore()
      store.arrivals = [makeArrival()]
      vi.mocked(arrivalsApi.checkIn).mockResolvedValue(makeArrival({ status: 'CHECKED_IN' }))

      await store.checkIn('stay-1', { qrCode: 'beduno:w1:abcd' })

      expect(arrivalsApi.checkIn).toHaveBeenCalledWith('stay-1', { qrCode: 'beduno:w1:abcd' })
    })
  })

  describe('checkIn (offline)', () => {
    it('enqueues action and optimistically updates status', async () => {
      Object.defineProperty(navigator, 'onLine', { value: false, configurable: true })
      vi.mocked(enqueueAction).mockResolvedValue({
        id: 'q1', type: 'CHECK_IN', stayId: 'stay-1', payload: {}, queuedAt: new Date().toISOString(),
      })

      const store = useArrivalsStore()
      store.arrivals = [makeArrival()]

      const result = await store.checkIn('stay-1')

      expect(enqueueAction).toHaveBeenCalledWith('CHECK_IN', 'stay-1', {})
      expect(result.status).toBe('CHECKED_IN')
      expect(store.arrivals[0].status).toBe('CHECKED_IN')
      expect(arrivalsApi.checkIn).not.toHaveBeenCalled()
    })

    it('throws when arrival not found locally', async () => {
      Object.defineProperty(navigator, 'onLine', { value: false, configurable: true })
      vi.mocked(enqueueAction).mockResolvedValue({
        id: 'q1', type: 'CHECK_IN', stayId: 'stay-99', payload: {}, queuedAt: new Date().toISOString(),
      })

      const store = useArrivalsStore()
      store.arrivals = []

      await expect(store.checkIn('stay-99')).rejects.toThrow('Arrival not found locally')
    })
  })

  describe('noShow (online)', () => {
    it('calls API and updates status to NO_SHOW', async () => {
      const store = useArrivalsStore()
      store.arrivals = [makeArrival()]
      const updated = makeArrival({ status: 'NO_SHOW' })
      vi.mocked(arrivalsApi.noShow).mockResolvedValue(updated)

      const result = await store.noShow('stay-1', { reason: 'DID_NOT_ARRIVE' })

      expect(arrivalsApi.noShow).toHaveBeenCalledWith('stay-1', { reason: 'DID_NOT_ARRIVE' })
      expect(result.status).toBe('NO_SHOW')
      expect(store.arrivals[0].status).toBe('NO_SHOW')
    })
  })

  describe('noShow (offline)', () => {
    it('enqueues NO_SHOW action and updates status optimistically', async () => {
      Object.defineProperty(navigator, 'onLine', { value: false, configurable: true })
      vi.mocked(enqueueAction).mockResolvedValue({
        id: 'q2', type: 'NO_SHOW', stayId: 'stay-1', payload: { reason: 'REFUSED_ROOM' }, queuedAt: new Date().toISOString(),
      })

      const store = useArrivalsStore()
      store.arrivals = [makeArrival()]

      const result = await store.noShow('stay-1', { reason: 'REFUSED_ROOM' })

      expect(enqueueAction).toHaveBeenCalledWith('NO_SHOW', 'stay-1', { reason: 'REFUSED_ROOM' })
      expect(result.status).toBe('NO_SHOW')
    })
  })

  describe('move (online)', () => {
    it('calls API and updates status to MOVED', async () => {
      const store = useArrivalsStore()
      store.arrivals = [makeArrival()]
      const updated = makeArrival({ status: 'MOVED' })
      vi.mocked(arrivalsApi.move).mockResolvedValue(updated)

      const result = await store.move('stay-1', { targetPropertyId: 'prop-2', targetRoomId: 'room-2' })

      expect(arrivalsApi.move).toHaveBeenCalledWith('stay-1', { targetPropertyId: 'prop-2', targetRoomId: 'room-2' })
      expect(result.status).toBe('MOVED')
      expect(store.arrivals[0].status).toBe('MOVED')
    })
  })

  describe('move (offline)', () => {
    it('enqueues MOVE action and updates status optimistically', async () => {
      Object.defineProperty(navigator, 'onLine', { value: false, configurable: true })
      vi.mocked(enqueueAction).mockResolvedValue({
        id: 'q3', type: 'MOVE', stayId: 'stay-1', payload: { targetPropertyId: 'prop-2', targetRoomId: 'room-2' }, queuedAt: new Date().toISOString(),
      })

      const store = useArrivalsStore()
      store.arrivals = [makeArrival()]

      const result = await store.move('stay-1', { targetPropertyId: 'prop-2', targetRoomId: 'room-2' })

      expect(enqueueAction).toHaveBeenCalledWith('MOVE', 'stay-1', { targetPropertyId: 'prop-2', targetRoomId: 'room-2' })
      expect(result.status).toBe('MOVED')
    })
  })

  describe('fetchArrivals', () => {
    it('loads arrivals and updates pagination state', async () => {
      const store = useArrivalsStore()
      store.propertyIdFilter = 'prop-1'
      vi.mocked(arrivalsApi.getArrivals).mockResolvedValue({
        content: [makeArrival()],
        totalPages: 2,
        totalElements: 51,
        size: 50,
        page: 0,
      })

      await store.fetchArrivals()

      expect(store.arrivals).toHaveLength(1)
      expect(store.totalPages).toBe(2)
      expect(store.totalElements).toBe(51)
      expect(store.isLoading).toBe(false)
    })

    it('does nothing when no property is selected', async () => {
      const store = useArrivalsStore()
      store.propertyIdFilter = ''

      await store.fetchArrivals()

      expect(arrivalsApi.getArrivals).not.toHaveBeenCalled()
    })

    it('sets error state on API failure', async () => {
      const store = useArrivalsStore()
      store.propertyIdFilter = 'prop-1'
      vi.mocked(arrivalsApi.getArrivals).mockRejectedValue(new Error('Network error'))

      await store.fetchArrivals()

      expect(store.error).toBe('Network error')
      expect(store.isLoading).toBe(false)
    })
  })

  describe('computed counts', () => {
    it('counts pending and checked-in arrivals correctly', () => {
      const store = useArrivalsStore()
      store.arrivals = [
        makeArrival({ id: 's1', status: 'EXPECTED_TODAY' }),
        makeArrival({ id: 's2', status: 'EXPECTED_TODAY' }),
        makeArrival({ id: 's3', status: 'CHECKED_IN' }),
        makeArrival({ id: 's4', status: 'NO_SHOW' }),
      ]

      expect(store.pendingCount).toBe(2)
      expect(store.checkedInCount).toBe(1)
    })
  })
})
