---
change_id: ops-arrival
title: Analiza przepływu ops ↔ arrivals/inhouse (offline sync)
status: researched
created: 2026-09-14
updated: 2026-09-14
archived_at: null
---

## Notes

analiza przepływu w wybranym obszarze

Wybrany obszar (z `context/map/repo-map.md`): jedyny realny cykl `ops ↔ arrivals/inhouse` —
silnik replay kolejki offline (`sync.store.ts`) wołający `arrivalsApi`/`inhouseApi`, oraz
krawędź powrotna `arrivals.store.ts`/`inhouse.store.ts` → `useSyncStore` (licznik kolejki).
