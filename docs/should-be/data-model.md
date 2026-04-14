# Data Model & API Contracts

## Core Entities

### Worker

```typescript
interface Worker {
  id: string                    // UUID (system-generated)
  internalId: string            // agency's own ID (primary lookup key)
  name: string
  phone?: string
  gender?: 'MALE' | 'FEMALE'
  tags: string[]                // flexible: skills, nationality, notes
  status: 'ACTIVE' | 'INACTIVE' | 'BLACKLISTED'
  agencyId: string
  createdAt: string             // ISO 8601
  updatedAt: string
}
```

### Property

```typescript
interface Property {
  id: string
  name: string
  address: {
    street: string
    city: string
    postCode: string
    country: string             // ISO 3166-1 alpha-2
  }
  agencyId: string
  type: 'INTERNAL' | 'PARTNER'
  rules: PropertyRules
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface PropertyRules {
  genderSeparation: boolean     // if true, rooms enforce gender rule
  maxOccupancyStrict: boolean   // if true, over-capacity is hard-blocked
  curfew?: string               // e.g. "22:00"
  customRules?: string[]        // predefined localized tags
}
```

### Room

```typescript
interface Room {
  id: string
  propertyId: string
  label: string                 // e.g. "101", "A-3"
  capacity: number              // max spots (not beds — room-capacity model)
  genderRule?: 'MALE' | 'FEMALE' | 'ANY'
  isBlocked: boolean            // temporarily unavailable
  blockReason?: string          // predefined: 'MAINTENANCE' | 'RESERVED' | 'DAMAGE' | 'OTHER'
  notes?: string
  createdAt: string
  updatedAt: string
}
```

### Stay

```typescript
interface Stay {
  id: string
  workerId: string
  propertyId: string
  roomId: string
  startDate: string             // ISO 8601 date (no time)
  endDate: string
  status: StayStatus
  source: 'AGENCY_PLANNED' | 'PROPERTY_CONFIRMED' | 'WALK_IN'
  createdBy: string             // userId
  confirmedBy?: string          // userId (property side)
  confirmedAt?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

type StayStatus =
  | 'PLANNED'                   // agency created, not yet arrival day
  | 'EXPECTED_TODAY'            // system-set on arrival day
  | 'CHECKED_IN'               // property confirmed arrival
  | 'CHECKED_OUT'              // property confirmed departure
  | 'NO_SHOW'                  // didn't arrive by end of day
  | 'REDIRECTED'               // sent to another property
  | 'CANCELLED'                // stay cancelled before arrival
```

### AuditEvent

```typescript
interface AuditEvent {
  id: string
  actorId: string               // userId who performed the action
  actorRole: UserRole
  action: AuditAction
  entityType: 'WORKER' | 'PROPERTY' | 'ROOM' | 'STAY' | 'USER'
  entityId: string
  before: Record<string, unknown> | null
  after: Record<string, unknown> | null
  deviceId?: string
  offlineFlag: boolean          // true if action was queued offline
  syncedAt?: string             // when offline action was synced
  reason?: string               // predefined localized reason tag
  timestamp: string
}

type AuditAction =
  | 'CREATE' | 'UPDATE' | 'DELETE'
  | 'CHECK_IN' | 'CHECK_OUT'
  | 'MOVE_ROOM' | 'MARK_NO_SHOW' | 'REDIRECT'
  | 'BLOCK_ROOM' | 'UNBLOCK_ROOM'
  | 'BULK_IMPORT' | 'BULK_ASSIGN' | 'BULK_CHECKOUT'
  | 'LOGIN' | 'LOGOUT' | 'PERMISSION_CHANGE'
```

### User

```typescript
interface User {
  id: string
  name: string
  email: string
  phone?: string
  role: UserRole
  agencyId: string
  propertyId?: string           // set for property-scoped roles
  language: 'pl' | 'en' | 'de' | 'ua' | 'ru'
  isActive: boolean
  deviceIds: string[]           // for session/device revocation
  createdAt: string
  updatedAt: string
}

type UserRole =
  | 'AGENCY_ADMIN'
  | 'AGENCY_PLANNER'
  | 'PROPERTY_ADMIN'
  | 'FRONT_DESK'
  | 'SHIFT_LEAD'
```

---

## Permission Matrix

| Action | Agency Admin | Agency Planner | Property Admin | Front Desk / Shift Lead |
|--------|:-:|:-:|:-:|:-:|
| Manage users & roles | W | — | — | — |
| View audit log | R | R | R (own property) | — |
| Create/edit workers | W | W | — | — |
| Bulk import workers | W | W | — | — |
| Create/edit properties | W | — | R (own) | — |
| Manage rooms (capacity, rules) | — | — | W | — |
| Block/unblock rooms | — | — | W | W |
| Create planned stays | W | W | — | — |
| Check-in (confirm arrival) | — | — | W | W |
| Check-out | — | — | W | W |
| Move room (checked-in worker) | — | — | W | W |
| Mark no-show / redirect | — | — | W | W |
| View occupancy (all properties) | R | R | — | — |
| View occupancy (own property) | R | R | R | R |
| Export reports | W | W | W (own property) | — |
| Inspection mode | — | — | W | W |

`W` = read + write, `R` = read only, `—` = no access

---

## API Endpoints (Target)

### Auth
```
POST   /auth/login              { email, password } → { token, refreshToken, user }
POST   /auth/refresh            { refreshToken } → { token }
POST   /auth/logout             (revoke session)
```

### Workers
```
GET    /workers                 ?page&size&search&status&agencyId
GET    /workers/:id
POST   /workers                 { internalId, name, phone?, gender?, tags[] }
PUT    /workers/:id             (partial update)
POST   /workers/import          multipart/form-data (CSV)
DELETE /workers/:id             (soft delete → INACTIVE)
GET    /workers/:id/qr          → QR code image (contains internalId + checksum)
```

### Properties
```
GET    /properties              ?agencyId&isActive
GET    /properties/:id
POST   /properties              { name, address, type, rules }
PUT    /properties/:id
```

### Rooms
```
GET    /properties/:propertyId/rooms    ?isBlocked&genderRule
POST   /properties/:propertyId/rooms    { label, capacity, genderRule? }
PUT    /rooms/:id
PATCH  /rooms/:id/block         { reason }
PATCH  /rooms/:id/unblock
```

### Stays
```
GET    /stays                   ?propertyId&workerId&status&dateFrom&dateTo&page&size
POST   /stays                   { workerId, propertyId, roomId, startDate, endDate }
PUT    /stays/:id               (update dates, room)
DELETE /stays/:id               (cancel planned stay)
```

### Operations (property-side actions)
```
POST   /stays/:id/check-in     { deviceId? }
POST   /stays/:id/check-out    { deviceId?, reason? }
POST   /stays/:id/no-show      { reason? }
POST   /stays/:id/redirect     { targetPropertyId, targetRoomId?, reason? }
POST   /stays/:id/move-room    { newRoomId, reason? }
```

### Bulk Operations
```
POST   /stays/bulk-assign       { assignments: [{ workerId, propertyId, roomId, startDate, endDate }] }
POST   /stays/bulk-checkout     { stayIds: string[], reason? }
```

### Occupancy & Reports
```
GET    /occupancy/:propertyId                ?date (default today)
GET    /occupancy/:propertyId/arrivals       ?date (default today)
GET    /occupancy/:propertyId/inspection     ?date
GET    /occupancy/:propertyId/exceptions     ?date (over-capacity, unassigned, etc.)
GET    /reports/nightly          ?propertyId&date → CSV/PDF export
GET    /reports/occupancy-summary ?agencyId&dateFrom&dateTo
```

### Offline Sync
```
POST   /sync/actions            { actions: OfflineAction[] } → { applied[], conflicts[] }
GET    /sync/state              ?since=timestamp → delta of changes since last sync
```

### Audit
```
GET    /audit                   ?entityType&entityId&actorId&action&dateFrom&dateTo&page&size
```

### Users & Roles
```
GET    /users                   ?agencyId&role&propertyId
POST   /users                   { name, email, role, propertyId?, language }
PUT    /users/:id
DELETE /users/:id               (deactivate)
POST   /users/:id/revoke-sessions
```

---

## Conflict Detection Rules

When a stay is created or a check-in occurs, the system validates:

| Rule | Type | Behaviour |
|------|------|-----------|
| Room at capacity | Hard | Block action; return error with room details |
| Gender mismatch (if rule enabled) | Hard | Block action; return error |
| Worker already checked-in elsewhere | Hard | Block check-in; require check-out first |
| Room is blocked | Hard | Block assignment; show block reason |
| Double-booking (same worker, overlapping dates) | Hard | Block; return conflicting stay |
| Near-capacity (capacity - 1) | Soft | Allow but return warning |
| Worker tagged 'BLACKLISTED' | Hard | Block; return reason |

### Offline Conflict Resolution

When syncing offline actions:
1. Apply each action in queue order
2. If a hard conflict is detected, mark the action as `NEEDS_REVIEW`
3. Return all conflicts in the sync response
4. Property admin resolves via a "Conflict inbox" in the UI

---

## QR Code Specification

**Contents**: `bedok:{workerId}:{checksum}`

- `workerId` = the worker's `internalId` (not UUID)
- `checksum` = HMAC-SHA256 truncated to 8 hex chars (prevents forgery)
- **No PII** in the QR — app resolves ID to worker card on scan

**Carriers** (MVP):
- Printed badge (PDF generation endpoint)
- Paper list (batch print)
- Future: Apple/Google Wallet pass
