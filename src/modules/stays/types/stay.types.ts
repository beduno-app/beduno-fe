export type StayStatus =
  | 'PLANNED'
  | 'EXPECTED_TODAY'
  | 'CHECKED_IN'
  | 'CHECKED_OUT'
  | 'NO_SHOW'
  | 'MOVED'
  | 'CANCELLED'

export interface WorkerSummary {
  id: string
  internalId: string
  firstName: string
  lastName: string
  gender: 'MALE' | 'FEMALE' | 'OTHER'
}

export interface PropertySummary {
  id: string
  name: string
  type: 'INTERNAL' | 'PARTNER'
}

export interface RoomSummary {
  id: string
  roomNumber: string
  capacity: number
  availableSpots: number
}

export interface UserSummary {
  id: string
  firstName: string
  lastName: string
}

export interface Stay {
  id: string
  worker: WorkerSummary
  property: PropertySummary
  room: RoomSummary
  dateFrom: string
  dateTo: string | null
  status: StayStatus
  overrideReason: string | null
  createdBy: UserSummary
  confirmedBy: UserSummary | null
  createdAt: string
  updatedAt: string
}

export interface StayCreatePayload {
  workerId: string
  propertyId: string
  roomId: string
  dateFrom: string
  dateTo: string
  overrideReason?: string
}
