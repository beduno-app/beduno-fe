---
title: Invariant & Aggregate Refactor Plan — Offline Sync Conflict Resolution
created: 2026-09-14
type: refactor-plan
---

# Plan refaktoru: niezmiennik "konflikt synchronizacji offline"

**To jest PLAN. Kod produkcyjny nie został zmieniony.**

## Krok 0 — Kontekst

Stack: Vue 3 SPA (Composition API, TS strict), Pinia (stan), IndexedDB (`src/shared/services/db.ts`, `DB_VERSION=3`) jako jedyna warstwa persystencji dostępna na kliencie, `beduno-be` REST API jako backend/serwer prawdy.

Warstwy, w których żyje logika biznesowa w tym repo:
- **API** (`*/api/*.ts`) — cienkie wrappery axios, backend jest właścicielem twardej walidacji (constraint engine, 422).
- **Store** (`*/store/*.ts`, Pinia) — dziś pełni rolę "domeny" ad hoc: `sync.store.ts` zawiera zarówno orkiestrację replay, jak i (nieegzekwowaną) logikę biznesową konfliktu.
- **Serwis** (`src/shared/services/{db,actionQueue}.ts`) — CRUD na IndexedDB, bez reguł domenowych.
- **UI** (`*.vue`) — w kilku miejscach jest jedynym strażnikiem reguły (patrz Krok 3).

Dokumenty źródłowe: `docs/idea.md`, `context/foundation/prd.md` (sekcje "Business logic"/FR/Guardrails), `CLAUDE.md` (Hard rules).

---

## Krok 1 — Zidentyfikowane niezmienniki biznesowe

| # | Niezmiennik | Źródło |
|---|---|---|
| I1 | Skolejkowana akcja offline, która przy replay koliduje z potwierdzoną rzeczywistością (capacity/gender/already-checked-in), **nigdy nie jest cicho auto-scalana ani tracona** — trafia do inboxu "Needs review". | `docs/idea.md:628-633` ("Don't attempt smart auto-merge"), `:772-779` ("do not silently override"), `:931` ("never silent auto-merge"); `prd.md:344` (FR-019, must-have) |
| I2 | Konflikt w inboksie jest **przypisany (owned)** do użytkownika Front Desk, którego akcja została odrzucona. | `prd.md:346` — "resolved (2026-09-12) — a conflict is owned by the Front Desk user whose action was rejected" |
| I3 | Skolejkowana akcja **przechowuje stan, wobec którego była ważna w momencie zakolejkowania** (nie tylko `stayId`), żeby replay wykrył dokładnie co się zmieniło. | `prd.md:343` — FR-018, "resolved (2026-09-12) — a queued action snapshots the state it was valid against at queue-time" |
| I4 | Operacje operacyjne generują zdarzenie audytowe z actor + before/after + timestamp. | `CLAUDE.md:7` "Everything is audited" |
| I5 | Agency proponuje (`PLANNED`), property potwierdza rzeczywistość; rola agency nigdy nie mutuje potwierdzonego obłożenia. | `CLAUDE.md:5` "Propose → confirm" |
| I6 | Room/capacity/user edits są wyłącznie online — nie wchodzą do kolejki offline. | `CLAUDE.md`: "Room/capacity/user edits are online-only by design — do not add them to the offline queue." |
| I7 | Room capacity: brak double-bookingu bez widocznego ostrzeżenia; hard constraint blokuje zapis. | `docs/idea.md:145`; `stay.types.ts:124-131` (`HardConstraintType`) |

---

## Krok 2 — Klasyfikacja i wybór #1

| # | (a) Rdzeniowość | (b) Rozsmarowanie po warstwach | (c) Egzekwowanie |
|---|---|---|---|
| I1+I2+I3 (traktowane łącznie — patrz uzasadnienie niżej) | **Bardzo wysoka.** To jedyna reguła w PRD, która ma osobno wypisane, rozwiązane Socratic pytanie w dwóch FR (FR-018, FR-019, `prd.md:341-346`) i jest jednym z trzech "must-have" filarów offline-first (`prd.md:53-54`). | **Bardzo wysokie.** Żyje w: `src/shared/services/actionQueue.ts` (kolejka), `src/modules/arrivals/store/arrivals.store.ts` i `inhouse/store/inhouse.store.ts` (punkt wejścia — queueOffline), `src/modules/ops/store/sync.store.ts` (replay + "domena"), `src/modules/ops/components/ConflictInbox.vue` (UI jako jedyny strażnik), `src/shared/services/db.ts` (schema, brak store'u dla konfliktu) | **Najsłabsze ze wszystkich.** Deklarowane w PRD jako *resolved*, w kodzie: brak persystencji, brak ownership, brak state-snapshot, brak audytu — patrz Krok 3. |
| I4 (audyt, ogólnie) | Wysoka | Wysokie (dotyczy każdego modułu operacyjnego) | Częściowe — audit events istnieją dla mutacji przechodzących przez API (`auditApi` read-only z frontendu, backend generuje), ale to jest już relatywnie dobrze zamknięte dla "normalnych" operacji |
| I5 (propose→confirm authority) | Bardzo wysoka | Niskie — żyje właściwie w jednym miejscu: `src/app/router/index.ts:133` (`meta.roles` dla `StayCreate`) | Naruszalne (`PROPERTY_ADMIN` dopuszczony), **ale PRD sam nazywa to nierozstrzygniętym**: `prd.md:229-231` (US-04) — "Unresolved: whoever the product forbids here will use WhatsApp... Blocks FR-001, FR-002." To nie jest luka w implementacji zamkniętej decyzji — to wciąż otwarta decyzja produktowa. Słaby kandydat na projekt agregatu, bo nie wiadomo, jaką regułę agregat miałby egzekwować. |
| I3 osobno / I7 (client-side capacity) | Wysoka | Średnie (`useConflicts.ts` + `CreateStay.vue`) | W praktyce **dobrze zaprojektowane**: klient robi optymistyczny pre-check (`useConflicts.checkCapacity`, `stays/composables/useConflicts.ts:41-49`), ale **serwer jest ostatecznym strażnikiem** — `CreateStay.vue:114-121` łapie 422 i ustawia `ConstraintViolationResponse` z powrotem. Fail-fast już działa. |
| I6 | Średnia | Niskie | Egzekwowane przez brak kodu (nie ma ścieżki offline dla capacity edits) — nie ma czego naprawiać |

### Wybór

**Wybieram I1+I2+I3 jako jeden spójny niezmiennik: "Sync Conflict Resolution".**

Uzasadnienie: to jedyny kandydat, który jest **jednocześnie** (a) explicite rdzeniowy — jeden z trzech must-have filarów PRD, z dwoma nazwanymi FR i udokumentowanym procesem decyzyjnym (Socratic → Resolution), (b) naprawdę rozsmarowany po pięciu plikach w czterech warstwach, i (c) w kodzie **kompletnie nieegzekwowany** mimo że w PRD figuruje jako *rozstrzygnięty*. To odróżnia go od I5 (wciąż otwarta decyzja produktowa — nie da się zaprojektować agregatu wokół nierozstrzygniętej reguły) i od I7 (już poprawnie zaprojektowane). Ryzyko materializuje się wprost: sprzeczność między "resolved" w PRD a zerową implementacją oznacza, że każdy konflikt offline dziś ginie bez śladu przy odświeżeniu karty — to jest realna, aktywna luka, nie tylko dług dokumentacyjny.

---

## Krok 3 — Diagnoza

### Gdzie dziś żyje reguła (plik:linia)

1. **Kolejkowanie akcji — brak state snapshot i brak ownership (łamie I3, częściowo I2)**
   - `src/shared/services/actionQueue.ts:10-16` — `QueuedAction{id,type,stayId,payload,queuedAt}`. **Brak pola na stan-w-momencie-zakolejkowania** (capacity/occupants odczytane przy queue-time, jak wymaga `prd.md:343`) i **brak pola `queuedByUserId`**.
   - `src/modules/arrivals/store/arrivals.store.ts:53-56` i `src/modules/inhouse/store/inhouse.store.ts:60-63` — `queueOffline(type, stayId, payload)` wywołuje `enqueueAction(type, stayId, payload)` bez przekazania aktualnego użytkownika (dostępnego w `useAuthStore().user.id`, `src/modules/auth/store/auth.store.ts:10`) ani żadnego odczytu stanu pokoju/obłożenia.

2. **Replay i wykrycie konfliktu — częściowo egzekwowane, ale ginie kontekst (I1)**
   - `src/modules/ops/store/sync.store.ts:74-88` — `syncQueue()` łapie błąd z `replayAction()` i **poprawnie** nie nadpisuje cicho (nie ma auto-merge) — to jedyna część reguły, która realnie działa.
   - Ale w tym samym bloku (linia 85): `await removeAction(action.id)` — akcja jest **trwale usuwana z jedynego trwałego magazynu (IndexedDB)** w tym samym oddechu, w którym trafia do `conflicts.value.push(...)` (linia 80-84), które jest **tylko w pamięci Pinia**.

3. **Przechowywanie konfliktu — UI jest jedynym strażnikiem, brak persystencji (łamie I1, I2)**
   - `src/modules/ops/store/sync.store.ts:18-22,27` — `SyncConflict{action,error,detectedAt}` — brak `ownerId`/`queuedByUserId`, brak `resolvedBy`, brak `status`.
   - `src/shared/services/db.ts:17-51` — schema `onupgradeneeded` tworzy stores `workers`, `rooms`, `arrivals`, `meta`, `actionQueue` — **brak jakiegokolwiek store'u dla konfliktów**.
   - Potwierdzone brakiem persystencji Pinia: `grep "persist"` w repo pokazuje `persist` skonfigurowany wyłącznie w `src/modules/auth/store/auth.store.ts:39` — `sync.store.ts` nie ma `persist`, więc domyślnie Pinia trzyma stan wyłącznie w pamięci JS taba.
   - **Konsekwencja**: odświeżenie karty, zamknięcie aplikacji PWA lub awaria taba **cicho gubi** każdy nierozwiązany konflikt — dokładnie to, czego I1 zabrania ("do not silently override" — utrata jest tu gorsza niż auto-merge, bo nie zostaje nawet ślad, że coś wymagało decyzji).

4. **Rozwiązywanie konfliktu — brak audytu, brak ownership check (łamie I2, I4)**
   - `src/modules/ops/store/sync.store.ts:99-105` — `dismissConflict(index)` i `clearConflicts()` to gołe mutacje tablicy (`splice`/przypisanie `[]`). **Brak wywołania API, brak `auditApi`, brak jakiegokolwiek zdarzenia audytowego.**
   - `src/modules/ops/components/ConflictInbox.vue:20,39` — `sync.clearConflicts()` i `sync.dismissConflict(idx)` wywoływane bezpośrednio z template'u, bez potwierdzenia, bez sprawdzenia czy klikający użytkownik jest właścicielem konfliktu (bo `ownerId` w ogóle nie istnieje).
   - `src/modules/audit/types/audit.types.ts:1-13` — `AuditEntityType`/`AuditAction` nie mają wariantu dla konfliktu synchronizacji (`'SYNC_CONFLICT'` / `'CONFLICT_RESOLVED'` nie istnieją) — nawet gdyby ktoś chciał dodać wywołanie, kontrakt typu tego nie przewiduje.

### Podsumowanie diagnozy

| Warstwa | Egzekwuje I1 (nie gub/nie scalaj)? | Egzekwuje I2 (ownership)? | Egzekwuje I3 (state snapshot)? | Egzekwuje I4 (audyt)? |
|---|---|---|---|---|
| `actionQueue.ts` (persystencja) | Częściowo — trzyma akcję do syncu, ale usuwa ją przy konflikcie (linia 85 w `sync.store.ts`) zanim cokolwiek trwałego ją zastąpi | Nie — brak pola | Nie — brak pola | N/A |
| `sync.store.ts` (Pinia, RAM) | **Nie** — jedyny "magazyn" konfliktu jest efemeryczny | Nie — brak pola | Nie — brak pola | Nie — dismiss/clear nie wywołują API |
| `ConflictInbox.vue` (UI) | Jest **jedynym** miejscem, gdzie człowiek w ogóle widzi konflikt — jeśli karta się zamknie przed obejrzeniem, reguła jest złamana bez żadnego logu | Nie sprawdza właściciela | N/A | Nie generuje audytu |
| `audit.types.ts` / `auditApi` | N/A | N/A | N/A | Kontrakt typu nie przewiduje tej kategorii zdarzenia |

**Błąd nie jest "połykany" w sensie try/catch — jest gorzej: operacja `syncQueue()` jawnie się kończy sukcesem (`conflicted++`, linia 86), UI pokazuje banner, ale nic nie gwarantuje, że ten stan przetrwa dłużej niż bieżącą sesję karty.** To jest fail-open, nie fail-fast: brak trwałości oznacza, że system *wygląda* na działający (żadnego wyjątku, żadnego błędu w konsoli), a cicho traci dokładnie te dane, które reguła miała chronić.

---

## Krok 4 — Projekt agregatu-strażnika

### Nazwa agregatu: `OfflineSyncAction`

Reprezentuje pełny cykl życia jednej zakolejkowanej akcji offline — od zakolejkowania, przez próbę replay, aż do stanu terminalnego (`SYNCED` albo `RESOLVED` po przejściu przez `NEEDS_REVIEW`). Zastępuje dzisiejszy podział na dwa niepowiązane byty (`QueuedAction` w IndexedDB, `SyncConflict` tylko w RAM) jednym bytem trzymanym w jednym miejscu przez cały cykl życia.

```ts
type OfflineActionStatus = 'PENDING' | 'SYNCED' | 'NEEDS_REVIEW' | 'RESOLVED'

interface StateSnapshot {
  // pola odczytane przy queue-time, potrzebne do wykrycia dokładnie
  // co się zmieniło do momentu replay (FR-018 / I3)
  roomAvailableBedCount?: number
  stayStatus?: StayStatus
  capturedAt: string
}

interface ConflictInfo {
  errorCode: string
  message: string
  detectedAt: string
}

interface ResolutionInfo {
  resolvedByUserId: string
  resolvedAt: string
  outcome: 'RETRIED' | 'DISCARDED' | 'OVERRIDDEN'
  reason: string          // obowiązkowy — spójne z overrideReason w reszcie domeny
  auditEventId: string    // dowód, że I4 zostało spełnione atomowo z rozwiązaniem
}

class OfflineSyncAction {
  readonly id: string
  readonly type: QueuedActionType
  readonly stayId: string
  readonly payload: unknown
  readonly queuedByUserId: string     // I2
  readonly queuedAt: string
  readonly stateSnapshot: StateSnapshot // I3
  status: OfflineActionStatus
  conflict: ConflictInfo | null
  resolution: ResolutionInfo | null

  private constructor(/* ... */) { /* przypisanie pól, wszystkie invarianty tworzenia sprawdzone tu */ }

  // --- Tworzenie ---
  static queue(input: {
    type: QueuedActionType
    stayId: string
    payload: unknown
    queuedByUserId: string
    stateSnapshot: StateSnapshot
  }): OfflineSyncAction {
    if (!input.queuedByUserId) throw new MissingActorError('OfflineSyncAction.queue requires queuedByUserId')
    if (!input.stateSnapshot) throw new MissingSnapshotError('OfflineSyncAction.queue requires a state snapshot')
    return new OfflineSyncAction({ ...input, status: 'PENDING', conflict: null, resolution: null, id: newId(), queuedAt: now() })
  }

  // --- Przejście PENDING -> SYNCED | NEEDS_REVIEW ---
  markSynced(): void {
    this.assertStatus('PENDING', 'markSynced')
    this.status = 'SYNCED'
  }

  markConflicted(conflict: ConflictInfo): void {
    this.assertStatus('PENDING', 'markConflicted')
    this.conflict = conflict
    this.status = 'NEEDS_REVIEW'
    // celowo: żadnej gałęzi, która pomija ustawienie statusu — nielegalne
    // jest tylko wywołanie z niewłaściwego stanu (patrz assertStatus)
  }

  // --- Rozwiązanie konfliktu (I1 + I2 + I4 w jednej operacji) ---
  resolve(input: { byUserId: string; outcome: ResolutionInfo['outcome']; reason: string; auditEventId: string }): void {
    this.assertStatus('NEEDS_REVIEW', 'resolve')
    if (!input.reason?.trim()) {
      throw new MissingResolutionReasonError(this.id)
    }
    if (input.byUserId !== this.queuedByUserId) {
      // I2: właściciel konfliktu = użytkownik, którego akcja została odrzucona
      // (rozszerzalne o rolę admina przez osobną metodę resolveAsAdmin, nie przez
      // cichy fallback tutaj)
      throw new NotConflictOwnerError({ conflictId: this.id, actor: input.byUserId, owner: this.queuedByUserId })
    }
    if (!input.auditEventId) {
      // I4: rozwiązanie bez dowodu audytu jest nielegalne — nie "loguj i jedź dalej"
      throw new MissingAuditEventError(this.id)
    }
    this.resolution = { resolvedByUserId: input.byUserId, resolvedAt: now(), outcome: input.outcome, reason: input.reason, auditEventId: input.auditEventId }
    this.status = 'RESOLVED'
  }

  private assertStatus(expected: OfflineActionStatus, op: string): void {
    if (this.status !== expected) {
      throw new IllegalOfflineActionTransitionError({ id: this.id, op, expected, actual: this.status })
    }
  }
}
```

Nazwane błędy domenowe (zamiast cichej aktualizacji stanu): `MissingActorError`, `MissingSnapshotError`, `IllegalOfflineActionTransitionError`, `NotConflictOwnerError`, `MissingResolutionReasonError`, `MissingAuditEventError`.

### Repozytorium

```ts
interface OfflineSyncActionRepository {
  save(action: OfflineSyncAction): Promise<void>       // upsert pełnego stanu, jedna operacja
  findPending(): Promise<OfflineSyncAction[]>
  findNeedsReview(): Promise<OfflineSyncAction[]>
  findById(id: string): Promise<OfflineSyncAction | null>
}
```

Implementacja na IndexedDB: **jeden object store** `offlineSyncActions` (zastępuje dzisiejszy `actionQueue` + niepersystowany `conflicts`) z indeksem na `status`, tak żeby `PENDING` i `NEEDS_REVIEW` dało się odczytać jednym zapytaniem zamiast dwóch osobnych źródeł prawdy. Wymaga `DB_VERSION` bump (4) w `src/shared/services/db.ts` z migracją `e.oldVersion < 4`.

### Atomowość przejścia `PENDING → NEEDS_REVIEW → RESOLVED`

Krytyczny punkt dzisiejszego błędu: usunięcie z `actionQueue` (linia 85 `sync.store.ts`) i dopisanie do `conflicts` (linia 80) to dziś **dwie oddzielne, nieatomowe operacje na dwóch różnych magazynach** (jedna trwała, jedna w RAM). W nowym projekcie to jest **jeden zapis jednego agregatu do jednego object store** — IndexedDB gwarantuje atomowość pojedynczej transakcji na jednym store:

```ts
async function attemptReplaySingleAction(action: OfflineSyncAction, replay: () => Promise<void>) {
  try {
    await replay()
    action.markSynced()
  } catch (e) {
    action.markConflicted(toConflictInfo(e))
  }
  await repo.save(action)   // JEDNA transakcja IndexedDB — status i dane spójne zawsze
}
```

Nie ma stanu przejściowego, w którym akcja jest "usunięta z kolejki, ale jeszcze nie w konfliktach" — bo to ten sam rekord, ta sama transakcja.

### Cienkie API/route (przeniesienie egzekucji z klienta na serwer, gdzie to możliwe)

`resolve()` domenowo wymaga `auditEventId` — czyli **musi** przejść przez backend (frontend nie może sam sobie wystawić zdarzenia audytowego, `auditApi` jest dziś read-only, patrz Krok 3 pkt 4). Projekt zakłada nowy endpoint po stronie `beduno-be` (poza zakresem tego repo, ale kontrakt trzeba zarezerwować we frontendowych typach):

```
POST /sync-conflicts/{id}/resolve
body: { outcome: 'RETRIED'|'DISCARDED'|'OVERRIDDEN', reason: string }
→ 200 { auditEventId: string }
→ 403 jeśli actor != queuedByUserId (serwer, nie tylko klient, egzekwuje I2)
→ 409 jeśli status != NEEDS_REVIEW
```

Frontendowy handler (cienki, bez logiki domenowej):

```ts
async function resolveConflict(actionId: string, outcome, reason: string) {
  const local = await repo.findById(actionId)
  if (!local) throw new UnknownOfflineActionError(actionId)
  const { auditEventId } = await syncConflictsApi.resolve(actionId, { outcome, reason }) // rzuca na 403/409
  local.resolve({ byUserId: authStore.user!.id, outcome, reason, auditEventId })
  await repo.save(local)
}
```

Serwer jest ostatecznym egzekutorem I2 i I4 (tak jak dziś jest ostatecznym egzekutorem capacity/gender — I7); agregat po stronie klienta gwarantuje, że **UI nie może nawet spróbować** zapisać nielegalnego przejścia lokalnie, nawet zanim odpowiedź serwera wróci.

---

## Krok 5 — Before/after, plan faz, testy

### Before/after

| Dzisiejsze miejsce reguły | Before | After |
|---|---|---|
| `actionQueue.ts:10-16,20-42` | `QueuedAction` bez ownera/snapshotu; `enqueueAction()` przyjmuje tylko `type,stayId,payload` | Zastąpione przez `OfflineSyncAction.queue()` — brak ownera/snapshotu rzuca błąd na starcie, nie ginie po drodze |
| `arrivals.store.ts:53-56`, `inhouse.store.ts:60-63` | `queueOffline(type, stayId, payload)` — brak `authStore.user.id`, brak odczytu stanu pokoju | Wywołania przekazują `queuedByUserId: authStore.user!.id` i `stateSnapshot` odczytany z aktualnie załadowanego `Room`/`Stay` przed zapisem |
| `sync.store.ts:74-88` (replay) | `removeAction()` + `conflicts.value.push()` — dwie nieatomowe operacje, jedna trwała, jedna w RAM | `attemptReplaySingleAction()` — jedna transakcja `repo.save()` na jednym object store |
| `sync.store.ts:99-105`, `ConflictInbox.vue:20,39` | `dismissConflict`/`clearConflicts` — gołe mutacje tablicy, brak API, brak audytu, brak sprawdzenia właściciela | `resolveConflict()` — wymaga wywołania serwera, `auditEventId` obowiązkowy, `NotConflictOwnerError` jeśli actor ≠ owner |
| `db.ts:17-51` | Brak store'u na konflikty; `actionQueue` bez indeksu na status | `DB_VERSION=4`; jeden store `offlineSyncActions` z indeksem `status` |
| `audit.types.ts:1-13` | `AuditEntityType`/`AuditAction` bez wariantu dla konfliktu sync | Dodać `'SYNC_CONFLICT'` do `AuditEntityType`, `'CONFLICT_RESOLVED'` do `AuditAction` (kontrakt, egzekucja po stronie `beduno-be`) |

### Plan faz

Projekt ma dyscyplinę test-first dla kontraktowych przejść stanu (`10x-tdd`/Vitest, wzorzec widoczny w `src/modules/ops/store/sync.store.spec.ts`, 262 linie, 15 testów `it(...)`). Fazy 2 i 3 (logika agregatu, czyste przejścia stanu bez I/O) nadają się do TDD — można nazwać pierwszy czerwony test jednym zdaniem. Faza 1 (schema/infra) i faza 5 (wiring UI/API) idą przez zwykłą implementację.

1. **Faza 1 — Infrastruktura (implement, nie TDD)**: `DB_VERSION` → 4, nowy object store `offlineSyncActions` z indeksem `status` i migracją `e.oldVersion < 4` przenoszącą istniejące rekordy `actionQueue` (status=`PENDING`, `queuedByUserId=null` jako oznaczenie danych sprzed migracji, `stateSnapshot=null`).
2. **Faza 2 — Agregat `OfflineSyncAction` (TDD)**: klasa + błędy domenowe, zero I/O, zero zależności od Pinia/IndexedDB. Pierwszy czerwony test: *"resolve() rzuca `NotConflictOwnerError`, gdy `byUserId` różni się od `queuedByUserId`"*.
3. **Faza 3 — `OfflineSyncActionRepository` (TDD dla logiki mapowania, implement dla samego IndexedDB I/O)**: `save`/`findPending`/`findNeedsReview`/`findById`.
4. **Faza 4 — Przepięcie `sync.store.ts` i punktów wejścia (`arrivals.store.ts`, `inhouse.store.ts`)**: `queueOffline` zaczyna wymagać `queuedByUserId`+`stateSnapshot`; `syncQueue()` używa `attemptReplaySingleAction`. Usunięcie starego `conflicts` ref i starych `actionQueue.ts` funkcji (albo przekierowanie ich na repozytorium, jeśli inne moduły jeszcze z nich korzystają — zweryfikować przed usunięciem).
5. **Faza 5 — `resolveConflict()` + UI (`ConflictInbox.vue`) + kontrakt `syncConflictsApi`**: wymaga równoległej zmiany po stronie `beduno-be` (poza tym repo) — do czasu jej dostarczenia `resolve()` może rzucać `NotImplementedError` zamiast cicho sukcesu, żeby nie regresować fail-fast w trakcie wdrożenia.
6. **Faza 6 — Rozszerzenie `audit.types.ts`** o `'SYNC_CONFLICT'`/`'CONFLICT_RESOLVED'` (kontrakt frontendowy — realna emisja zdarzenia jest po stronie backendu).

### Przypadki testowe dla niezmiennika (legalne i nielegalne)

**Legalne przejścia**
- `queue()` z pełnym `queuedByUserId` + `stateSnapshot` → status `PENDING`.
- `markSynced()` z `PENDING` → `SYNCED`.
- `markConflicted()` z `PENDING` → `NEEDS_REVIEW`, `conflict` ustawione.
- `resolve({byUserId === queuedByUserId, reason: niepuste, auditEventId: niepuste})` z `NEEDS_REVIEW` → `RESOLVED`, `resolution` ustawione.
- `attemptReplaySingleAction` wywołane dwukrotnie równolegle na tej samej akcji → druga transakcja widzi już zmieniony status (IndexedDB transaction ordering) — nie duplikuje efektu.

**Nielegalne operacje (muszą rzucić nazwany błąd, nie cicho zaktualizować stan)**
- `queue()` bez `queuedByUserId` → `MissingActorError`.
- `queue()` bez `stateSnapshot` → `MissingSnapshotError`.
- `markSynced()` na akcji w stanie `NEEDS_REVIEW` lub `RESOLVED` → `IllegalOfflineActionTransitionError`.
- `markConflicted()` na akcji, która nie jest `PENDING` → `IllegalOfflineActionTransitionError`.
- `resolve()` na akcji w stanie `PENDING` lub `SYNCED` → `IllegalOfflineActionTransitionError`.
- `resolve()` na akcji już `RESOLVED` (podwójne rozwiązanie) → `IllegalOfflineActionTransitionError`.
- `resolve({byUserId: inny_niż_queuedByUserId})` → `NotConflictOwnerError`.
- `resolve({reason: ''})` → `MissingResolutionReasonError`.
- `resolve({auditEventId: undefined})` (np. serwer nie zwrócił go, sieć padła w połowie) → `MissingAuditEventError` — **nie wolno** ustawić `RESOLVED` bez dowodu audytu, nawet jeśli reszta się powiodła.
- Migracja z Fazy 1: rekord `actionQueue` bez `queuedByUserId` po migracji do `offlineSyncActions` musi mieć jawną flagę (np. `legacyUnowned: true`), a nie zostać cicho potraktowany jako właściciel = null == aktualny użytkownik.

### Load-bearing names do zarejestrowania

Projekt nie prowadzi jeszcze `docs/reference/contract-surfaces.md` (brak pliku w repo — normalnie scaffoldowany przez `/10x-init`). Jeśli zostanie założony, poniższe nazwy są kandydatami do wpisania jako kontraktowe:

- `OfflineSyncAction` (agregat)
- `OfflineSyncActionStatus` (`PENDING\|SYNCED\|NEEDS_REVIEW\|RESOLVED`)
- `OfflineSyncActionRepository`
- `NotConflictOwnerError`, `IllegalOfflineActionTransitionError`, `MissingAuditEventError`, `MissingResolutionReasonError`, `MissingSnapshotError`, `MissingActorError`
- `offlineSyncActions` (nazwa IndexedDB object store, `DB_VERSION=4`)
- `POST /sync-conflicts/{id}/resolve` (nowy endpoint kontraktowy, backend poza tym repo)
- `AuditEntityType.SYNC_CONFLICT`, `AuditAction.CONFLICT_RESOLVED`

---

## Podsumowanie

Ten plan identyfikuje niezmiennik "konflikt synchronizacji offline nigdy nie jest cicho tracony ani auto-scalany, jest przypisany do właściciela i jego rozwiązanie zawsze generuje zdarzenie audytowe" (FR-018/FR-019 z `prd.md`, potwierdzone w `docs/idea.md`) jako najbardziej rdzeniowy i jednocześnie najsłabiej egzekwowany niezmiennik w repo — wybrany właśnie dlatego, że PRD traktuje go jako *rozstrzygnięty*, a kod nie implementuje żadnej z trzech jego części (ownership, state-snapshot, audyt) i w dodatku trzyma jedyny zapis konfliktu wyłącznie w pamięci Pinia, przez co ginie przy odświeżeniu karty. Diagnoza pokazuje dokładne miejsca w czterech warstwach (`actionQueue.ts`, `arrivals.store.ts`/`inhouse.store.ts`, `sync.store.ts`, `ConflictInbox.vue`), gdzie reguła jest deklarowana, ale nie egzekwowana, oraz że dzisiejsza operacja `dismissConflict`/`clearConflicts` jest fail-open (kończy się "sukcesem" bez śladu), a nie fail-fast. Projekt wprowadza agregat `OfflineSyncAction` jako jedyny strażnik przejść stanu `PENDING→SYNCED|NEEDS_REVIEW→RESOLVED`, z nazwanymi błędami domenowymi zamiast cichych aktualizacji, repozytorium opartym o jeden object store IndexedDB dla atomowości, oraz cienkim API przenoszącym ostateczną egzekucję ownership i audytu na serwer. Plan faz rozdziela infrastrukturę (implement) od czystej logiki agregatu (test-first, z konkretnymi czerwonymi testami dla każdej nielegalnej operacji) i kończy się rozszerzeniem kontraktu audytu. Najważniejszy wniosek: rozjazd między "resolved" w dokumentacji a "nieobecne" w kodzie jest tu bardziej niebezpieczny niż zwykły dług techniczny, bo tworzy fałszywe poczucie bezpieczeństwa — ktoś czytający PRD uzna regułę za gotową, podczas gdy w produkcji każdy nieobsłużony konflikt znika bez śladu.
