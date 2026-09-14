# Artifact 3 — Contributors (Decision History & Intent)

Scope: not headcount (this is effectively solo, AI-assisted development under one git
identity, `superdyzio`) but the decision history behind the one real runtime cycle
identified in `artifact-2-structure.md`: `ops ↔ arrivals` and `ops ↔ inhouse`. Working
report feeding the later `repo-map.md` synthesis.

## Focus area

From `artifact-2-structure.md`: `src/modules/ops/store/sync.store.ts` (the offline
replay engine) imports `arrivalsApi`/`inhouseApi` and their payload types to replay
queued actions on reconnect; `src/modules/arrivals/store/arrivals.store.ts` and
`src/modules/inhouse/store/inhouse.store.ts` import `useSyncStore` back from `ops` to
refresh the queue counter when an action is enqueued offline. Both directions carry
runtime (non-type-only) imports — `ops → arrivals → ops` and `ops → inhouse → ops` are
real bidirectional module coupling, not a type-level round trip. `ops` has no
`views`/`types` dirs and isn't routed directly; it functions as shared offline
infrastructure that happens to live under `modules/` instead of `shared/`.

## Commit timeline on the cycle's files

All commits that touched the cycle's files (`sync.store.ts`, `ops.store.ts`,
`useOfflineSnapshot.ts`, `arrivals.store.ts`, `inhouse.store.ts`,
`shared/services/{actionQueue,offlineDb,db}.ts`), chronological:

| Date | Model tag | Commit subject | SHA |
|---|---|---|---|
| 2026-04-14 16:32 | `[opus-4.6]` | add arrivals today module with check-in, no-show, QR scan, move actions and polling | `6c11c61` |
| 2026-04-14 16:39 | `[opus-4.6]` | add in-house Pinia store with occupancy fetch, check-out, room move, and export | `5099ac8` |
| 2026-04-14 22:37 | `[sonnet-4.6]` | add OpsLayout bottom nav with property selector and /ops/* routes | `5b4d469` |
| 2026-04-14 22:44 | `[sonnet-4.6]` | add IndexedDB offline snapshot for workers, rooms, and arrivals per property | `0727b50` |
| 2026-04-14 22:46:14 | `[sonnet-4.6]` | add offline action queue: enqueue check-in/out/move/no-show when offline | `5b2256f` |
| 2026-04-14 22:46:54 | `[sonnet-4.6]` | add sync engine: replay queued offline actions on reconnect | `92789b9` |
| 2026-04-14 23:39 | `[sonnet-4.6]` | add sync completion toast with conflict count feedback | `96cbb69` |
| 2026-08-09 16:02 | `[opus-5]` | rename product from BedOK to Beduno | `37e8b99` |
| 2026-08-09 16:38 | `[opus-5]` | refresh offline queue counter when actions are queued | `ee19f04` |
| 2026-09-14 13:19 | `[sonnet-5]` | sync frontend contract to real beduno-be OpenAPI spec | `c11add5` |

Not yet a commit: `context/changes/arrival-day-proven/` (untracked, status `planned`,
0 of its Progress items checked) is an in-flight plan targeting this exact mechanism —
see Paper trail below.

## What each session changed

**2026-04-14, rewrite day (`opus-4.6` → `sonnet-4.6`, ~16:32–23:39, one continuous
session).** This is where the entire subsystem — and the cycle — was built, in order:
`arrivals` module (opus-4.6, 16:32) and `inhouse` module (opus-4.6, 16:39) shipped
first as plain online-only stores. Then, in a single ~7-hour sonnet-4.6 run that same
evening: `OpsLayout` (22:37, adds the `online`/`offline` listeners and bottom nav),
`useOfflineSnapshot` (22:44, per-property IndexedDB snapshot), the offline action
queue (`5b2256f`, 22:46:14 — adds `enqueueAction` calls directly to
`arrivals.store.ts`/`inhouse.store.ts`, **not yet** importing `useSyncStore`), and,
40 seconds later, the sync engine itself (`92789b9`, 22:46:54) — this is the commit
that creates `sync.store.ts` and gives it its `arrivalsApi`/`inhouseApi` imports
(`ops → arrivals`, `ops → inhouse`). At this point the coupling was **one-directional
only** — `ops` read from `arrivals`/`inhouse`, nothing called back. A final commit
(`96cbb69`, 23:39) added the sync-complete/conflict-count toast. The whole offline
subsystem — snapshot, queue, replay, conflict list, UI wiring — was scaffolded end to
end in one session, which is consistent with `artifact-1-territory.md`'s framing of
2026-04-14 as the Vite/Pinia rewrite's foundation day.

**2026-08-09 (`opus-5`, ~36 minutes: 16:02–16:38).** Nearly four months later, a
different model-tagged session closed the loop. `37e8b99` is an unrelated
BedOK→Beduno rename sweep touching `db.ts`. `ee19f04` ("refresh offline queue counter
when actions are queued") is the commit that actually creates the back-edge: it adds
`import { useSyncStore } from '@/modules/ops/store/sync.store'` to both
`arrivals.store.ts` and `inhouse.store.ts`, wrapping `enqueueAction` in a new
`queueOffline()` helper that also calls `useSyncStore().refreshQueueLength()` — with
the stated rationale in an inline comment: *"so the offline banner reflects the queue
depth immediately rather than only on reconnect."* This is the commit that makes the
coupling bidirectional and closes the `ops ↔ arrivals`/`ops ↔ inhouse` cycle. Nothing
in the commit message or diff suggests the author was thinking about module coupling
or a cycle at all — it reads as a narrow UX fix (queue counter freshness), not an
architectural decision.

**2026-09-14 (`sonnet-5`, today, `c11add5`), "sync frontend contract to real beduno-be
OpenAPI spec."** The largest and most recent commit touching this area — a full
contract-drift reconciliation across nearly every module, incidental to (not about)
the cycle. Relevant to this subsystem specifically: it fixes a bug in
`arrivals.store.ts`'s offline `move()` optimistic update, which had been setting
`status: 'MOVED'` — a status value CLAUDE.md explicitly says doesn't exist
(`StayStatus` has no `MOVED`; a move checks a stay out and creates a new one). The fix
replaces it with `status: 'CHECKED_OUT'` and a comment explaining the real move
semantics. It also trims `useOfflineSnapshot.ts`'s arrivals fetch (dropping pagination
params to match the real, unpaginated `arrivalsApi.getArrivals` response) and bumps
`db.ts`'s `DB_VERSION` 2→3. None of this touches the cycle's shape — the
`ops↔arrivals`/`ops↔inhouse` imports are untouched by this commit.

## Paper trail from context/

Three documents in `context/` speak directly to this subsystem's intent and known
gaps — quoted, not paraphrased:

- **`context/foundation/roadmap.md` (S-07: `durable-conflict-inbox`)** carries the
  sharpest documented risk on this exact code: *"The baseline is worse than the PRD
  assumed. `sync.store.ts:80-86` pushes a `SyncConflict` and *deletes* the queued
  action, and conflicts live in an in-memory `ref` (`:27`) rather than IndexedDB — so
  a rejected check-in disappears on reload with no route back. The design correctly
  refuses to auto-merge and then loses the decision it refused to make."* This is a
  direct read against the current `sync.store.ts` (confirmed in this session: the
  `conflicts` array is `ref<SyncConflict[]>([])`, no `db.ts` persistence path exists
  for it) — the "conflict inbox" CLAUDE.md describes as an intentional design
  ("Conflicts go to the conflict inbox … never silently auto-merge") is real in the
  sense that it doesn't auto-merge, but it is *not* durable, contrary to what the name
  implies.
- **`context/foundation/test-plan.md` §2 Risk #3**: *"A server-rejected replayed
  action disappears with no recovery route — the conflict inbox exists only in memory
  and is deleted on rejection"* — rated **High impact / Medium likelihood**, sourced
  to "Roadmap S-07 baseline finding; PRD FR-018/FR-019; Guardrail 'nobody can explain
  what happened.'" §3 Phase 3 ("Offline durability," risks #3 and #4) is listed
  **`not started`** as of this session.
- **`context/changes/arrival-day-proven/plan.md`** (untracked, `status: planned`, not
  yet implemented) is the closest thing to a design note on the *forward* half of the
  cycle (`ops` replaying into `arrivals`). It documents the mechanism precisely:
  *"`arrivals.store.ts:70-84` already queues a `CHECK_IN` action to IndexedDB when
  offline and shows an optimistic success toast; `sync.store.ts:64-97` already
  replays it against `beduno-be` when `OpsLayout.vue`'s `online` listener fires. Both
  are unit-tested with mocks. What has never been proven is the real thing: offline
  queue → browser reconnect → live HTTP round-trip → queue drained."* It also flags
  the specific hazard baked into the coupling — that the UI can't be trusted as its
  own oracle: *"The action's own success toast (`arrivals.checkInSuccess`) fires
  identically whether the CHECK_IN was queued or actually sent — it is never valid
  proof of replay."* This plan has not been executed yet (all `## Progress` boxes
  unchecked); it is scoped explicitly to *not* touch the durability gap S-07/Risk #3
  documents (out-of-scope note: *"Not testing a rejected replay surviving a page
  reload … that's Risk #3 / rollout Phase 3"*).
- No `context/foundation/lessons.md` exists in this repo — no "we learned this the
  hard way" entry has ever been written about this coupling, the offline queue, or
  the sync engine.
- `docs/should-be/architecture.md:106` notes, in its own reconciliation-diff prose:
  *"The `ops/` module (offline conflict inbox + banner + sync/ops stores) exists but
  was previously missing from this doc entirely."* The architecture spec was
  corrected to describe `ops` only after the fact — it was not designed there first.

## Was this deliberate or accidental?

**The offline queue/replay mechanism itself was deliberate; the resulting cross-module
cycle was not designed as such — it emerged from two independent, correctly-scoped
decisions four months apart.**

Evidence for the mechanism being deliberate: the entire snapshot → queue → replay →
conflict pipeline was built together, in one session, by one continuous author
(sonnet-4.6, 2026-04-14 evening), with a clear separation of concerns — `ops` owns
sync orchestration, `arrivals`/`inhouse` own their own domain actions and simply call
into the shared queue. `ops`'s shape (no `views`/`types`, only
`components`/`composables`/`store`) and CLAUDE.md's description of it as offline
infrastructure with a conflict inbox both point at `ops` being intended as a
cross-cutting layer, not a peer feature module — which is exactly the "shared
offline-infrastructure hub" framing `artifact-2-structure.md` proposed.

Evidence against the *cycle* being deliberate: the forward edge (`ops → arrivals`,
`ops → inhouse`) and the back edge (`arrivals → ops`, `inhouse → ops`) were built four
months apart, by different model-tagged sessions, for unrelated reasons — the forward
edge because the sync engine has to call the real check-in/check-out APIs to replay
actions; the back edge because a UX polish item ("refresh offline queue counter when
actions are queued") needed a live queue-length read. Nothing in either commit
message, in CLAUDE.md's architecture section, or in `docs/should-be/architecture.md`
identifies or discusses a cycle. `docs/should-be/architecture.md` only learned `ops`
existed as a module after the fact ("was previously missing from this doc entirely"),
which argues against a planned "ops is the shared hub" architecture decision recorded
anywhere — it argues for an architecture doc catching up to what the code had already
become. The CLAUDE.md hard rule "Keep cross-module imports to types and shared code;
don't reach into another module's store from a view" (flagged as violated 6+ times in
`artifact-2-structure.md`) was never revisited or carved out an exception for `ops`
specifically.

Net: `ops` functioning as a shared offline layer is a reasonable and probably correct
shape for this system — but the *bidirectional* coupling is better described as
organically converged than architected. No document anywhere treats it as a decision
to be defended; it's simply what the code does.

## Open risk

- **Durability of the conflict inbox is the one explicitly documented, unresolved
  risk on this coupling** — Risk #3 in `test-plan.md`, rollout Phase 3, `not started`.
  `sync.store.ts`'s `conflicts` ref is purely in-memory; a page reload silently
  destroys evidence of a server-rejected replayed action, with no IndexedDB backing.
  This is a real, named, high-impact gap — not speculation.
- **The forward-replay path (`ops → arrivals`) has unit coverage but no live proof.**
  `context/changes/arrival-day-proven/plan.md` exists and is fully scoped but not yet
  implemented (0/7 Progress items checked as of this session) — it is blocked on
  external secrets/fixture provisioning per its own Manual Verification section, same
  precedent as two prior change streams.
- **No document anywhere treats the cycle itself as a risk.** `artifact-2-structure.md`
  is, as far as this research found, the first artifact in this repo's history to
  name `ops ↔ arrivals`/`ops ↔ inhouse` as a cycle at all. There is no lesson, ADR, or
  plan note about whether this coupling should eventually move to `shared/services/`
  (where `db.ts`/`actionQueue.ts`/`offlineDb.ts` already live) to remove the
  module-boundary violation structurally, versus being accepted permanently as `ops`'s
  role. That's an open architectural question with zero paper trail either way.
- **The `move()` status-value bug** (`'MOVED'`, fixed today in `c11add5`) shipped in
  the original 2026-04-14 session and survived undetected for exactly as long as the
  back-edge did (four months, until the contract-sync sweep caught it as a side
  effect of an unrelated OpenAPI reconciliation, not because anyone was reviewing the
  offline path specifically) — weak evidence that this subsystem doesn't get revisited
  often between major sweeps, which is worth flagging alongside the durability gap
  above when this feeds the `repo-map.md` synthesis.
