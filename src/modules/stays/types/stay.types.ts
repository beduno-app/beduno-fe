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

export interface UpdateStayPayload {
  roomId?: string
  dateFrom?: string
  dateTo?: string
}

export interface GetStaysParams {
  page?: number
  size?: number
  sort?: string
  workerId?: string
  propertyId?: string
  roomId?: string
  status?: StayStatus
  dateFrom?: string
  dateTo?: string
}

export interface BulkAssignmentItem {
  workerId: string
  propertyId: string
  roomId: string
  dateFrom: string
  dateTo?: string
}

export interface BulkAssignPayload {
  assignments: BulkAssignmentItem[]
}

export interface BulkAssignResultItem {
  workerId: string
  stayId?: string
  status: 'CREATED' | 'FAILED'
  error?: ConstraintError
}

export interface BulkAssignResponse {
  total: number
  succeeded: number
  failed: number
  results: BulkAssignResultItem[]
}

export interface ConstraintError {
  type: ConstraintType
  message: string
  params: Record<string, string | number>
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
