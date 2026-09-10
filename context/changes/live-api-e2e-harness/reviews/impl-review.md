<!-- IMPL-REVIEW-REPORT -->
# Implementation Review: Authenticated E2E Harness Against the Live API

- **Plan**: context/changes/live-api-e2e-harness/plan.md
- **Scope**: Phase 4 of 4 (full plan review)
- **Date**: 2026-09-11
- **Verdict**: REJECTED
- **Findings**: 2 critical, 0 warnings, 2 observations (F4 added post-triage — surfaced by re-running CI after F1's fix; see F4)

## Verdicts

| Dimension | Verdict |
|-----------|---------|
| Plan Adherence | PASS |
| Scope Discipline | PASS |
| Safety & Quality | FAIL |
| Architecture | PASS |
| Pattern Consistency | WARNING |
| Success Criteria | WARNING |

## Findings

### F1 — Authenticated storageState leaks into every pre-existing guard-only spec, not just smoke.spec.ts

- **Severity**: ❌ CRITICAL
- **Impact**: 🔬 HIGH — architectural stakes; think carefully before deciding
- **Dimension**: Safety & Quality
- **Location**: playwright.config.ts:21-30
- **Detail**: The `chromium` and `Mobile Chrome` projects apply `storageState: STORAGE_STATE` and `dependencies: ['setup']` with no `testMatch`/`testIgnore` scoping them to `smoke.spec.ts`. Playwright's default `testMatch` covers every `*.spec.ts` under `testDir`, so once `e2e/.auth/user.json` holds a real authenticated session, these two projects will run `auth.spec.ts`, `checkin.spec.ts`, `exports.spec.ts`, and `inspection.spec.ts` authenticated too — not just `smoke.spec.ts`. I verified the router guard directly (`src/app/router/index.ts:182-196`): `if (to.meta.requiresAuth !== false && !auth.isAuthenticated) return { name: 'Login' }` and `if (to.name === 'Login' && auth.isAuthenticated) return { name: 'Dashboard' }`. Concretely, once a real test account exists:
  - `auth.spec.ts` — all 3 tests break: test 1 expects `/ops/arrivals` → redirect to `/login` (won't redirect); tests 2–3 navigate to `/login` expecting the form, but an authenticated session bounces `/login` straight to `Dashboard`.
  - `checkin.spec.ts` — 4 of 5 tests break the same way (property-selector and language-switcher tests navigate to `/login` and get bounced; the `/` and `/ops/arrivals` redirect-to-login tests never redirect).
  - `exports.spec.ts` (2 tests) and `inspection.spec.ts` (2 tests) — all 4 break, same redirect-to-login assertions.
  That's 9 of the suite's pre-existing 10 guard tests. This wasn't caught by the plan's own manual verification because Phase 2/3's runs either failed at `setup` (credentials unset, so `dependencies: ['setup']` skipped everything downstream — exactly what the pushed-branch CI run showed) or focused specifically on `smoke.spec.ts` passing, not a full-suite pass/fail sweep. The bug is invisible until the moment the harness actually starts working — i.e., exactly when Phase 4's blocking prerequisite (the test account) resolves, which is the whole point of this change.
- **Fix A ⭐ Recommended**: Split into paired authenticated/unauthenticated projects. Keep `chromium`/`Mobile Chrome` unauthenticated (no `storageState`, no `dependencies`) but add `testIgnore: /smoke\.spec\.ts$/` so they stop picking it up; add two new projects (`chromium-authenticated`, `Mobile Chrome-authenticated`) with `storageState` + `dependencies: ['setup']` + `testMatch: /smoke\.spec\.ts$/`.
  - Strength: This is Playwright's own documented pattern for "some specs need auth, some don't" (paired auth/no-auth projects). The 9 existing guard tests need zero changes — they simply stop being touched by `storageState`. Scales cleanly to S-01/S-02/S-03's future authenticated specs (they just join the `*-authenticated` projects' `testMatch`).
  - Tradeoff: Grows `playwright.config.ts` from 3 to 5 project entries. Cosmetic note: `smoke.spec.ts` now literally runs under `chromium-authenticated`/`Mobile Chrome-authenticated`, not `chromium`/`Mobile Chrome` — Phase 3's plan wording ("passes on `chromium` and `Mobile Chrome`") becomes imprecise phrasing, though the actual device coverage (Desktop Chrome geometry + Pixel 5 geometry) is unchanged.
  - Confidence: HIGH — verified the exact break mechanism against the real router guard code, not inferred.
  - Blind spot: None significant — this is a config-only fix, no application code changes needed.
- **Fix B**: Keep the single `chromium`/`Mobile Chrome` pair with global `storageState`, and add `test.use({ storageState: { cookies: [], origins: [] } })` at the top of each of the 4 pre-existing guard-only spec files to explicitly clear the inherited session.
  - Strength: Smaller `playwright.config.ts` diff; project names stay exactly as the plan described.
  - Tradeoff: Touches 4 existing spec files instead of 1 config file; relies on every future guard-only spec remembering to add the same reset block, or the bug silently reintroduces itself — structurally fragile compared to Fix A.
  - Confidence: MEDIUM — works today, but is a per-file discipline requirement rather than a structural guarantee.
  - Blind spot: None significant.
- **Decision**: FIXED (via Fix A) — playwright.config.ts now has chromium/Mobile Chrome (testIgnore smoke.spec.ts, no storageState) plus new chromium-authenticated/Mobile Chrome-authenticated (testMatch smoke.spec.ts, storageState + dependencies:['setup']). Verified via `npx playwright test --list`: all 9 guard tests stay on the unauthenticated projects, smoke.spec.ts runs only on the two authenticated ones. Typecheck and lint pass.

### F2 — Pre-existing `auth.spec.ts` locator already can't match the rendered (Polish) button label

- **Severity**: 📝 OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Pattern Consistency
- **Location**: e2e/auth.spec.ts:19
- **Detail**: `auth.spec.ts:19` uses `getByRole('button', { name: /login|sign in/i })`, but the app hardcodes `locale: 'pl'` with no browser-locale detection (`src/app/plugins/i18n.ts:10`), so the submit button always renders `"Zaloguj się"` — which that regex never matches. Not introduced by this diff (pre-existing), but `auth.setup.ts:20` (written in this change) had to hardcode the correct Polish label with an explanatory comment specifically because of this, which makes the inconsistency newly visible. Likely means this specific assertion in `auth.spec.ts` has never actually exercised the click path correctly.
- **Fix**: Update `auth.spec.ts:19` to `getByRole('button', { name: 'Zaloguj się' })`, matching `auth.setup.ts`'s approach.
- **Decision**: FIXED — `e2e/auth.spec.ts:19` now uses `getByRole('button', { name: 'Zaloguj się' })`, matching `auth.setup.ts`'s approach and a comment explaining why. Lint clean, test still discovered by Playwright.

### F3 — AGENTS.md still states the dev-proxy target as a fixed `localhost:8080` fact

- **Severity**: 📝 OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Pattern Consistency
- **Location**: AGENTS.md:35
- **Detail**: `AGENTS.md:35` reads `npm run dev — dev server on port 8081, proxies /api to localhost:8080.` — this predates the change and wasn't in Phase 1's scope (which explicitly touched `vite.config.ts`, `CLAUDE.md`, `README.md` only), so it's not a plan violation. But it's now inconsistent with `CLAUDE.md`/`README.md`, which both correctly describe the proxy target as configurable via `VITE_DEV_PROXY_TARGET`.
- **Fix**: Append "(configurable via `VITE_DEV_PROXY_TARGET`)" to that line, matching the other two docs.
- **Decision**: FIXED — `AGENTS.md:35` now reads "...proxies /api to localhost:8080 (configurable via VITE_DEV_PROXY_TARGET).", consistent with CLAUDE.md/README.md.

### F4 — Same root cause as F2, but for the password field: `getByLabel(/password/i)` can't match "Hasło" either

- **Severity**: ❌ CRITICAL
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Success Criteria
- **Location**: e2e/auth.spec.ts:11-12, 17-18 (pre-F1-fix)
- **Detail**: Discovered by re-running CI after fixing F1: with F1's dependency-scoping fix landed, `auth.spec.ts`'s "shows login form..." and "shows error message on invalid credentials" tests actually executed (instead of being silently skipped, as they always had been) and both failed on both `chromium` and `Mobile Chrome` (4 failures) — `getByLabel(/password/i)` timed out, "element(s) not found". Root cause: `src/assets/translations/pl.ts`'s `auth.password` is `'Hasło'`, which has no English cognate, unlike `auth.email: 'Email'` (kept as-is in Polish) — so `/password/i` can never match, while `/email/i` happens to work by translation coincidence. Same class of bug as F2, just on a field this review's Fix A for F1 caused to actually run for the first time — genuinely was hidden by the pre-existing `dependencies: ['setup']` over-scoping until F1's fix removed it.
- **Fix**: Replace `getByLabel(/password/i)` with `getByLabel('Hasło')` at both call sites in `auth.spec.ts`, matching F2's exact-text approach, with a comment explaining why.
- **Decision**: FIXED — both `getByLabel(/password/i)` occurrences in `e2e/auth.spec.ts` now use `getByLabel('Hasło')`. Lint clean; `npx playwright test --list` confirms both tests still discovered on `chromium`/`Mobile Chrome`. Pending: re-verify via a real pushed-branch CI run that all previously-masked guard tests now pass.
