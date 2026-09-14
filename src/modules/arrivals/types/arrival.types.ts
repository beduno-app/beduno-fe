import type { Stay, CheckInPayload, NoShowPayload, MovePayload } from '@/modules/stays/types/stay.types'

// The real API's GET /stays/arrivals returns the same flat Stay shape as
// every other stay endpoint — no separate arrival-specific response type.
export type ArrivalStay = Stay

export interface GetArrivalsParams {
  propertyId: string
  date?: string
}

export type { CheckInPayload, NoShowPayload, MovePayload }

export type NoShowReason =
  | 'DID_NOT_ARRIVE'
  | 'REFUSED_ROOM'
  | 'SENT_ELSEWHERE'
  | 'CANCELLED_BY_AGENCY'
  | 'OTHER'
