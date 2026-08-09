# Code Audit (pre-rewrite, historical)

> **Historical.** This describes the pre-rewrite bed-marketplace codebase, which was deleted in Phase 0 of `docs/should-be/implementation-plan.md`. It is retained for history and does **not** describe the current application. For current state see `docs/should-be/` and the root `README.md`.

This document catalogues issues found across the codebase, grouped by category and severity.

**Severity levels**: `critical` · `high` · `medium` · `low`

---

## 1. Security

### [critical] Hardcoded backend IP in nginx.conf (RESOLVED)
`nginx.conf:11` — the backend address is hardcoded:
```nginx
proxy_pass http://51.20.75.247:8080;
```
If the server is rotated or the IP changes, the deployed container silently stops proxying. The IP is also a public commit-history artifact.

**Resolved**: current `nginx.conf` proxies to `${BACKEND_URL}` via nginx templating, with no literal IP. The secondary point still stands — the old IP remains visible in git history — but the live config no longer hardcodes it.

### [critical] No authentication enforcement (RESOLVED)
There are no Vue Router guards. Every route (`/host-advertisements`, `/advertisement`, `/advertisements-panel-expert`, `/order`) is accessible by unauthenticated users. The login API response is not stored anywhere — there is no session/token and no mechanism to protect any route.

**Resolved**: the current app has a Pinia `auth.store.ts` holding the token and an inline `beforeEach` guard in `src/app/router/index.ts` enforcing `requiresAuth`/role checks.

### [high] Login response discarded
`Login.vue` calls `POST /host/login` but does not handle the response at all. No token is stored (localStorage, cookie, or Vuex). Subsequent API calls carry no `Authorization` header — the backend is effectively unauthenticated from the frontend's perspective.

### [medium] `console.log` of API responses in production paths (RESOLVED)
`AdvertisementsDetailsView.vue:37` and `OrderSummaryView.vue:88` both call `console.log(advertisement)` on the raw API response. This leaks PII (names, addresses, pricing) to the browser console.

**Resolved**: `src/` contains zero `console.log` calls.

---

## 2. Hardcoded Data / Magic Values

### [critical] Hardcoded host UUID — used in three places
The same placeholder UUID is used where the authenticated user's ID should come from session state:

| File | Line | Value |
|------|------|-------|
| `AdvertisementView.vue` | 188 | `e42ff35f-c12a-43d1-a472-eb1a06d9a54e` |
| `HostAdvertisementsView.vue` | 56 | `4fd1ab9b-770b-451c-be23-9b4761f9c92f` |
| `AdvertisementsPanelExpert.vue` | (similar) | same as above |

### [high] Hardcoded district, voivodenship, language in ad creation
`AdvertisementView.vue` lines ~194–213 hard-code values that should come from form inputs:
```typescript
district: "Krzyki",       // TODO comment present
voivodenship: "Mazowieckie",  // TODO comment present
language: "pl",           // TODO comment present
```

### [high] Hardcoded mock guest data
`AdvertisementsDetailsView.vue:38–43` injects two fictional guests into every advertisement API response:
```typescript
guests: [
  { name: 'Dawid', birthYear: 1993, languages: 'pl,en,de' },
  { name: 'Anita', birthYear: 1989, languages: 'pl,en' },
]
```

### [high] Hardcoded host name and photo in OrderSummaryView
`OrderSummaryView.vue:39` renders `<h5 class="text-end">Sara</h5>` and a hardcoded landscape photo (`fot_waw_desktop_01.jpg`) as the host profile image.

### [medium] Hardcoded phone number in Login form
`Login.vue:188` — a default phone number `'7966023832'` is pre-filled in the phone login field.

### [medium] Hardcoded room count = 1
`SingleFullAd.vue:26`:
```html
<li>{{ $t("advertisementDetailsView.rooms", { count: 1 }) }}</li>
```
The API does not return a room count; it's hardcoded instead of being derived or hidden.

### [medium] Hardcoded tenant count = 2
`SingleFullAd.vue:77`:
```html
{{ $t("advertisementDetailsView.currentTenantsCount") }} 2
```
The actual count is not computed from `advertisementData.guests.length`.

### [low] Copyright year hardcoded to 2022
`src/assets/translations/pl.ts:36` — `year: '2022'`. Should be dynamic or kept current.

---

## 3. Missing Implementations (Stub UI exists, logic absent)

### [high] Payment processing not implemented
`OrderSummaryView` shows a "Przejdź do płatności" (Proceed to payment) button that is completely unwired — no click handler, no payment gateway integration.

### [high] Save advertisement not implemented
`AdvertisementView` has a "Zapisz ogłoszenie" (Save advertisement) action with icon and label but no click handler.

### [high] Duplicate advertisement not implemented
Same view — "Zduplikuj ogłoszenie" action exists visually but has no handler.

### [high] Contact form not wired
`ContactView` renders a FormKit form with name/phone/email/message fields but has no submit handler. Submitting the form does nothing.

### [medium] Favourites / heart icon not functional
Heart icons appear in `SingleAd`, `RoomCard`, and `RoomCardJoin` via Font Awesome, but there are no click handlers, no API calls, and no visual feedback.

### [medium] Home page email subscription not wired
`HomeView` renders a "Zapisz się" (Subscribe) input and button that have no event handler.

### [medium] Blog "Load More" not implemented
`BlogsView` shows a "Wczytaj starsze wiadomości" button with no handler — blog data is currently six hardcoded static objects with Lorem Ipsum.

### [medium] Currency switcher not implemented
`Header.vue` `handleCurrencyChange()` only `console.log`s the selected currency. No price conversion is applied anywhere.

### [medium] Password generation not implemented
`Register.vue` shows a "Wygeneruj hasło" (Generate password) button that is not wired to any logic.

### [medium] BecomeHost CTA not wired
`BecomeHostView` has an "Dodaj ogłoszenie" (Add advertisement) button whose navigation target is not set.

### [medium] Host panel Expert button not wired
`HostAdvertisementsView` renders an "Panel EXPERT" button with no click handler and no navigation.

### [low] Edit advertisement in preview not implemented
`SingleAdDetailsPreview` has an "Edytuj ogłoszenie" button that is not wired.

### [low] Facebook / Google login not implemented
`Login.vue` shows "Zaloguj się przez facebook" and "Zaloguj się przez Google" buttons with no handlers.

---

## 4. No Error Handling

### [high] All API calls lack `.catch()` or error state
Every `this.axios` call in every component terminates with `.then(data => { ... })` and no error handler. Network failures, 4xx, and 5xx responses are silently ignored. No loading spinners, no error messages, no retry logic exists anywhere.

Affected files: all views and multiple feature components.

---

## 5. Type Safety

### [high] Extensive use of `any`
- `HostAdvertisementsView`: `activeAdvertisements: any[] = []`
- Multiple `(this.$refs.x as any).getData()` casts in `AdvertisementView`
- Component props typed as `Object` instead of concrete interfaces
- `advertisement` fields accessed with optional chaining on untyped data

### [medium] `@ts-ignore` usage
`OrderSummaryView.vue:82`:
```typescript
// @ts-ignore
this.duration = (new Date(to).getTime() - new Date(from).getTime()) / ...
```
The `to` and `from` are `string | (string | null)[]` from the router query. The `@ts-ignore` masks a real type unsafety.

### [medium] Uninitialized class fields without types
`AdvertisementsDetailsView`: `guestsCount`, `from`, `to` are declared without types or initial values. TypeScript allows this in class components but produces implicit `any`.

---

## 6. Data Inconsistencies

### [high] `roomGender` value mismatch
`SingleFullAd.vue` checks for `"female"` / `"male"` (lowercase), while `OrderSummaryView.vue` checks for `"FEMALE"` / `"MALE"` (uppercase). One of these is wrong — both cannot be correct against the same API response.

### [medium] Guest data structure inconsistency
The ad creation form (`CurrentGuestsSection`) collects `name`, `birthYear`, and `languages`. The `Tenant` detail component expects `name`, `age` (computed year), and `languages` (comma-separated string). The API contract between these two is never validated.

### [medium] Equipment key naming
`AdvertisementView` collects `equipmentData.roomEquipment` and `equipmentData.commonEquipment` from the child form, but the API payload field is `sharedEquipment` (not `commonEquipment`). This likely means shared equipment is never submitted correctly.

### [medium] `goToOrderSummary()` passes query props instead of form state
`SingleFullAd.vue:314–321` — when navigating to the order summary from the inline booking form (no query params case), it still passes `this.fromQuery`, `this.toQuery`, `this.guestsCountQuery` which are all `undefined`, rather than the form values `this.fromForm`, `this.toForm`, `this.guestsCountForm`.

### [low] `noOrderParams` vs `noQueryParams` naming confusion
`SingleFullAd` defines both `noOrderParams` and `noQueryParams` computed properties that do subtly different things and are used inconsistently.

---

## 7. Tests

### [critical] Unit test references a non-existent component (RESOLVED)
`tests/unit/example.spec.ts` imports `@/components/HelloWorld.vue` which does not exist. Running `npm run test:unit` will fail immediately.

**Resolved**: the `tests/` directory is gone. The current codebase has 14 co-located Vitest `*.spec.ts` files under `src/`.

### [critical] E2E test checks for wrong content (RESOLVED)
`tests/e2e/specs/test.js` asserts `cy.contains("h1", "Welcome to Your Vue.js + TypeScript App")` — the boilerplate Vue CLI message. This has nothing to do with the actual application.

**Resolved**: Cypress and the old `tests/e2e/` specs are gone, replaced by Playwright specs under `e2e/` (e.g. `auth.spec.ts`, `checkin.spec.ts`, `exports.spec.ts`, `inspection.spec.ts`).

### [high] Zero meaningful test coverage
No component, view, utility, or API integration has a real test. The two test files that exist are both scaffolding leftovers.

---

## 8. Infrastructure

### [high] nginx proxy does not cover actual API paths (RESOLVED)
The nginx proxy rule forwards `/api` → backend. However, the application calls `/advertisement/*` and `/host/*` directly — not prefixed with `/api`. The proxy rule matches nothing and is therefore dead configuration.

Either:
- The app should prefix all API calls with `/api`, **or**
- The nginx location should match `/advertisement` and `/host`

**Resolved**: the current app calls `/api/v1/*` (via `VITE_API_BASE_URL`), and `nginx.conf`'s `location /api/ { proxy_pass ${BACKEND_URL}; ... }` matches it.

### [medium] No SPA fallback in nginx (RESOLVED)
`nginx.conf` serves `index.html` only for `/`. Direct navigation to `/advertisements/123` or browser refresh on any sub-route will result in a 404. A `try_files $uri $uri/ /index.html;` directive is missing.

**Resolved**: current `nginx.conf` has `try_files $uri $uri/ /index.html;` in its `location /` block.

### [low] Docker image uses `nginx:latest` (RESOLVED)
Pinning to `latest` means the image can silently change on rebuild. A specific version tag should be used.

**Resolved**: the `Dockerfile` now pins `FROM nginx:1.27-alpine`.

---

## 9. Code Quality / Maintainability

### [medium] Ad creation uses fragile `$refs` + `getData()` pattern
`AdvertisementView` accesses child data via `(this.$refs.section as any).getData()`. This is an implicit contract with no TypeScript enforcement. Renaming a ref, removing a section, or changing a `getData()` signature silently breaks the parent.

### [medium] Duplicate responsibility: `AdvertisementsDetailsView` vs `OrderSummaryView`
Both views call `GET /advertisement/details?advertisementId={id}` independently and duplicate price calculation logic. The data should be fetched once and shared.

### [low] `_variables.scss` has duplicated declarations
Several variables are declared twice with different values in the same file (e.g. `$orange-bg`, `$light-black`, `$black-color`). The last declaration wins but the file is confusing.

### [low] `HostSection.vue` in `ad/creation/` appears unused
The i18n file has `hostSection` keys under `advertisementView` (host name, phone, email, languages, communicators), and `HostSection.vue` exists, but it is not imported or used in `AdvertisementView.vue`.

### [low] Mixed `<script>` and `<script setup>` styles
`Content.vue` uses `<script setup lang="ts">` while every other component uses the `@Options` class decorator pattern. This inconsistency should be resolved one way.
