import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { setActivePinia, createPinia } from 'pinia'
import { useIdleTimeout } from './useIdleTimeout'

vi.mock('@/modules/auth/store/auth.store', () => ({
  useAuthStore: vi.fn(() => ({
    token: 'access-token',
    refreshToken: 'refresh-token',
    isAuthenticated: true,
    logout: vi.fn(),
  })),
}))

vi.mock('@/app/router', () => ({
  default: {
    push: vi.fn(),
  },
}))

import router from '@/app/router'

// Wrapper component to test the composable in a mounted context
function makeWrapper(idleMs = 1000, warnBeforeMs = 500) {
  return defineComponent({
    setup() {
      return useIdleTimeout(idleMs, warnBeforeMs)
    },
    template: '<div></div>',
  })
}

describe('useIdleTimeout', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('starts with isWarning false', () => {
    const wrapper = mount(makeWrapper())
    expect(wrapper.vm.isWarning).toBe(false)
  })

  it('sets isWarning to true after idle period', async () => {
    const wrapper = mount(makeWrapper(1000, 500))

    vi.advanceTimersByTime(1001)
    await flushPromises()

    expect(wrapper.vm.isWarning).toBe(true)
  })

  it('logs out after idle period + warning period', async () => {
    mount(makeWrapper(1000, 500))

    vi.advanceTimersByTime(1600) // past idle + warning
    await flushPromises()

    expect(router.push).toHaveBeenCalledWith({ name: 'Login' })
  })

  it('counts down secondsRemaining during warning period', async () => {
    const wrapper = mount(makeWrapper(1000, 2000))

    vi.advanceTimersByTime(1001) // trigger warning
    await flushPromises()

    expect(wrapper.vm.isWarning).toBe(true)
    expect(wrapper.vm.secondsRemaining).toBe(2) // 2000ms / 1000 = 2s

    vi.advanceTimersByTime(1000)
    await flushPromises()
    expect(wrapper.vm.secondsRemaining).toBe(1)
  })

  it('reset() cancels existing warning and restarts the idle timer', async () => {
    const wrapper = mount(makeWrapper(1000, 500))

    vi.advanceTimersByTime(800) // not yet warned
    wrapper.vm.reset()

    vi.advanceTimersByTime(800) // would have triggered without reset
    await flushPromises()

    expect(wrapper.vm.isWarning).toBe(false) // still not warned since we reset
  })

  it('does not warn again after activity during idle period', async () => {
    const wrapper = mount(makeWrapper(1000, 500))

    // Simulate activity at 800ms (before idle threshold)
    vi.advanceTimersByTime(800)
    window.dispatchEvent(new MouseEvent('mousemove'))
    await flushPromises()

    // Advance another 800ms — not enough time since last activity
    vi.advanceTimersByTime(800)
    await flushPromises()

    expect(wrapper.vm.isWarning).toBe(false)
  })

  it('cleans up timers on unmount', async () => {
    const wrapper = mount(makeWrapper(1000, 500))
    wrapper.unmount()

    vi.advanceTimersByTime(2000)
    await flushPromises()

    // Router push should not have been called since timers were cleared
    expect(router.push).not.toHaveBeenCalled()
  })
})
