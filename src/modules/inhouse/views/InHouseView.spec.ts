import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import en from '@/assets/translations/en'
import InHouseView from './InHouseView.vue'
import type { InHouseResponse } from '../types/inhouse.types'

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
