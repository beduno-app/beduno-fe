# Data Model & API Contracts

## Core Entities

### Worker

```typescript
interface Worker {
  id: string                    // UUID
  internalId: string            // agency's own ID
  firstName: string
  lastName: string
  phone?: string
  gender: 'MALE' | 'FEMALE' | 'OTHER'
  tags: string[]
  notes?: string
  status: 'ACTIVE' | 'INACTIVE' | 'BLACKLISTED'
  currentStay?: {
    propertyId: string
    propertyName: string
    roomNumber: string
    since: string               // LocalDate
  }
  createdAt: string
  updatedAt: string
}
```

### Property

```typescript
interface Property {
  id: string
  name: string
  address: string               // flat string, not nested object
  type: 'INTERNAL' | 'PARTNER'
  genderRule: 'MIXED' | 'MALE_ONLY' | 'FEMALE_ONLY' | 'PER_ROOM'
  status: 'ACTIVE' | 'BLOCKED' | 'MAINTENANCE'
  notes?: string
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
  genderRule: 'MIXED' | 'MALE_ONLY' | 'FEMALE_ONLY' | 'PER_ROOM'
  floor: number
  status: 'ACTIVE' | 'BLOCKED' | 'MAINTENANCE'
  notes?: string
  occupants: StayOccupant[]
  createdAt: string
}
```

### Stay

```typescript
interface Stay {
  id: string
  worker: WorkerSummary         // nested object, not just workerId
  property: PropertySummary     // nested object
  room: RoomSummary             // nested object
  dateFrom: string              // ISO 8601 date (no time)
  dateTo: string
  status: StayStatus
  overrideReason?: string       // for soft constraint overrides
  createdBy: UserSummary
  confirmedBy?: UserSummary
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
  entityType: 'WORKER' | 'PROPERTY' | 'ROOM' | 'STAY' | 'USER'
  entityId: string
  action: AuditAction
  performedBy: {
    id: string
    firstName: string
    lastName: string
    role: UserRole
  }
  previousState: Record<string, unknown> | null
  newState: Record<string, unknown> | null
  reasonTag?: string
  notes?: string
  createdAt: string
}

type AuditAction =
  | 'CREATED' | 'UPDATED' | 'DELETED'
  | 'CHECKED_IN' | 'CHECKED_OUT'
  | 'NO_SHOW' | 'MOVED' | 'CANCELLED'
  | 'IMPORTED' | 'BULK_ASSIGNED' | 'BULK_CHECKED_OUT'
```

### User

```typescript
interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  language: 'PL' | 'EN' | 'DE' | 'UA' | 'RU'
  assignedPropertyIds: string[] // for property-scoped roles
  status: 'ACTIVE' | 'INACTIVE'
  lastLoginAt?: string
  createdAt: string
}

type UserRole =
  | 'AGENCY_ADMIN'
  | 'AGENCY_PLANNER'
  | 'PROPERTY_ADMIN'
  | 'FRONT_DESK'
```

---

## Permission Matrix

| Action | Agency Admin | Agency Planner | Property Admin | Front Desk |
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
| Inspection mode | — | — | W | — |

`W` = read + write, `R` = read only, `—` = no access

---

## API Endpoints (Target)

### Auth
```
POST   /api/v1/auth/login              { email, password } → { token, refreshToken, user }
POST   /api/v1/auth/refresh            { refreshToken } → { token }
POST   /api/v1/auth/logout             (revoke session)
GET    /api/v1/auth/me                 → { user }
```

### Workers
```
GET    /api/v1/workers                 ?page&size&search&status
GET    /api/v1/workers/:id
POST   /api/v1/workers                 { internalId, firstName, lastName, phone?, gender, tags[] }
PUT    /api/v1/workers/:id             (partial update)
POST   /api/v1/workers/import          multipart/form-data (CSV)
DELETE /api/v1/workers/:id             (soft delete → INACTIVE)
GET    /api/v1/workers/:id/stays       → stays for worker
GET    /api/v1/workers/:id/qr          → QR code image (contains internalId + checksum)
```

### Properties
```
GET    /api/v1/properties              ?status
GET    /api/v1/properties/:id
POST   /api/v1/properties              { name, address, type, genderRule }
PUT    /api/v1/properties/:id
```

### Rooms
```
GET    /api/v1/properties/:propertyId/rooms      ?status&genderRule
POST   /api/v1/properties/:propertyId/rooms      { roomNumber, capacity, genderRule, floor }
POST   /api/v1/properties/:propertyId/rooms/bulk  [{ roomNumber, capacity, genderRule, floor }]
PUT    /api/v1/properties/:propertyId/rooms/:id
```

### Stays
```
GET    /api/v1/stays                   ?propertyId&workerId&status&dateFrom&dateTo&page&size
POST   /api/v1/stays                   { workerId, propertyId, roomId, dateFrom, dateTo }
PUT    /api/v1/stays/:id               (update dates, room)
DELETE /api/v1/stays/:id               (cancel planned stay)
```

### Operations (property-side actions)
```
POST   /api/v1/stays/:id/check-in     { }
POST   /api/v1/stays/:id/check-out    { reason? }
POST   /api/v1/stays/:id/no-show      { reason? }
POST   /api/v1/stays/:id/move         { targetPropertyId?, targetRoomId, reason? }
```

### Bulk Operations
```
POST   /api/v1/stays/bulk-assign       { assignments: [{ workerId, propertyId, roomId, dateFrom, dateTo }] }
POST   /api/v1/stays/bulk-checkout     { stayIds: string[], reason? }
```

### Occupancy & Reports
```
GET    /api/v1/properties/:id/occupancy           ?date (default today)
GET    /api/v1/properties/:id/occupancy/export    ?date → CSV/PDF export
GET    /api/v1/properties/:id/exceptions          ?date (over-capacity, unassigned, etc.)
GET    /api/v1/stays/arrivals                     ?propertyId&date (default today)
```

### Inspection
```
GET    /api/v1/properties/:id/inspection          ?date
POST   /api/v1/properties/:id/inspection          { roomId, status, notes? }
```

### Dashboard
```
GET    /api/v1/dashboard                          → agency-wide summary
GET    /api/v1/properties/:id/dashboard           → property-level summary
```

### Audit
```
GET    /api/v1/audit                   ?entityType&entityId&action&dateFrom&dateTo&page&size
```

### Users & Roles
```
GET    /api/v1/users                   ?role&propertyId
POST   /api/v1/users                   { email, firstName, lastName, role, assignedPropertyIds?, language }
PUT    /api/v1/users/:id
DELETE /api/v1/users/:id               (deactivate)
PUT    /api/v1/users/me/language       { language }
```

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
{
  hardViolations: Array<{
    code: string
    message: string
    overridable: false
  }>
  softViolations: Array<{
    code: string
    message: string
    overridable: true
  }>
}
```

---

## QR Code Specification

**Contents**: `beduno:{workerId}:{checksum}`

- `workerId` = the worker's `internalId` (not UUID)
- `checksum` = HMAC-SHA256 truncated to 8 hex chars (prevents forgery)
- **No PII** in the QR — app resolves ID to worker card on scan

**Carriers** (MVP):
- Printed badge (PDF generation endpoint)
- Paper list (batch print)
- Future: Apple/Google Wallet pass
