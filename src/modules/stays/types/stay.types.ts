export type StayStatus =
  | 'PLANNED'
  | 'EXPECTED_TODAY'
  | 'CHECKED_IN'
  | 'CHECKED_OUT'
  | 'NO_SHOW'
  | 'REDIRECTED'
  | 'CANCELLED'

export interface Stay {
  id: string
  workerId: string
  propertyId: string
  roomId: string
  startDate: string
  endDate: string
  status: StayStatus
  source: 'AGENCY_PLANNED' | 'PROPERTY_CONFIRMED' | 'WALK_IN'
  createdBy: string
  confirmedBy?: string
  confirmedAt?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface StayCreatePayload {
  workerId: string
  propertyId: string
  roomId: string
  startDate: string
  endDate: string
}
