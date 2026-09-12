---
date: 2026-09-11T17:51:32+0000
researcher: Claude (Sonnet 5)
git_commit: c5529ab8286a352d06913d1d28b0330e3063346d
branch: main
repository: beduno-app/beduno-fe
topic: "Ground rollout Phase 1 of test-plan.md — Risk #1: conflict engine hard/soft violation classification"
tags: [research, codebase, stays, conflict-engine, useConflicts, testing]
status: complete
last_updated: 2026-09-11
last_updated_by: Claude (Sonnet 5)
---

# Research: Conflict-engine correctness (test-plan Rollout Phase 1, Risk #1)

**Date**: 2026-09-11T17:51:32+0000
**Researcher**: Claude (Sonnet 5)
**Git Commit**: c5529ab8286a352d06913d1d28b0330e3063346d
**Branch**: main
**Repository**: beduno-app/beduno-fe

## Research Question

Ground `context/foundation/test-plan.md` Rollout Phase 1 ("Conflict-engine
correctness") against Risk #1: *the conflict engine admits an assignment
reality can't honour — a hard violation wrongly classified as passable or
soft-overridden.* Verify the response guidance ("prove a hard violation is
rejected regardless of override attempts; prove a soft violation is
admitted only with a recorded override"), locate the real failure path,
find existing tests, and identify the cheapest useful test layer.

## Summary

The response guidance's specific hypothesis — *a hard violation can be
bypassed by an override flag* — **does not match the code**. There is no
override parameter anywhere in the hard-check functions
(`checkCapacity`/`checkRoomBlocked`/`checkPropertyBlocked`/`checkDoubleBooking`);
they cannot be short-circuited by an override today. The real risk is
different and, in one place, worse than the PRD's framing: **overrides are
inconsistently wired across the two entry points**. `CreateStay.vue` has a
working (if untested) override flow — a soft-only violation triggers a
reason input, and the reason is sent to the API. `BulkAssign.vue` has
**none** — it gates the submit button on hard violations exactly like
`CreateStay.vue`, but never reads `conflicts` state at submit time and
never attaches an override reason to the bulk payload at all. On top of
that, `ConflictBanner.vue` emits an `override` event that **no parent
component listens to** — dead wiring, present in both flows.

All 7 violation types have unit-level coverage in `useConflicts.spec.ts`,
but two of the three existing "override" tests in `stays.store.spec.ts`
are oracle-problem mirrors: they hand-construct a mocked API response
containing the exact value the test then asserts back, so they cannot fail
regardless of real logic correctness. No test anywhere asserts the
specific behavior the response guidance asked for (hard violation
survives an override attempt), and no test exercises the component-level
override wiring at all — that layer has zero tests today.

The classification logic (`useConflicts.ts`) is a pure client-side
pre-check; the backend independently computes and returns its own verdict
(`ConstraintViolationResponse`). A unit test on the composable alone proves
the client pre-check's logic, not real enforcement — the actual risk this
phase should also cover is **client/server verdict divergence**, not just
client-side classification correctness.

## Detailed Findings

### Hard/soft classification (client-side pre-check)

`useConflicts()` exposes `validate(input): boolean` and
`validateBulk(workers, room, propertyStatus): boolean`
([useConflicts.ts#L116-L152](https://github.com/beduno-app/beduno-fe/blob/c5529ab8286a352d06913d1d28b0330e3063346d/src/modules/stays/composables/useConflicts.ts#L116-L152)).
Neither takes an override parameter. Both return a boolean derived
**only** from `hardViolations` — soft violations never affect the return
value; that is the mechanism that makes "soft" mean "non-blocking."

Violation types and classification:

| Type | Hard/Soft | Trigger |
|---|---|---|
| `CAPACITY_EXCEEDED` | Hard | `room.availableSpots <= 0` |
| `ROOM_BLOCKED` | Hard | `room.status === 'BLOCKED'` |
| `PROPERTY_BLOCKED` | Hard | `propertyStatus === 'INACTIVE'` |
| `DOUBLE_BOOKING` | Hard | `worker.currentStay` is set |
| `GENDER_MISMATCH` | Soft | `worker.gender` mismatches `room.genderRule` (unless room is `MIXED` or worker is `OTHER`) |
| `WORKER_BLACKLISTED` | Soft | `worker.status === 'BLACKLISTED'` |
| `OVER_PLANNED` | Soft, bulk-only | `room.availableSpots < additionalWorkers` |

Classification is structural (which helper — `addHard` vs `addSoft` — is
called), not a runtime flag checked against an override
([useConflicts.ts, hard-check functions](https://github.com/beduno-app/beduno-fe/blob/c5529ab8286a352d06913d1d28b0330e3063346d/src/modules/stays/composables/useConflicts.ts#L34-L91)).
**No conditional in any hard-check function reads an override value before
calling `addHard`** — confirmed by direct inspection, not inference.

### Override mechanism is a free-text field, and only wired for single-create

`Stay.overrideReason: string | null` and
`StayCreatePayload.overrideReason?: string`
([stay.types.ts#L45](https://github.com/beduno-app/beduno-fe/blob/c5529ab8286a352d06913d1d28b0330e3063346d/src/modules/stays/types/stay.types.ts#L45),
[#L58](https://github.com/beduno-app/beduno-fe/blob/c5529ab8286a352d06913d1d28b0330e3063346d/src/modules/stays/types/stay.types.ts#L58))
— a free-text reason, not a boolean flag and not a localized reason code
(CLAUDE.md's stated preference for operational flows).

- **`CreateStay.vue`**: `save()` blocks on `conflicts.isBlocked.value`
  (hard violations only). On a 422 `CONSTRAINT_VIOLATION` response
  containing only soft violations, `showOverride` becomes true, a reason
  input renders (lines ~216-224), and retry attaches
  `payload.overrideReason` to the create request.
- **`BulkAssign.vue`**: `conflicts.validateBulk(...)` gates the submit
  button the same way, but `submit()` never reads `conflicts` and never
  attaches any override field — `BulkAssignPayload`/`bulkAssign` has no
  override field at all. **A soft violation in a bulk assignment can never
  be recorded with a reason — there is no code path for it.** This is
  sharper than the PRD's Cluster E framing (US-06: "every override is
  recorded ... and no one reads them") — for bulk assignment, today,
  nothing is recorded at all.
- **`ConflictBanner.vue`** emits an `override` event with a `reason:
  string`, but neither `CreateStay.vue` nor `BulkAssign.vue` listens for
  it (`@override` binding not found in either usage). `CreateStay.vue`'s
  actual override input is a separate, unrelated local ref — the
  component's own override affordance is dead code in both places it's
  used.

### Audit trail for overrides

`src/modules/audit/` is a pure read surface — `audit.api.ts` exposes only
`getEvents`/`getEntityEvents` (`api.get` only, no `post`/`put`/`patch`
anywhere in the module). No frontend code writes an audit entry when an
override is applied; if one is written, it happens server-side. The
`AuditAction` union has no dedicated `OVERRIDE` value (closest are
`CREATE`/`UPDATE`/`MOVE`/`BULK_ASSIGN`) — from the frontend alone, an
override cannot be distinguished from an ordinary create/update in the
audit log, which matters for Risk #6 (soft-override governance) even
though that risk is out of scope for this phase.

### Client-side pre-check vs. server-side enforcement

`ConstraintViolationResponse` (`allowed: boolean`, `hardViolations`,
`softViolations`) and `setServerViolations()`
([useConflicts.ts#L154-L157](https://github.com/beduno-app/beduno-fe/blob/c5529ab8286a352d06913d1d28b0330e3063346d/src/modules/stays/composables/useConflicts.ts#L154-L157))
show the backend computes its own independent verdict and can overwrite
the client's. Nothing in the composable or the two views blocks the actual
API call based on the client-computed boolean alone in a way that removes
server-side enforcement — the client check is a UX layer. **A pure unit
test on `useConflicts.ts` proves the pre-check's internal logic; it does
not prove a hard violation is actually rejected end-to-end.** That
end-to-end proof needs at minimum an integration-level test around
`stays.store.ts` with a realistic mocked 422, or (cheaper, and more
aligned with cost×signal) a documented scope decision that this phase
proves the client pre-check only, deferring server-contract verification
to the live-API rollout phase (test-plan §3 Phase 2, which already targets
Risk #2 against `beduno-be`).

### Existing test coverage

All 7 violation types have at least one test in
`useConflicts.spec.ts` (happy-path and one negative case each; `checkGender`
has 5 cases including `OTHER` gender and `MIXED` room edge cases). Coverage
gaps:

1. **No test asserts a hard violation persists despite an override
   attempt** — the exact assertion the response guidance asked for does
   not exist (and, per the finding above, there is no override parameter
   to even attempt this with today — a future regression that adds one
   would go uncaught).
2. **No test asserts a soft violation, once overridden, is meaningfully
   recorded.** The closest test,
   `stays.store.spec.ts` "creates stay with override reason for soft
   constraints", hand-constructs the mocked API response with
   `overrideReason: 'Manager approval'` already set, then asserts it comes
   back unchanged — an oracle-problem mirror that cannot fail regardless
   of real logic. The `bulkAssign()` store test has the same shape.
3. **Zero component-level tests exist for `CreateStay.vue` or
   `BulkAssign.vue`** — no spec file for either. The override-wiring gap
   found above (dead `ConflictBanner` event, missing bulk override path)
   is entirely untested because nothing tests the components that own
   that wiring.
4. Reusable fixtures: `makeRoom`/`makeWorker` in `useConflicts.spec.ts`,
   `makeStay` in `stays.store.spec.ts`, the `vi.mock('../api/stays.api',
   ...)` pattern, and the Pinia bootstrap (`setActivePinia(createPinia())`
   in `beforeEach`) — a new test should extend these rather than
   reinventing fixtures.

## Code References

- [`src/modules/stays/composables/useConflicts.ts#L12-L157`](https://github.com/beduno-app/beduno-fe/blob/c5529ab8286a352d06913d1d28b0330e3063346d/src/modules/stays/composables/useConflicts.ts#L12-L157) — entry points, all 7 violation checks, `setServerViolations`
- [`src/modules/stays/types/stay.types.ts#L45,L58,L111-L129`](https://github.com/beduno-app/beduno-fe/blob/c5529ab8286a352d06913d1d28b0330e3063346d/src/modules/stays/types/stay.types.ts#L45) — `overrideReason` fields, `HardConstraintType`/`SoftConstraintType`, `ConstraintViolationResponse`
- [`src/modules/stays/views/CreateStay.vue`](https://github.com/beduno-app/beduno-fe/blob/c5529ab8286a352d06913d1d28b0330e3063346d/src/modules/stays/views/CreateStay.vue) — working override flow, ~lines 54-96, 216-224
- [`src/modules/stays/views/BulkAssign.vue`](https://github.com/beduno-app/beduno-fe/blob/c5529ab8286a352d06913d1d28b0330e3063346d/src/modules/stays/views/BulkAssign.vue) — no override wiring, ~lines 50-103
- [`src/modules/stays/components/ConflictBanner.vue`](https://github.com/beduno-app/beduno-fe/blob/c5529ab8286a352d06913d1d28b0330e3063346d/src/modules/stays/components/ConflictBanner.vue) — dead `override` event emit
- [`src/modules/stays/api/stays.api.ts#L12-L28`](https://github.com/beduno-app/beduno-fe/blob/c5529ab8286a352d06913d1d28b0330e3063346d/src/modules/stays/api/stays.api.ts#L12-L28) — `createStay`/`updateStay`/`bulkAssign` pass-through
- [`src/modules/audit/api/audit.api.ts`](https://github.com/beduno-app/beduno-fe/blob/c5529ab8286a352d06913d1d28b0330e3063346d/src/modules/audit/api/audit.api.ts) — read-only surface, no client-side audit writes
- [`src/modules/stays/composables/useConflicts.spec.ts`](https://github.com/beduno-app/beduno-fe/blob/c5529ab8286a352d06913d1d28b0330e3063346d/src/modules/stays/composables/useConflicts.spec.ts) — existing coverage, `makeRoom`/`makeWorker` fixtures
- [`src/modules/stays/store/stays.store.spec.ts#L78-L93`](https://github.com/beduno-app/beduno-fe/blob/c5529ab8286a352d06913d1d28b0330e3063346d/src/modules/stays/store/stays.store.spec.ts#L78-L93) — oracle-problem mirror test on override reason

## Architecture Insights

- Hard/soft is a structural distinction in code (which helper is called),
  not a data-driven flag — this makes it straightforward to test
  exhaustively per type, but also means a future violation type added
  without a matching test could silently default to the wrong category.
- The composable is a client-side UX pre-check; the backend is the actual
  authority (`ConstraintViolationResponse`). Tests at this phase should be
  explicit about which layer they prove — client pre-check logic vs. real
  admissibility enforcement are different claims.
- Override handling is duplicated ad hoc per view (`CreateStay.vue` builds
  its own reason-input flow) rather than centralized in `useConflicts` or a
  shared component — `ConflictBanner.vue`'s emitted event suggests an
  intended centralization that was never finished, leaving one flow wired
  and one flow (`BulkAssign.vue`) entirely unwired.

## Historical Context (from prior changes)

No prior `context/archive/` entries exist (archive is empty — this is the
project's first test-plan rollout phase). `context/foundation/roadmap.md`
S-05 (`governed-soft-overrides`, status `ready`) is the eventual home for
resolving *whether* soft-violation overrides need friction, an approver, or
a review report (PRD Open Question 16) — this phase's tests should prove
the mechanics that exist today, not anticipate that unresolved decision.

## Related Research

None yet — first research document for this change.

## Open Questions

1. **Scope decision for `/10x-plan`**: should this phase's tests merely
   *lock and document* the current inconsistency (`BulkAssign.vue` has no
   override path; `ConflictBanner`'s event is dead) as regression-lock
   tests describing today's behavior, or should fixing that wiring be
   pulled into this phase's scope before testing it? Research surfaces
   this as a real gap, not a speculative one, but fixing it is an
   implementation decision outside this rollout phase's stated goal
   ("prove hard/soft classification," not "fix override wiring"). Flagging
   for `/10x-plan` to decide explicitly rather than silently picking one.
2. Does the eventual test suite need an integration-level assertion
   (mocked 422 → store handling) to close the "client pre-check ≠ server
   enforcement" gap, or is that fully deferred to test-plan §3 Phase 2
   (live-API journey proof, Risk #2)? Recommend deferring, but naming it
   explicitly in the plan so it isn't silently dropped.
3. No `Room`/`Worker` shape mismatch between the client's assumed fields
   (`availableSpots`, `genderRule`, `status`) and the live `beduno-be`
   response was checked in this pass — that's Risk #2's territory
   (`arrivals.api.ts` 500s until 2026-09-10 already flagged in the
   roadmap), not this phase's.
