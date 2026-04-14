import { ref, computed } from 'vue'
import type { ConstraintViolation, HardConstraintType, SoftConstraintType } from '../types/stay.types'
import type { Room } from '@/modules/properties/types/property.types'
import type { Worker } from '@/modules/workers/types/worker.types'

export interface ConflictCheckInput {
  worker: Worker | null
  room: Room | null
  propertyStatus?: 'ACTIVE' | 'INACTIVE'
}

export function useConflicts() {
  const hardViolations = ref<ConstraintViolation[]>([])
  const softViolations = ref<ConstraintViolation[]>([])

  const hasHardViolations = computed(() => hardViolations.value.length > 0)
  const hasSoftViolations = computed(() => softViolations.value.length > 0)
  const hasAnyViolations = computed(() => hasHardViolations.value || hasSoftViolations.value)
  const isBlocked = computed(() => hasHardViolations.value)

  function clear() {
    hardViolations.value = []
    softViolations.value = []
  }

  function addHard(type: HardConstraintType, message: string, params: Record<string, string | number>) {
    hardViolations.value.push({ type, message, params })
  }

  function addSoft(type: SoftConstraintType, message: string, params: Record<string, string | number>, overridable = true) {
    softViolations.value.push({ type, message, params, overridable })
  }

  function checkCapacity(room: Room): boolean {
    if (room.availableSpots <= 0) {
      addHard('CAPACITY_EXCEEDED', 'constraint.room.capacity.full', {
        roomNumber: room.roomNumber,
        capacity: room.capacity,
        current: room.currentOccupancy,
      })
      return false
    }
    return true
  }

  function checkRoomBlocked(room: Room): boolean {
    if (room.status === 'BLOCKED') {
      addHard('ROOM_BLOCKED', 'constraint.room.blocked', {
        roomNumber: room.roomNumber,
      })
      return false
    }
    return true
  }

  function checkPropertyBlocked(propertyStatus: 'ACTIVE' | 'INACTIVE' | undefined, propertyName?: string): boolean {
    if (propertyStatus === 'INACTIVE') {
      addHard('PROPERTY_BLOCKED', 'constraint.property.blocked', {
        property: propertyName ?? '',
      })
      return false
    }
    return true
  }

  function checkGender(worker: Worker, room: Room): boolean {
    if (room.genderRule === 'MIXED') return true

    const requiredGender = room.genderRule === 'MALE_ONLY' ? 'MALE' : 'FEMALE'
    if (worker.gender !== requiredGender && worker.gender !== 'OTHER') {
      addSoft('GENDER_MISMATCH', 'constraint.gender.mismatch', {
        roomNumber: room.roomNumber,
        roomRule: room.genderRule,
        workerGender: worker.gender,
      })
      return false
    }
    return true
  }

  function checkDoubleBooking(worker: Worker): boolean {
    if (worker.currentStay) {
      addHard('DOUBLE_BOOKING', 'constraint.worker.double_booking', {
        workerName: `${worker.firstName} ${worker.lastName}`,
        currentProperty: worker.currentStay.propertyName,
        currentRoom: worker.currentStay.roomNumber,
      })
      return false
    }
    return true
  }

  function checkBlacklisted(worker: Worker): boolean {
    if (worker.status === 'BLACKLISTED') {
      addSoft('WORKER_BLACKLISTED', 'constraint.worker.blacklisted', {
        workerName: `${worker.firstName} ${worker.lastName}`,
      })
      return false
    }
    return true
  }

  function checkOverPlanned(room: Room, additionalWorkers: number): boolean {
    if (room.availableSpots > 0 && room.availableSpots < additionalWorkers) {
      addSoft('OVER_PLANNED', 'constraint.room.over_planned', {
        roomNumber: room.roomNumber,
        capacity: room.capacity,
        available: room.availableSpots,
        requested: additionalWorkers,
      })
      return false
    }
    return true
  }

  function validate(input: ConflictCheckInput): boolean {
    clear()
    const { worker, room, propertyStatus } = input

    if (!worker || !room) return true

    checkPropertyBlocked(propertyStatus)
    checkRoomBlocked(room)
    checkCapacity(room)
    checkDoubleBooking(worker)
    checkGender(worker, room)
    checkBlacklisted(worker)

    return !hasHardViolations.value
  }

  function validateBulk(
    workers: Worker[],
    room: Room | null,
    propertyStatus?: 'ACTIVE' | 'INACTIVE',
  ): boolean {
    clear()

    if (!room || workers.length === 0) return true

    checkPropertyBlocked(propertyStatus)
    checkRoomBlocked(room)
    checkOverPlanned(room, workers.length)

    for (const worker of workers) {
      checkDoubleBooking(worker)
      checkGender(worker, room)
      checkBlacklisted(worker)
    }

    return !hasHardViolations.value
  }

  function setServerViolations(hard: ConstraintViolation[], soft: ConstraintViolation[]) {
    hardViolations.value = hard
    softViolations.value = soft
  }

  return {
    hardViolations,
    softViolations,
    hasHardViolations,
    hasSoftViolations,
    hasAnyViolations,
    isBlocked,
    clear,
    validate,
    validateBulk,
    setServerViolations,
  }
}
