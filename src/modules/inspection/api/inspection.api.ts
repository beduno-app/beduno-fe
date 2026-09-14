import { api } from '@/shared/composables/useApi'
import type {
  InspectionRoomEntry,
  InspectionReportPayload,
  InspectionDiscrepancyResponse,
} from '../types/inspection.types'

export const inspectionApi = {
  getRoster: (propertyId: string, date?: string) =>
    api
      .get<InspectionRoomEntry[]>(`/properties/${propertyId}/inspection`, { params: { date } })
      .then((r) => r.data),

  submitReport: (propertyId: string, payload: InspectionReportPayload, date?: string) =>
    api
      .post<InspectionDiscrepancyResponse>(`/properties/${propertyId}/inspection`, payload, {
        params: { date },
      })
      .then((r) => r.data),
}
