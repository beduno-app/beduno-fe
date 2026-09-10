---
change_id: live-api-e2e-harness
title: Authenticated E2E harness against the live API
status: implemented
created: 2026-09-10
updated: 2026-09-11
archived_at: null
---

## Notes

Roadmap item F-03 (`context/foundation/roadmap.md`). Foundation, not a slice —
scope is capped to a sign-in fixture, one read-only smoke journey, and CI
wiring. The three real journeys (Arrival Day, Nightly List, Inspection Day)
belong to S-01, S-02, S-03 respectively and reuse this harness.

All 4 phases implemented and verified against a real pushed-branch CI run
(GitHub Actions run 34537109901). Two Progress items remain open by design,
not oversight:

- **4.3** (E2E step green) — blocked on the team provisioning the pilot-safe
  `FRONT_DESK` test account + `E2E_TEST_EMAIL`/`E2E_TEST_PASSWORD` repo
  secrets on `beduno-be`. This is the plan's own named external
  prerequisite, not a defect in this change.
- **4.4** (deliberate lint-failure branch doesn't reach the E2E step) — not
  empirically tested; relies on GitHub Actions' default sequential-step
  behavior (no `continue-on-error` set anywhere in `ci.yml`), the same
  reasoning the plan's "Job ordering" section already documents.
