import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from './auth.store'
import type { AuthUser, LoginResponse } from '../types/auth.types'

vi.mock('../api/auth.api', () => ({
  authApi: {
    login: vi.fn(),
    refresh: vi.fn(),
    logout: vi.fn(),
    me: vi.fn(),
  },
}))

import { authApi } from '../api/auth.api'

function makeUser(overrides: Partial<AuthUser> = {}): AuthUser {
  return {
    id: 'user-1',
    email: 'admin@example.com',
    firstName: 'Admin',
    lastName: 'User',
    role: 'AGENCY_ADMIN',
    language: 'EN',
    assignedPropertyIds: [],
    ...overrides,
  }
}

function makeLoginResponse(overrides: Partial<LoginResponse> = {}): LoginResponse {
  return {
    accessToken: 'access-token-123',
    refreshToken: 'refresh-token-456',
    expiresIn: 3600,
    user: makeUser(),
    ...overrides,
  }
}

describe('useAuthStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('starts unauthenticated with no user', () => {
      const store = useAuthStore()
      expect(store.isAuthenticated).toBe(false)
      expect(store.token).toBeNull()
      expect(store.refreshToken).toBeNull()
      expect(store.user).toBeNull()
      expect(store.userRole).toBeNull()
    })
  })

  describe('login()', () => {
    it('sets token, refreshToken, and user on successful login', async () => {
      const response = makeLoginResponse()
      vi.mocked(authApi.login).mockResolvedValue(response)

      const store = useAuthStore()
      await store.login({ email: 'admin@example.com', password: 'secret' })

      expect(store.token).toBe('access-token-123')
      expect(store.refreshToken).toBe('refresh-token-456')
      expect(store.user).toEqual(response.user)
      expect(store.isAuthenticated).toBe(true)
    })

    it('exposes userRole after login', async () => {
      vi.mocked(authApi.login).mockResolvedValue(makeLoginResponse({ user: makeUser({ role: 'FRONT_DESK' }) }))

      const store = useAuthStore()
      await store.login({ email: 'desk@example.com', password: 'pass' })

      expect(store.userRole).toBe('FRONT_DESK')
    })

    it('propagates API errors', async () => {
      vi.mocked(authApi.login).mockRejectedValue(new Error('Invalid credentials'))

      const store = useAuthStore()
      await expect(store.login({ email: 'bad@example.com', password: 'wrong' })).rejects.toThrow('Invalid credentials')
      expect(store.isAuthenticated).toBe(false)
    })
  })

  describe('refresh()', () => {
    it('updates tokens without changing user', async () => {
      vi.mocked(authApi.login).mockResolvedValue(makeLoginResponse())
      vi.mocked(authApi.refresh).mockResolvedValue({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
        expiresIn: 3600,
      })

      const store = useAuthStore()
      await store.login({ email: 'admin@example.com', password: 'secret' })
      await store.refresh()

      expect(store.token).toBe('new-access-token')
      expect(store.refreshToken).toBe('new-refresh-token')
      expect(store.user).not.toBeNull()
    })

    it('throws when no refresh token exists', async () => {
      const store = useAuthStore()
      await expect(store.refresh()).rejects.toThrow('No refresh token')
    })

    it('propagates API errors (device revoked)', async () => {
      vi.mocked(authApi.login).mockResolvedValue(makeLoginResponse())
      vi.mocked(authApi.refresh).mockRejectedValue(new Error('Unauthorized'))

      const store = useAuthStore()
      await store.login({ email: 'admin@example.com', password: 'secret' })

      await expect(store.refresh()).rejects.toThrow('Unauthorized')
    })
  })

  describe('logout()', () => {
    it('clears all auth state', async () => {
      vi.mocked(authApi.login).mockResolvedValue(makeLoginResponse())

      const store = useAuthStore()
      await store.login({ email: 'admin@example.com', password: 'secret' })
      expect(store.isAuthenticated).toBe(true)

      store.logout()

      expect(store.token).toBeNull()
      expect(store.refreshToken).toBeNull()
      expect(store.user).toBeNull()
      expect(store.isAuthenticated).toBe(false)
      expect(store.userRole).toBeNull()
    })
  })

  describe('isAuthenticated computed', () => {
    it('reflects token presence correctly', async () => {
      const store = useAuthStore()
      expect(store.isAuthenticated).toBe(false)

      vi.mocked(authApi.login).mockResolvedValue(makeLoginResponse())
      await store.login({ email: 'admin@example.com', password: 'secret' })
      expect(store.isAuthenticated).toBe(true)

      store.logout()
      expect(store.isAuthenticated).toBe(false)
    })
  })
})
