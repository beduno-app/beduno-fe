export type WorkerStatus = 'ACTIVE' | 'INACTIVE' | 'BLACKLISTED'

export type Gender = 'MALE' | 'FEMALE' | 'OTHER'

export interface CurrentStay {
  propertyId: string
  propertyName: string
  roomNumber: string
  since: string
}

export interface Worker {
  id: string
  internalId: string
  firstName: string
  lastName: string
  phone: string
  gender: Gender
  tags: string[]
  notes: string
  status: WorkerStatus
  currentStay: CurrentStay | null
  createdAt: string
  updatedAt: string
}

export interface CreateWorkerPayload {
  internalId: string
  firstName: string
  lastName: string
  phone: string
  gender: Gender
  tags: string[]
  notes?: string
}

export type UpdateWorkerPayload = Partial<CreateWorkerPayload>

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
