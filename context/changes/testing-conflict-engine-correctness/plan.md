# Conflict-Engine Correctness Implementation Plan

## Overview

Prove the conflict engine's hard/soft violation classification is correct
and stays correct — across the composable, the store, and the two views
that consume it — as rollout Phase 1 of `context/foundation/test-plan.md`
(Risk #1: "a worker has nowhere to sleep"). Research surfaced that the
response guidance's original hypothesis (a hard violation can be bypassed
by an override flag) does not match the code — no such bypass path exists
— but planning's own deeper read found two real correctness bugs in the
same area, and confirmed two known UX-wiring gaps that are out of scope to
fix here.

## Current State Analysis

- `useConflicts()` ([`src/modules/stays/composables/useConflicts.ts`](https://github.com/beduno-app/beduno-fe/blob/c5529ab8286a352d06913d1d28b0330e3063346d/src/modules/stays/composables/useConflicts.ts)) checks 7 violation types across `validate()` (single) and `validateBulk()` (bulk). Hard: `CAPACITY_EXCEEDED`, `DOUBLE_BOOKING`, `ROOM_BLOCKED`, `PROPERTY_BLOCKED`. Soft: `GENDER_MISMATCH`, `WORKER_BLACKLISTED`, `OVER_PLANNED`.
- All 7 types have unit coverage in `useConflicts.spec.ts`, but two tests in `stays.store.spec.ts` are oracle-problem mirrors (they hand-construct the mocked API response with the exact value they then assert back).
- `CreateStay.vue` has a working override flow (soft-only 422 → reason input → retried payload carries `overrideReason`). `BulkAssign.vue` has none — `BulkAssignmentItem` has no override field, and `submit()` never reads `conflicts` state.
- `ConflictBanner.vue` declares an `override` emit that is never actually called anywhere in its script — not just unlistened, genuinely dead.
- Zero component-level tests exist for `CreateStay.vue` or `BulkAssign.vue`.

### Key Discoveries

- **`validateBulk()` never calls `checkCapacity`** ([`useConflicts.ts:132-152`](https://github.com/beduno-app/beduno-fe/blob/c5529ab8286a352d06913d1d28b0330e3063346d/src/modules/stays/composables/useConflicts.ts#L132-L152)). Only `checkOverPlanned` covers "not enough room," and its guard `room.availableSpots > 0 && room.availableSpots < additionalWorkers` is `false` when `availableSpots === 0`. **A room with zero available spots raises no violation at all in bulk mode.** No existing test in `useConflicts.spec.ts`'s `validateBulk()` suite uses `availableSpots: 0` — every case uses `2` or `3`. This is a pure client-side logic bug in the exact file this phase already targets, not a product/UX decision, so it is fixed here rather than merely locked.
- **`CreateStay.vue`'s `save()` doesn't reset `isSaving` on the blocked path** ([`CreateStay.vue:76-80`](https://github.com/beduno-app/beduno-fe/blob/c5529ab8286a352d06913d1d28b0330e3063346d/src/modules/stays/views/CreateStay.vue#L76-L80)): `isSaving.value = true` is set, then `if (conflicts.isBlocked.value) return` fires before it's ever reset — the Save button (bound to `:loading="isSaving"`) gets stuck in a loading state after one blocked attempt. Same category as the capacity bug: an obvious control-flow defect with an uncontroversial fix, not a scope debate.
- **`BulkAssign.vue`'s `isValid`** ([`BulkAssign.vue:61-69`](https://github.com/beduno-app/beduno-fe/blob/c5529ab8286a352d06913d1d28b0330e3063346d/src/modules/stays/views/BulkAssign.vue#L61-L69)) gates only on `!conflicts.isBlocked.value` (hard violations) — a soft violation never disables the submit button, and `submit()` builds `BulkAssignmentItem[]` with no override field at all. This is a genuine functional gap, but *whether bulk assignment should even support per-worker or per-batch overrides* is an open product question (PRD Cluster E, Open Question 16; roadmap S-05, status `ready`) — not something this testing phase should decide. **Decision: lock today's behavior with a regression test and a documented follow-up; do not fix.**
- **`ConflictBanner.vue`'s `override` emit** is declared (`defineEmits<{ override: [reason: string] }>()`) but never called in the component's own script — there is no behavior to test here, only a note that it's dead code.
- The classification logic is a client-side pre-check only; the backend independently computes and can overwrite the verdict via `setServerViolations()`. A unit test on `useConflicts.ts` proves the pre-check; it does not prove real end-to-end enforcement. **Decision: defer that gap fully to `test-plan.md` §3 Phase 2** (live-API journey, Risk #2), which is explicitly scoped to test against the real `beduno-be` API.

## Desired End State

- `validateBulk()` raises a hard `CAPACITY_EXCEEDED` violation when the target room has zero available spots, matching `validate()`'s behavior.
- One parameterized test locks "a hard violation stays blocking even when an overridable soft violation coexists" across all 4 hard types — the closest honest proxy for "cannot be bypassed by an override," since no override parameter exists anywhere in the hard-check functions today.
- The two mirror tests in `stays.store.spec.ts` assert the real outgoing request payload, not the mocked response echo.
- `CreateStay.vue` and `BulkAssign.vue` each have a new co-located spec file. `CreateStay.vue`'s stuck-loading bug is fixed and covered. `BulkAssign.vue`'s missing override path is locked as documented, known behavior with a regression test and an inline comment pointing at this change's `research.md` and PRD Open Question 16.
- `test-plan.md` §6.1 names this area's testing pattern for future contributors; §7 records the three deliberately-unfixed gaps found during this phase.

### Verification

- `npm run typecheck && npm run lint && npm test` all pass.
- `npx playwright test --list` unaffected (this phase touches no `e2e/` files).

## What We're NOT Doing

- Not wiring an override-recording path into `BulkAssign.vue` or connecting `ConflictBanner`'s emit to any parent — that is a product decision blocked on PRD Open Question 16 (roadmap S-05).
- Not migrating `overrideReason` from free text to a localized reason code, despite the CLAUDE.md preference for reason codes in operational flows — that is an API-contract change needing backend coordination, out of scope here.
- Not adding an integration test against a mocked 422 to close the client/server verdict-divergence gap — deferred to `test-plan.md` §3 Phase 2, which tests against the real `beduno-be` API rather than a potentially-wrong mock.
- Not touching `src/modules/audit/` or adding an `OVERRIDE` audit-action type (Risk #6 territory, also blocked on Open Question 16).
- Not writing E2E/Playwright specs — this phase is unit + component only, per `test-plan.md` §3 Phase 1's stated test types.

## Implementation Approach

Bottom-up: fix and lock the composable first (cheapest, most isolated, already has a test file and fixtures), then the store (thin pass-through, mocked API), then the two consuming components (heaviest setup: mount + Pinia + i18n), then fold the pattern back into the cookbook. Each phase's automated verification runs only the files it touches; the final phase runs the full suite.

## Phase 1: Composable correctness

### Overview

Fix the missing bulk-mode capacity check and lock the hard/soft
classification invariant against future regressions.

### Changes Required:

#### 1. Bulk capacity check

**File**: `src/modules/stays/composables/useConflicts.ts`

**Intent**: `validateBulk()` must raise a hard `CAPACITY_EXCEEDED` violation when the room has zero available spots, matching `validate()`'s existing behavior — today it raises nothing.

**Contract**: Call `checkCapacity(room)` inside `validateBulk()` (the function already guards `room` as non-null before this point), alongside the existing `checkPropertyBlocked`/`checkRoomBlocked`/`checkOverPlanned` calls. Ordering relative to `checkOverPlanned` doesn't change existing behavior for the partial-shortfall case (`availableSpots > 0` but `< additionalWorkers`) — only the `availableSpots <= 0` case gains its missing hard violation.

#### 2. Composable test coverage

**File**: `src/modules/stays/composables/useConflicts.spec.ts`

**Intent**: Add the regression test for the capacity-in-bulk fix, and lock the "hard violation persists even when an overridable soft violation coexists" invariant across all 4 hard types.

**Contract**: Extend the existing `describe('validateBulk()', ...)` block with a case using `makeRoom({ availableSpots: 0 })` and 2+ workers, asserting `hardViolations` contains a `CAPACITY_EXCEEDED` entry. Add a new `describe.each`/`it.each` table over the 4 `HardConstraintType` values; each row constructs the minimal `worker`/`room` combination that triggers that specific hard type **plus** a simultaneous `GENDER_MISMATCH`-triggering setup (a soft, overridable violation), calls `validate()`, and asserts both `isBlocked.value === true` and the hard violation type is present in `hardViolations` — proving the hard classification is unaffected by a coexisting overridable soft violation. Reuse the existing `makeRoom`/`makeWorker` fixtures.

### Success Criteria:

#### Automated Verification:

- Typecheck passes: `npm run typecheck`
- Lint passes: `npm run lint`
- Composable tests pass: `npx vitest run src/modules/stays/composables/useConflicts.spec.ts`

#### Manual Verification:

- In the running app, attempt to bulk-assign 2+ workers into a room with 0 available spots and confirm the submit button is now disabled (was previously enabled).

---

## Phase 2: Store behavioral tests

### Overview

Replace the two oracle-problem mirror tests with assertions on the real
outgoing request payload.

### Changes Required:

#### 1. Override-reason test

**File**: `src/modules/stays/store/stays.store.spec.ts`

**Intent**: The "creates stay with override reason for soft constraints" test currently only checks that a manually-constructed mock response is echoed back — it cannot fail regardless of store correctness. Replace with an assertion on what the store actually sends.

**Contract**: Keep the existing setup, but assert `staysApi.createStay` was called with a payload whose `overrideReason` field equals `'Manager approval'` (e.g. `expect(staysApi.createStay).toHaveBeenCalledWith(expect.objectContaining({ overrideReason: 'Manager approval' }))`), in place of (or in addition to, if the return-value round-trip still has value) the current `result.overrideReason` assertion.

#### 2. Bulk-assign request assertion

**File**: `src/modules/stays/store/stays.store.spec.ts`

**Intent**: `bulkAssign()` in `stays.store.ts` is a one-line pass-through (`return staysApi.bulkAssign(payload)`) — there's little store logic to test beyond "the exact request payload reaches the API unchanged." Strengthen the existing "returns bulk assignment results from API" test with that assertion so a future refactor that mutates the payload before forwarding would be caught.

**Contract**: Add `expect(staysApi.bulkAssign).toHaveBeenCalledWith({ assignments: [...] })` (matching the exact `assignments` array already built in the test) alongside the existing response-shape assertions.

### Success Criteria:

#### Automated Verification:

- Typecheck passes: `npm run typecheck`
- Lint passes: `npm run lint`
- Store tests pass: `npx vitest run src/modules/stays/store/stays.store.spec.ts`

#### Manual Verification:

- None — this phase only strengthens existing hermetic unit tests; no user-visible behavior changes.

---

## Phase 3: Component-level coverage

### Overview

Add the first component-level tests for `CreateStay.vue` and
`BulkAssign.vue`, fix the stuck-loading bug, and lock the bulk
override-wiring gap as documented, known behavior.

### Changes Required:

#### 1. Fix stuck-loading on blocked save

**File**: `src/modules/stays/views/CreateStay.vue`

**Intent**: `save()` must not leave `isSaving` stuck `true` when it returns early on a hard violation.

**Contract**: In `save()`, when `conflicts.isBlocked.value` is `true`, set `isSaving.value = false` before returning (currently it returns without resetting the flag).

#### 2. `CreateStay.vue` component tests

**File**: `src/modules/stays/views/CreateStay.spec.ts` (new)

**Intent**: Prove a hard violation blocks the actual `createStay` API call and leaves the form usable afterward (the just-fixed bug), and that a soft-only 422 response drives the override UI and attaches the reason to the retried payload.

**Contract**: Follow the mounting pattern established in `src/modules/inspection/views/InspectionMode.spec.ts` — `mount()` with an `i18n` plugin instance (`createI18n({ legacy: false, locale: 'en', messages: { en } })`), a fresh Pinia (`setActivePinia(createPinia())`), and `vi.mock` for `../api/stays.api` (matching `stays.store.spec.ts`'s mock shape), `@/modules/properties/api/properties.api`, and `@/modules/workers/api/workers.api`. Populate `workersStore.workers` and `propertiesStore.properties`/`rooms` directly on the Pinia stores after mount (same technique `InspectionMode.spec.ts` uses for `store.inspection`), select a worker/property/room via the rendered `<select>` elements' `setValue()`, then:
  - **Hard-violation case**: select a room with `availableSpots: 0`, click Save, assert `staysApi.createStay` was never called, and assert the Save button is not left in a loading state (covers the fixed bug).
  - **Soft-violation override case**: mock `staysApi.createStay` to reject once with an `AxiosError`-shaped 422 (`{ error: 'CONSTRAINT_VIOLATION', hardViolations: [], softViolations: [{ type: 'WORKER_BLACKLISTED', ... }] }`) then resolve on the next call; select a blacklisted worker, click Save, assert the override reason input becomes visible, fill it, click Save again, and assert the second `staysApi.createStay` call's payload includes the entered `overrideReason`.

#### 3. `BulkAssign.vue` component tests (locking today's gap)

**File**: `src/modules/stays/views/BulkAssign.spec.ts` (new)

**Intent**: Prove the now-fixed hard-capacity check disables bulk submission (Phase 1's fix, exercised end-to-end through the component), and lock — as documented, known behavior, not a design goal — that a soft violation never disables submission and never produces a recorded override reason in bulk mode.

**Contract**: Same mounting pattern as `CreateStay.spec.ts`. Two cases:
  - **Hard-violation case**: select 2+ workers and a room with `availableSpots: 0`, assert the submit button is disabled (`:disabled="!isValid"`).
  - **Soft-violation gap (regression lock)**: select a blacklisted worker and a room with available spots, assert the submit button is **not** disabled, click it, and assert `staysApi.bulkAssign` was called with an `assignments` array whose items carry no override-related field. Add an inline comment above this test: `// Known gap, not a bug in this test: BulkAssign has no path to record an override reason for a soft violation, unlike CreateStay.vue. See research.md and PRD Open Question 16 (roadmap S-05). Locked here, not fixed — fixing it is a product decision, not a testing one.`

### Success Criteria:

#### Automated Verification:

- Typecheck passes: `npm run typecheck`
- Lint passes: `npm run lint`
- New component tests pass: `npx vitest run src/modules/stays/views/CreateStay.spec.ts src/modules/stays/views/BulkAssign.spec.ts`
- Full unit suite still green: `npm test`

#### Manual Verification:

- In the running app, trigger a blocked single-stay creation, confirm the Save button returns to its normal (non-loading) state afterward.
- In the running app, confirm bulk-assigning into a full room is now blocked (cross-check of Phase 1's fix at the UI layer).

---

## Phase 4: Cookbook + follow-ups

### Overview

Fold this phase's testing pattern into `test-plan.md` §6.1, and record the
three gaps found but deliberately not fixed so they aren't silently lost.

### Changes Required:

#### 1. Cookbook entry

**File**: `context/foundation/test-plan.md`

**Intent**: Replace the §6.1 placeholder ("TBD — see §3 Phase 1") with the pattern this phase established, and add the three flagged-but-unfixed gaps to §7 so future contributors see them as deliberate, not overlooked.

**Contract**: §6.1 ("Adding a unit test for the conflict engine") names: location (`src/modules/stays/composables/`, co-located `.spec.ts`), the `makeRoom`/`makeWorker` fixture pattern, the parameterized-invariant-test approach for hard-vs-soft coexistence, and points to `useConflicts.spec.ts` as the reference test. Add a short note that component-level coverage for consumers of `useConflicts` follows the `InspectionMode.spec.ts` mount pattern, referencing `CreateStay.spec.ts`/`BulkAssign.spec.ts` as the reference tests. Append three bullets to §7 ("What We Deliberately Don't Test"): bulk-assignment override recording (locked, not fixed — re-evaluate when roadmap S-05 resolves PRD Open Question 16), `ConflictBanner`'s dead `override` emit (no behavior to test; dead code, not a testing gap), and `overrideReason`'s free-text shape vs. CLAUDE.md's localized-reason-code preference (data-model decision, out of scope). Each bullet cites this change (`testing-conflict-engine-correctness`, 2026-09-12) as its source.

### Success Criteria:

#### Automated Verification:

- `test -f context/foundation/test-plan.md` (no automated check beyond file existence — this is a documentation update)

#### Manual Verification:

- §6.1 and §7 read clearly and accurately reflect what this phase shipped.

---

## Testing Strategy

### Unit Tests:

- All 7 violation types (composable level), including the newly-fixed bulk capacity case.
- Hard-violation persistence when a coexisting soft violation is present (all 4 hard types, parameterized).
- Store-level request-payload assertions replacing the two mirror tests.

### Integration Tests:

- None in this phase — the client/server-divergence gap is explicitly deferred to `test-plan.md` §3 Phase 2 (live-API journey).

### Manual Testing Steps:

1. Attempt to bulk-assign workers into a full room; confirm it's now blocked.
2. Trigger a blocked single-stay save; confirm the Save button doesn't stay stuck loading.
3. Trigger a soft-violation single-stay save; confirm the override flow still works end-to-end.

## Performance Considerations

None — this phase adds test files and two small logic fixes; no runtime performance impact.

## Migration Notes

Not applicable — pre-production system, no live data.

## References

- Research: `context/changes/testing-conflict-engine-correctness/research.md`
- Rollout source: `context/foundation/test-plan.md` §3 Phase 1
- Reference component-test pattern: `src/modules/inspection/views/InspectionMode.spec.ts`

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Composable correctness

#### Automated

- [x] 1.1 Typecheck passes: `npm run typecheck` — 2c67441
- [x] 1.2 Lint passes: `npm run lint` — 2c67441
- [x] 1.3 Composable tests pass: `npx vitest run src/modules/stays/composables/useConflicts.spec.ts` — 2c67441

#### Manual

- [x] 1.4 Bulk-assigning into a full room is now blocked in the running app — 2c67441

### Phase 2: Store behavioral tests

#### Automated

- [x] 2.1 Typecheck passes: `npm run typecheck`
- [x] 2.2 Lint passes: `npm run lint`
- [x] 2.3 Store tests pass: `npx vitest run src/modules/stays/store/stays.store.spec.ts`

### Phase 3: Component-level coverage

#### Automated

- [ ] 3.1 Typecheck passes: `npm run typecheck`
- [ ] 3.2 Lint passes: `npm run lint`
- [ ] 3.3 New component tests pass: `npx vitest run src/modules/stays/views/CreateStay.spec.ts src/modules/stays/views/BulkAssign.spec.ts`
- [ ] 3.4 Full unit suite still green: `npm test`

#### Manual

- [ ] 3.5 Save button returns to normal state after a blocked single-stay creation
- [ ] 3.6 Bulk-assignment blocking re-confirmed at the UI layer

### Phase 4: Cookbook + follow-ups

#### Automated

- [ ] 4.1 `test -f context/foundation/test-plan.md`

#### Manual

- [ ] 4.2 §6.1 and §7 read clearly and accurately reflect what this phase shipped
