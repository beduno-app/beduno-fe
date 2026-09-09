---
project: beduno-fe
checked_at: 2026-08-19T07:00:58Z
health_status: critical-issues
context_type: brownfield
language_family: js
stack_assessment_available: true
checks_run:
  - lockfile
  - dependency_audit
  - outdated_deps
  - test_runner
  - ci_cd
  - configuration
audit_findings:
  critical: 1
  high: 14
  moderate: 2
  low: 1
test_runner_detected: true
ci_provider: GitHub Actions
recommended_fixes: 5
---

## Dependency Health

### Lockfile

Status: present (`package-lock.json`)
Package manager: npm

The stale `yarn.lock` flagged by the stack assessment was deleted earlier today
(2026-08-19); npm is now the single, unambiguous package manager.

### Security Audit

Tool: `npm audit --json`
Summary: 1 CRITICAL, 14 HIGH, 2 MODERATE, 1 LOW (18 advisories total)
Direct vs transitive: 3 direct (`vitest` CRITICAL, `axios` HIGH, `vite` HIGH),
15 transitive. Every advisory reports a fix available.

#### CRITICAL findings

- **vitest** 3.2.4 (direct, dev) — GHSA-5xrq-8626-4rwp: when the Vitest UI
  server is listening, arbitrary files can be read and executed (CVSS 9.8).
  Exposure is limited to dev machines running the UI server, but the fix is
  free: 3.2.7 satisfies the declared `^3.0.0` range. Fix: `npm update vitest`.

#### HIGH findings

- **axios** 1.15.0 (direct, **runtime**) — 20+ advisories against
  1.0.0–1.17.0, the serious ones being prototype-pollution gadgets enabling
  credential injection, request hijacking and full MitM via `config.proxy`
  (GHSA-35jp-ww65-95wh, CVSS 8.7; GHSA-q8qp-cvcw-x6jj, CVSS 7.4), NO_PROXY
  bypasses (GHSA-pjwm-pj3p-43mv, CVSS 8.6) and several DoS vectors. This is
  the HTTP layer carrying every auth token in the app — and the PRD's
  auth-storage change (FR-008) rides on it. Fix: `npm update axios` → 1.19.0
  (within the declared `^1.7.0` range).
- **vite** 6.4.2 (direct, dev) — GHSA-fx2h-pf6j-xcff: `server.fs.deny` bypass
  on Windows (CVSS 7.5). Fix: `npm update vite` → 6.4.3.
- Transitive HIGHs (12): `@babel/plugin-transform-modules-systemjs`,
  `brace-expansion`, `fast-uri`, `form-data`, `immutable`, `js-cookie`,
  `js-yaml`, `lodash`, `nanoid`, `postcss`, `serialize-javascript`, `ws` —
  mostly ReDoS/DoS plus a lodash `_.template` code-injection (CVSS 8.1) and a
  serialize-javascript RCE (CVSS 8.1). All fixable in-range.
  Fix: `npm audit fix` (no `--force` required).

MODERATE (2): `@rollup/plugin-terser`, `workbox-build` — log-only.
LOW (1): `@babel/core` sourceMappingURL file read — log-only.

### Outdated Dependencies

Packages 2+ major versions behind (direct):

- **jsdom**: 26.1.0 → 30.0.1 (4 majors behind)
- **typescript**: 5.9.3 → 7.0.2 (2 majors behind)
- **vite**: 6.4.2 → 8.2.1 (2 majors behind)

One major behind (batch for a deliberate upgrade pass, not urgent): eslint 9→10,
@eslint/js 9→10, eslint-plugin-vue 9→10, pinia 3→4, vitest 3→4, vue-router 4→5,
vue-tsc 2→3, @vitejs/plugin-vue 5→6, vite-plugin-pwa 0.21→1.

## Test Suite

Test runner: Vitest 3.2.4 (unit/component) + Playwright 1.59.1 (E2E)
Tests found: 151 unit/component tests in 14 co-located spec files;
24 E2E tests in 4 files (enumerated via `playwright test --list`)
Test execution: passing — full Vitest suite ran green today (2026-08-19,
151/151) as verification for the CI hardening commit

Configuration: Vitest config embedded in `vite.config.ts` (jsdom environment,
`e2e/**` excluded); Playwright in `playwright.config.ts` (Chromium + Pixel 5).
Caveat carried from the PRD: the 24 E2E tests assert route guards only — no
user journey is exercised — and Playwright does not run in CI.

## CI/CD

Provider: GitHub Actions
Configuration: `.github/workflows/ci.yml` (push to all branches, PRs to main)

| Stage      | Status | Notes                                              |
|------------|--------|----------------------------------------------------|
| Lint       | ✓      | `npm run lint` (ESLint 9 flat config)              |
| Test       | ✓      | `npm test` — hardened today: `--passWithNoTests` removed, so an empty suite now fails |
| Build      | ✓      | `npm run build` (vue-tsc + vite build)             |
| Type check | ✓      | `npm run typecheck` (vue-tsc, dedicated step)      |
| Security   | ✗      | No audit step, no Dependabot, no CodeQL            |

## Configuration

### High severity

None — `tsconfig.json` is strict, `.gitignore` is present and curated,
ESLint (`eslint.config.js`) and Prettier (`.prettierrc`) are both configured.

### Medium severity

None.

### Low severity

- **`.editorconfig`** — keeps non-agent editors consistent with Prettier
  settings. Fix: add a 6-line `.editorconfig` mirroring `.prettierrc`.
- **`.env.example`** — `VITE_API_BASE_URL` is documented only in `CLAUDE.md`;
  an example env file makes it discoverable to tooling and humans.
  Fix: add `.env.example` with the one variable and a comment.

## Stack Assessment Cross-Reference

Stack assessment: `context/foundation/stack-assessment.md` (2026-08-19)
Agent readiness (from stack-assess): ready

| Stack-Assess Observation            | Health-Check Finding                                         | Status     |
|-------------------------------------|--------------------------------------------------------------|------------|
| Dual lockfile (stale `yarn.lock`)   | `yarn.lock` deleted; npm-only rule added to `CLAUDE.md`      | Resolved   |
| `CLAUDE.md` conventions load-bearing| Keep-it-honest rule added to `CLAUDE.md` Conventions          | Mitigated  |
| CI `--passWithNoTests` weakens gate | CI now runs `npm test`; 151 tests back the gate               | Resolved   |
| Playwright not a CI gate            | 24 E2E tests exist but assert route guards only; still not in CI | Reinforced (open) |

The two reports diverge deliberately: stack-assess evaluated the *stack choice*
(ready — mainstream, typed, documented) and this report evaluates the *project
state*, where the dependency tree is the problem. The verdicts are compatible:
right stack, stale tree.

## Recommended Fixes

### Fix before agent work (Category A)

### 1. Patch the three direct vulnerable dependencies

**Impact**: `axios` is the runtime HTTP layer carrying every auth token — the
prototype-pollution and proxy advisories sit directly under the PRD's
auth-storage change (FR-008, Open Question 7). `vitest`'s CRITICAL affects any
dev machine running the UI server. All three fixes are within the already
declared semver ranges, so this is a lockfile-only change.
**Severity**: critical
**Effort**: quick (< 5 min)
**Fix**:

    npm update vitest vite axios
    npm audit   # confirm the CRITICAL and the two direct HIGHs are gone
    npm test    # 151 tests should still pass

### 2. Clear the transitive HIGH advisories

**Impact**: lodash code-injection and serialize-javascript RCE sit in the
build/test toolchain; the rest are DoS-class. Low direct exposure, but a clean
audit is the baseline an agent-assisted change should start from.
**Severity**: high
**Effort**: moderate (15–30 min including verification)
**Fix**:

    npm audit fix          # all advisories report in-range fixes; no --force
    npm run lint && npm run build && npm test

### 3. Add a security stage to CI

**Impact**: CI covers lint/typecheck/test/build but nothing watches
dependencies, which is how an 18-advisory backlog accumulated silently in a
pre-production repo. Dependabot is the lowest-cost fix; an audit step gates PRs.
**Severity**: medium
**Effort**: quick (< 5 min)
**Fix**: add `.github/dependabot.yml` (npm ecosystem, weekly) and optionally a
CI step after `npm ci`:

    - name: Audit
      run: npm audit --audit-level=high

### 4. Schedule the major-version upgrade pass

**Impact**: jsdom (4 majors), typescript (2), vite (2) plus the one-major batch
will only get harder to cross as the PRD's 4–6 weeks of changes land on top.
Not a now-task — a scheduled one, ideally its own change folder after the
pilot-critical work.
**Severity**: medium
**Effort**: significant (> 1 hour)
**Fix**: one deliberate upgrade change (`typescript` 7 and `vite` 8 first,
`jsdom` with the vitest 4 move), each verified by the full suite.

### 5. Add the two convenience files

**Impact**: minor consistency and discoverability wins.
**Severity**: low
**Effort**: quick (< 5 min)
**Fix**: `.editorconfig` mirroring `.prettierrc`; `.env.example` documenting
`VITE_API_BASE_URL`.

### Addressed in upcoming lessons (Category B)

### Real E2E journeys as a CI gate

**Lesson**: the E2E testing lesson of the testing module (and PRD Secondary
criterion / Open Question 10 — it is part of the change itself).
**What you'll do there**: replace the 24 route-guard-only specs with seeded
user-journey tests (check-in, inspection, exports) and wire Playwright into CI.

### Deployment pipeline beyond the Docker image

**Lesson**: [Sprint Zero z Agentem: infrastruktura, walking skeleton i pierwszy
deploy (M1L5)](https://platforma.przeprogramowani.pl/external/10xdevs-3/m1-l5)
**What you'll do there**: pick the deployment platform and wire the CD path;
today only `docker:build` exists, with no automated deploy.

## Summary

Health status: critical-issues

The infrastructure around the code is in genuinely good shape — strict
TypeScript, a real 151-test suite that runs green, four of five CI stages
present, and every instruction-file gap from the stack assessment already
closed today. The verdict is carried entirely by the dependency tree: 1
CRITICAL and 14 HIGH advisories, including the runtime HTTP client of an
auth-handling app. The mitigating fact: every single advisory has an in-range
fix, so fixes 1–2 (one `npm update`, one `npm audit fix`, ~20 minutes with
verification) flip this report to healthy.

Next step: run fixes 1–3, then proceed — agent onboarding is effectively done
for Claude Code (`CLAUDE.md` is current and verified), so the chain continues
into roadmap/change planning for the PRD's scope.
