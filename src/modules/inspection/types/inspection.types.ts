import type { OccupantSummary } from '@/shared/types/occupancy.types'

export type { OccupantSummary }

export interface InspectionRoomEntry {
  roomId: string
  roomNumber: string
  floor: number
  expectedOccupants: OccupantSummary[]
  checkedInOccupants: OccupantSummary[]
}

export interface RoomActualOccupancy {
  roomId: string
  presentWorkerIds: string[]
}

export interface InspectionReportPayload {
  rooms: RoomActualOccupancy[]
}

export interface WorkerDiscrepancy {
  workerId: string
  discrepancyType: string
}

export interface RoomDiscrepancy {
  roomId: string
  roomNumber: string
  items: WorkerDiscrepancy[]
}

export interface InspectionDiscrepancyResponse {
  discrepancies: RoomDiscrepancy[]
  hasDiscrepancies: boolean
}
