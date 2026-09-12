---
date: 2026-09-12T13:55:18+0000
researcher: Claude (Sonnet 5)
git_commit: 97ecff7a28eecaac417ad1f5e9da2b188f66b3a7
branch: main
repository: beduno-app/beduno-fe
topic: "Ground rollout Phase 2 of test-plan.md — Risk #2: proving Arrival/Nightly/Inspection Day against the live beduno-be API"
tags: [research, codebase, e2e, arrivals, inhouse, inspection, playwright]
status: complete
last_updated: 2026-09-12
last_updated_by: Claude (Sonnet 5)
---

# Research: Live-journey proof against beduno-be (test-plan Rollout Phase 2, Risk #2)

**Date**: 2026-09-12T13:55:18+0000
**Researcher**: Claude (Sonnet 5)
**Git Commit**: 97ecff7a28eecaac417ad1f5e9da2b188f66b3a7
**Branch**: main
**Repository**: beduno-app/beduno-fe

> Local `main` is ahead of `origin/main` (not yet pushed) — code references below use local `path:line` citations rather than GitHub permalinks, which would 404 against an unpushed commit.

## Research Question

Ground `context/foundation/test-plan.md` Rollout Phase 2 ("Live-journey proof against beduno-be") against Risk #2: *a slice that "already works" in code gets waved through without proof against the live API, and the first real SPA↔API disagreement surfaces with the pilot agency instead of in CI.* Verify the response guidance, identify the real failure path for each of the three journeys (Arrival Day, Nightly List, Inspection Day), assess reusability of the F-03 authenticated harness, and flag the cheapest useful test layer per journey.

## Summary

Risk #2 is confirmed real and concrete for all three journeys, each with a **different** failure shape — this is not one generic risk, it's three:

1. **Arrival Day** is the cheapest and safest to prove first. The check-in flow is a single sequential call, has a headless-friendly manual-ID fallback (no camera mocking needed), and the F-03 harness's auth setup is directly reusable. The real risk: `ArrivalStay`'s nested `worker`/`property`/`room` fields are typed **non-nullable** with zero optional chaining in the template — a partially-hydrated live response won't render wrong, it will **crash**. An actual pagination-field-naming inconsistency (`page` vs `number`) already exists between two mocked fixtures in this codebase today, evidence that the "mock matches the type, not the API" gap is not hypothetical.
2. **Nightly List**'s riskiest surface (`occupants[]` empty) fails **silently**, not loudly — every room renders as "empty" with no error state if the live API doesn't populate it, which is the worst failure mode for a 6am front-desk shift handover. Separately, **bulk checkout has zero UI wiring** — it cannot be E2E-tested at all today; that's a build gap (FR-015), not a testing gap.
3. **Inspection Day** is the most expensive and riskiest to test as-is: it's a multi-step, server-state-keyed flow (start → N sequential room calls → complete) with **no delete/cancel/abandon endpoint**. A test that fails mid-walk leaves orphaned server-side state with no client-exposed cleanup path — a real test-independence risk the project's own E2E rules (unique ids, standalone tests) don't have an answer for yet without backend cooperation.

All three journeys remain blocked from actually *running* against live data until the team provisions `E2E_TEST_EMAIL`/`E2E_TEST_PASSWORD` (confirmed still absent via `gh secret list` on 2026-09-12) — the same prerequisite F-03 already named. Research and planning can proceed regardless.

## Detailed Findings

### Arrival Day (`src/modules/arrivals/`)

- `arrivals.api.ts:11-25` — 4 endpoints: `getArrivals` (`GET /stays?status=EXPECTED_TODAY`), `checkIn` (`POST /stays/{id}/check-in`), `noShow`, `move`. Both check-in UI paths (direct row button, and the QR panel's manual-ID fallback) converge on `store.checkIn(stayId, payload)` → `arrivals.store.ts:70-84`, which replaces the whole row object with whatever the API returns (`updateStayInList`).
- **The manual-ID fallback input in `QrCheckin.vue` renders outside the camera-permission branch** — it's reachable headlessly without mocking `getUserMedia`, making it the practical E2E entry point instead of QR (camera hardware isn't available in CI).
- `arrival.types.ts` types `worker`/`property`/`room` as required, non-nullable nested objects, and `ArrivalRow.vue` dereferences them directly (`arrival.worker.lastName`, `arrival.room.roomNumber`) with no optional chaining anywhere. `/stays?status=EXPECTED_TODAY` is one of the three endpoints that 500'd until 2026-09-10 (per roadmap S-01) — if the live payload is partially hydrated, this is a render **crash**, not a wrong-looking row.
- **A real, already-present shape drift**: `ArrivalsToday.spec.ts:20` mocks the properties API response with a field named `number: 0`, while `PaginatedResponse.page` (the type the store actually reads) is named `page`. This is direct evidence — not speculation — that hand-mirrored test fixtures in this codebase have already drifted from their own declared types once, unnoticed, because nothing exercises them against a real backend.
- Existing store/component tests (`arrivals.store.spec.ts`, `ArrivalRow.spec.ts`, `ArrivalsToday.spec.ts`) all hand-construct `ArrivalStay`/`PaginatedResponse` fixtures matching the frontend types verbatim — a textbook mirror; they prove internal consistency, not that `beduno-be` returns that shape.

### Nightly List (`src/modules/inhouse/`)

- `inhouse.api.ts:12-30` — 5 endpoints. **`bulkCheckout` (`POST /stays/bulk-checkout`) is confirmed dead code**: grep across `src/` finds only its type declaration and the API method itself — no store wrapper, no component call site, no UI element (no checkbox, no "select all", no bulk button anywhere in `RoomCard.vue`/`UnassignedWorkers.vue`/`InHouseView.vue`). This matches the roadmap's "wiring job rather than a build" framing for FR-015, but sharper: there is currently **no way to E2E-test bulk checkout through the UI at all** — building the UI is a prerequisite this testing phase cannot route around.
- Single checkout: `RoomCard.vue` emits `check-out` → `InHouseView.vue:29-37 handleCheckOut` (behind a native `confirm()` dialog) → `store.checkOut(stayId)` → `inhouse.api.ts:16-17`.
- The roadmap's stated unknown ("`Room.currentOccupancy`") is a **red herring in its literal phrasing**: `currentOccupancy` doesn't exist on the `RoomSummary` type this screen actually uses (it exists on an unrelated, same-named type used only by `PropertyList.vue`/`PropertyDetail.vue`). The real at-risk field is **`occupants[]`**, which `RoomCard.vue` renders directly (`room.occupants.length`, `v-for="occ in room.occupants"`).
- **Failure mode is silent, not loud**: if `occupants[]` comes back empty, `RoomCard.vue`'s `v-if="room.occupants.length"` falls through to an "empty room" message — no error, no crash, no offline banner. Every room in the property would render as vacant while a separately-sourced summary stat might still show a nonzero total, contradicting the room list. This is exactly the guardrail scenario the PRD names ("the nightly count is wrong") and is worse than a crash because nothing signals failure.
- `InHouseView.spec.ts` fully mocks the API and hand-builds `occupants[]` already populated in its fixtures — it cannot catch this risk by construction.

### Inspection Day (`src/modules/inspection/`)

- `inspection.api.ts` — 7 endpoints, all confirmed real (matching what `InspectionMode.spec.ts`'s mock already assumed): `start`, `get`, `markPresence`, `addUnexpected`, `verifyRoom`, `complete`, `exportReport`.
- This is a genuinely **multi-step, server-state-dependent flow**: `start` mints a server-side inspection id; every subsequent call (`markPresence`, `addUnexpected`, `verifyRoom`, `complete`) is keyed by that id and replaces the entire client-side `inspection` object with the server's response. A realistic walkthrough is 5–15+ sequential round trips for one inspection.
- **No delete/cancel/abandon endpoint exists.** If an E2E test starts a real inspection against the live API and fails before `complete`, the property is left with an open, orphaned inspection with no client-exposed way to remove it. Whether this blocks a subsequent test run depends on backend business rules not visible from the frontend (e.g., disallowing a second concurrent open inspection per property is a plausible and common pattern). This is a real conflict with the project's own E2E rule requiring test independence via unique ids (`.claude/rules/10x-m3l4.md`) — the current API surface gives no way to satisfy it for this journey without backend cooperation or a dedicated disposable test property.
- `handleComplete` triggers a native `confirm()` dialog — an E2E-specific fragility point (`page.on('dialog', ...)`) that the unit test never exercises (jsdom doesn't stub `confirm` by default).
- `InspectionMode.spec.ts` is the thinnest of the three existing test files: **every mocked API method is a bare `vi.fn()` with no configured resolved value**, and every test sets `store.inspection` directly rather than driving the store's own actions — it never exercises the real call chain, request shapes, or response handling at all. It gives no oracle whatsoever for what the live request/response bodies should look like.

## Code References

- `src/modules/arrivals/api/arrivals.api.ts:11-25` — 4 endpoints
- `src/modules/arrivals/store/arrivals.store.ts:70-84` — `checkIn` action, whole-row replace on response
- `src/modules/arrivals/components/QrCheckin.vue` — manual-ID fallback input (headless-testable path)
- `src/modules/arrivals/types/arrival.types.ts` — non-nullable nested `worker`/`property`/`room`
- `src/modules/arrivals/views/ArrivalsToday.spec.ts:20` — `number: 0` vs. `PaginatedResponse.page` drift
- `src/modules/inhouse/api/inhouse.api.ts:12-30` — 5 endpoints, `bulkCheckout` dead code confirmed
- `src/modules/inhouse/components/RoomCard.vue` — `occupants[]` render, empty-room silent fallback
- `src/modules/inspection/api/inspection.api.ts` — 7 endpoints, no delete/cancel
- `src/modules/inspection/store/inspection.store.ts` — sequential id-keyed calls, whole-object replace
- `src/shared/services/actionQueue.ts:8` — `QueuedActionType` confirms inspection is absent from the offline queue
- `e2e/smoke.spec.ts` — the one existing real-journey pattern: separates error-state from success-state assertions rather than asserting a specific fixture row, avoiding a brittle oracle
- `e2e/auth.setup.ts` — reusable auth harness; requires `E2E_TEST_EMAIL`/`E2E_TEST_PASSWORD` (still unset)
- `e2e/checkin.spec.ts`, `e2e/exports.spec.ts`, `e2e/inspection.spec.ts` — all guard-only today, to be extended or replaced per journey

## Architecture Insights

- Every mutating store action across all three modules follows the same pattern: call the API, then replace the entire client-side object/array element with the server's response verbatim. This means a live-API test's assertions should target **observable UI state after the replace**, not intermediate optimistic state — matching `smoke.spec.ts`'s existing pattern of asserting a genuine post-load condition rather than a specific fixture.
- The F-03 authenticated harness (`playwright.config.ts`'s `chromium-authenticated`/`Mobile Chrome-authenticated` projects + `auth.setup.ts`) is directly reusable for all three journeys — nothing journey-specific is baked into the auth setup. New specs just need to be added under the existing `AUTHENTICATED_SPECS` `testMatch` pattern (currently scoped to `smoke.spec.ts` only) or a new pattern extending it.
- The three journeys sit at three different points on a cost/risk curve: Arrival Day (cheap, single-call, crash-risk on bad shape) < Nightly List (cheap-to-check-but-can't-test-bulk, silent-failure-risk) < Inspection Day (expensive multi-step flow, no-cleanup-risk). This is a real, evidence-backed sequencing signal for `/10x-plan`, not a guess.

## Historical Context (from prior changes)

- `context/changes/testing-conflict-engine-correctness/` (rollout Phase 1, complete) — established the pattern of fixing a genuine bug found during research/planning rather than only testing around it, and of explicitly locking (not fixing) gaps that are product decisions rather than logic bugs. The same discipline applies here: the `bulkCheckout` dead-code gap and the Inspection cleanup gap are **not** bugs this testing phase should silently work around by inventing scope — they're blockers for `/10x-plan` to name explicitly.
- `context/changes/live-api-e2e-harness/` (roadmap F-03, merged) — built the authenticated harness and `smoke.spec.ts` this phase extends. Its `research.md`/`plan.md` (referenced in `test-plan.md` §3 Phase 2's original framing) already anticipated exactly this follow-on work.

## Related Research

- `context/changes/testing-conflict-engine-correctness/research.md` — prior rollout phase, no direct technical overlap but shares the "verify the response guidance, don't blindly accept it" methodology.

## Open Questions

1. **Scope decision for `/10x-plan`**: should this phase cover all three journeys in one change, or split into per-journey sub-phases/changes given how differently sized and risky they are (Arrival Day is nearly free; Inspection Day needs a cleanup strategy decided first)? Research surfaces the size/risk asymmetry; the sequencing/splitting decision belongs to planning.
2. **Inspection Day test-independence strategy** — unresolved without backend input: does `beduno-be` allow multiple concurrent open inspections per property (in which case orphaned test inspections are harmless clutter), or does it enforce single-active-inspection (in which case a failed test run could block all future runs against that property)? This needs an answer — from backend docs, a backend teammate, or an exploratory manual test against the live API — before Inspection Day's E2E test can be planned safely. Flagging as blocking for that specific journey, not for Arrival Day or Nightly List.
3. **Bulk checkout (FR-015)** has no UI at all — out of this testing phase's scope entirely (it is a build task, not a test-writing task). Should not be silently dropped from the rollout; it belongs on `test-plan.md` §7 or as a roadmap note that FR-015 needs UI work before S-02 can be considered "proven."
4. Whether `PaginatedResponse`'s `page` vs. `number` field-naming drift found in `ArrivalsToday.spec.ts:20` is itself a live bug (i.e., does the real API actually return `number` and the type is wrong, or is the test fixture simply sloppy) was not resolved in this pass — it's evidence of the general risk, not itself in scope to fix here, but worth a one-line flag back to `/10x-plan`.
