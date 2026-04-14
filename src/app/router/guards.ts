import type { UserRole } from '@/modules/auth/types/auth.types'

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    roles?: UserRole[]
  }
}

export {}
