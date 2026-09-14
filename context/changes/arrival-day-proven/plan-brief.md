# Prove Queued Check-In Replays On Reconnect — Plan Brief

> Full plan: `context/changes/arrival-day-proven/plan.md`

## What & Why

`arrivals.store.ts` already queues an offline `CHECK_IN` and `sync.store.ts`
already replays it on reconnect — both proven at unit level with mocks. What's
never been proven is the real thing: a genuine offline browser state, a real
reconnect event, and a real HTTP round-trip against `beduno-be`. This closes
S-01's (`arrival-day-proven`) last remaining gap.

## Starting Point

`e2e/arrival-day.spec.ts` proves online check-in against the live API but
never touches offline mode — no spec in the repo does. The offline queue and
replay mechanism exist in code and pass unit tests; they've simply never been
exercised end-to-end.

## Desired End State

A new e2e spec proves: check in while offline → the action durably queues in
IndexedDB → going back online triggers a real replay → the queue drains and
the app shows a genuine success signal, distinct from the optimistic toast
that fires the same way whether queued or sent. CI actually runs it, once
secrets land.

## Key Decisions Made

| Decision | Choice | Why (1 sentence) | Source |
| --- | --- | --- | --- |
| Proof of replay | IndexedDB count + distinct sync-complete toast | The check-in's own toast fires identically online/offline — it can't prove anything; these two signals can. | Plan |
| Spec naming | `offline-arrival-day.spec.ts` (suffix-matches `AUTHENTICATED_SPECS`) | No config edit, zero risk to other specs' auth wiring. | Plan |
| Fixture strategy | Dedicated `E2E_ARRIVAL_OFFLINE_WORKER_ID` | Matches the one-var-per-journey precedent (`nightly-list`, `inspection-day`); avoids two arrival specs fighting over one worker's stay status in the same CI run. | Plan |
| Conflict handling | Hard failure, not tolerated | A conflict on a CHECK_IN replay is a real regression signal, unlike nightly-list's roster tolerance which existed for a different reason. | Plan |
| Ship now vs. wait | Ship now, manual items stay unchecked | Same precedent already applied twice this session for the identical secrets blocker. | Plan |

## Scope

**In scope:**
- New `e2e/offline-arrival-day.spec.ts`
- Fixing `ci.yml`'s dangling fixture-var wiring (affects 2 existing specs too)
- §6.3 cookbook entry for the offline/reconnect oracle pattern

**Out of scope:**
- Rejected-replay/reload-survival testing (that's rollout Phase 3, integration layer, a separate risk)
- Offline `NO_SHOW`/`MOVE` replay
- Production-build/service-worker e2e coverage
- Provisioning the actual secrets/fixture on `beduno-be`

## Architecture / Approach

One phase writes the spec and fixes the CI wiring gap together (the new
fixture var would repeat the same dead-wiring bug if fixed alone). A second,
small phase writes up the oracle pattern in the shared cookbook.

## Phases at a Glance

| Phase | What it delivers | Key risk |
| --- | --- | --- |
| 1. Offline replay e2e spec + CI env wiring | The spec itself, correct auth routing, CI actually passing the fixture vars through | The optimistic-toast gotcha, if missed, produces a spec that always passes regardless of whether replay actually worked |
| 2. Cookbook + close out | §6.3 entry documenting the oracle pattern | None — documentation only |

**Prerequisites:** None — all research questions this plan needed were resolved before writing it.
**Estimated effort:** ~1 session, 2 phases.

## Open Risks & Assumptions

- Assumes Chromium reliably dispatches a real `online` event on
  `context.setOffline(false)` — standard CDP behavior, not verified live in
  this session (can't run without secrets), but well-established.
- Assumes each Playwright test gets a fresh, empty IndexedDB (no
  cross-test `actionQueue` pollution) — standard per-test context isolation,
  not verified live for this specific store.

## Success Criteria (Summary)

- The new spec exists, is correctly picked up by the authenticated Playwright
  projects, and all automated gates (typecheck/lint/unit/discovery) pass today.
- Once secrets land, running it proves a real offline→reconnect→replay cycle
  against `beduno-be` — not just that some toast appeared.
