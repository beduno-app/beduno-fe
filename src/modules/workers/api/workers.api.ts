import { api } from '@/shared/composables/useApi'
import type { PaginatedResponse } from '@/shared/types/api.types'
import type { Stay } from '@/modules/stays/types/stay.types'
import type {
  Worker,
  CreateWorkerPayload,
  UpdateWorkerPayload,
  ImportResult,
  GetWorkersParams,
  GetWorkerStaysParams,
} from '../types/worker.types'

export const workersApi = {
  getWorkers: (params?: GetWorkersParams) =>
    api.get<PaginatedResponse<Worker>>('/workers', { params }).then((r) => r.data),

  getWorker: (id: string) => api.get<Worker>(`/workers/${id}`).then((r) => r.data),

  createWorker: (payload: CreateWorkerPayload) =>
    api.post<Worker>('/workers', payload).then((r) => r.data),

  updateWorker: (id: string, payload: UpdateWorkerPayload) =>
    api.put<Worker>(`/workers/${id}`, payload).then((r) => r.data),

  deleteWorker: (id: string) => api.delete(`/workers/${id}`),

  importWorkers: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return api
      .post<ImportResult>('/workers/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data)
  },

  getWorkerStays: (id: string, params?: GetWorkerStaysParams) =>
    api.get<PaginatedResponse<Stay>>(`/workers/${id}/stays`, { params }).then((r) => r.data),
}
