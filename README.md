# beduno-fe

Frontend for **Beduno** — an operational system for temporary work agencies to manage worker
accommodation: who is expected today, who is currently in-house, and who was verified during an
inspection. It replaces spreadsheets and WhatsApp as the single source of truth for
*"who sleeps where tonight"*.

Two surfaces, one app:

- **Web Admin** (`/`) — workers, properties and rooms, planned stays, users, audit log, exports.
  Used by agency admins/planners and property admins.
- **Mobile Ops** (`/ops`) — arrivals, in-house occupancy, inspection mode. Mobile-first,
  installable as a PWA, and offline-capable for properties with poor reception.

Stack: Vue 3 (`<script setup>`, Composition API) · TypeScript (strict) · Vite · Pinia ·
vue-router · vue-i18n (PL/EN/DE/UA/RU) · Vitest · Playwright.

## Requirements

- Node.js 20+
- A running backend on `http://localhost:8080` (or set `VITE_API_BASE_URL`)

## Setup

```bash
npm install
npm run dev
```

The dev server runs on **http://localhost:8081** and proxies `/api` to `http://localhost:8080`.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Dev server with HMR (port 8081) |
| `npm run build` | Typecheck + production build to `dist/` |
| `npm run build:analyze` | Build with bundle visualizer (`dist/stats.html`) |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | ESLint over `src/` with `--fix` |
| `npm run typecheck` | `vue-tsc --noEmit` |
| `npm test` | Unit + component tests (Vitest) |
| `npm run test:watch` | Vitest in watch mode |
| `npm run test:e2e` | Playwright E2E tests (starts the dev server automatically) |
| `npm run docker:build` | Build the production nginx image |

Run a single unit test file:

```bash
npx vitest run src/modules/stays/composables/useConflicts.spec.ts
```

## Configuration

| Variable | Default | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `/api/v1` | API base URL used by the shared axios instance |
| `BACKEND_URL` | — | Backend upstream for the nginx container (production only) |

## Project structure

```
src/
├── app/          Router (with auth + role guards) and plugins (i18n, Pinia)
├── modules/      Feature modules — admin, arrivals, audit, auth, exports,
│                 inhouse, inspection, ops, properties, stays, workers
├── shared/       Base components, composables, layouts, offline services, utils
└── assets/       Translations (pl, en, de, ua, ru)
```

Each module is a vertical slice with its own `api/`, `store/`, `composables/`,
`components/`, `views/`, and `types/`.

## Testing

Unit and component tests are co-located with the code as `*.spec.ts` and run with Vitest in a
jsdom environment. End-to-end specs live in `e2e/` and run with Playwright against Chromium and
a Pixel 5 profile.

## Deployment

Production is **AWS S3 + CloudFront** in `eu-central-1`. Scripts live in `scripts/deploy/`
and every step goes through the AWS CLI — see `context/deployment/deploy-plan.md` for the
platform rationale and `context/foundation/infrastructure.md` for the research behind it.

```bash
./scripts/deploy/bootstrap.sh   # one-time: bucket, OAC, CloudFront function, distribution
./scripts/deploy/deploy.sh      # repeatable: build, upload, invalidate, verify
./scripts/deploy/verify.sh      # read-only assertions against the live distribution
```

> **The deployed SPA cannot log in yet.** Only the frontend is on AWS; `beduno-be` is not
> deployed, so there is no `/api/*` origin and the axios default (`/api/v1`, same-origin)
> returns 403. This is a deliberate checkpoint, not a bug.

Two rules that are load-bearing and easy to break:

- **Never add CloudFront custom error responses**, and never let the CloudFront function
  rewrite `/api/*`. Either turns an API 401 into an HTML 200, and the token-refresh
  interceptor in `src/shared/composables/useApi.ts` only fires on a literal 401 status.
  `scripts/deploy/verify.sh` asserts both.
- **`index.html`, `sw.js`, `registerSW.js` and `manifest.webmanifest` must be uploaded
  `no-cache`**; only content-hashed files get `immutable`. Getting this wrong pins
  front-desk phones to a stale build.

### Legacy: Docker + nginx

The `Dockerfile` / `nginx.conf` path is retained because it is still the only way to run
the SPA and the API behind one origin locally. It is **not** what production serves.

```bash
npm run build && npm run docker:build
```

## Documentation

- `docs/idea.md` — product discovery and the locked product decisions
- `docs/should-be/` — target spec: overview, architecture, data model, roles and permissions,
  screens, API specification, implementation plan
- `docs/as-is/` — historical record of the pre-rewrite codebase
- `CLAUDE.md` — working notes and conventions for AI coding agents
