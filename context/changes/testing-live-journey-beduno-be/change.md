---
change_id: testing-live-journey-beduno-be
title: E2E proof of Arrival/Nightly/Inspection Day against the live beduno-be API
status: implementing
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
