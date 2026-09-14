# Prove Queued Check-In Replays On Reconnect — Implementation Plan

## Overview

`arrivals.store.ts:70-84` already queues a `CHECK_IN` action to IndexedDB when
offline and shows an optimistic success toast; `sync.store.ts:64-97` already
replays it against `beduno-be` when `OpsLayout.vue`'s `online` listener fires.
Both are unit-tested with mocks. What has never been proven is the real thing:
offline queue → browser reconnect → live HTTP round-trip → queue drained. This
plan adds the one e2e spec that proves it, closing S-01's last gap.

## Current State Analysis

- `e2e/arrival-day.spec.ts` proves online manual check-in against the live API
  but never touches `context.setOffline()` — confirmed via `grep -rn
  "setOffline\|offline\|online" e2e/` returning zero matches anywhere in the
  suite.
- `arrivals.store.ts:70-84`'s `checkIn()` branches purely on `navigator.onLine`.
  Offline, it calls `queueOffline()` (`:65-68`, which calls `enqueueAction` then
  `useSyncStore().refreshQueueLength()`) and returns an **optimistic** local
  update — the UI shows `t('arrivals.checkInSuccess')` ("Zameldowano
  pomyślnie.") identically whether the action was actually sent or merely
  queued. That toast is not usable as proof of replay.
- Replay is triggered from exactly one place: `OpsLayout.vue:50-58`'s
  `onOnline()`, registered on the native `online` event (`OpsLayout.vue:69`).
  It calls `syncStore.syncQueue()` (`sync.store.ts:64-97`), which replays every
  pending action in order and shows either `offline.syncComplete`
  ("Synchronizacja zakończona.") or, if any action conflicted,
  `offline.syncWithConflicts` ("Synchronizacja zakończona. {count} akcja(-e)
  wymaga sprawdzenia.").
- `sync.store.spec.ts` and `arrivals.store.spec.ts` already fully prove the
  replay call-shape, conflict routing, and enqueue behavior — all against
  mocked `actionQueue`/API. What they cannot prove: a real `online` event
  firing the real trigger, real IndexedDB persistence, and a real network
  round-trip against `beduno-be`.
- `e2e/` runs against `npm run dev` (`playwright.config.ts`'s `webServer`), and
  `vite-plugin-pwa`'s `devOptions.enabled` defaults to `false` (unset in
  `vite.config.ts:19-20`), so no service worker is registered during e2e runs.
  `context.setOffline()` will behave as a genuine network failure/restore with
  no SW-cache interference.
- `AUTHENTICATED_SPECS` in `playwright.config.ts:4` is
  `/(smoke|arrival-day|nightly-list|inspection-day)\.spec\.ts$/` — a filename
  must literally end in one of those four suffixes to get `storageState` and
  run under the authenticated projects.
- CI wiring gap, unrelated to this change but blocking it too:
  `.github/workflows/ci.yml`'s E2E step only passes `E2E_TEST_EMAIL`,
  `E2E_TEST_PASSWORD`, and `VITE_DEV_PROXY_TARGET` — `E2E_ARRIVAL_WORKER_ID`
  (read by the existing `arrival-day.spec.ts`) and `E2E_OCCUPIED_ROOM_NUMBER`
  (read by `nightly-list.spec.ts`) are never passed through, confirmed via
  `grep -n "E2E_ARRIVAL_WORKER_ID\|E2E_OCCUPIED_ROOM_NUMBER" .github/workflows/ci.yml`
  returning nothing. Those two specs' fixture reads have been dead in CI since
  they were written.

## Desired End State

`e2e/offline-arrival-day.spec.ts` exists, runs under the authenticated
projects, and — once `E2E_TEST_EMAIL`/`E2E_TEST_PASSWORD` and
`E2E_ARRIVAL_OFFLINE_WORKER_ID` are provisioned — proves: offline check-in
queues durably (IndexedDB `actionQueue` gains one entry), reconnect drains the
queue (entry count returns to 0) and shows the success sync toast, and a
conflict on replay fails the test rather than passing silently. CI's E2E step
passes through all three currently-dangling fixture env vars, including the
new one.

### Key Discoveries:

- Optimistic offline UI means the check-in toast is not an oracle for replay
  success — `arrivals.store.ts:73-77`.
- `context.setOffline(false)` needs to trigger a real Chromium `online` event
  for `OpsLayout.vue:69`'s listener to fire — this is standard CDP behavior,
  not something this plan needs to work around.
- `db.ts:6-7,37-39`: `beduno-offline` v2, `actionQueue` store, keyPath `id` —
  no app-exposed helper for reading it from a test; the spec talks to
  IndexedDB directly via `page.evaluate()`.
- CI has silently never run the two existing fixture-dependent specs to
  completion (env vars never reached the process) — this plan fixes that
  alongside adding the third.

## What We're NOT Doing

- Not testing a **rejected** replay surviving a page reload (conflict-inbox
  persistence) — that's Risk #3 / rollout Phase 3 ("Offline durability"),
  scoped to the integration layer with real IndexedDB, not e2e. Confirmed
  distinct via `test-plan.md:47,64,79` — this plan's scenario (a successful
  replay reaching the live API) isn't named as a risk there at all.
- Not testing offline `NO_SHOW` or `MOVE` replay — same mechanism, but out of
  scope; `CHECK_IN` is what S-01 names.
- Not adding service-worker/production-build e2e coverage — the harness runs
  against the dev server by design (`playwright.config.ts`'s `webServer`).
- Not provisioning `E2E_TEST_EMAIL`/`E2E_TEST_PASSWORD` or the new fixture
  worker on `beduno-be` — that's a team action, tracked as an external
  blocker like the two rollout phases before it.

## Implementation Approach

One phase writes the spec and fixes the CI wiring gap together, since the new
fixture var would repeat the same dead-wiring bug if added alone. A second,
small phase updates the e2e cookbook with this oracle pattern — offline UI
state is optimistic, so proof-of-replay needs a structural signal (IndexedDB)
plus a UI signal (the distinct sync-complete toast), not the action's own
success toast.

## Critical Implementation Details

**Oracle, not implementation, is the hard part here.** The action's own
success toast (`arrivals.checkInSuccess`) fires identically whether the
`CHECK_IN` was queued or actually sent — it is never valid proof of replay.
The only valid proof is (a) the `actionQueue` IndexedDB entry existing while
offline and being gone after reconnect, and (b) the distinct
`offline.syncComplete` toast, not `offline.syncWithConflicts`, appearing after
reconnect. Asserting specifically for the success-toast text (rather than "a
toast appeared") is what turns a conflict into a hard test failure without any
extra branching logic.

## Phase 1: Offline replay e2e spec + CI env wiring

### Overview

Add the e2e spec proving offline queue → reconnect → live replay, and fix the
CI env-passthrough gap for all three fixture vars this and the sibling specs
need.

### Changes Required:

#### 1. New offline check-in replay spec

**File**: `e2e/offline-arrival-day.spec.ts`

**Intent**: Prove a `CHECK_IN` queued while offline is durably persisted, then
successfully replayed against the live API on reconnect — using IndexedDB
inspection plus the sync-complete toast as the oracle, never the check-in
toast.

**Contract**: Reads `E2E_ARRIVAL_OFFLINE_WORKER_ID` from env, throwing a clear
setup error if unset (mirror `arrival-day.spec.ts:5-11`'s pattern exactly,
substituting the var name). Overrides the test timeout (`test.setTimeout`) to
account for a real network round-trip beyond Playwright's 30s default —
60000ms is enough headroom without masking a genuine hang. Flow: navigate to
`/ops/arrivals`, select the property (`page.getByRole('combobox')` +
`selectOption({ index: 1 })`, matching `arrival-day.spec.ts:16-18`), call
`page.context().setOffline(true)`, perform the manual-ID check-in exactly as
`arrival-day.spec.ts:27-29` does, assert the offline banner is visible
(`page.getByText` on the Polish `offline.offlineBanner` text, or the
`.offline-banner--offline`/`.offline-banner--queued` class), then read the
`actionQueue` object store's count via a direct `indexedDB.open('beduno-offline', 2)`
call inside `page.evaluate()` (no app-exposed helper exists) and assert it is
`1`. This is the one non-obvious piece — no existing spec talks to IndexedDB
directly, so the raw open/transaction/count promise wrapper needs to be
written inline:

```js
async function actionQueueCount(page) {
  return page.evaluate(
    () =>
      new Promise((resolve, reject) => {
        const req = indexedDB.open('beduno-offline', 2)
        req.onerror = () => reject(req.error)
        req.onsuccess = () => {
          const tx = req.result.transaction('actionQueue', 'readonly')
          const countReq = tx.objectStore('actionQueue').count()
          countReq.onsuccess = () => resolve(countReq.result)
          countReq.onerror = () => reject(countReq.error)
        }
      }),
  )
}
```

Then call `page.context().setOffline(false)`, assert
`page.getByText('Synchronizacja zakończona.')` becomes visible (the specific
success variant — if a conflict occurred instead, `syncWithConflicts`' text
appears and this assertion times out, which is the intended hard failure), and
assert `actionQueueCount(page)` is back to `0`.

#### 2. CI fixture-var wiring

**File**: `.github/workflows/ci.yml`

**Intent**: Pass the three currently-dangling e2e fixture vars — two
pre-existing (`E2E_ARRIVAL_WORKER_ID`, `E2E_OCCUPIED_ROOM_NUMBER`) and the new
one this phase adds — through to the E2E step's process environment, matching
how `E2E_TEST_EMAIL`/`E2E_TEST_PASSWORD` are already wired.

**Contract**: Add three lines to the existing `env:` block under the "E2E
tests" step (`ci.yml:36-42`). Use `vars.` (repo variables), not `secrets.`,
for all three — they're fixture identifiers (a worker's internal ID, a room
number), not credentials, matching the existing `VITE_DEV_PROXY_TARGET:
${{ vars.VITE_DEV_PROXY_TARGET }}` precedent rather than the `secrets.`
pattern used for the email/password pair.

#### 3. Change record

**File**: `context/changes/arrival-day-proven/change.md`

**Intent**: Document the same external blocker this change inherits (secrets
+ fixture still unprovisioned) so `/10x-implement` can apply the established
"ship now, leave manual items unchecked" precedent without re-litigating it.

**Contract**: Append a Notes line naming `E2E_TEST_EMAIL`/`E2E_TEST_PASSWORD`
and the new `E2E_ARRIVAL_OFFLINE_WORKER_ID` as the blocker, referencing the
same precedent from `live-api-e2e-harness` and `testing-live-journey-beduno-be`.

### Success Criteria:

#### Automated Verification:

- Typecheck passes: `npm run typecheck`
- Lint passes on the e2e suite: `npx eslint e2e/`
- Unit suite unaffected: `npm test`
- New spec is discovered under the authenticated projects, not the
  unauthenticated ones: `npx playwright test --list` shows
  `offline-arrival-day.spec.ts` under `chromium-authenticated` and `Mobile
  Chrome-authenticated` only
- `ci.yml` is valid YAML and the new `env:` entries are present: `grep -n
  "E2E_ARRIVAL_WORKER_ID\|E2E_OCCUPIED_ROOM_NUMBER\|E2E_ARRIVAL_OFFLINE_WORKER_ID"
  .github/workflows/ci.yml` returns three matches

#### Manual Verification:

- Run `offline-arrival-day.spec.ts` against `beduno-be` with real credentials
  and a real `EXPECTED_TODAY` fixture worker, confirm it passes — blocked
  until `E2E_TEST_EMAIL`/`E2E_TEST_PASSWORD`/`E2E_ARRIVAL_OFFLINE_WORKER_ID`
  are provisioned, same as the last two rollout phases

---

## Phase 2: Cookbook + close out

### Overview

Record the offline/reconnect oracle pattern for future e2e work and close the
change.

### Changes Required:

#### 1. Cookbook update

**File**: `context/foundation/test-plan.md`

**Intent**: Fill in the §6.3 offline/IndexedDB e2e pattern stub with what this
phase proved, so a future contributor writing an offline-dependent e2e test
doesn't rediscover the optimistic-toast gotcha from scratch.

**Contract**: Append a short entry to §6.3 naming: the oracle gotcha (don't
trust the action's own toast when the UI is optimistic), the two-signal proof
pattern (IndexedDB count + the specific sync-complete toast text), and a
reference to `e2e/offline-arrival-day.spec.ts` as the worked example.

### Success Criteria:

#### Automated Verification:

- `test-plan.md` still parses as valid markdown with its existing section
  structure intact (spot-check: `grep -c "^## " context/foundation/test-plan.md`
  unchanged from before this phase)

#### Manual Verification:

- None — this phase is documentation only

---

## Testing Strategy

### Unit Tests:

- None new — `sync.store.spec.ts` and `arrivals.store.spec.ts` already prove
  the mocked replay/enqueue logic this e2e spec builds on.

### Integration Tests:

- None — this risk is proven at the e2e layer per the plan's cost×signal
  reasoning (a real browser `online` event and real IndexedDB are exactly what
  a lower layer can't give).

### Manual Testing Steps:

1. Once secrets/fixture land, run `npx playwright test offline-arrival-day` and
   confirm both the IndexedDB and toast assertions pass.
2. Manually verify in a real browser: check in a worker while offline, confirm
   the offline banner shows a queued count, go back online, confirm the sync
   toast appears and the worker's status reflects `CHECKED_IN` server-side.

## Performance Considerations

None beyond the extended per-test timeout already covered in Phase 1's
Contract.

## Migration Notes

Not applicable — no data model or schema changes.

## References

- Sibling spec this mirrors: `e2e/arrival-day.spec.ts`
- Replay trigger: `src/shared/layouts/OpsLayout.vue:50-58,69`
- Replay logic: `src/modules/ops/store/sync.store.ts:64-97`
- Queue write + optimistic update: `src/modules/arrivals/store/arrivals.store.ts:65-84`
- IndexedDB schema: `src/shared/services/db.ts:6-7,37-39`
- Queue shape: `src/shared/services/actionQueue.ts:10-16`
- Roadmap item this closes: `context/foundation/roadmap.md` S-01
  (`arrival-day-proven`)

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Offline replay e2e spec + CI env wiring

#### Automated

- [ ] 1.1 Typecheck passes: `npm run typecheck`
- [ ] 1.2 Lint passes on the e2e suite: `npx eslint e2e/`
- [ ] 1.3 Unit suite unaffected: `npm test`
- [ ] 1.4 New spec discovered under authenticated projects only: `npx playwright test --list`
- [ ] 1.5 CI env wiring present: grep confirms three fixture vars in `ci.yml`

#### Manual

- [ ] 1.6 Run `offline-arrival-day.spec.ts` against beduno-be with real credentials/fixture, confirm pass

### Phase 2: Cookbook + close out

#### Automated

- [ ] 2.1 `test-plan.md` section structure intact after the §6.3 edit
