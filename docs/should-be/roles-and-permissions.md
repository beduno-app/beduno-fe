# Roles, Permissions & Workflows

## Role Definitions

### Agency Admin
The highest-privilege agency role. Manages the agency's account, users, and has full visibility.

**Responsibilities:**
- Create and manage user accounts
- Assign roles and permissions
- Review audit logs across all properties
- Revoke sessions and devices
- Configure agency-level settings
- Full read access to all data

**Typical person:** Agency owner or operations director.

### Agency Planner
The day-to-day operator on the agency side. Plans worker assignments and handles bulk operations.

**Responsibilities:**
- Manage the worker directory (CRUD, import, tags)
- Create and manage planned stays (propose assignments)
- Perform bulk operations (bulk assign, bulk import, bulk checkout)
- View occupancy across all properties (read-only)
- Generate and print QR badges
- Export reports

**Typical person:** Dispatcher, logistics coordinator, or operations manager.

### Property Admin
Manages a specific property's inventory and rules. May be an internal employee or an external partner.

**Responsibilities:**
- Manage rooms within their property (capacity, gender rules, block/unblock)
- View and confirm planned stays for their property
- Perform all operational actions (check-in/out, move, no-show)
- View occupancy and audit log for their property only
- Export reports for their property

**Typical person:** Hotel/property manager, hostel manager.

### Front Desk
The hands-on operational role. Performs check-ins, manages immediate occupancy changes, and leads shift-level operations.

**Responsibilities:**
- View arrivals for today at their property
- Check in workers (QR scan or manual search)
- Check out workers
- Move workers between rooms
- Mark no-shows and moved workers
- Run inspections (room-by-room verification)
- Block/unblock rooms (e.g. for maintenance)

**Typical person:** Reception staff, shift lead, security at worker hotel.

**Key constraint:** This role needs the **fastest possible UX**. They are often on BYOD devices, sometimes with poor connectivity, and cannot spend time on admin tasks.

---

## Truth Ownership Model

### The Core Rule

> **Property-side roles own reality. Agency-side roles own plans.**

This separation exists because:
1. Property managers physically see who is present — they are the ground truth
2. If agencies could overwrite property data, external partners would stop trusting the system
3. The audit trail only works if there's a clear "who reported what"

### What Each Side Can Do

| Action | Agency Side | Property Side |
|--------|:-----------:|:-------------:|
| Create a planned stay | **Yes** (proposes) | No (receives) |
| Modify a planned stay | **Yes** | No |
| Cancel a planned stay | **Yes** | No |
| Confirm check-in | No | **Yes** (confirms reality) |
| Confirm check-out | No | **Yes** |
| Move room | No | **Yes** |
| Mark no-show | No | **Yes** |
| Move to another property | No | **Yes** |
| Block/unblock a room | No | **Yes** |
| Edit room inventory | No | **Yes** (Property Admin only) |

### Dispute Resolution

When the agency and property disagree (e.g. "we sent 5 workers but property only checked in 3"):

1. Both sides can see the **audit log** for the stays in question
2. Each action is timestamped with actor, role, and device
3. **Agency Admin** has read access to property audit logs
4. Resolution is manual (communication between agency and property admin) — the system provides evidence, not arbitration

---

## Stay Lifecycle Workflow

### Happy Path

```
Agency Planner                        Front Desk
──────────────                        ──────────
Creates planned stay                  
  Worker: WRK-0412                    
  Property: Hotel Praga               
  Room: 101                           
  Dates: Mar 15 – Mar 30             
                                     
  Status: PLANNED                    
                                     
  ──── Mar 15 (arrival day) ────     
                                     
  System: → EXPECTED_TODAY            
                                      Sees WRK-0412 in "Arrivals"
                                      Scans QR badge
                                      Taps "Check In"
                                      Status: → CHECKED_IN
                                     
  ──── Mar 30 (end date) ────        
                                      Sees WRK-0412 in departures
                                      Taps "Check Out"
                                      Status: → CHECKED_OUT
```

### No-Show Path

```
  ──── Mar 15 (arrival day) ────     
                                     
  System: → EXPECTED_TODAY           
                                      WRK-0412 doesn't appear
                                      End of day: taps "No-Show"
                                      Selects reason: "Did not arrive"
                                      Status: → NO_SHOW
                                     
                                      Audit event recorded with
                                      actor + timestamp + reason
```

### Move to Another Property Path

```
  System: → EXPECTED_TODAY           
                                      WRK-0412 arrives but
                                      Room 101 is blocked (damage)
                                     
                                      Taps "Move"
                                      Selects: Hotel Wola, Room 203
                                      Status: → MOVED
                                     
                                      New stay created at Hotel Wola
                                      Status: CHECKED_IN
```

### Room Move Path

```
                                      WRK-0412 is CHECKED_IN, Room 101
                                      Conflict with roommate → move needed
                                     
                                      Taps "Move Room"
                                      Selects: Room 205
                                      System checks: capacity OK, gender OK
                                      Stay updated: Room 205
                                     
                                      Audit event: MOVE_ROOM
                                      before: { roomId: 101 }
                                      after: { roomId: 205 }
```

---

## Bulk Operations Workflow

### Bulk Import Workers

```
Agency Planner
──────────────
1. Navigates to Workers → Import
2. Uploads CSV file (columns: internalId, name, phone, gender, tags)
3. System parses and displays preview table
4. Validation errors shown inline:
   - Duplicate internalId (already exists)
   - Missing required fields
   - Invalid gender value
5. Planner reviews, fixes issues (edit inline or re-upload)
6. Confirms import
7. Workers created in system
8. Audit event: BULK_IMPORT (count: N)
```

### Bulk Assign (Move Group to Property)

```
Agency Planner
──────────────
1. Navigates to Stays → Bulk Assign
2. Selects workers (search/filter or paste internal IDs)
3. Selects target property
4. System shows available rooms with capacity
5. Auto-assigns to rooms respecting:
   - Capacity limits
   - Gender rules (if enabled)
6. Conflict summary shown:
   - Hard: "Room 101 would be over capacity" → must resolve
   - Soft: "Room 203 would be at capacity" → warning only
7. Planner adjusts assignments or confirms
8. Planned stays created
9. Audit event: BULK_ASSIGN (count: N)
```

---

## Security Constraints Per Role

### Data Visibility

| Data | Agency Admin | Agency Planner | Property Admin | Front Desk |
|------|:-:|:-:|:-:|:-:|
| Worker full profile | Yes | Yes | Property's workers only | Name + ID only |
| Worker phone number | Yes | Yes | No | No |
| Worker tags/notes | Yes | Yes | No | No |
| All properties data | Yes | Yes (read) | Own property only | Own property only |
| Other properties occupancy | Yes | Yes (read) | No | No |
| Audit log (all) | Yes | Yes (read) | No | No |
| Audit log (own property) | Yes | Yes (read) | Yes | No |
| User accounts | Yes (CRUD) | No | No | No |

### Session & Device Rules

- **Session timeout**: 8 hours (configurable by Agency Admin)
- **Max concurrent sessions**: 3 per user
- **Device registration**: BYOD devices are registered on first login
- **Instant revocation**: Agency Admin can revoke any user's sessions/devices
- **PIN/biometric**: recommended for mobile devices (not enforced in MVP)

### PII Minimisation

Front Desk screens show **only what's needed for check-in**:
- Worker name (for visual confirmation)
- Internal ID (for QR/manual lookup)
- Assigned room
- Stay dates and status

They do **not** see: phone numbers, tags, notes, other properties' data, or full audit logs.
