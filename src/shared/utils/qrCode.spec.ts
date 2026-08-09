import { describe, it, expect } from 'vitest'
import { encodeQrData, decodeQrData } from './qrCode'

describe('encodeQrData', () => {
  it('produces beduno:{workerId}:{checksum} format', () => {
    const result = encodeQrData('worker-123')
    const parts = result.split(':')
    expect(parts).toHaveLength(3)
    expect(parts[0]).toBe('beduno')
    expect(parts[1]).toBe('worker-123')
    expect(parts[2]).toMatch(/^[0-9a-f]{4}$/)
  })

  it('is deterministic for the same workerId', () => {
    expect(encodeQrData('abc')).toBe(encodeQrData('abc'))
  })

  it('produces different checksums for different workerIds', () => {
    const a = encodeQrData('worker-1')
    const b = encodeQrData('worker-2')
    expect(a).not.toBe(b)
  })
})

describe('decodeQrData', () => {
  it('decodes a valid encoded QR string', () => {
    const encoded = encodeQrData('worker-abc')
    const result = decodeQrData(encoded)
    expect(result).toEqual({ workerId: 'worker-abc' })
  })

  it('returns null for wrong prefix', () => {
    expect(decodeQrData('other:worker-abc:1234')).toBeNull()
  })

  it('returns null for missing parts', () => {
    expect(decodeQrData('beduno:worker-abc')).toBeNull()
  })

  it('returns null for empty workerId', () => {
    expect(decodeQrData('beduno::1234')).toBeNull()
  })

  it('returns null for tampered checksum', () => {
    const encoded = encodeQrData('worker-xyz')
    const tampered = encoded.slice(0, -1) + (encoded.endsWith('0') ? '1' : '0')
    expect(decodeQrData(tampered)).toBeNull()
  })

  it('returns null for completely invalid string', () => {
    expect(decodeQrData('')).toBeNull()
    expect(decodeQrData('not-a-qr-code')).toBeNull()
  })

  it('round-trips correctly for various worker IDs', () => {
    const ids = ['a', 'worker-1', 'WORKER_99', '00000000-0000-0000-0000-000000000001']
    for (const id of ids) {
      const result = decodeQrData(encodeQrData(id))
      expect(result).toEqual({ workerId: id })
    }
  })
})
