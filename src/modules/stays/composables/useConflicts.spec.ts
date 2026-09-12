import { describe, it, expect, beforeEach } from 'vitest'
import { useConflicts } from './useConflicts'
import type { Room } from '@/modules/properties/types/property.types'
import type { Worker } from '@/modules/workers/types/worker.types'
import type { ConstraintViolation, HardConstraintType } from '../types/stay.types'

function makeRoom(overrides: Partial<Room> = {}): Room {
  return {
    id: 'room-1',
    propertyId: 'prop-1',
    roomNumber: '101',
    capacity: 4,
    blockedSpots: 0,
    availableSpots: 4,
    currentOccupancy: 0,
    genderRule: 'MIXED',
    floor: 1,
    status: 'ACTIVE',
    notes: '',
    occupants: [],
    createdAt: '2024-01-01T00:00:00Z',
    ...overrides,
  }
}

function makeWorker(overrides: Partial<Worker> = {}): Worker {
  return {
    id: 'worker-1',
    internalId: 'W001',
    firstName: 'Jan',
    lastName: 'Kowalski',
    phone: '+48123456789',
    gender: 'MALE',
    tags: [],
    notes: '',
    status: 'ACTIVE',
    currentStay: null,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    ...overrides,
  }
}

describe('useConflicts', () => {
  let conflicts: ReturnType<typeof useConflicts>

  beforeEach(() => {
    conflicts = useConflicts()
  })

  describe('initial state', () => {
    it('starts with no violations', () => {
      expect(conflicts.hardViolations.value).toHaveLength(0)
      expect(conflicts.softViolations.value).toHaveLength(0)
      expect(conflicts.hasHardViolations.value).toBe(false)
      expect(conflicts.hasSoftViolations.value).toBe(false)
      expect(conflicts.hasAnyViolations.value).toBe(false)
      expect(conflicts.isBlocked.value).toBe(false)
    })
  })

  describe('validate()', () => {
    it('returns true with no violations for a clean assignment', () => {
      const result = conflicts.validate({
        worker: makeWorker(),
        room: makeRoom(),
        propertyStatus: 'ACTIVE',
      })
      expect(result).toBe(true)
      expect(conflicts.hasAnyViolations.value).toBe(false)
    })

    it('returns true when worker and room are null', () => {
      const result = conflicts.validate({ worker: null, room: null })
      expect(result).toBe(true)
    })

    it('clears previous violations on each call', () => {
      conflicts.validate({
        worker: makeWorker({ currentStay: { propertyId: 'p1', propertyName: 'P1', roomNumber: '1', since: '2024-01-01' } }),
        room: makeRoom(),
      })
      expect(conflicts.hardViolations.value.length).toBeGreaterThan(0)

      conflicts.validate({ worker: makeWorker(), room: makeRoom() })
      expect(conflicts.hardViolations.value).toHaveLength(0)
    })
  })

  describe('checkCapacity', () => {
    it('adds CAPACITY_EXCEEDED hard violation when room is full', () => {
      const room = makeRoom({ availableSpots: 0, capacity: 2, currentOccupancy: 2 })
      conflicts.validate({ worker: makeWorker(), room })
      const violation = conflicts.hardViolations.value.find((v) => v.type === 'CAPACITY_EXCEEDED')
      expect(violation).toBeDefined()
      expect(violation?.params.roomNumber).toBe('101')
    })

    it('does not add violation when spots are available', () => {
      conflicts.validate({ worker: makeWorker(), room: makeRoom({ availableSpots: 1 }) })
      expect(conflicts.hardViolations.value.find((v) => v.type === 'CAPACITY_EXCEEDED')).toBeUndefined()
    })
  })

  describe('checkRoomBlocked', () => {
    it('adds ROOM_BLOCKED hard violation for a blocked room', () => {
      const room = makeRoom({ status: 'BLOCKED' })
      conflicts.validate({ worker: makeWorker(), room })
      expect(conflicts.hardViolations.value.find((v) => v.type === 'ROOM_BLOCKED')).toBeDefined()
    })

    it('does not add violation for an active room', () => {
      conflicts.validate({ worker: makeWorker(), room: makeRoom({ status: 'ACTIVE' }) })
      expect(conflicts.hardViolations.value.find((v) => v.type === 'ROOM_BLOCKED')).toBeUndefined()
    })
  })

  describe('checkPropertyBlocked', () => {
    it('adds PROPERTY_BLOCKED hard violation for inactive property', () => {
      conflicts.validate({ worker: makeWorker(), room: makeRoom(), propertyStatus: 'INACTIVE' })
      expect(conflicts.hardViolations.value.find((v) => v.type === 'PROPERTY_BLOCKED')).toBeDefined()
    })

    it('does not add violation for active property', () => {
      conflicts.validate({ worker: makeWorker(), room: makeRoom(), propertyStatus: 'ACTIVE' })
      expect(conflicts.hardViolations.value.find((v) => v.type === 'PROPERTY_BLOCKED')).toBeUndefined()
    })

    it('does not add violation when property status is undefined', () => {
      conflicts.validate({ worker: makeWorker(), room: makeRoom() })
      expect(conflicts.hardViolations.value.find((v) => v.type === 'PROPERTY_BLOCKED')).toBeUndefined()
    })
  })

  describe('checkDoubleBooking', () => {
    it('adds DOUBLE_BOOKING hard violation when worker has a current stay', () => {
      const worker = makeWorker({
        currentStay: { propertyId: 'p1', propertyName: 'Hotel A', roomNumber: '202', since: '2024-01-01' },
      })
      conflicts.validate({ worker, room: makeRoom() })
      const violation = conflicts.hardViolations.value.find((v) => v.type === 'DOUBLE_BOOKING')
      expect(violation).toBeDefined()
      expect(violation?.params.currentProperty).toBe('Hotel A')
    })

    it('does not add violation when worker has no current stay', () => {
      conflicts.validate({ worker: makeWorker({ currentStay: null }), room: makeRoom() })
      expect(conflicts.hardViolations.value.find((v) => v.type === 'DOUBLE_BOOKING')).toBeUndefined()
    })
  })

  describe('checkGender', () => {
    it('adds GENDER_MISMATCH soft violation for female worker in male-only room', () => {
      const worker = makeWorker({ gender: 'FEMALE' })
      const room = makeRoom({ genderRule: 'MALE_ONLY' })
      conflicts.validate({ worker, room })
      expect(conflicts.softViolations.value.find((v) => v.type === 'GENDER_MISMATCH')).toBeDefined()
    })

    it('adds GENDER_MISMATCH soft violation for male worker in female-only room', () => {
      const worker = makeWorker({ gender: 'MALE' })
      const room = makeRoom({ genderRule: 'FEMALE_ONLY' })
      conflicts.validate({ worker, room })
      expect(conflicts.softViolations.value.find((v) => v.type === 'GENDER_MISMATCH')).toBeDefined()
    })

    it('does not add violation for matching gender', () => {
      const worker = makeWorker({ gender: 'MALE' })
      const room = makeRoom({ genderRule: 'MALE_ONLY' })
      conflicts.validate({ worker, room })
      expect(conflicts.softViolations.value.find((v) => v.type === 'GENDER_MISMATCH')).toBeUndefined()
    })

    it('does not add violation for OTHER gender in gender-restricted room', () => {
      const worker = makeWorker({ gender: 'OTHER' })
      const room = makeRoom({ genderRule: 'MALE_ONLY' })
      conflicts.validate({ worker, room })
      expect(conflicts.softViolations.value.find((v) => v.type === 'GENDER_MISMATCH')).toBeUndefined()
    })

    it('does not add violation for mixed room regardless of gender', () => {
      const worker = makeWorker({ gender: 'FEMALE' })
      const room = makeRoom({ genderRule: 'MIXED' })
      conflicts.validate({ worker, room })
      expect(conflicts.softViolations.value.find((v) => v.type === 'GENDER_MISMATCH')).toBeUndefined()
    })
  })

  describe('checkBlacklisted', () => {
    it('adds WORKER_BLACKLISTED soft violation for blacklisted worker', () => {
      const worker = makeWorker({ status: 'BLACKLISTED' })
      conflicts.validate({ worker, room: makeRoom() })
      expect(conflicts.softViolations.value.find((v) => v.type === 'WORKER_BLACKLISTED')).toBeDefined()
    })

    it('does not add violation for active worker', () => {
      conflicts.validate({ worker: makeWorker({ status: 'ACTIVE' }), room: makeRoom() })
      expect(conflicts.softViolations.value.find((v) => v.type === 'WORKER_BLACKLISTED')).toBeUndefined()
    })
  })

  describe('isBlocked computed', () => {
    it('is true when there are hard violations', () => {
      conflicts.validate({ worker: makeWorker(), room: makeRoom({ availableSpots: 0 }) })
      expect(conflicts.isBlocked.value).toBe(true)
    })

    it('is false when there are only soft violations', () => {
      const worker = makeWorker({ gender: 'FEMALE' })
      const room = makeRoom({ genderRule: 'MALE_ONLY' })
      conflicts.validate({ worker, room })
      expect(conflicts.isBlocked.value).toBe(false)
      expect(conflicts.hasSoftViolations.value).toBe(true)
    })
  })

  describe('validateBulk()', () => {
    it('returns true with no violations for valid bulk assignment', () => {
      const workers = [makeWorker(), makeWorker({ id: 'worker-2', internalId: 'W002' })]
      const room = makeRoom({ availableSpots: 4 })
      expect(conflicts.validateBulk(workers, room, 'ACTIVE')).toBe(true)
    })

    it('returns true with empty workers list', () => {
      expect(conflicts.validateBulk([], makeRoom())).toBe(true)
    })

    it('returns true with null room', () => {
      expect(conflicts.validateBulk([makeWorker()], null)).toBe(true)
    })

    it('adds OVER_PLANNED soft violation when requesting more workers than available spots', () => {
      const workers = [makeWorker(), makeWorker({ id: 'w2' }), makeWorker({ id: 'w3' })]
      const room = makeRoom({ availableSpots: 2, capacity: 4 })
      conflicts.validateBulk(workers, room)
      expect(conflicts.softViolations.value.find((v) => v.type === 'OVER_PLANNED')).toBeDefined()
    })

    it('does not add OVER_PLANNED when workers fit in available spots', () => {
      const workers = [makeWorker(), makeWorker({ id: 'w2' })]
      const room = makeRoom({ availableSpots: 3 })
      conflicts.validateBulk(workers, room)
      expect(conflicts.softViolations.value.find((v) => v.type === 'OVER_PLANNED')).toBeUndefined()
    })

    it('detects double-booking in bulk validate', () => {
      const workers = [
        makeWorker({ currentStay: { propertyId: 'p1', propertyName: 'P1', roomNumber: '1', since: '2024-01-01' } }),
      ]
      conflicts.validateBulk(workers, makeRoom({ availableSpots: 4 }))
      expect(conflicts.hardViolations.value.find((v) => v.type === 'DOUBLE_BOOKING')).toBeDefined()
    })

    it('adds CAPACITY_EXCEEDED hard violation when the room has zero available spots', () => {
      const workers = [makeWorker(), makeWorker({ id: 'w2' })]
      const room = makeRoom({ availableSpots: 0, capacity: 2, currentOccupancy: 2 })
      const result = conflicts.validateBulk(workers, room)
      expect(result).toBe(false)
      expect(conflicts.hardViolations.value.find((v) => v.type === 'CAPACITY_EXCEEDED')).toBeDefined()
      expect(conflicts.isBlocked.value).toBe(true)
    })
  })

  describe('hard violations cannot be bypassed by a coexisting soft violation', () => {
    // No override parameter exists anywhere in the hard-check functions today,
    // so this is the most honest proxy for "cannot be bypassed by an override"
    // reachable via the public API: a hard violation must stay blocking even
    // when an overridable soft violation (GENDER_MISMATCH) fires alongside it.
    const hardCases: Array<{
      type: HardConstraintType
      worker: Partial<Worker>
      room: Partial<Room>
      propertyStatus?: 'ACTIVE' | 'INACTIVE'
    }> = [
      { type: 'CAPACITY_EXCEEDED', worker: {}, room: { availableSpots: 0, capacity: 2, currentOccupancy: 2 } },
      {
        type: 'DOUBLE_BOOKING',
        worker: { currentStay: { propertyId: 'p1', propertyName: 'P1', roomNumber: '1', since: '2024-01-01' } },
        room: {},
      },
      { type: 'ROOM_BLOCKED', worker: {}, room: { status: 'BLOCKED' } },
      { type: 'PROPERTY_BLOCKED', worker: {}, room: {}, propertyStatus: 'INACTIVE' },
    ]

    it.each(hardCases)(
      '$type stays blocking even with a coexisting GENDER_MISMATCH soft violation',
      ({ type, worker, room, propertyStatus }) => {
        // FEMALE worker in a MALE_ONLY room triggers the soft GENDER_MISMATCH
        // violation alongside whichever hard violation the case sets up.
        const result = conflicts.validate({
          worker: makeWorker({ gender: 'FEMALE', ...worker }),
          room: makeRoom({ genderRule: 'MALE_ONLY', ...room }),
          propertyStatus,
        })

        expect(result).toBe(false)
        expect(conflicts.isBlocked.value).toBe(true)
        expect(conflicts.hardViolations.value.find((v) => v.type === type)).toBeDefined()
        expect(conflicts.softViolations.value.find((v) => v.type === 'GENDER_MISMATCH')).toBeDefined()
      },
    )
  })

  describe('setServerViolations()', () => {
    it('replaces violations with server-provided ones', () => {
      const hard: ConstraintViolation[] = [{ type: 'ROOM_BLOCKED', message: 'Room blocked', params: {} }]
      const soft: ConstraintViolation[] = [{ type: 'GENDER_MISMATCH', message: 'Gender mismatch', params: {}, overridable: true }]
      conflicts.setServerViolations(hard, soft)
      expect(conflicts.hardViolations.value).toEqual(hard)
      expect(conflicts.softViolations.value).toEqual(soft)
    })
  })

  describe('clear()', () => {
    it('clears all violations', () => {
      conflicts.validate({ worker: makeWorker({ currentStay: { propertyId: 'p1', propertyName: 'P1', roomNumber: '1', since: '2024-01-01' } }), room: makeRoom({ availableSpots: 0 }) })
      expect(conflicts.hasAnyViolations.value).toBe(true)
      conflicts.clear()
      expect(conflicts.hasAnyViolations.value).toBe(false)
    })
  })
})
