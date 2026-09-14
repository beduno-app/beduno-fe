# Artifact 2 — Structure Report

Scope: dependencies, entry points, cycles, and centers of gravity in `beduno-fe`. Working
report feeding a later synthesis — not exhaustive per-file coverage.

## Entry points

| File | Role |
| --- | --- |
| `src/main.ts` | App bootstrap — creates the Vue app, installs Pinia, router, i18n, mounts `#app`. |
| `src/App.vue` | Root component — wires `useAuthStore`, `useIdleTimeout`, `useToast`/`ToastNotifications` at the top of the tree. |
| `src/app/router/index.ts` (199 lines) | Defines the two route trees (`/ops/*` → `OpsLayout`, restricted to `PROPERTY_ADMIN`/`FRONT_DESK`; `/*` → `AdminLayout`) and the single `router.beforeEach` guard (auth redirect to `Login`, role check redirect to `Forbidden`). Imports `useAuthStore` and `UserRole` from `auth` module directly (`src/app/router/index.ts:2-3`) — the router is necessarily coupled to auth. |
| `src/app/plugins/pinia.ts` | Creates the Pinia instance and installs `pinia-plugin-persistedstate`. |
| `src/app/plugins/i18n.ts` | Registers all five locales (`pl` default, `en` fallback) via `vue-i18n` `legacy: false`. |
| `vite.config.ts` | Build/dev config: `@` → `src/` alias, dev proxy `/api` → `VITE_DEV_PROXY_TARGET` (default `localhost:8080`), Vitest config (`e2e/**` excluded), `VitePWA` manifest with `start_url: /ops/arrivals`, `NetworkFirst` runtime caching for `/api/*`, bundle visualizer behind `ANALYZE=true`. |

`src/app/` is intentionally thin: 3 files total (`router/index.ts`, `plugins/pinia.ts`,
`plugins/i18n.ts`) — pure bootstrap wiring, no business logic.

## Module inventory

11 modules under `src/modules/`. Shape column checks for the six CLAUDE.md-prescribed
subdirs: `api/ store/ composables/ components/ views/ types/`.

| Module | Shape (present / expected 6) | Purpose |
| --- | --- | --- |
| `admin` | 3/6 — `api, types, views` (no `store`, `composables`, `components`) | User management and role/permission screens (`UserManagement.vue`, `RolePermissions.vue`). |
| `arrivals` | 6/6 | Today's arrivals list for ops front-desk; owns offline check-in/no-show/move flow via `arrivals.store.ts`. |
| `audit` | 5/6 — no `composables` | Audit log viewer and event row rendering. |
| `auth` | 5/6 — no `components` | Login, session/role state (`auth.store.ts`), dashboard aggregation API. |
| `exports` | 5/6 — no `store` | Export center (CSV/report generation). |
| `inhouse` | 5/6 — no `composables` | Current in-house occupancy view + check-out/room-move store. |
| `inspection` | 5/6 — no `composables` | Inspection-mode screens (worker verification during property inspection). |
| `ops` | 4/6 — `components, composables, store` only (no `api`, `views`, `types`) | Cross-cutting **offline infrastructure** for the ops surface: `ops.store.ts`, `sync.store.ts` (replays queued actions), `useOfflineSnapshot.ts`, `ConflictInbox.vue`, `OfflineBanner.vue`. Not a feature module in the usual sense — see centers-of-gravity below. |
| `properties` | 6/6 | Properties/rooms/beds CRUD, `RoomManagement.vue`, bed endpoints. |
| `stays` | 6/6 | Planned-stay lifecycle (`PLANNED → EXPECTED_TODAY → CHECKED_IN → …`), stay planner, bulk assign, conflict detection (`useConflicts.ts`). |
| `workers` | 6/6 | Worker roster CRUD, import, detail (incl. QR code display). |

Deviation from the CLAUDE.md-documented shape is common but shallow — modules mostly omit a
subdir they genuinely don't need (e.g. `admin` and `exports` have no live Pinia store) rather
than misplacing files. `ops` is the one structural outlier: it has no `views`/`types` because
it isn't routed directly — it's consumed by other modules' offline flows (see below).

## Cross-module dependency graph

Built from `grep -rhoE "from '@/modules/[a-zA-Z]+" src/modules/<mod>/` per module, both
type-only and runtime imports (distinguished per-edge below). Edge = `A → B` means files in
module A import from module B.

```
admin       → auth                         (type-only: UserRole, AuthUser)
arrivals    → ops, properties, stays, workers
audit       → (none)
auth        → properties, stays, workers    (dashboard.api.ts aggregates all three)
exports     → properties                    (usePropertiesStore, runtime)
inhouse     → ops, properties, stays
inspection  → ops, properties, workers
ops         → arrivals, inhouse, properties, stays, workers
properties  → auth                          (useAuthStore, runtime)
stays       → auth, properties, workers
workers     → auth, stays
```

Notable runtime (non-type-only) cross-module edges — these are the ones that actually couple
module internals, not just shared data shapes:

- `stays/views/CreateStay.vue:7` and `stays/views/BulkAssign.vue:7` → `import { useWorkersStore } from '@/modules/workers/store/workers.store'`
- `exports/views/ExportCenter.vue:4` and `inspection/views/InspectionMode.vue:5` → `import { usePropertiesStore } from '@/modules/properties/store/properties.store'`
- `inspection/views/InspectionMode.vue:6` → `import { useOpsStore } from '@/modules/ops/store/ops.store'`
- `properties/views/PropertyDetail.vue:10`, `stays/views/StayDetail.vue:12`, `workers/views/WorkerDetail.vue:9` → `import { useAuthStore } from '@/modules/auth/store/auth.store'`
- `arrivals/store/arrivals.store.ts:13` and `inhouse/store/inhouse.store.ts:8` → `import { useSyncStore } from '@/modules/ops/store/sync.store'`
- `ops/store/sync.store.ts:13-16` → `arrivalsApi`, `inhouseApi`, and their payload types (the replay/conflict-resolution engine needs both modules' action shapes)

**CLAUDE.md says**: *"Keep cross-module imports to types and shared code; don't reach into
another module's store from a view."* That rule is broken in practice: at least 6 views/stores
import another module's Pinia store directly (`useWorkersStore`, `usePropertiesStore` ×2,
`useOpsStore`, `useAuthStore` ×3, `useSyncStore` ×2 — see file:line list above). `auth.store`
is the most-reached-into store from other modules' views (3 call sites), followed by
`workers.store` and `properties.store` (2 each). This is a real, repeated deviation from the
stated convention, not an isolated slip.

## Cycles found

Traced by hand from the adjacency list above (11 modules, tractable manually).

**One cycle found: `ops ↔ arrivals` and `ops ↔ inhouse`.**

- `ops/composables/useOfflineSnapshot.ts:3` and `ops/store/sync.store.ts:13` import from `arrivals` (`arrivalsApi`, arrival types).
- `arrivals/store/arrivals.store.ts:13` imports `useSyncStore` back from `ops`.
- → `ops → arrivals → ops`.

- `ops/store/sync.store.ts:14` imports from `inhouse` (`inhouseApi`, inhouse types).
- `inhouse/store/inhouse.store.ts:8` imports `useSyncStore` back from `ops`.
- → `ops → inhouse → ops`.

This is a real bidirectional module coupling, not just a type-only round trip — both
directions carry runtime imports (Pinia stores / API clients). It reads as intentional: `ops`
is the shared offline-sync engine and necessarily needs to call `arrivalsApi`/`inhouseApi` to
replay queued actions, while `arrivals`/`inhouse` stores need to enqueue into `ops`'s
`sync.store`. Architecturally this makes `ops` less a peer feature module and more a shared
offline-infrastructure layer that happens to live under `modules/` instead of `shared/` —
worth flagging for the synthesis pass since it's the one place the "modules stay independent"
principle structurally can't hold as currently split.

No other cycles found: `workers ↔ stays` looked like a candidate (`workers/api/workers.api.ts:3`
and `workers/views/WorkerDetail.vue:7` import `Stay`/`StayStatus` types from `stays`; `stays`
views import `useWorkersStore`/`workersApi`/`Worker` types from `workers`) but one side
(`workers → stays`) is entirely `import type` — type-only imports are erased at build time and
don't create a runtime cycle, only a type-level one. Same check applied to `auth ↔ properties`
(`properties/views/PropertyDetail.vue:10` → `useAuthStore`; `auth/api/dashboard.api.ts:1` →
`propertiesApi`) — both edges are runtime, but the second is one-directional at the type level
(dashboard.api.ts only calls the API, doesn't get called back by properties), so no cycle.

## Local centers of gravity

| File / module | Approx. dependent-file count | Why it's central |
| --- | --- | --- |
| `src/shared/composables/useApi.ts` | 10 direct (`grep -rl "from '@/shared/composables/useApi'"`: one per module's `api/*.api.ts`) | The single shared axios instance every module's API layer is built on; owns the 401 refresh-and-retry interceptor (per `CLAUDE.md`/README). All 10 feature modules' `api/` files depend on it. |
| `src/modules/auth/store/auth.store.ts` | 10 (`App.vue`, `app/router/index.ts`, `useApi.ts`, `useIdleTimeout.ts`, `AdminLayout.vue`, `OpsLayout.vue`, plus 3 cross-module view reach-ins: `PropertyDetail.vue`, `StayDetail.vue`, `WorkerDetail.vue`) | Session/role state read by the router guard, both layouts, the axios interceptor, idle-timeout, and reached into directly by 3 other modules' detail views (a convention violation noted above). |
| `src/shared/components/BaseButton.vue` | 27 | Highest-use shared UI primitive by a wide margin — the de facto default button across every module. |
| `src/shared/services/db.ts` | 2 direct (`offlineDb.ts`, `actionQueue.ts`, both via relative `./db`), fanning out further | Single IndexedDB instance (`DB_NAME`, `DB_VERSION`). Only 2 direct importers, but those two (`offlineDb.ts`, `actionQueue.ts`) are themselves imported across the ops-offline path (`ops/composables/useOfflineSnapshot.ts`, `arrivals`/`inhouse` stores), so its real reach is indirect/transitive rather than fan-in-heavy. |
| `src/shared/services/actionQueue.ts` | 5 (`arrivals.store.ts` + spec, `inhouse.store.ts`, `sync.store.ts` + spec) | Queues `CHECK_IN/CHECK_OUT/MOVE/NO_SHOW` while offline; the shared contract between the two occupancy modules and the `ops` sync engine — same footprint as the `ops` cycle above. |
| `src/shared/composables/useEntityLookup.ts` | 7 (`ArrivalRow.vue`, `AuditEventRow.vue`, `BulkAssign.vue`, `CreateStay.vue`, `StayDetail.vue`, `StayPlanner.vue`, `WorkerDetail.vue`) | The mandated path (per `CLAUDE.md`) for resolving flat `workerId`/`propertyId`/`roomId` IDs to display data against `workersApi`/`propertiesApi`/`adminApi` — used everywhere a flat API response needs denormalizing for UI. |
| `src/shared/layouts/{AdminLayout,OpsLayout}.vue` | 2 (one per route tree root) | Low fan-in by file count but each is the literal parent of dozens of routed views — structural centrality, not import centrality. |

Other `Base*` components (`BaseInput` 9, `BaseBadge` 7, `SkeletonLoader` 7, `StatusChip` 5,
`ToastNotifications` 3, `BaseModal` 3, `DataTable` 1) are used far less than `BaseButton`;
`DataTable` in particular (1 usage) looks under-adopted relative to its apparent purpose as a
shared list/table component — worth checking in synthesis whether modules are hand-rolling
tables instead.

## Shared/cross-cutting layer

`src/shared/` (23 files across `components/`, `composables/`, `layouts/`, `services/`,
`types/`, `utils/`) is the load-bearing cross-cutting layer every module sits on:

- **`components/`** — 8 `Base*`/shared components, barrel-exported via `components/index.ts`. `BaseButton` dominates usage (27 sites); adoption of the rest is uneven (see above).
- **`composables/`** — `useApi.ts` (axios + 401 refresh), `useEntityLookup.ts` (ID→display resolution), `useIdleTimeout.ts`, `useToast.ts` (6 importers), `usePullToRefresh.ts`, `useSwipe.ts` (ops-surface gesture helpers, not grep-counted here as low-signal).
- **`services/`** — `db.ts` (IndexedDB instance), `offlineDb.ts` (per-property offline snapshot), `actionQueue.ts` (offline action queue) — this trio is the backbone of the ops offline story and is consumed almost exclusively through the `ops` module and the `arrivals`/`inhouse` stores, reinforcing that `ops` + `shared/services/*` together form one offline subsystem spanning the `modules/` boundary.
- **`types/`** — `api.types.ts`, `occupancy.types.ts`, plus the generated `api-schema.d.ts` (per `CLAUDE.md`, not imported by app code — reference-only for drift-checking).
- **`layouts/`** — `AdminLayout.vue`, `OpsLayout.vue`, the two route-tree roots wired in `app/router/index.ts`.

`src/app/` (3 files) is much thinner than `src/shared/` — it holds only plugin installation and
routing, deferring all business/UI concerns to `modules/` and `shared/`. Every module depends on
`shared/composables/useApi.ts` for its API layer and, transitively, on `auth.store.ts` for the
axios interceptor's token refresh — making `useApi.ts` + `auth.store.ts` the two files whose
breakage would be most widely felt across the app.
