export type PropertyType = 'INTERNAL' | 'PARTNER'

export type PropertyStatus = 'ACTIVE' | 'INACTIVE'

export type GenderRule = 'PER_ROOM' | 'PER_PROPERTY' | 'MIXED'

export type RoomGenderRule = 'MALE_ONLY' | 'FEMALE_ONLY' | 'MIXED'

export type RoomStatus = 'ACTIVE' | 'BLOCKED'

export interface RoomSummary {
  totalRooms: number
  totalCapacity: number
  totalBlockedSpots: number
  currentOccupancy: number
}

export interface Property {
  id: string
  name: string
  address: string
  type: PropertyType
  genderRule: GenderRule
  status: PropertyStatus
  notes: string
  roomSummary: RoomSummary
  createdAt: string
  updatedAt: string
}

export interface CreatePropertyPayload {
  name: string
  address: string
  type: PropertyType
  genderRule: GenderRule
  notes?: string
}

export type UpdatePropertyPayload = Partial<CreatePropertyPayload>

export interface RoomOccupant {
  stayId: string
  worker: {
    id: string
    internalId: string
    firstName: string
    lastName: string
    gender: 'MALE' | 'FEMALE' | 'OTHER'
  }
  dateFrom: string
  dateTo: string | null
  status: string
}

export interface Room {
  id: string
  propertyId: string
  roomNumber: string
  capacity: number
  blockedSpots: number
  availableSpots: number
  currentOccupancy: number
  genderRule: RoomGenderRule
  floor: number
  status: RoomStatus
  notes: string
  occupants: RoomOccupant[]
  createdAt: string
}

export interface CreateRoomPayload {
  roomNumber: string
  capacity: number
  genderRule?: RoomGenderRule
  floor?: number
  notes?: string
}

export interface BulkCreateRoomsPayload {
  rooms: Omit<CreateRoomPayload, 'genderRule'>[]
  defaultGenderRule: RoomGenderRule
}

export type UpdateRoomPayload = Partial<CreateRoomPayload> & {
  blockedSpots?: number
}

export interface GetPropertiesParams {
  page?: number
  size?: number
  sort?: string
  status?: PropertyStatus
  type?: PropertyType
  search?: string
}

export interface GetRoomsParams {
  page?: number
  size?: number
  sort?: string
  status?: RoomStatus
  floor?: number
}
