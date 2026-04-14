import { api } from '@/shared/composables/useApi'
import type {
  InHouseResponse,
  CheckOutPayload,
  RoomMovePayload,
  ExportFormat,
  OccupantStay,
} from '../types/inhouse.types'

export const inhouseApi = {
  getInHouse: (propertyId: string) =>
    api.get<InHouseResponse>(`/properties/${propertyId}/in-house`).then((r) => r.data),

  checkOut: (stayId: string, payload?: CheckOutPayload) =>
    api.post<OccupantStay>(`/stays/${stayId}/check-out`, payload ?? {}).then((r) => r.data),

  moveRoom: (stayId: string, payload: RoomMovePayload) =>
    api.post<OccupantStay>(`/stays/${stayId}/move`, payload).then((r) => r.data),

  exportInHouse: (propertyId: string, format: ExportFormat, lang: string) =>
    api.get(`/properties/${propertyId}/in-house/export`, {
      params: { format, lang },
      responseType: 'blob',
    }).then((r) => r.data as Blob),
}
