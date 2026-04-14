# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run serve          # Dev server on port 8081
npm run build          # Production build
npm run build:prod     # Production build with --prod flag
npm run test:unit      # Run unit tests (Jest)
npm run test:e2e       # Run e2e tests (Cypress)
npm run lint           # Lint and fix files
npm run docker:build   # Build Docker image
```

To run a single Jest test file:
```bash
npx vue-cli-service test:unit --testPathPattern="path/to/test.spec.ts"
```

## Environment

The API base URL is configured via `VUE_APP_API_BASE_URL` environment variable. Axios is instantiated with this base URL in `src/main.ts` and injected globally as `this.axios`.

## Architecture

**Vue 3** app using **vue-class-component** with the `@Options` decorator pattern (not the Composition API). Components are written as TypeScript classes extending `Vue`.

### Directory structure

- `src/views/` — Page-level components, each mapped to a route
- `src/features/` — Feature components organized by domain:
  - `ad/creation/` — Form sections for creating an advertisement (MainSection, DescriptionSection, EquipmentSection, etc.)
  - `ad/details/` — Display sections for ad detail view
  - `ad/list/` — Ad listing components (SingleAd, SingleAdExpert, SingleHostAd, etc.)
  - `blog/` — Blog listing components
  - `home/` — Homepage components (carousel, city tiles, search)
- `src/components/` — Shared layout: `Header`, `Footer`, `Content` (which wraps `<router-view>`)
- `src/auth/` — Login and Register views
- `src/router/index.ts` — All route definitions
- `src/store/index.ts` — Vuex store (currently minimal/empty)
- `src/assets/translations/` — i18n files for pl (default), en, de, uk, ru
- `src/assets/_variables.scss` — SCSS design tokens (colors, breakpoints)

### Key libraries

- **Bootstrap 5** + **bootstrap-vue-3** for UI components and grid
- **FormKit** (genesis theme) for form inputs
- **vue-i18n** — default locale is Polish (`pl`), use `$t('key')` in templates
- **Font Awesome** — icons registered individually in `src/main.ts`; use `<font-awesome-icon>` component
- **vue-media-upload** — `<upload-media>` and `<update-media>` global components for image uploads
- **Vuex** — state management (store is mostly empty; local component state is used instead)

### Ad creation flow

`AdvertisementView` composes multiple form section components via `$refs`. Each section exposes a `getData()` method that the view calls to collect form data before preview or publish. On publish, data is POSTed to `/advertisement`, then photos are PUT to `/advertisement/photos`.

### Styling

SCSS is used throughout. Import `@/assets/_variables.scss` to access shared design tokens. The primary brand color is `$primary-color: #e66e00` (orange).
