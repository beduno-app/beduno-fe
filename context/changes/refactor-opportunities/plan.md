# Conflict Inbox Durability — Implementation Plan

## Overview

`context/changes/refactor-opportunities/research.md` ranked "conflict inbox durability" as the strongest refactor opportunity: a rejected offline action is currently held only in an in-memory Pinia `ref`, so it silently vanishes on reload with no audit trail — a direct violation of CLAUDE.md's "Everything is audited" rule and a named, rated risk (`test-plan.md` Risk #3, High impact / Medium likelihood; `roadmap.md` S-07). This plan makes conflicts durable in IndexedDB, mirroring the existing `actionQueue.ts` persistence pattern, and folds in the trivial dead-code cleanup (`clearQueue()`) the research flagged as free to do alongside.

This plan scopes **only** Candidate 1 (+ Candidate 5's dead-code cleanup) from the research's ranking. Candidates 2, 3, 4, and 6 are deliberately out of scope here — they remain in `research.md`'s ranking for a future change.

## Current State Analysis

- `src/modules/ops/store/sync.store.ts:27` — `conflicts` is `ref<SyncConflict[]>([])`, Pinia in-memory only.
- `SyncConflict` (`sync.store.ts:18-22`) is declared locally in the store file: `{ action: QueuedAction; error: string; detectedAt: string }` — no own `id`.
- `syncQueue()` (`sync.store.ts:64-97`): on replay failure, pushes to `conflicts.value` and calls `removeAction(action.id)` — the queued action is deleted from IndexedDB the moment it becomes a conflict, so the in-memory-only `conflicts` ref is the *only* remaining record of the rejection.
- `dismissConflict(index: number)` (`sync.store.ts:99-101`) and `clearConflicts()` (`sync.store.ts:103-105`) are synchronous array mutations (`splice`/reassign) — index-based, not id-based.
- `src/shared/services/db.ts` (61 lines): `DB_VERSION = 3`, singleton `_db` cache, `onupgradeneeded` branches per store (`workers`, `rooms`, `arrivals` with a v3 index migration, `meta`, `actionQueue` added at v2) — each gated by `if (!db.objectStoreNames.contains(name))`. No `conflicts` store exists.
- `src/shared/services/actionQueue.ts` (87 lines): CRUD functions against the `actionQueue` store, each opening `db` then wrapping a transaction in a promise — writes (`put`/`delete`/`clear`) resolve on `tx.oncomplete`, reads (`getAll`/`count`) resolve on `req.onsuccess`. `clearQueue()` (`:66-75`) has zero call sites anywhere in `src/` besides its own definition.
- `src/modules/ops/store/sync.store.spec.ts` (262 lines) fully `vi.mock`s `@/shared/services/actionQueue` (`getPendingActions`, `removeAction`, `getQueueLength` — not `clearQueue`/`enqueueAction`). Every conflict-related assertion today checks only the in-memory `conflicts` ref; no test exercises real IndexedDB persistence.
- No `fake-indexeddb` (or similar polyfill) is in `package.json`; no `setupFiles` is configured in `vite.config.ts`'s `test` block (`jsdom` has no native IndexedDB implementation).

## Desired End State

A rejected offline action survives a page reload: it is written to a new `conflicts` IndexedDB object store at the moment it's detected, the store hydrates `conflicts` from IndexedDB on load, and dismissing/clearing a conflict removes it from both memory and IndexedDB. Verification: open the app, force an action into conflict, reload, confirm the conflict is still shown in `ConflictInbox.vue` and present in IndexedDB (DevTools → Application → IndexedDB → `beduno-offline` → `conflicts`).

### Key Discoveries:

- `actionQueue.ts`'s promisification pattern (write→`tx.oncomplete`, read→`req.onsuccess`) is the established convention to mirror exactly — no new pattern needed.
- `db.ts`'s migration pattern (`if (!db.objectStoreNames.contains(name)) { db.createObjectStore(...) }`, one block per store, versioned by comment) extends cleanly for a fourth store.
- There is no client-side audit-event mechanism anywhere in the codebase (`src/modules/audit/` is read-only, fetching server-generated `AuditEvent` records). Extending "everything is audited" to a client-only action like dismissing a conflict would require a new backend endpoint — explicitly out of scope for this frontend-only repo. This plan closes the durability gap; it does not add a new audit-log entry for conflict actions.
- `vite.config.ts`'s `test` block has no `setupFiles` — a global IDB polyfill needs to be wired in before any spec can exercise real persistence.

## What We're NOT Doing

- Candidates 2 (`ops` module placement), 3 (cross-module store reach-ins), 4 (inhouse/arrivals offline asymmetry), and 6 (`DataTable.vue` adoption) — ranked in `research.md` but out of scope for this change.
- Adding a client-side audit-event mechanism for conflict dismissal/clearing — no existing pattern, needs a backend endpoint, not buildable in this repo alone.
- Waiting for `arrival-day-proven` (S-01)'s E2E secret provisioning to unblock — this plan proceeds now, substituting manual offline-toggle verification (see Open Risks & Assumptions below).
- Any change to `QueuedActionType`, `bulkCheckout`, or the offline queue's action set — this plan touches conflict *storage*, not the queue or replay dispatch logic itself (`replayAction()` is untouched).
- Migrating existing in-memory conflicts on upgrade — there is nothing to migrate; conflicts are ephemeral today, so a version bump with a fresh empty `conflicts` store is sufficient (no data loss on the migration itself, since there was never any durable data to carry forward).

## Implementation Approach

Add the new `conflicts` IndexedDB store and a small sibling service (`conflicts.ts`) that mirrors `actionQueue.ts`'s exact CRUD pattern, then swap `sync.store.ts`'s in-memory-only conflict handling for calls into that service, keeping the store's public interface (consumed by `ConflictInbox.vue`) essentially unchanged aside from `dismissConflict` moving from index-based to id-based removal. Test infrastructure (`fake-indexeddb`) is added first so every subsequent phase can be verified against real persistence rather than another full-module mock — directly addressing the gap the research flagged (today's tests never touch a real IndexedDB transaction).

## Critical Implementation Details

**Storage key shape.** `SyncConflict` gains a top-level `id: string` field (set to `action.id` at write time), matching every other store in `db.ts` which uses `keyPath: 'id'` (only `meta` uses `key`). This avoids a nested dot-path keyPath (`'action.id'`) and gives `ConflictInbox.vue` a stable key for `v-for`, replacing today's fragile index-based `dismissConflict(index)`.

**Store hydration timing.** Pinia setup-stores should not perform top-level async side effects in the store body. `conflicts` hydration is an explicit `hydrateConflicts()` action, called from the consuming component's `onMounted` (Phase 6) — not fired automatically when `useSyncStore()` is first invoked.

**Test isolation for fake-indexeddb.** `fake-indexeddb`'s in-memory database persists across tests within the same process. Each test in `sync.store.spec.ts` must delete/reopen the `beduno-offline` database (via `indexedDB.deleteDatabase(...)`) in `beforeEach`/`afterEach`, or conflict records will leak between test cases and produce false positives/negatives.

## Phase 1: Test infrastructure — fake-indexeddb

### Overview

Wire a real IndexedDB implementation into the Vitest/jsdom environment so subsequent phases can be tested against actual persistence instead of another full-module mock.

### Changes Required:

#### 1. Add the polyfill dependency

**File**: `package.json`

**Intent**: Add `fake-indexeddb` as a devDependency — it provides a spec-compliant in-memory IndexedDB implementation usable under jsdom.

**Contract**: New `devDependencies` entry, installed via `npm install --save-dev fake-indexeddb` (respects the repo's npm-only package-manager rule).

#### 2. Wire the global setup file

**File**: `vitest.setup.ts` (new, repo root, alongside `vite.config.ts`)

**Intent**: Install the polyfill globally so any test touching `indexedDB` (directly or via `db.ts`) gets a working implementation without per-spec setup.

**Contract**: `import 'fake-indexeddb/auto'` — this is the package's documented global-install entry point; it patches `globalThis.indexedDB`/`IDBKeyRange` before any test file runs.

#### 3. Register the setup file

**File**: `vite.config.ts`

**Intent**: Point Vitest's `test` config at the new setup file.

**Contract**: Add `setupFiles: ['./vitest.setup.ts']` to the existing `test: { passWithNoTests, environment: 'jsdom', exclude: [...] }` block (`vite.config.ts:8-12`).

### Success Criteria:

#### Automated Verification:

- Typecheck passes: `npm run typecheck`
- Lint passes: `npm run lint`
- Full existing unit test suite still passes unchanged: `npm test` (confirms the polyfill's presence doesn't break any currently-mocked spec)

#### Manual Verification:

- None — this phase is invisible until Phase 5 exercises it.

---

## Phase 2: IndexedDB schema — `conflicts` object store

### Overview

Add the fourth-generation object store that will hold durable conflict records.

### Changes Required:

#### 1. Bump the schema version and add the store

**File**: `src/shared/services/db.ts`

**Intent**: Add a `conflicts` object store following the exact same conditional-creation pattern as every other store in this file, so a fresh browser and an upgrading browser both end up with the store present.

**Contract**: `DB_VERSION` 3 → 4. New block after the existing `actionQueue` block (`db.ts:47-50`), same shape:
```
// Conflict inbox (v4)
if (!db.objectStoreNames.contains('conflicts')) {
  db.createObjectStore('conflicts', { keyPath: 'id' })
}
```
No indexes needed — `conflicts.ts` (Phase 3) only ever reads the full list or deletes by `id`.

### Success Criteria:

#### Automated Verification:

- Typecheck passes: `npm run typecheck`
- Lint passes: `npm run lint`
- Existing unit test suite still passes: `npm test`

#### Manual Verification:

- Open DevTools → Application → IndexedDB against a dev build, confirm `beduno-offline` now shows a `conflicts` store at version 4 (on a fresh profile or after triggering the upgrade on an existing one).

---

## Phase 3: Conflicts persistence service + dead-code cleanup

### Overview

Add the CRUD service for the new store, and remove the confirmed-dead `clearQueue()` export while `actionQueue.ts` is already in scope for this change.

### Changes Required:

#### 1. New conflicts CRUD service

**File**: `src/shared/services/conflicts.ts` (new)

**Intent**: Mirror `actionQueue.ts`'s exact promisification pattern for the `conflicts` store — a sibling service, not an extension of `actionQueue.ts`, since conflicts and the queue are distinct concerns with distinct stores (consistent with this file's existing one-service-per-store granularity).

**Contract**: `STORE = 'conflicts'`. Exports:
- `addConflict(conflict: SyncConflict): Promise<void>` — `put`, resolves on `tx.oncomplete` (mirrors `enqueueAction`'s write pattern).
- `getConflicts(): Promise<SyncConflict[]>` — `getAll`, resolves on `req.onsuccess` (mirrors `getPendingActions`).
- `removeConflict(id: string): Promise<void>` — `delete`, resolves on `tx.oncomplete` (mirrors `removeAction`).
- `clearConflicts(): Promise<void>` — `clear`, resolves on `tx.oncomplete` (mirrors the pattern `clearQueue()` used, before its removal below).
- `SyncConflict` type moves here from `sync.store.ts` (this module now owns its persistence contract, mirroring how `QueuedAction` is declared in `actionQueue.ts`): `{ id: string; action: QueuedAction; error: string; detectedAt: string }` — adds the top-level `id` field per the Critical Implementation Details storage-key decision.

#### 2. Remove dead code

**File**: `src/shared/services/actionQueue.ts`

**Intent**: Delete `clearQueue()` (`:66-75`) — confirmed zero call sites anywhere in `src/` besides its own definition, in both this research and the prior `ops-arrival` research.

**Contract**: Remove the function and its export; no other file imports it, so no call-site updates are needed.

### Success Criteria:

#### Automated Verification:

- Typecheck passes: `npm run typecheck`
- Lint passes: `npm run lint`
- Existing unit test suite still passes: `npm test`
- `grep -rn "clearQueue" src/` returns no matches

#### Manual Verification:

- None — no consumer-visible behavior change yet (wired up in Phase 4).

---

## Phase 4: `sync.store.ts` — async, IDB-backed conflict handling

### Overview

Swap the in-memory-only conflict mutations for calls into the new `conflicts.ts` service, and add explicit hydration.

### Changes Required:

#### 1. Import and type changes

**File**: `src/modules/ops/store/sync.store.ts`

**Intent**: Replace the locally-declared `SyncConflict` type with the one now owned by `conflicts.ts`; import the new CRUD functions.

**Contract**: Remove the local `SyncConflict` interface (`:18-22`); `import type { SyncConflict } from '@/shared/services/conflicts'`; `import { addConflict, getConflicts, removeConflict, clearConflicts as clearConflictsInDb } from '@/shared/services/conflicts'` (aliased to avoid colliding with the store's own `clearConflicts` action name).

#### 2. Conflict-push logic in `syncQueue()`

**File**: `src/modules/ops/store/sync.store.ts`

**Intent**: Persist a conflict to IndexedDB at the moment it's detected, not just push it into the in-memory ref — this is the core fix.

**Contract**: In the `catch` block (`:79-87`), after building the conflict object (now including `id: action.id`), `await addConflict(conflict)` before (or alongside) pushing to `conflicts.value`. The in-memory push stays — it keeps the UI synchronously reactive without waiting on a re-fetch round-trip; IndexedDB is the durability layer, not the sole source of truth for the current session's reactivity.

#### 3. `dismissConflict` — index-based to id-based

**File**: `src/modules/ops/store/sync.store.ts`

**Intent**: Dismissing a conflict must remove it from IndexedDB too, not just splice the in-memory array — and needs a stable identifier to do so, which index was never a reliable proxy for.

**Contract**: `dismissConflict(id: string)` (was `dismissConflict(index: number)`) — `await removeConflict(id)`, then `conflicts.value = conflicts.value.filter(c => c.id !== id)`. This is a breaking signature change for the store's public action — `ConflictInbox.vue` (Phase 6) is the only consumer and is updated in the same change.

#### 4. `clearConflicts` — persist the clear

**File**: `src/modules/ops/store/sync.store.ts`

**Intent**: Clearing all conflicts must empty IndexedDB too.

**Contract**: `await clearConflictsInDb()`, then `conflicts.value = []`.

#### 5. Hydration action

**File**: `src/modules/ops/store/sync.store.ts`

**Intent**: Give consumers an explicit way to load persisted conflicts on mount, per the Critical Implementation Details note on not doing async work in the store's setup body.

**Contract**: New action `async function hydrateConflicts() { conflicts.value = await getConflicts() }`, added to the store's returned surface (`:107-116`).

### Success Criteria:

#### Automated Verification:

- Typecheck passes: `npm run typecheck`
- Lint passes: `npm run lint`
- Unit tests pass (updated in Phase 5): `npm test`

#### Manual Verification:

- None yet — covered in Phase 6 once the component wiring lands.

---

## Phase 5: `sync.store.spec.ts` — rewrite against real IndexedDB

### Overview

Replace conflict-related test assertions (which today check only the in-memory ref) with assertions against real, fake-indexeddb-backed persistence — the actual regression guard this plan exists to add.

### Changes Required:

#### 1. Test isolation setup

**File**: `src/modules/ops/store/sync.store.spec.ts`

**Intent**: Ensure each test starts from a clean, freshly-migrated database, per the Critical Implementation Details note on `fake-indexeddb` test isolation.

**Contract**: Add a `beforeEach`/`afterEach` pair that deletes the `beduno-offline` database (`indexedDB.deleteDatabase('beduno-offline')`, wrapped in a promise resolving on `onsuccess`/`onerror`/`onblocked`). The existing `vi.mock('@/shared/services/actionQueue', ...)` (`:6-10`) stays exactly as-is — the queue side is out of scope for this plan; only `@/shared/services/db` and `@/shared/services/conflicts` run unmocked, against the polyfill installed in Phase 1.

#### 2. Update existing conflict assertions

**File**: `src/modules/ops/store/sync.store.spec.ts`

**Intent**: The existing four conflict-related test cases ("moves failed action to conflict inbox" `:146-160`, "handles mixed success and conflict" `:162-178`, `dismissConflict()` `:221-233`, `clearConflicts()` `:235-250`) must still pass, now exercising real persistence underneath.

**Contract**: `await` the now-async store actions; `dismissConflict(0)` → `dismissConflict(store.conflicts[0].id)` (signature change from Phase 4.3); assertions on `store.conflicts` stay structurally the same (still an array), but each test also calls `getConflicts()` directly from `conflicts.ts` after the store action, to assert IndexedDB itself reflects the expected state — not just the in-memory ref.

#### 3. New persistence-specific test cases

**File**: `src/modules/ops/store/sync.store.spec.ts`

**Intent**: Directly test the behavior this plan exists to fix — that a conflict survives what a reload does (a fresh store instance with no prior in-memory state).

**Contract**: New `describe('conflict durability')` block with at least:
- "a conflict persists across a fresh store instance" — sync a failing action on one `useSyncStore()` instance (via `setActivePinia(createPinia())` between instances, matching this file's existing Pinia setup pattern), then create a second instance and call `hydrateConflicts()`, assert the conflict is present.
- "dismissing a conflict removes it from IndexedDB, not just memory" — dismiss, then call `getConflicts()` directly and assert it's empty.

### Success Criteria:

#### Automated Verification:

- Typecheck passes: `npm run typecheck`
- Lint passes: `npm run lint`
- Full unit test suite passes, including the new durability tests: `npm test`

#### Manual Verification:

- None — this phase is itself the automated verification layer for Phase 4.

---

## Phase 6: `ConflictInbox.vue` wiring + manual verification + roadmap sync

### Overview

Wire hydration into the component that actually displays conflicts, verify the end-to-end behavior manually (since `arrival-day-proven`'s E2E path remains blocked), and close out the roadmap bookkeeping.

### Changes Required:

#### 1. Hydrate on mount

**File**: `src/modules/ops/components/ConflictInbox.vue` (path per `research.md`'s Code References — confirm exact path during implementation if it has moved)

**Intent**: Show persisted conflicts from a prior session immediately on load, not only after the next successful `syncQueue()` call.

**Contract**: Call `syncStore.hydrateConflicts()` in the component's `onMounted` hook (or wherever its existing setup logic runs), alongside whatever it already does today.

#### 2. Update `dismissConflict` call sites

**File**: `src/modules/ops/components/ConflictInbox.vue`

**Intent**: Match the store's new id-based signature (Phase 4.3).

**Contract**: Any `v-for` over `conflicts` keys by `conflict.id` (replacing index-based `:key` if that's what's there today); dismiss button handlers pass `conflict.id` instead of the loop index.

### Success Criteria:

#### Automated Verification:

- Typecheck passes: `npm run typecheck`
- Lint passes: `npm run lint`
- Build succeeds: `npm run build`
- Full unit test suite passes: `npm test`

#### Manual Verification:

- In a local dev build, force an offline action into conflict (e.g., go offline, queue a check-in for a worker already checked in, come back online, let `syncQueue()` run and reject it), confirm it appears in the conflict inbox.
- Reload the page. Confirm the conflict is still visible in the inbox (this is the core behavior this plan adds).
- Inspect DevTools → Application → IndexedDB → `beduno-offline` → `conflicts` and confirm the record is present with the expected shape.
- Dismiss the conflict, reload again, confirm it's gone from both the UI and IndexedDB.

**Implementation Note**: After this phase's automated verification passes, pause here for manual confirmation from the human that the manual testing above was successful — this is the last phase.

---

## Testing Strategy

### Unit Tests:

- `conflicts.ts` CRUD functions, exercised indirectly through `sync.store.spec.ts`'s durability tests (Phase 5) — no separate spec file, matching `actionQueue.ts`'s existing pattern of having no direct unit test of its own (only consumers test it, now for real instead of via mock).
- `sync.store.spec.ts`'s existing conflict-handling tests, updated to assert against real IndexedDB state in addition to the in-memory ref.

### Integration Tests:

- None new — this repo has no integration test layer between unit (Vitest) and E2E (Playwright); the manual verification steps in Phase 6 stand in for that layer here, consistent with how `arrival-day-proven`'s equivalent path is gated.

### Manual Testing Steps:

1. Force an action into conflict (offline queue + a rejecting scenario), confirm it shows in `ConflictInbox.vue`.
2. Reload, confirm the conflict persists.
3. Inspect IndexedDB directly to confirm the `conflicts` store holds the record.
4. Dismiss and reload again, confirm it's gone from both UI and IndexedDB.
5. Repeat with `clearConflicts()` (if a "clear all" UI action exists) instead of a single dismiss.

## Performance Considerations

None expected — conflict volume is inherently small (one entry per rejected replay, realistically single digits between reviews), and all new operations mirror `actionQueue.ts`'s existing IndexedDB access pattern already used at equal or greater volume.

## Migration Notes

`DB_VERSION` 3 → 4 is additive only — a new empty object store on top of existing ones. No existing data needs transformation; the `onupgradeneeded` branch for `conflicts` runs unconditionally on any client below v4, identical in shape to how `actionQueue`'s v2 store was added.

## References

- Related research: `context/changes/refactor-opportunities/research.md` (Candidate 1, ranked #1)
- Related research: `context/changes/ops-arrival/research.md` (original technical-debt finding, §Technical debt 1)
- Roadmap item: `context/foundation/roadmap.md` S-07 (`durable-conflict-inbox`) — flipped to `planning` as part of this plan (see Open Risks & Assumptions for the manual-sync note)
- Test-plan risk: `context/foundation/test-plan.md` Risk #3 (Offline durability, Phase 3, `not started`)
- Pattern to mirror: `src/shared/services/actionQueue.ts` (full file — CRUD/promisification convention)

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Test infrastructure — fake-indexeddb

#### Automated

- [ ] 1.1 Typecheck passes: `npm run typecheck`
- [ ] 1.2 Lint passes: `npm run lint`
- [ ] 1.3 Full existing unit test suite still passes unchanged: `npm test`

### Phase 2: IndexedDB schema — `conflicts` object store

#### Automated

- [ ] 2.1 Typecheck passes: `npm run typecheck`
- [ ] 2.2 Lint passes: `npm run lint`
- [ ] 2.3 Existing unit test suite still passes: `npm test`

#### Manual

- [ ] 2.4 Confirm `beduno-offline` shows a `conflicts` store at version 4 in DevTools

### Phase 3: Conflicts persistence service + dead-code cleanup

#### Automated

- [ ] 3.1 Typecheck passes: `npm run typecheck`
- [ ] 3.2 Lint passes: `npm run lint`
- [ ] 3.3 Existing unit test suite still passes: `npm test`
- [ ] 3.4 `grep -rn "clearQueue" src/` returns no matches

### Phase 4: `sync.store.ts` — async, IDB-backed conflict handling

#### Automated

- [ ] 4.1 Typecheck passes: `npm run typecheck`
- [ ] 4.2 Lint passes: `npm run lint`
- [ ] 4.3 Unit tests pass: `npm test`

### Phase 5: `sync.store.spec.ts` — rewrite against real IndexedDB

#### Automated

- [ ] 5.1 Typecheck passes: `npm run typecheck`
- [ ] 5.2 Lint passes: `npm run lint`
- [ ] 5.3 Full unit test suite passes, including new durability tests: `npm test`

### Phase 6: `ConflictInbox.vue` wiring + manual verification + roadmap sync

#### Automated

- [ ] 6.1 Typecheck passes: `npm run typecheck`
- [ ] 6.2 Lint passes: `npm run lint`
- [ ] 6.3 Build succeeds: `npm run build`
- [ ] 6.4 Full unit test suite passes: `npm test`

#### Manual

- [ ] 6.5 Force a conflict, confirm it appears in the inbox
- [ ] 6.6 Reload, confirm the conflict persists in the UI
- [ ] 6.7 Inspect IndexedDB, confirm the record is present
- [ ] 6.8 Dismiss, reload, confirm it's gone from both UI and IndexedDB

## Open Risks & Assumptions

- **Proceeding ahead of roadmap S-07's listed prerequisite (S-01, `arrival-day-proven`).** The roadmap's own risk note sequences S-07 after S-01 so the replay path is proven (via automated E2E) before its payload structure changes. S-01 remains blocked on `E2E_TEST_*` secret provisioning. This plan proceeds anyway, substituting the manual verification steps in Phase 6 for that automated proof — a real but weaker guarantee than the roadmap's original sequencing intended. If `arrival-day-proven` unblocks later, its E2E suite should be extended to cover the reload-durability scenario this plan adds.
- **Client-side audit trail remains unaddressed.** This plan closes the durability gap (conflicts survive a reload) but does not add an audit-log entry for conflict detection/dismissal, since no client-side audit mechanism exists in this repo today and building one would require a new backend endpoint — out of scope here. If "everything is audited" is meant to extend to this action, that's a separate, backend-coordinated change.
- **`ConflictInbox.vue`'s exact current file path** is taken from `research.md`'s Code References; confirm it hasn't moved before starting Phase 6.
- **Roadmap sync for this change is manual, not automatic.** `/10x-plan`'s standard roadmap-sync step matches on an exact change-id string; this change folder is `refactor-opportunities`, while the roadmap item's Change ID is `durable-conflict-inbox` — they don't match, so the automatic lookup would silently skip. S-07's status was flipped to `planning` manually as part of writing this plan; the same manual step will be needed at `/10x-implement` time to advance it further (e.g., to `done`) once all phases land.
