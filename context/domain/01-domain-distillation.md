---
title: Domain Distillation — Beduno
created: 2026-09-14
type: domain-distillation
---

# Dystylacja domeny — Beduno

## Krok 0 — Kontekst projektu

Beduno to **system operacyjny dla agencji pracy tymczasowej** — źródło prawdy o tym, "kto śpi gdzie dziś w nocy" w zakwaterowaniu pracowniczym (`docs/should-be/overview.md:5`; `docs/idea.md:42`). To nie jest marketplace ani serwis rezerwacyjny.

Dokumenty źródłowe użyte w tej dystylacji:
- `docs/idea.md` (1115 linii) — transkrypt discovery, locked decisions i ich uzasadnienie.
- `docs/should-be/{overview,architecture,data-model,roles-and-permissions,screens}.md` — docelowa specyfikacja ("should-be").
- `context/foundation/prd.md` (635 linii) — PRD z success criteria i guardrails.
- `CLAUDE.md` (root repo) — Hard rules, w tym adnotacja "Superseded 2026-09-14" przy regule bed-level occupancy, potwierdzająca że `docs/should-be/` bywa przestarzałe względem aktualnego kontraktu `beduno-be`.
- Kod: `src/modules/{auth,admin,exports,inspection,audit,stays,properties,workers,ops,inhouse,arrivals}/` — każdy moduł ma `types/`, `api/`, `store/`, `composables/`, `components/`, `views/`.

`docs/should-be/api-specification.md` (1333 linii) i `docs/should-be/implementation-plan.md` (321 linii) nie zostały przeczytane w całości — dociągnięte tylko fragmenty cytowane przez `roles-and-permissions.md`. Traktuj to jako ograniczenie tej dystylacji, nie jako "brak" w domenie.

Stack: Vue 3 SPA (Composition API, TS strict), Pinia, IndexedDB offline layer (`src/shared/services/db.ts`, `DB_VERSION=3`). Logika domenowa żyje w warstwie `types/` (kontrakty), `api/` (integracja z backendem `beduno-be`), `store/` (stan + reguły offline) — właściwa egzekucja twardych ograniczeń (capacity, gender rules) leży po stronie backendu; frontend w dużej mierze **odczytuje** wynik walidacji (kod 422), nie **liczy** go lokalnie.

---

## Krok 1 — Ubiquitous Language

| Pojęcie | Definicja | Źródło (dokument) | W kodzie |
|---|---|---|---|
| **Worker** | Pracownik tymczasowy — jednostka do zakwaterowania | `docs/idea.md:36` "Worker identity + documents + skills" | `src/modules/workers/types/worker.types.ts:7-22` (`internalId`, `gender`, `status: WorkerStatus`) |
| **Property** | Lokalizacja zakwaterowania (internal/partner) | `docs/should-be/overview.md:5` | `src/modules/properties/types/property.types.ts:9-18` — BRAK pól `type: 'INTERNAL'\|'PARTNER'` i property-level `genderRule` opisanych w `data-model.md:34-40` |
| **Room** | Pokój w Property, ma pojemność | `docs/idea.md:588` (`Room{propertyId, label/number, capacity, genderRule?}`) | `property.types.ts:51-65` — pole to `bedCount`/`availableBedCount`, nie `capacity`/`availableSpots` z `data-model.md:60-63` |
| **Bed** | Łóżko w ramach Room | BRAK w `overview.md:7` ("no separate bed entity") i `prd.md:508-510` ("no bed entity") | `property.types.ts:82-98` (`Bed{id,roomId,label,status}`); `Stay.bedId`/`bedAutoAssigned` (`stay.types.ts:16-17`) — patrz Krok 4 |
| **Stay** | Datowane przypisanie Worker → Property/Room(/Bed) | `docs/idea.md:242,588` | `src/modules/stays/types/stay.types.ts:11-26` — **flat** (ID, nie zagnieżdżone obiekty) |
| **StayStatus** | Cykl życia Stay | `docs/should-be/data-model.md:110-118` (6 statusów + `MOVED`) | `stay.types.ts:1-7` — 6 statusów, **bez `MOVED`** (zgodnie z CLAUDE.md: "a move checks the stay out... and creates a new stay") |
| **Propose → Confirm** | Agency *proponuje* pobyt, Property *potwierdza* rzeczywistość; propozycja nigdy nie nadpisuje potwierdzonego faktu | `docs/idea.md:367-379`; `overview.md:22-30`; `prd.md:417-422` ("a stated intent can never overwrite a confirmed fact") | Częściowo zerwane w routingu — patrz Krok 4 |
| **Check-in / Check-out** | Operacyjne potwierdzenie przybycia/wyjazdu | `docs/idea.md:353-357` | `src/modules/arrivals/api/arrivals.api.ts` (`checkIn`); `src/modules/inhouse/api/inhouse.api.ts` (`checkOut`) |
| **No-show** | Worker nie przybył mimo planu | `docs/idea.md:761-762` | `NoShowPayload{noShowReason}` (`stay.types.ts:59-61`) |
| **Move** | Zmiana pokoju/property dla istniejącego Stay | `docs/should-be/roles-and-permissions.md:160-189` (dwa warianty: room move, move-to-property) | `MovePayload{targetRoomId,targetBedId,overrideReason}` (`stay.types.ts:63-67`) — brak osobnego typu "move to property"; audit ma akcję `'MOVED'` |
| **Conflict Inbox / "Needs review"** | Kolejka spornych akcji offline — nigdy nie auto-merge | `docs/idea.md:628-631,776-781` ("keep action as Needs review... do not silently override") | `src/modules/ops/store/sync.store.ts:18-27,79-86` (`SyncConflict[]` w Pinia `ref`) + `ConflictInbox.vue`; **BRAK persystencji w IndexedDB** — żyje tylko w pamięci |
| **Offline Action Queue** | Kolejka akcji CHECK_IN/CHECK_OUT/MOVE/NO_SHOW zebranych offline | `docs/should-be/data-model.md:281,300-303` | `src/shared/services/db.ts:49` (`actionQueue` store), `DB_VERSION=3` (linia 7) |
| **Arrival Day / "Expected Today"** | Must-not-fail moment #1: dzień przyjazdu | `docs/idea.md:994-1012`; `overview.md:36-40` | `src/modules/arrivals/views/ArrivalsToday.vue`; `StayStatus.EXPECTED_TODAY` |
| **Nightly List / In-house** | Must-not-fail moment #2: kto śpi dziś w nocy | `docs/idea.md:1015-1024` | `src/modules/inhouse/` |
| **Inspection Mode** | Must-not-fail moment #3: roster pokój-po-pokoju vs rzeczywistość | `docs/idea.md:1027-1037` | `src/modules/inspection/types/inspection.types.ts` (`InspectionRoomEntry`, `RoomActualOccupancy`, `WorkerDiscrepancy`) |
| **Discrepancy** | Rozbieżność expected vs present podczas inspekcji | `docs/should-be/overview.md:47-49` | `inspection.types.ts:23-30` (`WorkerDiscrepancy{workerId,discrepancyType}`) |
| **AuditEvent** | Niezmienna ewidencja zmian, actor + before/after + timestamp | `docs/idea.md:589,743` ("Audit log (immutable)"); CLAUDE.md Hard rule "Everything is audited" | `src/modules/audit/types/audit.types.ts:12-21` — kształt danych rozjeżdża się z dokumentem, patrz Krok 4 |
| **Override / overrideReason** | Świadome ominięcie soft-constraint z obowiązkowym powodem, generuje audit event | `docs/idea.md:874-884` | `stay.types.ts:21,35,44,66,76,86` (`overrideReason` w kilku payloadach) |
| **Constraint (Hard/Soft)** | Reguła dopuszczalności przypisania Stay | `docs/should-be/data-model.md:201-241`; `prd.md:417-422` | `stay.types.ts:124-142` (`HardConstraintType`, `SoftConstraintType`, `ConstraintViolationResponse`) — **egzekwowane tylko po stronie backendu**; frontend odczytuje 422 (`CreateStay.vue:96,120-121`, `useConflicts.ts`) |
| **QR Code** | Identyfikacja Worker bez PII | `docs/should-be/data-model.md:247-257`; CLAUDE.md "QR codes carry zero PII" | `src/shared/utils/qrCode.ts:1-33` — **dokładnie zgodne**, format `beduno:{workerId}:{checksum}` |
| **UserRole** | Role dostępu | `docs/idea.md:449-457,918-925` (wspomina też "Shift Lead" jako odrębną rolę) | `src/modules/auth/types/auth.types.ts:1-5` — tylko 4 role (`AGENCY_ADMIN\|AGENCY_PLANNER\|PROPERTY_ADMIN\|FRONT_DESK`); "Shift Lead" nie istnieje jako odrębny byt |
| **WorkerStatus** | Stan pracownika | `docs/should-be/data-model.md:17` (zawiera `BLACKLISTED`) | `worker.types.ts:1` — `ACTIVE\|INACTIVE\|DELETED`, **bez** `BLACKLISTED` (potwierdzone w CLAUDE.md) |
| **Truth Owner / Reality vs Plan** | Property-side role'e są właścicielem rzeczywistości; agency-side są właścicielem planu | `docs/should-be/roles-and-permissions.md:61-70`; CLAUDE.md Hard rule #1 | Centralny niezmiennik biznesowy — patrz Krok 3 i 4 |

---

## Krok 2 — Klasyfikacja subdomen: Core / Supporting / Generic

| Obszar | Klasyfikacja | Uzasadnienie (odwołanie do celów produktu) |
|---|---|---|
| Stay lifecycle + Propose→Confirm + constraint engine | **Core** | `prd.md:150-160` guardrails: "worker with nowhere to sleep", "nightly count is wrong" — to jedyna obietnica produktu (`overview.md:5`; `idea.md:42`: "single source of truth: bed occupancy + worker location") |
| Room/Bed capacity + gender rules | **Core** | `idea.md:70`: "Feasibility (High): You can build bed occupancy + assignment + audit trail" — rdzeń przewagi nad Excel/WhatsApp |
| Audit trail | **Core** | `idea.md:591`: "if you don't store actions as events/audit, partner disputes will kill trust"; guardrail `prd.md`: "Nobody can explain what happened" |
| Arrivals / In-house / Inspection (3 must-not-fail moments) | **Core** | `idea.md:341-357`; `overview.md:32-50` — explicite nazwane jako to, co MVP musi robić bezbłędnie |
| Offline sync + Conflict Inbox | **Supporting** | Wspiera Core (bez tego Core zawodzi w terenie, `idea.md:621-636`), ale nie jest samą propozycją wartości |
| Worker directory (CRUD, import, tagi) | **Supporting** | `idea.md:242` — wymagana encja, ale to dane wejściowe do Core, nie mechanizm różnicujący |
| QR check-in | **Supporting** | `idea.md:609-618` — przyspiesza Core (check-in); `prd.md:141` degraduje "check-in <10s" do Secondary |
| Auth/RBAC/session | **Generic** (z domenowym twistem) | Standardowy mechanizm, ale poprawność propose/confirm authority jest traktowana jako logika domenowa (`prd.md:441-442`), więc RBAC jest Generic-mechanika/Core-semantyka |
| Exports (CSV/PDF) | **Generic/Supporting** | `idea.md:125`: "nightly occupancy list + client/site list" dostarcza wartość biznesową, ale mechanika generowania plików jest generyczna |
| i18n (5 języków) | **Generic** | `idea.md:463-481` — wymóg operacyjny, nie różnicujący produkt |
| Job-site/shift linkage, transport, marketplace | **Poza zakresem MVP** | Explicite non-goals (`idea.md:127-132`; `overview.md:64-70`, Phase 2-5), choć `prd.md:512-517` sygnalizuje job-site linkage jako "IN SCOPE" mimo braku FR — otwarta niespójność w samym PRD |

**Rdzeń domeny w jednym zdaniu**: Beduno jest rdzeniowo warte budowania tam, gdzie egzekwuje niezmienniki obłożenia (kto/gdzie/kiedy) i rozstrzyga konflikt między planem a rzeczywistością z pełnym śladem audytowym — wszystko inne (i18n, eksporty, QR, auth) jest w służbie tego rdzenia.

---

## Krok 3 — Kandydaci na agregaty i ich niezmienniki

### Stay (agregat #1 — kandydat główny)
- **Niezmiennik**: "a stated intent can never overwrite a confirmed fact" (`prd.md:422`) — rola agency nie może nadpisać stanu `CHECKED_IN` będącego potwierdzoną rzeczywistością.
- **Status w kodzie**: zadeklarowany, **częściowo nieegzekwowany**. Router dopuszcza `PROPERTY_ADMIN` na `StayCreate` (`src/app/router/index.ts:130-133`) — `roles-and-permissions.md:87-98` sam to nazywa "not currently enforced by the router". Backend enforcement istnieje jako kontrakt typów (`ConstraintViolationResponse`), ale frontend go tylko odczytuje po fakcie.

### Room/Bed capacity (kandydat #2)
- **Niezmiennik**: "No double-booking without a visible warning" (`idea.md:145`); "Room at capacity → Block" (`data-model.md:207`).
- **Status w kodzie**: **egzekwowany po stronie backendu (kontraktowo), nie po stronie frontendu**. `stay.types.ts:124-142` deklaruje `HardConstraintType`, ale frontend nie liczy pojemności lokalnie przed submitem — polega w 100% na odpowiedzi 422 serwera (`CreateStay.vue:96-121`).

### ConflictInbox / offline sync (kandydat #3)
- **Niezmiennik**: "never silently auto-merge" (`idea.md:632-636,776-781,931`).
- **Status w kodzie**: **egzekwowany logicznie** (`sync.store.ts:79-86` dopisuje do `conflicts`, nie nadpisuje), ale **nietrwały**. `db.ts` (`DB_VERSION=3`, linie 15-49) nie ma store'u na konflikty — żyją tylko w pamięci Pinia. To realne ryzyko utraty informacji o konflikcie przy odświeżeniu karty/awarii — dokładnie problem oznaczony wcześniej jako F1 CRITICAL w przeglądzie planu `refactor-opportunities`.

### AuditEvent (kandydat #4)
- **Niezmiennik**: "Every change is attributable" (`idea.md:146`); "immutable audit log" (`idea.md:743`).
- **Status w kodzie**: zadeklarowany typowo; immutability jest własnością backendu, niezweryfikowalną z frontendu. Kształt danych (`audit.types.ts:12-21`: `previousState`/`newState` jako całe obiekty) **rozjeżdża się** z dokumentem, który obiecuje `diff: field-level changes, not whole-object snapshots` (`data-model.md:130`) — patrz Krok 4.

### Worker (kandydat słabszy — Supporting, nie Core)
- **Niezmiennik**: `internalId` jako unikalny business key (`idea.md:339-340,573`).
- **Status w kodzie**: brak widocznej walidacji unikalności w typach frontendowych (`worker.types.ts`); polega na backendzie — `ImportError` (linie 57-61) pokazuje, że duplikaty są wykrywane dopiero przy imporcie, nie proaktywnie.

---

## Krok 4 — Rozjazdy MODEL vs KOD

| Dokument mówi | Kod robi | Komentarz |
|---|---|---|
| `prd.md:508-510` + `overview.md:7`: "No bed-level modelling... there is no bed entity" | `property.types.ts:82-98` ma pełny byt `Bed`; `Stay.bedId`/`bedAutoAssigned` (`stay.types.ts:16-17`) | **Największy rozjazd w repo.** CLAUDE.md sam to adnotuje jako "Superseded 2026-09-14" — `prd.md` jest tu przestarzały względem aktualnego kontraktu `beduno-be`, nie kod |
| `data-model.md:110-117`: `StayStatus` zawiera `MOVED` | `stay.types.ts:1-7`: brak `MOVED` | Zamierzone (CLAUDE.md: move = checkout + nowy stay) — tu przestarzały jest dokument, nie kod |
| `data-model.md:17` i `stay.types.ts:125` (`WORKER_BLACKLISTED` jako `SoftConstraintType`) | `worker.types.ts:1`: brak `BLACKLISTED` w `WorkerStatus` | Typ constraint `WORKER_BLACKLISTED` istnieje mimo braku statusu, który miałby go wyzwalać — martwy/niespójny typ w kodzie |
| `data-model.md:95-99`: `Stay.worker`/`property`/`room` jako zagnieżdżone obiekty | `stay.types.ts:11-26`: flat, same ID | Świadoma decyzja architektoniczna (skomentowana wprost w pliku), `data-model.md` nie zaktualizowany |
| `roles-and-permissions.md:87-98` (własny known-gap callout): `StayCreate` powinien wykluczać `PROPERTY_ADMIN` | `router/index.ts:130-133`: `StayCreate` dopuszcza `PROPERTY_ADMIN` | Rzadki przypadek udokumentowanego długu — dokument sam siebie flaguje |
| `roles-and-permissions.md:90` (known-gap): `PropertyDetail` powinien dopuszczać `PROPERTY_ADMIN` (właściciel room inventory) | `router/index.ts:118-121`: `PropertyDetail` tylko dla `AGENCY_ADMIN, AGENCY_PLANNER` | Property Admin nie może edytować własnego inwentarza pokoi przez UI — sprzeczne z Hard Rule #1 CLAUDE.md ("Property roles confirm reality") |
| `roles-and-permissions.md:108-112` (known-gap): audit log powinien być widoczny dla `PROPERTY_ADMIN` (własna property) | `router/index.ts:169`: `/audit` → tylko `AGENCY_ADMIN` | `prd.md:489-493` wskazuje to jako planowaną zmianę ("Access Control Changes" #3) — świadomy dług |
| `data-model.md:123-133`: `AuditEvent.diff: AuditDiff` (field-level array); `entityType` bez `'BED'`; `AuditAction` w formie `'CREATE'/'CHECK_IN'/'IMPORT'` | `audit.types.ts`: `previousState`/`newState` (całe obiekty); `entityType` zawiera `'BED'`; akcje w formie przeszłej `'CREATED'/'CHECKED_IN'`; brak `IMPORT`/`INSPECTION_COMPLETE`, ma `BULK_ASSIGNED` | Kształt audytu wyewoluował niezależnie od dokumentu — nazewnictwo i struktura danych się rozjechały |
| `idea.md:449-457,918-925`: "Shift Lead" jako odrębna rola z uprawnieniem override | `auth.types.ts:1-5`: tylko 4 role, brak `SHIFT_LEAD` | Rola skonsolidowana do `FRONT_DESK`; koncepcja "override" przetrwała jako pole `overrideReason`, ale bez rate-limitu z `idea.md:1052-1056` ("threshold = 5 overrides/shift") — **brak w kodzie jakiegokolwiek rate-limitingu override'ów** |
| `roles-and-permissions.md:12,254-257` + `idea.md:668` + `prd.md:495-498`: session/device revocation "must work instantly" | `admin.types.ts` — brak endpointu/payloadu do revocation | Jawnie odnotowane w dokumencie jako "Planned, not in MVP"; `prd.md` wskazuje to jako otwarte Success Criterion |
| `data-model.md:60-63,247`: `Room.capacity`/`availableSpots` | `property.types.ts:51-65`: `bedCount`/`availableBedCount` | Nazewnictwo pól przesunęło się w stronę modelu bed-level, potwierdzając że dokument (room-capacity-only) jest przestarzały |
| `prd.md:150` guardrail + `data-model.md:201-241`: hard constraints muszą blokować na poziomie systemu | `useConflicts.ts`/`CreateStay.vue`: walidacja wyłącznie reaktywna na odpowiedź serwera (422), brak pre-submit client-side capacity check | Brak niezmiennika po stronie klienta — UX polega w pełni na roundtripie do backendu |

---

## Krok 5 — Ranking refaktoru

Ranking wg wartości (jak bardzo agregat jest rdzeniowym niezmiennikiem) × ryzyka (jak słabo jest dziś egzekwowany):

1. **#1 — ConflictInbox / offline sync (persystencja)**. Wartość: wysoka — to bezpośrednia realizacja obietnicy "never silently auto-merge" (`idea.md:632-636`), krytyczna dla trzech must-not-fail momentów działających offline w terenie. Ryzyko: najwyższe — konflikty żyją wyłącznie w pamięci Pinia, znikają przy odświeżeniu/awarii karty, co w praktyce cicho gubi dokładnie te przypadki, które reguła miała chronić. To pokrywa się z wcześniej zidentyfikowanym F1 CRITICAL w przeglądzie planu `refactor-opportunities`.
2. **#2 — Stay creation authority (Propose→Confirm w routingu)**. Wartość: bardzo wysoka — to Hard Rule #1 całego systemu. Ryzyko: średnio-wysokie, jawnie udokumentowane jako known-gap, ale wciąż aktywnie pozwala roli property nadpisywać plan agencji wbrew centralnemu niezmiennikowi zaufania.
3. **#3 — Client-side constraint enforcement (capacity/gender rules)**. Wartość: wysoka — to druga połowa "no double-booking" (`idea.md:145`). Ryzyko: średnie — backend prawdopodobnie egzekwuje poprawnie, ale brak lokalnej walidacji oznacza gorszy UX (błąd dopiero po roundtripie) i brak drugiej linii obrony przy awarii/niespójności backendu.
4. **#4 — Kształt AuditEvent (diff field-level vs whole-object)**. Wartość: średnia — audyt jest Core, ale obecny kształt wciąż *działa* jako ewidencja, tylko gorzej się skaluje/czyta przy sporach z partnerami. Ryzyko: niskie-średnie — to dług techniczny/dokumentacyjny, nie luka bezpieczeństwa.

**Rekomendacja #1 do refaktoru: ConflictInbox — dodanie trwałej persystencji (IndexedDB store) dla `SyncConflict[]`.** Uzasadnienie: to jedyny kandydat, gdzie rdzeniowy niezmiennik biznesowy ("nigdy nie gub spornej akcji") jest aktywnie i po cichu łamany przez architekturę (in-memory only), a nie tylko niedoegzekwowany w jednym miejscu routingu — i dotyczy dokładnie tych trzech "must-not-fail moments", które PRD stawia jako sedno produktu.

---

## Podsumowanie

Ten artefakt mapuje domenę Beduno — system śledzenia obłożenia zakwaterowania dla agencji pracy tymczasowej — na podstawie `docs/idea.md`, `docs/should-be/*`, `prd.md`, `CLAUDE.md` oraz zweryfikowanego kodu w `src/modules/`. Zidentyfikowano 23 pojęcia ubiquitous language i sklasyfikowano obszary domeny: Core to Stay lifecycle z regułą Propose→Confirm, obłożenie na poziomie łóżek, audyt oraz trzy "must-not-fail moments" (arrivals, in-house, inspection); Supporting to offline sync, katalog pracowników i QR; Generic to auth, eksporty i i18n. Wskazano cztery kandydatów na agregaty (Stay, Room/Bed capacity, ConflictInbox, AuditEvent) wraz z ich niezmiennikami i stanem egzekwowania w kodzie — żaden nie jest w pełni domknięty, a jeden (ConflictInbox) jest aktywnie łamany architekturą in-memory. Najważniejszy wniosek: największy rozjazd model-vs-kod (byt `Bed`, nieobecny w `prd.md`, ale obecny i aktywnie używany w kodzie) jest już świadomie oznaczony w `CLAUDE.md` jako "Superseded" — realny dług leży gdzie indziej, w trzech miejscach, gdzie dokumentacja *poprawnie* opisuje niezmiennik, a kod go nie domyka: propose/confirm authority w routingu, brak lokalnej walidacji capacity, i brak trwałości konfliktów offline. Rekomendowany priorytet refaktoru to persystencja Conflict Inbox — to jedyne miejsce, gdzie luka w egzekwowaniu bezpośrednio zagraża centralnej obietnicy produktu, a nie tylko jego higienie kodu.
