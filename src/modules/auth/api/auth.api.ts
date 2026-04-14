import { api } from '@/shared/composables/useApi'
import type { LoginPayload, LoginResponse } from '../types/auth.types'

export const authApi = {
  login: (payload: LoginPayload) => api.post<LoginResponse>('/auth/login', payload).then((r) => r.data),

  refresh: (refreshToken: string) =>
    api.post<{ token: string }>('/auth/refresh', { refreshToken }).then((r) => r.data),

  logout: () => api.post('/auth/logout'),
}
