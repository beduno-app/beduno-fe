import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import en from '@/assets/translations/en'
import BulkAssign from './BulkAssign.vue'
import type { Worker } from '@/modules/workers/types/worker.types'
import type { Room, Property } from '@/modules/properties/types/property.types'

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn() }),
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
  return mount(BulkAssign, {
    global: {
      plugins: [i18n],
    },
  })
}

async function selectTargets(wrapper: ReturnType<typeof mountView>, workerIds: string[]) {
  for (const id of workerIds) {
    const chip = wrapper.findAll('.worker-chip').find((c) => c.text().includes(id))
    await chip?.trigger('click')
  }
  const selects = wrapper.findAll('select')
  await selects[0].setValue('prop-1') // property
  await flushPromises() // fetchRooms() resolves
  await selects[1].setValue('room-1') // room
  await flushPromises()
  await wrapper.find('input[type="date"]').setValue('2024-03-15')
  await flushPromises()
}

describe('BulkAssign', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    vi.mocked(workersApi.getWorkers).mockResolvedValue(
      paginated([makeWorker({ id: 'worker-1', internalId: 'W001' })]),
    )
    vi.mocked(propertiesApi.getProperties).mockResolvedValue(paginated([makeProperty()]))
    vi.mocked(propertiesApi.getRooms).mockResolvedValue(paginated([makeRoom()]))
    // No active stay for any selected worker by default — the conflict-check
    // watcher in BulkAssign.vue resolves this via staysApi.getStays({ workerId })
    // before calling conflicts.validateBulk().
    vi.mocked(staysApi.getStays).mockResolvedValue(paginated([]))
  })

  it('disables submission when the target room has zero available spots (hard violation)', async () => {
    vi.mocked(propertiesApi.getRooms).mockResolvedValue(paginated([makeRoom({ availableBedCount: 0 })]))

    const wrapper = mountView()
    await flushPromises()
    await selectTargets(wrapper, ['W001'])

    const submitButton = wrapper.findAll('button').find((b) => b.text().includes('Assign'))
    expect(submitButton).toBeDefined()
    expect(submitButton!.attributes('disabled')).toBeDefined()
  })

  it(
    // Known gap, not a bug in this test: BulkAssign has no path to record an
    // override reason for a soft violation, unlike CreateStay.vue. See
    // research.md and PRD Open Question 16 (roadmap S-05). Locked here, not
    // fixed — fixing it is a product decision, not a testing one.
    //
    // WorkerStatus no longer has a 'BLACKLISTED' value (client-side blacklist
    // checking was removed — see useConflicts.ts), so the soft violation here
    // is triggered via GENDER_MISMATCH instead: a MALE worker (default
    // fixture) targeting a FEMALE_ONLY room.
    'does not disable submission for a soft violation, and sends no override reason for it',
    async () => {
      vi.mocked(propertiesApi.getRooms).mockResolvedValue(paginated([makeRoom({ genderRule: 'FEMALE_ONLY' })]))
      vi.mocked(staysApi.bulkAssign).mockResolvedValue({
        created: 1,
        errors: 0,
        results: [{ index: 0, workerId: 'worker-1', stayId: 'stay-1', status: 'CREATED' }],
      })

      const wrapper = mountView()
      await flushPromises()
      await selectTargets(wrapper, ['W001'])

      const submitButton = wrapper.findAll('button').find((b) => b.text().includes('Assign'))
      expect(submitButton!.attributes('disabled')).toBeUndefined()

      await submitButton!.trigger('click')
      await flushPromises()

      expect(staysApi.bulkAssign).toHaveBeenCalledOnce()
      const payload = vi.mocked(staysApi.bulkAssign).mock.calls[0][0]
      for (const assignment of payload.assignments) {
        expect(assignment).not.toHaveProperty('overrideReason')
      }
    },
  )
})
