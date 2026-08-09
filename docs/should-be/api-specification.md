# Beduno Backend - API Specification

> **For the frontend team.** All endpoints are REST/JSON. Base URL: `/api/v1`. OpenAPI spec will be auto-generated at `/swagger-ui.html` and `/v3/api-docs` — use it to generate TypeScript API clients.

---

## General Conventions

### Authentication
All endpoints (except `/api/v1/auth/**`) require a JWT Bearer token in the `Authorization` header.

```
Authorization: Bearer <token>
```

The JWT contains: `userId`, `agencyId`, `role`, `properties[]` (assigned property IDs), `lang`.

The frontend attaches the header to **every** request once a token is stored, including
`/auth/**` — the backend should ignore it there rather than reject it.

**401 contract (implemented in `src/shared/composables/useApi.ts`).** The client treats a 401
as recoverable exactly once:

1. A 401 from any endpoint triggers a single `POST /auth/refresh`; concurrent 401s queue behind
   that one refresh and are retried with the new token.
2. A 401 from `/auth/refresh` itself — or a 401 when no refresh token is held — is **terminal**:
   the client clears its session and redirects to login. This is the device-revocation path.
3. A retried request is never retried a second time.

Backend changes to 401 semantics will silently break this interceptor, so treat the above as
part of the contract.

**CSRF signal.** Every request carries `X-Requested-With: XMLHttpRequest`. Browsers never
attach this header on simple cross-site requests, so its presence marks the call as an
intentional XHR from the app. **CORS configuration must allow this header** or every
cross-origin request fails preflight.

### Pagination
All list endpoints support pagination:
```
GET /api/v1/workers?page=0&size=20&sort=lastName,asc
```

Paginated response shape:
```json
{
  "content": [ ... ],
  "page": 0,
  "size": 20,
  "totalElements": 142,
  "totalPages": 8
}
```

### Error Response
All errors follow the same shape:
```json
{
  "error": "NOT_FOUND",
  "message": "error.worker.not_found",
  "details": [],
  "timestamp": "2026-04-14T12:00:00Z",
  "traceId": "abc-123"
}
```

- `message` is always a **message code** (never a raw string) — resolve it to the user's language on the frontend using the i18n bundle
- `details[]` provides field-level or constraint-level specifics (see Constraint Violations below)

### Common HTTP Status Codes

| Status | Meaning |
|--------|---------|
| 200 | Success (read, update) |
| 201 | Created (with `Location` header) |
| 204 | No Content (delete) |
| 400 | Validation error (missing/invalid fields) |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (insufficient role) |
| 404 | Not found |
| 409 | Conflict (e.g., duplicate internal ID) |
| 422 | Business rule violation (constraint engine) |

### Timestamps & Dates
- All timestamps are **UTC ISO 8601** (`2026-04-14T12:00:00Z`)
- Stay dates (`dateFrom`, `dateTo`) are **LocalDate** (`2026-04-14`) — calendar dates, not instants
- All IDs are **UUID** strings

### Multi-Tenancy
Tenant isolation is automatic. The JWT determines which agency's data is returned. The frontend never sends `agencyId` explicitly.

---

## Enums

### Role
```
AGENCY_ADMIN | AGENCY_PLANNER | PROPERTY_ADMIN | FRONT_DESK
```

### Language
```
PL | EN | DE | UA | RU
```

### WorkerStatus
```
ACTIVE | INACTIVE | BLACKLISTED
```

### PropertyType
```
INTERNAL | PARTNER
```

### GenderRule (Property level)
```
PER_ROOM | PER_PROPERTY | MIXED
```
Decides *where* the gender rule is enforced.

### RoomGenderRule (Room level)
```
MALE_ONLY | FEMALE_ONLY | MIXED
```
Decides *what* the rule is. The two enums are distinct and not interchangeable — a property
never carries `MALE_ONLY`, and a room never carries `PER_ROOM`.

### Gender
```
MALE | FEMALE | OTHER
```

### PropertyStatus
```
ACTIVE | INACTIVE
```

### RoomStatus
```
ACTIVE | BLOCKED
```

Property and room status are separate enums with different members. There is no shared
`EntityStatus`, and no `MAINTENANCE` state on either.

### StayStatus
```
PLANNED | EXPECTED_TODAY | CHECKED_IN | CHECKED_OUT | NO_SHOW | MOVED | CANCELLED
```

State machine:
```
PLANNED ──> EXPECTED_TODAY ──> CHECKED_IN ──> CHECKED_OUT
  │               │                 │
  │               ├──> NO_SHOW      ├──> MOVED
  │               │                 │
  └──> CANCELLED  └──> CANCELLED    └──> CANCELLED
```

### AuditAction
```
CREATE | UPDATE | DELETE | CHECK_IN | CHECK_OUT | NO_SHOW | MOVE | BULK_ASSIGN | IMPORT | INSPECTION_COMPLETE
```
Imperative, not past tense. There is no `CANCELLED` or `BULK_CHECKED_OUT` action.

---

## 1. Authentication

### POST /api/v1/auth/login
Log in and receive tokens.

**Request:**
```json
{
  "email": "jan@agency.pl",
  "password": "secret"
}
```

**Response 200:**
```json
{
  "accessToken": "eyJhbG...",
  "refreshToken": "eyJhbG...",
  "expiresIn": 3600,
  "user": {
    "id": "uuid",
    "email": "jan@agency.pl",
    "firstName": "Jan",
    "lastName": "Kowalski",
    "role": "AGENCY_ADMIN",
    "language": "PL",
    "assignedPropertyIds": []
  }
}
```

**Response 401:**
```json
{
  "error": "UNAUTHORIZED",
  "message": "error.auth.invalid_credentials"
}
```

### POST /api/v1/auth/refresh
Refresh an expired access token.

**Request:**
```json
{
  "refreshToken": "eyJhbG..."
}
```

**Response 200:**
```json
{
  "accessToken": "eyJhbG...",
  "refreshToken": "eyJhbG...",
  "expiresIn": 3600
}
```

### GET /api/v1/auth/me
Get current user profile (from JWT).

**Response 200:** Same `user` object as in login response.

---

## 2. Users

### GET /api/v1/users
List users in the agency.

**Query params:** `?page=0&size=20&sort=lastName,asc&role=FRONT_DESK&propertyId=uuid&search=jan`

**Roles:** AGENCY_ADMIN

**Response 200:** Paginated `UserResponse[]`

### POST /api/v1/users
Create a new user.

**Roles:** AGENCY_ADMIN

**Request:**
```json
{
  "email": "anna@agency.pl",
  "password": "temp-password",
  "firstName": "Anna",
  "lastName": "Nowak",
  "role": "FRONT_DESK",
  "language": "PL",
  "assignedPropertyIds": ["uuid-1", "uuid-2"]
}
```

**Response 201:** `UserResponse`

### GET /api/v1/users/{id}
**Roles:** AGENCY_ADMIN

**Response 200:** `UserResponse`

### PUT /api/v1/users/{id}
Update user details (role, language, assigned properties).

**Roles:** AGENCY_ADMIN

**Request:** Same shape as create (all fields optional except those being changed).

**Response 200:** `UserResponse`

### DELETE /api/v1/users/{id}
Deactivate a user.

**Roles:** AGENCY_ADMIN

**Response 204**

### PUT /api/v1/users/me/language
Update own language preference.

**Roles:** Any authenticated user

**Request:**
```json
{
  "language": "UA"
}
```

**Response 200:** `UserResponse`

### UserResponse
```json
{
  "id": "uuid",
  "email": "anna@agency.pl",
  "firstName": "Anna",
  "lastName": "Nowak",
  "role": "FRONT_DESK",
  "language": "PL",
  "assignedPropertyIds": ["uuid-1", "uuid-2"],
  "status": "ACTIVE",
  "lastLoginAt": "2026-04-14T12:00:00Z",
  "createdAt": "2026-04-10T08:00:00Z"
}
```

---

## 3. Workers

### GET /api/v1/workers
List workers with filtering.

**Query params:** `?page=0&size=20&sort=lastName,asc&status=ACTIVE&gender=MALE&tag=electrician&search=kowalski`

- `search` matches against `internalId`, `firstName`, `lastName`, `phone`

**Roles:** AGENCY_ADMIN, AGENCY_PLANNER (full list), PROPERTY_ADMIN, FRONT_DESK (read-only)

**Response 200:** Paginated `WorkerResponse[]`

### POST /api/v1/workers
Create a single worker.

**Roles:** AGENCY_ADMIN, AGENCY_PLANNER

**Request:**
```json
{
  "internalId": "W-1234",
  "firstName": "Andriy",
  "lastName": "Shevchenko",
  "phone": "+48123456789",
  "gender": "MALE",
  "tags": ["welder", "forklift"],
  "notes": "Prefers ground floor"
}
```

**Response 201:** `WorkerResponse`

**Response 409:** if `internalId` already exists in this agency.

### GET /api/v1/workers/{id}
**Roles:** All authenticated

**Response 200:** `WorkerResponse`

### PUT /api/v1/workers/{id}
**Roles:** AGENCY_ADMIN, AGENCY_PLANNER

**Request:** Partial update (only send fields to change).

**Response 200:** `WorkerResponse`

### DELETE /api/v1/workers/{id}
Soft delete. Worker is marked inactive, stays are preserved.

**Roles:** AGENCY_ADMIN

**Response 204**

### POST /api/v1/workers/import
Bulk import workers from CSV.

**Roles:** AGENCY_ADMIN, AGENCY_PLANNER

**Request:** `multipart/form-data` with `file` field (CSV).

CSV format:
```csv
internalId,firstName,lastName,phone,gender,tags
W-1234,Andriy,Shevchenko,+48123456789,MALE,"welder,forklift"
W-1235,Olena,Kovalenko,+48987654321,FEMALE,cleaner
```

**Response 200:**
```json
{
  "totalRows": 150,
  "created": 142,
  "skipped": 5,
  "errors": [
    {
      "row": 12,
      "internalId": "W-1234",
      "reason": "error.worker.duplicate_internal_id"
    },
    {
      "row": 45,
      "internalId": "",
      "reason": "error.worker.internal_id_required"
    }
  ]
}
```

### GET /api/v1/workers/{id}/stays
Get all stays for a worker (current and historical).

**Query params:** `?status=CHECKED_IN&dateFrom=2026-04-01&dateTo=2026-04-30`

**Roles:** All authenticated

**Response 200:** Paginated `StayResponse[]`

### WorkerResponse
```json
{
  "id": "uuid",
  "internalId": "W-1234",
  "firstName": "Andriy",
  "lastName": "Shevchenko",
  "phone": "+48123456789",
  "gender": "MALE",
  "tags": ["welder", "forklift"],
  "notes": "Prefers ground floor",
  "status": "ACTIVE",
  "currentStay": {
    "propertyId": "uuid",
    "propertyName": "Hotel Warszawa",
    "roomNumber": "12",
    "since": "2026-04-10"
  },
  "createdAt": "2026-04-01T08:00:00Z",
  "updatedAt": "2026-04-14T10:00:00Z"
}
```

### WorkerSummary (used as nested object)
```json
{
  "id": "uuid",
  "internalId": "W-1234",
  "firstName": "Andriy",
  "lastName": "Shevchenko",
  "gender": "MALE"
}
```

---

## 4. Properties

### GET /api/v1/properties
List properties.

**Query params:** `?page=0&size=20&sort=name,asc&status=ACTIVE&type=INTERNAL&search=warszawa`

**Roles:** AGENCY_ADMIN, AGENCY_PLANNER (all), PROPERTY_ADMIN, FRONT_DESK (assigned only)

**Response 200:** Paginated `PropertyResponse[]`

### POST /api/v1/properties
**Roles:** AGENCY_ADMIN

**Request:**
```json
{
  "name": "Hotel Warszawa",
  "address": "ul. Przykładowa 10, 00-001 Warszawa",
  "type": "INTERNAL",
  "genderRule": "PER_ROOM",
  "notes": "Main worker hotel, 3 floors"
}
```

**Response 201:** `PropertyResponse`

### GET /api/v1/properties/{id}
**Roles:** All authenticated (scoped)

**Response 200:** `PropertyResponse` (includes room summary)

### PUT /api/v1/properties/{id}
**Roles:** AGENCY_ADMIN, PROPERTY_ADMIN (own)

**Response 200:** `PropertyResponse`

### DELETE /api/v1/properties/{id}
Soft delete. Only allowed if no active stays.

**Roles:** AGENCY_ADMIN

**Response 204**

**Response 409:** if active stays exist.

### PropertyResponse
```json
{
  "id": "uuid",
  "name": "Hotel Warszawa",
  "address": "ul. Przykładowa 10, 00-001 Warszawa",
  "type": "INTERNAL",
  "genderRule": "PER_ROOM",
  "status": "ACTIVE",
  "notes": "Main worker hotel, 3 floors",
  "roomSummary": {
    "totalRooms": 25,
    "totalCapacity": 100,
    "totalBlockedSpots": 3,
    "currentOccupancy": 72
  },
  "createdAt": "2026-04-01T08:00:00Z",
  "updatedAt": "2026-04-14T10:00:00Z"
}
```

### PropertySummary (nested)
```json
{
  "id": "uuid",
  "name": "Hotel Warszawa",
  "type": "INTERNAL"
}
```

---

## 5. Rooms

All room endpoints are nested under a property.

### GET /api/v1/properties/{propertyId}/rooms
List rooms for a property.

**Query params:** `?page=0&size=50&sort=roomNumber,asc&status=ACTIVE&floor=2`

**Roles:** All authenticated (scoped to property)

**Response 200:** Paginated `RoomResponse[]`

### POST /api/v1/properties/{propertyId}/rooms
**Roles:** AGENCY_ADMIN, PROPERTY_ADMIN (own)

**Request:**
```json
{
  "roomNumber": "12",
  "capacity": 4,
  "genderRule": "MALE_ONLY",
  "floor": 2,
  "notes": "Corner room, good ventilation"
}
```

**Response 201:** `RoomResponse`

### POST /api/v1/properties/{propertyId}/rooms/bulk
Create multiple rooms at once.

**Roles:** AGENCY_ADMIN, PROPERTY_ADMIN (own)

**Request:**
```json
{
  "rooms": [
    { "roomNumber": "101", "capacity": 4, "floor": 1 },
    { "roomNumber": "102", "capacity": 4, "floor": 1 },
    { "roomNumber": "103", "capacity": 2, "floor": 1 }
  ],
  "defaultGenderRule": "MIXED"
}
```

**Response 201:** `RoomResponse[]`

### GET /api/v1/properties/{propertyId}/rooms/{id}
**Roles:** All authenticated (scoped)

**Response 200:** `RoomResponse`

### PUT /api/v1/properties/{propertyId}/rooms/{id}
**Roles:** AGENCY_ADMIN, PROPERTY_ADMIN (own)

**Response 200:** `RoomResponse`

### DELETE /api/v1/properties/{propertyId}/rooms/{id}
Only if no active stays.

**Roles:** AGENCY_ADMIN, PROPERTY_ADMIN (own)

**Response 204**

### RoomResponse
```json
{
  "id": "uuid",
  "propertyId": "uuid",
  "roomNumber": "12",
  "capacity": 4,
  "blockedSpots": 1,
  "availableSpots": 1,
  "currentOccupancy": 2,
  "genderRule": "MALE_ONLY",
  "floor": 2,
  "status": "ACTIVE",
  "notes": "Corner room, good ventilation",
  "occupants": [
    {
      "stayId": "uuid",
      "worker": { "id": "uuid", "internalId": "W-1234", "firstName": "Andriy", "lastName": "Shevchenko", "gender": "MALE" },
      "dateFrom": "2026-04-10",
      "dateTo": null,
      "status": "CHECKED_IN"
    }
  ],
  "createdAt": "2026-04-01T08:00:00Z"
}
```

### RoomSummary (nested)
```json
{
  "id": "uuid",
  "roomNumber": "12",
  "capacity": 4,
  "availableSpots": 1
}
```

---

## 6. Stays

### GET /api/v1/stays
List stays with filtering.

**Query params:** `?page=0&size=20&sort=dateFrom,desc&workerId=uuid&propertyId=uuid&roomId=uuid&status=CHECKED_IN&dateFrom=2026-04-01&dateTo=2026-04-30`

**Roles:** AGENCY_ADMIN, AGENCY_PLANNER (all), PROPERTY_ADMIN, FRONT_DESK (own properties)

**Response 200:** Paginated `StayResponse[]`

### POST /api/v1/stays
Create a planned stay (agency proposes assignment).

**Roles:** AGENCY_ADMIN, AGENCY_PLANNER, PROPERTY_ADMIN (own properties)

**Request:**
```json
{
  "workerId": "uuid",
  "propertyId": "uuid",
  "roomId": "uuid",
  "dateFrom": "2026-04-20",
  "dateTo": "2026-05-20"
}
```

**Response 201:** `StayResponse` with `status: "PLANNED"`

**Response 422:** Constraint violation (see below).

### POST /api/v1/stays (with override)
If the initial request returned soft violations, resend with override:

```json
{
  "workerId": "uuid",
  "propertyId": "uuid",
  "roomId": "uuid",
  "dateFrom": "2026-04-20",
  "dateTo": "2026-05-20",
  "overrideReason": "Manager approved mixed gender room"
}
```

**Response 201:** `StayResponse` (soft violations overridden)

### GET /api/v1/stays/{id}
**Roles:** All authenticated (scoped)

**Response 200:** `StayResponse`

### PUT /api/v1/stays/{id}
Update a planned stay (dates, room). Cannot update checked-in stays (use move instead).

**Roles:** AGENCY_ADMIN, AGENCY_PLANNER, PROPERTY_ADMIN (own)

**Request:**
```json
{
  "roomId": "uuid",
  "dateFrom": "2026-04-22",
  "dateTo": "2026-05-22"
}
```

**Response 200:** `StayResponse`

### DELETE /api/v1/stays/{id}
Cancel a stay. Sets status to `CANCELLED`.

**Roles:** AGENCY_ADMIN, AGENCY_PLANNER (own stays), PROPERTY_ADMIN (own properties)

**Response 204**

### POST /api/v1/stays/bulk-assign
Assign multiple workers to rooms in one operation.

**Roles:** AGENCY_ADMIN, AGENCY_PLANNER

**Request:**
```json
{
  "assignments": [
    { "workerId": "uuid-1", "propertyId": "uuid", "roomId": "uuid-a", "dateFrom": "2026-04-20", "dateTo": "2026-05-20" },
    { "workerId": "uuid-2", "propertyId": "uuid", "roomId": "uuid-a", "dateFrom": "2026-04-20", "dateTo": "2026-05-20" },
    { "workerId": "uuid-3", "propertyId": "uuid", "roomId": "uuid-b", "dateFrom": "2026-04-20" }
  ]
}
```

**Response 200:**
```json
{
  "total": 3,
  "succeeded": 2,
  "failed": 1,
  "results": [
    { "workerId": "uuid-1", "stayId": "uuid", "status": "CREATED" },
    { "workerId": "uuid-2", "stayId": "uuid", "status": "CREATED" },
    {
      "workerId": "uuid-3",
      "status": "FAILED",
      "error": {
        "type": "CAPACITY_EXCEEDED",
        "message": "constraint.room.capacity.full",
        "params": { "roomNumber": "B-3", "capacity": 4, "current": 4 }
      }
    }
  ]
}
```

### StayResponse
```json
{
  "id": "uuid",
  "worker": {
    "id": "uuid",
    "internalId": "W-1234",
    "firstName": "Andriy",
    "lastName": "Shevchenko",
    "gender": "MALE"
  },
  "property": {
    "id": "uuid",
    "name": "Hotel Warszawa",
    "type": "INTERNAL"
  },
  "room": {
    "id": "uuid",
    "roomNumber": "12",
    "capacity": 4,
    "availableSpots": 1
  },
  "dateFrom": "2026-04-20",
  "dateTo": "2026-05-20",
  "status": "PLANNED",
  "overrideReason": null,
  "createdBy": { "id": "uuid", "firstName": "Jan", "lastName": "Kowalski" },
  "confirmedBy": null,
  "createdAt": "2026-04-14T12:00:00Z",
  "updatedAt": "2026-04-14T12:00:00Z"
}
```

---

## 7. Constraint Violations

When a stay operation violates a constraint, the API returns **422** with this body:

```json
{
  "error": "CONSTRAINT_VIOLATION",
  "message": "error.constraint.violations_found",
  "allowed": false,
  "hardViolations": [
    {
      "type": "CAPACITY_EXCEEDED",
      "message": "constraint.room.capacity.full",
      "params": { "roomNumber": "12", "capacity": 4, "current": 4 }
    }
  ],
  "softViolations": [
    {
      "type": "GENDER_MISMATCH",
      "message": "constraint.gender.mismatch",
      "params": { "roomNumber": "12", "roomRule": "FEMALE_ONLY", "workerGender": "MALE" },
      "overridable": true
    }
  ],
  "timestamp": "2026-04-14T12:00:00Z"
}
```

**Frontend flow:**
1. Submit stay creation/update
2. If 422 with only `softViolations` (no `hardViolations`): show warnings to user, let them confirm with a reason
3. If confirmed: resend the request with `overrideReason` field
4. If `hardViolations` present: block the operation, show errors

### Constraint Types

| Type | Hard/Soft | Message Code |
|------|-----------|-------------|
| `CAPACITY_EXCEEDED` | Hard | `constraint.room.capacity.full` |
| `DOUBLE_BOOKING` | Hard | `constraint.worker.double_booking` |
| `ROOM_BLOCKED` | Hard | `constraint.room.blocked` |
| `PROPERTY_BLOCKED` | Hard | `constraint.property.blocked` |
| `GENDER_MISMATCH` | Soft | `constraint.gender.mismatch` |
| `WORKER_BLACKLISTED` | Soft | `constraint.worker.blacklisted` |
| `OVER_PLANNED` | Soft | `constraint.room.over_planned` |

---

## 8. Arrivals Workflow

### GET /api/v1/stays (expected arrivals)
There is **no** dedicated `/stays/arrivals` endpoint. The client reads arrivals from the
standard stay list, filtered by status:

```
GET /api/v1/stays?propertyId=uuid&date=2026-04-14&status=EXPECTED_TODAY&page=0&size=20
```

- `status=EXPECTED_TODAY` is always appended by the client
- `date` is a single calendar date, distinct from the `dateFrom`/`dateTo` range filters

**Roles:** All authenticated (scoped to assigned properties)

**Response 200:** the standard `PaginatedResponse<StayResponse>` envelope. There is no
`summary` block — the arrivals store derives the expected/checked-in/no-show/pending counts
client-side from the returned page.

### POST /api/v1/stays/{id}/check-in
Confirm a worker has arrived.

**Roles:** PROPERTY_ADMIN, FRONT_DESK

**Request:**
```json
{
  "qrCode": "beduno:uuid:a1b2"
}
```

- The body is optional; the client sends `{}` for a manual check-in
- `qrCode` carries the scanned badge payload when check-in came from the QR scanner
- There is **no** room-override-at-check-in field. Changing room is a separate `/move` call

**Response 200:** `StayResponse` with `status: "CHECKED_IN"`, `confirmedBy` populated

### POST /api/v1/stays/{id}/no-show
Mark a worker as no-show.

**Roles:** PROPERTY_ADMIN, FRONT_DESK

**Request:**
```json
{
  "reason": "DID_NOT_ARRIVE",
  "note": "Called 3 times, no answer"
}
```

`reason` is required, `note` is optional and **singular**. Allowed reasons:

```
DID_NOT_ARRIVE | REFUSED_ROOM | SENT_ELSEWHERE | CANCELLED_BY_AGENCY | OTHER
```

**Response 200:** `StayResponse` with `status: "NO_SHOW"`

---

## 9. Check-out & Move

### POST /api/v1/stays/{id}/check-out
**Roles:** PROPERTY_ADMIN, FRONT_DESK

**Request:**
```json
{
  "note": "Left early, transferred to another site"
}
```

The body is optional; the client sends `{}` for a plain check-out. There is no `reasonTag`,
and the free-text field is `note` (singular).

**Response 200:** `StayResponse` with `status: "CHECKED_OUT"`, `dateTo` set to today if different from planned

### POST /api/v1/stays/bulk-checkout
Check out multiple workers at once.

**Roles:** PROPERTY_ADMIN, FRONT_DESK

**Request:**
```json
{
  "stayIds": ["uuid-1", "uuid-2", "uuid-3"]
}
```

No `reasonTag` is sent.

**Response 200:**
```json
{
  "total": 3,
  "succeeded": 3,
  "failed": 0,
  "results": [
    { "stayId": "uuid-1", "status": "CHECKED_OUT" }
  ]
}
```

> The client models only `total`, `succeeded`, and `failed`. It ignores `results[]`, so
> per-stay failures are currently invisible in the UI — a known frontend gap, not a reason
> for the backend to omit the array.

### POST /api/v1/stays/{id}/move
Move a checked-in worker to a different room (possibly different property).

**Roles:** PROPERTY_ADMIN, FRONT_DESK

**Request:** two call shapes exist, both hitting the same endpoint.

From Arrivals (cross-property move):
```json
{
  "targetPropertyId": "uuid",
  "targetRoomId": "uuid"
}
```

From In-House (room change within the current property):
```json
{
  "targetRoomId": "uuid"
}
```

`targetPropertyId` must therefore be **optional**, defaulting to the stay's current property.
Neither client sends `reasonTag` or `notes`.

- Atomically: checks out from current room, creates new stay in target room
- Constraint engine runs on the target room

**Response 200:** ⚠️ **Unresolved — needs a backend decision.** This spec originally described:

```json
{ "previousStay": { ... }, "newStay": { ... } }
```

but both clients type the response as a **single stay object** and read `.id`/`.status`
directly off it (`arrivals.api.ts`, `inhouse.api.ts`). If the backend returns the
`{previousStay, newStay}` envelope, both callers silently read `undefined`. Settle this before
integration: either the backend returns the single updated stay, or the two clients must be
fixed to unwrap `newStay`.

---

## 10. In-House (Nightly Occupancy)

### GET /api/v1/properties/{id}/in-house
Current occupancy breakdown by room. The path is `/in-house`, not `/occupancy`.

**Query params:** none. The endpoint is **today-only** — the client sends no `date`.

**Roles:** All authenticated (scoped)

**Response 200:**
```json
{
  "property": { "id": "uuid", "name": "Hotel Warszawa", "type": "INTERNAL" },
  "date": "2026-04-14",
  "rooms": [
    {
      "id": "uuid",
      "roomNumber": "12",
      "floor": 2,
      "capacity": 4,
      "blockedSpots": 0,
      "genderRule": "MALE_ONLY",
      "status": "ACTIVE",
      "occupants": [
        {
          "id": "uuid",
          "worker": { "id": "uuid", "internalId": "W-1234", "firstName": "Andriy", "lastName": "Shevchenko", "gender": "MALE" },
          "dateFrom": "2026-04-10",
          "dateTo": "2026-05-10",
          "status": "CHECKED_IN"
        }
      ],
      "blocked": false,
      "blockReason": null
    }
  ],
  "unassignedWorkers": [],
  "summary": {
    "totalRooms": 25,
    "totalCapacity": 100,
    "totalOccupants": 72,
    "overCapacityRooms": 1,
    "nearCapacityRooms": 4,
    "blockedRooms": 2
  }
}
```

Notes on the real shape:

- Each room entry carries a computed `status` of `OK | NEAR_CAPACITY | OVER_CAPACITY | BLOCKED`
  (`RoomOccupancyStatus`) alongside `blocked` and `blockReason`
- `unassignedWorkers[]` — workers present at the property with no room — is returned **inline**
  here, not only via `/exceptions`
- The summary is a room-count summary. There is no `totalBlocked`, `totalAvailable`, or
  `occupancyRate` field
- Occupant entries key on `id` (the stay ID), not `stayId`

### GET /api/v1/properties/{id}/exceptions
Current exceptions (problems that need attention).

> **Not called by the frontend.** The In-House view derives over-capacity from each room's
> `status` and reads unassigned workers from `unassignedWorkers[]` on the in-house response.
> Keep this endpoint only if another consumer needs it.

**Query params:** `?date=2026-04-14`

**Roles:** AGENCY_ADMIN, AGENCY_PLANNER, PROPERTY_ADMIN (own)

**Response 200:**
```json
{
  "property": { "id": "uuid", "name": "Hotel Warszawa" },
  "date": "2026-04-14",
  "exceptions": [
    {
      "type": "OVER_CAPACITY",
      "room": { "id": "uuid", "roomNumber": "5", "capacity": 4 },
      "currentOccupancy": 5,
      "occupants": [ ... ]
    },
    {
      "type": "UNASSIGNED_WORKER",
      "worker": { "id": "uuid", "internalId": "W-5678", "firstName": "Olena", "lastName": "K." },
      "message": "exception.worker.no_bed_tonight"
    }
  ]
}
```

### GET /api/v1/properties/{id}/in-house/export
Export the current in-house list.

**Query params:** `?format=csv&lang=PL`

- `format` is `csv` or `pdf` — PDF is supported, not CSV-only
- the language param is `lang`, not `language`
- no `date` param; the export follows the today-only in-house view

**Roles:** AGENCY_ADMIN, AGENCY_PLANNER, PROPERTY_ADMIN (own)

**Response 200:** binary file download (the client requests `responseType: 'blob'`)

CSV columns (localized): Room Number, Floor, Capacity, Occupancy, Worker ID, Worker Name, Check-in Date, Status

---

## 11. Inspection Mode

Inspection is a **stateful session resource** at top-level `/inspections`, not a pair of
calls under a property. An inspection is started, mutated room by room as the walkthrough
proceeds, then completed. All mutating calls return the full updated `Inspection`.

**Roles:** PROPERTY_ADMIN, FRONT_DESK

### POST /api/v1/inspections
Start a session.

**Request:** `{ "propertyId": "uuid" }`

**Response 201:** `Inspection`

### GET /api/v1/inspections/{inspectionId}
Fetch the current session state.

### POST /api/v1/inspections/{inspectionId}/presence
Record whether an expected occupant was found.

```json
{
  "stayId": "uuid",
  "presence": "ABSENT",
  "discrepancyReason": "WRONG_ROOM",
  "discrepancyNote": "Found in room 14"
}
```

`presence` is `PRESENT | ABSENT | UNCHECKED`. `discrepancyReason` and `discrepancyNote` are
optional.

### POST /api/v1/inspections/{inspectionId}/unexpected
Record someone present who was not expected.

```json
{
  "roomId": "uuid",
  "description": "Man, ~40, no badge",
  "reason": "UNAUTHORIZED_GUEST",
  "note": "Claims to be a relative"
}
```

### POST /api/v1/inspections/{inspectionId}/verify
Mark one room as verified: `{ "roomId": "uuid" }`

### POST /api/v1/inspections/{inspectionId}/complete
Close the session. No request body. Populates `summary`.

### GET /api/v1/inspections/{inspectionId}/export
**Query params:** `?format=csv|pdf&lang=PL` → binary download (`responseType: 'blob'`)

### DiscrepancyReason
```
WORKER_NOT_FOUND | WRONG_ROOM | LEFT_EARLY | ARRIVED_LATE | UNAUTHORIZED_GUEST | OTHER
```

### Inspection
```json
{
  "id": "uuid",
  "property": { "id": "uuid", "name": "Hotel Warszawa", "type": "INTERNAL" },
  "rooms": [
    {
      "room": { "id": "uuid", "roomNumber": "12", "capacity": 4, "availableSpots": 2 },
      "expected": [
        {
          "stayId": "uuid",
          "worker": { "id": "uuid", "internalId": "W-1234", "firstName": "Andriy", "lastName": "Shevchenko", "gender": "MALE" },
          "presence": "PRESENT",
          "discrepancyReason": null,
          "discrepancyNote": null
        }
      ],
      "unexpected": [],
      "verified": true,
      "verifiedAt": "2026-04-14T18:12:00Z",
      "verifiedBy": "uuid"
    }
  ],
  "startedAt": "2026-04-14T18:00:00Z",
  "completedAt": null,
  "startedBy": "uuid",
  "summary": null
}
```

`summary` is `null` until the session is completed, then:

```json
{
  "totalRooms": 25,
  "verifiedRooms": 25,
  "totalExpected": 72,
  "presentCount": 70,
  "absentCount": 2,
  "unexpectedCount": 1,
  "discrepancyCount": 3
}
```

---

## 12. Audit Log

### GET /api/v1/audit
Query audit events.

**Query params:** `?page=0&size=50&entityType=STAY&entityId=uuid&actorId=uuid&action=CHECK_IN&dateFrom=2026-04-01T00:00:00Z&dateTo=2026-04-14T23:59:59Z`

The actor filter is `actorId`, not `userId`.

**Roles:** AGENCY_ADMIN. The `/audit` route is gated to Agency Admin only — Property Admin and
Agency Planner cannot reach the screen.

**Response 200:** Paginated `AuditEventResponse[]`

### AuditEventResponse
```json
{
  "id": "uuid",
  "actor": { "id": "uuid", "firstName": "Anna", "lastName": "Nowak", "role": "FRONT_DESK" },
  "action": "CHECK_IN",
  "entityType": "STAY",
  "entityId": "uuid",
  "entityLabel": "W-1234 · Hotel Warszawa / 12",
  "diff": [
    { "field": "status", "before": "EXPECTED_TODAY", "after": "CHECKED_IN" },
    { "field": "confirmedBy", "before": null, "after": "uuid" }
  ],
  "timestamp": "2026-04-14T14:30:00Z",
  "syncedAt": null
}
```

Differences from the original draft, all driven by the shipped client:

- `performedBy` → `actor`; `createdAt` → `timestamp`
- `previousState`/`newState` whole-object snapshots are replaced by a flat `diff[]` of
  `{field, before, after}` entries
- `reasonTag` and `notes` do not exist on the event
- `entityLabel` gives the UI something to show without a second fetch
- `syncedAt` is non-null when the action was replayed from the offline queue; the audit UI
  badges those rows

---

## 13. Dashboard / Summary

### GET /api/v1/dashboard
Agency-wide summary for the current date.

**Roles:** AGENCY_ADMIN, AGENCY_PLANNER

**Response 200:**
```json
{
  "date": "2026-04-14",
  "properties": {
    "total": 12,
    "active": 10
  },
  "workers": {
    "total": 450,
    "active": 420,
    "currentlyHoused": 380
  },
  "todayArrivals": {
    "expected": 15,
    "checkedIn": 8,
    "noShow": 2,
    "pending": 5
  },
  "todayDepartures": {
    "expected": 10,
    "checkedOut": 7,
    "pending": 3
  },
  "occupancy": {
    "totalCapacity": 500,
    "totalOccupied": 380,
    "rate": 0.76
  },
  "exceptions": {
    "overCapacity": 1,
    "unassignedWorkers": 5
  }
}
```

### GET /api/v1/properties/{id}/dashboard
Property-level summary.

**Roles:** All authenticated (scoped)

**Response 200:** Same structure, scoped to one property.

> **Neither dashboard endpoint is called by the frontend.** `Dashboard.vue` is the post-login
> landing page but currently renders without fetching. Wiring it up is open frontend work.

---

## 14. Exports

A dedicated export module, separate from the in-house and inspection exports above. All three
return a binary download (`responseType: 'blob'`) and take `format` (`csv` | `pdf`) plus `lang`
(`PL` | `EN` | `DE` | `UA` | `RU`). Export language is chosen independently of UI language.

**Roles:** AGENCY_ADMIN, AGENCY_PLANNER

### GET /api/v1/exports/nightly-occupancy
`?propertyId=uuid&date=2026-04-14&format=pdf&lang=PL`

### GET /api/v1/exports/exception-report
`?propertyId=uuid&date=2026-04-14&format=csv&lang=EN`

Unassigned workers and over-capacity rooms for the date.

### GET /api/v1/exports/occupancy-summary
`?dateFrom=2026-04-01&dateTo=2026-04-30&format=pdf&lang=DE&propertyIds=uuid1&propertyIds=uuid2`

Cross-property summary over a date range. `propertyIds` is optional — omit it for all
properties in scope.

---

## Reason Tags (predefined)

Sent as string constants; the frontend resolves them to localized labels. Note that the shipped
flows use **per-operation** enums rather than one shared tag vocabulary, and that check-in,
check-out, and move carry **no** reason tag at all (check-out takes an optional free-text
`note`).

### No-show reasons (`POST /stays/{id}/no-show`)
```
DID_NOT_ARRIVE | REFUSED_ROOM | SENT_ELSEWHERE | CANCELLED_BY_AGENCY | OTHER
```

### Inspection discrepancy reasons (`/inspections/**`)
```
WORKER_NOT_FOUND | WRONG_ROOM | LEFT_EARLY | ARRIVED_LATE | UNAUTHORIZED_GUEST | OTHER
```

### Room blocking
Blocking is expressed as a count, not a tag: `PUT /properties/{propertyId}/rooms/{id}` accepts
`blockedSpots` alongside the room fields. The block reason is captured as free text in the UI.

### Stay override
`overrideReason` on stay create/update is free text, not an enum.
