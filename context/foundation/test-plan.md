# Test Plan

> Phased test rollout for this project. Strategy is frozen at the top
> (§1–§5); cookbook patterns at the bottom (§6) fill in as phases ship.
> Read before writing any new test.
>
> Refresh: re-run `/10x-test-plan --refresh` when stale (see §8).
>
> Last updated: 2026-09-12

## 1. Strategy

Tests follow three non-negotiable principles for this project:

1. **Cost × signal.** The cheapest test that gives a real signal for the
   risk wins. Do not promote to e2e because e2e "feels safer." Do not put a
   vision model on top of a deterministic visual diff that already catches
   the regression.
2. **User concerns are first-class evidence.** Risks anchored in "the team
   is worried about X, and the failure would surface somewhere in area Y"
   carry the same weight as PRD lines or roadmap risk notes.
3. **Risks are scenarios, not code locations.** This plan documents *what
   could fail* and *why we believe it's likely* — drawn from documents,
   interview, and codebase *signal* (churn, structure, test base). It does
   NOT claim to know which line owns the failure. That knowledge is
   produced by `/10x-research` during each rollout phase. If the plan and
   research disagree about where the failure lives, research is the
   ground truth.

Hot-spot scope: insufficient signal. 0 commits touched `src/` in the last
30 days (all 40 recent commits were e2e/deploy/docs); only 5 in the last 90
days. Likelihood ratings in §2 rely on the roadmap and the Phase 2
interview, not git churn.

## 2. Risk Map

The top failure scenarios this project must protect against, ordered by
risk = impact × likelihood. Risks are failure scenarios in user / business
terms, not test names. The Source column cites the *evidence that surfaced
this risk* — never a specific file as "where the failure lives" (that is
research's job, see §1 principle #3).

| # | Risk (failure scenario) | Impact | Likelihood | Source (evidence — not anchor) |
|---|---|---|---|---|
| 1 | Conflict engine admits an assignment reality can't honour — a hard violation (capacity, gender rule, blacklist, double-booking) is wrongly classified as passable or soft-overridden | High | High | PRD Guardrails ("a worker with nowhere to sleep"); interview Q1, Q3, Q4; roadmap S-05 |
| 2 | A slice that "already works" in code (Arrival/Nightly/Inspection Day) gets waved through without proof against the live API, and the first real SPA↔API disagreement surfaces with the pilot agency instead of in CI | High | High | PRD Primary Success Criterion 1; roadmap S-01/S-02/S-03 risk notes; interview Q2 |
| 3 | A server-rejected replayed action disappears with no recovery route — the conflict inbox exists only in memory and is deleted on rejection | High | Medium | Roadmap S-07 baseline finding; PRD FR-018/FR-019; Guardrail "nobody can explain what happened" |
| 4 | Occupancy truth decays over a night shift — "today" is ambiguous for a 01:00 arrival, and a no-show has no documented route back to CHECKED_IN | High | Medium | PRD Open Question 13 (Cluster B), US-03; roadmap S-06 (blocked); Guardrail "the nightly count is wrong" |
| 5 | Router guard silently grants access when `auth.userRole` is null, bypassing the role check instead of denying | High | Medium | Roadmap Baseline section (RBAC inversion finding); PRD catalogued defect "RBAC inversion" |
| 6 | Soft-violation overrides are recorded but nobody reads them — the override path documents a decision without governing it | Medium | Medium | PRD US-06, Open Question 16 (Cluster E); roadmap S-05 (`ready`) |

**Abuse / security lens.** Risk #5 covers authorization (role-check bypass
on a null-role state) — the mandatory abuse row for a product with
route-level RBAC. PII egress (offline snapshot, exports) is a real surface
but is foundation-gated behind roadmap F-02 and did not surface from the
Phase 2 interview; tracked in §7, not forced into the top 6.

### Risk Response Guidance

| Risk | What would prove protection | Must challenge | Context `/10x-research` must ground | Likely cheapest layer | Anti-pattern to avoid |
|------|-----------------------------|----------------|--------------------------------------|-----------------------|-----------------------|
| #1 | A hard violation is rejected regardless of override attempts; a soft violation is admitted only with a recorded override | "The happy-path assignment test passing means the classifier is correct" — the hard/soft boundary needs its own assertion per violation type | Entry point of the conflict engine, the objection-code taxonomy, override recording shape | unit/integration (hermetic) | Oracle problem: don't assert against what the classifier currently returns — assert against the PRD's stated hard/soft taxonomy |
| #2 | The three must-not-fail journeys produce the same outcome against the live API as the mocked/unit tests assume | "It passed unit tests" implies it works live — the PRD names this exact false confidence | Live API response shapes for arrivals/in-house/inspection endpoints (some returned 500 until 2026-09-10) | e2e (Playwright, authenticated, against live `beduno-be`) | Don't reuse a mocked fixture's shape as the e2e oracle — the mock may already encode the bug |
| #3 | A rejected replayed action is still visible and actionable after a page reload | "It's in the review inbox" — is it actually persisted, or just in a ref that dies on reload? | Where conflict state is stored today (in-memory vs. IndexedDB), the replay-reject code path | integration (real IndexedDB) | Don't test only the reject-and-see-a-toast path — the regression is specifically about survival across reload |
| #4 | A worker arriving at 01:00 appears in "today's" arrivals; reversing a no-show before checkout produces a distinct audit event | "No-show has no undo" may be a design gap, not a bug — confirm intended behavior before asserting either way | The arrivals date-window logic, the NO_SHOW state-transition table | unit (date-window) + integration (state transition + audit event) | Don't hardcode "today = calendar date" as the oracle — that's the exact ambiguity this risk is about |
| #5 | Navigating with `auth.userRole === null` denies access to a role-gated route, never grants it | "The guard has a role check" — does it fire when the role is absent, or only when it mismatches? | The `router.beforeEach` guard logic, what state produces a null `userRole` | unit (hermetic router-guard function) | Don't only test "wrong role → denied" — the actual defect is "no role → allowed", the inverse case |
| #6 | A recorded soft-violation override is queryable/reportable, not just logged and forgotten | This may not have a resolved answer yet (Open Question 16 is unresolved) — a test here risks encoding a guess as the spec | Whichever resolution Cluster E lands on (friction, approver, or review report) | integration, once resolution lands | Don't write this test before Open Question 16 resolves — it would test an invented requirement |

## 3. Phased Rollout

Each row is a discrete rollout phase that will open its own change folder
via `/10x-new`. Status moves left-to-right through the values below; the
orchestrator updates Status as artifacts appear on disk.

| # | Phase name | Goal (one line) | Risks covered | Test types | Status | Change folder |
|---|---|---|---|---|---|---|
| 1 | Conflict-engine correctness | Prove hard violations always block and soft violations always require a recorded override, per violation type | #1 | unit + integration | complete | context/changes/testing-conflict-engine-correctness/ |
| 2 | Live-journey proof against beduno-be | Prove Arrival/Nightly/Inspection Day produce correct results against the real API, not just mocks | #2 | e2e | complete | context/changes/testing-live-journey-beduno-be/ |
| 3 | Offline durability | Prove a rejected replay survives reload; prove a 01:00 arrival and no-show reversal behave correctly once Cluster B resolves | #3, #4 | integration | not started | — |
| 4 | Access-control regression lock | Prove the null-userRole state denies access, not grants it | #5 | unit | not started | — |

Risk #6 (soft-override governance) has no rollout phase yet — blocked on
PRD Open Question 16 (Cluster E). Tracked in §7 until resolved.

## 4. Stack

| Layer | Tool | Version | Notes |
|---|---|---|---|
| unit + integration | Vitest | ^3.0.0 (jsdom) | Embedded in `vite.config.ts`; `passWithNoTests` removed per health-check |
| API mocking | axios-mock-adapter | latest in devDeps | Used by existing `*.api.spec.ts` files |
| e2e | Playwright | ^1.50.0 | Chromium + Pixel 5 projects; authenticated pair added by F-03, blocked on pilot test-account secrets |
| accessibility | none yet — see §7 | — | No WCAG-AA commitment for this pilot (PRD Non-Goals) |
| (optional) AI-native | none available this session | n/a | No Context7/Exa/vision-review MCP connected — see grounding note below |

**Stack grounding tools (current session):**
- Docs: none available — no Context7 or framework-docs MCP connected; checked: 2026-09-11.
- Search: none available — no Exa.ai or web-search MCP connected; checked: 2026-09-11.
- Runtime/browser: claude-in-chrome MCP is present but not used for this pass; checked: 2026-09-11.
- Provider/platform: none connected; checked: 2026-09-11.

## 5. Quality Gates

| Gate | Where | Required? | Catches |
|---|---|---|---|
| lint + typecheck | local + CI | required | syntactic / type drift |
| unit + integration | local + CI | required after §3 Phase 1 | logic regressions in the conflict engine and router guard |
| e2e on critical flows | CI on PR | required after §3 Phase 2 | broken Arrival/Nightly/Inspection Day journeys against the live API |
| dependency audit | CI | planned (roadmap F-01) | reintroduced CRITICAL/HIGH advisories (health-check found 1 CRITICAL + 14 HIGH as of 2026-08-19) |
| post-edit hook | local (agent loop) | optional | not scoped this rollout — cost/signal not yet justified given sparse test base |
| pre-prod smoke | between merge + prod | optional | environment-specific failures |

## 6. Cookbook Patterns

How to add new tests in this project. Each sub-section is filled in once
the relevant rollout phase ships; before that, the sub-section reads
"TBD — see §3 Phase N."

### 6.1 Adding a unit test for the conflict engine

- **Location**: `src/modules/stays/composables/` — co-located `useConflicts.spec.ts`.
- **Fixture pattern**: local `makeRoom(overrides)` / `makeWorker(overrides)` factories with sensible defaults, spread-overridden per case. Do not import fixtures across spec files — each file defines its own, matching this codebase's existing convention.
- **Hard-vs-soft invariant pattern**: when locking "a hard violation cannot be bypassed," don't just assert the hard violation exists in isolation — pair it with a coexisting *overridable* soft violation (e.g. `GENDER_MISMATCH`) in the same case and assert both `isBlocked` stays `true` and the hard violation is still present. Use one `it.each`/`describe.each` table across all `HardConstraintType` values rather than near-identical individual blocks — each row still independently catches a regression in its own check function.
- **Reference test**: `src/modules/stays/composables/useConflicts.spec.ts` (`describe('hard violations cannot be bypassed by a coexisting soft violation', ...)`).
- **Run locally**: `npx vitest run src/modules/stays/composables/useConflicts.spec.ts`.
- **Component-level coverage for a composable's consumers**: when a composable like `useConflicts` gates submission in a view, add a co-located component spec for that view too — the composable's own tests only prove the client pre-check, not that the consuming component wires it correctly (a real bug — a stuck-loading button — was found only at this layer). Follow the mount pattern in `src/modules/inspection/views/InspectionMode.spec.ts`: `mount()` with an `i18n` plugin instance, a fresh Pinia, and `vi.mock` for every `*.api.ts` module the view's stores call, with `PaginatedResponse`-shaped resolved values (`{ content, totalPages, totalElements, size, page }`). Reference tests: `src/modules/stays/views/CreateStay.spec.ts`, `src/modules/stays/views/BulkAssign.spec.ts`.

### 6.2 Adding an integration test

- TBD — see §3 Phase 3 (offline/IndexedDB durability pattern).

### 6.3 Adding an e2e test against the live API

- **Location**: `e2e/`, one file per journey (`arrival-day.spec.ts`,
  `nightly-list.spec.ts`, `inspection-day.spec.ts`) — never edit an
  existing guard-only spec (`checkin.spec.ts`, `exports.spec.ts`,
  `inspection.spec.ts`) to add real assertions; new files only, per the
  paired-project pattern that avoids re-leaking `storageState` into
  guard-only specs (the exact bug F-03's own review caught).
- **Authenticated-project wiring**: add the new filename to
  `playwright.config.ts`'s `AUTHENTICATED_SPECS` regex so it's picked up
  by `chromium-authenticated`/`Mobile Chrome-authenticated` and excluded
  from the unauthenticated projects.
- **Test data**: dedicated, disposable pilot-safe fixture data (one test
  account/property, matching `smoke.spec.ts`'s `selectOption({ index: 1
  })` convention) — no per-test revert/cleanup for ordinary actions.
- **Assertion style — structural success by default, with named
  exceptions**: assert reaching a valid post-action state (a toast from
  `useToast`, e.g. `getByText('Checked in successfully.')`), not exact
  business data, since live data changes between runs. **Exception**: when
  the risk being tested is specifically "does this data come back
  populated at all" (e.g. Nightly List's `occupants[]`), the assertion
  must NOT be tolerant — a fully tolerant either/or would silently pass in
  exactly the failure mode the test exists to catch. Assert a specific,
  known fixture (e.g. `E2E_OCCUPIED_ROOM_NUMBER`) shows real data instead.
- **Stateful multi-step flows**: pair each state-changing click with
  `page.waitForResponse(...)` scoped to that action's endpoint, not a
  toast-text race — toasts can stack when a loop performs several actions
  in quick succession. For a flow with no delete/cancel endpoint, add a
  `test.afterEach` hook that always attempts to close out any state still
  open, regardless of the test body's outcome — an accepted, narrow
  residual risk (only a hard crash could still orphan state), not a
  blocker.
- **Data-driven walkthroughs**: never hardcode a room/occupant count —
  loop over whatever Playwright locators actually resolve to, since these
  specs run against live pilot data of unknown shape.
- **Reference tests**: `e2e/arrival-day.spec.ts` (manual-ID fallback,
  headless-testable without camera mocking), `e2e/nightly-list.spec.ts`
  (the non-tolerant-assertion exception, worked example),
  `e2e/inspection-day.spec.ts` (multi-step flow + `afterEach` cleanup,
  `waitForResponse` pairing).

### 6.4 Adding a router-guard regression test

- TBD — see §3 Phase 4 (null-role denial pattern).

### 6.5 Per-rollout-phase notes

(Appended by `/10x-implement` after each phase lands.)

## 7. What We Deliberately Don't Test

Exclusions agreed during the rollout (Phase 2 interview, Q5). Future
contributors should respect these unless the underlying assumption changes.

- **Internal admin tools / user management screens** — small trusted user
  base, low blast radius, and `UserManagement.vue`'s edit path has no real
  handler yet regardless. Re-evaluate if user CRUD (roadmap S-13) ships and
  the user base grows past a handful of trusted admins. (Source: Phase 2
  interview Q5.)
- **Soft-violation override governance (Risk #6)** — Open Question 16
  (Cluster E) is unresolved; testing it now would encode an invented
  requirement. Re-evaluate once Cluster E resolves. (Source: challenger
  pass on the seed brief, 2026-09-11.)
- **PII egress via offline snapshot and exports** — real surface, but
  gated behind roadmap F-02 (written data-handling policy) which has not
  landed yet. Re-evaluate once F-02 ships and S-11/S-12 open. (Source:
  roadmap Foundations F-02.)
- **Bulk-assignment override recording** — `BulkAssign.vue` has no path to
  record a reason against a soft violation, unlike `CreateStay.vue`;
  whether bulk assignment should even support per-worker or per-batch
  overrides is itself unresolved (PRD Open Question 16, Cluster E).
  Today's gap is locked with a regression test in `BulkAssign.spec.ts`,
  not fixed. Re-evaluate when roadmap S-05 (`governed-soft-overrides`)
  resolves Open Question 16. (Source: `testing-conflict-engine-correctness`
  research.md and plan.md, 2026-09-12.)
- **`ConflictBanner.vue`'s `override` emit** — declared
  (`defineEmits<{ override: [reason: string] }>()`) but never actually
  called anywhere in the component's own script. Dead code, not a testing
  gap — there is no behavior to test. Re-evaluate only if the component is
  wired up as part of fixing the bulk-override gap above. (Source:
  `testing-conflict-engine-correctness` research.md, 2026-09-12.)
- **`overrideReason`'s free-text shape** — `Stay.overrideReason` /
  `StayCreatePayload.overrideReason` are free text, not the localized
  reason codes CLAUDE.md prefers for operational flows. Changing it is a
  data-model/API-contract decision needing backend coordination, out of
  scope for a testing phase. (Source: `testing-conflict-engine-correctness`
  plan.md, 2026-09-12.)
- **`inhouse.api.ts`'s `bulkCheckout`** — confirmed dead code (no store
  wrapper, no UI element anywhere in `RoomCard.vue`/`UnassignedWorkers.vue`/`InHouseView.vue`).
  Cannot be e2e-tested without first building the UI (FR-015). Re-evaluate
  once a separate change builds bulk-checkout's UI. (Source:
  `testing-live-journey-beduno-be` research.md and plan.md, 2026-09-12.)
- **`ArrivalsToday.spec.ts`'s `page`/`number` pagination-field drift** —
  a properties-API mock uses `number: 0` where `PaginatedResponse.page` is
  the actual declared field name. Not yet resolved whether the real API
  or the fixture is wrong; flagged for verification, not fixed here.
  (Source: `testing-live-journey-beduno-be` research.md, 2026-09-12.)
- **Inspection Day's residual orphaned-state risk** — `inspection.api.ts`
  has no delete/cancel endpoint; a hard test-runner crash (not a normal
  assertion failure) during `e2e/inspection-day.spec.ts` could still leave
  one inspection open server-side. Accepted and documented, not
  eliminated — mitigated by an always-run `test.afterEach` completion
  attempt. Whether `beduno-be` allows concurrent open inspections per
  property (which would make this fully harmless) is unverified; a manual
  check is tracked in that change's plan.md. (Source:
  `testing-live-journey-beduno-be` research.md and plan.md, 2026-09-12.)

## 8. Freshness Ledger

- Strategy (§1–§5) last reviewed: 2026-09-11
- Stack versions last verified: 2026-09-11
- AI-native tool references last verified: 2026-09-11 (none available)

Refresh (`/10x-test-plan --refresh`) when:

- a new top-3 risk surfaces from the roadmap or archive,
- a recommended tool's `checked:` date is older than three months,
- the project's tech stack changes (new framework, new test runner),
- §7 negative-space no longer matches what the team believes.
