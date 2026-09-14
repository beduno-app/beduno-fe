export type AuditEntityType = 'STAY' | 'WORKER' | 'ROOM' | 'PROPERTY' | 'BED' | 'USER'

export type AuditAction =
  | 'CREATED'
  | 'UPDATED'
  | 'DELETED'
  | 'CHECKED_IN'
  | 'CHECKED_OUT'
  | 'NO_SHOW'
  | 'CANCELLED'
  | 'MOVED'
  | 'BULK_ASSIGNED'
  | 'BULK_CHECKED_OUT'

export interface AuditEvent {
  id: string
  entityType: AuditEntityType
  entityId: string
  action: AuditAction
  actorUserId: string
  previousState: Record<string, unknown> | null
  newState: Record<string, unknown> | null
  reason: string | null
  createdAt: string
}

export interface GetAuditParams {
  page?: number
  size?: number
  entityType?: AuditEntityType
  entityId?: string
  actorUserId?: string
  dateFrom?: string
  dateTo?: string
}
