export type WorkerStatus = 'ACTIVE' | 'INACTIVE' | 'DELETED'

export type Gender = 'MALE' | 'FEMALE' | 'OTHER'

// The API worker record does not carry the worker's active stay — resolve it
// via the stays list (see WorkerDetail.vue) when needed.
export interface Worker {
  id: string
  internalId: string
  firstName: string
  lastName: string
  gender: Gender
  nationality: string
  phone: string
  email: string
  dateOfBirth: string
  tags: string[]
  notes: string
  status: WorkerStatus
  createdAt: string
  updatedAt: string
}

export interface CreateWorkerPayload {
  internalId: string
  firstName: string
  lastName: string
  gender: Gender
  nationality?: string
  phone?: string
  email?: string
  dateOfBirth?: string
  tags?: string[]
  notes?: string
}

export interface UpdateWorkerPayload {
  firstName: string
  lastName: string
  gender: Gender
  status: WorkerStatus
  nationality?: string
  phone?: string
  email?: string
  dateOfBirth?: string
  tags?: string[]
  notes?: string
}

export interface ImportResult {
  totalRows: number
  created: number
  skipped: number
  errors: ImportError[]
}

export interface ImportError {
  row: number
  internalId: string
  reason: string
}

export interface GetWorkersParams {
  page?: number
  size?: number
  sort?: string
  status?: WorkerStatus
  gender?: Gender
  tag?: string
  search?: string
}

export interface GetWorkerStaysParams {
  page?: number
  size?: number
  status?: string
  dateFrom?: string
  dateTo?: string
}
