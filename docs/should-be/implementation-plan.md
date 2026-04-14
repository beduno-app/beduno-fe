# Implementation Plan

This plan bridges the current codebase (docs/as-is) to the target product (docs/should-be). Work is sequenced so each phase delivers a deployable, testable increment.

---

## Phase 0 — Foundation & Cleanup (Week 1–2)

**Goal**: Fix critical blockers and set up the project infrastructure for the new product direction. No new features — just make the existing codebase safe, testable, and ready for modular development.

### 0.1 Project Infrastructure

- [x] Migrate from Vue CLI (webpack) to **Vite** for faster dev/build cycles
- [x] Replace Vuex with **Pinia** (store is empty, so this is trivial)
- [x] Set up **strict TypeScript** (`strict: true` in tsconfig)
- [x] Add **ESLint flat config** + Prettier (replace current eslintrc)
- [x] Add **Vitest** for unit tests (replaces Jest; native Vite integration)
- [x] Set up **Playwright** for E2E tests (replaces outdated Cypress)
- [x] Delete broken test files (`tests/unit/example.spec.ts`, `tests/e2e/specs/test.js`)
- [x] Set up CI pipeline (lint → typecheck → unit tests → build)

### 0.2 Codebase Cleanup

- [x] Remove all hardcoded UUIDs, mock data, `console.log` calls
- [x] Fix nginx.conf: add `try_files` SPA fallback, externalise backend IP
- [x] Pin Docker base image to specific version
- [x] Deduplicate `_variables.scss`
- [x] Remove unused `HostSection.vue`
- [x] Delete the existing `src/auth/`, `src/views/`, `src/features/` code (the current bed marketplace UI is being replaced by the new ops system)

### 0.3 New Project Structure

- [x] Create the modular directory layout (`src/app/`, `src/modules/`, `src/shared/`)
- [x] Set up shared axios instance with interceptors (`src/app/plugins/axios.ts`)
- [x] Set up Pinia with persistence (`src/app/plugins/pinia.ts`)
- [x] Set up vue-i18n with the 5 language files (`src/app/plugins/i18n.ts`)
- [x] Create shared UI components: `Button`, `Input`, `Modal`, `Badge`, `StatusChip`, `DataTable`
- [x] Create shared layouts: `AdminLayout.vue` (sidebar + header), `OpsLayout.vue` (mobile-optimised)

**Deliverable**: Empty app shell with login page, language switcher, and shared component library. Fully typed, linted, and tested infrastructure.

---

## Phase 1 — Auth & User Management (Week 3–4)

**Goal**: Working authentication, role-based access, and user CRUD.

### 1.1 Auth Module

- [x] `auth.store.ts` — Pinia store: token, refreshToken, user, isAuthenticated, login(), logout()
- [x] `auth.api.ts` — login, refresh, logout endpoints
- [x] `Login.vue` — email + password, language selector, redirect on success
- [x] Axios request interceptor: attach `Authorization: Bearer {token}`
- [x] Axios response interceptor: handle 401 → refresh or redirect to login
- [x] Router guards: `requiresAuth`, `requiresRole` meta fields

### 1.2 User Management

- [x] `admin.api.ts` — CRUD users, assign roles
- [x] `UserManagement.vue` — list, invite, edit, deactivate users
- [x] `RolePermissions.vue` — visual permission matrix (read-only reference)
- [x] Per-user language preference (stored in user profile, applied on login)

**Deliverable**: Users can log in, see role-appropriate UI, manage other users (admin only).

---

## Phase 2 — Workers & Properties (Week 5–7)

**Goal**: Core entity management — the data that stays and occupancy operate on.

### 2.1 Workers Module

- [x] `worker.types.ts` — Worker interface, WorkerCreatePayload, etc.
- [x] `workers.store.ts` — list, search, pagination, cache by ID
- [x] `workers.api.ts` — CRUD + bulk import
- [x] `WorkerList.vue` — searchable, filterable data table (internal ID, name, status, tags, current property)
- [x] `WorkerDetail.vue` — profile, current stay, stay history
- [x] `WorkerImport.vue` — CSV upload → preview table → validation errors → confirm
- [x] `QrBadge.vue` — generate + preview QR badge; print/download
- [x] Batch badge print (select workers → generate PDF)

### 2.2 Properties Module

- [x] `property.types.ts` — Property, Room, PropertyRules interfaces
- [x] `properties.store.ts` — list, detail, room management
- [x] `properties.api.ts` — property CRUD + room CRUD + block/unblock
- [x] `PropertyList.vue` — all properties with occupancy summary card
- [x] `PropertyDetail.vue` — address, rules, room grid, occupancy overview
- [x] `RoomManagement.vue` — add/edit rooms, capacity, gender rule toggle, block/unblock with reason

**Deliverable**: Agency can manage its full worker directory and property/room inventory. QR badges can be printed.

---

## Phase 3 — Stays & Conflict Engine (Week 8–10)

**Goal**: The planning layer — agency proposes assignments, system validates constraints.

### 3.1 Stay Management

- [x] `stay.types.ts` — Stay, StayStatus, StayCreatePayload interfaces
- [x] `stays.store.ts` — list, filter, create, update, cancel
- [x] `stays.api.ts` — CRUD + bulk assign + bulk checkout
- [x] `StayPlanner.vue` — calendar/list view of all stays; filter by property, worker, date range, status
- [x] `CreateStay.vue` — select worker → property → room → dates; live conflict warnings inline
- [x] `BulkAssign.vue` — select multiple workers → target property/rooms → date range; conflict summary → confirm
- [x] `ConflictBanner.vue` — shared component showing capacity/gender/double-booking warnings

### 3.2 Conflict Engine (Frontend)

- [x] Pre-submit validation: check capacity, gender rules, double-booking before API call
- [x] Display hard conflicts (blocking) vs soft warnings (allow with confirmation)
- [x] `useConflicts()` composable — re-usable conflict checking logic

**Deliverable**: Agency planners can create and manage stay assignments with real-time constraint validation. Bulk operations work for large groups.

---

## Phase 4 — Operational Screens (Week 11–14)

**Goal**: The three must-not-fail screens — the core product value.

### 4.1 Arrivals Today

- [x] `ArrivalsToday.vue` — list of expected arrivals for selected property + date
- [x] `ArrivalRow.vue` — worker info, assigned room, one-tap check-in button
- [x] `QrCheckin.vue` — camera-based QR scanner → worker card → check-in confirmation
- [x] `NoShowAction.vue` — mark no-show with predefined reason
- [x] Move action — select target property + room
- [x] Real-time updates (polling or WebSocket) when another user checks someone in

### 4.2 In-House (Nightly List)

- [x] `InHouseView.vue` — room-by-room occupancy for selected property
- [x] Exception badges: over-capacity (red), near-capacity (amber), blocked (grey)
- [x] Unassigned workers section (workers at property but no room assigned)
- [x] One-tap export: CSV and PDF in selected language
- [x] Check-out action inline (for early departures)
- [x] Room move action (drag or select new room)

### 4.3 Inspection Mode

- [ ] `InspectionMode.vue` — sequential room-by-room walkthrough
- [ ] Per room: "expected" list + checkboxes for present/absent
- [ ] "Found but not expected" — add unknown presence
- [ ] "Mark as Verified" — timestamps + confirmer ID
- [ ] Discrepancy notes using predefined reason tags (localized)
- [ ] Inspection summary report (exportable)

### 4.4 Operational API Integration

- [ ] `POST /stays/:id/check-in`
- [ ] `POST /stays/:id/check-out`
- [ ] `POST /stays/:id/no-show`
- [ ] `POST /stays/:id/move`
- [ ] `POST /stays/bulk-checkout`

**Deliverable**: Property staff can run daily arrivals, maintain nightly occupancy truth, and complete inspections — all from the browser. This is the **core product loop**.

---

## Phase 5 — Audit, Exports & Reports (Week 15–16)

**Goal**: Trust infrastructure — the audit trail that makes the system the source of truth.

### 5.1 Audit Log

- [ ] `AuditLog.vue` — filterable event log with: actor, role, action, entity, before/after diff, timestamp
- [ ] Filter by: entity type, entity ID, actor, action, date range
- [ ] Highlight offline-synced actions (with sync timestamp)
- [ ] Link from any entity detail page to its audit history

### 5.2 Export Center

- [ ] `ExportCenter.vue` — generate reports with filters
- [ ] Nightly occupancy list per property (CSV + PDF)
- [ ] Exception report (unassigned workers, over-capacity rooms)
- [ ] Occupancy summary across properties for date range
- [ ] Language selector for exports (independent of UI language)

**Deliverable**: Every change is traceable. Reports can be generated for internal use and external audits.

---

## Phase 6 — Mobile Optimisation & Offline (Week 17–20)

**Goal**: Mobile-first operational experience with offline capability for poor-reception environments.

### 6.1 Mobile-Optimised UI

- [ ] `OpsLayout.vue` — bottom navigation (Arrivals / In-House / Inspection), property selector
- [ ] Touch-optimised components: large tap targets, swipe actions, pull-to-refresh
- [ ] Responsive breakpoints: the 3 operational screens must work flawlessly on 360px+ screens
- [ ] Install as PWA (service worker, manifest, icons)

### 6.2 Offline Support

- [ ] Service worker: cache app shell + static assets
- [ ] IndexedDB: store current property's room/worker/stay data locally
- [ ] Action queue: check-in/out/move stored locally when offline
- [ ] Sync engine: on reconnect, replay queued actions to server in order
- [ ] Conflict inbox: when sync detects a conflict (capacity exceeded, already checked-in), show "Needs review" list
- [ ] Visual indicator: "Offline — X actions queued" banner
- [ ] Room inventory changes remain **online-only** (prevent capacity conflicts from offline edits)

### 6.3 QR Scanner

- [ ] Camera-based QR scanning using a library (e.g. `html5-qrcode` or `jsQR`)
- [ ] Decode `bedok:{workerId}:{checksum}` → validate checksum → resolve worker
- [ ] Fallback: manual internal ID search input
- [ ] Works offline (worker data is cached locally)

**Deliverable**: Front desk can operate the app on a phone, even with poor or no connectivity. All actions sync when back online.

---

## Phase 7 — Localisation & Polish (Week 21–22)

**Goal**: Full 5-language support and production-quality UX.

### 7.1 Localisation

- [ ] Extract all UI strings to i18n files (~400 strings per language)
- [ ] Professional translation for PL, EN, DE, UA, RU
- [ ] Localised status labels, action buttons, predefined reasons, error messages
- [ ] Per-user language stored in profile; set on login
- [ ] Export/report language selector (independent of UI)
- [ ] Date/number formatting per locale

### 7.2 UX Polish

- [ ] Loading states: skeleton loaders for data-fetching views
- [ ] Error states: user-friendly error messages for API failures, offline conflicts
- [ ] Empty states: helpful messages when no data exists yet ("No workers imported yet")
- [ ] Keyboard navigation: accessibility for web admin power users
- [ ] Notifications: toast for check-in success, conflict warnings, sync completion

**Deliverable**: Production-ready app in 5 languages with polished UX.

---

## Phase 8 — Testing & Hardening (Week 23–24)

**Goal**: Confidence that the system works under real conditions.

### 8.1 Automated Testing

- [ ] Unit tests: conflict engine, stay status transitions, QR decode, date utilities
- [ ] Component tests: Arrivals, In-House, Inspection views with mock data
- [ ] Integration tests: auth flow, stay creation with conflict, bulk import
- [ ] E2E tests (Playwright): full check-in journey, inspection flow, export generation
- [ ] Offline scenario tests: queue actions → reconnect → sync → conflict resolution

### 8.2 Performance & Security

- [ ] Bundle analysis + code splitting per module
- [ ] Lazy-load routes (already built into Vite + Vue Router)
- [ ] Security review: XSS, CSRF, token storage, PII exposure
- [ ] Session timeout + auto-logout
- [ ] Device revocation testing
- [ ] Load test: 500 workers / 50 rooms / 200 stays in a single property view

**Deliverable**: Test suite covering critical paths. Performance verified for target scale.

---

## Summary Timeline

| Phase | Scope | Duration | Cumulative |
|-------|-------|----------|------------|
| 0 | Foundation & cleanup | 2 weeks | Week 2 |
| 1 | Auth & user management | 2 weeks | Week 4 |
| 2 | Workers & properties | 3 weeks | Week 7 |
| 3 | Stays & conflict engine | 3 weeks | Week 10 |
| 4 | Operational screens (core) | 4 weeks | Week 14 |
| 5 | Audit, exports, reports | 2 weeks | Week 16 |
| 6 | Mobile & offline | 4 weeks | Week 20 |
| 7 | Localisation & polish | 2 weeks | Week 22 |
| 8 | Testing & hardening | 2 weeks | Week 24 |

### Critical Path

Phases 0–4 are the critical path. At the end of Phase 4 (week 14), the core product loop works: agency plans stays → property checks in/out → nightly list is accurate → inspections pass.

### Pilot Readiness

After Phase 4, the system is ready for a **concierge pilot** with one agency and one property (web-only, online-only). Phases 5–8 add the trust infrastructure (audit), mobile/offline capability, and production polish needed for scaling.

---

## Migration Strategy: As-Is → Should-Be

The current codebase is a **bed marketplace prototype** (guests search for beds to rent). The target product is an **ops system for agency bed management**. These are fundamentally different applications.

### What to Keep

- **i18n infrastructure** — the vue-i18n setup and translation file structure are reusable; content will be completely rewritten
- **SCSS variable system** — the design token approach is sound; colours and values will change
- **Deployment pipeline** — Docker + nginx pattern stays; config needs fixing
- **Domain knowledge** — bed, room, property, guest/worker concepts carry over at a conceptual level

### What to Discard

- **All view components** — the marketplace UI (home page, ad creation, ad listing, booking, blog, career, contact, etc.) has no equivalent in the ops system
- **All feature components** — ad creation forms, ad detail displays, carousel, search, blog cards
- **Auth components** — Login/Register need complete rewrite for role-based system
- **Vuex store** — replacing with Pinia (store is empty anyway)
- **FormKit genesis theme** — may keep FormKit but theming will change for the ops-focused UI

### Recommended Approach

**Clean break, shared repo.** Don't try to incrementally refactor the marketplace code into the ops system. Instead:

1. Keep the repo and git history
2. In Phase 0, remove all `src/views/`, `src/features/`, `src/auth/` content
3. Set up the new module structure from scratch
4. Carry forward only infrastructure: build config, i18n skeleton, SCSS variables, Docker setup

This avoids the risk of old marketplace patterns and types leaking into the new architecture.
