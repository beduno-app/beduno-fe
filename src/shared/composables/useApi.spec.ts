import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import MockAdapter from 'axios-mock-adapter'

vi.mock('@/modules/auth/store/auth.store', () => ({
  useAuthStore: vi.fn(),
}))

vi.mock('@/app/router', () => ({
  default: {
    push: vi.fn().mockResolvedValue(undefined),
  },
}))

import { useAuthStore } from '@/modules/auth/store/auth.store'
import router from '@/app/router'
import { api } from './useApi'

const mockAdapter = new MockAdapter(api)

function makeAuthStore(overrides: Record<string, unknown> = {}) {
  return {
    token: 'access-token',
    refreshToken: 'refresh-token',
    isAuthenticated: true,
    login: vi.fn(),
    refresh: vi.fn(),
    logout: vi.fn(),
    ...overrides,
  }
}

describe('useApi — axios interceptors', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    mockAdapter.reset()
    vi.mocked(useAuthStore).mockReturnValue(makeAuthStore() as never)
  })

  describe('X-Requested-With header', () => {
    it('is present on all requests', async () => {
      let capturedHeaders: Record<string, string> | undefined
      mockAdapter.onGet('/test').reply((config) => {
        capturedHeaders = config.headers as Record<string, string>
        return [200, {}]
      })

      await api.get('/test')
      expect(capturedHeaders?.['X-Requested-With']).toBe('XMLHttpRequest')
    })
  })

  describe('Authorization header', () => {
    it('attaches Bearer token when authenticated', async () => {
      let capturedHeaders: Record<string, string> | undefined
      mockAdapter.onGet('/test').reply((config) => {
        capturedHeaders = config.headers as Record<string, string>
        return [200, {}]
      })

      await api.get('/test')
      expect(capturedHeaders?.Authorization).toBe('Bearer access-token')
    })

    it('omits Authorization header when no token', async () => {
      vi.mocked(useAuthStore).mockReturnValue(makeAuthStore({ token: null }) as never)

      let capturedHeaders: Record<string, string> | undefined
      mockAdapter.onGet('/test').reply((config) => {
        capturedHeaders = config.headers as Record<string, string>
        return [200, {}]
      })

      await api.get('/test')
      expect(capturedHeaders?.Authorization).toBeUndefined()
    })
  })

  describe('401 response — device revocation', () => {
    it('calls logout and redirects to Login when no refresh token', async () => {
      const logoutFn = vi.fn()
      vi.mocked(useAuthStore).mockReturnValue(
        makeAuthStore({ refreshToken: null, logout: logoutFn }) as never,
      )
      mockAdapter.onGet('/protected').reply(401)

      try {
        await api.get('/protected')
      } catch {
        // expected rejection
      }

      expect(logoutFn).toHaveBeenCalled()
      expect(router.push).toHaveBeenCalledWith({ name: 'Login' })
    })

    it('attempts token refresh on 401 before logging out', async () => {
      const refreshFn = vi.fn().mockResolvedValue(undefined)
      const auth = makeAuthStore({ refresh: refreshFn })
      vi.mocked(useAuthStore).mockReturnValue(auth as never)

      // First call returns 401, retry returns 200
      mockAdapter.onGet('/protected').replyOnce(401).onGet('/protected').reply(200, { ok: true })

      const response = await api.get('/protected')
      expect(refreshFn).toHaveBeenCalled()
      expect(response.data).toEqual({ ok: true })
    })

    it('logs out when refresh fails (device revoked)', async () => {
      const logoutFn = vi.fn()
      const refreshFn = vi.fn().mockRejectedValue(new Error('Unauthorized'))
      vi.mocked(useAuthStore).mockReturnValue(
        makeAuthStore({ refresh: refreshFn, logout: logoutFn }) as never,
      )

      mockAdapter.onGet('/protected').reply(401)

      try {
        await api.get('/protected')
      } catch {
        // expected
      }

      expect(refreshFn).toHaveBeenCalled()
      expect(logoutFn).toHaveBeenCalled()
      expect(router.push).toHaveBeenCalledWith({ name: 'Login' })
    })
  })
})
