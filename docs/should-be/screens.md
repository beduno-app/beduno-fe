# Screen Inventory & UI Flows

## Web Admin Screens

### Auth

| Screen | Route | Role | Description |
|--------|-------|------|-------------|
| Login | `/login` | All | Email + password; language selector |
| Forgot Password | `/forgot-password` | All | Email-based reset flow |

### Dashboard

| Screen | Route | Role | Description |
|--------|-------|------|-------------|
| Agency Dashboard | `/` | Agency Admin, Planner | Summary: total workers housed, occupancy rate, today's arrivals, exceptions, recent audit entries |
| Property Dashboard | `/property/:id` | Property Admin, Front Desk | Today's arrivals, current occupancy, exceptions, recent changes |

### Workers Module

| Screen | Route | Role | Description |
|--------|-------|------|-------------|
| Worker List | `/workers` | Agency Admin, Planner | Searchable, filterable table with internal ID, name, status, current property, tags |
| Worker Detail | `/workers/:id` | Agency Admin, Planner | Profile, stay history, audit trail for this worker |
| Worker Import | `/workers/import` | Agency Admin, Planner | CSV upload + preview + validation errors + confirm |
| QR Badge Generation | `/workers/:id/badge` | Agency Admin, Planner | Preview + print/download QR badge |
| Batch Badge Print | `/workers/badges` | Agency Admin, Planner | Select workers → generate PDF with all badges |

### Properties Module

| Screen | Route | Role | Description |
|--------|-------|------|-------------|
| Property List | `/properties` | Agency Admin | All properties with occupancy summary per property |
| Property Detail | `/properties/:id` | Agency Admin, Property Admin | Address, rules, room list, current occupancy overview |
| Room Management | `/properties/:id/rooms` | Property Admin | Add/edit rooms, set capacity, toggle gender rule, block/unblock |

### Stays / Planning Module

| Screen | Route | Role | Description |
|--------|-------|------|-------------|
| Stay Planner | `/stays` | Agency Planner | Calendar/list view of all planned + active stays; filter by property/worker/date |
| Create Stay | `/stays/new` | Agency Planner | Select worker → property → room → dates; live conflict warnings |
| Bulk Assign | `/stays/bulk` | Agency Planner | Select multiple workers + target property/rooms + date range; conflict summary before confirm |

### Occupancy Module (Core — 3 Must-Not-Fail Screens)

| Screen | Route | Role | Description |
|--------|-------|------|-------------|
| **Arrivals Today** | `/property/:id/arrivals` | Front Desk, Shift Lead, Property Admin | Expected today list; QR scan button; one-tap check-in; no-show/redirect actions |
| **In-House (Nightly)** | `/property/:id/occupancy` | All property roles | Room-by-room current occupancy; exception badges (over-capacity, unknown); one-tap export |
| **Inspection Mode** | `/property/:id/inspection` | Front Desk, Shift Lead, Property Admin | Room-by-room roster; "expected vs present" toggle; discrepancy capture with timestamp + confirmer |

### Admin Module

| Screen | Route | Role | Description |
|--------|-------|------|-------------|
| User Management | `/admin/users` | Agency Admin | List users, invite new, assign roles, revoke sessions |
| Audit Log | `/audit` | Agency Admin, Planner (read), Property Admin (own property) | Filterable event log: actor, action, entity, before/after, timestamp |
| Export Center | `/exports` | Agency Admin, Planner, Property Admin | Generate nightly reports, occupancy summaries; choose format (CSV/PDF) and language |

---

## Mobile Ops Screens

The mobile app is a simplified, touch-optimised subset focused on the three operational workflows.

### Navigation

```
┌─────────────────────────────────┐
│  ☰  BedOK         [Property ▼] │  ← property selector (if user has access to multiple)
├─────────────────────────────────┤
│                                 │
│     [Arrivals]  [In-House]      │  ← bottom nav (3 tabs)
│     [Inspection]                │
│                                 │
└─────────────────────────────────┘
```

### Arrivals (Mobile)

```
┌─────────────────────────────────┐
│  Arrivals Today          15/18  │  ← checked-in / expected
├─────────────────────────────────┤
│  🔍 [Scan QR]  [Search by ID]  │
├─────────────────────────────────┤
│  ┌─────────────────────────────┐│
│  │ ● WRK-0412  Jan Kowalski   ││  ← EXPECTED
│  │   Room 101   Arriving 14:00 ││
│  │   [Check In]  [No-Show ▼]  ││
│  └─────────────────────────────┘│
│  ┌─────────────────────────────┐│
│  │ ✓ WRK-0388  Olena Ivanova  ││  ← CHECKED_IN (greyed/done)
│  │   Room 203   Checked in 9:30││
│  └─────────────────────────────┘│
│  ...                            │
└─────────────────────────────────┘
```

**QR Scan Flow** (< 10 seconds):
1. Tap "Scan QR"
2. Camera opens → scan badge
3. Worker card appears: name, internal ID, assigned room, photo (if available)
4. One-tap "Check In" → done
5. If conflict (wrong property, already checked in elsewhere): warning banner with options

### In-House (Mobile)

```
┌─────────────────────────────────┐
│  In-House Tonight        42/50  │  ← occupied / total capacity
├─────────────────────────────────┤
│  Room 101 (4/4) ●              │  ← full (orange dot)
│    Jan Kowalski     WRK-0412   │
│    Piotr Nowak      WRK-0415   │
│    Ivan Petrov      WRK-0390   │
│    Dmytro Shevchenko WRK-0401  │
├─────────────────────────────────┤
│  Room 102 (2/4)                │  ← has space
│    Maria Wiśniewska WRK-0422   │
│    Olena Ivanova    WRK-0388   │
├─────────────────────────────────┤
│  Room 103 (0/3) ■              │  ← blocked (red)
│    BLOCKED: Maintenance        │
├─────────────────────────────────┤
│  ⚠ EXCEPTIONS                  │
│  Room 205: OVER CAPACITY (5/4) │
│  WRK-0399: No room assigned    │
├─────────────────────────────────┤
│  [Export Nightly List]          │
└─────────────────────────────────┘
```

### Inspection Mode (Mobile)

```
┌─────────────────────────────────┐
│  Inspection Mode     Room 3/12 │
├─────────────────────────────────┤
│  Room 102                      │
│  Expected (2):                 │
│    ✓ Maria Wiśniewska WRK-0422│  ← present (confirmed)
│    ✗ Olena Ivanova    WRK-0388│  ← not present (discrepancy)
│                                │
│  Found (not expected):         │
│    ? Unknown person            │  ← discrepancy
│                                │
│  [Mark as Verified]            │
│  [Add Discrepancy Note ▼]      │
│                                │
│  [← Prev Room]  [Next Room →] │
└─────────────────────────────────┘
```

---

## UI Flow: Full Check-In Journey

```
Agency Planner (Web)                Property Front Desk (Mobile)
─────────────────────               ────────────────────────────
1. Create planned stay              
   Worker WRK-0412 →               
   Property "Hotel Praga" →        
   Room 101 →                      
   Mar 15 – Mar 30                 
                                   
   Status: PLANNED                 
                                   
   ─── arrival day (Mar 15) ───    
                                   
   System: status → EXPECTED_TODAY 
                                   
                                    2. Open "Arrivals Today"
                                       See WRK-0412 in list
                                   
                                    3. Tap "Scan QR"
                                       Scan Jan's badge
                                   
                                    4. Worker card appears:
                                       "Jan Kowalski (WRK-0412)"
                                       "Assigned: Room 101"
                                       [Check In]
                                   
                                    5. Tap "Check In"
                                       Status → CHECKED_IN
                                       Audit event recorded
                                   
                                    6. Jan appears in "In-House"
                                       Room 101: 1/4 occupied
```

---

## UI Flow: Conflict During Check-In

```
Front Desk scans QR for WRK-0412

System detects: WRK-0412 is currently CHECKED_IN
at "Hotel Wola", Room 203

┌─────────────────────────────────┐
│  ⚠ CONFLICT                    │
│                                 │
│  Jan Kowalski (WRK-0412) is    │
│  currently checked in at:      │
│  Hotel Wola, Room 203          │
│                                 │
│  Options:                       │
│  [Check Out from Wola + Check  │
│   In Here]                      │
│  [Cancel]                       │
│  [Report Discrepancy]           │
└─────────────────────────────────┘
```

---

## Localization Approach

### Status Labels (must be translated in all 5 languages)

| Key | PL | EN | DE | UA | RU |
|-----|----|----|----|----|-----|
| PLANNED | Zaplanowany | Planned | Geplant | Заплановано | Запланировано |
| EXPECTED_TODAY | Oczekiwany dziś | Expected today | Heute erwartet | Очікується сьогодні | Ожидается сегодня |
| CHECKED_IN | Zameldowany | Checked in | Eingecheckt | Зареєстровано | Заселён |
| CHECKED_OUT | Wymeldowany | Checked out | Ausgecheckt | Виселено | Выселен |
| NO_SHOW | Nieobecny | No-show | Nicht erschienen | Не з'явився | Не явился |

### Predefined Reasons (localized tags instead of free text)

- Arrived late / Docs missing / Room conflict / Sent to other property
- Maintenance / Damage / Reserved / Emergency
- Voluntary departure / Contract ended / Disciplinary

### String Budget

Target: **~400 core strings** for the full MVP across both apps. This keeps translation manageable and affordable for 5 languages.
