import type { WorkerSummary, PropertySummary, RoomSummary } from '@/modules/stays/types/stay.types'

export type PresenceStatus = 'PRESENT' | 'ABSENT' | 'UNCHECKED'

export type DiscrepancyReason =
  | 'WORKER_NOT_FOUND'
  | 'WRONG_ROOM'
  | 'LEFT_EARLY'
  | 'ARRIVED_LATE'
  | 'UNAUTHORIZED_GUEST'
  | 'OTHER'

export interface ExpectedOccupant {
  stayId: string
  worker: WorkerSummary
  presence: PresenceStatus
  discrepancyReason: DiscrepancyReason | null
  discrepancyNote: string | null
}

export interface UnexpectedPresence {
  id: string
  description: string
  reason: DiscrepancyReason
  note: string | null
}

export interface RoomInspection {
  room: RoomSummary
  expected: ExpectedOccupant[]
  unexpected: UnexpectedPresence[]
  verified: boolean
  verifiedAt: string | null
  verifiedBy: string | null
}

export interface Inspection {
  id: string
  property: PropertySummary
  rooms: RoomInspection[]
  startedAt: string
  completedAt: string | null
  startedBy: string
  summary: InspectionSummary | null
}

export interface InspectionSummary {
  totalRooms: number
  verifiedRooms: number
  totalExpected: number
  presentCount: number
  absentCount: number
  unexpectedCount: number
  discrepancyCount: number
}

export interface StartInspectionPayload {
  propertyId: string
}

export interface MarkPresencePayload {
  stayId: string
  presence: PresenceStatus
  discrepancyReason?: DiscrepancyReason
  discrepancyNote?: string
}

export interface AddUnexpectedPayload {
  roomId: string
  description: string
  reason: DiscrepancyReason
  note?: string
}

export interface VerifyRoomPayload {
  roomId: string
}
