import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import en from '@/assets/translations/en'
import ArrivalsToday from './ArrivalsToday.vue'
import type { ArrivalStay } from '../types/arrival.types'

vi.mock('../api/arrivals.api', () => ({
  arrivalsApi: {
    getArrivals: vi.fn(),
    checkIn: vi.fn(),
    noShow: vi.fn(),
    move: vi.fn(),
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

vi.mock('@/shared/services/offlineDb', () => ({
  loadSnapshot: vi.fn().mockResolvedValue(null),
  saveSnapshot: vi.fn(),
}))

vi.mock('@/shared/services/actionQueue', () => ({
  enqueueAction: vi.fn(),
}))

vi.mock('@/shared/composables/useToast', () => ({
  useToast: () => ({ success: vi.fn(), error: vi.fn() }),
}))

// ArrivalRow (rendered un-stubbed below) resolves worker/room display data via
// useEntityLookup on mount — stub it so rows don't depend on real API calls.
vi.mock('@/shared/composables/useEntityLookup', () => ({
  useEntityLookup: () => ({
    getWorker: vi.fn().mockResolvedValue({
      id: 'w1',
      internalId: 'W001',
      firstName: 'Jan',
      lastName: 'Kowalski',
      gender: 'MALE',
      nationality: 'PL',
      phone: '',
      email: '',
      dateOfBirth: '1990-01-01',
      tags: [],
      notes: '',
      status: 'ACTIVE',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    }),
    getRoom: vi.fn().mockResolvedValue({
      id: 'room-1',
      propertyId: 'prop-1',
      roomNumber: '101',
      floor: 1,
      bedCount: 4,
      availableBedCount: 3,
      genderRule: 'MIXED',
      status: 'ACTIVE',
      notes: '',
      currentOccupancy: 1,
      occupants: [],
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    }),
  }),
}))

const i18n = createI18n({ legacy: false, locale: 'en', messages: { en } })

function makeArrival(overrides: Partial<ArrivalStay> = {}): ArrivalStay {
  return {
    id: 'stay-1',
    workerId: 'w1',
    propertyId: 'prop-1',
    roomId: 'room-1',
    bedId: null,
    bedAutoAssigned: null,
    dateFrom: '2024-03-15',
    dateTo: null,
    status: 'EXPECTED_TODAY',
    overrideReason: null,
    noShowReason: null,
    notes: null,
    createdAt: '2024-03-01T00:00:00.000Z',
    updatedAt: '2024-03-01T00:00:00.000Z',
    ...overrides,
  }
}

function mountView() {
  return mount(ArrivalsToday, {
    global: {
      plugins: [i18n],
      stubs: {
        QrCheckin: true,
        NoShowAction: true,
        MoveAction: true,
        SkeletonLoader: true,
      },
    },
  })
}

describe('ArrivalsToday', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    Object.defineProperty(navigator, 'onLine', { value: true, configurable: true })
  })

  it('renders the page header', () => {
    const wrapper = mountView()
    expect(wrapper.find('h2').exists()).toBe(true)
  })

  it('shows select-property hint when no property is chosen', () => {
    const wrapper = mountView()
    expect(wrapper.text()).toContain(en.arrivals.selectPropertyHint)
  })

  it('shows loading skeleton when arrivals are loading', async () => {
    const { arrivalsApi } = await import('../api/arrivals.api')
    vi.mocked(arrivalsApi.getArrivals).mockReturnValue(new Promise(() => {})) // never resolves

    const wrapper = mountView()
    const { useArrivalsStore } = await import('../store/arrivals.store')
    const store = useArrivalsStore()
    store.propertyIdFilter = 'prop-1'
    store.isLoading = true

    await flushPromises()
    expect(wrapper.findComponent({ name: 'SkeletonLoader' }).exists()).toBe(true)
  })

  it('shows error message when store has error', async () => {
    const wrapper = mountView()
    const { useArrivalsStore } = await import('../store/arrivals.store')
    const store = useArrivalsStore()
    store.propertyIdFilter = 'prop-1'
    store.error = 'Failed to load'

    await flushPromises()
    expect(wrapper.text()).toContain('Failed to load')
  })

  it('renders arrival rows when arrivals are loaded', async () => {
    const { arrivalsApi } = await import('../api/arrivals.api')
    vi.mocked(arrivalsApi.getArrivals).mockResolvedValue([makeArrival()])

    const wrapper = mountView()
    const { useArrivalsStore } = await import('../store/arrivals.store')
    const store = useArrivalsStore()
    store.arrivals = [makeArrival()]
    store.propertyIdFilter = 'prop-1'

    await flushPromises()
    expect(wrapper.find('table').exists()).toBe(true)
    expect(wrapper.text()).toContain('Kowalski')
  })

  it('shows empty state when no arrivals exist', async () => {
    const wrapper = mountView()
    const { useArrivalsStore } = await import('../store/arrivals.store')
    const store = useArrivalsStore()
    store.propertyIdFilter = 'prop-1'
    store.arrivals = []

    await flushPromises()
    expect(wrapper.text()).toContain(en.arrivals.noArrivals)
  })

  it('shows QR scanner panel when scan button clicked', async () => {
    const wrapper = mountView()
    const scanButton = wrapper.findAll('button').find((b) => b.text().includes(en.arrivals.scanQr))
    expect(scanButton).toBeDefined()
    await scanButton!.trigger('click')

    expect(wrapper.findComponent({ name: 'QrCheckin' }).exists()).toBe(true)
  })

  it('shows stats bar when arrivals are loaded', async () => {
    const wrapper = mountView()
    const { useArrivalsStore } = await import('../store/arrivals.store')
    const store = useArrivalsStore()
    store.propertyIdFilter = 'prop-1'
    store.arrivals = [
      makeArrival({ id: 's1', status: 'EXPECTED_TODAY' }),
      makeArrival({ id: 's2', status: 'CHECKED_IN' }),
    ]

    await flushPromises()
    expect(wrapper.text()).toContain(en.arrivals.pending)
    expect(wrapper.text()).toContain(en.arrivals.checkedIn)
  })
})
