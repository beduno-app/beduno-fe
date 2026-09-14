import { api } from '@/shared/composables/useApi'
import type {
  ArrivalStay,
  GetArrivalsParams,
  CheckInPayload,
  NoShowPayload,
  MovePayload,
} from '../types/arrival.types'

export const arrivalsApi = {
  getArrivals: (params: GetArrivalsParams) =>
    api.get<ArrivalStay[]>('/stays/arrivals', { params }).then((r) => r.data),

  checkIn: (stayId: string, payload?: CheckInPayload) =>
    api.post<ArrivalStay>(`/stays/${stayId}/check-in`, payload ?? {}).then((r) => r.data),

  noShow: (stayId: string, payload: NoShowPayload) =>
    api.post<ArrivalStay>(`/stays/${stayId}/no-show`, payload).then((r) => r.data),

  move: (stayId: string, payload: MovePayload) =>
    api.post<ArrivalStay>(`/stays/${stayId}/move`, payload).then((r) => r.data),
}
