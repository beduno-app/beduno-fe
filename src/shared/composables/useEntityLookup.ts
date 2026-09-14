import { workersApi } from '@/modules/workers/api/workers.api'
import { propertiesApi } from '@/modules/properties/api/properties.api'
import { adminApi } from '@/modules/admin/api/admin.api'
import type { Worker } from '@/modules/workers/types/worker.types'
import type { Property, Room } from '@/modules/properties/types/property.types'
import type { AuthUser } from '@/modules/auth/types/auth.types'

const workerCache = new Map<string, Worker>()
const propertyCache = new Map<string, Property>()
const roomCache = new Map<string, Room>()
const userCache = new Map<string, AuthUser>()

function roomKey(propertyId: string, roomId: string) {
  return `${propertyId}:${roomId}`
}

// Stay/arrival/occupancy responses carry only workerId/propertyId/roomId — this
// composable resolves those IDs to display data, backed by simple caches primed
// from already-loaded lists so most lookups avoid a network round-trip.
export function useEntityLookup() {
  async function getWorker(id: string): Promise<Worker | null> {
    const cached = workerCache.get(id)
    if (cached) return cached
    try {
      const worker = await workersApi.getWorker(id)
      workerCache.set(id, worker)
      return worker
    } catch {
      return null
    }
  }

  async function getProperty(id: string): Promise<Property | null> {
    const cached = propertyCache.get(id)
    if (cached) return cached
    try {
      const property = await propertiesApi.getProperty(id)
      propertyCache.set(id, property)
      return property
    } catch {
      return null
    }
  }

  async function getRoom(propertyId: string, roomId: string): Promise<Room | null> {
    const key = roomKey(propertyId, roomId)
    const cached = roomCache.get(key)
    if (cached) return cached
    try {
      const room = await propertiesApi.getRoom(propertyId, roomId)
      roomCache.set(key, room)
      return room
    } catch {
      return null
    }
  }

  async function getUser(id: string): Promise<AuthUser | null> {
    const cached = userCache.get(id)
    if (cached) return cached
    try {
      const user = await adminApi.getUser(id)
      userCache.set(id, user)
      return user
    } catch {
      return null
    }
  }

  function primeWorkers(workers: Worker[]) {
    for (const worker of workers) workerCache.set(worker.id, worker)
  }

  function primeProperties(properties: Property[]) {
    for (const property of properties) propertyCache.set(property.id, property)
  }

  function primeRooms(propertyId: string, rooms: Room[]) {
    for (const room of rooms) roomCache.set(roomKey(propertyId, room.id), room)
  }

  return { getWorker, getProperty, getRoom, getUser, primeWorkers, primeProperties, primeRooms }
}
