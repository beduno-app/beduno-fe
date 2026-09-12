---
change_id: testing-conflict-engine-correctness
title: Unit and integration tests proving the conflict engine's hard/soft violation classification
status: implementing
created: 2026-09-11
updated: 2026-09-12
archived_at: null
---

## Notes

Open a change folder for rollout Phase 1 of context/foundation/test-plan.md: "Conflict-engine correctness".
Risks covered: #1 (Conflict engine admits an assignment reality cannot honour — a hard violation wrongly classified as passable or soft-overridden).
Test types planned: unit + integration.
Risk response intent: prove a hard violation (capacity, gender rule, blacklist, double-booking) is rejected regardless of override attempts; prove a soft violation is admitted only with a recorded override. Challenge the assumption that a passing happy-path assignment test means the classifier is correct overall — the hard/soft boundary needs its own assertion per violation type. Avoid the oracle problem: assert against the PRD stated hard/soft taxonomy, not against whatever the classifier currently returns.
After creating the folder, follow the downstream continuation rule.
