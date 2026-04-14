import type { UserRole, AppLanguage } from '@/modules/auth/types/auth.types'

export interface CreateUserPayload {
  name: string
  email: string
  role: UserRole
  agencyId: string
  propertyId?: string
  language: AppLanguage
}

export type UpdateUserPayload = Partial<CreateUserPayload>

export interface UserSession {
  id: string
  userId: string
  deviceInfo: string
  createdAt: string
  lastActiveAt: string
}
