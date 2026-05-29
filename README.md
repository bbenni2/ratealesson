# ⭐ Rate a Lesson

### 👉 Live-Website: **https://bbenni2.github.io/ratealesson/**

Eine kleine Web-App, mit der deine Klasse **anonym** jede Unterrichtsstunde mit
1–5 Sternen (plus optionalem Kommentar) bewerten kann. Die App kennt euren
Stundenplan, zeigt **live**, welche Stunde gerade läuft, und aktualisiert die
Bewertungen in Echtzeit.

- 📺 **Live** – aktuelle Stunde mit Countdown, nächste Stunde, Ø-Sterne pro Stunde
- 🏆 **Stats** – Rangliste der Fächer nach Schnitt, filterbar nach Zeitraum
- 🕘 **Verlauf** – die letzten 30 Tage, nachträglich bewertbar (bis 5 Tage nach Beginn)
- 🎓 **Eigene Kurse** – jede:r trägt seine Sprach-/Wahlpflichtkurse selbst ein; sie
  erscheinen zur richtigen Zeit im Live-Plan. Man bewertet nur die eigenen Stunden,
  sieht aber **alle** Bewertungen.
- 🏫 **Klasse wählen** – 7B jetzt, 8B später; Bewertungen sind pro Klasse getrennt.
- ⭐ **Halbe Sterne** (1,0 – 5,0) + **Kommentare** mit angezeigtem Sternwert.
- 🔒 Komplett **anonym**, kein Login

Gebaut mit React + Vite + TypeScript, Tailwind CSS, Supabase (DB + Realtime),
React Router und date-fns (deutsche Lokalisierung).

---

## 🚀 Schnellstart

### 1. Voraussetzungen
- [Node.js](https://nodejs.org/) 18 oder neuer
- Ein kostenloses [Supabase](https://supabase.com/)-Projekt

### 2. Abhängigkeiten installieren
```bash
npm install
```

### 3. Supabase einrichten
1. Auf [supabase.com](https://supabase.com/) ein neues Projekt erstellen.
2. Im Dashboard zu **SQL Editor → New query** gehen.
3. Den Inhalt von [`supabase/migrations/0001_create_ratings.sql`](supabase/migrations/0001_create_ratings.sql)
   einfügen und auf **Run** klicken. Das legt die Tabelle `ratings` an, setzt die
   Sicherheitsregeln (jede:r darf lesen & bewerten, aber nichts löschen) und
   aktiviert **Realtime**.
4. Danach **ein zweites Mal**: New query → Inhalt von
   [`supabase/migrations/0002_courses_classes_halfstars.sql`](supabase/migrations/0002_courses_classes_halfstars.sql)
   einfügen → **Run**. Das ergänzt Klasse (`class_code`), Kurs-Code (`course_code`)
   und stellt auf **halbe Sterne** um. (Idempotent – kann gefahrlos laufen.)

### 4. Umgebungsvariablen setzen
```bash
cp .env.example .env
```
Dann in `.env` die zwei Werte eintragen. Du findest sie im Supabase-Dashboard
unter **Project Settings → API**:

```env
VITE_SUPABASE_URL=https://deinprojekt.supabase.co
VITE_SUPABASE_ANON_KEY=dein-anon-public-key
```

> ⚠️ Nutze den **anon public** Key – **niemals** den `service_role` Key im Frontend!

### 5. Loslegen
```bash
npm run dev
```
Die App läuft dann auf <http://localhost:5173>.

---

## ✏️ Stundenplan bearbeiten

> **Wichtig:** Hier kommen nur die **gemeinsamen** Stunden rein, die die ganze
> Klasse zusammen hat. Variable Kurse (Italienisch/Latein/Spanisch, Religion/Ethik,
> Wahlpflicht …) gehören **nicht** in diese Datei – die trägt jede:r Schüler:in
> selbst in der App ein (siehe [Kurse & Klassen](#-kurse--klassen)).

Du brauchst nur **eine Datei**:

### 📄 [`src/config/timetable.ts`](src/config/timetable.ts)

Hier steht der Wochenplan, ein Tag nach dem anderen. Die Wochentage sind:

| Zahl | Tag        |
|------|------------|
| `1`  | Montag     |
| `2`  | Dienstag   |
| `3`  | Mittwoch   |
| `4`  | Donnerstag |
| `5`  | Freitag    |

Jede Stunde ist ein Eintrag, z. B.:

```ts
{ period: 1, subject: 'Mathematik', teacher: 'Mag. Huber', room: 'B204', emoji: '📐' },
```

- `period` – Stundennummer (1, 2, 3 …). Muss zu einer Stunde in den Glockenzeiten passen.
- `subject` – Fach **(Pflicht)**.
- `teacher`, `room`, `emoji` – alles **optional**. Einfach weglassen, wenn nicht gebraucht.

Stunden, die es an einem Tag nicht gibt, lässt du einfach weg. Frei? Dann
leere Liste: `1: [],`

Ganz unten in der Datei kannst du auch den **Klassennamen** ändern:
```ts
export const CLASS_NAME = '4B'
```

### 🔔 Glockenzeiten ändern

Die Uhrzeiten der Stunden stehen in
[`src/config/periods.ts`](src/config/periods.ts). Voreingestellt ist das
österreichische Schema (1. Stunde ab **07:55**, je ~45 Min, mit Pausen).
Passe einfach `start` und `end` an – Format `"HH:mm"` im 24-Stunden-Format.

---

## 🎓 Kurse & Klassen

### Eigene Kurse (macht jede:r Schüler:in selbst)
Beim **ersten Öffnen** der App wählt man seine Klasse und kann seine Kurse anlegen
(Name, Lehrkraft, Tag, ab welcher Stunde, 1 oder 2 Stunden = Doppelstunde). Später
jederzeit über das **Zahnrad oben rechts → Einstellungen** änderbar. Alles bleibt
**nur auf dem Gerät** (localStorage), komplett anonym.

Damit Bewertungen desselben Kurses zusammenlaufen, sollten alle den Kurs **gleich
benennen**. Dafür gibt es Auto-Vorschläge – die pflegst du in
[`src/config/classes.ts`](src/config/classes.ts) unter `COURSE_SUGGESTIONS`:

```ts
export const COURSE_SUGGESTIONS = [
  { name: 'Italienisch', teacher: 'GS' },
  { name: 'Latein', teacher: 'FS' },
  { name: 'Spanisch', teacher: 'MK' },
  // … beliebig erweitern
]
```

### Klassen
In derselben Datei stehen die wählbaren Klassen. Nächstes Jahr einfach ergänzen:

```ts
export const CLASSES = ['7B', '8B'] as const
```

Bewertungen verschiedener Klassen werden über die Spalte `class_code` getrennt –
7B und 8B kommen sich also nie in die Quere.

---

## ⏱️ Wie funktioniert das Bewerten?

- Eine Stunde kann **ab Stundenbeginn** und bis zu **5 Tage danach** bewertet werden.
- Pro Gerät kann jede Stunde **nur einmal** bewertet werden (gespeichert im
  `localStorage` des Browsers).
- Nach Ablauf der 5 Tage zeigt die App nur noch die abgegebenen Bewertungen
  (Lese-Ansicht).

> Das Fenster lässt sich in [`src/lib/schedule.ts`](src/lib/schedule.ts) über
> `RATING_WINDOW_DAYS` ändern.

---

## 📁 Projektstruktur

```
rate-a-lesson/
├── public/
│   └── star.svg                 # Favicon
├── src/
│   ├── config/
│   │   ├── timetable.ts         # 👈 GEMEINSAMER STUNDENPLAN
│   │   ├── periods.ts           # 👈 Glockenzeiten
│   │   └── classes.ts           # 👈 Klassen + Kurs-Vorschläge
│   ├── components/              # UI-Bausteine (Karten, Modal, Nav, CourseEditor …)
│   ├── pages/
│   │   ├── LiveView.tsx         # Startseite / Live-Dashboard
│   │   ├── StatsView.tsx        # Rangliste
│   │   ├── HistoryView.tsx      # Verlauf der letzten 30 Tage
│   │   ├── Onboarding.tsx       # Erst-Einrichtung (Klasse + Kurse)
│   │   └── SettingsView.tsx     # Einstellungen (Zahnrad)
│   ├── hooks/                   # useNow, useRatings, useToast, useStudentConfig
│   ├── lib/
│   │   ├── supabase.ts          # Supabase-Client
│   │   ├── ratings.ts           # DB-Zugriffe + Aggregationen
│   │   ├── schedule.ts          # Plan-Logik (Plan + eigene Kurse zusammenführen)
│   │   ├── courseCode.ts        # stabiler Code je Kurs (für gemeinsame Ratings)
│   │   ├── localRatings.ts      # Doppel-Bewertung verhindern
│   │   └── format.ts            # Datums-/Zeit-Formatierung (de)
│   ├── types.ts                 # zentrale TypeScript-Typen
│   ├── App.tsx                  # Routing + Provider + Onboarding-Gate
│   └── main.tsx                 # Einstiegspunkt
├── supabase/
│   └── migrations/
│       ├── 0001_create_ratings.sql
│       └── 0002_courses_classes_halfstars.sql
├── .env.example
└── vercel.json
```

---

## 📱 Am Handy nutzen (iOS & Android)

Die App ist für Handys gebaut (Bottom-Navigation, große Tap-Flächen, Bottom-Sheet
zum Bewerten). Damit es sich wie eine echte App anfühlt:

- **iOS (Safari):** Seite öffnen → **Teilen-Symbol** → **„Zum Home-Bildschirm"**.
  Startet dann randlos im Vollbild (eigenes Icon, dunkle Statusleiste).
- **Android (Chrome):** Menü **⋮** → **„App installieren"** bzw. **„Zum
  Startbildschirm hinzufügen"**.

Technisch dafür schon erledigt: Web-App-Manifest, Apple-Touch-Icon,
`viewport-fit=cover` + Safe-Areas (Notch/Home-Indicator), und Eingabefelder mit
16px (verhindert das nervige Auto-Zoom von iOS beim Antippen).

---

## ☁️ Deployment (Vercel)

1. Projekt zu GitHub pushen.
2. Auf [vercel.com](https://vercel.com/) **New Project** → das Repo importieren.
   Vercel erkennt Vite automatisch (`vercel.json` ist schon dabei).
3. Unter **Settings → Environment Variables** die beiden Variablen aus deiner
   `.env` eintragen:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. **Deploy** klicken – fertig. 🎉

---

## 🛠️ Befehle

| Befehl            | Was es macht                          |
|-------------------|---------------------------------------|
| `npm run dev`     | Entwicklungsserver starten            |
| `npm run build`   | Produktions-Build erstellen           |
| `npm run preview` | Den Build lokal ansehen               |
| `npm run lint`    | TypeScript-Typen prüfen               |

---

Viel Spaß beim Bewerten! ⭐
