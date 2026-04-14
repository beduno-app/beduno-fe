export type ExportReportType = 'NIGHTLY_OCCUPANCY' | 'EXCEPTION_REPORT' | 'OCCUPANCY_SUMMARY'

export type ExportFormat = 'csv' | 'pdf'

export type ExportLanguage = 'PL' | 'EN' | 'DE' | 'UA' | 'RU'

export interface NightlyOccupancyParams {
  propertyId: string
  date: string
  format: ExportFormat
  lang: ExportLanguage
}

export interface ExceptionReportParams {
  propertyId: string
  date: string
  format: ExportFormat
  lang: ExportLanguage
}

export interface OccupancySummaryParams {
  dateFrom: string
  dateTo: string
  format: ExportFormat
  lang: ExportLanguage
  propertyIds?: string[]
}
