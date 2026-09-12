<!-- IMPL-REVIEW-REPORT -->
# Implementation Review: Live-Journey Proof Against beduno-be Implementation Plan

- **Plan**: context/changes/testing-live-journey-beduno-be/plan.md
- **Scope**: Phase 4 of 4 (full plan review)
- **Date**: 2026-09-12
- **Verdict**: REJECTED
- **Findings**: 1 critical, 2 warnings, 0 observations

## Verdicts

| Dimension | Verdict |
|-----------|---------|
| Plan Adherence | FAIL |
| Scope Discipline | PASS |
| Safety & Quality | WARNING |
| Architecture | PASS |
| Pattern Consistency | WARNING |
| Success Criteria | WARNING |

## Findings

### F1 — All three new e2e specs hardcode English UI text against a Polish-locale app

- **Severity**: ❌ CRITICAL
- **Impact**: 🔎 MEDIUM — real tradeoff; pause to reason through it
- **Dimension**: Plan Adherence
- **Location**: e2e/arrival-day.spec.ts (multiple lines), e2e/nightly-list.spec.ts (multiple lines), e2e/inspection-day.spec.ts (multiple lines)
- **Detail**: `plan.md`'s own Contract text specified locale-resolved locators (e.g. `getByRole('button', { name: t('arrivals.scanQr') })`, `getByText(t('arrivals.checkInSuccess'))`), but every button name, placeholder, and toast-text assertion across all three new specs was implemented as a hardcoded English literal instead (`'Scan QR'`, `'Confirm'`, `'Checked in successfully.'`, `'Check out'`, `'Start inspection'`, `'Present'`, `'Mark as verified'`, `'Next room'`, `'Complete inspection'`, `'Inspection completed.'`, `'Inspection summary'`, etc.). `src/app/plugins/i18n.ts:10` hardcodes `locale: 'pl'` with no override anywhere in these specs, and I independently confirmed every one of these strings has a different real Polish rendering (verified against `src/assets/translations/pl.ts`: `scanQr: 'Skanuj QR'`, `checkInSuccess: 'Zameldowano pomyślnie.'`, `checkOut: 'Wymelduj'`, `startInspection: 'Rozpocznij inspekcję'`, `present: 'Obecny'`, `markVerified: 'Oznacz jako zweryfikowany'`, `nextRoom: 'Następny pokój'`, `completeInspection: 'Zakończ inspekcję'`, `inspectionCompleted: 'Inspekcja zakończona.'`, `summaryTitle: 'Podsumowanie inspekcji'`). These specs will fail immediately against the live app, independent of whether the API itself works — this is not a speculative risk, it's a certain failure. This is the exact same class of defect (F2/F4) already found and fixed in this session's earlier `live-api-e2e-harness` review; the lesson wasn't applied here.
- **Fix A ⭐ Recommended**: Replace each hardcoded English literal with the real Polish string, following `e2e/auth.setup.ts`'s own established convention (hardcode the Polish text directly, with a one-line comment explaining why — it already does this for `'Zaloguj się'`).
  - Strength: Matches the exact precedent this codebase already established for this exact problem; zero new pattern to introduce; smallest possible diff.
  - Tradeoff: If a translation string changes in `pl.ts` later, these hardcoded strings silently drift out of sync — same tradeoff `auth.setup.ts` already accepted.
  - Confidence: HIGH — `auth.setup.ts` already proves this pattern works in this exact harness.
  - Blind spot: None significant.
- **Fix B**: Import the `pl` translations module in each spec (`import pl from '@/assets/translations/pl'`) and reference keys directly (`pl.arrivals.scanQr`), so the specs track translation changes automatically.
  - Strength: Never drifts out of sync with real copy changes.
  - Tradeoff: Introduces a new pattern not used anywhere else in `e2e/` (including `auth.setup.ts`); needs confirming the e2e TypeScript config can resolve `@/` imports from `src/`.
  - Confidence: MEDIUM — untested whether e2e's tsconfig/module resolution supports this import path.
  - Blind spot: Whether Playwright's test runner (not Vite) can resolve the `@/` alias without extra config.
- **Decision**: FIXED (via Fix A) — all hardcoded English literals across the three specs replaced with the real Polish strings, with an explanatory comment matching `auth.setup.ts`'s convention. Verified via `npm run typecheck`, `npx eslint e2e/`, and `npx playwright test --list` (all clean, all 3 specs still correctly discovered).

### F2 — nightly-list.spec.ts uses CSS class selectors instead of accessible locators

- **Severity**: ⚠️ WARNING
- **Impact**: 🔎 MEDIUM — real tradeoff; pause to reason through it
- **Dimension**: Pattern Consistency
- **Location**: e2e/nightly-list.spec.ts:34-37
- **Detail**: Uses `.room-card`, `.room-number`, `.occupant` CSS class selectors, violating the project's `getByRole`-first E2E rule (`.claude/rules/10x-m3l4.md`). Verified against `RoomCard.vue`: the room container, room-number span, and occupant rows genuinely carry no role/aria-label/data-testid — there is no accessible-attribute alternative today, which is the rule's stated condition for falling back to `getByTestId`. The spec reached for a raw CSS class instead of that documented fallback.
- **Fix A ⭐ Recommended**: Add `data-testid="room-card"` / `data-testid="room-number"` / `data-testid="occupant"` to `RoomCard.vue`, and switch the spec to `getByTestId`.
  - Strength: Follows the project's own documented escape hatch exactly; survives any future styling refactor that would break a CSS-class-based selector.
  - Tradeoff: Touches a production component (`RoomCard.vue`) to add test-only attributes, not just the test file.
  - Confidence: HIGH — this is literally what the rule prescribes for this exact situation.
  - Blind spot: None significant.
- **Fix B**: Leave the CSS-class selectors as a documented, accepted exception (no accessible attributes exist today), and note it in `test-plan.md` §7 alongside this rollout's other locked-not-fixed gaps.
  - Strength: No production code changes needed; matches this rollout's own "lock and flag" discipline used elsewhere.
  - Tradeoff: The selector stays fragile against any future markup/styling change to `RoomCard.vue`.
  - Confidence: MEDIUM — works today, but is the weaker long-term choice for a shared component that will likely change.
  - Blind spot: None significant.
- **Decision**: FIXED (via Fix A) — added `data-testid="room-card"`/`"room-number"`/`"occupant"` to `RoomCard.vue`; `nightly-list.spec.ts` now uses `getByTestId(...)` throughout. Verified via `npm run typecheck`, `npm run lint`, `npx eslint e2e/`, and `npm test` (160/160 unit tests unaffected).

### F3 — inspection-day.spec.ts's afterEach cleanup click isn't guarded against its own failure

- **Severity**: ⚠️ WARNING
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Safety & Quality
- **Location**: e2e/inspection-day.spec.ts:17-20
- **Detail**: The `test.afterEach` hook guards `isVisible()` with `.catch(() => false)` but not the subsequent `completeButton.click()` — if the click becomes non-actionable (e.g. element detached mid-navigation), the hook itself throws, producing a separate hook-failure report on top of any original test failure, working against the "accepted-risk, never block" intent the comment states.
- **Fix**: Wrap the `click()` call in the same try/catch pattern already used for `isVisible()`, logging (not throwing) on failure.
- **Decision**: FIXED — `click()` now chained with `.catch(() => undefined)`, so a cleanup failure never masks or adds noise to the real test outcome. Verified via `npm run typecheck` and `npx eslint e2e/` (clean, no console-statement warning).

## Success Criteria Verification

**Automated** (re-run this session, all pass):
- `npm run typecheck` — pass
- `npm run lint` (src/) and `npx eslint e2e/` — pass, no findings
- `npm test` — 160/160 unit tests pass, unaffected by this change
- `npx playwright test --list` — exactly the 4 expected specs (`smoke`, `arrival-day`, `nightly-list`, `inspection-day`) under both authenticated projects; the 3 pre-existing guard-only specs correctly stay unauthenticated-only

**Manual**: all Phase 1–4 manual items are `PENDING`/unchecked by design (documented in `change.md`'s Notes as blocked on `E2E_TEST_EMAIL`/`E2E_TEST_PASSWORD` and two fixture env vars) — acknowledged as intentionally open, not rubber-stamped. This review's F1 finding means that even once those blockers clear, the specs would still fail for an unrelated reason (locale mismatch) until F1 is fixed.

## Triage Summary

```
═══════════════════════════════════════════════════════════
  TRIAGE COMPLETE
═══════════════════════════════════════════════════════════

  Fixed:     F1 (Fix A), F2 (Fix A), F3   (3)

  ► Verdict after fixes: APPROVED — all findings resolved and
    re-verified (typecheck, lint, unit suite, Playwright discovery).
    The 4 manual items blocked on external secrets/fixtures remain
    intentionally open, unchanged by this triage.
═══════════════════════════════════════════════════════════
```
