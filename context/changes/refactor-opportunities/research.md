---
date: 2026-09-14T20:27:53+02:00
researcher: Claude Sonnet 5
git_commit: cacc4a53c3f614ff373b1cf81e3e418c8a8aed6d
branch: main
repository: beduno-fe
topic: "Refactor opportunities: ranking the tech debt already documented in context/changes/ops-arrival/research.md and context/map/*"
tags: [research, codebase, refactor, tech-debt, ops, cross-module-coupling, dead-code]
status: complete
last_updated: 2026-09-14
last_updated_by: Claude Sonnet 5
---

# Research: Refactor opportunities

**Date**: 2026-09-14T20:27:53+02:00
**Researcher**: Claude Sonnet 5
**Git Commit**: cacc4a53c3f614ff373b1cf81e3e418c8a8aed6d
**Branch**: main
**Repository**: beduno-fe

## Research Question

`context/changes/ops-arrival/research.md` (offline sync flow deep-dive) and `context/map/{repo-map,artifact-1,artifact-2,artifact-3}.md` (repo-wide territory/structure/contributor analysis) already documented this repo's technical debt and structural risks. Both reports stopped short of answering: **which of these problems are worth fixing, in what target shape, and in what order?**

This change explores every documented problem in code and history, classifies which ones are true *refactor candidates* (fixing them would change code structure) versus everything else (test/doc gaps — kept as feasibility/cost input, not ranked), investigates each candidate on three axes (current shape, historical intentionality, migration feasibility), and closes with a ranked "Refactor opportunities" list. No code was changed. No decision was made — this is the evidence pack for a separate planning session.

## Summary

Of everything the two prior reports flagged, only **6 items actually qualify as refactor candidates** (a fix that changes code structure); everything else was a test/coverage/documentation gap, folded into feasibility notes rather than ranked as a refactor opportunity. One previously-named candidate — **removing dead pre-rewrite code** — turned out to be **already resolved**: `src/views/`, `src/features/`, `src/components/`, `src/auth/`, `src/router/` were deleted in the same commit (`22d29e0`, 2026-04-14) that the prior territory report's churn-count conflated with "recent activity." They do not exist in the working tree today. That recommendation should be struck from the backlog.

Two candidates turned out stronger than the priors suggested. First, the cross-module "don't reach into another module's store from a view" violation: the prior artifact counted "6+" sites; direct verification found **16 distinct sites** touching 4 different stores, with a clear split between a cheap fix (3 role-check sites) and a genuinely bigger one (11 display-data sites `useEntityLookup` cannot cover, because it resolves single entities by ID, not full reactive lists). Second, `DataTable.vue`: the prior report logged "1 usage" as a weak signal; direct grep found **zero real usages** — it's exported from the shared barrel and never imported by any view — while **10 views hand-roll `<table>`** markup instead.

Ranked by evidence, the strongest three opportunities are: **(1) conflict-inbox durability** (data-loss risk, already scoped in detail by the ops-arrival research, blocked only on prioritization), **(2) the cross-module store reach-in pattern** (16 sites, no lint enforcement, actively regressing — new sites were added on the same day the pattern was first introduced), and **(3) inhouse/arrivals offline asymmetry** (confirmed to be an omission, not a deliberate simplification, in the same commit that built the pattern correctly for arrivals). The `ops`-module-placement question and the `DataTable` adoption gap are real but lower-urgency; `NO_SHOW`/`conflicts` naming collisions are cosmetic and not worth a dedicated change.

## Candidate audit (read this first)

Every problem named in `context/changes/ops-arrival/research.md` and `context/map/*`, classified. **CANDIDATE** = fixing it would change code structure. Everything else is a test/coverage/documentation gap — real, but kept as feasibility input, not a ranked refactor opportunity, per this research's scope.

| # | Problem | Source | Classification | Why |
|---|---|---|---|---|
| 1 | Conflict inbox has no IndexedDB persistence (in-memory only) | ops-arrival research §Technical debt 1; repo-map Decision 1 | **CANDIDATE** | Requires new `db.ts` object store, new/extended service module, async store rewrite |
| 2 | `ops` module lives under `modules/` but functions as shared offline infra; undocumented cycle `ops ↔ arrivals`/`ops ↔ inhouse` | repo-map "Jedyny realny cykl"; Decision 2; artifact-2 Cycles found | **CANDIDATE** | Either a physical move (`modules/ops` → `shared/`) or a formal documented exception — both are structural/documentation decisions with real file-move blast radius |
| 3 | Cross-module store reach-ins from views (violates CLAUDE.md's "don't reach into another module's store from a view") | artifact-2 "6+ places"; **this research: 16 confirmed sites** | **CANDIDATE** | Each site needs a replacement access path (composable, permission helper, or narrowed API) |
| 4 | inhouse offline actions asymmetric vs arrivals: no optimistic update on checkOut/moveRoom; `bulkCheckout` has no offline branch at all | ops-arrival research §Technical debt 3 | **CANDIDATE** | Missing optimistic-update logic + missing queue-integration is a code-structure gap, not just a test gap |
| 5 | Dead code: `clearQueue()` in `actionQueue.ts`, zero call sites anywhere (prod or test) | ops-arrival research §Technical debt 2 (ast-grep correction) | **CANDIDATE** (trivial) | Removing unused exported function changes code, but is a one-line, zero-risk deletion |
| 6 | `DataTable.vue` exported but never used; 10 views hand-roll `<table>` | repo-map Decision 5 (weak signal, "1 usage") — **this research: 0 real usages confirmed, 10 hand-rolled tables found** | **CANDIDATE** | Adopting a shared component instead of duplicated markup is a structural consolidation |
| 7 | Dead pre-rewrite code (`src/views/`, `src/features/`, `src/components/`, `src/auth/`, `src/router/`) | repo-map Decision 4; artifact-1 churn table | **NOT A CANDIDATE — ALREADY RESOLVED** | Confirmed deleted in the same commit (`22d29e0`) the prior report's churn count was reading; directories don't exist in the working tree (see Corrections below) |
| 8 | `actionQueue.ts` has no tests against real IndexedDB (every consumer mocks the module) | ops-arrival research §Technical debt 2 | Not a candidate | Test-coverage gap, not a structure problem — feasibility input for candidate 1 and 4 |
| 9 | Missing specs: `inhouse.store.spec.ts`, `OpsLayout.spec.ts`, `ConflictInbox.vue`/`OfflineBanner.vue` component specs, `db.ts` migration tests | ops-arrival research §Technical debt 3 | Not a candidate | Test-coverage gaps — feasibility input, mainly for candidates 1, 2, 4 |
| 10 | Zero E2E coverage for the offline path | ops-arrival research §Technical debt 4 | Not a candidate | Test-coverage gap (Module 3 / `/10x-test-plan` territory) |
| 11 | `context/changes/arrival-day-proven/plan.md` unimplemented, blocked on `E2E_TEST_*` secrets | ops-arrival research §Technical debt 4; repo-map Decision 3 | Not a candidate | External blocker/process issue, not a code-structure fix |
| 12 | `MOVE` always dispatched via `arrivalsApi.move` regardless of origin module (undocumented but safe invariant) | ops-arrival research step 21 | Not a candidate | Needs a code comment, not a structural change; behavior is already correct |
| 13 | `'NO_SHOW'` string-literal collision between `QueuedActionType` and `StayStatus` | ops-arrival research, ast-grep #15 | **CANDIDATE (weak)** | A rename is a structural change, but the collision causes no real bug today — see Considered-and-rejected |
| 14 | `"conflicts"` naming collision: `ConflictInbox.vue` (ops) vs `ConflictBanner.vue`/`useConflicts.ts` (stays) — unrelated domains, same word | ops-arrival research, ast-grep #11 | **CANDIDATE (weak)** | Renaming is structural but purely cosmetic; no code coupling exists between the two — see Considered-and-rejected |

Six real candidates (#1–#6); one already resolved (#7); the rest are feasibility/cost inputs, not independently ranked.

## Candidate 1 — Conflict inbox durability

### Current shape (evidence, from ops-arrival research — not re-derived)

`src/modules/ops/store/sync.store.ts:27` — `conflicts` is `ref<SyncConflict[]>([])`, Pinia in-memory only. `src/shared/services/db.ts:22-50` declares only `workers`/`rooms`/`arrivals`/`meta`/`actionQueue` object stores — none for conflicts. A rejected replayed action is pushed into `conflicts` and simultaneously removed from the `actionQueue` IDB store (`sync.store.ts:75-87`) — so a page reload silently destroys the only record that the rejection happened.

**Supplementary evidence gathered in this research**: `sync.store.spec.ts:6-9` `vi.mock`s the entire `@/shared/services/actionQueue` module — confirming what the ops-arrival research had flagged as UNKNOWN: today's tests never touch a real IndexedDB transaction, so adding IDB-backed conflict persistence will need new mocking infrastructure in this spec file, not an extension of the existing mock.

### Intentionality verdict

**Conscious limitation, not accidental complexity.** The offline queue/replay/conflict pipeline was built as one coherent design in a single session (`92789b9`, `96cbb69`, 2026-04-14) — durability for the conflict list specifically was simply never added, and the gap has been independently identified and rated by `context/foundation/test-plan.md` (Risk #3, High impact / Medium likelihood) and `context/foundation/roadmap.md` (S-07 `durable-conflict-inbox`). This is a known, named, already-triaged gap, not a fresh discovery — its status is "correctly identified, not yet prioritized," per both `repo-map.md` and this research.

### Migration feasibility

Already scoped in detail by `context/changes/ops-arrival/research.md` §Technical debt 1 (not re-derived here): bump `db.ts`'s `DB_VERSION` to 4 with a new `conflicts` object store (natural key: `action.id`, since `SyncConflict` has no own `id` today), migration gated on `e.oldVersion < 4` per the CLAUDE.md hard rule; add CRUD functions (new sibling service or extend `actionQueue.ts`); convert `sync.store.ts`'s `dismissConflict`/`clearConflicts`/conflict-push in `syncQueue()` to async IDB calls; `ConflictInbox.vue` (sole consumer) needs an async load-on-mount or store-hydration pattern. First prerequisite: decide the IDB-mocking strategy for `sync.store.spec.ts` before touching the store, since the current full-module mock cannot exercise this path.

## Candidate 2 — `ops` module placement / the `ops ↔ arrivals`/`ops ↔ inhouse` cycle

### Current shape (evidence, from ops-arrival research + repo-map — not re-derived)

`sync.store.ts` calls `arrivalsApi`/`inhouseApi` to replay queued actions (forward edge); `arrivals.store.ts`/`inhouse.store.ts` call `useSyncStore().refreshQueueLength()` back (return edge) — a real, runtime, bidirectional cycle, confirmed by ast-grep to have exactly one call site each. `ops` has no `views/`/`types/` dirs (4/6 of the expected module shape) and isn't routed directly.

### Intentionality verdict

**The mechanism is deliberate; the cycle is not.** Forward edge built `92789b9` (2026-04-14, one continuous session). Return edge built independently `ee19f04` (2026-08-09, four months later) as a narrow UX fix ("refresh offline banner counter") with zero mention of module coupling. No document in the repo — not CLAUDE.md, not `docs/should-be/architecture.md` — ever named or defended this as an architectural decision; `docs/should-be/architecture.md:106` explicitly notes `ops` "was previously missing from this doc entirely," i.e. the doc caught up to the code, not the other way around.

### Migration feasibility (new evidence, this research)

Two options were on the table (repo-map): (a) formally document `ops` as an exception in CLAUDE.md, or (b) physically move `sync.store.ts`/`ops.store.ts`/`useOfflineSnapshot.ts`/`ConflictInbox.vue`/`OfflineBanner.vue` into `shared/`.

- **Blast radius of option (b) is small and mechanical**: exactly 5 files need an import-path edit, 9 import/mock statements total — `OpsLayout.vue` (5 imports), `InspectionMode.vue` (1), `InspectionMode.spec.ts` (1 `vi.mock` path), `inhouse.store.ts` (1), `arrivals.store.ts` (1). No barrel/index file exists under `modules/ops` to reduce this count.
- **A structural wrinkle for option (b)**: `src/shared/` today has **zero** Pinia stores (`grep -rn "defineStore" src/shared/` → 0 hits) and no `shared/store/` directory — `shared/services/*.ts` are all plain functions. Moving `sync.store.ts`/`ops.store.ts` there would either break that convention or require creating a new `shared/store/` home — a small but real precedent-setting decision, not just a file move.
- **`OpsLayout.vue` (in `shared/layouts/`) already imports from `modules/ops`** — 5 import lines. This is `shared/` reaching into a `modules/*` directory, backwards from the documented `shared → consumed-by-modules` direction — itself evidence that `ops` already behaves as shared infra from the layout's perspective, independent of which option is chosen.
- **No ESLint import-boundary rule exists today** (`eslint.config.js` has no `eslint-plugin-boundaries`/`no-restricted-imports`) — neither option requires an ESLint change, but neither option is enforced afterward either, unless one is added.
- **`docs/should-be/architecture.md`** currently lists `ops` as a peer entry under the `modules/` tree (not under `shared/`), so option (a) would need a doc update either way to explain the exception; option (b) would need the doc's tree diagram redrawn.

## Candidate 3 — Cross-module store reach-ins (broader than the cycle)

### Current shape (new evidence, this research — supersedes the "6+" estimate)

Verified against current code (not re-derived from the prior grep-based estimate): **16 distinct violation sites** of CLAUDE.md's "don't reach into another module's store from a view" rule (18 counting the two already-known `useSyncStore` sites from Candidate 2 separately). Breakdown by store reached into: `properties.store` — 10 sites (the most reached-into store, not `auth.store` as the prior artifact's phrasing implied), `auth.store` — 3 sites, `workers.store` — 2 sites, `ops`/`sync.store` — 3 sites (2 of which are Candidate 2's cycle).

By category:
1. **Display-data / list-population** (11 sites: `MoveAction.vue`, `ArrivalsToday.vue`, `ExportCenter.vue`, `InHouseView.vue`, `InspectionMode.vue`, `BulkAssign.vue` ×2 (properties + workers), `CreateStay.vue` ×2, `StayDetail.vue`, `StayPlanner.vue`) — each needs a **full reactive list** (`.properties`, `.rooms`, `.workers`) to populate a `<select>`/multi-select, plus calls the other module's fetch action.
2. **Role/permission check** (3 sites, structurally identical: `PropertyDetail.vue`, `StayDetail.vue`, `WorkerDetail.vue`, each reading `auth.userRole === 'AGENCY_ADMIN'` to gate a link to `AuditLog`).
3. **Store-to-store business logic** (1 site: `inhouse.store.ts`'s `roomStatus()`/`fetchInHouse()` reads `properties.store`'s room list for `BLOCKED` status).
4. **Cross-view live UI state** (1 site: `InspectionMode.vue` reads `opsStore.selectedPropertyId` to prefill its own picker).

`useEntityLookup.ts` — the repo's mandated ID→display-data resolver — **does not cover any of the category-1 or category-2 sites**: it resolves single entities by ID with cache-backed calls (`getWorker`, `getProperty`, `getRoom`, `getUser`), not full reactive collections, and several of these same files already correctly use it for single-entity display right next to the reach-in that's doing the uncovered "list population" job. Category 2 (role checks) is a different kind of problem entirely — reading the current session's own role, not resolving another record.

### Intentionality verdict

**Accidental complexity, not a conscious limitation.** All 8 investigated seed-list sites were introduced in a single dense session on 2026-04-14, in terse feature-add commits with no rationale in the message or diff — this reads as fast greenfield building, not a deliberate bypass. All of them **predate** `useEntityLookup.ts` by five months (it was created 2026-09-14, `c11add5`), so at the time each was written there was no shared alternative to use instead — but that also means the debt has had five months to regress further unnoticed, and did (new reach-in sites, e.g. `MoveAction.vue`, `InHouseView.vue`, were added independently of the original seed list this research found).

### Migration feasibility (new evidence, this research)

Two very different costs hiding under one rule:
- **Role checks (3 sites) — cheap.** `auth.store.ts` has no `hasRole()`-style helper today; a `useHasRole()`/`usePermissions()` composable in `shared/composables/` wrapping `useAuthStore().userRole` (mirroring the router's existing `meta.roles: UserRole[]` shape) is a low-risk, mechanical, one-file-at-a-time extraction.
- **Display-data lookups (11 sites) — bigger.** No existing composable covers "give me the full reactive list." A real fix needs either new list-returning composables (`useWorkerDirectory()`/`usePropertyDirectory()` backed directly by the respective `*Api`, bypassing the other module's Pinia store) or each module exposing a narrow read-only "picker" API. This touches reactive state shape, not just a boolean — a materially bigger lift.
- **Regression guard status is uneven**: of the 7 seed-list views, only `CreateStay.spec.ts`, `BulkAssign.spec.ts`, `InspectionMode.spec.ts` exist; `ExportCenter.spec.ts`, `PropertyDetail.spec.ts`, `StayDetail.spec.ts`, `WorkerDetail.spec.ts` do not. Four of the seven candidate refactor targets have no test safety net today.
- **No mechanical enforcement exists** (`eslint.config.js` has no import-boundary plugin) — the same seed-list pattern kept regressing on the same day it was introduced, which is direct evidence that documentation alone (the CLAUDE.md rule already existing) does not prevent recurrence; a durable fix benefits from adding `eslint-plugin-boundaries` or an equivalent `no-restricted-imports` rule as part of, not after, the fix.

## Candidate 4 — inhouse/arrivals offline asymmetry

### Current shape (confirmed, extends ops-arrival research)

`arrivals.store.ts`'s `checkIn`/`noShow`/`move` each patch `arrivals.value` locally via `updateStayInList` inside the offline branch. `inhouse.store.ts`'s `checkOut`/`moveRoom` (lines 65-81) call `queueOffline(...)` and return — zero local mutation. `bulkCheckout` (lines 83-87) has no `navigator.onLine` guard at all.

**New evidence — the "harder to patch" inference is grounded but overstated as a blocker.** `RoomOccupancy` (`inhouse.types.ts:8-16`) is a per-room aggregate with a nested `occupants: OccupantSummary[]` array (no `status` field on `OccupantSummary`), versus `ArrivalStay`'s flat per-stay row with a top-level `status`. Patching inhouse optimistically requires a nested search-and-splice (locate the room whose `occupants` contains the `stayId`, adjust `occupiedSpots`/`availableBedCount`) rather than a single-field flip — genuinely more bookkeeping, but not structurally blocked: `useEntityLookup` already exists to resolve the worker display data a `moveRoom` optimistic patch would need.

### Intentionality verdict — corrects the ops-arrival research's inference

**Confirmed omission, not a deliberate simplification.** The ops-arrival research flagged this as an *inference*, not confirmed. This research confirms it directly: a single commit, `5b2256f` (`[sonnet-4.6] add offline action queue: enqueue check-in/out/move/no-show when offline`), touched **both** `arrivals.store.ts` and `inhouse.store.ts` at once. It added the full optimistic-patch pattern to all three arrivals actions, but added **only** the `navigator.onLine`/`enqueueAction` guard to inhouse's — no attempt, no revert, no comment distinguishing a deliberate different treatment. Same author, same model, same commit. Nothing justifies the asymmetry; it simply wasn't done.

`bulkCheckout`'s gap has a separate, later origin: it was rewired from a dead endpoint to the real API in `c11add5` (2026-09-14, five months after the queue system existed), copying the happy-path shape of `checkOut`/`moveRoom` but not their offline branch — bolted on without revisiting the pattern the rest of the file already followed.

### Migration feasibility

**(a) Optimistic update for checkOut/moveRoom — purely structural, no business-rule ambiguity.** Splice the matching `OccupantSummary` out of whichever room's `occupants` contains the `stayId`, adjusting that room's counts; `moveRoom` additionally pushes a synthesized `OccupantSummary` (via `useEntityLookup`) into the target room. Fits inside the existing `queueOffline` branches — an incremental addition to `inhouse.store.ts`, not a redesign.

**(b) `bulkCheckout` offline-awareness — this is a business-rule decision, not a structural one; naming the options only, not picking one:** either add `BULK_CHECKOUT` to `QueuedActionType` and give it the same guard (with a new `replayAction` case), or treat it as online-only like CLAUDE.md's existing room/capacity/user-edit carve-out — except that carve-out is explicitly scoped to non-stay-lifecycle edits, and bulk checkout *is* a stay-lifecycle action, structurally closer to the four already-queued types. The current state (no guard, no documented rationale) is neither option — it's an unaddressed gap, not a decision.

**Prerequisite for either fix**: `inhouse.store.spec.ts` does not exist (confirmed by `find`) — `arrivals.store.spec.ts` does. Per this repo's test-first-on-risk-surface convention, writing that spec against current behavior (online and offline paths) is the first step before touching the store.

## Candidate 5 — Dead code: `clearQueue()`

Already fully evidenced by ops-arrival research (ast-grep + grep, zero call sites in `src/` besides its own definition at `actionQueue.ts:66`) and reconfirmed directly in this research (`grep -rn "clearQueue" src/` → one hit, the definition itself). Trivial, zero-risk deletion — no further investigation warranted.

## Candidate 6 — `DataTable.vue` unused; 10 views hand-roll tables

### Current shape (new evidence — corrects repo-map's "1 usage, weak signal")

`grep -rn "DataTable" src --include="*.vue"` returns **zero** matches inside any view or component — the only reference anywhere is the re-export in `src/shared/components/index.ts`. Repo-map's "1 usage" was counting that barrel export itself as a usage, not a real consumer. Meanwhile `grep -rl "<table" src/modules --include="*.vue"` finds **10 views** hand-rolling raw `<table>` markup: `admin/views/RolePermissions.vue`, `admin/views/UserManagement.vue`, `audit/components/AuditDiffViewer.vue`, `audit/views/AuditLog.vue`, `stays/views/StayPlanner.vue`, `stays/views/BulkAssign.vue`, `workers/views/WorkerImport.vue`, `workers/views/WorkerList.vue`, `workers/views/WorkerDetail.vue`, `arrivals/views/ArrivalsToday.vue`.

This is a materially stronger finding than the source report suggested — not a weak signal to check opportunistically, but a shared component built and then abandoned in favor of duplicated markup across a third of the app's views. No history/feasibility sub-investigation was run for this candidate (not requested at this depth by the audit — its current-shape evidence alone is enough to rank it; see Open Questions for the follow-up this implies).

## Considered and rejected

- **#7 Dead pre-rewrite code removal — struck, not just deprioritized.** `git log -1 -- src/views` (and the same for `src/features`/`src/components`/`src/auth`/`src/router`) shows the only commit touching each is `22d29e0` (2026-04-14, the rewrite commit) — and `git log --diff-filter=D --summary -- <dirs>` confirms that same commit **deleted** every file under those paths (`delete mode 100644 src/auth/Login.vue`, etc.). `find`/`ls` confirm the directories don't exist in the working tree today. The prior territory report's churn count conflated "commits that touched these paths historically" (which includes the deletion commit itself) with "code still present" — an artifact of counting file-touches without checking working-tree state. Nothing to refactor; strike this from any backlog derived from `repo-map.md`.
- **#13 `'NO_SHOW'` string-literal collision** — real (16 occurrences across 8 files, confirmed by grep), but it causes no observed bug: `QueuedActionType`'s `'NO_SHOW'` and `StayStatus`'s `'NO_SHOW'` are used in disjoint contexts (one in the offline queue, one in stay lifecycle) and TypeScript's structural typing means the collision is a human-readability hazard during find-and-replace, not a runtime coupling. Renaming one would touch 8 files for a purely cosmetic gain — not worth a dedicated change; worth a one-line comment at each definition site instead, which is a documentation fix, not a refactor.
- **#14 `"conflicts"` naming collision** — confirmed two unrelated subsystems (`ConflictInbox.vue`/ops vs `ConflictBanner.vue`+`useConflicts.ts`/stays) share the word, with zero code coupling between them (verified: neither imports from the other). Same verdict as #13 — a rename is possible but the cost (touching both subsystems' naming) outweighs a benefit that's purely about search-ability, not correctness.
- **Candidates 3's category 3 and 4 (single-site issues: `inhouse.store.ts`→`properties.store`, `InspectionMode.vue`→`opsStore.selectedPropertyId`)** — real violations of the same rule as the rest of Candidate 3, but each is a single, isolated site rather than a repeated pattern; they're folded into Candidate 3's ranking rather than split into their own top-3 entries.

## Refactor opportunities (ranked)

Ranked by evidence — cost of the debt (risk, blast radius, how much it's actively regressing) versus cost of the fix (files touched, existing guardrails, ambiguity). This is a proposal for a separate planning session, not a decision.

### 1. Conflict inbox durability (Candidate 1)

- **Current → target shape**: `conflicts: ref<SyncConflict[]>([])` (Pinia, in-memory) → a `conflicts` IndexedDB object store in `db.ts` (`DB_VERSION` → 4, keyed on `action.id`), with `sync.store.ts`'s conflict-handling methods converted to async IDB reads/writes, and `ConflictInbox.vue` hydrating from IDB on mount.
- **Why it ranks #1**: the only candidate with a *named, rated, already-triaged* production-data-loss risk attached (`test-plan.md` Risk #3, High impact / Medium likelihood) — this isn't a structural-cleanliness argument, it's "a rejected offline action currently vanishes with no audit trail," which directly contradicts CLAUDE.md's "Everything is audited" hard rule. Cost of the fix is well-understood and small (one new object store, one service extension, one store rewrite, one component change) relative to the risk it closes.
- **Blast radius**: `db.ts`, `actionQueue.ts` (or a new sibling service), `sync.store.ts`, `ConflictInbox.vue`, `sync.store.spec.ts`. 4-5 files.
- **Incremental path sketch**: (1) add the IDB store + migration; (2) add CRUD functions; (3) swap `sync.store.ts`'s in-memory conflict mutations for async IDB calls behind the same public interface `ConflictInbox.vue` already consumes, so the component change is minimal; (4) hydrate on store init.
- **First prerequisite step**: decide the IDB-testing strategy for `sync.store.spec.ts` (currently fully mocks `actionQueue` — this needs either a fake-IDB library or a real-IDB test harness) before writing the store changes, so the new code lands with a real regression guard instead of another full-module mock that can't catch persistence bugs.

### 2. Cross-module store reach-ins (Candidate 3)

- **Current → target shape**: 16 direct `useXStore()` imports from other modules' views/stores → for the 3 role-check sites, a shared `useHasRole()`/`usePermissions()` composable; for the 11 display-data sites, new list-returning composables/APIs (`useWorkerDirectory()`/`usePropertyDirectory()` or equivalent) that don't expose the other module's full Pinia store surface (including its mutation actions) to unrelated views.
- **Why it ranks #2**: largest blast radius of any candidate (16 sites across 4 stores, spanning 7+ views), demonstrably *still regressing* (new sites were introduced on the same day as the original seed list, and this research found sites the prior grep-based pass missed entirely), and has zero mechanical enforcement today — meaning any partial fix will silently erode without an added lint rule. It's also the most load-bearing violation of an explicit CLAUDE.md hard rule, not an inferred convention.
- **Blast radius**: up to 16 view/store files for the full fix; the cheap role-check slice alone touches only 3 (`PropertyDetail.vue`, `StayDetail.vue`, `WorkerDetail.vue`) plus one new composable.
- **Incremental path sketch**: split into two independent, sequenceable slices — (a) role-check composable extraction (cheap, 3 sites, mechanical, do first); (b) display-data directory composables (bigger, 11 sites, needs new list-returning APIs — do per-module, not all at once). Add `eslint-plugin-boundaries` (or a hand-rolled `no-restricted-imports`) as part of slice (a), not after, so slice (b)'s sites don't regress while being worked through incrementally.
- **First prerequisite step**: write the missing specs for the 4 unguarded seed-list views (`ExportCenter.vue`, `PropertyDetail.vue`, `StayDetail.vue`, `WorkerDetail.vue`) before refactoring them, since only 3 of the 7 seed-list views currently have any test safety net.

### 3. Inhouse/arrivals offline asymmetry (Candidate 4)

- **Current → target shape**: `inhouse.store.ts`'s offline `checkOut`/`moveRoom` (no local mutation) → optimistic `rooms.value` patches matching arrivals' pattern (nested splice + count adjustment instead of a flat-field flip); `bulkCheckout` (no offline branch) → an explicit, documented decision (queue-integrated via a new `BULK_CHECKOUT` action type, or formally online-only with a stated reason) rather than today's silent gap.
- **Why it ranks #3**: this research *confirmed* (not just inferred) that the missing optimistic update was an omission in the very commit that built the correct pattern for arrivals — so it's not a case of "maybe intentional, leave it"; it's a known gap with a clear reference implementation sitting in the same file family. `bulkCheckout`'s gap is real-UX-reachable today (via `RoomCard.vue`'s multi-select → bulk-checkout button), not theoretical.
- **Blast radius**: `inhouse.store.ts` alone for part (a); `actionQueue.ts` (`QueuedActionType` union) + `sync.store.ts` (`replayAction` switch) + `inhouse.store.ts` for part (b) if the queue-integration option is chosen.
- **Incremental path sketch**: (1) write `inhouse.store.spec.ts` against current behavior first (it doesn't exist); (2) add the optimistic-patch helper for `checkOut`/`moveRoom`, mirroring `updateStayInList`'s role; (3) separately decide and implement `bulkCheckout`'s offline treatment — this part needs a product decision (queue vs. online-only), not just code.
- **First prerequisite step**: `inhouse.store.spec.ts` (does not exist today) — everything else in this candidate is unguarded without it.

### Also identified, not in the top 3 (still worth tracking)

- **`ops` module placement (Candidate 2)** — real and well-evidenced (small, mechanical blast radius for a physical move: 5 files, 9 import statements), but lower urgency than the three above: it's a naming/location question with no data-loss or active-regression angle, and `shared/` currently has no Pinia-store precedent to slot into cleanly, which is itself a small design decision worth making deliberately (new `shared/store/` vs. keep-and-document) rather than rushing.
- **`DataTable.vue` adoption (Candidate 6)** — stronger evidence than the source report suggested (0 real usages, not 1; 10 hand-rolled tables, not a vague "manual tables?" question), but no history/feasibility investigation was run at this pass — see Open Questions.
- **Dead code: `clearQueue()` (Candidate 5)** — real, trivial, essentially free to fix any time; not worth a dedicated change on its own, more naturally swept up alongside Candidate 1 (which touches `actionQueue.ts`/`db.ts` anyway) or Candidate 3's incremental work.

## Code References

GitHub permalinks pinned to `cacc4a53c3f614ff373b1cf81e3e418c8a8aed6d` (pushed to `origin/main`):

- [`src/modules/ops/store/sync.store.ts`](https://github.com/beduno-app/beduno-fe/blob/cacc4a53c3f614ff373b1cf81e3e418c8a8aed6d/src/modules/ops/store/sync.store.ts) — conflict inbox (Candidate 1), replay/cycle (Candidate 2)
- [`src/shared/services/db.ts`](https://github.com/beduno-app/beduno-fe/blob/cacc4a53c3f614ff373b1cf81e3e418c8a8aed6d/src/shared/services/db.ts) — `DB_VERSION`, object stores (Candidate 1)
- [`src/shared/services/actionQueue.ts`](https://github.com/beduno-app/beduno-fe/blob/cacc4a53c3f614ff373b1cf81e3e418c8a8aed6d/src/shared/services/actionQueue.ts) — `clearQueue()` dead code (Candidate 5), `QueuedActionType` (Candidate 4b)
- [`src/shared/layouts/OpsLayout.vue`](https://github.com/beduno-app/beduno-fe/blob/cacc4a53c3f614ff373b1cf81e3e418c8a8aed6d/src/shared/layouts/OpsLayout.vue) — 5 import sites from `modules/ops` (Candidate 2 blast radius)
- [`src/modules/inhouse/store/inhouse.store.ts`](https://github.com/beduno-app/beduno-fe/blob/cacc4a53c3f614ff373b1cf81e3e418c8a8aed6d/src/modules/inhouse/store/inhouse.store.ts) — offline asymmetry (Candidate 4), `properties.store` reach-in (Candidate 3 category 3)
- [`src/modules/arrivals/store/arrivals.store.ts`](https://github.com/beduno-app/beduno-fe/blob/cacc4a53c3f614ff373b1cf81e3e418c8a8aed6d/src/modules/arrivals/store/arrivals.store.ts) — reference implementation for optimistic updates (Candidate 4)
- [`src/shared/composables/useEntityLookup.ts`](https://github.com/beduno-app/beduno-fe/blob/cacc4a53c3f614ff373b1cf81e3e418c8a8aed6d/src/shared/composables/useEntityLookup.ts) — existing shared resolver, scope boundary for Candidate 3
- [`src/modules/properties/views/PropertyDetail.vue`](https://github.com/beduno-app/beduno-fe/blob/cacc4a53c3f614ff373b1cf81e3e418c8a8aed6d/src/modules/properties/views/PropertyDetail.vue), [`src/modules/stays/views/StayDetail.vue`](https://github.com/beduno-app/beduno-fe/blob/cacc4a53c3f614ff373b1cf81e3e418c8a8aed6d/src/modules/stays/views/StayDetail.vue), [`src/modules/workers/views/WorkerDetail.vue`](https://github.com/beduno-app/beduno-fe/blob/cacc4a53c3f614ff373b1cf81e3e418c8a8aed6d/src/modules/workers/views/WorkerDetail.vue) — Candidate 3's cheap role-check slice
- [`src/modules/stays/views/CreateStay.vue`](https://github.com/beduno-app/beduno-fe/blob/cacc4a53c3f614ff373b1cf81e3e418c8a8aed6d/src/modules/stays/views/CreateStay.vue), [`src/modules/stays/views/BulkAssign.vue`](https://github.com/beduno-app/beduno-fe/blob/cacc4a53c3f614ff373b1cf81e3e418c8a8aed6d/src/modules/stays/views/BulkAssign.vue), [`src/modules/exports/views/ExportCenter.vue`](https://github.com/beduno-app/beduno-fe/blob/cacc4a53c3f614ff373b1cf81e3e418c8a8aed6d/src/modules/exports/views/ExportCenter.vue), [`src/modules/inspection/views/InspectionMode.vue`](https://github.com/beduno-app/beduno-fe/blob/cacc4a53c3f614ff373b1cf81e3e418c8a8aed6d/src/modules/inspection/views/InspectionMode.vue), [`src/modules/arrivals/components/MoveAction.vue`](https://github.com/beduno-app/beduno-fe/blob/cacc4a53c3f614ff373b1cf81e3e418c8a8aed6d/src/modules/arrivals/components/MoveAction.vue), [`src/modules/arrivals/views/ArrivalsToday.vue`](https://github.com/beduno-app/beduno-fe/blob/cacc4a53c3f614ff373b1cf81e3e418c8a8aed6d/src/modules/arrivals/views/ArrivalsToday.vue), [`src/modules/inhouse/views/InHouseView.vue`](https://github.com/beduno-app/beduno-fe/blob/cacc4a53c3f614ff373b1cf81e3e418c8a8aed6d/src/modules/inhouse/views/InHouseView.vue), [`src/modules/stays/views/StayPlanner.vue`](https://github.com/beduno-app/beduno-fe/blob/cacc4a53c3f614ff373b1cf81e3e418c8a8aed6d/src/modules/stays/views/StayPlanner.vue) — Candidate 3's display-data-lookup slice
- [`src/shared/components/DataTable.vue`](https://github.com/beduno-app/beduno-fe/blob/cacc4a53c3f614ff373b1cf81e3e418c8a8aed6d/src/shared/components/DataTable.vue), [`src/shared/components/index.ts`](https://github.com/beduno-app/beduno-fe/blob/cacc4a53c3f614ff373b1cf81e3e418c8a8aed6d/src/shared/components/index.ts) — Candidate 6
- `eslint.config.js` — no import-boundary plugin configured today (Candidate 3 enforcement gap)
- `context/foundation/test-plan.md` — Risk #3 (Candidate 1)
- `context/foundation/roadmap.md` — S-07 `durable-conflict-inbox` (Candidate 1)

## Architecture Insights

- The two strongest candidates (1 and 3) are both instances of the same underlying failure mode: **a correct design pattern was established once, then not consistently applied or enforced afterward** — Candidate 1 is "the conflict-resolution design refuses to auto-merge, but then loses the very decision it refused to make" (quoting `artifact-3-contributors.md`'s reading of the roadmap); Candidate 3 is "the CLAUDE.md rule existed, but nothing mechanically enforces it, so the same violation shape kept recurring." Both point at the same remedy category: pair the structural fix with an automated guard (a test, a lint rule) rather than relying on documentation alone — documentation alone has already been shown, in this repo's own history, not to prevent recurrence.
- Candidate 4's confirmed-omission finding is a useful corrective to how much weight to put on "maybe it was intentional" inferences in fast, single-session, AI-assisted commits: when the same commit builds the correct pattern for one twin (arrivals) and skips it for the other (inhouse) with no differentiating comment, the asymmetry is far more likely to be an artifact of drafting order than a considered trade-off. Worth keeping as a general calibration note for reading this repo's history elsewhere.
- The `useEntityLookup` boundary check (Candidate 3) is a reusable finding beyond this one candidate: the composable is correctly scoped to single-ID resolution and several violation sites already use it correctly for that sub-problem right next to the reach-in that isn't covered — so the fix isn't "use the thing that already exists," it's "build the sibling thing that doesn't."

## Historical Context (from prior changes)

- `context/changes/ops-arrival/research.md` — full offline-sync-flow deep dive; source of Candidates 1, 4, 5 and the E2E/test-coverage gaps folded into feasibility notes here.
- `context/map/repo-map.md`, `artifact-1-territory.md`, `artifact-2-structure.md`, `artifact-3-contributors.md` — repo-wide territory/structure/contributor synthesis; source of Candidates 2, 3, 6, and the (struck) dead-code candidate.
- `context/foundation/test-plan.md` (Risk #3) and `context/foundation/roadmap.md` (S-07) — independent prior triage of Candidate 1, confirming it as already-named and already-rated, not a new finding.
- `context/changes/arrival-day-proven/plan.md` — unimplemented, blocked on `E2E_TEST_*` secret provisioning; not a refactor candidate itself, but the reason Candidate 1/2's live-path behavior can't be proven end-to-end yet.

## Related Research

- `context/changes/testing-live-journey-beduno-be/research.md`, `context/changes/testing-conflict-engine-correctness/*`, `context/changes/stay-lifecycle-e2e/*` — active E2E test-authoring streams; not read in this pass, may intersect with Candidate 1/4 if their scope touches offline paths.

## Open Questions

1. **Candidate 6 (`DataTable.vue`)** had no history/feasibility sub-investigation run in this pass — only current-shape evidence was gathered (0 real usages, 10 hand-rolled tables). Before ranking it against the top 3 in a planning session, it's worth a quick check of *why* `DataTable.vue` was built and abandoned (single commit? later superseded?) and what its current API surface actually supports (sorting/pagination/filtering) versus what the 10 hand-rolled tables need — it may turn out `DataTable.vue` itself needs work before adoption is even viable.
2. **Candidate 2's option (a) vs (b)** (formalize `ops` as an exception vs. physically move it to `shared/`) is a real decision this research deliberately did not make. The blast radius favors (b) (small, mechanical), but the "no Pinia store in `shared/` today" wrinkle means (b) also sets a precedent for future infra-shaped modules — worth deciding explicitly rather than defaulting to whichever is less code to move.
3. **Candidate 3's display-data slice (11 sites)** needs a design decision this research intentionally stopped short of: should the new list-returning composables call each module's existing `*Api` directly (bypassing the store entirely, avoiding any Pinia cross-import), or should each module expose a narrowed, read-only subset of its own store for other modules to consume? Both are structurally valid; the choice affects whether the fix also changes each source module's own store shape.
4. **Candidate 4's `bulkCheckout`** needs a product decision (queue-integrate vs. explicit online-only), not just an engineering one — flagged in both the current research and the original ops-arrival research's Open Questions, still unresolved.
