import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import en from '@/assets/translations/en'
import InspectionMode from './InspectionMode.vue'
import type { Inspection, RoomInspection } from '../types/inspection.types'

vi.mock('../api/inspection.api', () => ({
  inspectionApi: {
    start: vi.fn(),
    get: vi.fn(),
    markPresence: vi.fn(),
    addUnexpected: vi.fn(),
    verifyRoom: vi.fn(),
    complete: vi.fn(),
    exportReport: vi.fn(),
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

vi.mock('@/modules/ops/store/ops.store', () => ({
  useOpsStore: () => ({ selectedPropertyId: '' }),
}))

vi.mock('@/shared/composables/useToast', () => ({
  useToast: () => ({ success: vi.fn(), error: vi.fn() }),
}))

const i18n = createI18n({ legacy: false, locale: 'en', messages: { en } })

function makeRoomInspection(overrides: Partial<RoomInspection> = {}): RoomInspection {
  return {
    room: { id: 'room-1', roomNumber: '101', capacity: 4, availableSpots: 2 },
    expected: [],
    unexpected: [],
    verified: false,
    verifiedAt: null,
    verifiedBy: null,
    ...overrides,
  }
}

function makeInspection(overrides: Partial<Inspection> = {}): Inspection {
  return {
    id: 'insp-1',
    property: { id: 'prop-1', name: 'Hotel A', type: 'INTERNAL' },
    rooms: [makeRoomInspection()],
    startedAt: '2024-03-15T10:00:00Z',
    completedAt: null,
    startedBy: 'admin',
    summary: null,
    ...overrides,
  }
}

function mountView() {
  return mount(InspectionMode, {
    global: {
      plugins: [i18n],
      stubs: {
        RoomInspectionCard: true,
        InspectionSummaryReport: true,
      },
    },
  })
}

describe('InspectionMode', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('renders the page header', () => {
    const wrapper = mountView()
    expect(wrapper.find('h2').exists()).toBe(true)
  })

  it('shows start form when no inspection is active', () => {
    const wrapper = mountView()
    expect(wrapper.text()).toContain(en.inspection.startInspection)
  })

  it('start button is disabled when no property selected', () => {
    const wrapper = mountView()
    const startButton = wrapper.findAll('button').find((b) => b.text().includes(en.inspection.startInspection))
    expect(startButton?.attributes('disabled')).toBeDefined()
  })

  it('shows room progress dots when inspection is active', async () => {
    const wrapper = mountView()
    const { useInspectionStore } = await import('../store/inspection.store')
    const store = useInspectionStore()
    store.inspection = makeInspection()

    await flushPromises()
    expect(wrapper.find('.room-progress').exists()).toBe(true)
    expect(wrapper.findAll('.room-dot')).toHaveLength(1)
  })

  it('shows room counter when inspection is active', async () => {
    const wrapper = mountView()
    const { useInspectionStore } = await import('../store/inspection.store')
    const store = useInspectionStore()
    store.inspection = makeInspection()

    await flushPromises()
    expect(wrapper.text()).toContain('1 / 1')
  })

  it('renders RoomInspectionCard for current room', async () => {
    const wrapper = mountView()
    const { useInspectionStore } = await import('../store/inspection.store')
    const store = useInspectionStore()
    store.inspection = makeInspection()

    await flushPromises()
    expect(wrapper.findComponent({ name: 'RoomInspectionCard' }).exists()).toBe(true)
  })

  it('shows "Next room" button when not on the last room', async () => {
    const wrapper = mountView()
    const { useInspectionStore } = await import('../store/inspection.store')
    const store = useInspectionStore()
    store.inspection = makeInspection({
      rooms: [makeRoomInspection({ room: { id: 'r1', roomNumber: '101', capacity: 4, availableSpots: 2 } }), makeRoomInspection({ room: { id: 'r2', roomNumber: '102', capacity: 4, availableSpots: 2 } })],
    })

    await flushPromises()
    const buttons = wrapper.findAll('button')
    expect(buttons.some((b) => b.text().includes(en.inspection.nextRoom))).toBe(true)
  })

  it('shows "Complete inspection" button when all rooms verified and on last room', async () => {
    const wrapper = mountView()
    const { useInspectionStore } = await import('../store/inspection.store')
    const store = useInspectionStore()
    store.inspection = makeInspection({
      rooms: [makeRoomInspection({ verified: true })],
    })

    await flushPromises()
    const buttons = wrapper.findAll('button')
    expect(buttons.some((b) => b.text().includes(en.inspection.completeInspection))).toBe(true)
  })

  it('shows error message when store has error', async () => {
    const wrapper = mountView()
    const { useInspectionStore } = await import('../store/inspection.store')
    const store = useInspectionStore()
    store.error = 'Failed to start inspection'

    await flushPromises()
    expect(wrapper.text()).toContain('Failed to start inspection')
  })

  it('shows summary report after inspection completed', async () => {
    const wrapper = mountView()
    const { useInspectionStore } = await import('../store/inspection.store')
    const store = useInspectionStore()
    store.inspection = makeInspection({
      completedAt: '2024-03-15T12:00:00Z',
      summary: {
        totalRooms: 1,
        verifiedRooms: 1,
        totalExpected: 3,
        presentCount: 3,
        absentCount: 0,
        unexpectedCount: 0,
        discrepancyCount: 0,
      },
    })

    await flushPromises()
    expect(wrapper.findComponent({ name: 'InspectionSummaryReport' }).exists()).toBe(true)
  })
})
