# Territory Report — beduno-fe

Generated 2026-09-14 from `git log` analysis of the current `main` branch.

## Repo overview

- **Total commits**: 281 (`git log --oneline | wc -l`)
- **Repo age**: first commit `40ce1c0 vue3 app init` — no date recorded in that early commit series, but the earliest dated commit is **2022-07-13**; most recent commit is **2026-09-14 19:10:32**. That's roughly 4 years of calendar history, but it is **not continuous** — see below.
- **The repo has two distinct eras**:
  1. **Pre-rewrite marketplace app** ("BedOK", a booking/marketplace site) — everything under `src/views/`, `src/features/`, `src/components/`, `src/auth/`, `src/router/` (legacy Options-style structure, Vuetify-era).
  2. **Post-rewrite ops system** ("Beduno") — the module-per-domain architecture under `src/modules/*`, `src/app/`, `src/shared/`. The rewrite starts at commit `22d29e0` **2026-04-14 14:07:15**, `"[sonnet-4.6] phase 0: migrate to Vite, set up new project foundation"`. All active development since then has happened in the new structure; the legacy directories have **zero commits since 2026-04-14**.
- **Contributors** (`git shortlog -sn --all`):
  | Author | Commits |
  |---|---|
  | superdyzio | 167 |
  | Anita Koźlak | 56 |
  | Dawid Perdek | 27 |
  | Anita-Kozlak | 17 |
  | Dawid | 15 |

  Note: `superdyzio` is the git user for this session/machine and its commit subjects are almost entirely AI-model-tagged (`[sonnet-4.6]`, `[opus-5]`, `[fable-5]`, `[sonnet-5]`, `feat(...)`, `fix(...)`, `chore(...)` from the `/10x-*` workflow). This is effectively **solo, heavily AI-assisted development** on one machine/identity; the other names (`Anita Koźlak`/`Anita-Kozlak`, `Dawid`/`Dawid Perdek` — same people under different git configs) appear concentrated in the older pre-rewrite era based on commit style. Treat contributor counts as identity-fragmented, not as evidence of a larger team.

## Churn by area

Top-level directory churn (file-touches across all commits, `git log --pretty=format: --name-only`):

| Directory | File-touches |
|---|---|
| `src/` | 1133 |
| `context/` | 63 |
| `docs/` | 60 |
| `public/` | 38 |
| `e2e/` | 18 |
| `scripts/` | 17 |
| `tests/` | 12 |

`src/` second-level breakdown:

| Path | Touches | Era |
|---|---|---|
| `src/assets` | 443 | mixed — mostly translation files, active in both eras |
| `src/modules` | 220 | current (post-rewrite) |
| `src/features` | 204 | legacy (dead since 2026-04-14) |
| `src/views` | 90 | legacy (dead since 2026-04-14) |
| `src/shared` | 77 | current |
| `src/components` | 27 | legacy (dead since 2026-04-14) |
| `src/app` | 17 | current |
| `src/router` | 15 | legacy (dead since 2026-04-14) |
| `src/auth` | 14 | legacy (dead since 2026-04-14) |

`src/modules/*` breakdown (current architecture, commit counts via `git log --oneline -- <path>`, all-time):

| Module | Commits (all-time) | Last touched |
|---|---|---|
| `stays` | 16 | 2026-09-14 |
| `inhouse` | 16 | 2026-09-14 |
| `arrivals` | 16 | 2026-09-14 |
| `ops` | 10 | 2026-09-14 |
| `inspection` | 9 | 2026-09-14 |
| `auth` | 8 | 2026-09-14 |
| `workers` | 8 | 2026-09-14 |
| `audit` | 7 | 2026-09-14 |
| `exports` | 4 | 2026-09-14 |
| `properties` | 4 | 2026-09-14 |
| `admin` | 5 | 2026-04-14 (dormant since rewrite week) |

(These counts undercount true module activity — many recent commits touch multiple modules at once, e.g. the `[sonnet-5] sync frontend contract to real beduno-be OpenAPI spec` commit at `c11add5` touched arrivals/inhouse/inspection/ops/properties/stays/workers/exports simultaneously, so it's counted once per module above.)

Top individual files by commit count (all-time): `src/assets/translations/{ru,en,de,pl}.ts` (32–34 each — expected, all five locale files change together per the CLAUDE.md rule), `package.json` (21), `docs/should-be/implementation-plan.md` (18), `src/shared/layouts/AdminLayout.vue` (16), legacy `src/router/index.ts` (15) vs current `src/app/router/index.ts` (12).

## Recently active areas (last 60 days, since ~2026-07-16)

81 of the 281 total commits (≈29%) landed in the last 60 days — recent velocity is high relative to total history.

Top-level churn in the last 60 days:

| Directory | Touches (60d) |
|---|---|
| `src/` | 102 |
| `context/` | 63 |
| `docs/` | 29 |
| `scripts/` | 17 |
| `e2e/` | 14 |

`src/modules/*` churn in the last 60 days:

| Module | Touches (60d) |
|---|---|
| `stays` | 16 |
| `arrivals` | 13 |
| `inhouse` | 10 |
| `properties` | 7 |
| `inspection` | 7 |
| `audit` | 7 |
| `auth` | 5 |
| `workers` | 4 |
| `exports` | 3 |
| `ops` | 2 |

`context/changes/` activity in the last 60 days is dominated by four active change folders:

| Change folder | Touches (60d) |
|---|---|
| `live-api-e2e-harness` | 15 |
| `testing-live-journey-beduno-be` | 11 |
| `testing-conflict-engine-correctness` | 11 |
| `stay-lifecycle-e2e` | 4 |

**Right now (last ~20 commits) the work is almost entirely E2E test authoring** against three change streams: `stay-lifecycle-e2e`, `testing-live-journey-beduno-be` (Arrival Day / Nightly List / Inspection Day journeys), and `testing-conflict-engine-correctness` (composable/store/component-level tests for the conflict engine), interleaved with small app-code fixes surfaced by that testing (`fix audit log crash on ROOM/BED entity links`, `fix admin sidebar highlighting two nav items`, `sync frontend contract to real beduno-be OpenAPI spec`). The most recently touched app directories are `src/assets` (translations, 2026-09-14) and `src/shared` (API sync, 2026-09-13).

Just before that (commits ~20–55 in the last-100 window), the focus was **production deployment hardening**: `live-api-e2e-harness` (CI wiring, smoke spec, sign-in fixture) and a long `[opus-5]` streak fixing `scripts/deploy/` (`route api/* to the backend origin`, `gate every action that changes live behaviour`, `stop deploy.sh trusting the origin list's order`, `upload sw.js last`) plus doc-reconciliation passes (`correct data-model doc to match shipped types`, `re-verify implementation plan checkboxes against the code`).

## Dormant/stable areas

- **All pre-rewrite marketplace code** (`src/views/`, `src/features/`, `src/components/`, `src/auth/`, `src/router/`) — zero commits since **2026-04-14**, the rewrite cutover. This is dead code left in the tree from the "as-is" era (per `docs/as-is/`), not actively maintained.
- **`src/modules/admin`** — 5 commits, all on 2026-04-14 (i18n key fixes during the rewrite week). Untouched for ~5 months; likely thin/stable rather than actively evolving.
- **`src/modules/ops`** — low recent touches (2 in 60 days) despite being a core layout module; last touched 2026-09-14 but infrequently, suggesting the ops shell itself is stable while the modules it hosts (arrivals, inhouse, inspection) see the actual churn.
- **`public/`** (38 touches all-time, PWA manifest/icons) — no recent entries in the 60-day window, suggesting the PWA shell is stable.

## Process vs. code churn

- **`context/` directory**: 63 touches all-time, but **all 63 are within the last 60 days** — this is a brand-new planning layer (the `/10x-*` workflow: `context/changes/`, `context/foundation/`, `context/deployment/`) adopted recently and now driving most process overhead. `context/changes` (42 touches) dominates over `context/foundation` (15) and `context/deployment` (5); `context/archive` has only 1 touch (nothing archived yet as of this snapshot besides what's in flight).
- **`docs/`**: 60 touches all-time, 29 in the last 60 days — this is the `docs/should-be/` spec-reconciliation work (a long series of `[opus-5] correct/fix ... doc` commits verifying docs against shipped code), separate from both `context/` planning and `src/` app code.
- **Split of recent (60-day) commits**: `src/` (app code, 102 file-touches) vs. `context/` + `docs/` (process/planning docs, 92 file-touches combined) — process and application churn are roughly comparable in the current window, which is notable: nearly half of recent change volume is planning/verification documentation, not shipped feature code. This tracks with the repo's heavy use of the AI-driven change-planning workflow (`/10x-new` → `/10x-plan` → `/10x-implement` → `/10x-impl-review`) rather than ad hoc commits.
- **`e2e/`**: 18 touches all-time, 14 in the last 60 days — almost all E2E authoring is recent, concentrated in the three active testing change-streams described above (this maps to the Module 3 Lesson 4 E2E rollout: `docs/reference` / `test-plan.md` phased rollout).

## Module-by-module summary

| Module | Last touched | Commits (all-time) | Characterization |
|---|---|---|---|
| `stays` | 2026-09-14 | 16 | Actively evolving — highest-churn current module, core to both stay-lifecycle and conflict-engine test streams |
| `arrivals` | 2026-09-14 | 16 | Actively evolving — central to the "Arrival Day" E2E journey work |
| `inhouse` | 2026-09-14 | 16 | Actively evolving — "Nightly List" E2E journey, high recent touches |
| `ops` | 2026-09-14 | 10 | Stable shell — infrequent touches (2 in 60d) despite being the PWA host layout |
| `inspection` | 2026-09-14 | 9 | Actively evolving — "Inspection Day" E2E journey work |
| `auth` | 2026-09-14 | 8 | Moderately active — recent dashboard/API-sync work, not a primary focus |
| `workers` | 2026-09-14 | 8 | Moderately active, lower churn than core ops modules |
| `audit` | 2026-09-14 | 7 | Active — recent bug fix (ROOM/BED entity link crash) plus test coverage |
| `exports` | 2026-09-14 | 4 | Barely touched — low churn throughout, touched mainly by contract-sync sweeps |
| `properties` | 2026-09-14 | 4 | Low commit count but active in last 60 days (contract sync + test work) |
| `admin` | 2026-04-14 | 5 | Dormant since rewrite week — no activity in ~5 months |
| `exports` (legacy `src/views`, `src/features`, `src/components`, `src/auth`, `src/router`) | 2026-04-14 | n/a (204+90+27+14+15 touches pre-cutover) | Dead code — untouched since the Vite/Pinia rewrite; candidate for removal, not active development |
