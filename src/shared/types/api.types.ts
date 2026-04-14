export interface PaginatedResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export interface ApiError {
  error: string
  message: string
  details: string[]
  timestamp: string
  traceId: string
}
