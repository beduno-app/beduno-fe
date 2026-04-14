import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import en from '@/assets/translations/en'
import ArrivalRow from './ArrivalRow.vue'
import type { ArrivalStay } from '../types/arrival.types'

const i18n = createI18n({ legacy: false, locale: 'en', messages: { en } })

function makeArrival(overrides: Partial<ArrivalStay> = {}): ArrivalStay {
  return {
    id: 'stay-1',
    worker: { id: 'w1', internalId: 'W001', firstName: 'Jan', lastName: 'Kowalski', gender: 'MALE' },
    property: { id: 'prop-1', name: 'Hotel A', type: 'INTERNAL' },
    room: { id: 'room-1', roomNumber: '101', capacity: 4, availableSpots: 3 },
    dateFrom: '2024-03-15',
    dateTo: null,
    status: 'EXPECTED_TODAY',
    ...overrides,
  }
}

function mountRow(arrival: ArrivalStay) {
  return mount(ArrivalRow, {
    props: { arrival },
    global: { plugins: [i18n] },
  })
}

describe('ArrivalRow', () => {
  it('renders worker name and internal ID', () => {
    const wrapper = mountRow(makeArrival())
    expect(wrapper.text()).toContain('Kowalski')
    expect(wrapper.text()).toContain('Jan')
    expect(wrapper.text()).toContain('W001')
  })

  it('renders room number', () => {
    const wrapper = mountRow(makeArrival())
    expect(wrapper.text()).toContain('101')
  })

  it('shows action buttons for EXPECTED_TODAY status', () => {
    const wrapper = mountRow(makeArrival({ status: 'EXPECTED_TODAY' }))
    const buttons = wrapper.findAll('button')
    expect(buttons.length).toBeGreaterThanOrEqual(3)
  })

  it('hides action buttons for CHECKED_IN status', () => {
    const wrapper = mountRow(makeArrival({ status: 'CHECKED_IN' }))
    // Template uses v-if="isPending" which is false for CHECKED_IN
    expect(wrapper.find('button').exists()).toBe(false)
  })

  it('emits check-in event with stay ID when check-in button clicked', async () => {
    const wrapper = mountRow(makeArrival())
    const buttons = wrapper.findAll('button')
    // First button is check-in
    await buttons[0].trigger('click')
    expect(wrapper.emitted('check-in')).toEqual([['stay-1']])
  })

  it('emits no-show event with stay ID when no-show button clicked', async () => {
    const wrapper = mountRow(makeArrival())
    const buttons = wrapper.findAll('button')
    // Second button is no-show
    await buttons[1].trigger('click')
    expect(wrapper.emitted('no-show')).toEqual([['stay-1']])
  })

  it('emits move event with stay ID when move button clicked', async () => {
    const wrapper = mountRow(makeArrival())
    const buttons = wrapper.findAll('button')
    // Third button is move
    await buttons[2].trigger('click')
    expect(wrapper.emitted('move')).toEqual([['stay-1']])
  })

  it('applies done class for completed statuses', () => {
    const wrapper = mountRow(makeArrival({ status: 'CHECKED_IN' }))
    expect(wrapper.find('tr').classes()).toContain('arrival-row--done')
  })

  it('does not apply done class for EXPECTED_TODAY', () => {
    const wrapper = mountRow(makeArrival({ status: 'EXPECTED_TODAY' }))
    expect(wrapper.find('tr').classes()).not.toContain('arrival-row--done')
  })
})
