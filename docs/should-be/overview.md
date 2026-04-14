# Target Product Overview

## What BedOK Becomes

BedOK is an **operational system for bed occupancy management** used by temporary work agencies in Poland (and later CEE). It replaces spreadsheets and WhatsApp as the single source of truth for *"who sleeps where tonight"*.

The platform tracks workers, assigns them to properties/rooms/beds, enforces constraints (capacity, gender rules), and provides audit trails — all across multiple properties with multiple user roles.

## Problem Statement

Owners of temporary work agencies move hundreds of workers between locations. Workers have different attributes (gender, skills, languages), properties have capacity constraints, and the roster changes constantly. Today this is managed with Excel, WhatsApp, and phone calls — leading to overbookings, lost workers, and inspection failures.

## Target Users & Roles

| Role | Responsibility | App |
|------|---------------|-----|
| **Agency Admin** | User management, permissions, audit review, billing | Web Admin |
| **Agency Planner** | Creates planned stays, proposes assignments, bulk imports | Web Admin |
| **Property Admin** | Manages room inventory, capacity rules, property settings | Web Admin |
| **Front Desk / Shift Lead** | Operational check-in/out, room moves, no-show marking | Mobile Ops |

## Core Workflow: Propose → Confirm

The system uses a **hybrid truth model**:

1. **Agency side** creates *planned* assignments ("Worker X should arrive Friday at Property Y")
2. **Property side** confirms *reality* (check-in, check-out, room changes, no-shows)
3. Agency **cannot** overwrite actual occupancy — only propose changes

This separation is critical: if agencies could overwrite what property managers report, external partners would stop trusting the tool.

## Three Must-Not-Fail Moments

The MVP is designed around three operational moments that must work perfectly:

### 1. Arrival Day
- "Expected today" list per property
- QR scan → check-in in 1–2 taps
- No-show / arrived late / redirected tracking

### 2. Nightly List
- "Currently in-house" per property per room
- Exceptions: over-capacity, unknown person, unassigned worker
- One-tap export (CSV/PDF)

### 3. Inspection Day
- Room-by-room roster
- "Expected vs present" discrepancy capture
- Timestamped confirmation with "confirmed by" audit

## Technical Shape (forced by requirements)

The locked decisions force a specific product architecture:

- **Web Admin** — for agency + property admin (desktop-first, responsive)
- **Mobile Ops App** — for front desk / shift leads (mobile-first, offline-capable)
- **Offline-first with conflict resolution** — poor reception at properties
- **Strict RBAC** — role-based access, session revocation, minimal PII on operational screens
- **Multi-language from day 1** — PL, EN, DE, UA, RU (per-user language, localized exports)
- **QR check-in** — badge/paper/phone wallet; QR contains only `workerId + checksum` (no PII)

## Product Roadmap (De-risked Sequencing)

| Phase | Scope | Focus |
|-------|-------|-------|
| **1 (MVP)** | Internal housing ops | Occupancy + check-in/out + audit + reporting |
| **2** | Job-site linkage | Assign worker to site + shift (lightweight) |
| **3** | Transport | "Bus list per pickup point" — not route optimisation |
| **4** | External supply | Verified partner properties (B2B, contracts + SLAs) |
| **5** | Public marketplace | Identity verification, payments, disputes, reviews |

## Key Metrics

- **Nightly list correctness** — in-house count matches reality
- **Arrival correctness** — expected arrivals list is up to date; no-shows tracked same day
- **Inspection correctness** — discrepancies captured with timestamp + who approved
- **Check-in speed** — median < 10 seconds (QR scan flow)
- **Adoption** — ≥80% of check-ins done in tool (not WhatsApp)
- **Weekly Active Operators (WAO)**

## Pricing Model

- **Agency**: per active housed worker/month (not total workers in database)
- **Property**: small fee per occupied bed/month or per property/month (deferred — don't bet MVP on property revenue)

## Compliance

- GDPR applies (PII: names, IDs, phone numbers, addresses, potentially immigration/work eligibility data)
- MVP approach: store minimum data, field-level access control, audit trail, retention policy
- QR codes contain zero PII (internal ID + checksum only)
- BYOD shift leads see minimal PII — only what's needed for check-in
- Device/session revocation must work instantly
