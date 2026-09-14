---
change_id: stay-lifecycle-e2e
title: Prove the full stay lifecycle (create -> check-in -> check-out -> occupancy) against the live API
status: new
created: 2026-09-14
updated: 2026-09-14
archived_at: null
---

## Notes

Follow-up to `testing-live-journey-beduno-be` (already implemented, closed 2026-09-14).
That change proved Arrival Day, Nightly List, and Inspection Day each in isolation, but
every spec assumes its precondition already exists on the live pilot account
(`E2E_ARRIVAL_WORKER_ID` must already be `EXPECTED_TODAY`, `E2E_OCCUPIED_ROOM_NUMBER` must
already be occupied). None of them prove the app's own `/stays/new` creation flow actually
produces a stay that flows correctly through check-in, check-out, and room occupancy.

This change closes that gap: one continuous journey — create a stay via the UI, check it in,
check it out, and verify `RoomResponse.currentOccupancy`/`occupants[]` reflects both
transitions — driven by a single authenticated session.

Also verified during scoping (2026-09-14 session): `RoomResponse` in the current `openapi.yaml`
snapshot (lines 1764-1804) genuinely carries `currentOccupancy`/`occupants[]` — the roadmap's
"typed but not backend-implemented" note is stale. This test is what turns that into proof
rather than another assumption.

Same external blocker as `testing-live-journey-beduno-be`: `E2E_TEST_EMAIL`/`E2E_TEST_PASSWORD`
repo secrets are still not provisioned (confirmed via `gh secret list`). New requirement this
change adds to that provisioning ask: the pilot account must be `PROPERTY_ADMIN` (not
`FRONT_DESK`), since `PROPERTY_ADMIN` is the only role route-permitted for both `/stays/new`
(`AGENCY_ADMIN`/`AGENCY_PLANNER`/`PROPERTY_ADMIN`) and `/ops/arrivals` + `/ops/in-house`
(`PROPERTY_ADMIN`/`FRONT_DESK`) — letting one storageState drive the whole journey. If the
already-existing arrival-day/nightly-list/inspection-day specs' pilot account turns out to be
`FRONT_DESK`-only, this journey needs its own separate storageState/account instead.
