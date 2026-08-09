# API Reference (pre-rewrite, historical)

> **Historical.** This describes the pre-rewrite bed-marketplace codebase, which was deleted in Phase 0 of `docs/should-be/implementation-plan.md`. It is retained for history and does **not** describe the current application. For current state see `docs/should-be/` and the root `README.md`.

All requests go through the axios instance configured with `baseURL: process.env.VUE_APP_API_BASE_URL`. The frontend calls `this.axios` directly in components.

## Endpoints Used

### Advertisements

#### `GET /advertisement/list`
Fetches featured advertisements for the home page carousel.

- **Called by**: `HomeView.mounted()`
- **Response**: Array of advertisement objects

#### `POST /advertisement/criteria`
Searches advertisements by filter criteria.

- **Called by**: `AdvertisementsView.mounted()`
- **Request body**:
  ```json
  {
    "location": "string (optional)",
    "from": "date string (optional)",
    "to": "date string (optional)",
    "guestsCount": "number (optional)"
  }
  ```
- **Response**: `{ content: Advertisement[] }`

#### `GET /advertisement/details?advertisementId={id}`
Fetches full details for a single advertisement.

- **Called by**: `AdvertisementsDetailsView.mounted()`, `OrderSummaryView.mounted()`
- **Response**: Advertisement detail object (see shape below)

#### `GET /advertisement/host?hostId={uuid}`
Fetches all advertisements belonging to a host.

- **Called by**: `HostAdvertisementsView.mounted()`, `AdvertisementsPanelExpert.mounted()`
- **Response**: `Advertisement[]`
- **Note**: hostId is currently hardcoded in the component (`4fd1ab9b-770b-451c-be23-9b4761f9c92f`)

#### `POST /advertisement`
Creates a new advertisement.

- **Called by**: `AdvertisementView.publishAdvertisement()`
- **Request body**:
  ```json
  {
    "hostId": "uuid",
    "title": "string",
    "district": "string",
    "city": "string",
    "voivodenship": "string",
    "postCode": "string",
    "streetName": "string",
    "roomPhotos": "File[]",
    "roomDescription": "string",
    "roomArea": "number",
    "roomGender": "string",
    "numBeds": "number",
    "usedBeds": "number",
    "price": "number",
    "firstStageDiscount": "number",
    "secondStageDiscount": "number",
    "thirdStageDiscount": "number",
    "fourthStageDiscount": "number",
    "discountMonth": "number",
    "paymentType": "string[]",
    "sharedBeds": "boolean",
    "language": "string",
    "roomEquipment": "string[]",
    "sharedEquipment": "string[]",
    "rentalRules": "string[]",
    "guests": "Guest[]"
  }
  ```
- **Response**: Advertisement ID (string/UUID)

#### `PUT /advertisement/photos`
Uploads photos for a newly created advertisement.

- **Called by**: `AdvertisementView.publishAdvertisement()` (after POST /advertisement)
- **Request body**: `multipart/form-data`
  - `advertisementId`: string
  - `photos`: File[] (multiple)

---

### Hosts / Auth

#### `POST /host/login`
Authenticates a host.

- **Called by**: `Login.vue`
- **Request body** (email login):
  ```json
  { "email": "string", "password": "string" }
  ```
- **Request body** (phone login):
  ```json
  { "phoneNumber": "string", "password": "string" }
  ```
- **Response**: Not handled in current code (no token storage, no redirect on success)

#### `POST /host/register`
Registers a new host.

- **Called by**: `Register.vue`
- **Request body**:
  ```json
  {
    "name": "string",
    "phoneNumber": "string",
    "email": "string",
    "password": "string",
    "birthYear": "number",
    "gender": "FEMALE | MALE",
    "languages": ["pl", "en", ...],
    "viber": false,
    "signal": false,
    "whatsapp": false,
    "telegram": false
  }
  ```
- **Response**: Not handled (no redirect or confirmation after registration)

---

## Advertisement Object Shape

Inferred from component usage:

```typescript
interface Advertisement {
  id: string;
  title: string;
  city: string;
  district: string;
  voivodenship: string;
  postCode: string;
  streetName: string;
  roomArea: number;
  numBeds: number;
  usedBeds: number;
  price: number;           // price per bed per day
  roomGender: 'FEMALE' | 'MALE' | string;
  roomDescription: string;
  roomPhotos: { data: string }[];  // base64-encoded image data
  roomEquipment: string[];         // equipment key list
  sharedEquipment: string[];
  paymentType: string[];
  rentalRules: string[];
  sharedBeds: boolean;
  isActive: boolean;
  host?: {
    name: string;
    // photo not returned by API (hardcoded in Host.vue)
  };
  guests?: Guest[];        // not returned by API — currently mock-injected in frontend
}

interface Guest {
  name: string;
  birthYear: number;
  languages: string;  // comma-separated: "pl,en,de"
}
```

---

## Known API Integration Issues

1. **No auth token** — Login response is not stored; no Authorization header is attached to subsequent requests.
2. **No error handling** — All `.then()` chains have no `.catch()`. Network errors or 4xx/5xx responses are silently swallowed.
3. **Guests not returned by API** — `AdvertisementsDetailsView` manually injects hardcoded mock guests after the API call.
4. **hostId hardcoded** — `HostAdvertisementsView` and `AdvertisementsPanelExpert` use a hardcoded UUID instead of the authenticated user's ID.
5. **nginx proxy mismatch** — nginx proxies `/api` → backend, but the app calls `/advertisement/*` and `/host/*` directly. The proxy rule is currently non-functional.
6. **roomCount not in API** — `SingleFullAd` hardcodes room count as `1`.
7. **Communicators not in API** — `Host.vue` always shows all communicator icons regardless of what the host registered.
