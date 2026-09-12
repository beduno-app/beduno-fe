---
project: "Beduno"
version: 1
status: draft
created: 2026-08-19
context_type: brownfield
product_type: web-app
target_scale:
  users: large
  qps: low
  data_volume: small
timeline_budget:
  delivery_weeks: 5
  hard_deadline: null
  after_hours_only: null
---

# PRD — Beduno

## Current System Overview

**Purpose.** Beduno is an operational system for temporary work agencies in
Poland/CEE — the single source of truth for *"who sleeps where tonight"* across
worker accommodation properties. It is not a marketplace; that sits at phase 5 of
the product roadmap.

**Status — load-bearing.** The system is **pre-production**. It has 222 commits, a
full feature surface and a complete written spec, but it has never run a real
night for a real agency. There are no live users, no production data, no external
integrations in flight.

**Architecture.** Two client surfaces over one API:

- **Web Admin** (`/*`) — desktop, for agency and property administration.
- **Mobile Ops** (`/ops/*`) — mobile-first, offline-capable, for front desk.
  `/ops/arrivals` is the PWA `start_url`.

**Tech stack (this repo).** Vue 3 SPA with `<script setup>` and TypeScript
(strict); Vite 6; Pinia with `pinia-plugin-persistedstate`; vue-router; vue-i18n
(`legacy: false`) across pl/en/de/ua/ru; hand-written scoped SCSS with no
component framework; Vitest + jsdom + `@vue/test-utils` for unit/component tests
and Playwright for E2E; `vite-plugin-pwa` with workbox runtime caching; a single
IndexedDB database (`beduno-offline`) for the offline snapshot and action queue;
nginx + Docker for deployment. The backend is a separate repository
(`beduno-be`, JVM/Maven).

**Current user base.** None in production. Four roles are modelled in code:
`AGENCY_ADMIN`, `AGENCY_PLANNER` (agency side — plan), `PROPERTY_ADMIN`,
`FRONT_DESK` (property side — confirm reality).

**Core functionality today.** Worker directory with CSV import and QR badges;
properties and rooms with capacity and gender rules; stay planning with a
conflict engine; the three operational screens (Arrivals Today, In-House,
Inspection); audit log; export centre; offline queue with a conflict inbox.

**Known defects and gaps** (catalogued against the code, not aspirational):

- No user CRUD — `UserManagement.vue` ships a read-only list; the Edit button has
  no handler and `createUser`/`updateUser`/`deleteUser`/`getUser` have zero call
  sites.
- `POST /stays/bulk-checkout` — client method exists, no view calls it.
- E2E specs assert route guards only; no user journey is exercised, and
  Playwright does not run in CI.
- No security review artefact; token, refresh token and the full user object
  persist to `localStorage`.
- RBAC inversion — `PropertyDetail` (the only route reaching room management) is
  gated to agency roles, locking out `PROPERTY_ADMIN`, the role that supposedly
  owns room inventory; meanwhile property roles can reach stay creation.
- `/audit` is gated to `AGENCY_ADMIN` alone, so the property side cannot
  independently inspect the evidence the propose→confirm model depends on.
- The offline snapshot caches full `Worker` records — phone, tags, notes — onto
  BYOD devices, broader than any screen renders.
- The QR checksum is an unkeyed djb2 hash: an integrity check, not
  forgery-resistant.
- `POST /stays/{id}/move` has an unresolved response shape (see Open
  Questions 18).
- No SCSS token file exists; components hard-code the brand colour `#e66e00`.

## Problem Statement & Motivation

Beduno is written but unproven. Every screen the spec describes exists, and the
documentation was audited against the code, yet no agency has ever used it to run
a night. A real pilot is now coming, which converts an open-ended build into a
dated one: the system has to survive contact with an actual property, actual
workers and actual front-desk staff on actual phones.

The insight that makes this change worth shaping rather than just executing is
that **being pre-production is an asset here, and the team is not using it as
one.** Every catalogued defect — the RBAC inversion, the audit gate, the PII in
the offline snapshot, the unkeyed QR checksum — can be fixed by *changing a
decision* rather than by migrating live data or negotiating backward
compatibility. Nothing is locked, including the propose→confirm truth model
itself. The constraint is not the existing system; it is the pilot date and the
absence of an external authority defining "done".

## User & Persona

**Primary persona: Agency Admin — the main client.** The owner or operations
director of the temporary work agency; the party who commissioned the software
and whose judgement the pilot is measured against. They do not perform daily
check-ins; they judge the system on control, reporting and audit — whether they
can answer "who slept where, and who says so" without phoning anyone.

### Secondary personas

- **Agency Planner** — dispatcher; plans assignments, bulk-imports workers.
- **Property Admin** — manages room inventory and capacity rules at a property.
- **Front Desk** — performs check-in/out, moves, no-shows, inspections on a BYOD
  phone, often with poor connectivity. The hardest UX bar in the product.
- **Worker** — *newly named as a role during shaping.* Workers currently exist
  as data (a `Worker` entity carrying a QR badge), not as users: there is no
  `WORKER` value in `UserRole`, no login path and no worker-facing screen.
  Treating workers as users would be a new product surface, not a defect fix.
  See Open Questions 5, 6 and 21.

## Success Criteria

### Primary

- All three must-not-fail moments — Arrival Day, Nightly List, Inspection Day —
  complete end-to-end during a real pilot night, on real data, without falling
  back to WhatsApp or the phone.
- Access control is correct: RBAC matches the documented policy, the audit log
  is visible to the property side scoped to their own property, no PII reaches a
  BYOD device beyond what its screens render, tokens are not in `localStorage`,
  and session/device revocation works.
- Every unchecked box in `docs/should-be/implementation-plan.md` is closed.
- An operator prefers Beduno to WhatsApp. Observable only during the pilot; it
  cannot be built or ticked beforehand, which makes the other three criteria the
  precondition for testing it rather than the finish line.

> Conflict recorded, not resolved: "every unchecked box closed" is Primary, but
> "real E2E journeys running in CI" — one of those unchecked boxes — was placed
> in Secondary. The two cannot both hold. See Open Questions 10.

### Secondary

- The Worker read-only self view. Promoted to must-have during shaping, then
  demoted again in the gap pass: FR-005 is nice-to-have and the pilot's verdict
  does not hinge on it.
- Check-in median under 10 seconds via QR scan.
- Real E2E journeys running in CI, replacing the twelve route-guard-only specs.
- Exports the agency actually uses — nightly occupancy and exception reports.

### Guardrails

Failure modes the pilot agency would notice first. Any of these occurring is a
regression even if every Primary criterion holds.

- **A worker with nowhere to sleep.** Capacity or conflict logic admits an
  assignment that reality cannot honour.
- **Front desk falls back to WhatsApp.** The app is too slow, too confusing, or
  offline-broken at 6am, so staff route around it. Silent failure: the data goes
  stale and nobody files a bug.
- **The nightly count is wrong.** The in-house list does not match who is
  actually in the building, destroying the single claim the product makes about
  itself.
- **Nobody can explain what happened.** A dispute arises and the audit trail
  cannot answer it — wrong actor, missing event, or the property side cannot see
  the log.

## User Stories

### US-01: Front desk checks a worker in on arrival day

- **Given** a Front Desk user signed in at their property, with a worker whose
  stay is `EXPECTED_TODAY` there
- **When** they open `/ops/arrivals`, scan the worker's QR badge, and confirm
- **Then** the stay becomes `CHECKED_IN`, an audit event records actor, before,
  after and timestamp, and the worker appears on tonight's in-house roster

#### Acceptance Criteria

- The flow completes in two taps after the scan resolves.
- With no connectivity the action is queued locally and the UI reflects the
  check-in immediately; the offline banner shows the queue depth.
- On reconnect the action replays in order; anything the server rejects lands in
  the review inbox rather than being merged silently.
- Manual search reaches the same outcome when the camera is unavailable.
- A QR that does not correspond to a worker expected at this property today is
  refused with a localized message.

> Was different before: nothing. This journey works today. US-01 exists because
> Primary criterion 1 requires it to be *proven* on real data during the pilot,
> not because it is being changed.

---

The five stories below dramatise the unresolved tensions from the Socratic
round. They are deliberately written as failure scenarios: each ends in a
question rather than acceptance criteria, because the resolution is pending.

### US-02: A revoked device keeps working (Cluster A — FR-006, FR-007, FR-008)

- **Given** a Front Desk phone that is offline in a building with no signal, and
  an Agency Admin who has just revoked that device's session
- **When** the front desk user checks three workers in over the next hour
- **Then** the actions queue locally against a session the server considers dead

> Unresolved: what happens on reconnect. Replaying accepts work from a revoked
> device; discarding loses three confirmed check-ins that physically happened.
> A bounded offline session lifetime reconciles the two, but the bound is not
> chosen. Blocks FR-006, FR-007, FR-008.

### US-03: The count is wrong and nobody can explain why (Cluster B — FR-010, FR-012, FR-018, FR-019)

- **Given** a worker due to arrive who reaches the property at 01:00, after the
  front desk marked them no-show at 22:00, on a phone that was offline at the time
- **When** the night-shift user looks for them in today's arrivals
- **Then** the worker is absent — their arrival date is now yesterday, their stay
  is `NO_SHOW` with no route back, and the queued action replays against a stay
  the agency may since have cancelled

> Resolved 2026-09-12: the worker still shows in tonight's arrivals (shift
> window, not calendar date); their NO_SHOW is reversible via an explicit
> undo action with its own audit event; the replayed queued action carries
> the state it was valid against, so a stale write is detected rather than
> silently applied; the conflict, if one still lands in the review inbox,
> is owned by the user who queued it.

### US-04: An 8pm walk-in with a free bed (Cluster C — FR-001, FR-002)

- **Given** a Property Admin with a verified empty spot and a worker at the door,
  after the agency planner's shift has ended
- **When** they try to record the worker into the free room
- **Then** they cannot: FR-002 makes stay creation agency-exclusive, and FR-001's
  counter-argument says they may not own the capacity number either

> Unresolved: whoever the product forbids here will use WhatsApp, which is the
> guardrail. Resolving it may re-open propose→confirm, which shaping established
> is not locked. Blocks FR-001, FR-002.

### US-05: Data leaves through a door nobody guards (Cluster D — FR-005, FR-020, FR-023)

- **Given** an Agency Admin exporting a nightly occupancy report, and a Front Desk
  phone holding an offline snapshot, and (if FR-005 ships) a worker's personal
  phone holding their own record
- **When** the report is emailed to an inspector and the phones stay in pockets
- **Then** worker PII exists in three places the system's access controls do not
  reach, and the boundary that decides which fields is defined by whatever the
  ops screens happen to render this week

> Unresolved: needs one written data-handling policy naming the allowlist, rather
> than three local fixes that each drift independently. Blocks the security
> review artefact.

### US-06: An override that means nothing (Cluster E — FR-022)

- **Given** an Agency Planner bulk-assigning forty workers, where a dozen trigger
  soft violations — gender mismatch, over-planned rooms, a blacklisted worker
- **When** they accept the overrides to finish before end of shift
- **Then** every override is recorded with a reason, and no one reads them

> Unresolved: whether soft violations need friction, a distinct approver, or a
> periodic review report. As shipped, the override path documents the decision
> without governing it.

## Scope of Change

The 23 functional requirements shaped for this change, categorized per the delta
convention: `[new]` — capability that does not exist today; `[modified]` —
behavior that changes; `[preserved]` — behavior that must not regress. Because
the system is pre-production, `preserved` protects no live users; those items
exist so the corrections in FR-001, FR-002, FR-008 and FR-020 cannot quietly
damage the operational core. Split: 18 must-have, 5 nice-to-have (FR-005,
FR-006, FR-007, FR-015, FR-023).

Scope acknowledgment (2026-08-16): the tally — twelve work items spanning
verification, a cross-repo RBAC correction, an auth-storage change, a new Worker
surface, and the open implementation-plan boxes — exceeds a three-week delivery.
A scope-down was offered with concrete cuts and explicitly declined; the
sustained-effort cost was accepted. The delivery window is a 4–6 week internal
working estimate (`delivery_weeks: 5`) with no fixed pilot date and no external
commitment.

### Access Control

- [modified] FR-001: Property Admin can manage room inventory for their own property. Priority: must-have
  > Socratic: Capacity is commercial, not operational — room count and capacity are contract terms belonging to whoever signed the contract, rather than to the on-site manager.
  > Resolution: pending.
- [modified] FR-002: Only agency roles can create, modify or cancel a planned stay. Priority: must-have
  > Socratic: Exclusive agency ownership makes the agency a bottleneck at 8pm: a property with a free bed and a worker at the door cannot act. Directly threatens the "front desk falls back to WhatsApp" guardrail.
  > Resolution: pending.
- [modified] FR-003: Property Admin can view the audit log for their own property. Priority: must-have
  > Socratic: Considered: scoping is harder than a route gate; partners are external parties; the buyer did not ask for it.
  > Resolution: kept as written — dispute resolution is worthless if only one side sees the evidence.
- [preserved] FR-004: Agency Admin can view the audit log across all properties. Priority: must-have
  > Socratic: Considered: cross-property visibility is the asymmetry partners distrust, and exceeds what any single dispute needs.
  > Resolution: kept as written — the agency is accountable for its workers across every property.
- [new] FR-005: Worker can sign in and view their own current stay. Priority: nice-to-have
  > Socratic: A worker self view puts worker PII on unmanaged personal phones — a new GDPR surface in a product whose compliance story is "store the minimum".
  > Resolution: pending.
- [new] FR-006: Agency Admin can create, edit and deactivate user accounts. Priority: nice-to-have
  > Socratic: Deactivation without revocation is half a feature: an account deactivated while its token stays valid until expiry is not deactivated. Meaningless unless FR-007 lands with it.
  > Resolution: pending.
- [new] FR-007: Agency Admin can revoke an active session or device. Priority: nice-to-have
  > Socratic: Revocation cannot reach an offline device. A revoked BYOD phone keeps working from its cached snapshot, so "instant" revocation is false on exactly the devices it exists to protect.
  > Resolution: pending.
- [modified] FR-008: A signed-in user's tokens are not readable from `localStorage`. Priority: must-have
  > Socratic: A stricter token store collides with offline-first: httpOnly cookies or in-memory tokens need a reachable refresh endpoint that the offline front desk does not have, risking a 6am logout.
  > Resolution: pending.
- [preserved] FR-009: An idle session ends automatically after a warning. Priority: must-have
  > Socratic: Considered: 30 minutes is wrong for a night shift; the timeout is hard-coded though documented as configurable; logout with a non-empty queue risks data loss.
  > Resolution: kept as written — shared BYOD devices need an idle timeout.

### Arrival Day

- [preserved] FR-010: Front Desk can see today's expected arrivals for their property. Priority: must-have
  > Socratic: "Today" is ambiguous on a night shift: a worker arriving at 01:00 is tomorrow by date and tonight by shift, so the arrivals list silently drops them and nobody notices until the bed is empty.
  > Resolution: resolved (2026-09-12) — "today" is an operational night-shift window, not the calendar date. A 01:00 arrival still shows under tonight's list.
- [preserved] FR-011: Front Desk can check a worker in by QR scan or manual search. Priority: must-have
  > Socratic: Considered: the QR checksum is forgeable; camera access on BYOD is not guaranteed; manual search exposes the worker directory.
  > Resolution: kept as written — two independent paths to the same action is correct design.
- [preserved] FR-012: Front Desk can mark a no-show with a localized reason code. Priority: must-have
  > Socratic: The undo path is undefined: a worker marked no-show at 20:00 who turns up at 23:00 leaves the stay in NO_SHOW with no documented route back to CHECKED_IN, making the nightly count wrong.
  > Resolution: resolved (2026-09-12) — Front Desk gets an explicit "undo no-show" action that reverses NO_SHOW back to CHECKED_IN (or EXPECTED_TODAY, depending on time), producing its own distinct audit event.

### Nightly List

- [preserved] FR-013: Front Desk can view the in-house roster per room. Priority: must-have
  > Socratic: Considered: in-house is today-only so midnight splits the roster; the screen shows belief rather than verified reality; names are readable on an unlocked phone.
  > Resolution: kept as written — the nightly list is the product's core claim about itself.
- [preserved] FR-014: Front Desk can check a worker out. Priority: must-have
  > Socratic: Considered: departures are rarely observed so occupancy drifts; planned and early exits are indistinguishable; per-worker checkout is what makes FR-015 necessary.
  > Resolution: kept as written — physical confirmation of departure is the property side owning reality.
- [new] FR-015: Front Desk can check out multiple workers in one action. Priority: nice-to-have
  > Socratic: Considered: one mis-tap empties an occupied room; bulk flattens per-worker audit granularity; it stands in for an unmodelled contract-ending event.
  > Resolution: kept as written — twenty workers on one bus is the normal case.
- [modified] FR-016: Front Desk can move a worker between rooms or properties. Priority: must-have
  > Socratic: Considered: the response shape is unresolved so acceptance criteria cannot be written; a cross-property move writes outside the actor's scope; MOVED plus a new stay is two rows per human.
  > Resolution: kept as written — but remains blocked on the beduno-be decision, see Open Questions 18.

### Inspection Day

- [preserved] FR-017: Front Desk can complete a room-by-room inspection walkthrough. Priority: must-have
  > Socratic: Considered: inspection is absent from the offline queue; capturing a discrepancy is not resolving one; losing the session loses the walk.
  > Resolution: kept as written — Inspection Day is the third must-not-fail moment.

### Offline

- [preserved] FR-018: Operational actions taken offline are queued and replayed on reconnect. Priority: must-have
  > Socratic: Replay assumes the server state did not move: a queued action carries the stayId, not the state it was valid against, so it can write into a world that no longer exists.
  > Resolution: resolved (2026-09-12) — a queued action snapshots the state it was valid against at queue-time (e.g. room capacity/occupants read), not just the stayId, so replay can detect precisely what changed.
- [preserved] FR-019: Conflicts on replay land in a review inbox, never auto-merged. Priority: must-have
  > Socratic: Nobody owns the inbox. "Needs review" with no assignee, no SLA and no escalation is a queue that only grows; the design correctly refuses to auto-merge and then leaves the decision homeless.
  > Resolution: resolved (2026-09-12) — a conflict is owned by the Front Desk user whose action was rejected; no SLA/escalation yet, matching current single-property small-team scale. Revisit if team size grows.
- [modified] FR-020: The offline snapshot carries only fields the ops screens render. Priority: must-have
  > Socratic: "What the screens render" is a moving target defined by current UI rather than by policy, so any new field on any ops screen silently widens the snapshot again.
  > Resolution: pending.

### Planning & Reporting

- [preserved] FR-021: Agency Planner can create planned stays, singly and in bulk. Priority: must-have
  > Socratic: Considered: bulk assign rubber-stamps a machine's placement; plans are built on stale occupancy; it concentrates the bottleneck FR-002 creates.
  > Resolution: kept as written — one-at-a-time planning is the spreadsheet workflow the product replaces.
- [preserved] FR-022: Conflict engine blocks hard violations, allows soft ones with override. Priority: must-have
  > Socratic: Routine overrides are not a control: a soft warning that appears on most assignments is clicked through reflexively, giving gender and over-planning rules the appearance of governance without the effect.
  > Resolution: pending.
- [preserved] FR-023: Agency Admin can export nightly occupancy and exception reports. Priority: nice-to-have
  > Socratic: Export is an uncontrolled PII egress point: a CSV of who sleeps where leaves the system's access controls entirely and lands in email and WhatsApp — the channels the product exists to replace.
  > Resolution: pending.

### Job-site and shift linkage — in scope, unspecified

- [new] Job-site and shift linkage — assigning a worker to a job site and a
  shift (roadmap phase 2). In scope by explicit decision: offered as a non-goal
  twice and declined both times. It has no FR number, no user story, no Socratic
  challenge, no acceptance criteria, and was never costed against the 4–6 week
  estimate. See Open Questions 20.

## Constraints & Compatibility

**There is almost nothing to preserve, and that is the defining fact of this
change.** The system is pre-production. There is no backward compatibility to
honour, no data migration to plan, no live integration to keep working, and no
rollback plan to write, because nothing has ever run. This section is
substantially empty by design rather than padded with invented constraints.

Three real constraints were named:

1. **The five-locale commitment.** Every new string, reason code, screen and
   exported report must ship in pl, en, de, ua and ru. This is a standing tax on
   the Worker surface (FR-005) and on every new error message the corrections
   introduce.
2. **The offline architecture.** All IndexedDB object stores are declared in one
   place with a coordinated version, and the action queue handles four action
   types. Anything new either fits that shape or forces a store migration —
   which is why an offline-capable inspection (FR-017) is not a small change.
3. **Nothing else.** No live constraint applies.

**Explicitly not a constraint: the `beduno-be` API contract.** It was offered and
declined. The consequence is that FR-016's unresolved `POST /stays/{id}/move`
response shape is not blocked on an external party — it is an unmade decision the
team owns on both sides of the wire. Recorded because it was previously carried
as a blocker.

### Standing non-functional properties

Properties the change must leave true — the product's standing quality bar, not
deltas:

- A front desk user sees a check-in acknowledged within two seconds of the badge
  resolving, whether or not the device has connectivity, with a median
  end-to-end check-in under ten seconds.
- No worker personal datum reaches a device, screen or exported file that has no
  operational need for it. The set of permitted fields is fixed by written
  policy, not by whichever fields the current screens happen to render.
- Any operational action can be explained after the fact — who performed it, what
  changed, when, and whether it arrived live or by offline replay — for the whole
  retention period.
- The entire operational surface, including reason codes and exported reports, is
  available in Polish, English, German, Ukrainian and Russian, with the export
  language selectable independently of the interface language.

## Business Logic Changes

**The rule, in one sentence.** Given a proposed assignment of a worker to a room,
the system decides whether reality can honour it — capacity, gender rule, blocked
room or property, double-booking, blacklisting, over-planning — classifying each
objection as hard, which blocks the action, or soft, which permits it against a
recorded override; and it decides whose statement stands, so that a stated intent
can never overwrite a confirmed fact.

**Inputs.** A worker, a destination room within a property, and a date range. The
rule consumes what is already known about that room's occupancy and rules on
those dates, and what is known about the worker's other commitments and standing.

**Output.** An admissibility verdict plus a list of named objections, each
carrying a machine-readable code, the values that triggered it, and whether it
can be overridden. The verdict is not advisory for hard objections: the
assignment does not exist unless it passes.

**Where the user meets it.** At the moment of planning, when a planner assigns
one worker or forty; and again at the moment of confirmation, when the property
side records what actually happened.

### What this change does to the rule

This change **modifies** the existing rule, and the shaping gap pass settled
why. The rule was first named as admissibility alone, which left "modifies"
unsupported. That was reversed: **authority is part of the domain rule**, not a
permissions concern layered above it. Propose→confirm is domain logic.

It follows that:

- The RBAC correction (FR-001, FR-002) is a genuine change to the rule, because
  it changes whose statement stands — not merely which route a role can reach.
- Cluster E remains a second, independent route to a rule change: if soft
  violations gain friction, a distinct approver or a mandatory review, the
  hard/soft classification itself changes shape. That decision is still pending
  (FR-022), but the classification no longer depends on it.

Consequence worth carrying forward: because authority is domain logic, the
Cluster C tension (FR-001, FR-002 — the 8pm walk-in with a free bed) is a
**domain question**, not a permissions bug. Resolving it means deciding what the
product believes about who owns reality, which shaping established is open.

## Access Control Changes

**Current model.** Email + password returns `{ token, refreshToken, user }`, all
three persisted to `localStorage` through `pinia-plugin-persistedstate`. An axios
response interceptor refreshes once on 401, queues concurrent requests behind
that single refresh, and logs out plus redirects when the refresh fails.
`useIdleTimeout` force-logs-out after 30 minutes idle with a 2-minute warning;
the interval is hard-coded and not configurable by anyone. Authorisation is
route-level only: `meta.requiresAuth` and `meta.roles` evaluated by a single
`router.beforeEach`, with no hand-rolled checks in components. Session-count
limits, device registration and admin-triggered revocation do not exist.

**This change modifies the access model in four ways.**

1. **A fifth role is added: Worker, with a read-only self view.** A worker signs
   in and sees their own stay — where they sleep tonight, which room, which
   dates. They assert nothing: no check-in, no confirmation, no edit. The
   propose→confirm truth model is therefore intact, with the property side still
   the sole owner of reality. This is new product surface, not a defect fix: it
   adds a `WORKER` value to `UserRole`, an authentication path, and at least one
   screen that did not previously exist.

2. **The RBAC inversion is corrected toward the documented policy.**
   `PROPERTY_ADMIN` regains room inventory management, which the current router
   denies it by gating `PropertyDetail` to agency roles only. Creating,
   modifying and cancelling planned stays becomes agency-side exclusively,
   removing `PROPERTY_ADMIN` from `StayCreate` and from the `PUT`/`DELETE`
   `/stays/{id}` role lists. The correction applies to `api-specification.md`
   as well as the router — a backend implementing that document as written would
   otherwise reproduce the inversion server-side.

3. **Audit visibility widens to the property side.** `/audit` moves from
   `AGENCY_ADMIN` only to `AGENCY_ADMIN` plus `PROPERTY_ADMIN` scoped to their
   own property, so both sides of a dispute can inspect the same evidence
   independently. Front Desk remains excluded, keeping audit PII off BYOD
   devices.

4. **The auth mechanism itself changes.** Tokens move out of `localStorage`, and
   session and device revocation become real rather than aspirational — the
   compliance documentation promises that revocation "must work instantly"
   while nothing implements it and `admin.api.ts` has no such endpoint.

## Non-Goals

### Functional

- **No transport or bus lists.** Roadmap phase 3. "Who is on which pickup" is a
  distinct problem, and explicitly not route optimisation.
- **No partner supply or marketplace.** Roadmap phases 4–5. No verified external
  properties, contracts, SLAs, payments, disputes or reviews.
- **No bed-level modelling.** Confirmed in the shaping gap pass. Workers occupy
  a spot in a room; there is no bed entity. This closes a data-model change that
  would otherwise have touched rooms, stays, inspection and the offline snapshot.

> **Job-site and shift linkage is IN SCOPE.** It was offered as a non-goal twice
> and declined both times, so it is not an oversight. Roadmap phase 2 — assigning
> a worker to a job site and a shift — is part of this change. It is the largest
> single scope addition made during shaping, it has no FR, no user story and no
> Socratic challenge behind it, and it entered by omission rather than by a
> stated requirement. See Open Questions 20.

### Non-Functional

- **No offline support for admin screens.** Room, capacity, rule and user edits
  stay online-only by design, so offline replay can never invalidate a capacity
  constraint.
- **No compliance certification beyond baseline GDPR.** No ISO 27001, no SOC 2,
  no formal DPIA for the pilot — minimum data, field-level access, audit trail
  and a retention policy, and nothing further.
- **No multi-region deployment or availability SLA.** Single deployment, no
  failover promise, no uptime commitment to the pilot agency.
- **No accessibility conformance target.** No WCAG-AA commitment for this
  change, accepted deliberately for a mobile ops app used one-handed at 6am.

## Open Questions

1. ~~**What does the Worker role actually do?**~~ — *Resolved during shaping:*
   read-only self view. Superseded by question 5 below.
2. **What is the pilot's date, scale and shape?** — How many properties, rooms
   and workers, and by when. Drives the timeline budget and target scale.
   Owner: team.
3. **What is the Agency Admin's trigger moment?** — The persona is confirmed but
   the situation in which they reach for Beduno was seeded from documentation,
   not stated. Owner: team.
4. **Who arbitrates "finalized" in practice?** — Acceptance is internal, and all
   four definitions of done were selected at once. Without a single arbiter the
   bar drifts. Owner: team. Block: yes for the closing cross-check.
5. **How does a worker authenticate?** — A read-only self view requires
   credentials for a population that is large, transient and multilingual;
   email + password is a heavy fit. The QR badge each worker already carries is
   a plausible credential, but the badge checksum is unkeyed and forgeable, so
   it cannot stand alone as an auth factor. Owner: team.
   Block: yes for the Worker FRs.
6. **What does a worker's self view show, and in what language?** — Anything
   beyond room and dates re-opens the PII-minimisation question, and the worker
   population is exactly the group least likely to read Polish or English.
   Owner: team.
7. **What replaces `localStorage` for token storage, and does it survive the
   offline requirement?** — Ops screens must work with no connectivity, so the
   chosen mechanism has to keep a usable session on a device that cannot reach
   the refresh endpoint. Owner: team. Block: partial.
8. **Does revocation work offline?** — "Instant" revocation and an offline-first
   front desk are in direct tension: a revoked device that is offline cannot be
   told. The reconciliation point needs naming. Owner: team.
9. ~~**What is the delivery window in weeks?**~~ — *Resolved in the shaping gap
   pass:* 4–6 weeks, recorded as `delivery_weeks: 5`. **Still open:** there is no
   fixed pilot date, so `hard_deadline` is null and the forcing function shaping
   identified does not yet exist. Owner: team. Block: no.
10. **Is "every unchecked box closed" really Primary?** — It conflicts with
    placing E2E-journeys-in-CI in Secondary, since that is one of the unchecked
    boxes. Either the checklist is not Primary, or E2E is not Secondary.
    Owner: team. Block: partial.
11. **Is delivery day-job or after-hours?** — Unanswered; changes available
    capacity by roughly threefold and therefore what "asap" can mean.
    Owner: team.
12. **Cluster A — auth hardening versus offline-first.** FR-006, FR-007 and
    FR-008 each drew the same tension: revocation cannot reach a disconnected
    device, a stricter token store needs a refresh endpoint the front desk
    cannot always reach, and deactivation is hollow without revocation. Decide
    the reconciliation point — probably a bounded offline session lifetime —
    before any of the three is implemented. Owner: team. Block: yes for FR-006,
    FR-007, FR-008.
13. ~~**Cluster B — occupancy truth decays over time.**~~ — *Resolved
    2026-09-12:* "today" on the arrivals list is an operational night-shift
    window, not the calendar date (FR-010); Front Desk gets an explicit
    undo action reversing NO_SHOW → CHECKED_IN with a distinct audit event
    (FR-012); a queued offline action snapshots the state it was valid
    against at queue-time (FR-018); a rejected replay is owned by the user
    who queued it, no SLA/escalation yet at current team scale (FR-019).
14. **Cluster C — the permission model has unowned edges.** FR-001 (capacity is
    a contract term, not an operational one) and FR-002 (exclusive agency
    ownership bottlenecks the 8pm walk-in) both say the two-sided model is
    under-specified at the commercial boundary. Resolving them may re-open
    propose→confirm, which shaping established is not locked.
    Owner: team. Block: yes for FR-001, FR-002.
15. **Cluster D — the PII boundary is drawn by UI, not policy.** FR-005 (worker
    PII on personal phones), FR-020 (allowlist tracks current screens) and
    FR-023 (export leaves all controls) need one written data-handling policy
    rather than three local fixes. Owner: team. Block: partial.
16. **Cluster E — soft constraints may be governance theatre.** FR-022: an
    override path used routinely is not a control. Decide whether soft
    violations need friction, an approver, or a review report.
    Owner: team. Block: no.
17. ~~**Does the domain rule actually change?**~~ — *Resolved in the shaping gap
    pass:* yes. Authority is part of the domain rule, so propose→confirm is
    domain logic and the RBAC correction is a genuine rule change. The
    one-sentence rule was rewritten to carry both admissibility and authority.
    Knock-on: Cluster C becomes a domain question rather than a permissions bug.
18. **Who decides the `POST /stays/{id}/move` response shape?** — No longer
    blocked on an external party, since the `beduno-be` contract was declined as
    a constraint. It is an unmade decision the team owns. Owner: team.
    Block: yes for FR-016 acceptance criteria.
19. ~~**Is bed-level modelling in or out?**~~ — *Resolved in the shaping gap
    pass:* out. Recorded as a functional non-goal.
20. **Job-site and shift linkage is IN SCOPE — and has nothing behind it.**
    Offered as a non-goal twice and declined both times, so it is a decision
    rather than an oversight. Roadmap phase 2 is therefore part of this change,
    yet it has no FR, no user story, no Socratic challenge and no acceptance
    criteria, and it was never costed against the 4–6 week estimate. Either it
    needs a discovery pass of its own, or it needs adding to the non-goals.
    Owner: team. Block: yes.
21. **How does a worker authenticate?** — Promoted to blocking during shaping,
    then de-escalated in the gap pass when FR-005 returned to nice-to-have.
    Still unanswered, and still the precondition for any worker-facing surface.
    Note that `target_scale.users: large` was justified by hundreds of worker
    accounts, so the scale figure now describes ambition rather than what the
    pilot exercises. Owner: team. Block: no (deferred with FR-005).
22. **Nothing is genuinely preserved.** — Correct for a pre-production system,
    but the 13 `[preserved]` items in Scope of Change are intentions about not
    regressing rather than protections: nothing external catches it if they
    break, and the E2E suite that would is itself Secondary. Mirrored from the
    shaping quality cross-check. Owner: team. Block: no.
23. **The largest unresolved body of work is design decisions, not
    implementation.** — Thirteen of 23 scope items carry `Resolution: pending`
    and nine open questions block. Clusters A–E (questions 12–16) name the
    decisions; each needs one decision rather than several local fixes.
    Mirrored from the shaping quality cross-check. Owner: team. Block: yes for
    the items they gate.
