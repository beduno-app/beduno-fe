---
title: Anti-Corruption Layer Refactor Plan — HTTP Error Shape (axios)
created: 2026-09-14
type: refactor-plan
---

# Plan refaktoru: przeciekająca zależność (axios) i projekt ACL

**To jest PLAN. Kod produkcyjny nie został zmieniony.**

## Krok 0 — Kontekst

Stack (`package.json`): `axios ^1.7.0` (HTTP client), `qrcode ^1.5.4` (generowanie QR), `jsqr ^1.4.0` (dekodowanie QR z kamery), `pinia`/`pinia-plugin-persistedstate`, `vue`/`vue-router`/`vue-i18n`. Brak backendu w tym repo (SPA — `beduno-be` żyje osobno), więc sygnał "biblioteka serwerowa wciągana do bundla klienta" nie ma tu zastosowania wprost — sprawdzone: `devDependencies` (`openapi-typescript` i in.) są narzędziami build-time, nie trafiają do bundla runtime.

Deklaracja o scentralizowaniu zależności HTTP — dokładny cytat:
- `CLAUDE.md:105` — "The shared axios instance lives in `src/shared/composables/useApi.ts` (exported as `api`) — import it rather than creating new axios instances."
- `AGENTS.md:14-15` — "Import the shared axios instance `api` from `src/shared/composables/useApi.ts`; never construct a new axios instance."

Warstwy: `api/*.ts` (wrapper axios → Promise), `store/*.ts` (Pinia, pośredniczy między API a UI), `views/*.vue` (prezentacja + obsługa błędów), `composables/*.ts` (logika UI wielokrotnego użytku).

---

## Krok 1 — Zidentyfikowane przeciekające zależności

### Kandydat A — `axios` (`AxiosError`, `e.response.data`) przecieka z Service do View

Wszystkie pliki, które dziś "znają" axios:
- `src/shared/composables/useApi.ts:1,5,37-82` — **legalny właściciel**: tworzy jedyną instancję (`api = axios.create(...)`), konfiguruje interceptory 401/refresh.
- `src/modules/stays/views/CreateStay.vue:13` — `import { AxiosError } from 'axios'`; użycie: linia 117 `if (e instanceof AxiosError && e.response?.status === 422)`, linia 118 `const data = e.response.data`.
- `src/modules/stays/views/StayDetail.vue:11` — `import { AxiosError } from 'axios'`; użycie: linia 96 `if (e instanceof AxiosError && e.response?.status === 422)`, linia 97 `const data = e.response.data`.
- `src/modules/stays/views/CreateStay.spec.ts:5,170` — test konstruuje `new AxiosError(...)` bezpośrednio, bo produkcyjny kod tego wymaga.

Duplikacja funkcji rozpoznającej kształt błędu domenowego (identyczna treść w dwóch plikach):
- `CreateStay.vue:91-98` — `isConstraintViolation(data)`.
- `StayDetail.vue:78-85` — `isConstraintViolation(data)` — **bajt w bajt ta sama implementacja**.

Żaden plik w `api/*.ts` (poza `useApi.ts`) nie importuje `axios` bezpośrednio — zweryfikowane (`grep` po wszystkich `src/modules/*/api/*.ts` nie zwrócił trafień) — co potwierdza, że warstwa API jest tu czysta, ale **nie robi nic** z błędem (patrz Krok 3), przez co obowiązek tłumaczenia spada na widoki.

### Kandydat B — `qrcode`/`jsqr` — duplikowane wywołania biblioteki w warstwie UI

- `src/modules/workers/components/QrBadge.vue:5,24-28` — `import QRCode from 'qrcode'`; `QRCode.toDataURL(encodeQrData(w.id), { width: 200, margin: 2, color: {...} })`.
- `src/modules/workers/components/BatchBadgePrint.vue:4,29` — `import QRCode from 'qrcode'`; `QRCode.toDataURL(encodeQrData(w.id), { width: 150, margin: 1 })` — **opcje rozjechane** (200 vs 150, margin 2 vs 1, kolor jawny vs domyślny) względem `QrBadge.vue`.
- `src/modules/arrivals/components/QrCheckin.vue:4` — `import jsQR from 'jsqr'`, dekodowanie klatki z kamery bezpośrednio w komponencie widoku (linie ok. 44-60), bez adaptera.

Rozpatrzone i odrzucone jako kandydat #1 — uzasadnienie w Kroku 2.

---

## Krok 2 — Klasyfikacja i wybór #1

| Oś | Kandydat A: `axios`/`AxiosError` | Kandydat B: `qrcode`/`jsqr` |
|---|---|---|
| (a) Liczba warstw/plików dotkniętych | **3 warstwy**: Service (`useApi.ts`), View ×2 (`CreateStay.vue`, `StayDetail.vue`), plus test. Przecina granicę Service↔View — dokładnie sygnał "ten sam pakiet importowany w wielu warstwach" z briefu. | Wyłącznie warstwa View (3 pliki komponentów), żaden Service/API. Mniej warstw dotkniętych. |
| (b) Ryzyko/koszt wymiany dziś | **Wysokie.** Zamiana axiosa (np. na `fetch`/`ky`) wymagałaby zmiany kształtu obsługi błędu w 2 widokach niezależnie od `useApi.ts`, bo to one, nie interceptor, decydują "co to za błąd". Ryzyko regresji: cichy brak obsługi 422 w nowych ekranach, bo nic nie wymusza wspólnego wzorca. | Średnie. Zamiana `qrcode` dotyka 2 pliki z już rozjechaną konfiguracją (czyli błąd już się manifestuje jako niespójny wygląd odznak, nie tylko potencjalne ryzyko). Zamiana `jsqr` dotyka 1 plik, ale ten plik miesza bibliotekę z zarządzaniem kamerą. |
| (c) Rozjazd intencja-vs-kod | **Silny i udokumentowany**: `CLAUDE.md:105` + `AGENTS.md:14-15` explicite mówią "import [jedną instancję] zamiast tworzyć nową" — a `CreateStay.vue`/`StayDetail.vue` mimo że nie tworzą nowej instancji `axios.create()`, **importują sam pakiet** i budują logikę domenową (`isConstraintViolation`) na jego typie błędu, co łamie ducha reguły: żaden inny plik poza `useApi.ts` nie powinien wiedzieć, czym jest `AxiosError`. | Brak jawnej deklaracji w `CLAUDE.md`/`AGENTS.md`/`prd.md` o centralizacji `qrcode`/`jsqr` — jedyna udokumentowana intencja dotyczy *formatu stringa* QR (`src/shared/utils/qrCode.ts:1-6`), nie biblioteki renderującej/skanującej. Słabszy sygnał rozjazdu. |

### Wybór: **Kandydat A — `axios`/`AxiosError` przeciekający do warstwy View**

Uzasadnienie: to jedyny kandydat spełniający wszystkie trzy sygnały z briefu jednocześnie — (1) ten sam pakiet w warstwie Service *i* View, (2) zduplikowana rekonstrukcja logiki interpretującej odpowiedź biblioteki (`isConstraintViolation` bajt-w-bajt w dwóch plikach), (3) jawnie udokumentowana intencja centralizacji w `CLAUDE.md:105`/`AGENTS.md:14-15`, którą kod łamie. Dodatkowo to jest groźniejszy przeciek jakościowo: `qrcode`/`jsqr` to biblioteki czysto prezentacyjne (nie mają kontraktu domenowego do przetłumaczenia), podczas gdy `AxiosError.response.data` niesie **kształt wire-level backendu** (`ConstraintViolationResponse`) i to właśnie ta wiedza — "jak rozpoznać, że backend odrzucił żądanie z powodu naruszenia ograniczenia" — jest dziś zakodowana w View, a nie w jednym miejscu domenowym.

---

## Krok 3 — Diagnoza

### Duplikacja (dowód)

```
CreateStay.vue:91-98                          StayDetail.vue:78-85
function isConstraintViolation(data: unknown) function isConstraintViolation(data: unknown)
  : data is ConstraintViolationResponse {        : data is ConstraintViolationResponse {
  return (                                      return (
    typeof data === 'object' &&                   typeof data === 'object' &&
    data !== null &&                              data !== null &&
    'error' in data &&                            'error' in data &&
    (data as Record<string, unknown>).error       (data as Record<string, unknown>).error
      === 'CONSTRAINT_VIOLATION'                    === 'CONSTRAINT_VIOLATION'
  )                                              )
}                                              }
```
Identyczna implementacja utrzymywana w dwóch miejscach — każda przyszła zmiana kształtu odpowiedzi backendu (np. nowe pole, inna nazwa kodu błędu) wymaga pamiętać o obu plikach; nic tego nie wymusza (brak wspólnego typu ani testu kontraktowego łączącego oba miejsca).

### Przecięcie granic warstw

- **Service (`useApi.ts`) → View bezpośrednio, z pominięciem Store jako punktu tłumaczenia.** `stays.store.ts:83-87,89-94` (`createStay`/`updateStay`) **nie robi nic** z błędem — `await staysApi.createStay(payload)` propaguje surowe odrzucenie Promise z axiosa (`stays.api.ts:18-19`) bez żadnej transformacji. To oznacza, że **View jest jedynym miejscem w całej aplikacji, które kiedykolwiek patrzy na kształt błędu** — Store, mimo że architektonicznie jest pośrednikiem między API a UI (`CLAUDE.md`: "Each module follows... `api/`, `store/`... `views/`"), nie pełni tu swojej roli.
- **Klient jest jedynym strażnikiem interpretacji błędu domenowego.** Jeśli ktoś doda nowy ekran tworzenia/edycji encji z walidacją serwerową (np. przyszły `WorkerCreate.vue`), nic w architekturze nie podpowiada, że trzeba skopiować `isConstraintViolation` po raz trzeci — a jeśli ktoś zapomni, błąd 422 wpadnie w gałąź ogólną `error.value = e instanceof Error ? e.message : 'Failed to create stay'` (`CreateStay.vue:124`, `StayDetail.vue:100` — ta linia też zduplikowana) i użytkownik zobaczy nieprzetłumaczony/generyczny komunikat zamiast listy naruszeń.
- **Rozjazd deklaracji vs kodu**: `CLAUDE.md:105` / `AGENTS.md:14-15` deklarują, że dostęp do axiosa ma iść wyłącznie przez `useApi.ts`. Kod w `CreateStay.vue:13` i `StayDetail.vue:11` importuje pakiet bezpośrednio — nie po to, by wykonać żądanie HTTP (to robi `staysApi`/`api`), ale by **odczytać kształt błędu**, co reguła w duchu zabrania równie mocno, bo to wciąż sprzężenie warstwy prezentacji z konkretną biblioteką HTTP.
- **Nie jest to "błąd połykany"** — obie ścieżki poprawnie propagują błąd dalej wizualnie (ustawiają `conflicts`/`error.value`), więc nie ma tu utraty danych jak w poprzednim dokumencie (`02-invariant-aggregate-refactor.md`). Problem jest inny: **redundancja i brak jednego miejsca prawdy** o kształcie błędu z API.

---

## Krok 4 — Projekt ACL

### Domenowy value object: `ApiError`

Jedyne miejsce wiedzy o kształcie odpowiedzi błędu z `beduno-be` (w tym `ConstraintViolationResponse`) i o tym, jak axios opakowuje błąd sieciowy.

```ts
// src/shared/http/apiError.ts (proponowana lokalizacja ACL)

export type ApiErrorKind =
  | 'CONSTRAINT_VIOLATION'  // 422 z kształtem ConstraintViolationResponse
  | 'VALIDATION'            // 400/422 inny kształt
  | 'UNAUTHORIZED'          // 401 (poza zakresem interceptora refresh)
  | 'NOT_FOUND'             // 404
  | 'NETWORK'               // brak odpowiedzi / timeout
  | 'UNKNOWN'

export class ApiError {
  private constructor(
    readonly kind: ApiErrorKind,
    readonly status: number | null,
    readonly message: string,
    readonly constraintViolations: { hard: ConstraintViolation[]; soft: ConstraintViolation[] } | null,
  ) {}

  // JEDYNE miejsce, które zna kształt axios/AxiosError — fabryka statyczna
  static fromUnknown(e: unknown): ApiError {
    if (!isAxiosError(e)) {
      return new ApiError('UNKNOWN', null, e instanceof Error ? e.message : 'Unknown error', null)
    }
    if (!e.response) {
      return new ApiError('NETWORK', null, e.message, null)
    }
    const { status, data } = e.response
    if (status === 422 && isConstraintViolationShape(data)) {
      return new ApiError('CONSTRAINT_VIOLATION', status, data.message, {
        hard: data.hardViolations,
        soft: data.softViolations,
      })
    }
    if (status === 401) return new ApiError('UNAUTHORIZED', status, 'Unauthorized', null)
    if (status === 404) return new ApiError('NOT_FOUND', status, 'Not found', null)
    return new ApiError('UNKNOWN', status, e.message, null)
  }

  // Operacje domenowe zamiast rozgałęzień w widoku
  get isConstraintViolation(): boolean { return this.kind === 'CONSTRAINT_VIOLATION' }
  get isRetryable(): boolean { return this.kind === 'NETWORK' }
}

// prywatne, niewyeksportowane poza ten plik — jedyne miejsce importujące axios
// poza useApi.ts
function isAxiosError(e: unknown): e is AxiosError { /* z pakietu 'axios' */ }
function isConstraintViolationShape(data: unknown): data is ConstraintViolationResponse { /* dawne isConstraintViolation */ }
```

### Wąski port + adapter

Port — interfejs domenowy, który zna tylko `ApiError`, nigdy `axios`:

```ts
// src/shared/http/httpErrorTranslator.ts — PORT
export interface HttpErrorTranslator {
  translate(e: unknown): ApiError
}
```

Adapter — implementacja portu, jedyny plik obok `apiError.ts`, który importuje `axios`:

```ts
// src/shared/http/axiosErrorTranslator.ts — ADAPTER
import { AxiosError } from 'axios'
export const axiosErrorTranslator: HttpErrorTranslator = {
  translate: (e) => ApiError.fromUnknown(e), // fromUnknown już hermetyzuje AxiosError
}
```

W praktyce, ponieważ `ApiError.fromUnknown` i tak jest jedynym miejscem znającym `AxiosError`, port/adapter można spłaszczyć do samego `ApiError.fromUnknown(e)` jako publicznego API modułu `src/shared/http/` — reszta aplikacji importuje **tylko** `ApiError`, nigdy `axios`.

### Reszta kodu zna tylko port

- `stays.store.ts` (Store) łapie błąd i rzuca `ApiError.fromUnknown(e)` dalej (albo w ogóle nic nie robi — propagacja jest OK, o ile to, co propaguje, jest już domenowe — patrz Krok 5, punkt o miejscu tłumaczenia).
- `CreateStay.vue`/`StayDetail.vue` łapią `ApiError`, nie `AxiosError`:

```ts
try {
  await staysStore.createStay(payload)
} catch (e) {
  const apiError = ApiError.fromUnknown(e)
  if (apiError.isConstraintViolation) {
    conflicts.setServerViolations(apiError.constraintViolations!.hard, apiError.constraintViolations!.soft)
    return
  }
  error.value = apiError.message
}
```

Widok nie wie, że pod spodem jest axios — dostaje gotowy, domenowo nazwany wynik.

---

## Krok 5 — Dowód izolacji + before/after

### Dowód: wymiana biblioteki dotyka tylko ACL

Gdyby jutro trzeba było zastąpić axios (np. natywnym `fetch`), zmianie ulegają wyłącznie:
1. `src/shared/composables/useApi.ts` — rekonstrukcja instancji/interceptorów na nowym kliencie.
2. `src/shared/http/apiError.ts` (`isAxiosError`, `fromUnknown`'s branch odczytujący `e.response`) — nowy kształt błędu klienta HTTP.

Nie ulegają zmianie: `stays.api.ts`, `stays.store.ts`, `CreateStay.vue`, `StayDetail.vue`, żaden inny moduł `api/*.ts` (bo już dziś nie importują axiosa — zweryfikowane w Kroku 1), żadna tabela/schema IndexedDB, żaden kontrakt wire (`ConstraintViolationResponse` pozostaje typem domenowym, niezależnym od klienta HTTP).

### Before/after zduplikowanych miejsc

| Miejsce | Before | After |
|---|---|---|
| `CreateStay.vue:13,91-98,117-123` | `import { AxiosError } from 'axios'`; lokalna `isConstraintViolation`; `if (e instanceof AxiosError && e.response?.status === 422)` | `import { ApiError } from '@/shared/http/apiError'`; `const apiError = ApiError.fromUnknown(e); if (apiError.isConstraintViolation) {...}` |
| `StayDetail.vue:11,78-85,96-99` | identyczna duplikacja jak wyżej | identyczne wywołanie `ApiError.fromUnknown(e)` — zero duplikacji, bo logika żyje w jednym miejscu |
| `stays.api.ts:18-24` | brak zmian koniecznych — cienki wrapper HTTP, poprawnie nie zna domeny błędu | bez zmian (już jest "cienki" zgodnie z zasadą Kroku 4 planu poprzedniego dokumentu) |
| `stays.store.ts:83-94` | przepuszcza surowe odrzucenie axiosa | (opcjonalnie, faza 3) może przepuszczać `ApiError` zamiast surowego `unknown`, jeśli chcemy, by Store był miejscem tłumaczenia zamiast View — patrz "otwarte pytanie" niżej |

**Widok dostaje gotowe dane domenowe, nie surowy obiekt biblioteki**: po refaktorze żaden `.vue` w repo nie importuje `axios` ani nie odwołuje się do `e.response`/`e.response.data` — jedyny odczyt tego kształtu odbywa się wewnątrz `ApiError.fromUnknown`.

### Otwarte pytanie rozstrzygnięte na podstawie kontraktu axiosa

**Pytanie**: gdzie dokładnie powinno nastąpić tłumaczenie — w Store czy w View? Axios sam w sobie nie narzuca odpowiedzi (to decyzja architektoniczna tego repo, nie biblioteki), ale kontrakt axiosa **narzuca**, że `error.response` może być `undefined` (błąd sieciowy/timeout nie ma odpowiedzi) — co oznacza, że tłumaczenie musi obsłużyć ten przypadek jawnie (branch `NETWORK` w `ApiError.fromUnknown`), inaczej `e.response.data` rzuci wyjątek wtórny (`Cannot read properties of undefined`) zamiast czytelnego błędu. Dzisiejszy kod (`CreateStay.vue:117`, `StayDetail.vue:96`) już to pośrednio zakłada przez `e.response?.status` (optional chaining), ale **nie obsługuje** gałęzi "błąd sieciowy" — po prostu wpada w ogólny `catch`-fallback z komunikatem `e.message`, co przypadkiem działa, ale nieświadomie.

**Decyzja i gdzie ją zakodować**: rozstrzygnięcie ("co zrobić, gdy `e.response` jest `undefined`") należy zakodować **w ACL (`ApiError.fromUnknown`), nie w warstwie API ani w widoku** — właśnie dlatego, że to jest wiedza o kontrakcie biblioteki HTTP (axios nie gwarantuje `response` przy błędzie sieci), a nie wiedza domenowa czy prezentacyjna. Widok dostaje już gotowy `ApiError{kind: 'NETWORK'}` i może np. pokazać komunikat "sprawdź połączenie" zamiast generycznego `e.message`.

---

## Krok 6 — Weryfikacja i plan

### Kryterium sukcesu

`grep -rn "from 'axios'" src` powinno po refaktorze zwrócić **wyłącznie**:
- `src/shared/composables/useApi.ts` (instancja + interceptory — istniejący, legalny właściciel)
- `src/shared/http/apiError.ts` (jedyne miejsce ACL, które zna `AxiosError`/`e.response`)
- pliki `*.spec.ts` testujące bezpośrednio `apiError.ts` (konstruowanie `AxiosError` w teście ACL jest legalne i pożądane — to test adaptera)

### Pliki, które dziś znają axios → po refaktorze

| Plik | Dziś zna axios? | Po refaktorze |
|---|---|---|
| `src/shared/composables/useApi.ts` | Tak (właściciel) | Tak (bez zmian) |
| `src/shared/http/apiError.ts` | — (nowy plik) | Tak (nowy jedyny ACL) |
| `src/modules/stays/views/CreateStay.vue` | **Tak** (`AxiosError` import, linia 13) | **Nie** — importuje tylko `ApiError` |
| `src/modules/stays/views/StayDetail.vue` | **Tak** (`AxiosError` import, linia 11) | **Nie** — importuje tylko `ApiError` |
| `src/modules/stays/views/CreateStay.spec.ts` | Tak (konstruuje `AxiosError` do testu) | Nie — mockuje `ApiError` bezpośrednio albo testuje przez `apiError.spec.ts` |
| `src/modules/stays/api/stays.api.ts` i pozostałe `api/*.ts` | Nie (już dziś czyste) | Bez zmian |
| `src/modules/stays/store/stays.store.ts` | Nie (już dziś nie importuje axiosa, tylko przepuszcza błąd) | Bez zmian albo (opcjonalnie) zaczyna zwracać `ApiError` zamiast `unknown` |

### Plan faz (zgodny z konwencją `/10x-implement` tego projektu)

1. **Faza 1 — ACL (implement, nie TDD-first ze względu na charakter mapowania I/O)**: utworzyć `src/shared/http/apiError.ts` z `ApiError`/`ApiErrorKind`/`fromUnknown`, przenosząc logikę z `isConstraintViolation` (obu kopii) do jednego miejsca. Testy jednostkowe współlokowane jako `apiError.spec.ts` (wzorzec `*.spec.ts` z `CLAUDE.md`) — przypadki: 422+`CONSTRAINT_VIOLATION` shape → `kind='CONSTRAINT_VIOLATION'`; 422+inny shape → `kind='UNKNOWN'`; 401 → `kind='UNAUTHORIZED'`; brak `e.response` → `kind='NETWORK'`; `e` nie jest `AxiosError` → `kind='UNKNOWN'`.
2. **Faza 2 — Przepięcie `CreateStay.vue`**: usunąć lokalny `isConstraintViolation` i import `AxiosError`; zastąpić `ApiError.fromUnknown(e)`. Zaktualizować `CreateStay.spec.ts`, by nie importował `AxiosError` z `axios`, tylko konstruował/mockował `ApiError` bezpośrednio.
3. **Faza 3 — Przepięcie `StayDetail.vue`** (analogicznie do Fazy 2).
4. **Faza 4 — Weryfikacja końcowa**: `grep -rn "from 'axios'" src` — potwierdzić, że wynik pasuje wyłącznie do listy z sekcji "Kryterium sukcesu"; `npm run lint && npm run typecheck && npm test` (gates z `CLAUDE.md`/CI).
5. **Faza 5 (opcjonalna, osobna decyzja produktowa)**: rozważyć, czy `Kandydat B` (`qrcode`/`jsqr`) zasługuje na własny ACL w kolejnej iteracji — poza zakresem tego planu (odrzucony w Kroku 2 jako słabszy sygnał), ale odnotowany jako kolejny kandydat, gdyby `qrcode`/`jsqr` trzeba było kiedyś wymienić (np. zgodność z iOS Safari).

---

## Podsumowanie

Ten plan identyfikuje `axios`/`AxiosError` jako najgorszy przeciek zależności w repo: pakiet HTTP-klienta, którego jedynym zadeklarowanym właścicielem ma być `useApi.ts` (`CLAUDE.md:105`, `AGENTS.md:14-15`), jest bezpośrednio importowany w dwóch widokach (`CreateStay.vue:13`, `StayDetail.vue:11`), które dodatkowo utrzymują bajt-w-bajt identyczną funkcję `isConstraintViolation` do ręcznego rozpakowania kształtu odpowiedzi backendu z `e.response.data`. Wybrałem ten przeciek nad alternatywnym kandydatem (`qrcode`/`jsqr`, również zduplikowanym w warstwie UI) głównie dlatego, że tylko ten pierwszy spełnia wszystkie trzy sygnały z briefu jednocześnie — wiele warstw, zduplikowana logika, i jawny udokumentowany rozjazd między regułą repo a kodem. Diagnoza pokazuje, że warstwa Store (`stays.store.ts`) nie pełni swojej architektonicznej roli pośrednika i po prostu przepuszcza surowe odrzucenie Promise z axiosa, przez co Widok stał się jedynym miejscem interpretującym błąd domenowy. Projekt wprowadza `ApiError` jako jedyny value object znający kształt odpowiedzi biblioteki i backendu, z metodą fabryczną `ApiError.fromUnknown()` jako wąskim portem/adapterem — cała reszta aplikacji importuje wyłącznie `ApiError`, nigdy `axios`. Otwarte pytanie o obsługę błędu sieciowego (`e.response === undefined`) rozstrzygnięto na podstawie samego kontraktu axiosa i celowo zakodowano decyzję wewnątrz ACL, nie w warstwie API ani UI. Kryterium sukcesu jest w pełni mechanicznie weryfikowalne: `grep` po `from 'axios'` po refaktorze powinien trafiać wyłącznie w `useApi.ts` i nowy plik ACL.
