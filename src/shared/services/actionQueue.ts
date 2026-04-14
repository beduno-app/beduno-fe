/**
 * Offline action queue backed by IndexedDB.
 * Stores check-in / check-out / move / no-show actions when offline.
 * The sync engine replays these on reconnect.
 */
import { openDb } from './db'

export type QueuedActionType = 'CHECK_IN' | 'CHECK_OUT' | 'MOVE' | 'NO_SHOW'

export interface QueuedAction {
  id: string
  type: QueuedActionType
  stayId: string
  payload: unknown
  queuedAt: string
}

const STORE = 'actionQueue'

export async function enqueueAction(
  type: QueuedActionType,
  stayId: string,
  payload: unknown = {},
): Promise<QueuedAction> {
  const db = await openDb()
  const action: QueuedAction = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    type,
    stayId,
    payload,
    queuedAt: new Date().toISOString(),
  }

  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).put(action)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })

  return action
}

export async function getPendingActions(): Promise<QueuedAction[]> {
  const db = await openDb()

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly')
    const req = tx.objectStore(STORE).getAll()
    req.onsuccess = () => resolve(req.result as QueuedAction[])
    req.onerror = () => reject(req.error)
  })
}

export async function removeAction(id: string): Promise<void> {
  const db = await openDb()

  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).delete(id)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function clearQueue(): Promise<void> {
  const db = await openDb()

  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).clear()
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function getQueueLength(): Promise<number> {
  const db = await openDb()

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly')
    const req = tx.objectStore(STORE).count()
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}
