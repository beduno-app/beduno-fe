/**
 * Utilities for encoding and decoding BedOK QR codes.
 *
 * Format: bedok:{workerId}:{checksum}
 * Checksum: 4-character lowercase hex derived from a simple djb2 hash of workerId.
 */

const PREFIX = 'bedok'

function checksum(value: string): string {
  let hash = 5381
  for (let i = 0; i < value.length; i++) {
    hash = ((hash << 5) + hash) ^ value.charCodeAt(i)
    hash = hash >>> 0 // keep as 32-bit unsigned int
  }
  return (hash & 0xffff).toString(16).padStart(4, '0')
}

export function encodeQrData(workerId: string): string {
  return `${PREFIX}:${workerId}:${checksum(workerId)}`
}

export interface DecodedQr {
  workerId: string
}

export function decodeQrData(raw: string): DecodedQr | null {
  const parts = raw.split(':')
  if (parts.length !== 3) return null
  const [prefix, workerId, expectedChecksum] = parts
  if (prefix !== PREFIX) return null
  if (!workerId) return null
  if (checksum(workerId) !== expectedChecksum) return null
  return { workerId }
}
