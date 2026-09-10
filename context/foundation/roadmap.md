---
project: Beduno
version: 1
status: draft
created: 2026-09-10
updated: 2026-09-10
prd_version: 1
main_goal: market-feedback
top_blocker: decisions
---

# Roadmap: Beduno

> Derived from `context/foundation/prd.md` (v1) + auto-researched codebase baseline (2026-09-10).
> Edit-in-place; archive when superseded.
> Slices below are listed in dependency order. The "At a glance" table is the index.

## Vision recap

Beduno is the source of truth for *"who sleeps where tonight"* across worker
accommodation properties run by a temporary work agency. Every screen the spec
describes already exists — 222 commits, a complete written spec, a live
CloudFront deployment talking to a real API since 2026-09-10 — but no agency has
ever used it to run a night. A pilot converts an open-ended build into a dated
one: the system now has to survive contact with an actual property, actual
workers and actual front-desk staff on actual phones.

The fact that shapes this whole roadmap is that being unproven is an asset the
team has not spent yet. Every catalogued defect — the RBAC inversion, the audit
gate, the PII in the offline snapshot, the unkeyed QR checksum — can be fixed by
changing a decision rather than by migrating live data. Nothing is locked,
including the propose→confirm truth model itself.

## North star

**S-01: Arrival Day proven end-to-end on live data** — a front desk user checks a
worker in by QR or manual search against the running `beduno-be`, online and
offline, and the result is provably correct rather than asserted.

> "North star" here means: the smallest end-to-end flow whose successful
> delivery would show that the product actually works in the field — placed as early as its
> prerequisites allow, because everything else only matters if this works.
> It is S-01 rather than a new capability because US-01 *already works in code*;
> the PRD says so explicitly ("this journey works today"). What has never
> happened is proving it against a real backend, and as of 2026-09-10 that is
> possible for the first time.

## At a glance

| ID | Change ID | Outcome (user can …) | Prerequisites | PRD refs | Status |
| --- | --- | --- | --- | --- | --- |
| F-01 | `clean-dependency-baseline` | (foundation) the dependency tree carries no CRITICAL or HIGH advisory | — | Access Control Changes §4 | ready |
| F-02 | `worker-data-handling-policy` | (foundation) one written allowlist names every worker field allowed to leave the system | — | NFR (PII minimisation), US-05 | ready |
| F-03 | `live-api-e2e-harness` | (foundation) an authenticated Playwright journey can run against the live API, in CI | — | Success Criteria §Primary 1, §Secondary 3 | in-progress |
| S-01 | `arrival-day-proven` | check a worker in by QR or manual search, online and offline, against the live API | F-03 | US-01, FR-010, FR-011, FR-018 | proposed |
| S-02 | `nightly-list-proven` | see the in-house roster per room and check workers out, singly or in one action | F-03 | FR-013, FR-014, FR-015 | proposed |
| S-03 | `inspection-day-proven` | complete a room-by-room inspection walkthrough end to end | F-03 | FR-017 | proposed |
| S-04 | `property-scoped-audit` | (Property Admin) read the audit log for their own property | — | US-03, FR-003, FR-004 | ready |
| S-05 | `governed-soft-overrides` | (Planner) plan stays in bulk where a soft override is a control, not a click-through | — | US-06, FR-021, FR-022 | ready |
| S-06 | `night-shift-occupancy-truth` | find a 01:00 arrival, and reverse a no-show who turned up after all | S-01 | US-03, FR-010, FR-012 | blocked |
| S-07 | `durable-conflict-inbox` | recover a replayed action the server rejected, after a reload | S-01 | US-03, FR-018, FR-019 | blocked |
| S-08 | `move-contract-resolution` | move a worker between rooms or properties and get one answer | S-02 | FR-016 | blocked |
| S-09 | `rbac-authority-correction` | (Property Admin) manage their own room inventory; only agency roles touch planned stays | beduno-be Room migration deployed | US-04, FR-001, FR-002 | blocked |
| S-10 | `offline-safe-token-storage` | stay signed in at 6am with no signal, without tokens in `localStorage` | F-01 | US-02, FR-008, FR-009 | blocked |
| S-11 | `snapshot-field-allowlist` | carry only allowlisted worker fields onto a BYOD phone | F-02, S-01 | US-05, FR-020 | proposed |
| S-12 | `export-field-allowlist` | export nightly occupancy and exception reports with a known field set | F-02 | US-05, FR-023 | proposed |
| S-13 | `user-lifecycle-and-revocation` | (Agency Admin) create, edit and deactivate accounts, and end a live session | S-10 | US-02, FR-006, FR-007 | blocked |
| S-14 | `worker-self-view` | (Worker) sign in and see where they sleep tonight | F-02 | FR-005, Access Control Changes §1 | blocked |

## Streams

Navigation aid — groups items that share a Prerequisites chain. Canonical ordering still lives in the dependency graph below; this table is the proposed reading order across parallel tracks.

| Stream | Theme | Chain | Note |
| --- | --- | --- | --- |
| A | Three must-not-fail moments | `F-03` → `S-01` / `S-02` / `S-03` (parallel) → `S-08` | Carries the north star. `S-08` joins from `S-02`. Sequenced first because `market-feedback` pays for proving before polishing. |
| B | Occupancy truth over time | `S-06` / `S-07` | Both join Stream A at `S-01`. One decision (Cluster B) unblocks the pair. |
| C | Authority, access and identity | `F-01` → `S-10` → `S-13`; `S-04` and `S-09` are independent heads in the same theme | `S-04` is the only unblocked member and the cheapest way to move Primary criterion 2. |
| D | Where worker data is allowed to go | `F-02` → `S-11` / `S-12` / `S-14` | One policy, three consumers. `S-11` also joins Stream A at `S-01`. |
| E | Planning governance | `S-05` | Standalone: no foundation prerequisite, no blocking unknown. Available for a parallel agent run at any time. |

## Baseline

What's already in place in the codebase as of `2026-09-10` (auto-researched + user-confirmed).
Foundations below assume these are present and do NOT re-scaffold them.

- **Frontend:** present — Vue 3.5 SPA (`<script setup>`, TS strict), Vite 6.2, vue-router, Pinia, vue-i18n across five locales, hand-written scoped SCSS. Two gaps: no design-token file (`#e66e00` hard-coded 51× across 28 files) and `ua.json` carries 304 keys against 340 in the other four.
- **Backend / API:** present, external, and reachable for the first time — `beduno-be` live at `beduno.duckdns.org`, same-origin through the CloudFront `api/*` behaviour since 2026-09-10. Typed axios clients per module. Two contract divergences open: `POST /stays/{id}/move` is declared twice with different response types (`inhouse.api.ts:19` → `OccupantStay`; `arrivals.api.ts:23` → `ArrivalStay`), and the `Room` shape is resolved in the SPA's favour but the backend migration is not yet deployed.
- **Data:** present — IndexedDB `beduno-offline` v2, five stores (`db.ts:22-38`). The snapshot writes full `Worker` records verbatim — phone, notes, tags, status, currentStay (`offlineDb.ts:52`, `useOfflineSnapshot.ts:20`) — with no allowlist. `actionQueue.ts:8` carries `CHECK_IN | CHECK_OUT | MOVE | NO_SHOW`; inspection is absent from it and calls the API directly.
- **Auth:** partial — login, refresh-on-401 and idle timeout all work. Token, refreshToken and the full user object persist to `localStorage` (`auth.store.ts:39-41`). No revocation endpoint or UI anywhere. `createUser`/`updateUser`/`deleteUser` exist in `admin.api.ts:21-27` with zero call sites; the Edit button has no handler (`UserManagement.vue:62-64`). The RBAC inversion is unchanged: `PropertyDetail` → agency roles (`router:121`), `StayCreate` still includes `PROPERTY_ADMIN` (`:133`), `/audit` → `AGENCY_ADMIN` only (`:169`). The guard skips the role check entirely when `auth.userRole` is null (`router:193-196`).
- **Deploy / infra:** present — S3 + CloudFront (`E2RRGGPKJTC86F`) driven by `scripts/deploy/` (bootstrap / deploy / verify / lib / config + a viewer-request CloudFront function). Docker + nginx retained as the local full-stack path only. No CI deploy job, no custom domain, no access logging.
- **Observability:** absent — no Sentry/Datadog/OTel/PostHog import anywhere in `src/`, no `app.config.errorHandler` in `main.ts`, and `useApi.ts:73` is a bare `catch {}`.
- **CI:** partial — `.github/workflows/ci.yml` runs lint → typecheck → unit tests → build. 151 unit tests green. No E2E step and no audit step; the 24 Playwright tests across four files assert route guards only, and one carries a comment saying the real journey needs a backend.

> Nothing under `src/` has changed since the PRD was written on 2026-08-19 — all
> 19 commits since are deployment and documentation. The PRD's defect catalogue
> is therefore intact, but its framing is not: the system is no longer
> "never deployed".

## Foundations

### F-01: Clean dependency baseline

- **Outcome:** (foundation) the dependency tree carries no CRITICAL or HIGH advisory, and CI notices if one returns.
- **Change ID:** `clean-dependency-baseline`
- **PRD refs:** Access Control Changes §4 (tokens move out of `localStorage`); `context/foundation/health-check.md` Fixes 1–3
- **Unlocks:** S-10 — `axios` is the runtime HTTP layer carrying every auth token, and the health check names its prototype-pollution and proxy advisories as sitting directly under FR-008. Also gives the whole stream a clean `npm audit` starting line, which is what stopped an 18-advisory backlog being noticed for weeks.
- **Prerequisites:** —
- **Parallel with:** F-02, F-03, and every slice that does not list F-01
- **Blockers:** —
- **Unknowns:** —
- **Risk:** Sequenced first because it is a lockfile-only change inside declared semver ranges — cheap now, and progressively harder once five weeks of behavioural change land on top. The scope cap matters: this is the three direct advisories plus `npm audit fix`, **not** the major-version upgrade pass (jsdom, typescript, vite), which is parked deliberately.
- **Status:** ready

### F-02: Written worker-data-handling policy

- **Outcome:** (foundation) one written allowlist names every worker field permitted to leave the system, per destination — offline snapshot, exported report, worker-facing screen.
- **Change ID:** `worker-data-handling-policy`
- **PRD refs:** US-05; Standing non-functional properties ("The set of permitted fields is fixed by written policy, not by whichever fields the current screens happen to render"); Open Question 15
- **Unlocks:** S-11 (offline snapshot), S-12 (exports), S-14 (worker self view) — the PRD's Cluster D says these need *one* written policy rather than three local fixes that each drift independently. Reduces Open Question 15 from `Block: partial` to resolved.
- **Prerequisites:** —
- **Parallel with:** F-01, F-03, S-01 through S-10
- **Blockers:** —
- **Unknowns:** —
- **Risk:** This is a document, not an implementation — the scope cap is that it names the fields and the destinations and stops there; each consumer enforces it inside its own slice. Sequenced early because the alternative is three teams drawing three boundaries, which is exactly the failure US-05 dramatises. The risk of writing it late is that S-11 and S-12 land first and the policy is then reverse-engineered from what shipped.
- **Status:** ready

### F-03: Authenticated E2E harness against the live API

- **Outcome:** (foundation) a Playwright spec can sign in and drive an authenticated journey against the running `beduno-be`, and CI runs it.
- **Change ID:** `live-api-e2e-harness`
- **PRD refs:** Success Criteria §Primary 1 (three must-not-fail moments proven end-to-end on real data), §Secondary 3 (E2E journeys in CI); `docs/should-be/implementation-plan.md` unchecked box at line 254; Open Question 10
- **Unlocks:** the verification path for S-01, S-02 and S-03 — Primary criterion 1 is about *proving* the three moments, and today no authenticated journey exists in the suite. `e2e/checkin.spec.ts` carries a comment saying the real journey needs a backend; as of 2026-09-10 there is one. Also surfaces Open Question 10 as a decision rather than a contradiction.
- **Prerequisites:** —
- **Parallel with:** F-01, F-02, S-04, S-05
- **Blockers:** —
- **Unknowns:**
  - Does a pilot-safe test account and a seedable data fixture exist on `beduno-be`, or does the harness create its own? — Owner: team. Block: no.
  - Does CI reach the live API, or does E2E run against a locally started backend? — Owner: team. Block: no.
- **Risk:** The scope cap is load-bearing: this is the fixture, the sign-in helper and the CI wiring plus **one** smoke journey — the three real journeys belong to S-01, S-02 and S-03, where each one is the acceptance evidence for its own slice. Building all three here would turn a foundation into the whole of Stream A. Sequenced first in Stream A because a proving-oriented roadmap that cannot prove anything is just assertion.
- **Status:** in-progress

## Slices

### S-01: Arrival Day proven end-to-end on live data

- **Outcome:** A front desk user checks a worker in by QR scan or manual search against the live API, with or without connectivity, and the queued action replays correctly on reconnect.
- **Change ID:** `arrival-day-proven`
- **PRD refs:** US-01, FR-010, FR-011, FR-018
- **Prerequisites:** F-03
- **Parallel with:** S-02, S-03, S-04, S-05, S-10, S-12
- **Blockers:** —
- **Unknowns:**
  - Does the live API's arrivals payload match what `arrivals.api.ts` declares, given that three list endpoints were returning 500 until 2026-09-10? — Owner: team. Block: no.
- **Risk:** This is the north star and it is deliberately not a build slice — the code exists and the PRD says so. The risk is the opposite of the usual one: a slice that "already works" gets waved through without evidence, and the first real disagreement between SPA and API surfaces at 6am in front of the pilot agency instead of in CI. Sequenced immediately after F-03 because `market-feedback` pays for finding that disagreement early.
- **Status:** proposed

### S-02: Nightly List proven end-to-end on live data

- **Outcome:** A front desk user sees the in-house roster per room against the live API and checks workers out, one at a time or twenty at once.
- **Change ID:** `nightly-list-proven`
- **PRD refs:** FR-013, FR-014, FR-015; `docs/should-be/implementation-plan.md` unchecked box at line 159
- **Prerequisites:** F-03
- **Parallel with:** S-01, S-03, S-04, S-05, S-10, S-12
- **Blockers:** —
- **Unknowns:**
  - Does the in-house roster depend on `Room.currentOccupancy` / `occupants[]`, which the SPA types and renders but the backend does not yet implement? — Owner: team. Block: no.
- **Risk:** The second must-not-fail moment, and the one carrying live dead code: `inhouseApi.bulkCheckout` exists with zero call sites, so FR-015 is a wiring job rather than a build. The risk is scope creep from FR-016 — moving a worker looks like it belongs on this screen and is deliberately held out as S-08, because its response shape is an unmade decision and would block the whole slice.
- **Status:** proposed

### S-03: Inspection Day proven end-to-end on live data

- **Outcome:** A front desk user completes a room-by-room inspection walkthrough against the live API and records discrepancies.
- **Change ID:** `inspection-day-proven`
- **PRD refs:** FR-017
- **Prerequisites:** F-03
- **Parallel with:** S-01, S-02, S-04, S-05, S-10, S-12
- **Blockers:** —
- **Unknowns:**
  - Must the pilot's inspection survive losing connectivity mid-walk? `inspection.store.ts` calls the API directly and is absent from `actionQueue.ts:8`, so offline support means a new object store and a `DB_VERSION` bump — the PRD's own constraint 2. — Owner: team. Block: no (the walkthrough can be proven online first).
- **Risk:** The third must-not-fail moment and the least-exercised one. Sequenced alongside S-01 and S-02 rather than after them because the three are independent and `capacity` is a live question — this is the cheapest parallel agent run available in Stream A. The named unknown is the whole risk: answering it "yes" makes this the largest slice in Stream A rather than the smallest.
- **Status:** proposed

### S-04: Both sides of a dispute read the same audit log

- **Outcome:** A Property Admin opens the audit log and sees their own property's events; an Agency Admin continues to see every property.
- **Change ID:** `property-scoped-audit`
- **PRD refs:** US-03, FR-003, FR-004; Access Control Changes §3
- **Prerequisites:** —
- **Parallel with:** every other item — this slice has no prerequisites
- **Blockers:** —
- **Unknowns:**
  - Does `beduno-be` scope audit results by property, or return everything? The endpoint returned 500 on every request until 2026-09-10 and no test had ever called it, so its behaviour is unproven rather than known. — Owner: team. Block: no (discoverable by research, not a design decision).
- **Risk:** The cheapest movement available on Primary criterion 2, and one of only two slices with nothing in front of it. The risk is treating it as a route-meta edit: widening `/audit` to `PROPERTY_ADMIN` without server-side scoping hands the property side every other property's events, which is a worse outcome than the current gate. Front Desk stays excluded deliberately — audit PII must not reach BYOD.
- **Status:** ready

### S-05: Soft overrides that govern rather than decorate

- **Outcome:** An Agency Planner creates planned stays singly and in bulk, where hard violations block and soft violations are recorded in a form somebody actually reads.
- **Change ID:** `governed-soft-overrides`
- **PRD refs:** US-06, FR-021, FR-022
- **Prerequisites:** —
- **Parallel with:** every other item — this slice has no prerequisites
- **Blockers:** —
- **Unknowns:**
  - Do soft violations need friction, a distinct approver, or a periodic review report? (PRD Open Question 16, Cluster E.) — Owner: team. Block: no.
- **Risk:** The one pending-resolution must-have whose open question is explicitly non-blocking, which is why it is `ready` while six of its siblings are not. US-06's ending is the risk in one line: forty assignments, a dozen soft violations, every override recorded and nobody reading them. If the answer turns out to be "a review report", this slice grows a reporting surface; if it is "friction", it stays small. Either way it can start.
- **Status:** ready

### S-06: The night-shift boundary and the no-show who turned up

- **Outcome:** A front desk user finds a worker who arrives at 01:00 in today's arrivals, and reverses a no-show for a worker who turned up after being marked one.
- **Change ID:** `night-shift-occupancy-truth`
- **PRD refs:** US-03, FR-010, FR-012
- **Prerequisites:** S-01
- **Parallel with:** S-07, S-08, S-09, S-10
- **Blockers:** —
- **Unknowns:**
  - What is "today" for an arrivals list on a night shift — calendar date or operational shift window? (PRD Open Question 13, Cluster B.) — Owner: team. Block: yes.
  - What is the documented route from `NO_SHOW` back to `CHECKED_IN`, and does it produce a distinct audit event? — Owner: team. Block: yes.
- **Risk:** Half of the PRD's Cluster B, which it insists is "one problem, not four" — split here from S-07 by user-visible outcome (finding a person) rather than by layer, so each half can be planned coherently while sharing one decision. Sequenced after S-01 because changing what the arrivals list contains before proving it works confuses two failure modes. The guardrail is unforgiving: a wrong nightly count destroys the single claim the product makes about itself.
- **Status:** blocked

### S-07: A rejected replay is recoverable

- **Outcome:** A front desk user whose queued action the server rejected can still see it and act on it after closing the app — the evidence survives a reload.
- **Change ID:** `durable-conflict-inbox`
- **PRD refs:** US-03, FR-018, FR-019
- **Prerequisites:** S-01
- **Parallel with:** S-06, S-08, S-09, S-10
- **Blockers:** —
- **Unknowns:**
  - Does a queued action carry the state it was valid against, or only the `stayId`? (PRD Open Question 13, Cluster B.) — Owner: team. Block: yes.
  - Who owns the conflict inbox — is there an assignee, an SLA, an escalation? — Owner: team. Block: yes.
- **Risk:** The baseline is worse than the PRD assumed. `sync.store.ts:80-86` pushes a `SyncConflict` and *deletes* the queued action, and conflicts live in an in-memory `ref` (`:27`) rather than IndexedDB — so a rejected check-in disappears on reload with no route back. The design correctly refuses to auto-merge and then loses the decision it refused to make. Sequenced after S-01 because the replay path has to be proven before its payload changes.
- **Status:** blocked

### S-08: A move has one answer on both sides of the wire

- **Outcome:** A front desk user moves a worker between rooms or properties and both clients agree on what came back.
- **Change ID:** `move-contract-resolution`
- **PRD refs:** FR-016
- **Prerequisites:** S-02
- **Parallel with:** S-06, S-07, S-09, S-10
- **Blockers:** —
- **Unknowns:**
  - What is the `POST /stays/{id}/move` response shape? (PRD Open Question 18.) — Owner: team. Block: yes.
  - Does a cross-property move write outside the actor's scope, and is `MOVED` plus a new stay the right shape for one human moving rooms? — Owner: team. Block: yes.
- **Risk:** The PRD records this as no longer blocked on an external party — the `beduno-be` contract was declined as a constraint, so it is an unmade decision the team owns on both sides. The baseline shows the cost of leaving it unmade: the same endpoint is declared twice with different response types (`inhouse.api.ts:19` → `OccupantStay`, `arrivals.api.ts:23` → `ArrivalStay`), so the two screens already disagree in code. Held out of S-02 deliberately so one blocked decision does not block the Nightly List.
- **Status:** blocked

### S-09: Room inventory to the property, planned stays to the agency

- **Outcome:** A Property Admin manages room inventory for their own property, and only agency roles create, modify or cancel a planned stay.
- **Change ID:** `rbac-authority-correction`
- **PRD refs:** US-04, FR-001, FR-002; Access Control Changes §2
- **Prerequisites:** `beduno-be` Room migration deployed (the backend adopts `docs/should-be/` wholesale — `roomNumber`, numeric `floor`, the three-value gender rule, plus `currentOccupancy` and `occupants[]`)
- **Parallel with:** S-06, S-07, S-08, S-10
- **Blockers:** —
- **Unknowns:**
  - Does capacity belong to whoever signed the contract or to the on-site manager? (PRD Open Question 14, Cluster C.) — Owner: team. Block: yes.
  - What does a property do with a free bed and a worker at the door at 8pm, once stay creation is agency-exclusive? Resolving this may re-open propose→confirm, which shaping established is not locked. — Owner: team. Block: yes.
- **Risk:** The PRD is explicit that this is a domain change, not a permissions bug — authority is part of the rule, so this decides what the product believes about who owns reality. Two things make it sharper than the PRD records. The router guard skips the role check entirely when `auth.userRole` is null (`router:193-196`), so the current gating is weaker than the route table suggests; and the correction has to land in `docs/should-be/api-specification.md` too, or a backend implementing that document reproduces the inversion server-side. Whoever this slice forbids will reach for WhatsApp — which is the guardrail.
- **Status:** blocked

### S-10: Tokens out of `localStorage` without a 6am logout

- **Outcome:** A signed-in user's tokens are not readable from `localStorage`, and a front desk phone with no signal still has a usable session at the start of a shift.
- **Change ID:** `offline-safe-token-storage`
- **PRD refs:** US-02, FR-008, FR-009; Access Control Changes §4; `docs/should-be/implementation-plan.md` unchecked box at line 261
- **Prerequisites:** F-01
- **Parallel with:** S-01 through S-09, S-12
- **Blockers:** —
- **Unknowns:**
  - What replaces `localStorage`, and does it survive a device that cannot reach the refresh endpoint? (PRD Open Question 7, `Block: partial`.) — Owner: team. Block: yes.
  - What is the bounded offline session lifetime that reconciles revocation with offline-first? (PRD Open Question 12, Cluster A.) — Owner: team. Block: yes.
- **Risk:** The PRD is unambiguous that the Cluster A reconciliation point must be decided before any of FR-006, FR-007 or FR-008 is implemented, which is why S-13 sits behind this slice rather than beside it. The failure mode is specific and expensive: an over-strict token store that needs a reachable refresh endpoint logs the front desk out at 6am in a building with no signal — trading a theoretical XSS for a certain WhatsApp fallback. Depends on F-01 because `axios` carries every token and currently ships with prototype-pollution advisories.
- **Status:** blocked

### S-11: The offline snapshot carries only allowlisted fields

- **Outcome:** A BYOD phone's offline snapshot holds only the worker fields policy permits, and adding a field to an ops screen no longer widens it silently.
- **Change ID:** `snapshot-field-allowlist`
- **PRD refs:** US-05, FR-020
- **Prerequisites:** F-02, S-01
- **Parallel with:** S-12, S-14
- **Blockers:** —
- **Unknowns:**
  - Does narrowing the snapshot break an ops screen that reads a field nobody realised it used? — Owner: team. Block: no.
- **Risk:** The baseline confirms the PRD's worry exactly: `useOfflineSnapshot.ts:20` passes `workersPage.content` unmapped and `offlineDb.ts:52` stores it verbatim, so phone, notes, tags, status and `currentStay` all reach IndexedDB on an unmanaged phone. The interesting part is not the narrowing — it is making the boundary hold, since "what the screens render" re-widens on the next feature. Sequenced after S-01 so the check-in path is proven before the data under it changes shape.
- **Status:** proposed

### S-12: Exports carry a known field set

- **Outcome:** An Agency Admin exports nightly occupancy and exception reports containing only allowlisted fields, in an export language chosen independently of the interface.
- **Change ID:** `export-field-allowlist`
- **PRD refs:** US-05, FR-023
- **Prerequisites:** F-02
- **Parallel with:** S-01 through S-11, S-14
- **Blockers:** —
- **Unknowns:** —
- **Risk:** Nice-to-have by priority but the widest PII door in the product: a CSV of who sleeps where leaves every access control the system has and lands in email and WhatsApp — the channels Beduno exists to replace. Cheap to sequence because the export surface already works and the language selector is already independent (`ExportCenter.vue:14-15`); what it needs is F-02's allowlist applied to it. If Secondary criterion 4 ("exports the agency actually uses") matters at the pilot, this promotes.
- **Status:** proposed

### S-13: A deactivated account is actually deactivated

- **Outcome:** An Agency Admin creates, edits and deactivates user accounts, and revoking a session or device actually ends it.
- **Change ID:** `user-lifecycle-and-revocation`
- **PRD refs:** US-02, FR-006, FR-007; `docs/should-be/implementation-plan.md` unchecked box at line 62
- **Prerequisites:** S-10
- **Parallel with:** S-11, S-12, S-14
- **Blockers:** —
- **Unknowns:**
  - What happens when a revoked device reconnects with three queued check-ins that physically happened? (PRD Open Question 12 / US-02.) — Owner: team. Block: yes.
  - Does revocation need a `beduno-be` endpoint that does not exist today? — Owner: team. Block: yes.
- **Risk:** The PRD's own framing is the risk: deactivation without revocation is half a feature, and revocation cannot reach an offline device — so "instant" revocation is false on exactly the devices it exists to protect. Sequenced behind S-10 because both depend on the same Cluster A decision and implementing them separately would answer it twice, differently. The baseline shows the shallow half is nearly free: `createUser`/`updateUser`/`deleteUser` already exist in `admin.api.ts:21-27` with zero call sites.
- **Status:** blocked

### S-14: A worker can see where they sleep tonight

- **Outcome:** A worker signs in and views their own current stay — room, property, dates — and asserts nothing.
- **Change ID:** `worker-self-view`
- **PRD refs:** FR-005; Access Control Changes §1
- **Prerequisites:** F-02
- **Parallel with:** S-11, S-12, S-13
- **Blockers:** —
- **Unknowns:**
  - How does a worker authenticate? Email and password is a heavy fit for a large, transient, multilingual population, and the QR badge cannot stand alone — `qrCode.ts:10-17` is an unkeyed djb2-xor truncated to 16 bits, an integrity check rather than a credential. (PRD Open Questions 5 and 21.) — Owner: team. Block: yes.
  - What does the view show, and in which of the five languages by default? Anything beyond room and dates re-opens PII minimisation. (PRD Open Question 6.) — Owner: team. Block: yes.
- **Risk:** The only genuinely new product surface in the roadmap — a fifth `UserRole` value, an authentication path and at least one screen, none of which exist (`auth.types.ts:1-5` declares four roles). Sequenced last among the nice-to-haves because it is the one item whose cost is a new surface rather than a correction, and because it is the third consumer of F-02's policy. Demoted to nice-to-have in the PRD's gap pass on the grounds that the pilot's verdict does not hinge on it — that judgement is what keeps it here rather than in `## Parked`.
- **Status:** blocked

## Backlog Handoff

| Roadmap ID | Change ID | Suggested issue title | Ready for `/10x-plan` | Notes |
| --- | --- | --- | --- | --- |
| F-01 | `clean-dependency-baseline` | Clear the CRITICAL and HIGH dependency advisories | yes | Run `/10x-plan clean-dependency-baseline` |
| F-02 | `worker-data-handling-policy` | Write the worker-data-handling allowlist policy | yes | Run `/10x-plan worker-data-handling-policy` |
| F-03 | `live-api-e2e-harness` | Authenticated Playwright harness against the live API, in CI | yes | Run `/10x-plan live-api-e2e-harness` — unlocks the north star |
| S-01 | `arrival-day-proven` | Prove Arrival Day end-to-end on live data | no | Needs F-03 |
| S-02 | `nightly-list-proven` | Prove the Nightly List end-to-end, and wire bulk checkout | no | Needs F-03 |
| S-03 | `inspection-day-proven` | Prove Inspection Day end-to-end on live data | no | Needs F-03 |
| S-04 | `property-scoped-audit` | Property-scoped audit log for both sides of a dispute | yes | Run `/10x-plan property-scoped-audit` |
| S-05 | `governed-soft-overrides` | Make soft-violation overrides a control, not a click-through | yes | Run `/10x-plan governed-soft-overrides` |
| S-06 | `night-shift-occupancy-truth` | Night-shift arrivals window and the no-show reversal path | no | Blocked on Cluster B (OQ 13) |
| S-07 | `durable-conflict-inbox` | Make rejected replays survive a reload and get resolved | no | Blocked on Cluster B (OQ 13) |
| S-08 | `move-contract-resolution` | Settle the `POST /stays/{id}/move` response shape | no | Blocked on OQ 18 |
| S-09 | `rbac-authority-correction` | Correct the RBAC inversion in router and API spec | no | Blocked on Cluster C (OQ 14) |
| S-10 | `offline-safe-token-storage` | Move tokens out of `localStorage` without breaking offline | no | Blocked on Cluster A (OQ 12, OQ 7) |
| S-11 | `snapshot-field-allowlist` | Narrow the offline snapshot to allowlisted fields | no | Needs F-02, S-01 |
| S-12 | `export-field-allowlist` | Apply the field allowlist to exported reports | no | Needs F-02 |
| S-13 | `user-lifecycle-and-revocation` | User CRUD plus real session and device revocation | no | Blocked on Cluster A (OQ 12) |
| S-14 | `worker-self-view` | Worker role with a read-only self view | no | Blocked on OQ 5 / OQ 21 |

## Open Roadmap Questions

1. **Job-site and shift linkage is in scope and has nothing behind it.** Offered as a non-goal twice and declined both times, so it is a decision rather than an oversight — yet it has no FR, no user story, no Socratic challenge and no acceptance criteria, and was never costed against the 4–6 week estimate. It has no roadmap slice for exactly that reason: this roadmap sequences what the PRD declares, and there is nothing to sequence. Either it gets a discovery pass of its own or it moves to the non-goals. — Owner: team. Block: roadmap-wide (PRD Open Question 20).
2. **Who arbitrates "finalized"?** Acceptance is internal and all four definitions of done were selected at once. Without a single arbiter the bar drifts, and every slice's success criteria inherit the drift. — Owner: team. Block: roadmap-wide (PRD Open Question 4).
3. **Is "every unchecked box closed" really Primary?** It conflicts with placing E2E-journeys-in-CI in Secondary, since that is one of the unchecked boxes — and F-03 is built on the assumption that it is not optional. Either the checklist is not Primary or E2E is not Secondary. — Owner: team. Block: F-03, S-01, S-02, S-03 (PRD Open Question 10).
4. **What is the pilot's date, scale and shape?** How many properties, rooms and workers, and by when. `hard_deadline` is null, so the forcing function shaping identified still does not exist — which is also why this roadmap carries no dates. — Owner: team. Block: roadmap-wide (PRD Open Questions 2 and 9).
5. **Is delivery day-job or after-hours?** Changes available capacity by roughly threefold and therefore how much of the parallelism in `## Streams` is real. — Owner: team. Block: roadmap-wide (PRD Open Question 11).
6. **What is the Agency Admin's trigger moment?** The primary persona is confirmed but the situation in which they reach for Beduno was seeded from documentation, not stated — and they are the party whose judgement the pilot is measured against. — Owner: team. Block: roadmap-wide (PRD Open Question 3).
7. **Nothing is genuinely preserved.** Correct for a pre-production system, but the 13 `[preserved]` items are intentions rather than protections: nothing external catches it if they break, and the suite that would is F-03, which is itself downstream. — Owner: team. Block: roadmap-wide (PRD Open Question 22).
8. **The "silent failure" guardrail has no detection mechanism.** The PRD names front desk routing around the app as a failure nobody files a bug for, yet observability is absent from the codebase — no error tracking, no `app.config.errorHandler`, and `useApi.ts:73` swallows errors in a bare `catch {}`. No FR or NFR covers this, so no slice was invented for it. If the pilot is meant to produce diagnosable signal rather than anecdote, it needs one. — Owner: team. Block: roadmap-wide (surfaced by the 2026-09-10 baseline, not in the PRD).
9. **Does the pilot ship with an incomplete Ukrainian locale?** `ua.json` carries 304 keys against 340 in the other four, against a standing NFR that the entire operational surface is available in all five languages. Who translates, and does it gate the pilot? — Owner: team. Block: roadmap-wide (surfaced by the 2026-09-10 baseline, not in the PRD).
10. **When does the `beduno-be` Room migration deploy?** The backend adopts `docs/should-be/` wholesale — `roomNumber`, numeric `floor`, the three-value gender rule, plus `currentOccupancy` and `occupants[]` which the SPA already types and renders. The SPA needs no change, but S-09 cannot land before it and S-02 may render fields the API does not yet return. — Owner: team (both repos). Block: S-09, partially S-02.

## Parked

- **Transport and bus lists** — Why parked: PRD §Non-Goals; roadmap phase 3. "Who is on which pickup" is a distinct problem, and explicitly not route optimisation.
- **Partner supply and marketplace** — Why parked: PRD §Non-Goals; roadmap phases 4–5. No verified external properties, contracts, SLAs, payments, disputes or reviews.
- **Bed-level modelling** — Why parked: PRD §Non-Goals, confirmed in the shaping gap pass. Workers occupy a spot in a room; there is no bed entity. Closes a data-model change that would otherwise have touched rooms, stays, inspection and the offline snapshot.
- **Offline support for admin screens** — Why parked: PRD §Non-Goals. Room, capacity, rule and user edits stay online-only by design, so offline replay can never invalidate a capacity constraint.
- **Compliance certification beyond baseline GDPR** — Why parked: PRD §Non-Goals. No ISO 27001, no SOC 2, no formal DPIA for the pilot.
- **Multi-region deployment and an availability SLA** — Why parked: PRD §Non-Goals. Single deployment, no failover promise, no uptime commitment to the pilot agency.
- **Accessibility conformance target** — Why parked: PRD §Non-Goals. No WCAG-AA commitment, accepted deliberately for a mobile ops app used one-handed at 6am.
- **The SCSS token file** — Why parked: an unchecked box in `docs/should-be/implementation-plan.md` (line 29) with no FR behind it and no slice blocked by it. `#e66e00` is hard-coded 51× across 28 files; it is a real cleanup and it does not move any pilot criterion.
- **The major-version dependency upgrade pass** — Why parked: `health-check.md` Fix 4 explicitly calls it "not a now-task — a scheduled one, ideally its own change folder after the pilot-critical work". jsdom is four majors behind, typescript and vite two each, plus a one-major batch. F-01 deliberately excludes it.
- **`.editorconfig` and `.env.example`** — Why parked: `health-check.md` low-severity conveniences with no pilot consequence.

## Done

(Empty on first generation — `/10x-archive` appends here.)
