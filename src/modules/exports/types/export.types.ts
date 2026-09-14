export type ExportLanguage = 'PL' | 'EN' | 'DE' | 'UA' | 'RU'

export interface PropertyExportParams {
  propertyId: string
  date?: string
  language?: ExportLanguage
}
