# Data Model & API Contracts

## Core Entities

### Worker

```typescript
interface Worker {
  id: string                    // UUID
  internalId: string            // agency's own ID
  firstName: string
  lastName: string
  phone: string
  gender: Gender                // 'MALE' | 'FEMALE' | 'OTHER'
  tags: string[]
  notes: string
  status: WorkerStatus          // 'ACTIVE' | 'INACTIVE' | 'BLACKLISTED'
  currentStay: CurrentStay | null
  createdAt: string
  updatedAt: string
}

interface CurrentStay {
  propertyId: string
  propertyName: string
  roomNumber: string
  since: string                 // LocalDate
}
```

### Property

```typescript
interface Property {
  id: string
  name: string
  address: string               // flat string, not nested object
  type: PropertyType            // 'INTERNAL' | 'PARTNER'
  genderRule: GenderRule        // 'PER_ROOM' | 'PER_PROPERTY' | 'MIXED'
  status: PropertyStatus        // 'ACTIVE' | 'INACTIVE'
  notes: string
  roomSummary: {
    totalRooms: number
    totalCapacity: number
    totalBlockedSpots: number
    currentOccupancy: number
  }
  createdAt: string
  updatedAt: string
}
```

### Room

```typescript
interface Room {
  id: string
  propertyId: string
  roomNumber: string            // e.g. "101", "A-3"
  capacity: number
  blockedSpots: number
  availableSpots: number
  currentOccupancy: number
  genderRule: RoomGenderRule    // 'MALE_ONLY' | 'FEMALE_ONLY' | 'MIXED'
  floor: number
  status: RoomStatus            // 'ACTIVE' | 'BLOCKED'
  notes: string
  occupants: RoomOccupant[]
  createdAt: string
}

interface RoomOccupant {
  stayId: string
  worker: {
    id: string
    internalId: string
    firstName: string
    lastName: string
    gender: 'MALE' | 'FEMALE' | 'OTHER'
  }
  dateFrom: string
  dateTo: string | null
  status: string                // StayStatus as a plain string
}
```

> **Gender rules operate at two levels with different unions.** The property-level
> `GenderRule` decides *where* the rule is enforced (`PER_ROOM` / `PER_PROPERTY` / `MIXED`);
> the room-level `RoomGenderRule` decides *what* the rule is (`MALE_ONLY` / `FEMALE_ONLY` /
> `MIXED`). They are not interchangeable.

### Stay

```typescript
interface Stay {
  id: string
  worker: WorkerSummary         // nested object, not just workerId
  property: PropertySummary     // nested object
  room: RoomSummary             // nested object
  dateFrom: string              // ISO 8601 date (no time)
  dateTo: string | null         // null = open-ended stay
  status: StayStatus
  overrideReason: string | null // for soft constraint overrides
  createdBy: UserSummary
  confirmedBy: UserSummary | null
  createdAt: string
  updatedAt: string
}

type StayStatus =
  | 'PLANNED'                   // agency created, not yet arrival day
  | 'EXPECTED_TODAY'            // system-set on arrival day
  | 'CHECKED_IN'               // property confirmed arrival
  | 'CHECKED_OUT'              // property confirmed departure
  | 'NO_SHOW'                  // didn't arrive by end of day
  | 'MOVED'                    // moved to another property/room
  | 'CANCELLED'                // stay cancelled before arrival
```

### AuditEvent

```typescript
interface AuditEvent {
  id: string
  actor: AuditActor
  action: AuditAction
  entityType: 'WORKER' | 'PROPERTY' | 'ROOM' | 'STAY' | 'USER'
  entityId: string
  entityLabel: string           // human-readable label for the entity
  diff: AuditDiff               // field-level changes, not whole-object snapshots
  timestamp: string
  syncedAt: string | null       // set when the action was replayed from the offline queue
}

interface AuditActor {
  id: string
  firstName: string
  lastName: string
  role: UserRole
}

type AuditDiff = Array<{
  field: string
  before: unknown
  after: unknown
}>

type AuditAction =
  | 'CREATE' | 'UPDATE' | 'DELETE'
  | 'CHECK_IN' | 'CHECK_OUT'
  | 'NO_SHOW' | 'MOVE'
  | 'BULK_ASSIGN' | 'IMPORT' | 'INSPECTION_COMPLETE'
```

### User

There is no separate admin read model — `AuthUser` is both the login payload's user and the
entity returned by the `/users` endpoints.

```typescript
interface AuthUser {
  id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  language: AppLanguage         // 'PL' | 'EN' | 'DE' | 'UA' | 'RU'
  assignedPropertyIds: string[] // for property-scoped roles
  status?: string               // 'ACTIVE' | 'INACTIVE' in practice, untyped in code
  lastLoginAt?: string
  createdAt?: string
}

type UserRole =
  | 'AGENCY_ADMIN'
  | 'AGENCY_PLANNER'
  | 'PROPERTY_ADMIN'
  | 'FRONT_DESK'
```

---

## Permission Matrix

See [roles-and-permissions.md](./roles-and-permissions.md), which holds the authoritative
matrix along with the gaps where the router does not yet enforce the stated policy. The
duplicate table that used to live here contradicted both that document and the shipped route
guards, so it has been removed.

---

## API Endpoints

The full endpoint contract — paths, request bodies, responses, roles, and error shapes — lives
in [api-specification.md](./api-specification.md). It is the single source of truth; this
document previously carried a duplicate summary that drifted out of date, so the copy has been
removed rather than maintained in two places.

---

## Conflict Detection Rules

When a stay is created or a check-in occurs, the system validates:

| Rule | Type | Behaviour |
|------|------|-----------|
| Room at capacity | Hard | Block action; return error with room details |
| Gender mismatch (if rule enabled) | Soft | Allow with override; return warning |
| Worker already checked-in elsewhere | Hard | Block check-in; require check-out first |
| Room is blocked | Hard | Block assignment; show block reason |
| Property is blocked | Hard | Block assignment; show property status |
| Double-booking (same worker, overlapping dates) | Hard | Block; return conflicting stay |
| Near-capacity (over-planned) | Soft | Allow with override; return warning |
| Worker tagged 'BLACKLISTED' | Soft | Allow with override; return warning |

### Conflict Response Format

When a 422 response is returned:

```typescript
interface ConstraintViolationResponse {
  error: 'CONSTRAINT_VIOLATION'
  message: string
  allowed: boolean              // false when any hard violation is present
  hardViolations: ConstraintViolation[]
  softViolations: ConstraintViolation[]
  timestamp: string
}

interface ConstraintViolation {
  type: ConstraintType          // machine-readable code, resolved via i18n
  message: string
  params: Record<string, string | number>  // interpolated into the localized message
  overridable?: boolean
}

type HardConstraintType =
  | 'CAPACITY_EXCEEDED' | 'DOUBLE_BOOKING' | 'ROOM_BLOCKED' | 'PROPERTY_BLOCKED'

type SoftConstraintType =
  | 'GENDER_MISMATCH' | 'WORKER_BLACKLISTED' | 'OVER_PLANNED'
```

---

## QR Code Specification

**Contents**: `beduno:{workerId}:{checksum}` — implemented in `src/shared/utils/qrCode.ts`

- `workerId` = the worker's `id` (UUID). `QrBadge.vue` encodes `worker.id`, not `internalId`.
- `checksum` = 4 lowercase hex chars from an unkeyed djb2 hash of `workerId`
- **No PII** in the QR — app resolves ID to worker card on scan

> ⚠️ **The checksum is an integrity check, not a security control.** It uses no secret, so
> anyone can compute a valid code for any worker UUID. It catches transcription and scan errors
> only — it does **not** prevent forgery. Treat badge possession as unverified: the state rule
> (a QR is only actionable when the worker is `EXPECTED_TODAY`/`CHECKED_IN` at that property)
> is what limits misuse. Moving to a signed, expiring token is tracked as an open decision.

**Carriers** (MVP):
- Printed badge (PDF generation endpoint)
- Paper list (batch print)
- Future: Apple/Google Wallet pass

---

## Offline Storage Model

The ops app persists to a single IndexedDB database, `beduno-offline`
(`src/shared/services/db.ts`). All object stores are declared there so version upgrades stay
coordinated — bump `DB_VERSION` when adding one.

| Store | Key | Contents |
|-------|-----|----------|
| `workers` | `id` | Cached workers for the selected property (indexed on `internalId`) |
| `rooms` | `id` | Cached rooms for the selected property |
| `arrivals` | `id` | Cached expected arrivals |
| `meta` | — | Snapshot bookkeeping (`propertyId`, `savedAt`) |
| `actionQueue` | `id` | Actions performed while offline, awaiting replay |

```typescript
type QueuedActionType = 'CHECK_IN' | 'CHECK_OUT' | 'MOVE' | 'NO_SHOW'

interface QueuedAction {
  id: string                    // `${timestamp}-${random}`
  type: QueuedActionType
  stayId: string
  payload: unknown
  queuedAt: string              // ISO timestamp
}

interface OfflineSnapshot {
  propertyId: string
  savedAt: string
  workers: Worker[]
  rooms: Room[]
  arrivals: ArrivalStay[]
}
```

Room, capacity, rule, and user edits are deliberately **not** queueable — they are online-only
so that offline replay can never invalidate capacity constraints. On reconnect the sync engine
(`src/modules/ops/store/sync.store.ts`) replays the queue in order; anything the server rejects
lands in the conflict inbox as "needs review" rather than being auto-merged.
