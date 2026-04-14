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
├── app/
│   ├── App.vue                        Shell layout
│   ├── router/
│   │   ├── index.ts                   Route definitions
│   │   └── guards.ts                  Auth + role guards
│   └── plugins/
│       ├── axios.ts                   Axios instance + interceptors
│       ├── i18n.ts                    vue-i18n setup
│       └── pinia.ts                   Store setup
│
├── modules/                           Feature modules (vertical slices)
│   ├── auth/
│   │   ├── views/                     Login.vue, Register.vue
│   │   ├── composables/               useAuth()
│   │   ├── store/                     auth.store.ts (Pinia)
│   │   ├── api/                       auth.api.ts
│   │   └── types/                     auth.types.ts
│   │
│   ├── workers/
│   │   ├── views/                     WorkerList.vue, WorkerDetail.vue, WorkerImport.vue
│   │   ├── components/                WorkerCard.vue, WorkerSearchInput.vue, QrBadge.vue
│   │   ├── composables/               useWorkers(), useWorkerSearch()
│   │   ├── store/                     workers.store.ts
│   │   ├── api/                       workers.api.ts
│   │   └── types/                     worker.types.ts
│   │
│   ├── properties/
│   │   ├── views/                     PropertyList.vue, PropertyDetail.vue, RoomManagement.vue
│   │   ├── components/                RoomCard.vue, CapacityBadge.vue, GenderRuleToggle.vue
│   │   ├── composables/               useProperties(), useRooms()
│   │   ├── store/                     properties.store.ts
│   │   ├── api/                       properties.api.ts
│   │   └── types/                     property.types.ts
│   │
│   ├── stays/
│   │   ├── views/                     StayPlanner.vue, BulkAssign.vue
│   │   ├── components/                StayRow.vue, StayCalendar.vue, ConflictBanner.vue
│   │   ├── composables/               useStays(), useConflicts()
│   │   ├── store/                     stays.store.ts
│   │   ├── api/                       stays.api.ts
│   │   └── types/                     stay.types.ts
│   │
│   ├── arrivals/
│   │   ├── views/                     ArrivalsToday.vue
│   │   ├── components/                ArrivalRow.vue, QrCheckin.vue, NoShowAction.vue
│   │   ├── composables/               useArrivals()
│   │   └── types/                     arrival.types.ts
│   │
│   ├── occupancy/
│   │   ├── views/                     InHouseView.vue, InspectionMode.vue
│   │   ├── components/                RoomRoster.vue, OccupancyException.vue, DiscrepancyCapture.vue
│   │   ├── composables/               useOccupancy(), useInspection()
│   │   └── types/                     occupancy.types.ts
│   │
│   ├── audit/
│   │   ├── views/                     AuditLog.vue
│   │   ├── components/                AuditEntry.vue, AuditFilter.vue
│   │   └── types/                     audit.types.ts
│   │
│   ├── exports/
│   │   ├── views/                     ExportCenter.vue
│   │   └── composables/               useExport()
│   │
│   └── admin/
│       ├── views/                     UserManagement.vue, RolePermissions.vue
│       └── types/                     admin.types.ts
│
├── shared/
│   ├── components/                    Button, Input, Modal, Badge, StatusChip, DataTable
│   ├── composables/                   useApi(), useOfflineQueue(), useNotifications()
│   ├── layouts/                       AdminLayout.vue, OpsLayout.vue
│   ├── types/                         api.types.ts, pagination.types.ts
│   └── utils/                         date.ts, qr.ts, i18n-helpers.ts
│
├── assets/
│   ├── styles/
│   │   ├── _variables.scss
│   │   ├── _mixins.scss
│   │   └── global.scss
│   └── translations/
│       ├── pl.ts
│       ├── en.ts
│       ├── de.ts
│       ├── ua.ts
│       └── ru.ts
│
└── types/
    └── global.d.ts
```

### Key Architectural Changes from As-Is

| Concern | As-Is | Should-Be |
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
| Forms | FormKit (some), raw inputs (rest) | FormKit consistently + Zod/Valibot validation schemas |

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
// src/app/router/guards.ts
router.beforeEach((to, from, next) => {
  const auth = useAuthStore()
  const requiredRole = to.meta.role

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return next({ name: 'Login' })
  }
  if (requiredRole && auth.userRole !== requiredRole) {
    return next({ name: 'Forbidden' })
  }
  next()
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
└──────────────┘   │   │ genderRule   │  (MIXED|MALE_ONLY|FEMALE_ONLY|PER_ROOM)
                   │   │ status       │  (ACTIVE|BLOCKED|MAINTENANCE)
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
│ agencyId     │───┘   │ genderRule   │  (MIXED|MALE_ONLY|FEMALE_ONLY|PER_ROOM)
│ assignedPropertyIds[] │ floor        │
│ language     │       │ status       │  (ACTIVE|BLOCKED|MAINTENANCE)
│  (PL|EN|DE|  │       └──────┬───────┘
│   UA|RU)     │              │
│ status       │              │
└──────────────┘              │
                              │
┌──────────────┐       ┌──────┴───────┐
│   Worker     │       │    Stay      │
│──────────────│       │──────────────│
│ internalId   │◄──────│ workerId     │
│ firstName    │       │ propertyId   │
│ lastName     │       │ roomId       │
│ phone?       │       │ dateFrom     │
│ gender       │       │ dateTo       │
│ tags[]       │       │ status       │ ← planned/expected/checked-in/
│ notes?       │       │ overrideReason? │ checked-out/no-show/moved
│ status       │       │ createdBy    │
│ agencyId     │       │ confirmedBy  │
└──────────────┘       └──────────────┘

┌──────────────────────┐
│   AuditEvent         │
│──────────────────────│
│ id                   │
│ actorId              │
│ action               │  ← check-in / check-out / move / assign / etc.
│ entityType           │
│ entityId             │
│ before{}             │
│ after{}              │
│ deviceId             │
│ offlineFlag          │
│ timestamp            │
└──────────────────────┘
```

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
