# CLAUDE.md

## Hard rules

- **Propose → confirm.** Agency roles create *planned* stays; property roles confirm *reality* (check-in/out, moves, no-shows). Agency roles must never be able to mutate confirmed occupancy.
- **Room capacity, not bed-level.** Workers occupy a spot in a room; there is no bed entity.
- **Everything is audited.** Operational actions produce audit events with actor, before/after, and timestamp.
- **Everything is localized** — PL (default), EN, DE, UA, RU. Prefer predefined localized reason codes over free text in operational flows.
- Every user-facing string goes through `t()` and must be added to **all five** translation files in `src/assets/translations/`.
- **QR codes carry zero PII.** Format is `beduno:{workerId}:{checksum}` (see `src/shared/utils/qrCode.ts`).
- Add role restrictions via route meta — do not hand-roll checks in components.
- `src/shared/services/db.ts` — the single IndexedDB instance (`beduno-offline`); **all** object stores are declared here so version upgrades stay coordinated. Bump `DB_VERSION` when adding a store.
- Room/capacity/user edits are **online-only** by design — do not add them to the offline queue.
- npm is the only package manager — CI runs `npm ci` against `package-lock.json`. Never use `yarn` or `pnpm` here.
- Any change that adds a role, a module, an IndexedDB store, a route tree, or a locale must update the matching section of this file in the same commit — there is no meta-framework carrying conventions; this file does.

## Product context

Beduno is an **ops system for temporary work agencies** — the source of truth for "who sleeps where tonight" across worker accommodation properties. It is *not* a marketplace or booking site.

The authoritative spec is in `docs/`:

- `docs/idea.md` — the product discovery transcript; all locked decisions and their rationale
- `docs/should-be/` — the target spec: overview, architecture, data-model, roles-and-permissions, screens, api-specification, implementation-plan
- `docs/as-is/` — historical record of the pre-rewrite marketplace app; **not** a description of current code

Read `docs/should-be/` before changing domain behaviour.

### Core types

- `UserRole` — `AGENCY_ADMIN | AGENCY_PLANNER | PROPERTY_ADMIN | FRONT_DESK` (`src/modules/auth/types/auth.types.ts`)
- `StayStatus` — `PLANNED | EXPECTED_TODAY | CHECKED_IN | CHECKED_OUT | NO_SHOW | MOVED | CANCELLED` (`src/modules/stays/types/stay.types.ts`)

## Architecture

**Vue 3 SPA** using `<script setup>` with the Composition API and TypeScript (strict). State is **Pinia**, routing is **vue-router**, i18n is **vue-i18n** (`legacy: false`). No component framework — components are hand-written with scoped SCSS.

There is no `@Options` / vue-class-component, no Vuex, no Bootstrap, no FormKit anywhere in this codebase.

### Directory layout

Directory map: `@README.md`.

Each module follows the same internal shape: `api/`, `store/`, `composables/`, `components/`, `views/`, `types/`. Keep cross-module imports to types and shared code; don't reach into another module's store from a view.

### Routing and access control

Two route trees in `src/app/router/index.ts`:

- `/ops/*` → `OpsLayout` — the mobile front-desk app (arrivals, in-house, inspection); restricted to `PROPERTY_ADMIN` and `FRONT_DESK`. `/ops/arrivals` is the PWA `start_url`.
- `/*` → `AdminLayout` — the desktop web admin (workers, properties, stays, users, audit, exports).

Routes carry `meta.requiresAuth` (default true) and `meta.roles`. A single `router.beforeEach` guard redirects to `Login` when unauthenticated and to `Forbidden` on a role mismatch.

All route components are lazy-loaded via dynamic import; keep it that way for code splitting.

### Auth

`auth.store.ts` holds `token`, `refreshToken`, and `user`, persisted via `pinia-plugin-persistedstate`. The axios response interceptor in `useApi.ts` handles 401 by refreshing once, queueing concurrent requests behind a single refresh, and logging out + redirecting to login when refresh fails (covers device revocation). `useIdleTimeout` auto-logs-out idle sessions with a warning toast.

### Offline support

The ops screens are offline-capable:

- `offlineDb.ts` — per-property snapshot of workers/rooms/arrivals for offline lookup.
- `actionQueue.ts` — queues `CHECK_IN | CHECK_OUT | MOVE | NO_SHOW` while offline.
- `modules/ops/store/sync.store.ts` — replays queued actions on reconnect. Conflicts go to the **conflict inbox** ("Needs review"); never silently auto-merge.

PWA config (manifest, workbox runtime caching) is in `vite.config.ts`.

### i18n

`src/app/plugins/i18n.ts` registers all five locales; default `pl`, fallback `en`. Export language is selectable independently of UI language.

## Testing

- Unit and component tests are **co-located** as `*.spec.ts` next to the code (Vitest + jsdom + `@vue/test-utils`). API tests use `axios-mock-adapter`.
- E2E specs live in `e2e/` (Playwright, Chromium + Pixel 5 projects), covering auth, check-in, inspection, and exports.
- `vite.config.ts` excludes `e2e/**` from Vitest — Playwright specs must not be run by `npm test`.

## Conventions

- Prettier config is checked in (`.prettierrc`); no semicolons, single quotes.
- Prefer the existing `Base*` shared components over new one-off elements.
- Comments explain *why*, not *what* — match the density of the surrounding file.

## Commands

Scripts, configuration variables and deployment steps: `@README.md`.

CI (`.github/workflows`) runs: lint → typecheck → unit tests → build. Keep all four green.

## Environment

- `VITE_API_BASE_URL` — API base URL. Defaults to `/api/v1`; the Vite dev server proxies that to a configurable target (`localhost:8080` by default — see `VITE_DEV_PROXY_TARGET`), the legacy nginx container proxies it to `${BACKEND_URL}`, and in production CloudFront's `api/*` behaviour routes it to `beduno-be`. Leave it unset so every environment stays same-origin. Read with `??`, so setting it to an **empty string does not fall back** — leave it unset.
- `VITE_DEV_PROXY_TARGET` — overrides the Vite dev server's `/api` proxy target (default `http://localhost:8080`). Read directly from `process.env` in `vite.config.ts` (Node context, no `VITE_` client-exposure needed) — used only by the dev server's proxy, never by the built app, which always calls same-origin `/api/v1`. Lets CI point the dev server at the live `beduno-be` origin for E2E runs.
- The shared axios instance lives in `src/shared/composables/useApi.ts` (exported as `api`) — import it rather than creating new axios instances.
- `@/` is aliased to `src/`.

## Deployment

Production is AWS S3 + CloudFront (`eu-central-1`), driven by `scripts/deploy/` via the AWS CLI. `Dockerfile`/`nginx.conf` are the retained local full-stack path, **not** production. See `@README.md` and `context/deployment/deploy-plan.md`.

- **Never configure CloudFront custom error responses, and never let `scripts/deploy/cloudfront-function.js` rewrite `/api/*`.** Either turns an API 401 into an HTML 200; the refresh interceptor in `useApi.ts` only fires on a literal 401 status. `scripts/deploy/verify.sh` asserts both — keep those checks passing.
- Unhashed root files (`index.html`, `sw.js`, `registerSW.js`, `manifest.webmanifest`) upload with `no-cache`; only content-hashed files get `immutable`. A new unhashed root file means updating `NEVER_CACHE_FILES` in `scripts/deploy/config.sh` — and **`sw.js` must stay last in that list**, because it is the precache manifest and pins `index.html` by revision.
- Creating the distribution, publishing the CloudFront function to LIVE, replacing the bucket policy, and adding the `api/*` cache behaviour are human-approved and live in `bootstrap.sh` (each prompts, or takes `--yes`, and is skipped when it would change nothing); `deploy.sh` must never touch routing.
- **`api/*` routes to `beduno-be` so the SPA calls its API same-origin — which is the only reason the backend's `CORS_ALLOWED_ORIGINS` can stay empty.** A CORS error against this API means the behaviour is missing or misrouted; fix the routing, never the backend allowlist. That behaviour must also never gain a function association: the router rewrites extension-less paths to `/index.html`, which is exactly how an API 401 becomes an HTML 200.
