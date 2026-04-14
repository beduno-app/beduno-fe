import type { UserRole } from '@/modules/auth/types/auth.types'

export type AuditEntityType = 'WORKER' | 'PROPERTY' | 'ROOM' | 'STAY' | 'USER'

export type AuditAction =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'CHECK_IN'
  | 'CHECK_OUT'
  | 'NO_SHOW'
  | 'MOVE'
  | 'BULK_ASSIGN'
  | 'IMPORT'
  | 'INSPECTION_COMPLETE'

export interface AuditActor {
  id: string
  firstName: string
  lastName: string
  role: UserRole
}

export type AuditDiff = Array<{
  field: string
  before: unknown
  after: unknown
}>

export interface AuditEvent {
  id: string
  actor: AuditActor
  action: AuditAction
  entityType: AuditEntityType
  entityId: string
  entityLabel: string
  diff: AuditDiff
  timestamp: string
  syncedAt: string | null
}

export interface GetAuditParams {
  page?: number
  size?: number
  entityType?: AuditEntityType
  entityId?: string
  actorId?: string
  action?: AuditAction
  dateFrom?: string
  dateTo?: string
}
