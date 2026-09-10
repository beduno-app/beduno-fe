# Authenticated E2E Harness Against the Live API — Plan Brief

> Full plan: `context/changes/live-api-e2e-harness/plan.md`

## What & Why

The SPA has been live on CloudFront since 2026-09-09 and reachable against
the real `beduno-be` API since 2026-09-10, but the E2E suite has never run an
authenticated journey — all 12 specs assert route guards only, and one of
them still has a comment claiming the real backend doesn't exist. This
change builds the missing infrastructure — a live-reachable proxy, a
reusable sign-in session, one read-only smoke journey, and a CI step — so
that proving a real flow becomes possible. It is a foundation (roadmap F-03),
not a slice: it unlocks S-01/S-02/S-03's ability to *prove* the three
must-not-fail moments, it doesn't build them.

## Starting Point

`playwright.config.ts`'s `webServer` starts only the frontend
(`localhost:8081`); `vite.config.ts` proxies `/api` to a hardcoded
`localhost:8080` with no live backend behind it in CI. `ci.yml` is one
sequential job (Lint → Typecheck → Unit tests → Build) with zero secrets and
no E2E step. No test account, seed data, or staging backend exists anywhere
— `beduno.duckdns.org` is production, and it's the only live origin there is.

## Desired End State

A CI job step runs the E2E suite against a locally-served frontend whose API
proxy points at the live `beduno-be`, authenticated as a real test account
via repo secrets. A Playwright `setup` project signs in once, reusing the
session across the run via `storageState`, and the smoke spec proves the
full chain: real login → real token → protected route → real GET against
production data (a non-error response after selecting the test property —
see Key Decisions).

## Key Decisions Made

| Decision | Choice | Why (1 sentence) |
| --- | --- | --- |
| Test account provisioning | Team provisions before Phase 4 | Keeps this foundation infra-only, matching F-03's scope cap; named as a blocking prerequisite, not silently assumed |
| CI target environment | Local dev server, API proxy pointed at live `beduno-be` | Reuses the existing `webServer` pattern, isolates risk to API calls — a CloudFront-only bug can't block this gate |
| Smoke journey shape | Read-only — sign in, land on `/ops/arrivals` with live data | Proves the full auth chain with zero write risk to production; S-01/S-02/S-03 own the write paths |
| Credential delivery | Plain GitHub repo secrets | Matches this repo's current CI (zero secrets/protected environments today) |
| Live-API flake handling | Existing `retries: 2`, no new logic | Deploy-plan's transient failures were already fixed at the infra layer |
| Session reuse | Playwright `setup` project + shared `storageState` | Reusable by S-01/S-02/S-03's future specs; failures surface as a named, reported test rather than an opaque pre-run error |
| Smoke assertion shape | Select the test property, assert absence of the error state (not specific worker data) | `/ops/arrivals` fetches nothing until a property is picked (`arrivals.store.ts:25`); asserting non-error stays valid even as fixture data ages |
| CI trigger | Same as existing 4 stages (push + PR to main) | Matches PRD Secondary criterion 3 — E2E as an actual gate, not a side job |
| Job ordering | E2E runs after Build, in the same sequential job | `ci.yml` has no second job today; sequential steps already give "runs only if build passes" for free |

## Scope

**In scope:** configurable dev-proxy target, sign-in fixture (Playwright
`setup` project + `storageState`), one read-only smoke spec, CI wiring
(secrets + steps), retiring the stale `checkin.spec.ts` comment.

**Out of scope:** the three real journeys (S-01/S-02/S-03), seeding the test
account on `beduno-be` itself, a live-API health-check step, a protected
GitHub Environment, `.env.example`, `exports.spec.ts`/`inspection.spec.ts`.

## Architecture / Approach

Four independently-mergeable phases: (1) make `vite.config.ts`'s proxy
target configurable via `VITE_DEV_PROXY_TARGET`, (2) add a Playwright
`setup` project that drives the real login form and saves `storageState`
(chosen over hand-crafting `localStorage`, since the token's persistence
format is an internal detail of `pinia-plugin-persistedstate`; chosen over
`globalSetup` since a setup project reports failures as a named test rather
than an opaque pre-run error), (3) write
`e2e/smoke.spec.ts` against that saved session, (4) wire CI secrets/vars and
two new steps after `Build`. Phases 1-3 are fully verifiable locally without
touching production; only Phase 4 needs the real test account and CI
secrets.

## Phases at a Glance

| Phase | What it delivers | Key risk |
| --- | --- | --- |
| 1. Configurable dev-proxy target | CI can point the dev server's API proxy at the live backend | None — additive, default-preserving env var |
| 2. Sign-in fixture | Reusable authenticated `storageState` for this and future specs | Must drive the real UI form, not hand-craft storage — plugin format is an implementation detail |
| 3. Smoke spec | One passing spec proving the full auth+data chain | Read-only by design — no cleanup/teardown risk |
| 4. CI wiring | E2E runs automatically on every push/PR, after Build | Job stays red until the test account (external prerequisite) exists |

**Prerequisites:** a pilot-safe `FRONT_DESK` test account on `beduno-be`,
scoped to exactly one property returned by `GET /properties` — required for
Phase 4 only; Phases 1-3 are verifiable without it. No particular
worker/stay state is required, since the smoke spec asserts non-error, not
specific data.
**Estimated effort:** not estimated — roadmap sequencing is dependency-based, not time-boxed.

## Open Risks & Assumptions

- Phase 4 cannot go green until the external test account exists on
  `beduno-be` — this is a named, deliberate gap, not a forgotten detail.
- The live API's documented transient-failure history (CloudFront
  rate-limiting, cold starts) is assumed fixed at the infra layer per
  `deploy-plan.md`'s 2026-09-10 verification; if it recurs, standard
  `retries: 2` may not be enough and this decision should be revisited.
- `pinia-plugin-persistedstate`'s default storage key (`auth`) is assumed
  stable; if a future change customizes it, the sign-in fixture keeps
  working regardless since it drives the real UI rather than reading that
  key directly.

## Success Criteria (Summary)

- `npm run test:e2e` passes locally against the live API with real
  credentials, on both Playwright projects.
- A pushed branch's CI run shows a green E2E step after Lint/Typecheck/Unit
  tests/Build, once the test account exists.
- `checkin.spec.ts` no longer claims the authenticated journey is
  unreachable.
