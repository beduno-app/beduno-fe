# Target Architecture

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                        Clients                          │
│                                                         │
│  ┌──────────────┐          ┌──────────────────────────┐ │
│  │  Web Admin   │          │  Mobile Ops App          │ │
│  │  (Vue 3 SPA) │          │  (PWA or Native)         │ │
│  │              │          │  - Offline-first          │ │
│  │  Agency +    │          │  - QR scanner             │ │
│  │  Property    │          │  - Local action queue     │ │
│  │  Admin       │          │  - Sync on reconnect      │ │
│  └──────┬───────┘          └───────────┬──────────────┘ │
└─────────┼──────────────────────────────┼────────────────┘
          │ HTTPS                        │ HTTPS
          │                              │
┌─────────┼──────────────────────────────┼────────────────┐
│         ▼                              ▼                │
│  ┌─────────────────────────────────────────────────┐    │
│  │              API Gateway / BFF                   │    │
│  │  - Auth (JWT)                                    │    │
│  │  - RBAC enforcement                              │    │
│  │  - Rate limiting                                 │    │
│  │  - Request validation                            │    │
│  └──────────────────────┬──────────────────────────┘    │
│                         │                               │
│  ┌──────────────────────┼──────────────────────────┐    │
│  │                 Core Services                    │    │
│  │                                                  │    │
│  │  ┌──────────┐ ┌──────────┐ ┌─────────────────┐  │    │
│  │  │ Identity │ │ Property │ │   Occupancy     │  │    │
│  │  │ & Auth   │ │ & Room   │ │   & Stays       │  │    │
│  │  └──────────┘ └──────────┘ └─────────────────┘  │    │
│  │  ┌──────────┐ ┌──────────┐ ┌─────────────────┐  │    │
│  │  │ Workers  │ │ Conflict │ │   Audit / Event │  │    │
│  │  │          │ │ Engine   │ │   Log           │  │    │
│  │  └──────────┘ └──────────┘ └─────────────────┘  │    │
│  │  ┌──────────┐ ┌──────────────────────────────┐  │    │
│  │  │ Export / │ │      Sync (offline            │  │    │
│  │  │ Reports  │ │      action queue)            │  │    │
│  │  └──────────┘ └──────────────────────────────┘  │    │
│  └──────────────────────────────────────────────────┘    │
│                         │                               │
│  ┌──────────────────────┼──────────────────────────┐    │
│  │              Data Layer                          │    │
│  │  - PostgreSQL (entities + stays + audit events)  │    │
│  │  - Event store (append-only audit trail)         │    │
│  └──────────────────────────────────────────────────┘    │
│                    Backend                               │
└──────────────────────────────────────────────────────────┘
```

## Frontend Architecture (Web Admin)

The current Vue 3 codebase needs significant restructuring. Below is the target architecture.

### Directory Structure

```
src/
├── App.vue                            Root shell (RouterView, idle timeout, toasts)
├── main.ts
├── app/
│   ├── router/index.ts                Route definitions + inline auth/role beforeEach
│   └── plugins/
│       ├── i18n.ts                    vue-i18n (pl default, en fallback)
│       └── pinia.ts                   Pinia + persistedstate
│
├── modules/
│   ├── auth/          views/ Login, Dashboard, Forbidden · store/ auth.store.ts · api/ · types/
│   ├── workers/       views/ WorkerList, WorkerCreate, WorkerDetail, WorkerImport
│   │                  components/ QrBadge, BatchBadgePrint · store/ · api/ · types/
│   ├── properties/    views/ PropertyList, PropertyCreate, PropertyDetail
│   │                  components/ RoomManagement (modal) · store/ · api/ · types/
│   ├── stays/         views/ StayPlanner, CreateStay, StayDetail, BulkAssign
│   │                  components/ ConflictBanner · composables/ useConflicts · store/ · api/ · types/
│   ├── arrivals/      views/ ArrivalsToday
│   │                  components/ ArrivalRow, QrCheckin, NoShowAction, MoveAction · store/ · api/ · types/
│   ├── inhouse/       views/ InHouseView
│   │                  components/ RoomCard, CapacityBadge, UnassignedWorkers · store/ · api/ · types/
│   ├── inspection/    views/ InspectionMode
│   │                  components/ RoomInspectionCard, InspectionSummaryReport · store/ · api/ · types/
│   ├── ops/           components/ ConflictInbox, OfflineBanner
│   │                  composables/ useOfflineSnapshot · store/ ops.store.ts, sync.store.ts
│   ├── audit/         views/ AuditLog · components/ AuditEventRow, AuditDiffViewer · store/ · api/ · types/
│   ├── exports/       views/ ExportCenter · components/ ReportCard
│   │                  composables/ useExportDownload · api/ · types/
│   └── admin/         views/ UserManagement, RolePermissions · api/ · types/
│
├── shared/
│   ├── components/    BaseButton, BaseInput, BaseModal, BaseBadge, StatusChip,
│   │                  DataTable, SkeletonLoader, ToastNotifications (+ index.ts barrel)
│   ├── composables/   useApi (axios + interceptors), useToast, useIdleTimeout,
│   │                  usePullToRefresh, useSwipe
│   ├── services/      db.ts, offlineDb.ts, actionQueue.ts   (IndexedDB offline queue)
│   ├── layouts/       AdminLayout.vue, OpsLayout.vue
│   ├── types/         api.types.ts   (PaginatedResponse, ApiError)
│   └── utils/         formatDate.ts, qrCode.ts
│
└── assets/translations/   pl.ts, en.ts, de.ts, ua.ts, ru.ts
```

There is no `app/plugins/axios.ts` — the axios instance and its interceptors (auth header injection, error handling, refresh token) live in `src/shared/composables/useApi.ts`. There is no `app/router/guards.ts` — the auth/role guard is inline in `src/app/router/index.ts`. `App.vue` lives at `src/App.vue`, not under `app/`. The `occupancy/` module never existed as shipped code; its functionality shipped as the separate `inhouse/` and `inspection/` modules (their empty scaffold directories, if any were ever committed, are gone). The `ops/` module (offline conflict inbox + banner + sync/ops stores) exists but was previously missing from this doc entirely. Shared base components carry a `Base` prefix (`BaseButton`, `BaseInput`, etc.), not the bare names (`Button`, `Input`) shown before.

`src/assets/styles/` holds no files — there is no `_variables.scss`, `_mixins.scss`, or `global.scss`. Global styles are instead an unscoped `<style>` block in `src/App.vue` (box-sizing reset, body font stack), and individual components hard-code their colours (e.g. `#e66e00`) directly in scoped SCSS (`<style scoped lang="scss">`) rather than referencing shared tokens.

### Key Architectural Changes from As-Is

| Concern | Pre-rewrite baseline (v0.1) | Shipped (v0.2) |
|---------|-------|-----------|
| Component style | `vue-class-component` + `@Options` | `<script setup>` Composition API |
| State management | Empty Vuex store, all component-local | Pinia stores per module |
| API layer | `this.axios` calls inline in `mounted()` | Dedicated `*.api.ts` files per module + shared `useApi()` composable |
| Type safety | `any` everywhere, `@ts-ignore` | Strict TypeScript interfaces per module |
| Error handling | None | Global axios interceptor + per-view error/loading state |
| Auth | Non-existent | JWT-based, stored in Pinia + localStorage, route guards |
| Routing | 16 flat routes, no guards | Nested routes per module, role-based guards |
| Offline | Not supported | Service worker + IndexedDB action queue (mobile) |
| i18n | Polish-only in practice | 5 languages, per-user setting, localized exports |
| Forms | FormKit (some), raw inputs (rest) | Hand-rolled inputs + shared `BaseInput`; FormKit and Zod/Valibot validation schemas were considered but deferred and not adopted |

### Component Conventions (Target)

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'
import { useWorkers } from '../composables/useWorkers'
import type { Worker } from '../types/worker.types'

const props = defineProps<{
  workerId: string
}>()

const { worker, isLoading, error } = useWorkers(props.workerId)

const displayName = computed(() =>
  worker.value ? `${worker.value.firstName} ${worker.value.lastName} (${worker.value.internalId})` : ''
)
</script>

<template>
  <div v-if="isLoading">...</div>
  <div v-else-if="error">...</div>
  <div v-else>{{ displayName }}</div>
</template>
```

### API Layer Pattern

Each module has a dedicated API file. All API files use a shared axios instance with interceptors (auth header injection, error handling, refresh token).

```typescript
// src/modules/workers/api/workers.api.ts
import { api } from '@/shared/composables/useApi'
import type { Worker, WorkerCreatePayload } from '../types/worker.types'

export const workersApi = {
  list: (params?: { page: number; size: number }) =>
    api.get<PaginatedResponse<Worker>>('/workers', { params }).then((r) => r.data),

  getById: (id: string) =>
    api.get<Worker>(`/workers/${id}`).then((r) => r.data),

  create: (payload: WorkerCreatePayload) =>
    api.post<Worker>('/workers', payload).then((r) => r.data),

  bulkImport: (file: File) => {
    const form = new FormData()
    form.append('file', file)
    return api.post('/workers/import', form).then((r) => r.data)
  },
}
```

### State Management Pattern (Pinia)

```typescript
// src/modules/auth/store/auth.store.ts
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('token'))
  const user = ref<AuthUser | null>(null)

  const isAuthenticated = computed(() => !!token.value)
  const userRole = computed(() => user.value?.role)

  async function login(credentials: LoginPayload) { ... }
  function logout() { ... }

  return { token, user, isAuthenticated, userRole, login, logout }
})
```

### Route Guards

```typescript
// src/app/router/index.ts
declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    roles?: UserRole[]
  }
}

router.beforeEach((to) => {
  const auth = useAuthStore()

  if (to.meta.requiresAuth !== false && !auth.isAuthenticated) {
    return { name: 'Login' }
  }

  if (to.name === 'Login' && auth.isAuthenticated) {
    return { name: 'Dashboard' }
  }

  const requiredRoles = to.meta.roles
  if (requiredRoles && auth.userRole && !requiredRoles.includes(auth.userRole)) {
    return { name: 'Forbidden' }
  }
})
```

### Offline Architecture (Mobile Ops)

```
┌─────────────────────────────────────┐
│           Mobile Ops App            │
│                                     │
│  ┌───────────┐  ┌────────────────┐  │
│  │ UI Layer  │  │ Local State    │  │
│  │ (Vue 3)   │◄─┤ (Pinia +      │  │
│  │           │  │  IndexedDB)    │  │
│  └───────────┘  └───────┬────────┘  │
│                         │           │
│  ┌──────────────────────┼────────┐  │
│  │    Sync Engine                │  │
│  │  ┌─────────────────────────┐  │  │
│  │  │ Action Queue            │  │  │
│  │  │ (append-only, ordered)  │  │  │
│  │  └────────────┬────────────┘  │  │
│  │               │ on reconnect  │  │
│  │  ┌────────────▼────────────┐  │  │
│  │  │ Conflict Resolver       │  │  │
│  │  │ - capacity exceeded?    │  │  │
│  │  │ - already checked in?   │  │  │
│  │  │ → "Needs review" inbox  │  │  │
│  │  └─────────────────────────┘  │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

**Offline rules:**
- Check-in/out and room moves are queued locally
- Queued actions apply in order on sync
- Conflicts go to a "Needs review" inbox for property admin
- Room inventory and capacity changes are online-only

## Data Model

```
┌──────────────┐       ┌──────────────┐
│   Agency     │       │   Property   │
│──────────────│       │──────────────│
│ id           │       │ id           │
│ name         │       │ name         │
│ billingInfo  │       │ address      │  (string)
│ settings     │◄──┐   │ agencyId     │
└──────────────┘   │   │ type         │  (INTERNAL|PARTNER)
                   │   │ genderRule   │  (PER_ROOM|PER_PROPERTY|MIXED)
                   │   │ status       │  (ACTIVE|INACTIVE)
                   │   │ notes        │
                   │   └──────┬───────┘
┌──────────────┐   │          │ 1:N
│   User       │   │   ┌──────┴───────┐
│──────────────│   │   │    Room      │
│ id           │   │   │──────────────│
│ firstName    │   │   │ id           │
│ lastName     │   │   │ propertyId   │
│ email        │   │   │ roomNumber   │
│ role         │   │   │ capacity     │
│ agencyId     │───┘   │ blockedSpots │
│ assignedPropertyIds[] │ availableSpots │
│ language     │       │ currentOccupancy │
│  (PL|EN|DE|  │       │ genderRule   │  (MALE_ONLY|FEMALE_ONLY|MIXED)
│   UA|RU)     │       │ floor        │
│ status       │       │ status       │  (ACTIVE|BLOCKED)
└──────────────┘       └──────┬───────┘
                              │
┌──────────────┐       ┌──────┴───────┐
│   Worker     │       │    Stay      │
│──────────────│       │──────────────│
│ id           │       │ workerId     │
│ internalId   │◄──────│ propertyId   │
│ firstName    │       │ roomId       │
│ lastName     │       │ dateFrom     │
│ phone        │       │ dateTo       │
│ gender       │       │ status       │ ← planned/expected/checked-in/
│ tags[]       │       │ overrideReason? │ checked-out/no-show/moved/cancelled
│ notes        │       │ createdBy    │
│ status       │       │ confirmedBy  │
│ currentStay  │       └──────────────┘
│ agencyId     │
└──────────────┘

┌──────────────────────┐
│   AuditEvent         │
│──────────────────────│
│ id                   │
│ actor{id,firstName,  │
│  lastName,role}      │
│ action               │  ← check-in / check-out / move / assign / etc.
│ entityType           │
│ entityId             │
│ entityLabel          │
│ diff[]               │  ← Array<{field, before, after}>
│ timestamp            │
│ syncedAt             │  (string | null)
└──────────────────────┘
```

Note: `GenderRule` (property-level: `PER_ROOM | PER_PROPERTY | MIXED`) and `RoomGenderRule` (room-level: `MALE_ONLY | FEMALE_ONLY | MIXED`) are two distinct types, not a shared union. `Worker.phone` and `Worker.notes` are required fields, not optional.

### Stay Status State Machine

```
                    ┌─────────────┐
  Agency creates    │   PLANNED   │
  assignment ──────►│             │
                    └──┬───┬──────┘
                       │   │
          arrival day  │   │ cancelled
                       ▼   ▼
                    ┌─────────────┐  ┌───────────┐
                    │  EXPECTED   │  │ CANCELLED │
                    │  (today)    │  └───────────┘
                    └──┬───┬───┬──┘
                       │   │   │
         front desk    │   │   │ end of day
         scans QR      │   │   │ (no scan)
                       │   │   ▼
                       │   │ ┌──────────┐
                       │   │ │ NO_SHOW  │
                       │   │ └──────────┘
                       │   ▼
                       │ ┌───────────┐
                       │ │ CANCELLED │
                       ▼ └───────────┘
              ┌────────────┐
              │ CHECKED_IN │
              └──┬───┬───┬─┘
                 │   │   │
    checks out   │   │   │ cancelled
                 │   │   ▼
                 │   │ ┌───────────┐
                 │   │ │ CANCELLED │
                 │   │ └───────────┘
                 │   ▼
                 │ ┌──────────┐
                 │ │  MOVED   │
                 ▼ └──────────┘
             ┌──────────────┐
             │ CHECKED_OUT  │
             └──────────────┘
```
