# Authenticated E2E Harness Against the Live API — Implementation Plan

## Overview

Beduno's SPA has been live on CloudFront since 2026-09-09 and reachable
against the real `beduno-be` API since 2026-09-10, but the E2E suite still
only asserts route guards — no authenticated journey has ever run, and
`checkin.spec.ts` still carries a comment saying the real journey needs a
backend that now exists. This plan builds the harness that makes proving an
authenticated flow possible: a configurable proxy target so CI can reach the
live API, a sign-in fixture that produces a reusable authenticated session,
one read-only smoke journey that proves the whole chain end-to-end, and the
CI wiring to run it on every push/PR. It does not build the three real
must-not-fail journeys (Arrival Day, Nightly List, Inspection Day) — those are
S-01, S-02 and S-03, and they reuse what this plan produces.

## Current State Analysis

- `playwright.config.ts:24-29` — `webServer` runs `npm run dev` locally
  (`localhost:8081`) with no local backend started. `vite.config.ts:70-77`
  proxies `/api` to a hardcoded `http://localhost:8080` — there is no live
  target today, so nothing but route-guard checks can pass in CI.
- `e2e/auth.spec.ts` (3 tests) and `e2e/checkin.spec.ts` (5 tests) are
  guard-only. `e2e/checkin.spec.ts:34-35` reads: `// The authenticated
  check-in journey needs a backend; until then this only asserts the guard.
  See docs/should-be/implementation-plan.md phase 8.1.`
- `.github/workflows/ci.yml` is a single `ci` job running four sequential
  steps (Lint, Typecheck, Unit tests, Build) with **no secrets and no `env:`
  block anywhere** — there is no existing pattern to extend, just a clean
  slate.
- `package.json:14` already declares `"test:e2e": "playwright test"`, unused
  by CI. `@playwright/test` is pinned `^1.50.0`.
- Login (`src/modules/auth/views/Login.vue`) posts through
  `auth.store.ts:16-21` → `auth.api.ts` → `POST /auth/login`, and the
  response (`accessToken`, `refreshToken`, `user`) is written into the Pinia
  `auth` store, which `pinia.ts:4-5` persists to `localStorage` (default key:
  the store id, `auth`) via `pinia-plugin-persistedstate`. There is no way to
  produce a valid authenticated session other than driving this real UI flow
  — there is no token-injection helper or test-only login endpoint.
- No test account, seed data, or staging backend exists anywhere in the repo,
  `docs/`, or `context/`. `beduno.duckdns.org` (`context/deployment/deploy-plan.md`)
  is the only live `beduno-be` origin, and it is production.
- `.gitignore` ignores `/test-results/` and `/playwright-report/` but has no
  entry for a saved Playwright auth state file.

## Desired End State

A new CI job step runs `npm run test:e2e` against a locally-served frontend
whose API proxy points at the live `beduno-be`, using a real test account's
credentials from repo secrets. A `setup` project signs in once, reuses the
resulting session across the run via `storageState`, and the smoke spec
asserts that an authenticated ops screen reaches a live, non-error state.
The job runs on
every push and PR, after Lint/Typecheck/Unit tests/Build already pass.

Verify by: pushing a branch and confirming the GitHub Actions run shows a
green E2E step (once the test account exists — see Prerequisite below), and
running `npm run test:e2e` locally with the same env vars set.

### Key Discoveries

- The sign-in fixture must drive the real `Login.vue` form in a browser
  context, not call `POST /auth/login` directly and hand-craft
  `localStorage` — `pinia-plugin-persistedstate`'s serialization format is an
  implementation detail of the plugin, and reproducing it by hand would
  silently drift the day the plugin's storage shape changes.
- `vite.config.ts`'s dev proxy target is hardcoded — this is the one file
  change that turns "CI can only check route guards" into "CI can reach the
  live API." A server-side proxy is required rather than pointing
  `VITE_API_BASE_URL` at the live URL directly: `beduno-be`'s
  `CORS_ALLOWED_ORIGINS` is empty by design (`CLAUDE.md:106`, same-origin
  only), so a direct browser call from the CI-hosted dev server would be
  CORS-blocked — only a Node-side proxy sidesteps that.
- `router/index.ts:59-61` — `Dashboard` (`/`) carries no `roles` restriction,
  so any authenticated role lands there after login; the smoke spec must
  navigate to `/ops/arrivals` itself rather than assume login redirects
  there.

## What We're NOT Doing

- Not writing the Arrival Day, Nightly List, or Inspection Day journeys —
  those are S-01, S-02, S-03.
- Not adding a health-check/pre-flight step for the live API, extra retry
  logic beyond Playwright's existing `retries: 2` in CI, or a protected
  GitHub Environment with manual approval — all declined in favor of the
  simplest option during planning.
- Not creating or seeding the test account on `beduno-be` itself — that
  repo is out of scope for this change (see Prerequisite below).
- Not touching `e2e/exports.spec.ts` or `e2e/inspection.spec.ts`.
- Not adding `.env.example` (parked separately per `roadmap.md`).
- Not restricting the new spec to a single Playwright project — it runs
  under both existing projects (`chromium`, `Mobile Chrome`) like every
  other spec in `e2e/`, since both are Chromium-based and need only the one
  installed browser.

## Implementation Approach

Four phases, each independently mergeable: (1) make the proxy target
configurable, (2) build the sign-in fixture, (3) write the smoke spec and
retire the stale comment it replaces, (4) wire CI. Phases 1-3 are fully
verifiable locally without touching production — the developer can point
`VITE_DEV_PROXY_TARGET` at `https://beduno.duckdns.org` by hand and run
`npm run test:e2e` before any CI change lands. Phase 4 is the only phase that
requires the test account and CI secrets to exist.

## Critical Implementation Details

**Blocking prerequisite, external to this repo.** This plan assumes a
pilot-safe `FRONT_DESK` test account exists (or will exist before Phase 4
merges) on `beduno-be`, scoped to exactly one property that `GET
/properties` returns for that account — the smoke spec (Phase 3) must select
this property from the dropdown before the arrivals screen fetches anything
at all, per `arrivals.store.ts:25`'s empty default. Worker/stay data under
that property is not required to be in any particular state — the smoke
assertion checks for the absence of an error response, not for a specific
worker — so no ongoing re-seeding is needed as dates roll forward. Phases 1-3
do not require the account to exist yet (they're verified against whatever
`VITE_DEV_PROXY_TARGET` the implementer points at, including a local
backend). Phase 4 does: the CI job will run red until `E2E_TEST_EMAIL` /
`E2E_TEST_PASSWORD` are set to real, working credentials. This is a
deliberate, named gap — not an oversight — per the "team provisions a test
account" decision made during planning.

**Job ordering.** `ci.yml` is a single job with sequential steps today —
there is no second job and no `needs:`. Adding the new steps after the
existing `Build` step (rather than splitting into a separate `e2e` job)
satisfies "runs only after build succeeds" for free, since a failed step
already stops the job.

## Phase 1: Configurable dev-proxy target

### Overview

Let `vite.config.ts`'s `/api` proxy target be overridden by an environment
variable, defaulting to today's `http://localhost:8080` so local dev is
unaffected.

### Changes Required

#### 1. Vite dev-server proxy

**File**: `vite.config.ts`

**Intent**: The `server.proxy['/api'].target` must read from an env var
before falling back to the current hardcoded value, so CI can point the dev
server's proxy at the live `beduno-be` origin without touching local dev
defaults.

**Contract**: `vite.config.ts` runs in Node, so `process.env` is available
directly with no `VITE_`-prefix requirement or dotenv loading needed.
New variable name: `VITE_DEV_PROXY_TARGET` (kept `VITE_`-prefixed for
naming consistency with the project's one existing env var,
`VITE_API_BASE_URL`, even though Vite's client-exposure prefix rule doesn't
apply to `vite.config.ts` itself). Resolution: `target:
process.env.VITE_DEV_PROXY_TARGET ?? 'http://localhost:8080'`.

#### 2. Document the new variable, and correct the docs that assumed a fixed one

**Files**: `CLAUDE.md`, `README.md`

**Intent**: The `## Environment` section of `CLAUDE.md` documents
`VITE_API_BASE_URL` today; add `VITE_DEV_PROXY_TARGET` there so a future
reader (human or agent) understands why the dev-server proxy can point
somewhere other than `localhost:8080`, per the project's own rule that
structural/environment changes update `CLAUDE.md` in the same commit. That
same `CLAUDE.md` bullet and `README.md` (`README.md:21,30`) currently state
the proxy target as a hardcoded fact — both need correcting in the same
commit so they don't go stale the moment this phase merges.

**Contract**: One new bullet under `CLAUDE.md`'s `## Environment` naming
`VITE_DEV_PROXY_TARGET`, its default, and that it's consumed only by
`vite.config.ts`'s dev proxy (not by the built app, which always calls
same-origin `/api/v1`). Reword the existing `VITE_API_BASE_URL` bullet's
"the Vite dev server proxies that to `http://localhost:8080`" clause to
note this is the configurable default, not a fixed fact. Reword
`README.md:21,30` the same way (env var to override, not just the default
value).

### Success Criteria

#### Automated Verification

- Typecheck passes: `npm run typecheck`
- Build passes: `npm run build`
- Lint passes: `npm run lint`

#### Manual Verification

- `npm run dev` with no env var set still proxies to `localhost:8080`
  (unchanged local-dev behavior).
- `VITE_DEV_PROXY_TARGET=https://beduno.duckdns.org npm run dev`, then a
  manual login in the browser reaches the live API (confirmed via Network
  tab showing a request against the live origin).
- `CLAUDE.md`'s `VITE_API_BASE_URL` bullet and `README.md:21,30` read
  consistently with the new configurable proxy target — neither still
  states `localhost:8080` as a fixed fact.

---

## Phase 2: Sign-in fixture (setup project + storageState)

### Overview

A Playwright **setup project** — the pattern Playwright has documented as
the recommended way to handle this since 1.31, ahead of the older
`globalSetup` hook — drives the real login form once per test run and saves
the resulting browser storage state, so every spec in the harness (this one,
and S-01/S-02/S-03's future specs) can start already authenticated without
repeating a live login. Chosen over `globalSetup` specifically because a
setup-project failure appears as a named, reported test (e.g.
"authenticate") in the same run and HTML report as everything else, rather
than an opaque top-level error before any test starts — which matters here
because this phase's own success criteria require unset credentials to fail
with a clear, visible message.

### Changes Required

#### 1. Sign-in setup project

**File**: `e2e/auth.setup.ts` (new)

**Intent**: A Playwright test file (using its `setup` alias) that navigates
to `/login`, fills and submits the real form (`Login.vue`'s `#email` /
`#password` fields and its submit button), waits for navigation away from
`/login` (confirms the app itself, not just the request, considers the
session valid), and saves `storageState` to a fixed path for reuse.

**Contract**: Reads credentials from `process.env.E2E_TEST_EMAIL` /
`process.env.E2E_TEST_PASSWORD` (no defaults — fail loudly if unset, so a
misconfigured CI run doesn't silently probe route guards only). Writes
storage state to `e2e/.auth/user.json`.

#### 2. Wire into Playwright config

**File**: `playwright.config.ts`

**Intent**: Register the setup file as its own project, and make the other
projects depend on it and consume its saved storage state, so specs don't
each need to reference the path or repeat a login.

**Contract**: Add a `setup` project matched via `testMatch:
/.*\.setup\.ts/`; the existing `chromium` and `Mobile Chrome` projects each
add `dependencies: ['setup']` and inherit `use.storageState:
'e2e/.auth/user.json'` (set once at the top-level `use` block, alongside the
existing `use.baseURL` / `use.trace` entries at `playwright.config.ts:10-13`,
so both projects pick it up without repeating it).

#### 3. Ignore the saved session

**File**: `.gitignore`

**Intent**: A saved `storageState` file contains a real (if test-scoped)
session token — it must never be committed, mirroring the existing
`/test-results/` / `/playwright-report/` entries.

**Contract**: Add `/e2e/.auth/` under the "Test results" section.

### Success Criteria

#### Automated Verification

- Typecheck passes: `npm run typecheck`
- Lint passes: `npm run lint`
- `e2e/.auth/user.json` is git-ignored: `git check-ignore e2e/.auth/user.json`
  exits 0

#### Manual Verification

- With `E2E_TEST_EMAIL` / `E2E_TEST_PASSWORD` set to a real account and
  `VITE_DEV_PROXY_TARGET` pointed at a reachable backend, `npm run test:e2e`
  runs the `setup` project without error and produces `e2e/.auth/user.json`.
- With credentials unset, the `setup` project fails as a named, reported
  test with a clear message (not a generic Playwright timeout), and
  dependent projects don't run.

---

## Phase 3: Smoke spec

### Overview

One read-only spec that proves the full chain — real login, real token,
protected route, real GET against the live API — end to end. Also retires
the stale comment this spec makes true.

### Changes Required

#### 1. Smoke spec

**File**: `e2e/smoke.spec.ts` (new)

**Intent**: Using the authenticated storage state from Phase 2, navigate
directly to `/ops/arrivals`, assert the app renders the authenticated screen
rather than redirecting to `/login` (proves the guard now passes with a real
session), then select the test property from the property dropdown — the
screen fetches nothing until a property is chosen, per
`arrivals.store.ts:25`'s empty default and `ArrivalsToday.vue:148-150`'s
mount guard — and assert the resulting state proves the live GET succeeded:
the loading skeleton resolves and the error state (bound to `store.error`)
is absent. Do not assert on specific worker/roster content — the component
cleanly separates "API failed" from "API succeeded with zero rows"
(`ArrivalsToday.vue:275` vs. `:307-308`), so asserting non-error is a true
live-GET proof that stays valid even if the fixture worker's stay status
later ages out of `EXPECTED_TODAY`.

**Contract**: No mutation, no cleanup required — this is a pure read. Follow
the existing `getByRole`/`getByLabel`/`getByText` locator convention already
used in `auth.spec.ts` and `checkin.spec.ts`; do not introduce CSS selectors
(select the property via its accessible role/label, not `.filter-select`).

#### 2. Retire the stale comment

**File**: `e2e/checkin.spec.ts`

**Intent**: The comment at `e2e/checkin.spec.ts:34-35` says the authenticated
journey "needs a backend" that, as of this change, it can now reach. Point
future readers at the new spec instead of leaving a misleading claim in
place.

**Contract**: Replace the two-line comment with one pointing at
`e2e/smoke.spec.ts` for the authenticated proof, and noting that
`checkin.spec.ts` itself still only asserts guards until S-01 rewrites it
into the real check-in journey. Leave the doc-comment at
`checkin.spec.ts:3-7` and every test body unchanged.

### Success Criteria

#### Automated Verification

- Typecheck passes: `npm run typecheck`
- Lint passes: `npm run lint`
- `npm run test:e2e` (run locally against a reachable backend, per Phase 2's
  manual verification) — `smoke.spec.ts` passes on both the `chromium` and
  `Mobile Chrome` projects

#### Manual Verification

- Read `e2e/checkin.spec.ts:34-35` after the edit — the comment no longer
  claims the authenticated journey is unreachable.
- Run `npm run test:e2e -- --headed smoke.spec.ts` locally and visually
  confirm the property gets selected and the screen settles into a
  non-error state (real rows or the "no arrivals" empty message both
  count — only the error state is a failure).

---

## Phase 4: CI wiring

### Overview

Run the harness on every push and PR, after the existing four gates pass,
using real test credentials from repo secrets and the live API as the
target.

### Changes Required

#### 1. Repo secrets and variables

**File**: GitHub repo settings (not a file in this repo)

**Intent**: Provision `E2E_TEST_EMAIL`, `E2E_TEST_PASSWORD` as repository
secrets, and `VITE_DEV_PROXY_TARGET` as a repository variable (not a secret
— it's a public API origin) set to `https://beduno.duckdns.org`. Depends on
the Prerequisite in Critical Implementation Details — the account must exist
on `beduno-be` first.

**Contract**: Names must match exactly what Phase 1 and Phase 2 read
(`VITE_DEV_PROXY_TARGET`, `E2E_TEST_EMAIL`, `E2E_TEST_PASSWORD`).

#### 2. CI steps

**File**: `.github/workflows/ci.yml`

**Intent**: After the existing `Build` step, install Playwright's browser
binaries and run the E2E suite, with the three values from #1 available as
step/job env.

**Contract**: Two new steps appended to the existing single `ci` job (see
Critical Implementation Details — Job ordering): `npx playwright install
--with-deps chromium` (one browser binary covers both the `chromium` and
`Mobile Chrome` projects), then `npm run test:e2e`, both under `env:
E2E_TEST_EMAIL: ${{ secrets.E2E_TEST_EMAIL }}`, `E2E_TEST_PASSWORD: ${{
secrets.E2E_TEST_PASSWORD }}`, `VITE_DEV_PROXY_TARGET: ${{
vars.VITE_DEV_PROXY_TARGET }}`. No changes to triggers (`on:` block) —
existing push/PR triggers already match the "same as the other four stages"
decision.

#### 3. Correct the now-stale AGENTS.md claim

**File**: `AGENTS.md`

**Intent**: `AGENTS.md`'s Commands section states `npm run test:e2e —
Playwright; not wired into CI`, which becomes false the moment this phase
merges. Fixed here rather than in Phase 1, since it's only true once CI
wiring lands.

**Contract**: Drop the `; not wired into CI` clause from that line.

### Success Criteria

#### Automated Verification

- `.github/workflows/ci.yml` parses as valid YAML (CI itself starting is the
  check — no local YAML linter is configured in this repo)
- A pushed branch's GitHub Actions run shows Lint, Typecheck, Unit tests, and
  Build passing before the new E2E step starts

#### Manual Verification

- Once the test account exists (Prerequisite) and secrets/vars are set in
  GitHub repo settings: a pushed branch's Actions run shows the E2E step
  green.
- Deliberately push a branch with an unrelated lint failure and confirm the
  E2E step does not run (job stops at the Lint step, per the sequential
  single-job structure).
- Confirm no secret values appear in the Actions log output (Playwright's
  HTML reporter and GitHub's own secret masking should keep them out; spot
  check the raw log).
- `AGENTS.md`'s `test:e2e` line no longer claims it isn't wired into CI.

---

## Testing Strategy

### Unit Tests

Not applicable — this change adds no application logic, only test
infrastructure and a config-read change in `vite.config.ts`. The dev-proxy
default is covered by Phase 1's manual verification (behavior only differs
under an env var that unit tests don't set).

### Integration Tests

Not applicable in the Vitest sense — `smoke.spec.ts` (Phase 3) is itself the
integration-level check, running against a real backend rather than a mock.

### Manual Testing Steps

1. Set `VITE_DEV_PROXY_TARGET=https://beduno.duckdns.org`,
   `E2E_TEST_EMAIL`/`E2E_TEST_PASSWORD` to real test-account credentials, and
   run `npm run test:e2e` locally.
2. Confirm `e2e/.auth/user.json` is created and not tracked by git.
3. Confirm `smoke.spec.ts` passes and, run headed, visibly shows the
   arrivals screen with real data.
4. Push a branch; confirm the GitHub Actions run reaches and passes the new
   E2E step only after Lint/Typecheck/Unit tests/Build are green.

## Performance Considerations

None beyond the obvious: the E2E step adds real network latency to every
CI run (live API round-trips instead of a mock). No caching or parallelism
changes are in scope for this foundation.

## Migration Notes

Not applicable — no data model or schema changes.

## References

- Roadmap item: `context/foundation/roadmap.md` — Foundation F-03
  (`live-api-e2e-harness`)
- Deploy context: `context/deployment/deploy-plan.md` (live API origin,
  documented transient-failure history)
- Existing guard-only specs: `e2e/auth.spec.ts`, `e2e/checkin.spec.ts:34-35`
- Unchecked implementation-plan box: `docs/should-be/implementation-plan.md`
  (E2E section, ~line 254)

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a
> step lands. Do not rename step titles.

### Phase 1: Configurable dev-proxy target

#### Automated

- [x] 1.1 Typecheck passes: `npm run typecheck` — 99d7ee7
- [x] 1.2 Build passes: `npm run build` — 99d7ee7
- [x] 1.3 Lint passes: `npm run lint` — 99d7ee7

#### Manual

- [x] 1.4 `npm run dev` with no env var set still proxies to `localhost:8080` — 99d7ee7
- [x] 1.5 `VITE_DEV_PROXY_TARGET=https://beduno.duckdns.org npm run dev` reaches the live API — 99d7ee7
- [x] 1.6 `CLAUDE.md` and `README.md` no longer state the proxy target as a fixed fact — 99d7ee7

### Phase 2: Sign-in fixture (setup project + storageState)

#### Automated

- [x] 2.1 Typecheck passes: `npm run typecheck` — 3d794b4
- [x] 2.2 Lint passes: `npm run lint` — 3d794b4
- [x] 2.3 `e2e/.auth/user.json` is git-ignored: `git check-ignore e2e/.auth/user.json` exits 0 — 3d794b4

#### Manual

- [x] 2.4 `npm run test:e2e` with real credentials produces `e2e/.auth/user.json` — 3d794b4
- [x] 2.5 `npm run test:e2e` with unset credentials fails as a named `setup` test with a clear message — 3d794b4

### Phase 3: Smoke spec

#### Automated

- [x] 3.1 Typecheck passes: `npm run typecheck` — a7582be
- [x] 3.2 Lint passes: `npm run lint` — a7582be
- [x] 3.3 `npm run test:e2e` — `smoke.spec.ts` passes on `chromium` and `Mobile Chrome` — a7582be

#### Manual

- [x] 3.4 `e2e/checkin.spec.ts:34-35` comment no longer claims the journey is unreachable — a7582be
- [x] 3.5 Headed run of `smoke.spec.ts` shows property selected and a non-error state — a7582be

### Phase 4: CI wiring

#### Automated

- [x] 4.1 `.github/workflows/ci.yml` parses as valid YAML (CI run starts)
- [ ] 4.2 Pushed branch's Actions run shows Lint/Typecheck/Unit tests/Build passing before the new E2E step starts

#### Manual

- [ ] 4.3 Pushed branch's Actions run shows the E2E step green (once test account + secrets/vars exist)
- [ ] 4.4 A branch with a deliberate lint failure does not reach the E2E step
- [ ] 4.5 No secret values appear in the Actions log output
- [x] 4.6 `AGENTS.md`'s `test:e2e` line no longer claims it isn't wired into CI
