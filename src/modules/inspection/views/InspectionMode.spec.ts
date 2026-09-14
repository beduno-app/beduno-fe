import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import en from '@/assets/translations/en'
import InspectionMode from './InspectionMode.vue'
import type { InspectionRoomEntry } from '../types/inspection.types'
import type { OccupantSummary } from '@/shared/types/occupancy.types'

vi.mock('../api/inspection.api', () => ({
  inspectionApi: {
    getRoster: vi.fn(),
    submitReport: vi.fn(),
  },
}))

vi.mock('@/modules/properties/api/properties.api', () => ({
  propertiesApi: {
    getProperties: vi.fn().mockResolvedValue({
      content: [{ id: 'prop-1', name: 'Hotel A', address: '', city: '', status: 'ACTIVE', notes: '', createdAt: '', updatedAt: '' }],
      totalPages: 1,
      totalElements: 1,
      size: 20,
      number: 0,
    }),
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

function makeRoomEntry(overrides: Partial<InspectionRoomEntry> = {}): InspectionRoomEntry {
  return {
    roomId: 'room-1',
    roomNumber: '101',
    floor: 1,
    expectedOccupants: [makeOccupant()],
    checkedInOccupants: [makeOccupant()],
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

async function startInspection(wrapper: ReturnType<typeof mountView>) {
  await flushPromises() // let onMounted's fetchProperties resolve, populating the select
  await wrapper.find('select').setValue('prop-1')
  const startButton = wrapper.findAll('button').find((b) => b.text().includes(en.inspection.startInspection))
  await startButton!.trigger('click')
  await flushPromises()
}

describe('InspectionMode', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    vi.spyOn(window, 'confirm').mockReturnValue(true)
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

  it('shows error message when store has error', async () => {
    const wrapper = mountView()
    const { useInspectionStore } = await import('../store/inspection.store')
    const store = useInspectionStore()
    store.error = 'Failed to load inspection roster'

    await flushPromises()
    expect(wrapper.text()).toContain('Failed to load inspection roster')
  })

  it('starting loads the roster from the API and shows room progress + the current room', async () => {
    const { inspectionApi } = await import('../api/inspection.api')
    vi.mocked(inspectionApi.getRoster).mockResolvedValue([
      makeRoomEntry({ roomId: 'room-1', roomNumber: '101' }),
      makeRoomEntry({ roomId: 'room-2', roomNumber: '102', expectedOccupants: [makeOccupant({ workerId: 'w3' })], checkedInOccupants: [] }),
    ])

    const wrapper = mountView()
    await startInspection(wrapper)

    expect(inspectionApi.getRoster).toHaveBeenCalledTimes(1)
    expect(inspectionApi.getRoster).toHaveBeenCalledWith('prop-1', expect.any(String))

    expect(wrapper.find('.room-progress').exists()).toBe(true)
    expect(wrapper.findAll('.room-dot')).toHaveLength(2)
    expect(wrapper.text()).toContain('1 / 2')

    const card = wrapper.findComponent({ name: 'RoomInspectionCard' })
    expect(card.exists()).toBe(true)
    expect(card.props('room').roomId).toBe('room-1')
    // Seeded from checkedInOccupants, not from a server-tracked session.
    expect(card.props('presentWorkerIds').has('w1')).toBe(true)
    expect(card.props('unexpectedWorkerIds')).toEqual([])
    expect(card.props('verified')).toBe(false)
  })

  it('shows "Next room" button when not on the last room', async () => {
    const { inspectionApi } = await import('../api/inspection.api')
    vi.mocked(inspectionApi.getRoster).mockResolvedValue([
      makeRoomEntry({ roomId: 'room-1', roomNumber: '101' }),
      makeRoomEntry({ roomId: 'room-2', roomNumber: '102' }),
    ])

    const wrapper = mountView()
    await startInspection(wrapper)

    const buttons = wrapper.findAll('button')
    expect(buttons.some((b) => b.text().includes(en.inspection.nextRoom))).toBe(true)
    expect(buttons.some((b) => b.text().includes(en.inspection.completeInspection))).toBe(false)
  })

  it('marks presence locally without any network call', async () => {
    const { inspectionApi } = await import('../api/inspection.api')
    vi.mocked(inspectionApi.getRoster).mockResolvedValue([
      makeRoomEntry({ roomId: 'room-1', expectedOccupants: [makeOccupant({ workerId: 'w1' }), makeOccupant({ workerId: 'w2' })] }),
    ])

    const wrapper = mountView()
    await startInspection(wrapper)

    const { useInspectionStore } = await import('../store/inspection.store')
    const store = useInspectionStore()

    const card = wrapper.findComponent({ name: 'RoomInspectionCard' })
    await card.vm.$emit('toggle-presence', 'w2', true)
    await flushPromises()

    expect(store.isPresent('room-1', 'w2')).toBe(true)

    await card.vm.$emit('toggle-presence', 'w2', false)
    await flushPromises()

    expect(store.isPresent('room-1', 'w2')).toBe(false)
    expect(inspectionApi.submitReport).not.toHaveBeenCalled()
    expect(inspectionApi.getRoster).toHaveBeenCalledTimes(1)
  })

  it('adds and removes an unexpected worker locally without any network call', async () => {
    const { inspectionApi } = await import('../api/inspection.api')
    vi.mocked(inspectionApi.getRoster).mockResolvedValue([makeRoomEntry({ roomId: 'room-1' })])

    const wrapper = mountView()
    await startInspection(wrapper)

    const { useInspectionStore } = await import('../store/inspection.store')
    const store = useInspectionStore()

    let card = wrapper.findComponent({ name: 'RoomInspectionCard' })
    await card.vm.$emit('add-unexpected', 'w9')
    await flushPromises()

    expect(store.unexpectedWorkerIds('room-1')).toEqual(['w9'])
    card = wrapper.findComponent({ name: 'RoomInspectionCard' })
    expect(card.props('unexpectedWorkerIds')).toEqual(['w9'])

    await card.vm.$emit('remove-unexpected', 'w9')
    await flushPromises()

    expect(store.unexpectedWorkerIds('room-1')).toEqual([])
    expect(inspectionApi.submitReport).not.toHaveBeenCalled()
    expect(inspectionApi.getRoster).toHaveBeenCalledTimes(1)
  })

  it('verifying a room is local-only and reflects immediately in the UI', async () => {
    const { inspectionApi } = await import('../api/inspection.api')
    vi.mocked(inspectionApi.getRoster).mockResolvedValue([makeRoomEntry({ roomId: 'room-1' })])

    const wrapper = mountView()
    await startInspection(wrapper)

    const { useInspectionStore } = await import('../store/inspection.store')
    const store = useInspectionStore()

    const card = wrapper.findComponent({ name: 'RoomInspectionCard' })
    await card.vm.$emit('verify')
    await flushPromises()

    expect(store.isRoomVerified('room-1')).toBe(true)
    expect(wrapper.findComponent({ name: 'RoomInspectionCard' }).props('verified')).toBe(true)
    expect(inspectionApi.submitReport).not.toHaveBeenCalled()
  })

  it('only completeInspection() triggers a network call, and it submits the local presence for every room', async () => {
    const { inspectionApi } = await import('../api/inspection.api')
    vi.mocked(inspectionApi.getRoster).mockResolvedValue([
      makeRoomEntry({
        roomId: 'room-1',
        roomNumber: '101',
        expectedOccupants: [makeOccupant({ workerId: 'w1' }), makeOccupant({ workerId: 'w2' })],
        checkedInOccupants: [makeOccupant({ workerId: 'w1' })],
      }),
      makeRoomEntry({
        roomId: 'room-2',
        roomNumber: '102',
        expectedOccupants: [makeOccupant({ workerId: 'w3' })],
        checkedInOccupants: [],
      }),
    ])
    vi.mocked(inspectionApi.submitReport).mockResolvedValue({
      discrepancies: [{ roomId: 'room-1', roomNumber: '101', items: [{ workerId: 'w2', discrepancyType: 'ABSENT' }] }],
      hasDiscrepancies: true,
    })

    const wrapper = mountView()
    await startInspection(wrapper)

    const { useInspectionStore } = await import('../store/inspection.store')
    const store = useInspectionStore()

    // Verify room 1 (present: w1 only, seeded from checkedInOccupants).
    let card = wrapper.findComponent({ name: 'RoomInspectionCard' })
    await card.vm.$emit('verify')
    await flushPromises()

    // Not on the last room yet — no complete button, no submit possible.
    expect(wrapper.findAll('button').some((b) => b.text().includes(en.inspection.completeInspection))).toBe(false)

    // Move to room 2 and verify it too (present: none).
    const nextButton = wrapper.findAll('button').find((b) => b.text().includes(en.inspection.nextRoom))
    await nextButton!.trigger('click')
    await flushPromises()
    expect(wrapper.text()).toContain('2 / 2')

    card = wrapper.findComponent({ name: 'RoomInspectionCard' })
    expect(card.props('room').roomId).toBe('room-2')
    await card.vm.$emit('verify')
    await flushPromises()

    const completeButton = wrapper.findAll('button').find((b) => b.text().includes(en.inspection.completeInspection))
    expect(completeButton).toBeDefined()

    await completeButton!.trigger('click')
    await flushPromises()

    expect(inspectionApi.submitReport).toHaveBeenCalledTimes(1)
    expect(inspectionApi.submitReport).toHaveBeenCalledWith(
      'prop-1',
      {
        rooms: [
          { roomId: 'room-1', presentWorkerIds: ['w1'] },
          { roomId: 'room-2', presentWorkerIds: [] },
        ],
      },
      expect.any(String),
    )
    // The roster itself is fetched exactly once — presence marking and
    // verification never call the API, only completion does.
    expect(inspectionApi.getRoster).toHaveBeenCalledTimes(1)

    expect(store.completedAt).not.toBeNull()
    expect(store.discrepancies).toEqual([
      { roomId: 'room-1', roomNumber: '101', items: [{ workerId: 'w2', discrepancyType: 'ABSENT' }] },
    ])

    const summaryReport = wrapper.findComponent({ name: 'InspectionSummaryReport' })
    expect(summaryReport.exists()).toBe(true)
    expect(summaryReport.props('summary')).toEqual({
      totalRooms: 2,
      verifiedRooms: 2,
      totalExpected: 3,
      presentCount: 1,
      absentCount: 2,
      unexpectedCount: 0,
      discrepancyCount: 1,
    })
    expect(summaryReport.props('completedAt')).toBe(store.completedAt)
  })
})
