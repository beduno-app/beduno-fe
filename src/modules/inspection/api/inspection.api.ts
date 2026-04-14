import { api } from '@/shared/composables/useApi'
import type {
  Inspection,
  StartInspectionPayload,
  MarkPresencePayload,
  AddUnexpectedPayload,
  VerifyRoomPayload,
} from '../types/inspection.types'

export const inspectionApi = {
  start: (payload: StartInspectionPayload) =>
    api.post<Inspection>('/inspections', payload).then((r) => r.data),

  get: (inspectionId: string) =>
    api.get<Inspection>(`/inspections/${inspectionId}`).then((r) => r.data),

  markPresence: (inspectionId: string, payload: MarkPresencePayload) =>
    api.post<Inspection>(`/inspections/${inspectionId}/presence`, payload).then((r) => r.data),

  addUnexpected: (inspectionId: string, payload: AddUnexpectedPayload) =>
    api.post<Inspection>(`/inspections/${inspectionId}/unexpected`, payload).then((r) => r.data),

  verifyRoom: (inspectionId: string, payload: VerifyRoomPayload) =>
    api.post<Inspection>(`/inspections/${inspectionId}/verify`, payload).then((r) => r.data),

  complete: (inspectionId: string) =>
    api.post<Inspection>(`/inspections/${inspectionId}/complete`).then((r) => r.data),

  exportReport: (inspectionId: string, format: 'csv' | 'pdf', lang: string) =>
    api.get(`/inspections/${inspectionId}/export`, {
      params: { format, lang },
      responseType: 'blob',
    }).then((r) => r.data as Blob),
}
