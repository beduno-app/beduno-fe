# Repository Guidelines

Beduno is an ops system for temporary work agencies — the source of truth for "who sleeps where
tonight" across worker accommodation. The frontend is a Vue 3 SPA (`<script setup>`,
TypeScript strict, Vite, Pinia, vue-router, vue-i18n) serving a desktop web admin at `/` and a
mobile, offline-capable ops PWA at `/ops`.

## Hard rules

- Agency roles create *planned* stays; property roles confirm reality (check-in/out, moves,
  no-shows). Agency roles must never mutate confirmed occupancy.
- Every user-facing string goes through `t()` and must be added to all five files in
  `src/assets/translations/` (pl, en, de, ua, ru).
- Import the shared axios instance `api` from `src/shared/composables/useApi.ts`; never construct
  a new axios instance.
- Declare every IndexedDB object store in `src/shared/services/db.ts` and bump `DB_VERSION`. Room,
  capacity and user edits are online-only — never queue them in `actionQueue.ts`.
- Restrict routes with `meta.roles` in `src/app/router/index.ts`; do not hand-roll role checks in
  components.
- npm only. CI runs `npm ci` against `package-lock.json`; never `yarn` or `pnpm`.
- Adding a role, module, IndexedDB store, route tree, or locale requires updating `@CLAUDE.md` in
  the same commit.
- `@docs/should-be/` is the authoritative spec — read it before changing domain behaviour.
  `docs/as-is/` is a historical record, not a description of current code.

## Project structure

`src/modules/<feature>/` are vertical slices, each with `api/`, `store/`, `composables/`,
`components/`, `views/`, `types/`. Cross-module imports are limited to types and `src/shared/`;
don't reach into another module's store from a view. Routing and plugins live in `src/app/`. Full
map: `@README.md`.

## Commands

- `npm run dev` — dev server on port 8081, proxies `/api` to `localhost:8080`.
- `npm run lint`, `npm run typecheck`, `npm test`, `npm run build` — the four CI gates; keep all
  green.
- `npx vitest run src/path/to/file.spec.ts` — run one unit test file.
- `npm run test:e2e` — Playwright; not wired into CI.

## Deployment

Production is AWS S3 + CloudFront, driven by `scripts/deploy/`. Three rules are load-bearing;
all have automated assertions in `scripts/deploy/verify.sh` and none is obvious from the
code:

- **Never configure CloudFront custom error responses, and never let
  `scripts/deploy/cloudfront-function.js` rewrite `/api/*`.** Either turns an API 401 into an
  HTML 200, and the token-refresh interceptor in `src/shared/composables/useApi.ts` only fires
  on a literal 401 status — so auth refresh dies silently and looks like an app bug.
- **`api/*` routes to the `beduno-be` origin, so the SPA calls its API same-origin.** That is
  the only reason the backend's `CORS_ALLOWED_ORIGINS` can stay empty and no third-party site
  can make credentialed calls to it. A CORS error against this API means the behaviour is
  missing or misrouted — fix the routing, never open the backend allowlist. The behaviour must
  carry no function association, for the same reason as the rule above.
- **`sw.js` uploads last.** It is the workbox precache manifest and pins `index.html` by
  content revision; shipping it before the HTML it pins lets a phone precache the old build
  under the new revision key and serve it forever. Order lives in `NEVER_CACHE_FILES`
  (`scripts/deploy/config.sh`). Unhashed root files are `no-cache`; only hashed files are
  `immutable`.

`deploy.sh` is safe to run unattended. Creating the distribution, publishing the function to
LIVE, and replacing the bucket policy are human-approved and live in `bootstrap.sh`.
`nginx.conf` is local-only and does **not** serve production.

## Coding style

Prettier-enforced: no semicolons, single quotes, trailing commas, 100 columns (`@.prettierrc`).
`@/` aliases `src/`. Prefer the existing `Base*` components in `src/shared/components/` over new
one-off elements. Keep route components lazy-loaded.

## Testing

Unit and component tests are co-located as `*.spec.ts` (Vitest + jsdom + `@vue/test-utils`,
`axios-mock-adapter` for API tests). Playwright specs live in `e2e/` and are excluded from Vitest
in `@vite.config.ts` — keep them out of `npm test`.

## Commits & PRs

Subjects follow `[<model>] <lowercase imperative>`, e.g. `[opus-5] fix roles docs`. No
`Co-Authored-By` trailers. PRs target `main`; CI (lint, typecheck, test, build) must pass.
