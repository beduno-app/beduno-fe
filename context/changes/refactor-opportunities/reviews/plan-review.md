<!-- PLAN-REVIEW-REPORT -->
# Plan Review: Conflict Inbox Durability

- **Plan**: context/changes/refactor-opportunities/plan.md
- **Mode**: Deep
- **Date**: 2026-09-14
- **Verdict**: REVISE
- **Findings**: 1 critical 0 warnings 1 observation

## Verdicts

| Dimension | Verdict |
|-----------|---------|
| End-State Alignment | PASS |
| Lean Execution | PASS |
| Architectural Fitness | PASS |
| Blind Spots | FAIL |
| Plan Completeness | WARNING |

## Grounding

6/6 paths ✓ (db.ts, actionQueue.ts, sync.store.ts, sync.store.spec.ts, ConflictInbox.vue, vite.config.ts), 7/7 symbols ✓ (DB_VERSION=3, dismissConflict/clearConflicts single call site each in ConflictInbox.vue, SyncConflict declared sync.store.ts:18, useSyncStore consumers enumerated, zero clearQueue call sites, zero `.close()` calls in src/shared/services, npm scripts lint/typecheck/test/build all match), brief↔plan ✓

## Findings

### F1 — Phase 5's test-isolation strategy can't work against db.ts's singleton

- **Severity**: ❌ CRITICAL
- **Impact**: 🔬 HIGH — architectural stakes; think carefully before deciding
- **Dimension**: Blind Spots
- **Location**: Phase 5 — sync.store.spec.ts rewrite
- **Detail**: db.ts:9 caches the database connection in a module-level singleton (`let _db: IDBDatabase | null = null`) that is never closed anywhere in the codebase (confirmed: zero `.close()` calls in src/shared/services). `openDb()` (db.ts:11-12) short-circuits to the cached `_db` once set. Phase 5's contract calls for `beforeEach`/`afterEach` to run `indexedDB.deleteDatabase('beduno-offline')` between tests — but `deleteDatabase()` blocks (fires `onblocked`, never resolves) while any connection to that database stays open. Since `_db` is never closed, the first test's connection stays open for the rest of the file; every later delete call hangs or fires `onblocked` indefinitely. Even if it somehow completed, `openDb()` would still short-circuit-return the stale `_db` reference afterward, since it never re-checks connection validity. As written, Phase 5 produces hanging/timing-out tests, not the per-test isolation the plan promises.
- **Fix A ⭐ Recommended**: Clear store contents instead of deleting the database
  - Strength: No production code changes needed purely for test support; works with the singleton as-is; matches how a real browser session behaves (one open connection for the app's lifetime).
  - Tradeoff: Doesn't reset the schema itself, so a test can't simulate "fresh browser, migration from v3" — fine here since Phase 5 only tests conflict CRUD, not migration.
  - Confidence: HIGH — directly resolves the identified blocking mechanism without touching db.ts.
  - Blind spot: A future phase testing the actual v3→v4 upgrade path would need a different approach.
- **Fix B**: Add a test-only reset export to db.ts
  - Strength: Enables true "fresh database" tests per case, including migration-path testing later.
  - Tradeoff: Adds test-only surface (`closeDb()`/reset function) to production code that the plan otherwise keeps clean of test concerns.
  - Confidence: MEDIUM — resolves the block in principle, but fake-indexeddb's close()/deleteDatabase() timing under Vitest's async teardown is unverified here.
  - Blind spot: Whether deleteDatabase() fires onsuccess promptly enough for Vitest's afterEach timing is unverified.
- **Decision**: PENDING

### F2 — Phase 6's hydration hook has no existing lifecycle to hook into

- **Severity**: 📝 OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Plan Completeness
- **Location**: Phase 6.1
- **Detail**: Contract says "call hydrateConflicts() in onMounted (or wherever its existing setup logic runs)." Grounding: ConflictInbox.vue (read in full) has no `<script setup>` lifecycle hooks today — just `useI18n()` and `useSyncStore()`. There's no existing hook to extend; the implementer needs a fresh `import { onMounted } from 'vue'` plus the hook itself.
- **Fix**: Tighten the contract to state explicitly that no onMounted exists yet and one must be added, including the vue import.
- **Decision**: PENDING
