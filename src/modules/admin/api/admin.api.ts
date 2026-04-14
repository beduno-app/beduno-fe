import { api } from '@/shared/composables/useApi'
import type { AuthUser, UserRole, AppLanguage } from '@/modules/auth/types/auth.types'
import type { PaginatedResponse } from '@/shared/types/api.types'
import type { CreateUserPayload, UpdateUserPayload } from '../types/admin.types'

export interface GetUsersParams {
  page?: number
  size?: number
  sort?: string
  search?: string
  role?: UserRole
  propertyId?: string
}

export const adminApi = {
  getUsers: (params?: GetUsersParams) =>
    api.get<PaginatedResponse<AuthUser>>('/users', { params }).then((r) => r.data),

  getUser: (id: string) => api.get<AuthUser>(`/users/${id}`).then((r) => r.data),

  createUser: (payload: CreateUserPayload) =>
    api.post<AuthUser>('/users', payload).then((r) => r.data),

  updateUser: (id: string, payload: UpdateUserPayload) =>
    api.put<AuthUser>(`/users/${id}`, payload).then((r) => r.data),

  deleteUser: (id: string) => api.delete(`/users/${id}`),

  updateMyLanguage: (language: AppLanguage) =>
    api.put<AuthUser>('/users/me/language', { language }).then((r) => r.data),
}
