import { api } from '@/shared/composables/useApi'
import type { AuthUser, LoginPayload, LoginResponse } from '../types/auth.types'

export const authApi = {
  login: (payload: LoginPayload) =>
    api.post<LoginResponse>('/auth/login', payload).then((r) => r.data),

  refresh: (refreshToken: string) =>
    api
      .post<{ accessToken: string; refreshToken: string; expiresIn: number }>('/auth/refresh', {
        refreshToken,
      })
      .then((r) => r.data),

  logout: () => api.post('/auth/logout'),

  me: () => api.get<AuthUser>('/auth/me').then((r) => r.data),
}
