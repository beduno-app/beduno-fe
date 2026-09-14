export type StayStatus =
  | 'PLANNED'
  | 'EXPECTED_TODAY'
  | 'CHECKED_IN'
  | 'CHECKED_OUT'
  | 'NO_SHOW'
  | 'CANCELLED'

// The real API returns a flat record — worker/property/room are IDs, not nested
// objects. Resolve display data via `useEntityLookup` (src/shared/composables).
export interface Stay {
  id: string
  workerId: string
  propertyId: string
  roomId: string
  bedId: string | null
  bedAutoAssigned: boolean | null
  dateFrom: string
  dateTo: string | null
  status: StayStatus
  overrideReason: string | null
  noShowReason: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

export interface StayCreatePayload {
  workerId: string
  propertyId: string
  roomId: string
  bedId?: string
  dateFrom: string
  dateTo?: string
  overrideReason?: string
  notes?: string
}

export interface UpdateStayPayload {
  roomId: string
  bedId?: string
  dateFrom: string
  dateTo?: string
  overrideReason?: string
  notes?: string
}

export interface GetStaysParams {
  page?: number
  size?: number
  sort?: string
  workerId?: string
  propertyId?: string
  status?: StayStatus
  dateFrom?: string
  dateTo?: string
}

export interface NoShowPayload {
  noShowReason: string
}

export interface MovePayload {
  targetRoomId: string
  targetBedId?: string
  overrideReason?: string
}

export interface CheckOutPayload {
  actualDateTo?: string
}

export interface CheckInPayload {
  roomId?: string
  bedId?: string
  overrideReason?: string
}

export interface BulkAssignmentItem {
  workerId: string
  propertyId: string
  roomId: string
  bedId?: string
  dateFrom: string
  dateTo?: string
  overrideReason?: string
}

export interface BulkAssignPayload {
  assignments: BulkAssignmentItem[]
}

export interface BulkAssignResultItem {
  index: number
  workerId: string
  stayId?: string
  bedId?: string
  status: 'CREATED' | 'FAILED'
  errorCode?: string
}

export interface BulkAssignResponse {
  created: number
  errors: number
  results: BulkAssignResultItem[]
}

export interface BulkCheckoutPayload {
  stayIds: string[]
}

export interface BulkCheckoutResultItem {
  stayId: string
  status: string
  errorCode?: string
}

export interface BulkCheckoutResponse {
  checkedOut: number
  errors: number
  results: BulkCheckoutResultItem[]
}

export type HardConstraintType = 'CAPACITY_EXCEEDED' | 'DOUBLE_BOOKING' | 'ROOM_BLOCKED' | 'PROPERTY_BLOCKED'
export type SoftConstraintType = 'GENDER_MISMATCH' | 'WORKER_BLACKLISTED' | 'OVER_PLANNED'
export type ConstraintType = HardConstraintType | SoftConstraintType

export interface ConstraintViolation {
  type: ConstraintType
  message: string
  params: Record<string, string | number>
  overridable?: boolean
}

export interface ConstraintViolationResponse {
  error: 'CONSTRAINT_VIOLATION'
  message: string
  allowed: boolean
  hardViolations: ConstraintViolation[]
  softViolations: ConstraintViolation[]
  timestamp: string
}
