import { describe, it, expect, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import en from '@/assets/translations/en'
import ArrivalRow from './ArrivalRow.vue'
import type { ArrivalStay } from '../types/arrival.types'

// ArrivalRow resolves worker/room display data itself on mount via
// useEntityLookup — stub it so tests don't depend on real API calls.
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

async function mountRow(arrival: ArrivalStay) {
  const wrapper = mount(ArrivalRow, {
    props: { arrival },
    global: { plugins: [i18n] },
  })
  // Worker/room lookups resolve asynchronously on mount
  await flushPromises()
  return wrapper
}

describe('ArrivalRow', () => {
  it('renders worker name and internal ID', async () => {
    const wrapper = await mountRow(makeArrival())
    expect(wrapper.text()).toContain('Kowalski')
    expect(wrapper.text()).toContain('Jan')
    expect(wrapper.text()).toContain('W001')
  })

  it('renders room number', async () => {
    const wrapper = await mountRow(makeArrival())
    expect(wrapper.text()).toContain('101')
  })

  it('shows action buttons for EXPECTED_TODAY status', async () => {
    const wrapper = await mountRow(makeArrival({ status: 'EXPECTED_TODAY' }))
    const buttons = wrapper.findAll('button')
    expect(buttons.length).toBeGreaterThanOrEqual(3)
  })

  it('hides action buttons for CHECKED_IN status', async () => {
    const wrapper = await mountRow(makeArrival({ status: 'CHECKED_IN' }))
    // Template uses v-if="isPending" which is false for CHECKED_IN
    expect(wrapper.find('button').exists()).toBe(false)
  })

  it('emits check-in event with stay ID when check-in button clicked', async () => {
    const wrapper = await mountRow(makeArrival())
    const buttons = wrapper.findAll('button')
    // First button is check-in
    await buttons[0].trigger('click')
    expect(wrapper.emitted('check-in')).toEqual([['stay-1']])
  })

  it('emits no-show event with stay ID when no-show button clicked', async () => {
    const wrapper = await mountRow(makeArrival())
    const buttons = wrapper.findAll('button')
    // Second button is no-show
    await buttons[1].trigger('click')
    expect(wrapper.emitted('no-show')).toEqual([['stay-1']])
  })

  it('emits move event with stay ID when move button clicked', async () => {
    const wrapper = await mountRow(makeArrival())
    const buttons = wrapper.findAll('button')
    // Third button is move
    await buttons[2].trigger('click')
    expect(wrapper.emitted('move')).toEqual([['stay-1']])
  })

  it('applies done class for completed statuses', async () => {
    const wrapper = await mountRow(makeArrival({ status: 'CHECKED_IN' }))
    expect(wrapper.find('tr').classes()).toContain('arrival-row--done')
  })

  it('does not apply done class for EXPECTED_TODAY', async () => {
    const wrapper = await mountRow(makeArrival({ status: 'EXPECTED_TODAY' }))
    expect(wrapper.find('tr').classes()).not.toContain('arrival-row--done')
  })
})
