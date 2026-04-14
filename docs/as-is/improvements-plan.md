# Improvements Plan

Issues are grouped into phases by dependency and impact. Items within a phase can be tackled in parallel.

---

## Phase 1 — Critical Blockers (nothing works correctly without these)

### 1.1 Fix the nginx SPA fallback
**File**: `nginx.conf`

Replace the static `index` directive with a try_files fallback so that refreshing or deep-linking any route works:
```nginx
location / {
    root /usr/share/nginx/html;
    try_files $uri $uri/ /index.html;
}
```

### 1.2 Fix the nginx API proxy path
**File**: `nginx.conf`

The app calls `/advertisement/*` and `/host/*`, not `/api/*`. Change the proxy location to match:
```nginx
location ~ ^/(advertisement|host)/ {
    proxy_pass http://BACKEND_HOST:8080;
}
```
And externalise the backend address via an environment variable rather than a hardcoded IP.

### 1.3 Fix the broken unit test
**File**: `tests/unit/example.spec.ts`

Delete or replace — it imports a non-existent `HelloWorld.vue` and will fail on every CI run.

### 1.4 Remove `console.log` of API responses
**Files**: `AdvertisementsDetailsView.vue:37`, `OrderSummaryView.vue:88`

Delete both `console.log(advertisement)` calls before any production deployment.

---

## Phase 2 — Authentication (pre-requisite for most user flows)

### 2.1 Store auth token after login
**File**: `src/auth/Login.vue`

The `/host/login` response must return a token (JWT or session). Store it in `localStorage` or a Vuex module, then attach it to every subsequent axios request via a request interceptor in `main.ts`:
```typescript
axiosInstance.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});
```

### 2.2 Add route guards
**File**: `src/router/index.ts`

Add a `beforeEach` guard that redirects unauthenticated users away from protected routes (`/advertisement`, `/host-advertisements`, `/advertisements-panel-expert`, `/order`).

### 2.3 Replace hardcoded host UUIDs with session identity
**Files**: `AdvertisementView.vue`, `HostAdvertisementsView.vue`, `AdvertisementsPanelExpert.vue`

After auth is implemented, read the current user's ID from the auth store instead of the placeholder UUIDs.

### 2.4 Redirect after login / register
Both `Login.vue` and `Register.vue` have no post-submit navigation. Add `this.$router.push('/')` (or the intended destination) on success.

---

## Phase 3 — State Management

### 3.1 Introduce an auth Vuex module (or migrate to Pinia)
The current Vuex store is empty. At minimum, add an auth module:
```
store/
├── index.ts
└── modules/
    └── auth.ts   { token, userId, isAuthenticated }
```
Pinia is the recommended state manager for new Vue 3 projects and is simpler than Vuex. If starting fresh, prefer Pinia.

### 3.2 Cache advertisement data
`AdvertisementsDetailsView` and `OrderSummaryView` both independently fetch the same advertisement. Add an advertisements module to store fetched ads by ID so the second view can read from cache rather than re-fetching.

---

## Phase 4 — Data Correctness

### 4.1 Fix `roomGender` case inconsistency
**Files**: `SingleFullAd.vue`, `OrderSummaryView.vue`

Decide on one canonical casing (`FEMALE`/`MALE` or `female`/`male`) and update all comparison sites. Align with the actual API contract.

### 4.2 Fix equipment key mismatch in ad creation
**File**: `AdvertisementView.vue`

`equipmentData.commonEquipment` → `sharedEquipment` in the API payload (field is already named correctly in the payload object but the source key is wrong).

### 4.3 Fix `goToOrderSummary` using wrong variables
**File**: `src/features/ad/list/SingleFullAd.vue:314–321`

When booking from the inline form (no query params), the navigation should pass `this.fromForm`, `this.toForm`, `this.guestsCountForm` instead of the undefined query props.

### 4.4 Fix hardcoded district and voivodenship in ad creation
**File**: `AdvertisementView.vue:194–195`

These values should come from the form. Add select fields for district and voivodenship to `MainSection`, surface them via `getData()`, and map them in the parent.

### 4.5 Remove mock guest injection
**File**: `AdvertisementsDetailsView.vue:38–43`

Once the backend returns real reservation/guest data, remove the hardcoded mock. In the interim, conditionally render the guest section only when guest data is present.

### 4.6 Fix hardcoded tenant count
**File**: `src/features/ad/list/SingleFullAd.vue:77`

Replace the hardcoded `2` with `advertisementData.guests?.length ?? 0`.

---

## Phase 5 — Error Handling

### 5.1 Add global axios error interceptor
**File**: `src/main.ts`

Add a response interceptor that handles 401 (redirect to login), 403, 404, and 5xx responses uniformly:
```typescript
axiosInstance.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) router.push('/login');
        // surface error to user
        return Promise.reject(error);
    }
);
```

### 5.2 Add loading and error states to data-fetching views
All views that call APIs in `mounted()` should track:
- `isLoading: boolean` — show a spinner while fetching
- `error: string | null` — show an error message on failure

Priority order: `AdvertisementsView`, `AdvertisementsDetailsView`, `HomeView`, `HostAdvertisementsView`.

---

## Phase 6 — Wire Up Incomplete Features

### 6.1 Contact form submission
**File**: `src/views/ContactView.vue`

Add a submit handler that POSTs to an appropriate backend endpoint (e.g. `POST /contact`) and shows a success/failure message.

### 6.2 Save and Duplicate advertisement
**File**: `src/views/AdvertisementView.vue`

Wire the "Zapisz ogłoszenie" button to a `PUT /advertisement/{id}` call. Wire "Zduplikuj" to prefill the form from existing data and POST a new advertisement.

### 6.3 Proceed to payment
**File**: `src/views/OrderSummaryView.vue`

Integrate a payment provider (e.g. Stripe, Przelewy24) or navigate to a payment page. The button currently has no click handler.

### 6.4 BecomeHost CTA navigation
**File**: `src/views/BecomeHostView.vue`

Add `@click="$router.push('/advertisement')"` to the "Dodaj ogłoszenie" button.

### 6.5 Host panel Expert button navigation
**File**: `src/views/HostAdvertisementsView.vue`

Add `@click="$router.push('/advertisements-panel-expert')"` to the "Panel EXPERT" button.

### 6.6 Load blog posts from API
**File**: `src/views/BlogsView.vue`

Replace the six hardcoded blog objects with an API call to a blog/posts endpoint. Implement "Load More" with pagination.

### 6.7 Implement favourites
Add a Vuex/Pinia module for a favourites list. Wire the heart icon in `SingleAd` and `RoomCard` to toggle and persist favourites (localStorage initially; API-backed once auth is in place).

---

## Phase 7 — Infrastructure & Quality

### 7.1 Externalise backend address from nginx.conf
Replace the hardcoded IP with an environment variable passed at container start time using an `envsubst`-based entrypoint script or nginx template.

### 7.2 Pin Docker base image version
**File**: `Dockerfile`

Change `FROM nginx:latest` to `FROM nginx:1.27-alpine` (or current stable) to ensure reproducible builds.

### 7.3 Write meaningful tests
Starting points:

**Unit tests** (Jest):
- `src/util.ts` — `mapLanguageCodeToLanguageData` is pure and trivially testable
- `SearchInput.vue` — test query param construction
- `SingleFullAd.vue` — test `totalPrice` and `roomGender` computed properties

**E2E tests** (Cypress):
- Happy path: search → list → details → order summary
- Ad creation form submission

### 7.4 Add TypeScript interfaces for API objects
**New file**: `src/types/api.ts`

Define `Advertisement`, `Guest`, `Host` interfaces. Replace all `any` and `Object` prop/state types with these interfaces. Remove the `@ts-ignore` in `OrderSummaryView`.

### 7.5 Deduplicate `_variables.scss`
**File**: `src/assets/_variables.scss`

The file contains duplicate variable declarations (some defined twice with conflicting values). Remove the first block of duplicates, keeping the second (more complete) set.

### 7.6 Delete or migrate `HostSection.vue`
**File**: `src/features/ad/creation/HostSection.vue`

The component is never imported. Either integrate it into `AdvertisementView` (the i18n keys for it exist) or delete it.

### 7.7 Standardise component style
Choose one pattern and apply it consistently: either `vue-class-component` + `@Options` (current) or `<script setup>`. `Content.vue` already uses `<script setup>` — this is the recommended Vue 3 approach. A gradual migration from class-based to `<script setup>` would improve maintainability and align with the Vue 3 ecosystem.

---

## Summary Table

| Phase | Impact | Effort |
|-------|--------|--------|
| 1 — Critical blockers | Prevents production use | Low |
| 2 — Authentication | Enables all user-specific flows | Medium |
| 3 — State management | Enables data sharing and caching | Medium |
| 4 — Data correctness | Fixes silent data bugs | Low–Medium |
| 5 — Error handling | Production readiness | Medium |
| 6 — Incomplete features | Feature completeness | High |
| 7 — Infrastructure & quality | Long-term maintainability | Medium |
