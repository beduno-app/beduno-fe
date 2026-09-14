# Mapa repozytorium — beduno-fe

Synteza `artifact-1-territory.md`, `artifact-2-structure.md`, `artifact-3-contributors.md`
(2026-09-14). Krótka i decyzyjna — pełne dowody w artefaktach źródłowych, tu tylko
konkluzje i rekomendacje.

## W jednym zdaniu

Solo/AI-assisted SPA po jednym dużym przepisaniu (2026-04-14, Options→Vite/Pinia/moduły),
obecnie w fazie E2E hardeningu trzech strumieni testowych; jedyny realny dług architektoniczny
to nieplanowany cykl `ops ↔ arrivals/inhouse`, który sam w sobie działa, ale jego jeden
udokumentowany skutek (trwałość conflict inbox) jest otwartym, ocenionym ryzykiem, a nie
plotką.

## Architektura — gdzie co żyje

| Warstwa | Plik/moduł | Rola |
|---|---|---|
| Bootstrap | `src/main.ts`, `src/app/router/index.ts`, `app/plugins/{pinia,i18n}.ts` | Cienka (3 pliki), zero logiki biznesowej |
| Centrum #1 | `src/shared/composables/useApi.ts` | Jedyna instancja axios + refresh 401; importowana przez wszystkie 10 modułów |
| Centrum #2 | `src/modules/auth/store/auth.store.ts` | Sesja/rola — czytana przez router guard, oba layouty, interceptor, i **3 obce widoki bezpośrednio** |
| UI | `BaseButton.vue` (27 użyć) | Dominujący prymityw; `DataTable` (1 użycie) wygląda na nieprzyjęty — do sprawdzenia, czy moduły ręcznie klepią tabele |
| Offline | `ops` + `shared/services/{db,offlineDb,actionQueue}.ts` | Jeden podsystem rozstrzelony między `modules/ops` a `shared/services/` — patrz niżej |

**Aktywne moduły (60 dni)**: `stays`, `arrivals`, `inhouse` (16/13/10 dotknięć) — trzy strumienie
E2E (`stay-lifecycle-e2e`, `testing-live-journey-beduno-be`, `testing-conflict-engine-correctness`).
**Stabilne**: `ops` (shell, 2 dotknięcia/60d), `admin` (0 od 2026-04-14), `public/` (PWA shell).
**Martwe**: `src/views/`, `src/features/`, `src/components/`, `src/auth/`, `src/router/` —
0 commitów od cutoveru 2026-04-14 (204+90+27+14+15 dotknięć historycznie, teraz nieużywane).

## Jedyny realny cykl: `ops ↔ arrivals` / `ops ↔ inhouse`

- **Co**: `sync.store.ts` woła `arrivalsApi`/`inhouseApi` (replay kolejki offline);
  `arrivals.store.ts`/`inhouse.store.ts` wołają z powrotem `useSyncStore` (licznik kolejki).
  Runtime, nie type-only — realne sprzężenie.
- **Skąd się wzięło**: krawędź w przód powstała w jednej sesji `sonnet-4.6` w dniu przepisania
  (2026-04-14, `92789b9`) jako świadomy silnik replay. Krawędź powrotna domknęła cykl **4
  miesiące później** (`opus-5`, `ee19f04`, 2026-08-09) jako wąska poprawka UX ("odśwież licznik
  kolejki"), bez żadnej wzmianki o sprzężeniu modułów. Nikt nigdy nie nazwał tego cyklem — 
  `artifact-2-structure.md` jest pierwszym dokumentem w historii repo, który to robi.
- **Werdykt**: mechanizm offline — celowy i sensowny. Sam cykl — zbieżność, nie decyzja.
  `ops` strukturalnie zachowuje się jak `shared/` (brak `views`/`types`, `docs/should-be/architecture.md`
  poznał moduł `ops` dopiero po fakcie), więc żyje pod złą ścieżką, nie że nie powinien istnieć.
- **Skutek uboczny**: reguła CLAUDE.md "nie sięgaj do store'a innego modułu z widoku" jest łamana
  w **6+ miejscach** (`auth.store` ×3, `workers.store` ×2, `properties.store` ×2, `ops.store`,
  `sync.store` ×2) — cykl jest tylko najostrzejszym przypadkiem szerszego wzorca, nie wyjątkiem.

## Decyzje do podjęcia (z rekomendacją)

1. **Trwałość conflict inbox (Risk #3, `test-plan.md`, Faza 3 — `not started`).**
   `sync.store.ts`'s `conflicts` to `ref<SyncConflict[]>([])` — czysto w pamięci; odrzucona
   akcja znika po reloadzie bez śladu w `db.ts`. To jedyne nazwane, ocenione (High impact /
   Medium likelihood) ryzyko na tym cyklu, dziś nieplanowane do realizacji.
   **Rekomendacja**: podnieś priorytet Fazy 3 rollout planu — to nie jest hipotetyczny dług,
   to udokumentowana luka z konkretnym mechanizmem utraty danych.

2. **`ops` żyje pod `modules/`, ale funkcjonuje jak `shared/`.**
   Zero dokumentu w repo traktuje to jako decyzję do obrony — architektura doszła do tego po
   fakcie (`docs/should-be/architecture.md`).
   **Rekomendacja**: albo formalnie zapisz `ops` jako wyjątek od reguły "moduły niezależne"
   w CLAUDE.md (z uzasadnieniem: wspólna infrastruktura offline), albo rozważ przesunięcie
   `sync.store.ts`/`ops.store.ts` do `shared/services/` obok `db.ts`/`actionQueue.ts`, gdzie
   reszta tego podsystemu już mieszka. Status quo (cichy wyjątek) jest gorszy niż obie
   alternatywy — nowa osoba/sesja AI nie ma jak się domyślić, że `ops` to celowy wyjątek.

3. **Dowód na żywo dla ścieżki `ops → arrivals`.**
   `context/changes/arrival-day-proven/plan.md` (untracked, `planned`, 0/7 checked) dokładnie
   to scopuje, ale zablokowany na provisioning sekretów/fixture — ten sam bloker co
   `testing-live-journey-beduno-be` i `stay-lifecycle-e2e`.
   **Rekomendacja**: jeden ticket poza sesją AI — provisioning `E2E_TEST_*` sekretów jako
   `PROPERTY_ADMIN` odblokowuje trzy zawieszone strumienie naraz, nie tylko ten.

4. **Martwy kod sprzed przepisania** (`src/views/`, `src/features/`, `src/components/`,
   `src/auth/`, `src/router/`) — 0 commitów od 5 miesięcy, ~350 historycznych dotknięć.
   **Rekomendacja**: usuń albo jawnie oznacz jako archiwalne (np. przenieś pod `legacy/` z
   README). Trzymanie w `src/` kosztuje każdą przyszłą sesję AI czas na odróżnienie
   żywego kodu od martwego.

5. **`DataTable` (1 użycie) vs. reszta `Base*`** — słaby sygnał, ale tani do sprawdzenia:
   czy moduły ręcznie renderują listy zamiast używać wspólnego komponentu.
   **Rekomendacja**: nie priorytet sam w sobie — sprawdź przy najbliższej okazji dotykania
   listy/tabeli, nie osobnym zadaniem.

## Co NIE wymaga uwagi teraz

- `ops` jako shell, `admin`, `public/` — stabilne, niska częstotliwość zmian, brak sygnałów ryzyka.
- Rozbieżność kształtu modułów od wzorca CLAUDE.md (`admin`/`exports` bez store, `ops` bez
  `views`/`types`) — płytka, uzasadniona brakiem realnej potrzeby, nie bałagan.
- `workers ↔ stays` "cykl" — wygląda jak cykl w gołym oku, ale jedna krawędź jest `import type`
  (usuwana przy buildzie) — nie jest to prawdziwe sprzężenie runtime.

## Źródła

- `context/map/artifact-1-territory.md` — historia zmian, aktywne/martwe obszary
- `context/map/artifact-2-structure.md` — zależności, entry pointy, cykl, centra grawitacji
- `context/map/artifact-3-contributors.md` — chronologia decyzji za cyklem `ops↔arrivals/inhouse`
