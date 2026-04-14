import { api } from '@/shared/composables/useApi'
import type { PaginatedResponse } from '@/shared/types/api.types'
import type { AuditEvent, AuditEntityType, GetAuditParams } from '../types/audit.types'

export const auditApi = {
  getEvents: (params?: GetAuditParams) =>
    api.get<PaginatedResponse<AuditEvent>>('/audit', { params }).then((r) => r.data),

  getEntityEvents: (
    entityType: AuditEntityType,
    entityId: string,
    params?: Pick<GetAuditParams, 'page' | 'size'>,
  ) =>
    api
      .get<PaginatedResponse<AuditEvent>>('/audit', { params: { ...params, entityType, entityId } })
      .then((r) => r.data),
}
