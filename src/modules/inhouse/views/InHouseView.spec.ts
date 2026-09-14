import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import en from '@/assets/translations/en'
import InHouseView from './InHouseView.vue'
import type { RoomOccupancy } from '../types/inhouse.types'
import type { Room } from '@/modules/properties/types/property.types'
import type { OccupantSummary } from '@/shared/types/occupancy.types'

vi.mock('../api/inhouse.api', () => ({
  inhouseApi: {
    getOccupancy: vi.fn(),
    checkOut: vi.fn(),
    moveRoom: vi.fn(),
    bulkCheckout: vi.fn(),
    exportOccupancy: vi.fn(),
  },
}))

vi.mock('@/modules/properties/api/properties.api', () => ({
  propertiesApi: {
    getProperties: vi.fn().mockResolvedValue({ content: [], totalPages: 0, totalElements: 0, size: 20, page: 0 }),
    getProperty: vi.fn(),
    createProperty: vi.fn(),
    updateProperty: vi.fn(),
    getRooms: vi.fn().mockResolvedValue({ content: [], totalPages: 0, totalElements: 0, size: 100, page: 0 }),
  },
}))

vi.mock('@/shared/services/actionQueue', () => ({
  enqueueAction: vi.fn(),
}))

vi.mock('@/shared/composables/useToast', () => ({
  useToast: () => ({ success: vi.fn(), error: vi.fn() }),
}))

// The default `en` translation file predates the bulk-checkout capability, so
// it is missing those keys. Merge in local overrides for these tests only —
// translation files themselves are source files, out of scope here.
const testMessages = {
  ...en,
  inhouse: {
    ...en.inhouse,
    bulkCheckOut: 'Check out selected ({count})',
    confirmBulkCheckOut: 'Check out {count} selected workers?',
    bulkCheckOutSuccess: '{count} workers checked out.',
  },
}

const i18n = createI18n({ legacy: false, locale: 'en', messages: { en: testMessages } })

function makeOccupant(overrides: Partial<OccupantSummary> = {}): OccupantSummary {
  return {
    stayId: 'stay-1',
    workerId: 'w1',
    firstName: 'Jan',
    lastName: 'Kowalski',
    bedId: 'bed-1',
    bedLabel: 'A',
    ...overrides,
  }
}

function makeRoomOccupancy(overrides: Partial<RoomOccupancy> = {}): RoomOccupancy {
  return {
    roomId: 'room-1',
    roomNumber: '101',
    floor: 1,
    bedCount: 4,
    availableBedCount: 2,
    occupiedSpots: 2,
    occupants: [makeOccupant()],
    ...overrides,
  }
}

function makePropertyRoom(overrides: Partial<Room> = {}): Room {
  return {
    id: 'room-1',
    propertyId: 'prop-1',
    roomNumber: '101',
    floor: 1,
    bedCount: 4,
    availableBedCount: 2,
    genderRule: 'MIXED',
    status: 'ACTIVE',
    notes: '',
    currentOccupancy: 2,
    occupants: [],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    ...overrides,
  }
}

function mountView(stubRoomCard = true) {
  return mount(InHouseView, {
    global: {
      plugins: [i18n],
      stubs: {
        RoomCard: stubRoomCard,
        SkeletonLoader: true,
      },
    },
  })
}

async function selectPropertyAndLoad(store: ReturnType<typeof import('../store/inhouse.store').useInHouseStore>) {
  store.propertyIdFilter = 'prop-1'
  await store.fetchInHouse()
  await flushPromises()
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
    const { inhouseApi } = await import('../api/inhouse.api')
    const { propertiesApi } = await import('@/modules/properties/api/properties.api')
    vi.mocked(inhouseApi.getOccupancy).mockResolvedValue([makeRoomOccupancy()])
    vi.mocked(propertiesApi.getRooms).mockResolvedValue({
      content: [makePropertyRoom()],
      totalPages: 1,
      totalElements: 1,
      size: 100,
      page: 0,
    })

    const wrapper = mountView()
    const { useInHouseStore } = await import('../store/inhouse.store')
    const store = useInHouseStore()
    await selectPropertyAndLoad(store)

    expect(wrapper.findAllComponents({ name: 'RoomCard' })).toHaveLength(1)
  })

  it('shows summary stats bar when data is loaded', async () => {
    const { inhouseApi } = await import('../api/inhouse.api')
    const { propertiesApi } = await import('@/modules/properties/api/properties.api')
    vi.mocked(inhouseApi.getOccupancy).mockResolvedValue([makeRoomOccupancy()])
    vi.mocked(propertiesApi.getRooms).mockResolvedValue({
      content: [makePropertyRoom()],
      totalPages: 1,
      totalElements: 1,
      size: 100,
      page: 0,
    })

    const wrapper = mountView()
    const { useInHouseStore } = await import('../store/inhouse.store')
    const store = useInHouseStore()
    await selectPropertyAndLoad(store)

    expect(wrapper.text()).toContain(en.inhouse.totalRooms)
    expect(wrapper.text()).toContain(en.inhouse.occupants)
  })

  it('shows only the CSV export button — PDF export no longer exists', async () => {
    const { inhouseApi } = await import('../api/inhouse.api')
    const { propertiesApi } = await import('@/modules/properties/api/properties.api')
    vi.mocked(inhouseApi.getOccupancy).mockResolvedValue([makeRoomOccupancy()])
    vi.mocked(propertiesApi.getRooms).mockResolvedValue({
      content: [makePropertyRoom()],
      totalPages: 1,
      totalElements: 1,
      size: 100,
      page: 0,
    })

    const wrapper = mountView()
    const { useInHouseStore } = await import('../store/inhouse.store')
    const store = useInHouseStore()
    await selectPropertyAndLoad(store)

    const buttonTexts = wrapper.findAll('button').map((b) => b.text())
    expect(buttonTexts.some((t) => t.includes(en.inhouse.exportCsv))).toBe(true)
    expect(buttonTexts.some((t) => t.includes(en.inhouse.exportPdf))).toBe(false)
  })

  it('shows empty state when no rooms exist', async () => {
    const { inhouseApi } = await import('../api/inhouse.api')
    const { propertiesApi } = await import('@/modules/properties/api/properties.api')
    vi.mocked(inhouseApi.getOccupancy).mockResolvedValue([])
    vi.mocked(propertiesApi.getRooms).mockResolvedValue({
      content: [],
      totalPages: 0,
      totalElements: 0,
      size: 100,
      page: 0,
    })

    const wrapper = mountView()
    const { useInHouseStore } = await import('../store/inhouse.store')
    const store = useInHouseStore()
    await selectPropertyAndLoad(store)

    expect(wrapper.text()).toContain(en.inhouse.noRooms)
  })

  it('computes each room status client-side from occupancy counts and property block state', async () => {
    const { inhouseApi } = await import('../api/inhouse.api')
    const { propertiesApi } = await import('@/modules/properties/api/properties.api')
    vi.mocked(inhouseApi.getOccupancy).mockResolvedValue([
      makeRoomOccupancy({ roomId: 'room-1', roomNumber: '101', bedCount: 4, occupiedSpots: 1 }), // OK
      makeRoomOccupancy({ roomId: 'room-2', roomNumber: '102', bedCount: 2, occupiedSpots: 2 }), // NEAR_CAPACITY
      makeRoomOccupancy({ roomId: 'room-3', roomNumber: '103', bedCount: 2, occupiedSpots: 3 }), // OVER_CAPACITY
      makeRoomOccupancy({ roomId: 'room-4', roomNumber: '104', bedCount: 4, occupiedSpots: 1 }), // BLOCKED (via properties store)
    ])
    vi.mocked(propertiesApi.getRooms).mockResolvedValue({
      content: [
        makePropertyRoom({ id: 'room-1', status: 'ACTIVE' }),
        makePropertyRoom({ id: 'room-2', status: 'ACTIVE' }),
        makePropertyRoom({ id: 'room-3', status: 'ACTIVE' }),
        makePropertyRoom({ id: 'room-4', status: 'BLOCKED' }),
      ],
      totalPages: 1,
      totalElements: 4,
      size: 100,
      page: 0,
    })

    const wrapper = mountView()
    const { useInHouseStore } = await import('../store/inhouse.store')
    const store = useInHouseStore()
    await selectPropertyAndLoad(store)

    const cards = wrapper.findAllComponents({ name: 'RoomCard' })
    expect(cards.map((c) => c.props('status'))).toEqual(['OK', 'NEAR_CAPACITY', 'OVER_CAPACITY', 'BLOCKED'])
  })

  it('bulk-checks-out selected occupants via the new bulk-checkout selection flow', async () => {
    const { inhouseApi } = await import('../api/inhouse.api')
    const { propertiesApi } = await import('@/modules/properties/api/properties.api')
    vi.mocked(inhouseApi.getOccupancy).mockResolvedValue([
      makeRoomOccupancy({
        roomId: 'room-1',
        occupants: [makeOccupant({ stayId: 'stay-1', workerId: 'w1' })],
      }),
    ])
    vi.mocked(propertiesApi.getRooms).mockResolvedValue({
      content: [makePropertyRoom()],
      totalPages: 1,
      totalElements: 1,
      size: 100,
      page: 0,
    })
    vi.mocked(inhouseApi.bulkCheckout).mockResolvedValue({ checkedOut: 1, errors: 0 })
    vi.spyOn(window, 'confirm').mockReturnValue(true)

    // Mount without stubbing RoomCard so the checkbox interaction actually fires.
    const wrapper = mountView(false)
    const { useInHouseStore } = await import('../store/inhouse.store')
    const store = useInHouseStore()
    await selectPropertyAndLoad(store)

    // No bulk-checkout action available before any selection is made.
    expect(wrapper.findAll('button').some((b) => b.text().includes('Check out selected'))).toBe(false)

    const checkbox = wrapper.find('input[type="checkbox"]')
    expect(checkbox.exists()).toBe(true)
    await checkbox.setValue(true)
    await flushPromises()

    const bulkButton = wrapper.findAll('button').find((b) => b.text().includes('Check out selected'))
    expect(bulkButton).toBeDefined()

    // Re-fetch after the bulk action resolves.
    vi.mocked(inhouseApi.getOccupancy).mockResolvedValue([makeRoomOccupancy({ occupiedSpots: 0, occupants: [] })])

    await bulkButton!.trigger('click')
    await flushPromises()

    expect(inhouseApi.bulkCheckout).toHaveBeenCalledWith(['stay-1'])
    // The selection is cleared and the bulk-checkout button disappears again.
    expect(wrapper.findAll('button').some((b) => b.text().includes('Check out selected'))).toBe(false)
  })
})
