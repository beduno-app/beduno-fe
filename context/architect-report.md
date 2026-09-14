---
title: Raport architektoniczny — Moduł 4 (10xArchitect)
created: 2026-09-14
type: architect-report
---

# Raport architektoniczny — 10xArchitect

Synteza czterech artefaktów modułu 4, wszystkie z jednego repozytorium: **beduno-fe** (Vue 3 SPA, TS strict, Pinia, IndexedDB offline, axios/openapi.yaml wobec `beduno-be`). Solo/AI-assisted projekt po jednym dużym przepisaniu (2026-04-14).

## 1. Opisane projekty

| Repo | Stack | Skala | Artefakt |
|---|---|---|---|
| **beduno-fe** | Vue 3 (Composition API), Pinia, vue-router, vue-i18n, IndexedDB (`DB_VERSION=3`), axios, Vitest+Playwright | 10 modułów domenowych (`stays`, `arrivals`, `inhouse`, `ops`, `workers`, `properties`, `audit`, `auth`, `admin`, `exports`) + ~350 historycznych dotknięć martwego kodu sprzed przepisania | L2 (`context/map/repo-map.md`), L3 (`context/changes/ops-arrival/research.md`), L4 (`context/changes/refactor-opportunities/plan.md`), L5 (`context/domain/01-03*.md`) |

Wszystkie cztery artefakty pochodzą z tego samego repo i tego samego dnia (2026-09-14) — brak artefaktów wieloprojektowych do zestawienia.

## 2. Mapa projektu (z L2)

- **Jeden realny cykl w repo**: `ops ↔ arrivals/inhouse` — `sync.store.ts` woła `arrivalsApi`/`inhouseApi` (replay), a `arrivals.store.ts`/`inhouse.store.ts` wołają z powrotem `useSyncStore()`. Krawędź w przód powstała 2026-04-14 (przepisanie), krawędź powrotna dopiero 4 miesiące później jako wąska poprawka UX licznika kolejki — nikt nigdy nie nazwał tego cyklem, dopóki mapa tego nie zrobiła.
- **Centra grawitacji**: `useApi.ts` (jedyna instancja axios, importowana przez wszystkie 10 modułów) i `auth.store.ts` (czytany przez router guard, oba layouty, interceptor, **3 obce widoki bezpośrednio** — łamanie reguły "nie sięgaj do store'a innego modułu z widoku" w 6+ miejscach).
- **Martwy kod**: `src/views/`, `src/features/`, `src/components/`, `src/auth/`, `src/router/` — zero commitów od cutoveru, ~350 dotknięć historycznie, dziś nieużywane.
- **Named, ocenione ryzyko**: trwałość conflict inbox (Risk #3 `test-plan.md`, High/Medium) — `conflicts` to czysty `ref` w pamięci, ginie przy reloadzie. Mapa rekomenduje podniesienie priorytetu tej fazy.
- **Unknown**: czy `ops` powinien formalnie żyć jako wyjątek pod `shared/` — dziś cichy wyjątek, żaden dokument tego nie broni.

## 3. Analiza ficzera (z L3)

**Zbadany przepływ**: silnik offline sync (`sync.store.ts`) + kolejkowanie w `arrivals.store.ts`/`inhouse.store.ts` — bezpośrednio wskazany przez mapę jako jedyny realny cykl repo.

**Feature overview**: Front-desk (`PROPERTY_ADMIN`/`FRONT_DESK`) wykonuje check-in/check-out/move/no-show z PWA. Offline: akcja trafia do `actionQueue` w IndexedDB, UI aktualizuje się optymistycznie (tylko arrivals — inhouse nie). Po powrocie online `OpsLayout.vue`'s `online`-listener uruchamia `syncQueue()`: sukces usuwa wpis z kolejki; odrzucenie trafia do `conflicts` (in-memory Pinia `ref`), nigdy cicho scalane.

**Technical debt (top 3, z ast-grep)**:
1. **Conflict inbox nie przetrwa reloadu** — `sync.store.ts:27` `conflicts` to `ref<SyncConflict[]>([])`; `db.ts` nie ma object store dla konfliktów. Potwierdzone ast-grep (`clearQueue()` — 0 call sites w całym `src/`, potwierdzone też grepem) jako powiązany martwy kod. To Risk #3 z `test-plan.md`.
2. **`actionQueue.ts` bez testów przeciw prawdziwemu IndexedDB** — każdy konsument mockuje cały moduł; kolejność replay (FIFO) nigdy faktycznie zweryfikowana.
3. **Asymetria arrivals vs. inhouse**: `inhouse.store.ts`'s `bulkCheckout` **nie ma sprawdzenia `navigator.onLine` w ogóle** (potwierdzone ast-grep: `navigator.onLine` — 0 trafień w liniach 83-87), mimo realnej ścieżki UI (`RoomCard.vue`'s `toggle-select` → bulk check-out).

## 4. Plan refaktoryzacji (z L4)

**Co refaktoryzowane**: Candidate 1 z rankingu researchu — trwałość conflict inbox. Docelowy kształt: nowy IndexedDB object store `conflicts` (`keyPath: 'id'`, `DB_VERSION` 3→4), sibling service `conflicts.ts` mirrorujący wzorzec `actionQueue.ts`, `sync.store.ts` przechodzi na async/IDB-backed `dismissConflict(id)`/`clearConflicts()`/`hydrateConflicts()`.

**Czego świadomie NIE robimy**: Candidates 2-4, 6 z researchu (placement `ops`, cross-module store reach-ins, asymetria inhouse/arrivals, `DataTable` adoption); dodanie client-side audit-log dla dismissal/clear (wymagałoby nowego endpointu backendu); czekanie na `arrival-day-proven`'s E2E secrets (plan zastępuje to manualną weryfikacją).

**Fazy** (auto = automated, man = manual):
1. Test infra `fake-indexeddb` + `vitest.setup.ts` — auto (typecheck/lint/test).
2. Schema `conflicts` store, `DB_VERSION`→4 — auto + man (DevTools inspekcja).
3. `conflicts.ts` CRUD service + usunięcie `clearQueue()` — auto (+ grep na `clearQueue`).
4. `sync.store.ts` przechodzi na async/IDB — auto.
5. `sync.store.spec.ts` przepisany przeciw realnemu IndexedDB, nowe testy "conflict durability" — auto.
6. `ConflictInbox.vue` wiring (hydration on mount, id-based dismiss) + manualna weryfikacja end-to-end (reload, DevTools, dismiss+reload) — auto + man, **pauza na ludzkie potwierdzenie**.

## 5. Domena wg DDD (z L5)

**Ubiquitous language (kluczowe pojęcia)**: *Stay* (datowane przypisanie Worker→Property/Room/Bed, flat ID), *Propose→Confirm* (agency proponuje, property potwierdza — nigdy nadpisania), *Conflict Inbox/"Needs review"* (nigdy cichy auto-merge), *Constraint (Hard/Soft)* (egzekwowane tylko backendowo), *AuditEvent* (actor+before/after+timestamp).

**Najważniejsze rozjazdy model-vs-kod**: (1) `prd.md` mówi "brak bytu Bed" — kod ma pełny `Bed` (adnotowane w CLAUDE.md jako "Superseded", tu dokument jest przestarzały, nie kod); (2) router dopuszcza `PROPERTY_ADMIN` na `StayCreate`, mimo że `roles-and-permissions.md` sam nazywa to known-gap wobec Hard Rule "Propose→confirm"; (3) `AuditEvent` w kodzie trzyma `previousState`/`newState` jako całe obiekty, dokument obiecuje field-level diff.

**Niezmiennik #1 i agregat**: "Sync Conflict Resolution" (I1+I2+I3 połączone: nigdy nie gub/nie scalaj cicho, ownership po stronie konfliktu, state-snapshot z momentu zakolejkowania — FR-018/FR-019 `prd.md`, oznaczone tam jako *resolved*, w kodzie **kompletnie nieegzekwowane**). Należy do projektowanego agregatu `OfflineSyncAction` (status `PENDING→SYNCED|NEEDS_REVIEW→RESOLVED`, nazwane błędy: `NotConflictOwnerError`, `MissingAuditEventError` itd.), zastępującego dzisiejszy podział `QueuedAction`(IndexedDB)/`SyncConflict`(RAM) jednym bytem w jednym object store dla atomowości.

**Anti-Corruption Layer**: przeciekająca zależność to `axios`/`AxiosError` — przez **3 warstwy** (Service `useApi.ts` jako legalny właściciel, View ×2 `CreateStay.vue`/`StayDetail.vue` z bajt-w-bajt zduplikowaną `isConstraintViolation()`, plus test), jawnie łamiąc udokumentowaną intencję centralizacji (`CLAUDE.md:105`/`AGENTS.md:14-15`). Projekt: value object `ApiError` z `ApiError.fromUnknown(e)` jako jedynym miejscem znającym kształt axiosa.

## 6. Decyzje, które należą do mnie

AI (research + plan skille) zaproponowało konkretny, w pełni cytowany diagnostyczny obraz długu i trzy alternatywne projekty refaktoru (durability, propose→confirm authority, ACL) — ale to człowiek zdecydował, **który** z trzech kandydatów L5 (ConflictInbox #1 wg rankingu domenowego) faktycznie trafił do implementowalnego planu L4, zawężając scope świadomie do "tylko Candidate 1" i odkładając propose→confirm authority (mimo że to Hard Rule #1) jako wciąż otwartą decyzję produktową w PRD, a nie lukę do naprawy teraz. Decyzja o **przejściu do implementacji bez czekania na `arrival-day-proven`'s E2E secrets** (substytuując manualną weryfikację) jest świadomym kompromisem ryzyka, nie czymś co AI mogło rozstrzygnąć samodzielnie — to wybór właściciela produktu między szybkością a mocniejszym dowodem. Zakres agregatu `OfflineSyncAction` z L5 (pełny, wymagający nowego endpointu backendu) został w L4 świadomie **nie** przyjęty w całości — plan L4 realizuje tylko warstwę trwałości (Candidate 1), zostawiając ownership/audit/state-snapshot (I2/I3/I4 z L5) jako przyszłą, osobną decyzję zależną od zespołu backendu.
