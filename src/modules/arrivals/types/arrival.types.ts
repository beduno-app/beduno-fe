import type { WorkerSummary, PropertySummary, RoomSummary, StayStatus } from '@/modules/stays/types/stay.types'

export interface ArrivalStay {
  id: string
  worker: WorkerSummary
  property: PropertySummary
  room: RoomSummary
  dateFrom: string
  dateTo: string | null
  status: StayStatus
}

export interface GetArrivalsParams {
  propertyId: string
  date: string
  page?: number
  size?: number
}

export interface CheckInPayload {
  qrCode?: string
}

export interface NoShowPayload {
  reason: NoShowReason
  note?: string
}

export type NoShowReason =
  | 'DID_NOT_ARRIVE'
  | 'REFUSED_ROOM'
  | 'SENT_ELSEWHERE'
  | 'CANCELLED_BY_AGENCY'
  | 'OTHER'

export interface MovePayload {
  targetPropertyId: string
  targetRoomId: string
}
