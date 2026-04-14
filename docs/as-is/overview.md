# Project Overview

## What is BedOK?

BedOK (`bed!OK`) is a Polish bed-rental marketplace platform connecting guests who need accommodation with hosts offering individual beds in shared rooms. Unlike traditional room-rental platforms, BedOK's core unit is the **bed**, not the room — targeting budget accommodation seekers (students, workers, short-stay guests) and hosts looking to maximise rental income per square metre.

The tagline is *"i masz spanie!"* ("and you've got a place to sleep!").

## This Repository

`bedok-fe` is the Vue 3 single-page application serving as the customer-facing frontend. It communicates with a separate backend API (not in this repo) over HTTP.

## Target Users

| Role | Description |
|------|-------------|
| **Guest** | Searches for available beds, views listings, books accommodation |
| **Host** | Creates and manages bed listings, monitors current tenants |
| **Expert** | Power user / admin view with a tabular overview of host listings and tenant management |

## Tech Stack

| Concern | Choice |
|---------|--------|
| Framework | Vue 3 |
| Language | TypeScript |
| Component style | `vue-class-component` with `@Options` decorator (class-based, not Composition API) |
| Build tooling | Vue CLI 5 (webpack) |
| Routing | Vue Router 4 |
| State management | Vuex 4 (currently unused — all state is component-local) |
| UI framework | Bootstrap 5 + bootstrap-vue-3 |
| Form library | FormKit (genesis theme) |
| HTTP client | Axios, injected globally via vue-axios as `this.axios` |
| i18n | vue-i18n 9; default locale `pl` (Polish); also en, de, uk, ru |
| Icons | Font Awesome 6 (SVG core) + vue-fontawesome; also Material Design icons |
| Image uploads | vue-media-upload (`<upload-media>`, `<update-media>` global components) |
| Carousels | vue3-carousel + vueperslides |
| CSS | SCSS; design tokens in `src/assets/_variables.scss` |
| Linting | ESLint + Prettier |
| Unit tests | Jest (`@vue/cli-plugin-unit-jest`) |
| E2E tests | Cypress 9 |
| Containerisation | Docker (nginx) |

## Supported Languages (UI)

Polish (default), English, German, Ukrainian, Russian — selectable from the Header dropdown. Translation files live in `src/assets/translations/`.

## Deployment

The app is built to a static `dist/` folder and served by nginx inside a Docker container. nginx also proxies `/api` requests to the backend.

- **Frontend**: `nginx` serving `dist/` on port 80
- **Backend proxy**: `/api` → `http://51.20.75.247:8080` (hardcoded IP — see audit)
- **API base URL** (dev/build): configured via `VUE_APP_API_BASE_URL` env variable

## Application Routes

| Path | View | Description |
|------|------|-------------|
| `/` | HomeView | Landing page: search, featured listings, city tiles |
| `/advertisements` | AdvertisementsView | Search results list |
| `/advertisements/:id` | AdvertisementsDetailsView | Single ad detail + booking |
| `/advertisement` | AdvertisementView | Create new advertisement (multi-section form) |
| `/host-advertisements` | HostAdvertisementsView | Host dashboard (active/inactive ads) |
| `/advertisements-panel-expert` | AdvertisementsPanelExpert | Expert/admin panel (tabular view) |
| `/order` | OrderSummaryView | Booking order summary |
| `/login` | Login | Authentication |
| `/register` | Register | New host registration |
| `/become-host` | BecomeHostView | Onboarding landing page |
| `/blogs` | BlogsView | Blog & news feed |
| `/about-us` | AboutUsView | Static about page |
| `/career` | CareerView | Static careers page |
| `/contact` | ContactView | Contact form |
| `/help` | HelpView | FAQ |
| `/media` | MediaView | Press/media page |
