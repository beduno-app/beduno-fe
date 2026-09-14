export type PropertyStatus = 'ACTIVE' | 'INACTIVE'

export type RoomGenderRule = 'MALE_ONLY' | 'FEMALE_ONLY' | 'MIXED'

export type RoomStatus = 'ACTIVE' | 'BLOCKED'

export type BedStatus = 'ACTIVE' | 'BLOCKED'

export interface Property {
  id: string
  name: string
  address: string
  city: string
  status: PropertyStatus
  notes: string
  createdAt: string
  updatedAt: string
}

export interface CreatePropertyPayload {
  name: string
  address?: string
  city?: string
  notes?: string
}

export interface UpdatePropertyPayload {
  name: string
  address?: string
  city?: string
  notes?: string
  status: PropertyStatus
}

export interface OccupantWorker {
  id: string
  internalId: string
  firstName: string
  lastName: string
  gender: 'MALE' | 'FEMALE' | 'OTHER'
}

export interface RoomOccupant {
  stayId: string
  worker: OccupantWorker
  dateFrom: string
  dateTo: string | null
  status: string
}

export interface Room {
  id: string
  propertyId: string
  roomNumber: string
  floor: number
  bedCount: number
  availableBedCount: number
  genderRule: RoomGenderRule
  status: RoomStatus
  notes: string
  currentOccupancy: number
  occupants: RoomOccupant[]
  createdAt: string
  updatedAt: string
}

export interface CreateRoomPayload {
  roomNumber: string
  floor?: number
  genderRule?: RoomGenderRule
  notes?: string
}

export interface UpdateRoomPayload {
  roomNumber: string
  floor?: number
  genderRule: RoomGenderRule
  status: RoomStatus
  notes?: string
}

export interface Bed {
  id: string
  roomId: string
  label: string
  status: BedStatus
  createdAt: string
  updatedAt: string
}

export interface CreateBedPayload {
  label: string
}

export interface UpdateBedPayload {
  label: string
  status: BedStatus
}

export interface BulkGenerateBedsPayload {
  count: number
}

export interface GetPropertiesParams {
  page?: number
  size?: number
  sort?: string
  status?: PropertyStatus
  search?: string
}

export interface GetRoomsParams {
  page?: number
  size?: number
  sort?: string
}
