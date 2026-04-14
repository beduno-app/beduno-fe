export type UserRole =
  | 'AGENCY_ADMIN'
  | 'AGENCY_PLANNER'
  | 'PROPERTY_ADMIN'
  | 'FRONT_DESK'

export type AppLanguage = 'PL' | 'EN' | 'DE' | 'UA' | 'RU'

export interface AuthUser {
  id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  language: AppLanguage
  assignedPropertyIds: string[]
  status?: string
  lastLoginAt?: string
  createdAt?: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  expiresIn: number
  user: AuthUser
}
