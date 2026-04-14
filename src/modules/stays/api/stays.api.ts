import { api } from '@/shared/composables/useApi'
import type { PaginatedResponse } from '@/shared/types/api.types'
import type {
  Stay,
  StayCreatePayload,
  UpdateStayPayload,
  GetStaysParams,
  BulkAssignPayload,
  BulkAssignResponse,
} from '../types/stay.types'

export const staysApi = {
  getStays: (params?: GetStaysParams) =>
    api.get<PaginatedResponse<Stay>>('/stays', { params }).then((r) => r.data),

  getStay: (id: string) => api.get<Stay>(`/stays/${id}`).then((r) => r.data),

  createStay: (payload: StayCreatePayload) =>
    api.post<Stay>('/stays', payload).then((r) => r.data),

  updateStay: (id: string, payload: UpdateStayPayload) =>
    api.put<Stay>(`/stays/${id}`, payload).then((r) => r.data),

  cancelStay: (id: string) => api.delete(`/stays/${id}`),

  bulkAssign: (payload: BulkAssignPayload) =>
    api.post<BulkAssignResponse>('/stays/bulk-assign', payload).then((r) => r.data),
}
