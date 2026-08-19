# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev            # Vite dev server on port 8081 (proxies /api → localhost:8080)
npm run build          # Typecheck (vue-tsc) + production build
npm run build:analyze  # Build with rollup-plugin-visualizer (opens dist/stats.html)
npm run preview        # Serve the production build locally
npm run lint           # ESLint over src/ with --fix
npm run typecheck      # vue-tsc --noEmit
npm test               # Unit + component tests (Vitest, jsdom)
npm run test:watch     # Vitest in watch mode
npm run test:e2e       # Playwright E2E (auto-starts the dev server)
npm run docker:build   # Build the nginx production image
```

Run a single unit test file:

```bash
npx vitest run src/modules/stays/composables/useConflicts.spec.ts
```

CI (`.github/workflows`) runs: lint → typecheck → unit tests → build. Keep all four green.

## Environment

- `VITE_API_BASE_URL` — API base URL. Defaults to `/api/v1`, which the Vite dev server proxies to `http://localhost:8080` and nginx proxies to `${BACKEND_URL}` in production.
- The shared axios instance lives in `src/shared/composables/useApi.ts` (exported as `api`) — import it rather than creating new axios instances.
- `@/` is aliased to `src/`.
- npm is the only package manager — CI runs `npm ci` against `package-lock.json`. Never use `yarn` or `pnpm` here.

## Product context

Beduno is an **ops system for temporary work agencies** — the source of truth for "who sleeps where tonight" across worker accommodation properties. It is *not* a marketplace or booking site.

The authoritative spec is in `docs/`:

- `docs/idea.md` — the product discovery transcript; all locked decisions and their rationale
- `docs/should-be/` — the target spec: overview, architecture, data-model, roles-and-permissions, screens, api-specification, implementation-plan
- `docs/as-is/` — historical record of the pre-rewrite marketplace app; **not** a description of current code

Read `docs/should-be/` before changing domain behaviour.

### Domain rules that constrain the code

- **Propose → confirm.** Agency roles create *planned* stays; property roles confirm *reality* (check-in/out, moves, no-shows). Agency roles must never be able to mutate confirmed occupancy.
- **Room capacity, not bed-level.** Workers occupy a spot in a room; there is no bed entity.
- **Everything is audited.** Operational actions produce audit events with actor, before/after, and timestamp.
- **Everything is localized** — PL (default), EN, DE, UA, RU. Prefer predefined localized reason codes over free text in operational flows.
- **QR codes carry zero PII.** Format is `beduno:{workerId}:{checksum}` (see `src/shared/utils/qrCode.ts`).

### Core types

- `UserRole` — `AGENCY_ADMIN | AGENCY_PLANNER | PROPERTY_ADMIN | FRONT_DESK` (`src/modules/auth/types/auth.types.ts`)
- `StayStatus` — `PLANNED | EXPECTED_TODAY | CHECKED_IN | CHECKED_OUT | NO_SHOW | MOVED | CANCELLED` (`src/modules/stays/types/stay.types.ts`)

## Architecture

**Vue 3 SPA** using `<script setup>` with the Composition API and TypeScript (strict). State is **Pinia**, routing is **vue-router**, i18n is **vue-i18n** (`legacy: false`). No component framework — components are hand-written with scoped SCSS.

There is no `@Options` / vue-class-component, no Vuex, no Bootstrap, no FormKit anywhere in this codebase.

### Directory layout

```
src/
├── app/
│   ├── plugins/       i18n.ts, pinia.ts (persisted state)
│   └── router/        route definitions + auth/role guard
├── modules/           feature modules — vertical slices
│   ├── admin/         user management, role matrix
│   ├── arrivals/      "Arrivals Today" — check-in, no-show, QR scan
│   ├── audit/         audit log viewer
│   ├── auth/          login, dashboard, auth store
│   ├── exports/       export center (CSV/PDF)
│   ├── inhouse/       "In-House" nightly occupancy list
│   ├── inspection/    room-by-room inspection walkthrough
│   ├── ops/           offline plumbing: sync store, conflict inbox, offline banner
│   ├── properties/    properties + rooms + capacity rules
│   ├── stays/         stay planner, create/bulk assign, conflict engine
│   └── workers/       worker directory, CSV import, QR badges
├── shared/
│   ├── components/    BaseButton, BaseInput, BaseModal, BaseBadge, StatusChip,
│   │                  DataTable, SkeletonLoader, ToastNotifications
│   ├── composables/   useApi (axios instance + interceptors), useToast,
│   │                  useIdleTimeout, usePullToRefresh, useSwipe
│   ├── layouts/       AdminLayout.vue (sidebar), OpsLayout.vue (mobile, bottom nav)
│   ├── services/      db.ts (IndexedDB), offlineDb.ts (snapshot), actionQueue.ts
│   ├── types/         api.types.ts
│   └── utils/         formatDate.ts, qrCode.ts
├── assets/translations/  pl.ts, en.ts, de.ts, ua.ts, ru.ts
├── App.vue            RouterView + toasts + idle-timeout wiring
└── main.ts            createApp → pinia, router, i18n
```

Each module follows the same internal shape: `api/`, `store/`, `composables/`, `components/`, `views/`, `types/`. Keep cross-module imports to types and shared code; don't reach into another module's store from a view.

### Routing and access control

Two route trees in `src/app/router/index.ts`:

- `/ops/*` → `OpsLayout` — the mobile front-desk app (arrivals, in-house, inspection); restricted to `PROPERTY_ADMIN` and `FRONT_DESK`. `/ops/arrivals` is the PWA `start_url`.
- `/*` → `AdminLayout` — the desktop web admin (workers, properties, stays, users, audit, exports).

Routes carry `meta.requiresAuth` (default true) and `meta.roles`. A single `router.beforeEach` guard redirects to `Login` when unauthenticated and to `Forbidden` on a role mismatch. Add role restrictions via route meta — do not hand-roll checks in components.

All route components are lazy-loaded via dynamic import; keep it that way for code splitting.

### Auth

`auth.store.ts` holds `token`, `refreshToken`, and `user`, persisted via `pinia-plugin-persistedstate`. The axios response interceptor in `useApi.ts` handles 401 by refreshing once, queueing concurrent requests behind a single refresh, and logging out + redirecting to login when refresh fails (covers device revocation). `useIdleTimeout` auto-logs-out idle sessions with a warning toast.

### Offline support

The ops screens are offline-capable:

- `src/shared/services/db.ts` — the single IndexedDB instance (`beduno-offline`); **all** object stores are declared here so version upgrades stay coordinated. Bump `DB_VERSION` when adding a store.
- `offlineDb.ts` — per-property snapshot of workers/rooms/arrivals for offline lookup.
- `actionQueue.ts` — queues `CHECK_IN | CHECK_OUT | MOVE | NO_SHOW` while offline.
- `modules/ops/store/sync.store.ts` — replays queued actions on reconnect. Conflicts go to the **conflict inbox** ("Needs review"); never silently auto-merge.
- Room/capacity/user edits are **online-only** by design — do not add them to the offline queue.

PWA config (manifest, workbox runtime caching) is in `vite.config.ts`.

### i18n

`src/app/plugins/i18n.ts` registers all five locales; default `pl`, fallback `en`. Every user-facing string goes through `t()` and must be added to **all five** translation files in `src/assets/translations/`. Export language is selectable independently of UI language.

## Testing

- Unit and component tests are **co-located** as `*.spec.ts` next to the code (Vitest + jsdom + `@vue/test-utils`). API tests use `axios-mock-adapter`.
- E2E specs live in `e2e/` (Playwright, Chromium + Pixel 5 projects), covering auth, check-in, inspection, and exports.
- `vite.config.ts` excludes `e2e/**` from Vitest — Playwright specs must not be run by `npm test`.

## Deployment

`Dockerfile` copies the prebuilt `dist/` into `nginx:1.27-alpine` and templates `nginx.conf`, which does SPA fallback (`try_files`) and proxies `/api/` to `${BACKEND_URL}`. Build before building the image.

## Conventions

- Prettier config is checked in (`.prettierrc`); no semicolons, single quotes.
- Prefer the existing `Base*` shared components over new one-off elements.
- Comments explain *why*, not *what* — match the density of the surrounding file.
- Any change that adds a role, a module, an IndexedDB store, a route tree, or a locale must update the matching section of this file in the same commit — there is no meta-framework carrying conventions; this file does.
