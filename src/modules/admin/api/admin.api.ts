import { api } from '@/shared/composables/useApi'
import type { AuthUser, UserRole } from '@/modules/auth/types/auth.types'
import type { PaginatedResponse } from '@/shared/types/api.types'
import type { CreateUserPayload, UpdateUserPayload, UserSession } from '../types/admin.types'

export interface GetUsersParams {
  page?: number
  size?: number
  search?: string
  role?: UserRole
}

export const adminApi = {
  getUsers: (params?: GetUsersParams) =>
    api.get<PaginatedResponse<AuthUser>>('/users', { params }).then((r) => r.data),

  getUser: (id: string) => api.get<AuthUser>(`/users/${id}`).then((r) => r.data),

  createUser: (payload: CreateUserPayload) =>
    api.post<AuthUser>('/users', payload).then((r) => r.data),

  updateUser: (id: string, payload: UpdateUserPayload) =>
    api.put<AuthUser>(`/users/${id}`, payload).then((r) => r.data),

  deactivateUser: (id: string) => api.post(`/users/${id}/deactivate`),

  assignRole: (id: string, role: UserRole) =>
    api.put<AuthUser>(`/users/${id}/role`, { role }).then((r) => r.data),

  getUserSessions: (id: string) =>
    api.get<UserSession[]>(`/users/${id}/sessions`).then((r) => r.data),

  revokeSession: (userId: string, sessionId: string) =>
    api.delete(`/users/${userId}/sessions/${sessionId}`),

  revokeAllSessions: (userId: string) => api.delete(`/users/${userId}/sessions`),
}
