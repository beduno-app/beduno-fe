import type { UserRole, AppLanguage } from '@/modules/auth/types/auth.types'

export interface CreateUserPayload {
  email: string
  password: string
  firstName: string
  lastName: string
  role: UserRole
  language: AppLanguage
  assignedPropertyIds: string[]
}

export type UpdateUserPayload = Partial<Omit<CreateUserPayload, 'password'>>
