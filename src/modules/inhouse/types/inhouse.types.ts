import type { CheckOutPayload, MovePayload } from '@/modules/stays/types/stay.types'
import type { OccupantSummary } from '@/shared/types/occupancy.types'

export type { OccupantSummary }

export type RoomOccupancyStatus = 'OK' | 'NEAR_CAPACITY' | 'OVER_CAPACITY' | 'BLOCKED'

export interface RoomOccupancy {
  roomId: string
  roomNumber: string
  floor: number
  bedCount: number
  availableBedCount: number
  occupiedSpots: number
  occupants: OccupantSummary[]
}

export type { CheckOutPayload, MovePayload as RoomMovePayload }

export type ExportFormat = 'csv' | 'pdf'
