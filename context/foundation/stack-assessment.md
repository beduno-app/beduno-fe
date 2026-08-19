---
project: beduno-fe
assessed_at: 2026-08-19T06:53:38Z
agent_readiness: ready
context_type: brownfield
stack_components:
  language: "TypeScript 5.7 (strict)"
  framework: "Vue 3.5 SPA (vue-router 4.5, Pinia 3, vue-i18n 11)"
  build_tool: "Vite 6.2 (+ vite-plugin-pwa)"
  test_runner: "Vitest 3 (unit/component) + Playwright 1.50 (E2E)"
  package_manager: npm
  ci_provider: GitHub Actions
  deployment_target: "Docker + nginx"
gates_passed: 9
gates_failed: 0
---

## Stack Components

**Language — TypeScript 5.7, strict.** `tsconfig.json` enables `strict`,
`noImplicitAny`, `noUnusedLocals` and `noUnusedParameters`. Type checking is
enforced twice: `npm run build` runs `vue-tsc --noEmit` before `vite build`, and
CI runs `npm run typecheck` as its own step.

**Framework — Vue 3.5 SPA.** `<script setup>` Composition API throughout, with
vue-router 4.5, Pinia 3 (+ `pinia-plugin-persistedstate`), and vue-i18n 11
(`legacy: false`, five locales). No meta-framework (no Nuxt) and no component
framework — components are hand-written with scoped SCSS. Project layout is a
documented vertical-slice module structure (see the convention criterion below).

**Build tool — Vite 6.2.** Single `vite.config.ts` carrying the PWA config
(`vite-plugin-pwa` + workbox) and the embedded Vitest `test:` block. There is no
standalone `vitest.config.ts`.

**Test runner — Vitest 3 + Playwright 1.50.** Vitest with jsdom and
`@vue/test-utils` for co-located `*.spec.ts` unit/component tests
(`axios-mock-adapter` for API tests). Playwright (Chromium + Pixel 5 projects)
for E2E in `e2e/`, excluded from Vitest. Playwright is not wired into CI — a
known gap already recorded in the PRD.

**Package manager — npm.** CI runs `npm ci`; `package-lock.json` is current
(2026-08-09). A stale `yarn.lock` (2026-04-15) is also git-tracked — a leftover,
flagged under Gaps below.

**CI/CD — GitHub Actions.** `.github/workflows/ci.yml`: lint → typecheck → unit
tests → build. Unit tests run as `npx vitest run --passWithNoTests`, which
weakens the gate (an empty suite passes) — forwarded to the health check.

**Deployment — Docker + nginx.** `Dockerfile` copies a prebuilt `dist/` into
`nginx:1.27-alpine`; `nginx.conf` does SPA fallback and proxies `/api/` to
`${BACKEND_URL}`.

**Instruction files.** A current, accurate repo-root `CLAUDE.md` (rewritten
2026-08-09) documenting commands, architecture, module layout, domain rules,
offline design, i18n and testing conventions. No `AGENTS.md`, `.cursor/rules`,
or Copilot instructions — only Claude Code is provisioned.

## Quality Gate Assessment

| Component   | Typed | Convention | Training Data | Documented | Verdict |
|-------------|-------|------------|---------------|------------|---------|
| Language    | ✓     | —          | —             | —          | pass    |
| Framework   | —     | ~          | ✓             | ✓          | pass    |
| Build tool  | —     | ✓          | ✓             | ✓          | pass    |
| Test runner | —     | —          | ✓             | ✓          | pass    |

Legend: ✓ = pass, ✗ = fail, ~ = partial (pass-with-note), — = not applicable

### Gate Details

**Typed — pass.** Evidence: `tsconfig.json` with `"strict": true`,
`"noImplicitAny": true`, `"noUnusedLocals": true`, `"noUnusedParameters": true`;
`typescript` 5.7 and `vue-tsc` 2.2 in devDependencies; typecheck enforced in
both the build script and CI. Contracts are explicit — core domain types
(`UserRole`, `StayStatus`) live in module-level `types/` files.

**Convention-based — pass with note.** Vue without a meta-framework does not
dictate project layout or routing; every Vue SPA lays these out differently.
This project compensates fully: `CLAUDE.md` documents the vertical-slice module
structure (each module: `api/`, `store/`, `composables/`, `components/`,
`views/`, `types/`), the two route trees with role guards via route meta, the
shared `Base*` component convention, the single-IndexedDB-declaration rule, and
the five-locale i18n rule. This is the documented-conventions case: scored as a
pass because the conventions exist, are accurate (verified against the code
2026-08-09), and live where an agent reads them. The note: the conventions are
carried by the instruction file, not the framework — keeping `CLAUDE.md`
current is load-bearing for agent work in a way it would not be under Nuxt or a
similar convention-shipping framework.

**Popular in training data — pass** (assessed within the JS/TS family). Vue 3
is a top-tier mainstream framework; `<script setup>` + Composition API, Pinia,
vue-router and vue-i18n are the standard Vue ecosystem picks with deep corpus
presence. Vite and Vitest are the dominant build/test pair in modern JS; 
Playwright is the mainstream E2E tool.

**Well-documented — pass.** Vue (vuejs.org), Pinia, vue-router, vue-i18n, Vite
(vite.dev), Vitest (vitest.dev) and Playwright (playwright.dev) all maintain
current, versioned official docs. No component of this stack relies on
community wikis or scattered posts.

## Gaps & Compensation

No quality criterion failed, so no compensation in the strict sense is
required. Four observations of friction remain, with concrete fixes:

1. **Dual lockfile.** Both `package-lock.json` (current) and the stale
   `yarn.lock` (four months old) are git-tracked. An agent — or a teammate —
   can infer yarn from the lockfile and produce a divergent dependency tree.
   Best fix: delete `yarn.lock`. Until then, the instruction-file rule below
   compensates.

2. **Conventions live in the instruction file, not the framework.** Not a gap
   today — `CLAUDE.md` is current and verified — but a standing obligation:
   structural changes this PRD introduces (a fifth role, new auth storage, new
   screens) must be reflected in `CLAUDE.md` in the same change, or the
   convention pass above erodes.

3. **CI's unit-test step passes with zero tests.** `--passWithNoTests` means a
   refactor that orphans every spec still goes green. This weakens the only
   automated regression net the PRD's 13 `[preserved]` items have (PRD Open
   Question 22). Owned by `/10x-health-check`; recorded here for continuity.

4. **Playwright exists but is not a CI gate**, and current E2E specs assert
   route guards only. Matches PRD Secondary criterion "real E2E journeys
   running in CI" and Open Question 10. Owned by the change itself, not by
   instruction files.

### Recommended Instruction File Additions

Ready to paste into `CLAUDE.md`:

```markdown
## Package manager

npm only. CI runs `npm ci` against `package-lock.json`. Never run `yarn` or
`pnpm` in this repo — the tracked `yarn.lock` is a stale leftover (proposed
for deletion), not a signal that yarn is in use.
```

```markdown
## Keeping this file honest

Any change that adds a role, a module, an IndexedDB store, a route tree, or a
locale must update the matching section of this file in the same commit.
CLAUDE.md carries this project's conventions (there is no meta-framework to
carry them); an outdated CLAUDE.md silently degrades every agent session.
```

## Summary

**Verdict: ready.** All nine applicable criterion checks pass across the four
components. This is a thoroughly mainstream, strictly-typed, well-documented
stack — TypeScript strict + Vue 3 + Vite + Vitest/Playwright — and the one
structural weakness a plain SPA has (no framework-imposed layout) is fully
compensated by an accurate, recently verified `CLAUDE.md`.

Key strengths: strict typing enforced in build and CI; documented vertical-slice
conventions; mainstream ecosystem with deep training-data presence.

Key friction: dual lockfile (delete `yarn.lock`); `--passWithNoTests` in CI;
E2E not a CI gate; convention documentation is load-bearing and must be
maintained alongside the PRD's structural changes.

Scope note: the PRD's Scope of Change (RBAC correction, auth-storage change,
Worker role, offline hardening, job-site linkage) introduces no new stack
components — everything lands inside this assessed stack. The open
token-storage decision (PRD Open Question 7) is a design choice within the
stack, not a stack change.

Next step: `/10x-health-check` — dependency health, test-suite reality, and
CI/CD coverage, focused on observations 3 and 4 above.
