import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import { AxiosError } from 'axios'
import en from '@/assets/translations/en'
import CreateStay from './CreateStay.vue'
import type { Worker } from '@/modules/workers/types/worker.types'
import type { Room, Property } from '@/modules/properties/types/property.types'

const pushMock = vi.fn()
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: pushMock }),
}))

// useEntityLookup pulls in workersApi/propertiesApi (mocked below), but those
// modules also import the shared axios instance, which imports the real
// app router (`@/app/router`) for its 401-refresh redirect. That module calls
// vue-router's real `createRouter` at import time, which the mock above
// doesn't provide — stub it out so it's never evaluated.
vi.mock('@/app/router', () => ({ default: { push: vi.fn() } }))

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

vi.mock('@/modules/properties/api/properties.api', () => ({
  propertiesApi: {
    getProperties: vi.fn(),
    getProperty: vi.fn(),
    getRooms: vi.fn(),
    getRoom: vi.fn(),
    createProperty: vi.fn(),
    updateProperty: vi.fn(),
    createRoom: vi.fn(),
    updateRoom: vi.fn(),
  },
}))

vi.mock('@/modules/workers/api/workers.api', () => ({
  workersApi: {
    getWorkers: vi.fn(),
    getWorker: vi.fn(),
    createWorker: vi.fn(),
    updateWorker: vi.fn(),
    deleteWorker: vi.fn(),
  },
}))

import { staysApi } from '../api/stays.api'
import { propertiesApi } from '@/modules/properties/api/properties.api'
import { workersApi } from '@/modules/workers/api/workers.api'

const i18n = createI18n({ legacy: false, locale: 'en', messages: { en } })

function makeWorker(overrides: Partial<Worker> = {}): Worker {
  return {
    id: 'worker-1',
    internalId: 'W001',
    firstName: 'Jan',
    lastName: 'Kowalski',
    phone: '+48123456789',
    gender: 'MALE',
    nationality: 'PL',
    email: 'jan.kowalski@example.com',
    dateOfBirth: '1990-01-01',
    tags: [],
    notes: '',
    status: 'ACTIVE',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    ...overrides,
  }
}

function makeProperty(overrides: Partial<Property> = {}): Property {
  return {
    id: 'prop-1',
    name: 'Hotel A',
    address: 'Main St 1',
    city: 'Warsaw',
    status: 'ACTIVE',
    notes: '',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    ...overrides,
  }
}

function makeRoom(overrides: Partial<Room> = {}): Room {
  return {
    id: 'room-1',
    propertyId: 'prop-1',
    roomNumber: '101',
    bedCount: 4,
    availableBedCount: 4,
    currentOccupancy: 0,
    genderRule: 'MIXED',
    floor: 1,
    status: 'ACTIVE',
    notes: '',
    occupants: [],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    ...overrides,
  }
}

function paginated<T>(content: T[]) {
  return { content, totalPages: 1, totalElements: content.length, size: 20, page: 0 }
}

function mountView() {
  return mount(CreateStay, {
    global: {
      plugins: [i18n],
    },
  })
}

describe('CreateStay', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    vi.mocked(workersApi.getWorkers).mockResolvedValue(paginated([makeWorker()]))
    vi.mocked(propertiesApi.getProperties).mockResolvedValue(paginated([makeProperty()]))
    vi.mocked(propertiesApi.getRooms).mockResolvedValue(paginated([makeRoom()]))
    // No active stay for the selected worker by default — the conflict-check
    // watcher in CreateStay.vue resolves this via staysApi.getStays({ workerId })
    // before calling conflicts.validate().
    vi.mocked(staysApi.getStays).mockResolvedValue(paginated([]))
  })

  it('blocks submission on a hard violation and leaves the form usable afterward', async () => {
    // A full room (0 available spots) triggers CAPACITY_EXCEEDED — a hard
    // violation. This also exercises the fix for the isSaving-stuck bug:
    // the Save button must not stay in a loading state after a blocked attempt.
    vi.mocked(propertiesApi.getRooms).mockResolvedValue(paginated([makeRoom({ availableBedCount: 0 })]))

    const wrapper = mountView()
    await flushPromises()

    const selects = wrapper.findAll('select')
    await selects[0].setValue('worker-1') // worker
    await selects[1].setValue('prop-1') // property
    await flushPromises() // fetchRooms() resolves
    await selects[2].setValue('room-1') // room
    await flushPromises()

    const saveButton = wrapper.findAll('button').find((b) => b.text() === en.common.save)
    expect(saveButton).toBeDefined()

    await saveButton!.trigger('click')
    await flushPromises()

    expect(staysApi.createStay).not.toHaveBeenCalled()
    // The bug this locks: isSaving used to stay true forever on the blocked
    // path, leaving the button permanently disabled/loading.
    expect(saveButton!.attributes('disabled')).toBeUndefined()
  })

  it('drives the override flow on a soft-only 422 and attaches the reason to the retried payload', async () => {
    const constraintError = new AxiosError('Soft constraint violated', '422', undefined, undefined, {
      status: 422,
      data: {
        error: 'CONSTRAINT_VIOLATION',
        message: 'Soft constraint violated',
        allowed: false,
        hardViolations: [],
        softViolations: [{ type: 'WORKER_BLACKLISTED', message: 'Blacklisted', params: {}, overridable: true }],
        timestamp: '2024-03-15T10:00:00Z',
      },
    } as never)

    vi.mocked(staysApi.createStay)
      .mockRejectedValueOnce(constraintError)
      .mockResolvedValueOnce({
        id: 'stay-1',
        workerId: 'worker-1',
        propertyId: 'prop-1',
        roomId: 'room-1',
        bedId: null,
        bedAutoAssigned: null,
        dateFrom: '2024-03-15',
        dateTo: '2024-03-20',
        status: 'PLANNED',
        overrideReason: 'Manager approval',
        noShowReason: null,
        notes: null,
        createdAt: '2024-03-15T10:00:00Z',
        updatedAt: '2024-03-15T10:00:00Z',
      })

    const wrapper = mountView()
    await flushPromises()

    const selects = wrapper.findAll('select')
    await selects[0].setValue('worker-1')
    await selects[1].setValue('prop-1')
    await flushPromises()
    await selects[2].setValue('room-1')
    await flushPromises()

    let saveButton = wrapper.findAll('button').find((b) => b.text() === en.common.save)
    await saveButton!.trigger('click')
    await flushPromises()

    // Soft-only violation opens the override reason input.
    const reasonInput = wrapper.find('input[placeholder]')
    expect(reasonInput.exists()).toBe(true)

    await reasonInput.setValue('Manager approval')
    saveButton = wrapper.findAll('button').find((b) => b.text() === en.stays.confirmOverride)
    expect(saveButton).toBeDefined()

    await saveButton!.trigger('click')
    await flushPromises()

    expect(staysApi.createStay).toHaveBeenCalledTimes(2)
    expect(staysApi.createStay).toHaveBeenLastCalledWith(
      expect.objectContaining({ overrideReason: 'Manager approval' }),
    )
  })
})
