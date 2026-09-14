import { propertiesApi } from '@/modules/properties/api/properties.api'
import { workersApi } from '@/modules/workers/api/workers.api'
import { staysApi } from '@/modules/stays/api/stays.api'
import type { DashboardSummary } from '../types/dashboard.types'

// There is no single agency-wide dashboard/summary endpoint on beduno-be —
// this composes the summary from the same paginated list endpoints the rest
// of the app already uses, reading only `totalElements` from each.
export const dashboardApi = {
  getSummary: async (): Promise<DashboardSummary> => {
    const today = new Date().toISOString().slice(0, 10)

    const [
      propertiesTotal,
      propertiesActive,
      workersTotal,
      workersActive,
      currentlyHoused,
      expectedToday,
      noShowsToday,
    ] = await Promise.all([
      propertiesApi.getProperties({ page: 0, size: 1 }),
      propertiesApi.getProperties({ page: 0, size: 1, status: 'ACTIVE' }),
      workersApi.getWorkers({ page: 0, size: 1 }),
      workersApi.getWorkers({ page: 0, size: 1, status: 'ACTIVE' }),
      staysApi.getStays({ page: 0, size: 1, status: 'CHECKED_IN' }),
      staysApi.getStays({ page: 0, size: 1, status: 'EXPECTED_TODAY', dateFrom: today, dateTo: today }),
      staysApi.getStays({ page: 0, size: 1, status: 'NO_SHOW', dateFrom: today, dateTo: today }),
    ])

    return {
      propertiesTotal: propertiesTotal.totalElements,
      propertiesActive: propertiesActive.totalElements,
      workersTotal: workersTotal.totalElements,
      workersActive: workersActive.totalElements,
      currentlyHoused: currentlyHoused.totalElements,
      expectedToday: expectedToday.totalElements,
      noShowsToday: noShowsToday.totalElements,
    }
  },
}
