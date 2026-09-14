# Plan: Prove the full stay lifecycle against the live API

## Context

`testing-live-journey-beduno-be` (implemented, closed 2026-09-14) proved Arrival Day,
Nightly List, and Inspection Day each in isolation — but every one of those specs assumes
its precondition already exists on the live pilot account:

- `arrival-day.spec.ts` requires `E2E_ARRIVAL_WORKER_ID` to already have an `EXPECTED_TODAY`
  stay.
- `nightly-list.spec.ts` requires `E2E_OCCUPIED_ROOM_NUMBER` to already be occupied.

Nothing proves the app's own `/stays/new` creation flow actually produces a stay that
flows correctly downstream — i.e., that "add a stay" → "check in" → "check out" is one
working loop, not three independently-true fragments stitched together by fixture data
that was set up by hand (or by a previous test run) rather than by the app itself.

This plan adds one continuous journey: create → check in → check out → verify occupancy,
driven by a single authenticated session, exercising `/stays/new`, `/ops/arrivals`,
`/ops/in-house`, and `GET /properties/{id}/occupancy` against the real beduno-be API.

## Key discoveries (2026-09-14 session)

- **Role reachability**: `/stays/new` route meta allows
  `['AGENCY_ADMIN', 'AGENCY_PLANNER', 'PROPERTY_ADMIN']`
  (`src/app/router/index.ts:130-134`); `/ops/arrivals` and `/ops/in-house` allow
  `['PROPERTY_ADMIN', 'FRONT_DESK']` (`src/app/router/index.ts:28-30`). `PROPERTY_ADMIN`
  is the only role in both sets — one storageState can drive the whole journey **only if**
  the pilot E2E account is provisioned as `PROPERTY_ADMIN`, not `FRONT_DESK`. Since the
  account doesn't exist yet (still blocked — see below), this plan specifies that
  requirement rather than working around an already-fixed choice.
- **Occupancy endpoint**: `/ops/in-house` (`InHouseView.vue`) reads
  `GET /properties/{id}/occupancy` via `inhouseApi.getOccupancy()`
  (`src/modules/inhouse/api/inhouse.api.ts:6-9`) — a *different* endpoint from
  `RoomResponse.currentOccupancy`/`occupants[]` returned by
  `GET /properties/{id}/rooms` (used by `PropertyDetail.vue`/`RoomManagement.vue`).
  `nightly-list.spec.ts` already proves the `/occupancy` endpoint's shape is real
  (`getByTestId('room-card')` / `'room-number'` / `'occupant'`, from
  `RoomCard.vue:44,51,68`) for a *pre-existing* occupant. This plan reuses those same
  testid locators but proves the occupant count is produced by the app's own check-in,
  not assumed from a fixture, and that it returns to zero after check-out.
- **`RoomResponse.currentOccupancy`/`occupants[]`** (the separate `/rooms` endpoint) is
  confirmed present in the current `openapi.yaml` snapshot (lines 1764-1804) — the
  roadmap's "typed but not backend-implemented" note is stale. Not re-verified by this
  plan (out of scope — `/occupancy` is the cheaper, already-proven-shape endpoint for the
  same underlying risk; re-proving both endpoints for one risk is redundant per the E2E
  test budget).
- **Worker select** in `CreateStay.vue` is a native `<select>` bound to `form.workerId`
  with `:value="w.id"` (the worker's UUID, not `internalId`) — a *different* identifier
  shape from `E2E_ARRIVAL_WORKER_ID` (documented as an `internalId` in
  `arrival-day.spec.ts`). This plan introduces its own env var, `E2E_LIFECYCLE_WORKER_ID`,
  holding the worker's UUID, to avoid silently conflating the two.
- **`dateTo` is optional** on `StayCreatePayload` (`stay.types.ts:28-37`) — the test only
  fills `dateFrom` (today, via the established `new Date().toISOString().slice(0, 10)`
  convention) to produce an open-ended stay.

## What we're NOT doing

- Not re-verifying `RoomResponse.currentOccupancy`/`occupants[]` (the `/rooms` endpoint) —
  `/occupancy` already covers the same underlying risk more cheaply.
- Not testing `StayDetail.vue`, `BulkAssign.vue`, or the `move` action — out of scope for
  this journey.
- Not adding a new authenticated Playwright project or a second storageState — this plan
  assumes the single pilot account is (or will be provisioned as) `PROPERTY_ADMIN`. If that
  turns out not to hold, this plan's Phase 1 success criteria will fail loudly at the
  `/stays/new` navigation step, which is itself useful signal.

## Phase 1: Stay lifecycle e2e spec

### Overview

Add `e2e/stay-lifecycle.spec.ts`: a single Playwright test that creates a stay via the UI,
checks it in, checks it out, and asserts the room's occupant count reflects both
transitions — all against the real beduno-be API, all under the existing authenticated
Playwright harness.

### Changes Required

**`e2e/stay-lifecycle.spec.ts`** (new file)

- Requires `E2E_LIFECYCLE_WORKER_ID` (worker UUID, no active stay) and picks the first
  property/room from the live dropdowns (`selectOption({ index: 1 })`, matching the
  established convention in the other three live specs) — throws a clear setup error if
  the env var is missing, matching `arrival-day.spec.ts`'s pattern.
- Step 1 — **Create**: `page.goto('/stays/new')`; select worker by UUID
  (`selectOption(workerId)`), property + room by index; fill `dateFrom` = today; submit;
  `waitForResponse` on `POST /stays`; capture the selected room's number from the room
  `<select>`'s checked option text (`option:checked` — reading the already-selected value,
  not locating an actionable element) for later steps.
- Step 2 — **Baseline**: `page.goto('/ops/in-house')`; select the same property; find the
  `room-card` (`getByTestId`) matching the captured room number, and record its current
  `occupant` count *before* check-in. The stay is `EXPECTED_TODAY` at this point, not yet
  `CHECKED_IN`, so it must not already be counted — using a captured baseline (rather than
  assuming 0) means the test works correctly even if the room already had other real
  occupants.
- Step 3 — **Check in**: `page.goto('/ops/arrivals')`; select the same property; use the
  manual-ID fallback (`'Skanuj QR'` → fill internal ID → `'Potwierdź'`), matching
  `arrival-day.spec.ts`'s established pattern; assert the `'Zameldowano pomyślnie.'` toast.
  (Needs the worker's `internalId` too — `E2E_LIFECYCLE_WORKER_INTERNAL_ID` — since the
  manual-ID field takes `internalId`, not the UUID used at creation.)
- Step 4 — **Verify occupied**: back on `/ops/in-house`, assert the same room card's
  `occupant` count equals `baseline + 1` — a delta assertion, not a bare "nonzero" one:
  it fails just as reliably whether check-in silently no-ops *or* whether the room already
  had an unrelated occupant making a "nonzero" check pass for the wrong reason. (Caught and
  fixed during generation: an earlier draft asserted the post-checkout occupant list didn't
  contain the worker's `internalId` — but `RoomCard.vue` never renders `internalId`, only
  `lastName`/`firstName`, so that assertion would have passed unconditionally regardless of
  whether check-out worked. Replaced with the count-delta approach throughout.)
- Step 5 — **Check out**: from the same room card, click `'Wymelduj'`
  (`page.on('dialog', accept)` for the native confirm, matching `nightly-list.spec.ts`);
  assert the `'Wymeldowano pomyślnie.'` toast.
- Step 6 — **Verify vacated**: reload `/ops/in-house`, re-select the property; assert the
  same room card's `occupant` count is back to exactly `baseline` — the assertion that
  fails if check-out silently no-ops server-side.

**`playwright.config.ts`**

- Add `stay-lifecycle` to the `AUTHENTICATED_SPECS` regex
  (`/(smoke|arrival-day|nightly-list|inspection-day|stay-lifecycle)\.spec\.ts$/`) so it
  runs under the authenticated projects with `storageState`.

### Success Criteria

#### Automated

- [ ] 1.1 `npx playwright test stay-lifecycle.spec.ts --list` resolves the spec with no
      syntax/type errors.
- [ ] 1.2 `npm run lint` and `npm run typecheck` pass with the new file included.

#### Manual

- [ ] 1.3 Once `E2E_TEST_EMAIL`/`E2E_TEST_PASSWORD` are provisioned (as `PROPERTY_ADMIN`)
      and `E2E_LIFECYCLE_WORKER_ID`/`E2E_LIFECYCLE_WORKER_INTERNAL_ID` point to a real,
      stay-free worker on the pilot property, run
      `npx playwright test stay-lifecycle.spec.ts` against the live API and confirm it
      passes end-to-end (or, if it fails on a shape/role mismatch, that itself confirms a
      real risk — open a follow-up rather than blocking this phase, matching the precedent
      set in `testing-live-journey-beduno-be`).
- [ ] 1.4 Deliberate-break check (per `/10x-e2e`'s VERIFY step): temporarily point the
      occupancy assertion at the wrong room, or skip the check-out click, and confirm the
      test goes red — proving the assertions actually protect the risk before trusting the
      green run.

## Progress

### Phase 1: Stay lifecycle e2e spec

#### Automated
- [x] 1.1 Spec resolves with `--list`, no syntax/type errors
- [x] 1.2 lint + typecheck pass

#### Manual
- [ ] 1.3 Run against live API once secrets + worker fixture exist and confirm pass
- [ ] 1.4 Deliberate-break check confirms the assertions actually catch a broken flow
