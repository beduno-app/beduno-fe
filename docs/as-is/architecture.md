# Architecture

## High-Level Structure

```
src/
├── App.vue                    Root component: Header + Content (router-view) + Footer
├── main.ts                    App bootstrap, plugin registration, axios setup
├── router/index.ts            All 16 route definitions
├── store/index.ts             Vuex store (currently empty)
├── util.ts                    Language code → display data mapper
├── shims-vue.d.ts             TypeScript shim for .vue imports
├── registerServiceWorker.ts   PWA service worker registration
│
├── views/                     Page-level components, one per route
├── features/                  Domain feature components
│   ├── home/                  Landing page components
│   ├── ad/
│   │   ├── creation/          Ad creation form sections
│   │   ├── details/           Ad detail display sub-components
│   │   └── list/              Ad list/card components
│   └── blog/                  Blog display components
├── auth/                      Login and Register views
├── components/                Shared layout shell (Header, Footer, Content)
└── assets/
    ├── _variables.scss        Design tokens (colors, borders, breakpoints)
    ├── translations/          i18n message files (pl, en, de, uk, ru)
    └── img/                   Static image assets
```

## Component Style

All components use **vue-class-component** with the `@Options` decorator:

```typescript
@Options({
  components: { ... },
  props: { ... },
  computed: { ... },
  methods: { ... },
})
export default class MyComponent extends Vue {
  // reactive data as class fields
  someData = [];
}
```

This is the Vue 2-compatible class API. The codebase does **not** use the Vue 3 Composition API or `<script setup>`.

## Application Shell

`App.vue` is a fixed three-slot layout:

```
App
├── Header        (nav, language/currency switcher, login link)
├── Content       (thin wrapper around <router-view />)
└── Footer        (links, newsletter, copyright)
```

All page content renders inside `Content` via the router.

## HTTP / API Layer

Axios is instantiated in `main.ts` with `baseURL: process.env.VUE_APP_API_BASE_URL` and injected globally via vue-axios. Every component calls the API using `this.axios`:

```typescript
this.axios.get('/advertisement/list').then(resp => resp.data).then(data => { ... });
this.axios.post('/advertisement', payload, { headers: { 'Content-Type': 'application/json' } });
```

There is no service/repository layer — API calls are made directly inside `mounted()` hooks or methods of view components. There is no request interceptor, no global error handling, and no loading state management.

## State Management

Vuex is registered but its store (`src/store/index.ts`) is completely empty. **All state is component-local.** This means:

- No shared auth state (user identity, token)
- No caching of fetched data
- Data is re-fetched on every route visit

## Routing

Vue Router 4 with `createWebHistory`. HomeView is eagerly loaded; all other views use dynamic `import()` for code splitting.

No route guards are implemented — all routes are publicly accessible regardless of authentication state.

## Ad Creation Data Flow

The advertisement creation page (`AdvertisementView`) uses a **ref-based data extraction** pattern:

```
AdvertisementView
├── <base-form> → <main-section ref="main" />
├── <base-form> → <description-section ref="description" />
├── <base-form> → <current-guests-section ref="guests" />
├── <base-form> → <equipment-section ref="equipment" />
├── <base-form> → <payment-section ref="payment" />
└── <base-form> → <rules-section ref="rules" />
```

On publish/preview, `AdvertisementView.updateAdvertisementData()` calls `(this.$refs.section as any).getData()` on each child and merges results into a single `advertisementData` object posted to `/advertisement`.

## Ad Detail Rendering

`AdvertisementsDetailsView` fetches data and passes it to `SingleFullAd`, which composes detail sub-components:

```
SingleFullAd
├── Header          (title)
├── Subheader       (city, district, voivodenship)
├── Gallery         (main + up to 4 photos, base64-decoded)
├── Equipments      (room equipment icons)
├── SharedEquipments (shared area equipment icons)
├── DescriptionWithMap
├── Payments        (accepted payment methods)
├── Rules           (stay rules)
├── Tenant × n      (current tenants: name, age, language flags)
└── Host            (host name, communicator icons)
    + booking form / total price display
```

## i18n

`vue-i18n` is configured with `globalInjection: true`, making `$t()` available in all templates without explicit import. Polish (`pl`) is the default and only programmatically active locale. The Header's language dropdown calls `$i18n.locale = code` to switch.

Translation keys are namespaced by feature: `header.*`, `auth.login.*`, `advertisementView.*`, `advertisementDetailsView.*`, etc. All text content should use `$t()` — though some hardcoded Polish strings remain in templates.

## Styling

SCSS is used throughout. The global design token file is `src/assets/_variables.scss`.

Primary brand colour: `$primary-color: #e66e00` (orange).

Components import variables with `@import "@/assets/_variables.scss"`. There is no global stylesheet applied at App level — styles are either component-scoped or imported per-file.

Bootstrap 5 utility classes are used heavily for layout (`d-flex`, `container-fluid`, `row`, `col-*`).

## Internationalisation of Equipment / Rules

Equipment icons (`Equipments.vue`, `SharedEquipments.vue`), payment methods (`Payments.vue`), and rental rules (`Rules.vue`) all use hardcoded **key → icon mapping** arrays. The API returns an array of string keys (e.g. `["washer", "wifi", "balcony"]`), and the component filters its full icon list to show only matching entries.

## Build & Deployment Pipeline

```
npm run build:prod
    └── vue-cli-service build --prod
            └── webpack → dist/

docker build → nginx image
    ├── COPY dist/ → /usr/share/nginx/html
    └── COPY nginx.conf → /etc/nginx/conf.d/default.conf

nginx
    ├── / → serves dist/index.html (SPA)
    └── /api → proxies to backend (hardcoded IP)
```

The frontend makes API calls to `/advertisement/*` and `/host/*` — not `/api/*`. The nginx `/api` proxy rule therefore does **not** cover any current API calls and appears unused.
