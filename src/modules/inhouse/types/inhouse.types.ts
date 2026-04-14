import type { WorkerSummary, PropertySummary, RoomSummary, StayStatus } from '@/modules/stays/types/stay.types'

export type RoomOccupancyStatus = 'OK' | 'NEAR_CAPACITY' | 'OVER_CAPACITY' | 'BLOCKED'

export interface OccupantStay {
  id: string
  worker: WorkerSummary
  dateFrom: string
  dateTo: string | null
  status: StayStatus
}

export interface RoomOccupancy {
  room: RoomSummary
  status: RoomOccupancyStatus
  occupants: OccupantStay[]
  blocked: boolean
  blockReason: string | null
}

export interface InHouseResponse {
  property: PropertySummary
  rooms: RoomOccupancy[]
  unassignedWorkers: OccupantStay[]
  summary: InHouseSummary
}

export interface InHouseSummary {
  totalRooms: number
  totalCapacity: number
  totalOccupants: number
  overCapacityRooms: number
  nearCapacityRooms: number
  blockedRooms: number
}

export interface CheckOutPayload {
  note?: string
}

export interface RoomMovePayload {
  targetRoomId: string
}

export interface BulkCheckoutPayload {
  stayIds: string[]
}

export interface BulkCheckoutResponse {
  total: number
  succeeded: number
  failed: number
}

export type ExportFormat = 'csv' | 'pdf'
