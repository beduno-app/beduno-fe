import { describe, it, expect } from 'vitest'
import { formatDate, formatDateTime } from './formatDate'

describe('formatDate', () => {
  it('returns em dash for null', () => {
    expect(formatDate(null, 'en')).toBe('—')
  })

  it('returns em dash for undefined', () => {
    expect(formatDate(undefined, 'en')).toBe('—')
  })

  it('returns em dash for empty string', () => {
    expect(formatDate('', 'en')).toBe('—')
  })

  it('formats a date in English (GB) locale', () => {
    // 2024-03-15 → dd/mm/yyyy in en-GB
    const result = formatDate('2024-03-15', 'en')
    expect(result).toMatch(/15/)
    expect(result).toMatch(/03/)
    expect(result).toMatch(/2024/)
  })

  it('formats a date in Polish locale', () => {
    const result = formatDate('2024-03-15', 'pl')
    expect(result).toMatch(/15/)
    expect(result).toMatch(/2024/)
  })

  it('formats a date in German locale', () => {
    const result = formatDate('2024-03-15', 'de')
    expect(result).toMatch(/15/)
    expect(result).toMatch(/2024/)
  })

  it('falls back to en-GB for unknown locale', () => {
    const knownResult = formatDate('2024-03-15', 'en')
    const unknownResult = formatDate('2024-03-15', 'zz')
    expect(unknownResult).toBe(knownResult)
  })

  it('handles all supported locales without throwing', () => {
    const locales = ['pl', 'en', 'de', 'ua', 'ru']
    for (const locale of locales) {
      expect(() => formatDate('2024-06-01', locale)).not.toThrow()
    }
  })
})

describe('formatDateTime', () => {
  it('returns em dash for null', () => {
    expect(formatDateTime(null, 'en')).toBe('—')
  })

  it('returns em dash for undefined', () => {
    expect(formatDateTime(undefined, 'en')).toBe('—')
  })

  it('includes both date and time parts', () => {
    const result = formatDateTime('2024-03-15T14:30:00Z', 'en')
    expect(result).toMatch(/2024/)
    // Should contain hour and minute digits
    expect(result.length).toBeGreaterThan(10)
  })

  it('handles all supported locales without throwing', () => {
    const locales = ['pl', 'en', 'de', 'ua', 'ru']
    for (const locale of locales) {
      expect(() => formatDateTime('2024-06-01T10:00:00Z', locale)).not.toThrow()
    }
  })
})
