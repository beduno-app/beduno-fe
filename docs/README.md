# Documentation Index

This folder is split into three parts that answer different questions.

| Folder / file | Question it answers |
|---|---|
| [`idea.md`](./idea.md) | Why does Beduno exist, and what did we decide? |
| [`should-be/`](./should-be/) | What is the current app supposed to do? (authoritative) |
| [`as-is/`](./as-is/) | What did the old, deleted app do? (historical only) |

For how to run and build the app, see the root [`README.md`](../README.md). For contributor
conventions (tooling, directory layout, coding patterns), see [`CLAUDE.md`](../CLAUDE.md).

## `idea.md`

The product-discovery transcript for Beduno: the original problem statement, ICP/JTBD framing,
and the Q&A that led to the locked product decisions (ops system for temp-work agencies, not a
bed marketplace). Treat it as the historical record of *why* the product is shaped the way
`should-be/` describes — not as a spec in itself.

## `should-be/` — the authoritative current spec

Seven files describing the target/current product. This is the spec to read when building or
reviewing a feature.

| File | Summary |
|---|---|
| [`overview.md`](./should-be/overview.md) | What Beduno is now: an operational bed-occupancy system for temp-work agencies (who sleeps where tonight), the problem it solves, target roles, the propose/confirm workflow, the three must-not-fail moments (arrival, nightly list, inspection), and the phased product roadmap. |
| [`architecture.md`](./should-be/architecture.md) | System architecture (Web Admin + Mobile Ops clients, API/BFF, core services, data layer) and the frontend's module-based directory structure, component/state/API conventions, offline sync design, and the entity/state-machine data model diagrams. |
| [`data-model.md`](./should-be/data-model.md) | TypeScript interfaces and field-level contracts for the core entities — Worker, Property, Room, Stay, and related types — as returned by the backend API. |
| [`api-specification.md`](./should-be/api-specification.md) | The backend REST API contract for the frontend team: base URL, JWT auth and the 401/refresh/device-revocation flow, pagination, error shape, and per-resource endpoints. |
| [`roles-and-permissions.md`](./should-be/roles-and-permissions.md) | The four user roles (Agency Admin, Agency Planner, Property Admin, Front Desk), their responsibilities, and which workflows/screens each can access. |
| [`screens.md`](./should-be/screens.md) | Full screen/route inventory for Web Admin and Mobile Ops, per module, including which screens are implemented vs. still missing and where routes diverge from the original plan. |
| [`implementation-plan.md`](./should-be/implementation-plan.md) | The phased plan that took the codebase from the deleted marketplace app to the current product, starting with Phase 0 (infrastructure migration and cleanup) through the feature-module phases. |

## `as-is/` — historical only

Five files documenting the **pre-rewrite bed-marketplace codebase**, which was deleted in Phase 0
of `should-be/implementation-plan.md`. Every file now opens with a historical banner. They're
retained for context (e.g. understanding why certain migrations happened) but do not describe
anything in the current `src/`. Two of the files (`improvements-plan.md`, `audit.md`) have their
resolved/superseded items marked inline; unmarked items in those two either concern deleted
marketplace features or haven't been re-verified.

- `overview.md`, `architecture.md`, `api.md` — description of the old app's product, structure, and API.
- `audit.md` — issue catalogue found in the old codebase.
- `improvements-plan.md` — the old remediation plan for those issues.
