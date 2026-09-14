// Shared with the real beduno-be occupancy/inspection endpoints — used by both
// the inhouse (nightly list) and inspection modules.
export interface OccupantSummary {
  stayId: string
  workerId: string
  firstName: string
  lastName: string
  bedId: string | null
  bedLabel: string | null
}
