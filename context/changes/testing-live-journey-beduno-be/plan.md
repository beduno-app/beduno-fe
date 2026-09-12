# Live-Journey Proof Against beduno-be Implementation Plan

## Overview

Prove Arrival Day, Nightly List, and Inspection Day against the real
`beduno-be` API, as rollout Phase 2 of `context/foundation/test-plan.md`
(Risk #2: a slice that "already works" in code gets waved through without
proof against the live API). Research found that Risk #2 is three
different risks, not one — a speculative render-crash risk for Arrival
Day, a silent-empty-roster risk for Nightly List, and a no-cleanup-path
risk for Inspection Day — so each journey gets its own phase, sequenced
by ascending cost and risk, extending the F-03 authenticated Playwright
harness.

## Current State Analysis

- The F-03 harness (`playwright.config.ts`'s `chromium-authenticated` /
  `Mobile Chrome-authenticated` projects, `e2e/auth.setup.ts`,
  `e2e/smoke.spec.ts`) is complete and directly reusable — nothing
  journey-specific is baked into auth setup. `AUTHENTICATED_SPECS` today
  matches only `smoke.spec.ts`.
- `e2e/checkin.spec.ts`, `e2e/exports.spec.ts`, `e2e/inspection.spec.ts`
  are guard-only and stay untouched — new real-journey specs are new
  files, matching the paired-project pattern the F-03 review established
  (avoids storageState leaking into guard-only specs again).
- All three journeys remain blocked from actually *running* by the
  missing `E2E_TEST_EMAIL`/`E2E_TEST_PASSWORD` secrets (confirmed absent
  again via `gh secret list` during research). This plan writes and wires
  the specs regardless — the same precedent F-03 already set (shipped with
  2 Progress items deliberately left open, not a defect).

### Key Discoveries

- **Arrival Day**: `ArrivalStay`'s nested `worker`/`property`/`room` are
  typed non-nullable with zero optional chaining in `ArrivalRow.vue` — a
  partially-hydrated live response would crash the render, not just show
  wrong data. This is unconfirmed against real data, only inferred from
  types. **Decision: diagnostic-first** — write the test now; a live crash
  IS the proof, and hardening becomes a follow-up, not pre-emptive work.
  The manual-ID fallback in `QrCheckin.vue` renders outside the
  camera-permission branch, so it's headlessly testable without mocking
  `getUserMedia`.
- **Nightly List**: `bulkCheckout` (`inhouse.api.ts`) is confirmed dead
  code — no store wrapper, no UI element anywhere. **Decision: out of
  scope**, documented in `test-plan.md` §7, not built here. The real risk
  is `RoomCard.vue`'s `occupants[]` rendering silently as "empty" if the
  live API doesn't populate it — no error, no crash, just a wrong-looking
  roster.
- **Inspection Day**: multi-step, server-state-keyed flow (`start` mints
  an id; every later call replaces the whole client object) with **no
  delete/cancel endpoint**. **Decision: include it, always attempt
  `complete()` in a `test.afterEach` hook** regardless of pass/fail,
  accepting a narrow residual risk (only a hard crash, not a normal
  assertion failure, could still orphan one inspection) — matching F-03's
  own precedent of shipping with a documented, narrow residual risk rather
  than blocking on a fully-verified backend guarantee.
- **Assertion style**: structural success (the `smoke.spec.ts` pattern —
  assert reaching a valid post-action state, not exact business data)
  applies to the **action** assertions (check-in succeeded, check-out
  succeeded) via the app's toast composable — confirmed real: `ArrivalsToday.vue:70,103`
  calls `toast.success(t('arrivals.checkInSuccess'))` and
  `InHouseView.vue:33` calls `toast.success(t('inhouse.checkOutSuccess'))`,
  both rendering as `.toast-message` text via `ToastNotifications.vue`.
  **This does NOT apply uniformly** — see Critical Implementation Details
  below for the one deliberate exception.
- Test data: **dedicated, disposable pilot-safe fixture data**, matching
  F-03's own approach (one test account, one property, `selectOption({
  index: 1 })` in `smoke.spec.ts`) — no per-test revert/cleanup for
  Arrival/Nightly actions.

## Desired End State

- `e2e/arrival-day.spec.ts`, `e2e/nightly-list.spec.ts`,
  `e2e/inspection-day.spec.ts` exist, are discovered under the
  authenticated Playwright projects, pass typecheck/lint, and are ready to
  run the moment the E2E secrets are provisioned.
- `playwright.config.ts`'s `AUTHENTICATED_SPECS` covers all three new spec
  files alongside `smoke.spec.ts`.
- `test-plan.md` §6.3 documents this phase's e2e pattern; §7 records the
  bulk-checkout gap, the `page`/`number` pagination-field drift found
  during research, and Inspection's accepted residual cleanup risk.

### Verification

- `npm run typecheck && npm run lint` pass.
- `npx playwright test --list` shows all three new specs under
  `chromium-authenticated` and `Mobile Chrome-authenticated`, and shows
  them correctly excluded from the unauthenticated `chromium`/`Mobile
  Chrome` projects.
- Actually running the new specs against live data stays manually blocked
  until `E2E_TEST_EMAIL`/`E2E_TEST_PASSWORD` are provisioned — tracked as
  an explicitly open Progress item per phase, not a phase blocker.

## What We're NOT Doing

- Not building the bulk-checkout UI (FR-015) — no UI exists today, and
  building it would turn a testing phase into a feature-build phase. Only
  `e2e/nightly-list.spec.ts`'s reachable path (roster load, single
  checkout) is tested.
- Not proactively hardening `ArrivalRow.vue` against the type-level crash
  risk — diagnostic-first per the decision above; a fix (if the risk turns
  out real) is a follow-up change, not this phase's job.
- Not fixing or investigating the `page`/`number` pagination-field
  drift found in `ArrivalsToday.spec.ts:20` — flagged in `test-plan.md`
  §7 as a finding needing separate verification (is the type wrong, or is
  the test fixture sloppy?), not resolved here.
- Not adding a delete/cancel endpoint to `inspection.api.ts` or otherwise
  changing backend behavior — the accepted-risk cleanup strategy works
  entirely within what the frontend can already do.
- Not reverting Arrival/Nightly check-in/check-out actions after each
  test — dedicated fixture data is expected to accumulate state, matching
  F-03's existing convention.

## Critical Implementation Details

### Nightly List's roster-load assertion cannot use the tolerant either/or pattern

The general assertion-style decision (structural success, tolerant of
either post-action state) is correct for **action** assertions
(check-in/check-out succeeded), but applying it to Nightly List's
**roster-load** check would defeat the test's purpose: a fully tolerant
"either a populated room or an empty-room message is fine" assertion would
silently pass in exactly the failure mode this journey exists to catch
(`occupants[]` coming back empty when it shouldn't). `e2e/nightly-list.spec.ts`
must instead assert that a specific, known-occupied fixture room (part of
the pilot-safe test data) shows a nonzero occupant count — a real,
non-tolerant assertion. If no occupied room exists on the test account,
this is the same class of external fixture-provisioning gap F-03 already
named as a non-blocking "Block: no" unknown, not a defect in this plan;
the manual verification step below surfaces it rather than papering over
it with a tolerant assertion.

## Phase 1: Arrival Day e2e journey

### Overview

Add the Arrival Day journey spec via the manual-ID check-in path, and
extend the authenticated-project regex to cover all three new specs this
plan will add.

### Changes Required:

#### 1. Playwright authenticated-project scoping

**File**: `playwright.config.ts`

**Intent**: Extend `AUTHENTICATED_SPECS` now to cover all three new spec filenames this plan introduces, so each phase's spec is picked up by the authenticated projects (and excluded from the unauthenticated ones) as soon as it lands — no repeated tiny config edits per phase.

**Contract**: Change `const AUTHENTICATED_SPECS = /smoke\.spec\.ts$/` to a pattern matching `smoke.spec.ts`, `arrival-day.spec.ts`, `nightly-list.spec.ts`, and `inspection-day.spec.ts` (e.g. `/(smoke|arrival-day|nightly-list|inspection-day)\.spec\.ts$/`). No other change to the 5-project structure.

#### 2. Arrival Day spec

**File**: `e2e/arrival-day.spec.ts` (new)

**Intent**: Prove a front desk user can check a worker in via the manual-ID fallback (not QR — camera hardware isn't available in CI) against the live API, and that the app's own success signal (toast) fires.

**Contract**: Runs under the authenticated projects only (matched by the regex above). Navigate to `/ops/arrivals`, select the test account's property (`getByRole('combobox').selectOption({ index: 1 })`, matching `smoke.spec.ts`'s convention). Open the QR panel (`getByRole('button', { name: t('arrivals.scanQr') })`), fill the manual-ID input (`getByPlaceholder(t('arrivals.manualIdPlaceholder'))`) with a known `EXPECTED_TODAY` worker's `internalId` from the test fixture, click Confirm (`getByRole('button', { name: t('common.confirm') })`). Assert the success toast becomes visible (`getByText(t('arrivals.checkInSuccess'))`) — this is the structural-success signal (real, app-level, not a hardcoded row). If the manual-ID worker fixture doesn't exist on the test account, this is a fixture-provisioning gap to surface via manual verification, not something to work around with a synthetic fallback.

### Success Criteria:

#### Automated Verification:

- Typecheck passes: `npm run typecheck`
- Lint passes: `npm run lint`
- Spec discovered correctly: `npx playwright test --list` shows `arrival-day.spec.ts` under `chromium-authenticated` and `Mobile Chrome-authenticated` only (not under the unauthenticated `chromium`/`Mobile Chrome` projects)

#### Manual Verification:

- Once `E2E_TEST_EMAIL`/`E2E_TEST_PASSWORD` are provisioned and a real `EXPECTED_TODAY` worker fixture exists on the test account, run `npx playwright test arrival-day.spec.ts` against the live API and confirm it passes (or, if it crashes on a shape mismatch, that confirms the speculative risk was real — open a follow-up rather than blocking this phase).

---

## Phase 2: Nightly List e2e journey

### Overview

Add the Nightly List journey spec: a real occupancy check on the roster
(the risk this journey exists to catch) plus a single-worker checkout.

### Changes Required:

#### 1. Nightly List spec

**File**: `e2e/nightly-list.spec.ts` (new)

**Intent**: Prove the in-house roster genuinely reflects live occupancy (not silently empty), and that a single-worker checkout against the live API succeeds.

**Contract**: Runs under the authenticated projects. Navigate to `/ops/in-house`, select the test property. Per the Critical Implementation Detail above: assert a specific, known-occupied fixture room (identified by `roomNumber`) shows a nonzero occupant count — a real assertion, not a tolerant either/or. Then check out one occupant from that room (`getByRole('button', { name: t('inhouse.checkOut') })`, handling the native `confirm()` dialog via `page.on('dialog', d => d.accept())`), and assert the success toast (`getByText(t('inhouse.checkOutSuccess'))`) — tolerant structural success is correct here, since the action itself (not the roster's baseline state) is what's being proven.

### Success Criteria:

#### Automated Verification:

- Typecheck passes: `npm run typecheck`
- Lint passes: `npm run lint`
- Spec discovered correctly: `npx playwright test --list` shows `nightly-list.spec.ts` under `chromium-authenticated` and `Mobile Chrome-authenticated` only

#### Manual Verification:

- Once secrets are provisioned and a known-occupied room fixture exists, run `npx playwright test nightly-list.spec.ts` against the live API and confirm the roster assertion actually reflects real occupancy (this is the load-bearing check — if it passes trivially because the assertion was accidentally left tolerant, that's a bug in this phase to fix, not a pass to accept).

---

## Phase 3: Inspection Day e2e journey

### Overview

Add the Inspection Day journey spec as a data-driven walkthrough (no
hardcoded room/occupant counts), with the accepted-risk cleanup strategy
for the missing cancel endpoint.

### Changes Required:

#### 1. Inspection Day spec

**File**: `e2e/inspection-day.spec.ts` (new)

**Intent**: Prove a front desk user can complete a full inspection walkthrough against the live API, driven entirely by whatever real rooms/occupants the test property actually has (never a hardcoded count, since this runs against live pilot data).

**Contract**: Runs under the authenticated projects. Start an inspection (`getByRole('button', { name: t('inspection.startInspection') })`). For each rendered room card, mark every rendered occupant present (`getByRole('button', { name: t('inspection.present') })`, scoped per occupant row via Playwright locator chaining — never a fixed occupant count), then verify the room (`getByRole('button', { name: t('inspection.markVerified') })`). After all rooms are verified, complete the inspection (`getByRole('button', { name: t('inspection.completeInspection') })`, handling its native `confirm()` dialog). Assert the summary report renders (`InspectionSummaryReport` becoming visible is the structural-success signal — an inspection with `completedAt` set). **Cleanup**: add a `test.afterEach` hook that checks whether the store still holds an active (`!completedAt`) inspection and, if so, attempts to complete it — this is the accepted-risk mitigation from the Key Discoveries section, run regardless of the test body's pass/fail outcome.

### Success Criteria:

#### Automated Verification:

- Typecheck passes: `npm run typecheck`
- Lint passes: `npm run lint`
- Spec discovered correctly: `npx playwright test --list` shows `inspection-day.spec.ts` under `chromium-authenticated` and `Mobile Chrome-authenticated` only

#### Manual Verification:

- Once secrets are provisioned, run `npx playwright test inspection-day.spec.ts` against the live API and confirm it completes cleanly. Separately, as a one-time check (not part of this test): manually verify whether `beduno-be` allows a second concurrent inspection to start for the same property — this resolves research's Open Question 2 and should be recorded back into `test-plan.md` once known, but does not block this phase from shipping.

---

## Phase 4: Config wiring verification + cookbook/follow-ups

### Overview

Confirm the full authenticated-project wiring across all three new specs,
and fold this phase's pattern and its documented gaps into
`test-plan.md`.

### Changes Required:

#### 1. Cookbook entry and follow-ups

**File**: `context/foundation/test-plan.md`

**Intent**: Replace the §6.3 placeholder with the pattern this phase established; record the deliberately-unfixed/unresolved findings in §7 so they aren't silently lost.

**Contract**: §6.3 ("Adding an e2e test against the live API") names: the paired authenticated/unauthenticated project pattern from F-03, the `AUTHENTICATED_SPECS` regex convention, the dedicated-fixture-data-no-revert convention, the structural-success-by-default-with-named-exceptions rule (citing Nightly List's roster-load exception as the worked example), the `test.afterEach`-cleanup pattern for stateful multi-step flows, and points to all three new spec files as reference tests. Append three bullets to §7: `bulkCheckout` (inhouse) has no UI and is untested (re-evaluate once FR-015 gets a UI build); the `page`/`number` pagination-field drift found in `ArrivalsToday.spec.ts` (needs verification against the real API, not yet resolved); Inspection Day's accepted residual risk of an orphaned inspection on a hard test-runner crash (re-evaluate once backend concurrent-inspection behavior is confirmed, see Phase 3's manual verification note). Each bullet cites this change (`testing-live-journey-beduno-be`, 2026-09-12) as source.

### Success Criteria:

#### Automated Verification:

- `npx playwright test --list` shows exactly 4 specs (`smoke`, `arrival-day`, `nightly-list`, `inspection-day`) under each authenticated project, and confirms the 4 pre-existing guard-only specs remain unauthenticated-only
- `test -f context/foundation/test-plan.md`

#### Manual Verification:

- §6.3 and §7 read clearly and accurately reflect what this phase shipped.

---

## Testing Strategy

### Unit Tests:

- None — this phase is e2e-only, per `test-plan.md` §3 Phase 2's stated test types.

### Integration Tests:

- None in this phase.

### Manual Testing Steps:

1. Once `E2E_TEST_EMAIL`/`E2E_TEST_PASSWORD` are provisioned, run all three new specs against the live API and confirm each passes.
2. Manually verify `beduno-be`'s behavior on a second concurrent inspection for the same property (resolves research Open Question 2).
3. If Arrival Day's spec crashes on a shape mismatch, that confirms the speculative risk — file a follow-up fix rather than blocking this phase.

## Performance Considerations

None — this phase adds e2e specs and a regex extension; no runtime performance impact on the app itself. Inspection Day's walkthrough is the most expensive to run (5–15+ sequential round trips per property), a CI-time cost, not a product one.

## Migration Notes

Not applicable — pre-production system, no live data beyond the pilot-safe test account.

## References

- Research: `context/changes/testing-live-journey-beduno-be/research.md`
- Rollout source: `context/foundation/test-plan.md` §3 Phase 2
- Prior rollout phase (established the fix-vs-lock discipline this plan follows): `context/changes/testing-conflict-engine-correctness/plan.md`
- Reference for the existing real-journey pattern: `e2e/smoke.spec.ts`
- Reference for the authenticated harness: `playwright.config.ts`, `e2e/auth.setup.ts`

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Arrival Day e2e journey

#### Automated

- [x] 1.1 Typecheck passes: `npm run typecheck` — f7873df
- [x] 1.2 Lint passes: `npm run lint` — f7873df
- [x] 1.3 Spec discovered correctly: `npx playwright test --list` shows `arrival-day.spec.ts` under the authenticated projects only — f7873df

#### Manual

- [ ] 1.4 Run against the live API once secrets + worker fixture exist and confirm pass (or confirm the speculative crash risk)

### Phase 2: Nightly List e2e journey

#### Automated

- [x] 2.1 Typecheck passes: `npm run typecheck` — 38ae3c0
- [x] 2.2 Lint passes: `npm run lint` — 38ae3c0
- [x] 2.3 Spec discovered correctly: `npx playwright test --list` shows `nightly-list.spec.ts` under the authenticated projects only — 38ae3c0

#### Manual

- [ ] 2.4 Run against the live API once secrets + occupied-room fixture exist and confirm the roster assertion is genuinely load-bearing

### Phase 3: Inspection Day e2e journey

#### Automated

- [x] 3.1 Typecheck passes: `npm run typecheck` — c822251
- [x] 3.2 Lint passes: `npm run lint` — c822251
- [x] 3.3 Spec discovered correctly: `npx playwright test --list` shows `inspection-day.spec.ts` under the authenticated projects only — c822251

#### Manual

- [ ] 3.4 Run against the live API once secrets exist and confirm clean completion
- [ ] 3.5 Manually verify beduno-be's concurrent-inspection behavior (resolves research Open Question 2)

### Phase 4: Config wiring verification + cookbook/follow-ups

#### Automated

- [x] 4.1 `npx playwright test --list` shows exactly 4 authenticated specs and confirms guard-only specs stay unauthenticated
- [x] 4.2 `test -f context/foundation/test-plan.md`

#### Manual

- [x] 4.3 §6.3 and §7 read clearly and accurately reflect what this phase shipped
