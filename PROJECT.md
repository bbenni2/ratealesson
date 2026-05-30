# PROJECT.md — Entwickler-Handbuch für „Rate a Lesson"

> Diese Datei ist der Einstieg für alle, die am Projekt weiterarbeiten
> (z. B. Claude Sonnet). Sie erklärt **was** die App ist, **wie** sie aufgebaut
> ist, **wo** was liegt und **was als Nächstes** ansteht. Stand: Mai 2026.

---

## 1. Was ist das?

Eine mobile-first Web-App, mit der eine Schulklasse **anonym** jede
Unterrichtsstunde mit **1–5 Sternen (halbe erlaubt)** + optionalem Kommentar
bewertet. Die App kennt den Stundenplan, zeigt **live** die aktuelle Stunde mit
Countdown und alle Schnitte in **Echtzeit** (Supabase Realtime).

- **Sprache der UI:** komplett **Deutsch, österreichisch, informell („du")**.
- **Kein Login**, voll anonym. Persönliche Einstellungen liegen nur lokal
  (localStorage).
- **Live-Website:** https://bbenni2.github.io/ratealesson/
- **Repo:** https://github.com/bbenni2/ratealesson

---

## 2. Tech-Stack

| Bereich      | Technologie |
|--------------|-------------|
| Framework    | React 18 + TypeScript |
| Build        | Vite 5 |
| Styling      | Tailwind CSS 3 (Dark Theme, Akzent Violett→Fuchsia) |
| Fonts        | Space Grotesk (Display) + Outfit (Body) — via Google Fonts in `index.html` |
| Routing      | React Router 6 |
| Datum/Zeit   | date-fns (deutsche Locale `de`) |
| Backend      | Supabase (Postgres + Row Level Security + Realtime) |
| Hosting      | GitHub Pages via GitHub Actions |

---

## 3. So startest du lokal

```bash
npm install
cp .env.example .env      # dann die zwei Supabase-Werte eintragen
npm run dev               # http://localhost:5173
```

Build & Typecheck:
```bash
npm run build             # tsc --noEmit + vite build
npm run lint              # nur Typecheck
```

> Ohne `.env` startet die App trotzdem und zeigt einen „Supabase fehlt"-Banner
> (siehe `src/lib/supabase.ts` → `isSupabaseConfigured`). Praktisch zum
> UI-Entwickeln ohne Backend.

---

## 4. Architektur / Kernидee

Es gibt **zwei Quellen** für den Stundenplan, die zusammengeführt werden:

1. **Gemeinsamer Plan** (`src/config/timetable.ts`) — Stunden, die die ganze
   Klasse zusammen hat (Mathe, Physik …). Vom Betreiber gepflegt.
2. **Persönliche Kurse** (localStorage pro Gerät) — Sprachen, Religion/Ethik,
   Wahlpflicht. Jede:r trägt selbst ein (Fach + Tag + Stunde + Dauer).

`src/lib/schedule.ts` → `lessonsForDate(date, courses)` mergt beide zu
`LessonInstance[]` mit echten Uhrzeiten.

**Bewertungs-Regeln:**
- Bewertbar ab Stundenbeginn bis **5 Tage** danach (`RATING_WINDOW_DAYS`).
- Man kann **nur eigene Stunden** bewerten (gemeinsame + selbst angelegte Kurse),
  sieht aber **alle** Bewertungen.
- **Doppel-Bewertung** pro Gerät verhindert via localStorage
  (`src/lib/localRatings.ts`).
- **Halbe Sterne**: `stars` ist `numeric(2,1)` (1.0–5.0 in 0,5-Schritten).

**Identität einer Bewertung** (damit parallele Kurse nicht vermischen):
`(class_code, lesson_date, period, course_code)`.
- `course_code = null` → gemeinsame Stunde (alle teilen denselben Topf).
- sonst `courseCodeFrom(name, teacher)` (slug, z. B. `italienisch-gs`) →
  alle, die denselben Kurs eintragen, landen im selben Topf.
  Siehe `src/lib/courseCode.ts`.

**Klassen-Trennung:** `class_code` (z. B. „7B"). Ratings werden pro Klasse
geladen/gefiltert. Nächste Klasse einfach in `src/config/classes.ts` ergänzen.

**State-Provider** (in `src/App.tsx` verschachtelt):
`ToastProvider` → `StudentConfigProvider` → `RatingsProvider` → `Shell`.
- `useStudentConfig` — Klasse + persönliche Kurse + Onboarding-Flag (localStorage).
- `useRatings` — lädt Ratings der aktuellen Klasse + Realtime-INSERT-Stream.
- `useToast` — Toast-Notifications.
- `Shell` zeigt `Onboarding`, solange `!config.onboarded`, sonst die Routen.

---

## 5. Dateistruktur

```
src/
├── config/
│   ├── timetable.ts     # GEMEINSAMER Stundenplan (pro Wochentag)
│   ├── periods.ts       # Glockenzeiten (Start/Ende je Stunde)
│   └── classes.ts       # CLASSES, DEFAULT_CLASS, COURSE_SUGGESTIONS (Fach-Chips)
├── components/
│   ├── Header.tsx           # Logo, Klasse, Datum, Zahnrad → /einstellungen
│   ├── BottomNav.tsx        # Tab-Bar Live / Stats / Verlauf
│   ├── CurrentLessonCard.tsx# animierte „läuft gerade"-Karte + Countdown
│   ├── LessonCard.tsx       # Listen-Karte einer Stunde (mit Ø-Sternen)
│   ├── RatingModal.tsx      # Bewerten + Kommentare-Ansicht (Bottom-Sheet)
│   ├── CourseEditor.tsx     # Kurse hinzufügen (Fach-Chips + Tag/Stunde/Dauer)
│   ├── StarRating.tsx       # StarDisplay (halbe) + StarInput (halbe, Klick-Hälften)
│   ├── ToastViewport.tsx, Skeleton.tsx, EmptyState.tsx,
│   ├── NotConfiguredBanner.tsx, icons.tsx
├── hooks/
│   ├── useStudentConfig.tsx # Klasse + Kurse (localStorage), Onboarding
│   ├── useRatings.tsx       # Ratings laden + Realtime
│   ├── useToast.tsx, useNow.ts
├── lib/
│   ├── supabase.ts      # Client + isSupabaseConfigured
│   ├── ratings.ts       # fetch/insert + Aggregationen (summary, leaderboard)
│   ├── schedule.ts      # Plan+Kurse → LessonInstance, current/next, Fenster
│   ├── courseCode.ts    # Name(+Lehrer) → stabiler slug
│   ├── localRatings.ts  # Doppel-Bewertung-Sperre
│   └── format.ts        # Datums-/Zeit-Format (de), Countdown
├── pages/
│   ├── LiveView.tsx     # Startseite: aktuelle/nächste Stunde + heutige Liste
│   ├── StatsView.tsx    # Fächer-Rangliste, Zeitraum-Filter
│   ├── HistoryView.tsx  # letzte 30 Tage, Filter, nachträglich bewertbar
│   ├── SettingsView.tsx # Klasse + Kurse verwalten (/einstellungen)
│   └── Onboarding.tsx   # Erst-Start: Tutorial → Klasse → Kurse
├── types.ts             # zentrale Typen
├── App.tsx, main.tsx, index.css, vite-env.d.ts
supabase/migrations/
├── 0001_create_ratings.sql                 # Tabelle + RLS + Realtime
└── 0002_courses_classes_halfstars.sql      # class_code, course_code, halbe Sterne
.github/workflows/deploy.yml                # Build + Deploy auf GitHub Pages
```

---

## 6. Datenbank (Supabase)

**Verbundenes Projekt:** `https://vrcumhtjmajtznxputrc.supabase.co`
(Region West EU/Ireland). Die Migrationen `0001` + `0002` sind dort ausgeführt.

Tabelle `public.ratings`:
| Spalte       | Typ            | Notiz |
|--------------|----------------|-------|
| id           | uuid           | PK |
| created_at   | timestamptz    | default now() |
| class_code   | text           | z. B. „7B" |
| lesson_date  | date           | yyyy-MM-dd |
| period       | int            | Stundennummer |
| subject      | text           | Snapshot des Fachs |
| course_code  | text NULL      | null = gemeinsame Stunde |
| stars        | numeric(2,1)   | 1.0–5.0 in 0,5-Schritten |
| comment      | text NULL      | max 200 Zeichen |
| nickname     | text NULL      | max 40 Zeichen |

**RLS:** alle (`anon`) dürfen `select` + `insert`, **kein** update/delete.
**Realtime:** Tabelle ist in `supabase_realtime` Publication.

Bei Schema-Änderungen: neue Datei `supabase/migrations/000X_….sql` anlegen und im
Supabase SQL-Editor ausführen (oder per CLI). Migrationen idempotent halten.

---

## 7. Deployment (GitHub Pages)

- Workflow `.github/workflows/deploy.yml` baut bei jedem Push auf `main` und
  deployed auf GitHub Pages. Live in ~1 Minute.
- **Base-Pfad:** Pages läuft unter `/ratealesson/`. Gesetzt via
  `VITE_BASE=/ratealesson/` im Workflow → `vite.config.ts` (`base`).
  React-Router nutzt `basename={import.meta.env.BASE_URL}` (`src/main.tsx`).
  Lokal/Vercel ist `base = '/'`.
- **SPA-Fallback:** Workflow kopiert `dist/index.html` → `dist/404.html`, damit
  Deep-Links (z. B. /verlauf) die App laden.
- **Supabase-Creds im Build:** kommen aus **Repo-Variablen**
  (Settings → Secrets and variables → Actions → *Variables*):
  `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`. Sind gesetzt.
  Der verwendete Key ist ein **publishable Key** (`sb_publishable_…`) — das neue
  öffentliche Supabase-Key-Format, client-seitig sicher.

Manuell neu deployen: GitHub → Actions → „Deploy auf GitHub Pages" → Run workflow.

---

## 8. Den Stundenplan / die Konfiguration pflegen

- **Gemeinsame Fächer:** `src/config/timetable.ts` (pro Wochentag `1`–`5`).
  Nur Stunden, die ALLE haben. Sprachen/Religion/Wahlpflicht NICHT hierher.
- **Glockenzeiten:** `src/config/periods.ts` (aktuell 11 Stunden, 07:45-Start,
  Mittagspause 13:15–13:45).
- **Klassen + Fach-Vorschläge:** `src/config/classes.ts`
  - `CLASSES` (nächstes Jahr `['7B','8B']`)
  - `COURSE_SUGGESTIONS` = die antippbaren Fach-Chips im Kurs-Editor (Name +
    feste Lehrkraft). Aktuell: Italienisch/GS, Latein/FS, Spanisch/MK,
    Religion/DIR, Ethik/MS.

Nach jeder Änderung `git push` → Live-Seite aktualisiert sich automatisch.

---

## 9. Stand & offene Punkte (TODO)

**Erledigt:**
- Live/Stats/Verlauf/Settings, Onboarding mit Mini-Tutorial.
- Halbe Sterne, Kommentare mit angezeigtem Sternwert.
- Persönliche Kurse (vereinfachtes Chip-UI), Klassen-Trennung, Realtime.
- Mobile-Optimierung (iOS/Android), PWA (Manifest, Apple-Touch-Icon, Safe-Areas).
- Deployment auf GitHub Pages mit Supabase-Anbindung.
- Vollständiger gemeinsamer Stundenplan (Mo–Fr) aus dem Untis-Plan übernommen.
- Verlauf sortiert Tage neueste-zuerst, Stunden innerhalb eines Tages chronologisch.

**Noch zu prüfen / offen:**
- [ ] **Fach-Kürzel verifizieren** (vom Untis-Plan interpretiert):
  `GWB→Geographie`, `GPB→Geschichte`, `PUP→Psychologie & Philosophie`,
  `DG→Darstellende Geometrie`, `KG→Kunst & Gestaltung` (Fr 3.Std, am
  unsichersten). Bei Bedarf Namen in `timetable.ts` korrigieren.
- [ ] **Supabase-Key-Format**: `@supabase/supabase-js` ist `^2.45.4`. Das neue
  `sb_publishable_`-Format sollte funktionieren; falls beim echten Bewerten ein
  Auth-/Connection-Fehler kommt, supabase-js auf neueste 2.x heben.
- [ ] **Bundle-Größe** ~470 kB (130 kB gzip), v. a. supabase-js. Optional per
  dynamischem Import lazy-laden.
- [ ] Optional: Kurse als „Doppelstunde über mehrere Tage" / mehrere Zeiten in
  einem Schritt anlegen (aktuell pro Eintrag ein Tag+Stunde).
- [ ] Optional: Moderation/Melden von Kommentaren (aktuell keine).

---

## 10. Konventionen

- **Alle UI-Texte auf Deutsch (du-Form, österreichisch).**
- Tailwind-Utility-Klassen; gemeinsame Klassen (`.card`, `.btn-primary` …) in
  `src/index.css` unter `@layer components`.
- Komponenten in TypeScript, funktional, mit Hooks. Strikte TS-Settings.
- Datums-/Zeit-Ausgaben immer über `src/lib/format.ts` (de-Locale).
- Eingabefelder am Handy ≥16px (verhindert iOS-Zoom) — global in `index.css`.
- Commits: kurze deutsche Beschreibung; Co-Author-Footer für KI-Beiträge.
```
Co-Authored-By: Claude <noreply@anthropic.com>
```
