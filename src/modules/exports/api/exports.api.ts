import { api } from '@/shared/composables/useApi'
import type { PropertyExportParams } from '../types/export.types'

function toParams({ date, language }: PropertyExportParams) {
  return { date, language }
}

export const exportsApi = {
  exportOccupancy: (params: PropertyExportParams) =>
    api
      .get(`/properties/${params.propertyId}/occupancy/export`, {
        params: toParams(params),
        responseType: 'blob',
      })
      .then((r) => r.data as Blob),

  exportExceptions: (params: PropertyExportParams) =>
    api
      .get(`/properties/${params.propertyId}/exceptions/export`, {
        params: toParams(params),
        responseType: 'blob',
      })
      .then((r) => r.data as Blob),

  exportArrivals: (params: PropertyExportParams) =>
    api
      .get(`/properties/${params.propertyId}/arrivals/export`, {
        params: toParams(params),
        responseType: 'blob',
      })
      .then((r) => r.data as Blob),
}
