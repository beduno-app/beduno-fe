# Live-Journey Proof Against beduno-be — Plan Brief

> Full plan: `context/changes/testing-live-journey-beduno-be/plan.md`
> Research: `context/changes/testing-live-journey-beduno-be/research.md`

## What & Why

Rollout Phase 2 of `context/foundation/test-plan.md`, protecting against
Risk #2 — a slice that "already works" in code gets waved through without
proof against the live API. Research found this is really three separate
risks (Arrival Day, Nightly List, Inspection Day each fail differently),
so each gets its own phase.

## Starting Point

The F-03 authenticated Playwright harness (auth setup, authenticated
project pair, `smoke.spec.ts`) is complete and directly reusable. The
three existing journey specs (`checkin`, `exports`, `inspection`) are
guard-only. All three new journeys remain blocked from actually *running*
by the still-unprovisioned `E2E_TEST_EMAIL`/`E2E_TEST_PASSWORD` secrets —
this plan ships the specs anyway, per F-03's own precedent.

## Desired End State

Three new e2e specs exist, are correctly discovered under the
authenticated Playwright projects, and are ready to run the moment the
secrets exist. `playwright.config.ts` and `test-plan.md` are updated to
reflect the pattern.

## Key Decisions Made

| Decision | Choice | Why (1 sentence) | Source |
|---|---|---|---|
| Phase organization | One phase per journey, ascending cost/risk | Each phase ships a complete, independently-verifiable journey | Plan (user-confirmed) |
| Inspection Day's missing cancel endpoint | Include it; always attempt `complete()` in `afterEach`, accept narrow residual risk | Matches F-03's precedent of shipping with a documented residual risk rather than blocking on unverified backend behavior | Plan (user-confirmed) |
| Arrival Day's type-level crash risk | Diagnostic-first — test now, don't pre-harden | No confirmed evidence the live payload is ever malformed; a real crash is the proof, not a guess | Plan (user-confirmed) |
| Nightly List's bulk checkout | Out of scope — test only the reachable path | No UI exists; building it would turn a testing phase into a feature-build phase | Plan (user-confirmed) |
| Test data across runs | Dedicated, disposable pilot-safe fixture — no per-test revert | Matches F-03's existing one-account convention exactly | Plan (user-confirmed) |
| Assertion style | Structural success (toast-based) by default | Live data changes between runs; avoids the oracle problem | Plan (user-confirmed) |
| **Exception**: Nightly List's roster-load assertion | Must be a real, non-tolerant occupancy check on a known fixture room | A fully tolerant either/or would silently pass in exactly the failure mode this journey exists to catch | Plan (discovered while designing Phase 2) |

## Scope

**In scope:**
- `e2e/arrival-day.spec.ts`, `e2e/nightly-list.spec.ts`, `e2e/inspection-day.spec.ts`
- `playwright.config.ts`'s `AUTHENTICATED_SPECS` regex extension
- `test-plan.md` §6.3 and §7 updates

**Out of scope:**
- Building the bulk-checkout UI (FR-015)
- Proactively hardening `ArrivalRow.vue` against the crash risk
- Fixing the `page`/`number` pagination-field drift
- Adding a delete/cancel endpoint to the backend

## Architecture / Approach

Extends the existing F-03 authenticated-project pattern. Each journey's
spec follows the paired-project convention (new files, not edits to
guard-only specs) to avoid re-introducing the exact `storageState`-leak
bug F-03's own review caught. Inspection Day's cleanup runs via Playwright
`test.afterEach`, not a backend change.

## Phases at a Glance

| Phase | What it delivers | Key risk |
|---|---|---|
| 1. Arrival Day | Manual-ID check-in spec + config wiring for all 3 specs | Speculative render-crash on shape mismatch (untested until secrets exist) |
| 2. Nightly List | Roster-occupancy + checkout spec | Requires a known-occupied fixture room to be meaningful |
| 3. Inspection Day | Data-driven walkthrough spec with cleanup hook | No backend cleanup path — accepted, narrow residual risk |
| 4. Config + cookbook | Final wiring check, `test-plan.md` updates | Documentation only |

**Prerequisites:** None to write the specs. Actually *running* them needs the `E2E_TEST_EMAIL`/`E2E_TEST_PASSWORD` secrets (external, already tracked).
**Estimated effort:** ~1–2 sessions across 4 phases.

## Open Risks & Assumptions

- Assumes the pilot-safe test account has (or will have) at least one `EXPECTED_TODAY` worker and one occupied room. If not, that surfaces as a fixture-provisioning gap during manual verification, not a defect in this plan.
- Whether a second concurrent Inspection for the same property is safe on `beduno-be` is genuinely unknown — flagged for manual verification, doesn't block shipping.

## Success Criteria (Summary)

- All three specs exist, typecheck, lint, and are correctly discovered under the authenticated Playwright projects (verifiable today).
- Once secrets are provisioned, all three specs run and reveal whether the speculative risks (Arrival Day's crash, Nightly List's empty roster) are real.
