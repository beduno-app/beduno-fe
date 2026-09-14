/**
 * Single IndexedDB instance for the entire app.
 * All offline stores are created here so version upgrades are coordinated.
 */

export const DB_NAME = 'beduno-offline'
export const DB_VERSION = 3

let _db: IDBDatabase | null = null

export function openDb(): Promise<IDBDatabase> {
  if (_db) return Promise.resolve(_db)

  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)

    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result
      const tx = (e.target as IDBOpenDBRequest).transaction!

      // Snapshot stores (v1)
      if (!db.objectStoreNames.contains('workers')) {
        const ws = db.createObjectStore('workers', { keyPath: 'id' })
        ws.createIndex('internalId', 'internalId', { unique: false })
      }
      if (!db.objectStoreNames.contains('rooms')) {
        db.createObjectStore('rooms', { keyPath: 'id' })
      }
      if (!db.objectStoreNames.contains('arrivals')) {
        const as = db.createObjectStore('arrivals', { keyPath: 'id' })
        as.createIndex('workerId', 'workerId', { unique: false })
      } else if (e.oldVersion < 3) {
        // v3: the real API's stay records are flat (workerId, not a nested
        // worker.internalId) — swap the stale nested-path index for a flat one.
        const as = tx.objectStore('arrivals')
        if (as.indexNames.contains('workerInternalId')) {
          as.deleteIndex('workerInternalId')
        }
        if (!as.indexNames.contains('workerId')) {
          as.createIndex('workerId', 'workerId', { unique: false })
        }
      }
      if (!db.objectStoreNames.contains('meta')) {
        db.createObjectStore('meta', { keyPath: 'key' })
      }

      // Action queue (v2)
      if (!db.objectStoreNames.contains('actionQueue')) {
        db.createObjectStore('actionQueue', { keyPath: 'id' })
      }
    }

    req.onsuccess = (e) => {
      _db = (e.target as IDBOpenDBRequest).result
      resolve(_db)
    }

    req.onerror = () => reject(req.error)
  })
}
