import { api } from '@/shared/composables/useApi'
import type {
  NightlyOccupancyParams,
  ExceptionReportParams,
  OccupancySummaryParams,
} from '../types/export.types'

export const exportsApi = {
  exportNightlyOccupancy: (params: NightlyOccupancyParams) =>
    api
      .get('/exports/nightly-occupancy', { params, responseType: 'blob' })
      .then((r) => r.data as Blob),

  exportExceptionReport: (params: ExceptionReportParams) =>
    api
      .get('/exports/exception-report', { params, responseType: 'blob' })
      .then((r) => r.data as Blob),

  exportOccupancySummary: (params: OccupancySummaryParams) =>
    api
      .get('/exports/occupancy-summary', { params, responseType: 'blob' })
      .then((r) => r.data as Blob),
}
