---
change_id: testing-live-journey-beduno-be
title: E2E proof of Arrival/Nightly/Inspection Day against the live beduno-be API
status: impl_reviewed
created: 2026-09-12
updated: 2026-09-12
archived_at: null
---

## Notes

Open a change folder for rollout Phase 2 of context/foundation/test-plan.md: "Live-journey proof against beduno-be".
Risks covered: #2 (A slice that "already works" in code — Arrival/Nightly/Inspection Day — gets waved through without proof against the live API, and the first real SPA↔API disagreement surfaces with the pilot agency instead of in CI).
Test types planned: e2e (Playwright, extends the F-03 authenticated harness).
Risk response intent: prove the three must-not-fail journeys (Arrival Day, Nightly List, Inspection Day) produce correct results against the real beduno-be API, not just mocked/unit-tested assumptions. Challenge the assumption that passing unit tests implies the app works live — the PRD names this exact false confidence. Avoid the oracle problem: do not reuse a mocked fixtures shape as the e2e oracle, since the mock may already encode the bug.
Known external blocker (confirmed still open via gh secret list): the pilot-safe FRONT_DESK test account and E2E_TEST_EMAIL/E2E_TEST_PASSWORD repo secrets are not yet provisioned on beduno-be — this is the same named prerequisite F-03 (live-api-e2e-harness) already documented as blocking the E2E CI step, not a new discovery. Research and planning can proceed; actually running the new journeys against live credentials remains blocked until the team provisions the account.
After creating the folder, follow the downstream continuation rule.

---

All 4 phases implemented and verified as far as possible without live
credentials: 3 new e2e specs exist, typecheck/lint clean, and are
correctly discovered under the authenticated Playwright projects only
(`npx playwright test --list`). `playwright.config.ts` and
`context/foundation/test-plan.md` updated accordingly. Four Progress
items remain open by design, not oversight — mirroring F-03's own
precedent:

- **1.4 / 2.4 / 3.4** (run each spec against the live API) — blocked on
  the same `E2E_TEST_EMAIL`/`E2E_TEST_PASSWORD` secrets named above.
  2.4 and 1.4 additionally need real fixture data provisioned on the test
  account (`E2E_OCCUPIED_ROOM_NUMBER`, `E2E_ARRIVAL_WORKER_ID` — see the
  two new specs for the exact env vars they read).
- **3.5** (manually verify whether `beduno-be` allows a second concurrent
  inspection for the same property) — resolves research Open Question 2;
  needs live credentials to even attempt, so it's blocked by the same
  prerequisite, not a separate one.
