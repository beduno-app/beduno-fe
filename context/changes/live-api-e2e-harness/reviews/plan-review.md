<!-- PLAN-REVIEW-REPORT -->
# Plan Review: Authenticated E2E Harness Against the Live API

- **Plan**: context/changes/live-api-e2e-harness/plan.md
- **Mode**: Deep
- **Date**: 2026-09-10
- **Verdict**: REVISE
- **Findings**: 1 critical, 2 warnings, 1 observation

## Verdicts

| Dimension | Verdict |
|-----------|---------|
| End-State Alignment | FAIL |
| Lean Execution | PASS |
| Architectural Fitness | WARNING |
| Blind Spots | PASS |
| Plan Completeness | WARNING |

## Grounding

11/11 paths ✓ (vite.config.ts, playwright.config.ts, .gitignore, package.json, ci.yml, e2e/checkin.spec.ts, e2e/auth.spec.ts, auth.store.ts, pinia.ts, router/index.ts, Login.vue), symbols ✓ (defineStore('auth'), pick:['token',...], Dashboard route with no meta.roles, CLAUDE.md ## Environment section, .gitignore Test results section), brief↔plan ✓. Progress↔Phase mechanical contract ✓ (1 `## Progress` heading, 4/4 phase headings match, no checkboxes outside Progress).

## Findings

### F1 — Smoke spec's live-GET proof is unreachable without selecting a property first

- **Severity**: CRITICAL
- **Impact**: HIGH — architectural stakes; think carefully before deciding
- **Dimension**: End-State Alignment
- **Location**: Phase 3 — Smoke spec, Contract for `e2e/smoke.spec.ts`
- **Detail**: Phase 3's Contract says the spec must "assert at least one element that only appears once the arrivals API call resolves (proves the live GET succeeded, not just that the route rendered its shell)." Verified directly against the actual component: `src/modules/arrivals/store/arrivals.store.ts:25` initializes `propertyIdFilter = ref('')`, and `ArrivalsToday.vue:148-150`'s `onMounted` only calls `store.fetchArrivals()` `if (store.propertyIdFilter)` — which is never true on a fresh load. There is no `watch()` in the component and no auto-select logic in `properties.store.ts`; the `<select>` renders with an explicit placeholder `<option value="">{{ t('arrivals.selectProperty') }}</option>` (`ArrivalsToday.vue:196-197`) matching the empty default. So navigating to `/ops/arrivals`, even fully authenticated, triggers **zero** API calls and renders the "select a property" empty state (`ArrivalsToday.vue:260-263`) — not live data. As written, the smoke spec would only re-prove what already exists (the route guard passes with a session) and would silently fail to prove the one thing this foundation exists to prove: a real GET against `beduno-be` succeeds end-to-end.
- **Fix A ⭐ Recommended**: Extend Phase 3's Contract so the spec selects the test property from the dropdown before asserting, and name which property the test account's fixture must be scoped to in the Prerequisite section (Critical Implementation Details). Assert on the **absence of the error state** (`ArrivalsToday.vue:275-276`, `class="error"`, bound to `store.error`) rather than on specific worker data — the component already separates "API failed" from "API succeeded with zero rows" (`v-else-if="store.error"` at line 275 vs. the plain `v-else` empty state at line 307-308), so this assertion stays valid even if the fixture's seeded worker's stay status ages out of `EXPECTED_TODAY` over time.
  - Strength: Matches the real user journey exactly (a front-desk user does select their property) and produces a true, verifiable live-GET proof; the error/empty split in the component means the assertion doesn't have to depend on a specific fixture row still existing.
  - Tradeoff: Adds one more fixture-shape assumption to the Prerequisite — the test account's property (and that `GET /properties` returns it) must be confirmed on the `beduno-be` side, which this plan can't verify itself.
  - Confidence: HIGH — verified directly against `arrivals.store.ts` and `ArrivalsToday.vue` source, not inferred.
  - Blind spot: Whether a FRONT_DESK-scoped `GET /properties` response reliably returns exactly one property for the test account is a `beduno-be`-side fact this repo can't confirm.
- **Fix B**: Retarget the smoke assertion to a screen that fetches data unconditionally on mount, avoiding the property-selection step entirely.
  - Strength: Could sidestep the property-selection complexity.
  - Tradeoff: `Dashboard.vue` (the post-login landing screen) makes no API calls at all (confirmed — it only reads the already-populated `auth.user`), so it doesn't prove a live GET either; no other screen was confirmed during this review to auto-fetch without a prior user action, so this fix adds unscoped research to an already-planned change rather than a known-good alternative.
  - Confidence: LOW — the replacement screen isn't identified or verified.
  - Blind spot: Whether `/ops/in-house` or any other ops screen auto-fetches on mount without a property selection was not checked.
- **Decision**: FIXED (via Fix A) — Phase 3's Contract now requires selecting the test property before asserting, asserts on absence of the error state rather than specific worker data, and the Prerequisite section names the property-scoping requirement. Phase 3's manual verification and Progress item 3.5 updated to match.

### F2 — globalSetup is a weaker pattern than Playwright's setup-project convention for exactly what this plan needs

- **Severity**: WARNING
- **Impact**: MEDIUM — real tradeoff; pause to reason through it
- **Dimension**: Architectural Fitness
- **Location**: Phase 2 — Sign-in fixture
- **Detail**: The plan wires authentication through `globalSetup` (`playwright.config.ts: globalSetup: './e2e/global-setup.ts'`). This still works in Playwright 1.50 (the pinned version), but Playwright's documented recommended pattern since 1.31 for exactly this "log in once, reuse `storageState`" case is a **setup project** (a `*.setup.ts` file run as its own named project, with other projects declaring `dependencies: ['setup']`). That distinction matters here specifically because Phase 2's own manual verification criterion requires that unset credentials "fail fast... with a clear message (not a generic Playwright timeout)" — a `globalSetup` failure surfaces as an opaque top-level error before any test runs and before the HTML reporter has anything to show; a setup-project failure shows up as a named, reported failing test (e.g. "authenticate") in the same run and report as everything else, which is a strictly clearer signal for the exact debuggability goal the plan states.
- **Fix**: Replace `globalSetup` with a `setup` project: `e2e/auth.setup.ts` matched via `testMatch: /.*\.setup\.ts/`, writing `storageState` to the same path; existing `chromium` / `Mobile Chrome` projects add `dependencies: ['setup']` and keep `use.storageState` pointed at that path.
  - Strength: Failures are visible, named, and reported exactly like any other test; matches Playwright's own current authentication guidance rather than the older pattern.
  - Tradeoff: Slightly more `playwright.config.ts` surface (a third project entry) than a single `globalSetup` line.
  - Confidence: HIGH — this is Playwright's documented, stable recommendation, not a stylistic preference.
  - Blind spot: None significant — both patterns are fully supported in the pinned `@playwright/test ^1.50.0`.
- **Decision**: FIXED — Phase 2 now uses a Playwright `setup` project (`e2e/auth.setup.ts`, testMatch pattern, `dependencies: ['setup']`) instead of `globalSetup`. Plan Overview, Phase 2 heading/body, and plan-brief.md updated to match.

### F3 — Doc updates miss AGENTS.md and README.md, which state facts this plan changes

- **Severity**: WARNING
- **Impact**: LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Plan Completeness
- **Location**: Phase 1, item 2 ("Document the new variable")
- **Detail**: `AGENTS.md` states `npm run test:e2e — Playwright; not wired into CI` — directly contradicted once Phase 4 lands, and the plan never touches this file. `README.md:21,30` and the existing `CLAUDE.md:95` bullet both state the dev-proxy target as a hardcoded `http://localhost:8080` fact; Phase 1 only *adds* a new `CLAUDE.md` bullet for `VITE_DEV_PROXY_TARGET`, it doesn't correct the pre-existing bullet that will now be incomplete (it describes only the unconfigurable case).
- **Fix**: In Phase 1's doc step, also update the AGENTS.md Commands line to drop "not wired into CI" (Phase 4 makes this stale the moment it lands — note the edit belongs in Phase 4, not Phase 1, since that's when it becomes true), and touch README.md's two dev-proxy mentions plus the existing CLAUDE.md `VITE_API_BASE_URL` bullet so all three read consistently with the new configurable behavior.
- **Decision**: FIXED — Phase 1's doc item now also corrects README.md and CLAUDE.md's existing hardcoded-proxy claims; Phase 4 adds an item dropping AGENTS.md's stale 'not wired into CI' clause (correct phase, since it only becomes true once CI wiring lands). Progress items 1.6 and 4.6 added.

### F4 — The plan doesn't record why a server-side proxy is required instead of pointing `VITE_API_BASE_URL` at the live URL directly

- **Severity**: OBSERVATION
- **Impact**: LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Plan Completeness
- **Location**: Phase 1 — Overview / Critical Implementation Details
- **Detail**: A simpler-looking alternative exists and isn't ruled out anywhere in the plan: setting `VITE_API_BASE_URL` (already read by `useApi.ts:6` as `import.meta.env.VITE_API_BASE_URL ?? '/api/v1'`) to the live API's absolute URL, with no `vite.config.ts` change at all. This doesn't work — `beduno-be`'s `CORS_ALLOWED_ORIGINS` is empty by design (`CLAUDE.md:106`: "`api/*` routes to `beduno-be` so the SPA calls its API same-origin — which is the only reason the backend's `CORS_ALLOWED_ORIGINS` can stay empty"), so a browser making a direct cross-origin call from `localhost:8081` to `beduno.duckdns.org` would be CORS-blocked. Only a Node-side proxy (which isn't subject to browser CORS enforcement) sidesteps this — which is exactly why Phase 1's approach is necessary, not just preferred. This reasoning isn't written down anywhere, so a future implementer or reviewer could plausibly "simplify" the change into a broken version.
- **Fix**: Add one sentence to Phase 1's Intent or to Critical Implementation Details naming the CORS constraint as the reason `VITE_API_BASE_URL` alone can't be used for this.
- **Decision**: FIXED — Key Discoveries in the plan's Overview now states the CORS constraint (beduno-be's CORS_ALLOWED_ORIGINS is empty) as the reason a server-side proxy is required.
