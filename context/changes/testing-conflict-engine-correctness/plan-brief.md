# Conflict-Engine Correctness — Plan Brief

> Full plan: `context/changes/testing-conflict-engine-correctness/plan.md`
> Research: `context/changes/testing-conflict-engine-correctness/research.md`

## What & Why

Rollout Phase 1 of `context/foundation/test-plan.md`, protecting against
Risk #1 ("a worker has nowhere to sleep" — the user's own stated top fear).
Prove the conflict engine's hard/soft violation classification is correct
and stays correct, across the composable, the store, and the two views
that consume it.

## Starting Point

`useConflicts()` classifies 7 violation types as hard (blocking) or soft
(overridable). All 7 have composable-level unit tests, but two store-level
"override" tests are oracle-problem mirrors, and zero component-level tests
exist for the two views (`CreateStay.vue`, `BulkAssign.vue`) that actually
gate submission on this logic.

## Desired End State

A bulk assignment into a completely full room is blocked (it currently
isn't). A blocked single-stay Save no longer leaves the button stuck
loading. The store's override tests assert real request payloads instead
of mocked-response echoes. Both consuming views have component tests. Two
known-but-unfixed gaps (bulk has no override-recording path; a dead UI
emit) are locked and documented rather than silently left unmentioned.

## Key Decisions Made

| Decision | Choice | Why (1 sentence) | Source |
|---|---|---|---|
| Original "override bypass" hypothesis | Doesn't match the code — no such path exists | Direct code read found no override parameter in any hard-check function | Research |
| Bulk override-wiring gap (no reason ever recorded) | Lock with a regression test, don't fix | Whether bulk should support overrides is an open product question (PRD Open Question 16), not a testing decision | Plan (user-confirmed) |
| Component-level tests for `CreateStay.vue`/`BulkAssign.vue` | Add them this phase | This is exactly the layer where the real risk (inconsistent wiring) lives | Plan (user-confirmed) |
| Client/server verdict-divergence gap | Defer fully to test-plan §3 Phase 2 | Only the real `beduno-be` API can verify server-side enforcement; a mock here risks encoding the wrong shape | Plan (user-confirmed) |
| `overrideReason` free-text vs. localized reason codes | Out of scope, note only | Data-model/API-contract decision needing backend coordination | Plan (user-confirmed) |
| Two mirror tests in `stays.store.spec.ts` | Rewrite to assert real request payload | They currently can't fail regardless of store correctness | Plan (user-confirmed) |
| New hard-type invariant test structure | One parameterized test, not 4 individual blocks | Avoids near-identical test-copy anti-pattern while each row still independently catches a regression | Plan (user-confirmed) |
| `validateBulk()` missing capacity check (zero-spot room raises no violation) | Fix in this phase | Pure client-logic bug in the file already targeted, not a product decision — matches the user's #1 stated fear exactly | Plan (discovered during planning) |
| `CreateStay.vue` stuck-loading bug (`isSaving` never resets on block) | Fix in this phase | Obvious control-flow defect, uncontroversial fix, same file already in scope | Plan (discovered during planning) |

## Scope

**In scope:**
- Fix `validateBulk()`'s missing capacity check
- Lock the hard/soft classification invariant (parameterized, all 4 hard types)
- Rewrite 2 mirror tests in `stays.store.spec.ts`
- New component tests for `CreateStay.vue` and `BulkAssign.vue`
- Fix `CreateStay.vue`'s stuck-loading bug
- Lock (don't fix) `BulkAssign.vue`'s missing override-recording path
- Update `test-plan.md` §6.1 (cookbook) and §7 (negative space)

**Out of scope:**
- Wiring an override path into `BulkAssign.vue` or `ConflictBanner.vue`'s dead emit
- Migrating `overrideReason` to localized reason codes
- Any integration test against a mocked server 422
- Audit-trail changes for overrides
- E2E/Playwright specs

## Architecture / Approach

Bottom-up: composable → store → components → cookbook. Each layer's fix
and tests land before the next layer builds on it; the final phase folds
the pattern into `test-plan.md` so future contributors don't have to
rediscover it.

## Phases at a Glance

| Phase | What it delivers | Key risk |
|---|---|---|
| 1. Composable correctness | Fixes the zero-capacity bulk bug; locks hard-vs-soft invariant | Low — isolated, well-covered file |
| 2. Store behavioral tests | Replaces 2 mirror tests with real payload assertions | Low — thin pass-through logic |
| 3. Component-level coverage | New specs for both views; fixes stuck-loading bug; locks bulk gap | Medium — first component tests for this area, heavier mount setup |
| 4. Cookbook + follow-ups | Documents the pattern and the 3 deliberately-unfixed gaps | Low — documentation only |

**Prerequisites:** None — self-contained within `src/modules/stays/`.
**Estimated effort:** ~1 session across 4 phases.

## Open Risks & Assumptions

- The component-test mount pattern (Pinia store population + `<select>` interaction) is new for this module; `InspectionMode.spec.ts` is the closest existing reference but wasn't built for a form-driven flow with async retry-on-422.
- The parameterized hard-vs-soft coexistence test is a proxy for "cannot be bypassed by an override" — since no override parameter exists in the code today, this is the most honest test of that invariant reachable via the public API.

## Success Criteria (Summary)

- Bulk-assigning into a full room is blocked, not silently allowed.
- A blocked single-stay save no longer leaves the UI stuck.
- The full unit suite (`npm test`), lint, and typecheck stay green.
- Two known gaps are documented in the suite and in `test-plan.md`, not silently absent.
