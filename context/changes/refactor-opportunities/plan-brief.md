# Conflict Inbox Durability — Plan Brief

> Full plan: `context/changes/refactor-opportunities/plan.md`
> Research: `context/changes/refactor-opportunities/research.md`

## What & Why

A rejected offline action (a check-in/out/move/no-show the server refused on replay) is currently held only in an in-memory Pinia `ref` — it silently vanishes on reload with no trace, violating CLAUDE.md's "Everything is audited" rule. This is the strongest of the 6 refactor candidates the prior research ranked: a named, rated, already-triaged data-loss risk (`test-plan.md` Risk #3, High/Medium; `roadmap.md` S-07), not a speculative cleanup.

## Starting Point

`sync.store.ts`'s `conflicts` ref is populated on replay failure and simultaneously the failed action is deleted from the `actionQueue` IndexedDB store — so the in-memory ref is the *only* remaining record. `db.ts` has no `conflicts` object store. `actionQueue.ts` establishes the exact IndexedDB CRUD pattern to mirror. No test in the repo exercises real IndexedDB persistence today (everything mocks the module).

## Desired End State

The conflict survives a reload: written to a new `conflicts` IndexedDB store the moment it's detected, hydrated back into the UI on mount, and removed from both memory and IndexedDB on dismiss/clear.

## Key Decisions Made

| Decision | Choice | Why (1 sentence) | Source |
| --- | --- | --- | --- |
| Scope of this change | Candidate 1 only (+ Candidate 5 dead-code cleanup folded in) | Narrowest scope that closes the one named data-loss risk; other candidates deferred to a future change | Plan |
| IDB testing strategy | `fake-indexeddb`, real persistence in tests | Existing full-module mocks can't catch persistence bugs — the exact gap this plan closes | Plan |
| Cross-module composable design (Candidate 3) | New composables calling `*Api` directly | Recorded for a future change; not used here since Candidate 3 is out of scope | Plan (deferred) |
| `bulkCheckout` offline treatment (Candidate 4) | Queue-integrate as `BULK_CHECKOUT` | Recorded for a future change; not used here since Candidate 4 is out of scope | Plan (deferred) |
| Client-side audit event for conflict actions | Dropped — IDB persistence only | No existing client-side audit mechanism in this repo; would need a new backend endpoint | Plan |
| Roadmap S-07 prerequisite (S-01, blocked) | Proceed anyway, manual verification substitutes | S-01's E2E is externally blocked with no ETA; manual offline-toggle testing addresses the same concern | Plan |
| Storage key shape | `SyncConflict` gets a top-level `id` (= `action.id`) | Matches every other store's `keyPath: 'id'` convention; avoids a nested dot-path key | Plan |
| `dismissConflict` signature | Index-based → id-based | Index was already fragile; a stable id is needed to remove the IDB record | Plan |

## Scope

**In scope:** New `conflicts` IndexedDB store (`db.ts` v4), a `conflicts.ts` CRUD service mirroring `actionQueue.ts`, async conversion of `sync.store.ts`'s conflict handling, `fake-indexeddb`-backed test rewrite, `ConflictInbox.vue` hydration wiring, `clearQueue()` dead-code removal, manual roadmap S-07 status sync.

**Out of scope:** `ops` module placement (Candidate 2), cross-module store reach-ins (Candidate 3), inhouse/arrivals offline asymmetry (Candidate 4), `DataTable.vue` adoption (Candidate 6), any client-side audit-event mechanism, queue/replay-dispatch logic changes.

## Architecture / Approach

New `conflicts.ts` service (sibling to `actionQueue.ts`, same CRUD/promisification pattern) backs a new `conflicts` IndexedDB store. `sync.store.ts` writes to it on every detected conflict and exposes an explicit `hydrateConflicts()` action for components to call on mount — no automatic async work inside the Pinia setup-store body. `ConflictInbox.vue` calls that action and switches from index-based to id-based dismissal.

## Phases at a Glance

| Phase | What it delivers | Key risk |
| --- | --- | --- |
| 1. Test infra | `fake-indexeddb` wired into Vitest via a new setup file | None — invisible until Phase 5 |
| 2. IDB schema | `conflicts` object store, `DB_VERSION` → 4 | Migration must follow the exact existing conditional pattern |
| 3. Persistence service | `conflicts.ts` CRUD + `clearQueue()` removal | None — additive, zero-risk deletion |
| 4. Store conversion | `sync.store.ts` async conflict handling + hydration action | Breaking `dismissConflict` signature change (only consumer updated same change) |
| 5. Test rewrite | Real-IDB durability tests replacing mock-only assertions | Test pollution across cases if DB isn't reset per test |
| 6. Component wiring | `ConflictInbox.vue` hydration + manual verification + roadmap sync | Manual verification substitutes for blocked E2E (S-01) |

**Prerequisites:** None blocking at the code level; roadmap S-07 lists S-01 (`arrival-day-proven`) as a sequencing prerequisite, which this plan explicitly proceeds ahead of (see Open Risks).
**Estimated effort:** ~1 session across 6 small, sequential phases.

## Open Risks & Assumptions

- Proceeding ahead of roadmap S-07's listed prerequisite (S-01, still blocked on E2E secrets) — manual verification is a real but weaker substitute for automated proof.
- No client-side audit trail added for conflict actions — would need a new backend endpoint, out of scope here.
- Roadmap sync is manual for this change (change-id `refactor-opportunities` doesn't match roadmap's `durable-conflict-inbox` Change ID for S-07) — flipped to `planning` now; needs a manual flip again at implement time.

## Success Criteria (Summary)

- A conflict written before a reload is still visible in `ConflictInbox.vue` and present in IndexedDB after the reload.
- Dismissing/clearing a conflict removes it from both the UI and IndexedDB.
- All existing and new unit tests pass against real (fake-indexeddb-backed) persistence, not a full-module mock.
