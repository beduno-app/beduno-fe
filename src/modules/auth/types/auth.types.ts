export type UserRole =
  | 'AGENCY_ADMIN'
  | 'AGENCY_PLANNER'
  | 'PROPERTY_ADMIN'
  | 'FRONT_DESK'
  | 'SHIFT_LEAD'

export type AppLanguage = 'pl' | 'en' | 'de' | 'ua' | 'ru'

export interface AuthUser {
  id: string
  name: string
  email: string
  role: UserRole
  agencyId: string
  propertyId?: string
  language: AppLanguage
}

export interface LoginPayload {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  refreshToken: string
  user: AuthUser
}
