# Screen Inventory & UI Flows

## Web Admin Screens

### Auth

| Screen | Route | Role | Description |
|--------|-------|------|-------------|
| Login | `/login` | All | Email + password; language selector |
| Forgot Password | `/forgot-password` | All | **Not implemented.** No route, no component, and no API method exist for this in the shipped app. |
| Forbidden | `/forbidden` | All | Shown when an authenticated user's role doesn't have access to the requested route |

### Dashboard

| Screen | Route | Role | Description |
|--------|-------|------|-------------|
| Agency Dashboard | `/` | All (no role restriction in the router) | Summary: total workers housed, occupancy rate, today's arrivals, exceptions, recent audit entries |
| Property Dashboard | `/property/:id` | — | **Not implemented.** No such route exists; property-level operational data is served by the duplicated `/arrivals`, `/in-house`, `/inspection` (and `/ops/*`) routes instead — see the Occupancy Module below. |

### Workers Module

| Screen | Route | Role | Description |
|--------|-------|------|-------------|
| Worker List | `/workers` | Agency Admin, Planner | Searchable, filterable table with internal ID, name, status, current property, tags |
| Worker Create | `/workers/new` | Agency Admin, Planner | Create a new worker profile |
| Worker Detail | `/workers/:id` | Agency Admin, Planner | Profile, stay history, audit trail for this worker |
| Worker Import | `/workers/import` | Agency Admin, Planner | CSV upload + preview + validation errors + confirm |
| QR Badge Generation | `/workers/:id/badge` | Agency Admin, Planner | Preview + print/download QR badge |
| Batch Badge Print | — | Agency Admin, Planner | **No dedicated route.** `BatchBadgePrint.vue` is a modal opened from within `/workers` (`WorkerList.vue`), not a standalone screen. Select workers → generate PDF with all badges |

### Properties Module

| Screen | Route | Role | Description |
|--------|-------|------|-------------|
| Property List | `/properties` | Agency Admin, Planner | All properties with occupancy summary per property |
| Property Create | `/properties/new` | Agency Admin | Create a new property |
| Property Detail | `/properties/:id` | Agency Admin, Planner | Address, rules, room list, current occupancy overview |
| Room Management | — | Agency Admin, Planner (only via Property Detail — see gap noted in roles-and-permissions.md) | **No dedicated route.** `RoomManagement.vue` is a modal opened from within `/properties/:id` (`PropertyDetail.vue`), and lives under `components/`, not `views/`. Add/edit rooms, set capacity, toggle gender rule, block/unblock |

### Stays / Planning Module

| Screen | Route | Role | Description |
|--------|-------|------|-------------|
| Stay Planner | `/stays` | Agency Admin, Planner, Property Admin, Front Desk | Calendar/list view of all planned + active stays; filter by property/worker/date |
| Create Stay | `/stays/new` | Agency Admin, Planner, Property Admin | Select worker → property → room → dates; live conflict warnings |
| Bulk Assign | `/stays/bulk-assign` | Agency Admin, Planner | Select multiple workers + target property/rooms + date range; conflict summary before confirm |
| Stay Detail | `/stays/:id` | Agency Admin, Planner, Property Admin, Front Desk | Single stay's detail view: worker, property, room, dates, status, audit trail |

### Occupancy Module (Core — 3 Must-Not-Fail Screens)

These three screens each exist twice in the route tree — once under the desktop admin layout, once under the mobile `/ops/*` layout — sharing the same view components. **No route takes a property `:id` param.** The active property is instead chosen from a header dropdown bound to store state (`opsStore.selectedPropertyId`), not the URL.

| Screen | Route | Role | Description |
|--------|-------|------|-------------|
| **Arrivals Today** | `/arrivals` + `/ops/arrivals` | Property Admin, Front Desk | Expected today list; QR scan button; one-tap check-in; no-show/move actions |
| **In-House (Nightly)** | `/in-house` + `/ops/in-house` | Property Admin, Front Desk | Room-by-room current occupancy; exception badges (over-capacity, unknown); one-tap export |
| **Inspection Mode** | `/inspection` + `/ops/inspection` | Property Admin, Front Desk | Room-by-room roster; "expected vs present" toggle; discrepancy capture with timestamp + confirmer |

### Admin Module

| Screen | Route | Role | Description |
|--------|-------|------|-------------|
| User Management | `/users` | Agency Admin | List users, invite new, assign roles |
| Role Permissions | `/roles` | Agency Admin | View/manage the role-to-permission mapping |
| Audit Log | `/audit` | Agency Admin | Filterable event log: actor, action, entity, before/after, timestamp |
| Export Center | `/exports` | Agency Admin, Planner | Generate nightly reports, occupancy summaries; choose format (CSV/PDF) and language |

---

## Mobile Ops Screens

The mobile app is a simplified, touch-optimised subset focused on the three operational workflows.

### Mobile Ops Routes

The `/ops/*` tree (mounted via `OpsLayout.vue`) is its own route subtree with real URLs — it isn't just a nav skin over the desktop routes, though it renders the same view components (see the Occupancy Module note above).

| Screen | Route | Role | Description |
|--------|-------|------|-------------|
| Ops root | `/ops` | Property Admin, Front Desk | Redirects to `/ops/arrivals` |
| Arrivals (Mobile) | `/ops/arrivals` | Property Admin, Front Desk | `OpsArrivals` — same component as `/arrivals` |
| In-House (Mobile) | `/ops/in-house` | Property Admin, Front Desk | `OpsInHouse` — same component as `/in-house` |
| Inspection Mode (Mobile) | `/ops/inspection` | Property Admin, Front Desk | `OpsInspection` — same component as `/inspection` |

The PWA manifest (`vite.config.ts`) sets `start_url: '/ops/arrivals'`, so installing the app to a home screen launches straight into Arrivals.

### Navigation

```
┌─────────────────────────────────┐
│  ☰  Beduno         [Property ▼] │  ← property selector (if user has access to multiple)
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
| MOVED | Przeniesiony | Moved | Verschoben | Переміщено | Перемещён |
| CANCELLED | Anulowany | Cancelled | Storniert | Скасовано | Отменён |

### Predefined Reasons (localized tags instead of free text)

- Arrived late / Docs missing / Room conflict / Sent to other property
- Maintenance / Damage / Reserved / Emergency
- Voluntary departure / Contract ended / Disciplinary

### String Budget

Target: **~400 core strings** for the full MVP across both apps. This keeps translation manageable and affordable for 5 languages.
