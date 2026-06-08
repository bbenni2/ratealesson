// ════════════════════════════════════════════════════════════
//  EVENTS & FEIERTAGE
// ════════════════════════════════════════════════════════════
//
//  Drei Arten von schulfreien / besonderen Tagen:
//  1) Österreichische Feiertage  → automatisch berechnet
//  2) Schulferien OÖ             → jährlich aktualisieren (FERIEN_*)
//  3) Schulautonome Tage / Schulreisen / Veranstaltungen → SPECIAL_DAYS
//
//  👉 Neue Einträge immer in SPECIAL_DAYS (ganz unten) eintragen:
//     { date: 'yyyy-MM-dd', type: 'schulautonom', name: '...', emoji: '🏫', noLessons: true }
//     { date: 'yyyy-MM-dd', type: 'schulreise',   name: 'Wandertag', emoji: '🥾', noLessons: true }
//     { date: 'yyyy-MM-dd', type: 'veranstaltung',name: 'Sporttag',  emoji: '⚽', noLessons: false }
//
//  Mehrere Tage als Range:
//     ...ferien('2026-03-16', '2026-03-20', 'schulreise', 'Skifahrt', '⛷️')
// ════════════════════════════════════════════════════════════

export type EventType = 'feiertag' | 'ferien' | 'schulautonom' | 'schulreise' | 'veranstaltung'

export interface SchoolEvent {
  /** yyyy-MM-dd */
  date: string
  type: EventType
  name: string
  emoji: string
  /**
   * true  → kein Unterricht (Feiertage, Ferien, schulautonome Tage, ganztags Schulreisen)
   * false → Unterricht findet statt (Veranstaltung, halbtägige Schulreise)
   */
  noLessons: boolean
}

// ── Hilfsfunktionen ──────────────────────────────────────────

/** yyyy-MM-dd Datumsstring um n Tage verschieben. */
function shiftDays(dateStr: string, n: number): string {
  const d = new Date(dateStr + 'T12:00:00')
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}

/** Datum als yyyy-MM-dd aus Jahr, Monat (1-12), Tag. */
function ymd(y: number, m: number, d: number): string {
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

/** Date-Objekt → yyyy-MM-dd */
function toStr(d: Date): string {
  return d.toISOString().slice(0, 10)
}

/** Alle Tage von start bis end (inkl.) als SchoolEvent-Array. */
export function ferien(
  start: string,
  end: string,
  type: EventType,
  name: string,
  emoji: string,
  noLessons = true,
): SchoolEvent[] {
  const events: SchoolEvent[] = []
  const s = new Date(start + 'T12:00:00')
  const e = new Date(end + 'T12:00:00')
  const cur = new Date(s)
  while (cur <= e) {
    events.push({ date: toStr(cur), type, name, emoji, noLessons })
    cur.setDate(cur.getDate() + 1)
  }
  return events
}

// ── Österreichische Feiertage ────────────────────────────────

/** Ostersonntag (Gaußscher Algorithmus). */
function easterSunday(year: number): string {
  const a = year % 19
  const b = Math.floor(year / 100)
  const c = year % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m2 = Math.floor((a + 11 * h + 22 * l) / 451)
  const month = Math.floor((h + l - 7 * m2 + 114) / 31)
  const day = ((h + l - 7 * m2 + 114) % 31) + 1
  return ymd(year, month, day)
}

function austrianHolidays(year: number): SchoolEvent[] {
  const e = easterSunday(year)
  return [
    { date: ymd(year, 1, 1),    type: 'feiertag', name: 'Neujahr',               emoji: '🎆', noLessons: true },
    { date: ymd(year, 1, 6),    type: 'feiertag', name: 'Heilige Drei Könige',   emoji: '⭐', noLessons: true },
    { date: shiftDays(e, 1),    type: 'feiertag', name: 'Ostermontag',            emoji: '🐣', noLessons: true },
    { date: ymd(year, 5, 1),    type: 'feiertag', name: 'Staatsfeiertag',         emoji: '🇦🇹', noLessons: true },
    { date: shiftDays(e, 39),   type: 'feiertag', name: 'Christi Himmelfahrt',   emoji: '✝️', noLessons: true },
    { date: shiftDays(e, 50),   type: 'feiertag', name: 'Pfingstmontag',          emoji: '🕊️', noLessons: true },
    { date: shiftDays(e, 60),   type: 'feiertag', name: 'Fronleichnam',           emoji: '✝️', noLessons: true },
    { date: ymd(year, 8, 15),   type: 'feiertag', name: 'Mariä Himmelfahrt',     emoji: '🌸', noLessons: true },
    { date: ymd(year, 10, 26),  type: 'feiertag', name: 'Nationalfeiertag',       emoji: '🇦🇹', noLessons: true },
    { date: ymd(year, 11, 1),   type: 'feiertag', name: 'Allerheiligen',          emoji: '🕯️', noLessons: true },
    { date: ymd(year, 12, 8),   type: 'feiertag', name: 'Mariä Empfängnis',      emoji: '🌸', noLessons: true },
    { date: ymd(year, 12, 25),  type: 'feiertag', name: 'Christtag',              emoji: '🎄', noLessons: true },
    { date: ymd(year, 12, 26),  type: 'feiertag', name: 'Stefanitag',             emoji: '🎄', noLessons: true },
  ]
}

// ── Schulferien OÖ ───────────────────────────────────────────
// 👉 Bei neuem Schuljahr aktualisieren!
// Quelle: https://www.ooe.gv.at/schulen/schulferien

const FERIEN_2025_26: SchoolEvent[] = [
  ...ferien('2025-10-27', '2025-11-01', 'ferien', 'Herbstferien',     '🍂'),
  ...ferien('2025-12-24', '2026-01-05', 'ferien', 'Weihnachtsferien', '🎄'),
  ...ferien('2026-02-02', '2026-02-07', 'ferien', 'Semesterferien',   '⛷️'),
  ...ferien('2026-04-02', '2026-04-11', 'ferien', 'Osterferien',      '🐣'),
  // Pfingstferien gibt es in Österreich (OÖ) nicht – nur der Pfingstmontag
  // ist ein gesetzlicher Feiertag und wird automatisch über austrianHolidays() erfasst.
  ...ferien('2026-07-04', '2026-09-06', 'ferien', 'Sommerferien',     '☀️'),
]

// ── Schulautonome Tage & Schulreisen ─────────────────────────
// 👉 HIER neue Einträge ergänzen!
// Einfache Einzel-Events:
//   { date: 'yyyy-MM-dd', type: 'schulautonom', name: '...', emoji: '🏫', noLessons: true },
//   { date: 'yyyy-MM-dd', type: 'schulreise',   name: '...', emoji: '🚌', noLessons: true },
//
// Mehrtägige Range (z. B. Schulreise über 3 Tage):
//   ...ferien('2026-03-16', '2026-03-18', 'schulreise', 'Skifahrt', '⛷️'),

export const SPECIAL_DAYS: SchoolEvent[] = [
  // Beispiele – Hashtag entfernen und anpassen:
  // { date: '2025-11-03', type: 'schulautonom', name: 'Schulautonomer Tag', emoji: '🏫', noLessons: true },
  // { date: '2026-04-22', type: 'schulreise',   name: 'Wandertag',          emoji: '🥾', noLessons: true },
  // ...ferien('2026-05-04', '2026-05-08', 'schulreise', 'Wien-Exkursion', '🚌'),
]

// ── Öffentliche API ──────────────────────────────────────────

/** Alle Events an einem konkreten Datum (yyyy-MM-dd). */
export function eventsForDate(dateStr: string): SchoolEvent[] {
  const year = parseInt(dateStr.slice(0, 4), 10)
  // Wir laden Feiertage für das aktuelle + das Vorjahr, um den Jahreswechsel abzudecken.
  const allEvents: SchoolEvent[] = [
    ...austrianHolidays(year),
    ...austrianHolidays(year - 1),
    ...FERIEN_2025_26,
    ...SPECIAL_DAYS,
  ]
  // Deduplizieren (gleicher Tag + gleicher Name): Map by date+name
  const seen = new Set<string>()
  return allEvents.filter((e) => {
    if (e.date !== dateStr) return false
    const key = `${e.date}|${e.name}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

/** Ist an diesem Tag kein Unterricht? (Feiertag, Ferien, schulautonom) */
export function isSchoolFreeDay(dateStr: string): boolean {
  return eventsForDate(dateStr).some((e) => e.noLessons)
}

/** Anzeige-Label für einen Event-Typ. */
export function eventTypeLabel(type: EventType): string {
  switch (type) {
    case 'feiertag':     return 'Feiertag'
    case 'ferien':       return 'Ferien'
    case 'schulautonom': return 'Schulautonomer Tag'
    case 'schulreise':   return 'Schulreise'
    case 'veranstaltung':return 'Veranstaltung'
  }
}
