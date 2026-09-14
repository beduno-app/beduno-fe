import type { Worker } from '@/modules/workers/types/worker.types'
import type { Room } from '@/modules/properties/types/property.types'
import type { ArrivalStay } from '@/modules/arrivals/types/arrival.types'
import { openDb } from './db'

export interface OfflineSnapshot {
  propertyId: string
  savedAt: string
  workers: Worker[]
  rooms: Room[]
  arrivals: ArrivalStay[]
}

function clearStore(db: IDBDatabase, storeName: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite')
    const req = tx.objectStore(storeName).clear()
    req.onsuccess = () => resolve()
    req.onerror = () => reject(req.error)
  })
}

function putAll<T>(db: IDBDatabase, storeName: string, items: T[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite')
    const store = tx.objectStore(storeName)
    items.forEach((item) => store.put(item))
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

function getAll<T>(db: IDBDatabase, storeName: string): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly')
    const req = tx.objectStore(storeName).getAll()
    req.onsuccess = () => resolve(req.result as T[])
    req.onerror = () => reject(req.error)
  })
}

export async function saveSnapshot(snapshot: OfflineSnapshot): Promise<void> {
  const db = await openDb()

  await Promise.all([
    clearStore(db, 'workers'),
    clearStore(db, 'rooms'),
    clearStore(db, 'arrivals'),
  ])

  await Promise.all([
    putAll(db, 'workers', snapshot.workers),
    putAll(db, 'rooms', snapshot.rooms),
    putAll(db, 'arrivals', snapshot.arrivals),
  ])

  await putAll(db, 'meta', [
    { key: 'propertyId', value: snapshot.propertyId },
    { key: 'savedAt', value: snapshot.savedAt },
  ])
}

export async function loadSnapshot(): Promise<OfflineSnapshot | null> {
  const db = await openDb()

  const metaItems = await getAll<{ key: string; value: string }>(db, 'meta')
  const meta = Object.fromEntries(metaItems.map((m) => [m.key, m.value]))

  if (!meta.propertyId) return null

  const [workers, rooms, arrivals] = await Promise.all([
    getAll<Worker>(db, 'workers'),
    getAll<Room>(db, 'rooms'),
    getAll<ArrivalStay>(db, 'arrivals'),
  ])

  return {
    propertyId: meta.propertyId,
    savedAt: meta.savedAt,
    workers,
    rooms,
    arrivals,
  }
}

export async function getWorkerByInternalId(internalId: string): Promise<Worker | null> {
  const db = await openDb()

  return new Promise((resolve, reject) => {
    const tx = db.transaction('workers', 'readonly')
    const index = tx.objectStore('workers').index('internalId')
    const req = index.get(internalId)
    req.onsuccess = () => resolve((req.result as Worker) ?? null)
    req.onerror = () => reject(req.error)
  })
}

export async function getArrivalsByWorkerInternalId(internalId: string): Promise<ArrivalStay[]> {
  const worker = await getWorkerByInternalId(internalId)
  if (!worker) return []

  const db = await openDb()

  return new Promise((resolve, reject) => {
    const tx = db.transaction('arrivals', 'readonly')
    const index = tx.objectStore('arrivals').index('workerId')
    const req = index.getAll(worker.id)
    req.onsuccess = () => resolve(req.result as ArrivalStay[])
    req.onerror = () => reject(req.error)
  })
}
