import { api } from '@/shared/composables/useApi'
import type { PaginatedResponse } from '@/shared/types/api.types'
import type {
  Property,
  CreatePropertyPayload,
  UpdatePropertyPayload,
  Room,
  CreateRoomPayload,
  BulkCreateRoomsPayload,
  UpdateRoomPayload,
  GetPropertiesParams,
  GetRoomsParams,
} from '../types/property.types'

export const propertiesApi = {
  // Properties
  getProperties: (params?: GetPropertiesParams) =>
    api.get<PaginatedResponse<Property>>('/properties', { params }).then((r) => r.data),

  getProperty: (id: string) => api.get<Property>(`/properties/${id}`).then((r) => r.data),

  createProperty: (payload: CreatePropertyPayload) =>
    api.post<Property>('/properties', payload).then((r) => r.data),

  updateProperty: (id: string, payload: UpdatePropertyPayload) =>
    api.put<Property>(`/properties/${id}`, payload).then((r) => r.data),

  deleteProperty: (id: string) => api.delete(`/properties/${id}`),

  // Rooms
  getRooms: (propertyId: string, params?: GetRoomsParams) =>
    api
      .get<PaginatedResponse<Room>>(`/properties/${propertyId}/rooms`, { params })
      .then((r) => r.data),

  getRoom: (propertyId: string, roomId: string) =>
    api.get<Room>(`/properties/${propertyId}/rooms/${roomId}`).then((r) => r.data),

  createRoom: (propertyId: string, payload: CreateRoomPayload) =>
    api.post<Room>(`/properties/${propertyId}/rooms`, payload).then((r) => r.data),

  bulkCreateRooms: (propertyId: string, payload: BulkCreateRoomsPayload) =>
    api.post<Room[]>(`/properties/${propertyId}/rooms/bulk`, payload).then((r) => r.data),

  updateRoom: (propertyId: string, roomId: string, payload: UpdateRoomPayload) =>
    api.put<Room>(`/properties/${propertyId}/rooms/${roomId}`, payload).then((r) => r.data),

  deleteRoom: (propertyId: string, roomId: string) =>
    api.delete(`/properties/${propertyId}/rooms/${roomId}`),
}
