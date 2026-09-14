import { api } from '@/shared/composables/useApi'
import type { RoomOccupancy, CheckOutPayload, RoomMovePayload } from '../types/inhouse.types'
import type { Stay } from '@/modules/stays/types/stay.types'

export const inhouseApi = {
  getOccupancy: (propertyId: string, date?: string) =>
    api
      .get<RoomOccupancy[]>(`/properties/${propertyId}/occupancy`, { params: { date } })
      .then((r) => r.data),

  checkOut: (stayId: string, payload?: CheckOutPayload) =>
    api.post<Stay>(`/stays/${stayId}/check-out`, payload ?? {}).then((r) => r.data),

  moveRoom: (stayId: string, payload: RoomMovePayload) =>
    api.post<Stay>(`/stays/${stayId}/move`, payload).then((r) => r.data),

  bulkCheckout: (stayIds: string[]) =>
    api
      .post<{ checkedOut: number; errors: number }>('/stays/bulk-checkout', { stayIds })
      .then((r) => r.data),

  exportOccupancy: (propertyId: string, lang: string) =>
    api
      .get(`/properties/${propertyId}/occupancy/export`, {
        params: { language: lang },
        responseType: 'blob',
      })
      .then((r) => r.data as Blob),
}
