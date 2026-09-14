import { workersApi } from '@/modules/workers/api/workers.api'
import { propertiesApi } from '@/modules/properties/api/properties.api'
import { arrivalsApi } from '@/modules/arrivals/api/arrivals.api'
import { saveSnapshot } from '@/shared/services/offlineDb'

const MAX_PAGE_SIZE = 500

export async function syncOfflineSnapshot(propertyId: string, date: string): Promise<void> {
  if (!propertyId || !navigator.onLine) return

  const [workersPage, roomsPage, arrivals] = await Promise.all([
    workersApi.getWorkers({ size: MAX_PAGE_SIZE }),
    propertiesApi.getRooms(propertyId, { size: MAX_PAGE_SIZE }),
    arrivalsApi.getArrivals({ propertyId, date }),
  ])

  await saveSnapshot({
    propertyId,
    savedAt: new Date().toISOString(),
    workers: workersPage.content,
    rooms: roomsPage.content,
    arrivals,
  })
}
