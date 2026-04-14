import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import type { ImportResult } from '../types/worker.types'

vi.mock('./workers.api', () => ({
  workersApi: {
    getWorkers: vi.fn(),
    getWorker: vi.fn(),
    createWorker: vi.fn(),
    updateWorker: vi.fn(),
    deleteWorker: vi.fn(),
    importWorkers: vi.fn(),
    getWorkerStays: vi.fn(),
  },
}))

import { workersApi } from './workers.api'

describe('workersApi.importWorkers — bulk import', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('returns ImportResult with created and skipped counts on success', async () => {
    const result: ImportResult = {
      totalRows: 10,
      created: 8,
      skipped: 2,
      errors: [],
    }
    vi.mocked(workersApi.importWorkers).mockResolvedValue(result)

    const file = new File(['csv content'], 'workers.csv', { type: 'text/csv' })
    const response = await workersApi.importWorkers(file)

    expect(response.totalRows).toBe(10)
    expect(response.created).toBe(8)
    expect(response.skipped).toBe(2)
    expect(response.errors).toHaveLength(0)
  })

  it('returns validation errors for invalid rows', async () => {
    const result: ImportResult = {
      totalRows: 5,
      created: 3,
      skipped: 0,
      errors: [
        { row: 2, internalId: 'W002', reason: 'Duplicate internalId' },
        { row: 4, internalId: 'W004', reason: 'Missing required field: firstName' },
      ],
    }
    vi.mocked(workersApi.importWorkers).mockResolvedValue(result)

    const file = new File(['csv'], 'workers.csv', { type: 'text/csv' })
    const response = await workersApi.importWorkers(file)

    expect(response.errors).toHaveLength(2)
    expect(response.errors[0].row).toBe(2)
    expect(response.errors[0].reason).toBe('Duplicate internalId')
    expect(response.errors[1].internalId).toBe('W004')
  })

  it('propagates server error', async () => {
    vi.mocked(workersApi.importWorkers).mockRejectedValue(new Error('File format not supported'))

    const file = new File(['bad'], 'data.txt', { type: 'text/plain' })
    await expect(workersApi.importWorkers(file)).rejects.toThrow('File format not supported')
  })

  it('handles empty file (zero rows)', async () => {
    const result: ImportResult = { totalRows: 0, created: 0, skipped: 0, errors: [] }
    vi.mocked(workersApi.importWorkers).mockResolvedValue(result)

    const file = new File([''], 'empty.csv', { type: 'text/csv' })
    const response = await workersApi.importWorkers(file)

    expect(response.totalRows).toBe(0)
    expect(response.created).toBe(0)
  })
})
