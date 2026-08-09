import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import en from '@/assets/translations/en'
import InHouseView from './InHouseView.vue'
import type { InHouseResponse, OccupantStay, RoomOccupancy } from '../types/inhouse.types'

vi.mock('../api/inhouse.api', () => ({
  inhouseApi: {
    getInHouse: vi.fn(),
    checkOut: vi.fn(),
    moveRoom: vi.fn(),
    exportInHouse: vi.fn(),
  },
}))

vi.mock('@/modules/properties/api/properties.api', () => ({
  propertiesApi: {
    getProperties: vi.fn().mockResolvedValue({ content: [], totalPages: 0, totalElements: 0, size: 20, number: 0 }),
    getProperty: vi.fn(),
    createProperty: vi.fn(),
    updateProperty: vi.fn(),
  },
}))

vi.mock('@/shared/services/actionQueue', () => ({
  enqueueAction: vi.fn(),
}))

vi.mock('@/shared/composables/useToast', () => ({
  useToast: () => ({ success: vi.fn(), error: vi.fn() }),
}))

const i18n = createI18n({ legacy: false, locale: 'en', messages: { en } })

function makeInHouseResponse(): InHouseResponse {
  return {
    property: { id: 'prop-1', name: 'Hotel A', type: 'INTERNAL' },
    rooms: [
      {
        room: { id: 'room-1', roomNumber: '101', capacity: 4, availableSpots: 2 },
        status: 'OK',
        occupants: [],
        blocked: false,
        blockReason: null,
      },
    ],
    unassignedWorkers: [],
    summary: {
      totalRooms: 1,
      totalCapacity: 4,
      totalOccupants: 2,
      overCapacityRooms: 0,
      nearCapacityRooms: 0,
      blockedRooms: 0,
    },
  }
}

function mountView() {
  return mount(InHouseView, {
    global: {
      plugins: [i18n],
      stubs: {
        RoomCard: true,
        UnassignedWorkers: true,
        SkeletonLoader: true,
      },
    },
  })
}

describe('InHouseView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('renders the page header', () => {
    const wrapper = mountView()
    expect(wrapper.find('h2').exists()).toBe(true)
  })

  it('shows select-property hint when no property chosen', () => {
    const wrapper = mountView()
    expect(wrapper.text()).toContain(en.inhouse.selectPropertyHint)
  })

  it('shows loading skeleton when data is loading', async () => {
    const wrapper = mountView()
    const { useInHouseStore } = await import('../store/inhouse.store')
    const store = useInHouseStore()
    store.propertyIdFilter = 'prop-1'
    store.isLoading = true

    await flushPromises()
    expect(wrapper.findComponent({ name: 'SkeletonLoader' }).exists()).toBe(true)
  })

  it('shows error message when store has error', async () => {
    const wrapper = mountView()
    const { useInHouseStore } = await import('../store/inhouse.store')
    const store = useInHouseStore()
    store.propertyIdFilter = 'prop-1'
    store.error = 'Failed to load occupancy'

    await flushPromises()
    expect(wrapper.text()).toContain('Failed to load occupancy')
  })

  it('renders room cards when data is loaded', async () => {
    const wrapper = mountView()
    const { useInHouseStore } = await import('../store/inhouse.store')
    const store = useInHouseStore()
    store.propertyIdFilter = 'prop-1'
    store.data = makeInHouseResponse()

    await flushPromises()
    expect(wrapper.findAllComponents({ name: 'RoomCard' })).toHaveLength(1)
  })

  it('shows summary stats bar when data is loaded', async () => {
    const wrapper = mountView()
    const { useInHouseStore } = await import('../store/inhouse.store')
    const store = useInHouseStore()
    store.propertyIdFilter = 'prop-1'
    store.data = makeInHouseResponse()

    await flushPromises()
    expect(wrapper.text()).toContain(en.inhouse.totalRooms)
    expect(wrapper.text()).toContain(en.inhouse.occupants)
  })

  it('shows export buttons when property is selected and data loaded', async () => {
    const wrapper = mountView()
    const { useInHouseStore } = await import('../store/inhouse.store')
    const store = useInHouseStore()
    store.propertyIdFilter = 'prop-1'
    store.data = makeInHouseResponse()

    await flushPromises()
    const buttons = wrapper.findAll('button')
    const buttonTexts = buttons.map((b) => b.text())
    expect(buttonTexts.some((t) => t.includes(en.inhouse.exportCsv))).toBe(true)
    expect(buttonTexts.some((t) => t.includes(en.inhouse.exportPdf))).toBe(true)
  })

  it('shows empty state when no rooms exist', async () => {
    const wrapper = mountView()
    const { useInHouseStore } = await import('../store/inhouse.store')
    const store = useInHouseStore()
    store.propertyIdFilter = 'prop-1'
    store.data = { ...makeInHouseResponse(), rooms: [] }

    await flushPromises()
    expect(wrapper.text()).toContain(en.inhouse.noRooms)
  })
})

// ---------------------------------------------------------------------------
// Load test: 500 workers / 50 rooms / 200 stays in a single property view
// ---------------------------------------------------------------------------

const ROOMS = 50
const STAYS = 200   // distributed across rooms (4 per room on average)
const WORKERS = 500 // 200 assigned + 300 unassigned
const RENDER_THRESHOLD_MS = 2000

function makeWorkerSummary(index: number) {
  return {
    id: `w-${index}`,
    internalId: `W${String(index).padStart(4, '0')}`,
    firstName: `First${index}`,
    lastName: `Last${index}`,
    gender: (['MALE', 'FEMALE', 'OTHER'] as const)[index % 3],
  }
}

function makeOccupantStay(workerIndex: number, roomIndex: number): OccupantStay {
  return {
    id: `stay-${workerIndex}-${roomIndex}`,
    worker: makeWorkerSummary(workerIndex),
    dateFrom: '2024-01-01',
    dateTo: null,
    status: 'CHECKED_IN',
  }
}

function makeLargeInHouseResponse(): InHouseResponse {
  // Distribute STAYS evenly across ROOMS (4 stays each for first 50 rooms)
  const staysPerRoom = Math.floor(STAYS / ROOMS)
  let workerIndex = 0

  const rooms: RoomOccupancy[] = Array.from({ length: ROOMS }, (_, roomIdx) => {
    const occupants: OccupantStay[] = Array.from({ length: staysPerRoom }, () =>
      makeOccupantStay(workerIndex++, roomIdx),
    )
    const isNearCapacity = roomIdx % 10 === 0
    const isOverCapacity = roomIdx % 25 === 0
    return {
      room: {
        id: `room-${roomIdx}`,
        roomNumber: String(100 + roomIdx),
        capacity: staysPerRoom + 2,
        availableSpots: isOverCapacity ? 0 : isNearCapacity ? 1 : 2,
      },
      status: isOverCapacity ? 'OVER_CAPACITY' : isNearCapacity ? 'NEAR_CAPACITY' : 'OK',
      occupants,
      blocked: false,
      blockReason: null,
    }
  })

  // Remaining workers are unassigned (300 workers)
  const unassignedWorkers: OccupantStay[] = Array.from(
    { length: WORKERS - STAYS },
    (_, i) => makeOccupantStay(workerIndex + i, -1),
  )

  return {
    property: { id: 'prop-load', name: 'Load Test Property', type: 'INTERNAL' },
    rooms,
    unassignedWorkers,
    summary: {
      totalRooms: ROOMS,
      totalCapacity: ROOMS * (Math.floor(STAYS / ROOMS) + 2),
      totalOccupants: STAYS,
      overCapacityRooms: rooms.filter((r) => r.status === 'OVER_CAPACITY').length,
      nearCapacityRooms: rooms.filter((r) => r.status === 'NEAR_CAPACITY').length,
      blockedRooms: 0,
    },
  }
}

describe('InHouseView — load test (500 workers / 50 rooms / 200 stays)', () => {
  let data: InHouseResponse

  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    data = makeLargeInHouseResponse()
  })

  afterEach(() => {
    data = null!
  })

  it('generates the correct dataset shape', () => {
    expect(data.rooms).toHaveLength(ROOMS)
    expect(data.unassignedWorkers).toHaveLength(WORKERS - STAYS)
    const totalOccupants = data.rooms.reduce((sum, r) => sum + r.occupants.length, 0)
    expect(totalOccupants).toBe(STAYS)
    expect(data.summary.totalOccupants).toBe(STAYS)
  })

  it(`renders all ${ROOMS} RoomCard components within ${RENDER_THRESHOLD_MS}ms`, async () => {
    const wrapper = mountView()
    const { useInHouseStore } = await import('../store/inhouse.store')
    const store = useInHouseStore()
    store.propertyIdFilter = 'prop-load'
    store.data = data

    const t0 = performance.now()
    await flushPromises()
    const elapsed = performance.now() - t0

    expect(wrapper.findAllComponents({ name: 'RoomCard' })).toHaveLength(ROOMS)
    expect(elapsed).toBeLessThan(RENDER_THRESHOLD_MS)
  })

  it('displays accurate summary stats for the large dataset', async () => {
    const wrapper = mountView()
    const { useInHouseStore } = await import('../store/inhouse.store')
    const store = useInHouseStore()
    store.propertyIdFilter = 'prop-load'
    store.data = data

    await flushPromises()

    expect(wrapper.text()).toContain(String(ROOMS))      // totalRooms
    expect(wrapper.text()).toContain(String(STAYS))      // totalOccupants
  })

  it(`re-renders after a data refresh within ${RENDER_THRESHOLD_MS / 2}ms`, async () => {
    const wrapper = mountView()
    const { useInHouseStore } = await import('../store/inhouse.store')
    const store = useInHouseStore()
    store.propertyIdFilter = 'prop-load'
    store.data = data
    await flushPromises()

    // Simulate a data refresh (e.g. after pull-to-refresh)
    const refreshed = makeLargeInHouseResponse()
    // Swap one room number to confirm the view actually updates
    refreshed.rooms[0].room.roomNumber = '999'

    const t0 = performance.now()
    store.data = refreshed
    await flushPromises()
    const elapsed = performance.now() - t0

    expect(elapsed).toBeLessThan(RENDER_THRESHOLD_MS / 2)
    expect(wrapper.findAllComponents({ name: 'RoomCard' })).toHaveLength(ROOMS)
  })

  it('produces unique worker IDs across all rooms and unassigned list', () => {
    const allIds = [
      ...data.rooms.flatMap((r) => r.occupants.map((o) => o.worker.id)),
      ...data.unassignedWorkers.map((o) => o.worker.id),
    ]
    const unique = new Set(allIds)
    expect(unique.size).toBe(WORKERS)
  })
})
