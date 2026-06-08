import type { TimetableEntry, Weekday } from '../types'

// ════════════════════════════════════════════════════════════
//  📅  GEMEINSAMER STUNDENPLAN  (für die ganze Klasse gleich)
// ════════════════════════════════════════════════════════════
//
//  Hier kommen NUR die Stunden rein, die ALLE gemeinsam haben.
//  NICHT hierher gehören (das sind persönliche Kurse, die jede:r
//  selbst in der App unter „Deine Kurse" einträgt):
//    • Sprachen (Italienisch I4 / Latein LAT4 / Spanisch SPA4)
//    • Religion (RK) / Ethik (ETH)
//    • Wahlpflichtfächer (W_…) und klassenübergreifende Kurse
//
//  Wochentage: 1=Mo, 2=Di, 3=Mi, 4=Do, 5=Fr.
//  Stundennummern siehe config/periods.ts.
//
//  Quelle: Untis-Stundenplan 7B. Einige Fach-Kürzel sind
//  interpretiert (z. B. GWB→Geographie, GPB→Geschichte,
//  PUP→Psychologie & Philosophie, DG→Darstellende Geometrie,
//  KG→Kunst & Gestaltung). Bei Bedarf einfach Namen anpassen.
// ════════════════════════════════════════════════════════════

export const TIMETABLE: Record<Weekday, TimetableEntry[]> = {
  // Sonntag
  0: [],

  // ── Montag ────────────────────────────────────────────────
  1: [
    { period: 1, subject: 'Darstellende Geometrie', teacher: 'KR', room: 'INF2', emoji: '📐' },
    { period: 2, subject: 'Darstellende Geometrie', teacher: 'KR', room: 'INF2', emoji: '📐' },
    { period: 5, subject: 'Mathematik', teacher: 'KE', room: 'R7B', emoji: '🔢' },
    { period: 6, subject: 'Physik', teacher: 'KP', room: 'PHS', emoji: '⚛️' },
    { period: 7, subject: 'Chemie', teacher: 'BE', room: 'CHS', emoji: '🧪' },
    // 3.Std Sprachen · 4.Std Religion/Ethik · 8.Std Italienisch → persönlich
    // 9.–10.Std Sport/Turnen (Doppel, getrennte Gruppen NP/GR) → persönlich
  ],

  // ── Dienstag ──────────────────────────────────────────────
  2: [
    { period: 1, subject: 'Englisch', teacher: 'BE', room: 'R7B', emoji: '🇬🇧' },
    { period: 2, subject: 'Mathematik', teacher: 'KE', room: 'R7B', emoji: '🔢' },
    { period: 3, subject: 'Deutsch', teacher: 'BU', room: 'R7B', emoji: '📚' },
    { period: 4, subject: 'Geographie', teacher: 'LC', room: 'R7B', emoji: '🌍' },
    // 5.Std Italienisch + Wahlpflicht · nachmittags Wahlpflicht → persönlich
  ],

  // ── Mittwoch ──────────────────────────────────────────────
  3: [
    { period: 1, subject: 'Mathematik', teacher: 'KE', room: 'R7B', emoji: '🔢' },
    { period: 3, subject: 'Englisch', teacher: 'BE', room: 'R7B', emoji: '🇬🇧' },
    { period: 4, subject: 'Geschichte', teacher: 'JA', room: 'R7B', emoji: '🏛️' },
    { period: 6, subject: 'Psychologie & Philosophie', teacher: 'ES', room: 'R7B', emoji: '🧠' },
    // 2.Std Sprachen · 5.Std Religion/Ethik · 7.–8.Std Kurs → persönlich
  ],

  // ── Donnerstag ────────────────────────────────────────────
  4: [
    { period: 1, subject: 'Physik', teacher: 'KP', room: 'PHS', emoji: '⚛️' },
    { period: 2, subject: 'Englisch', teacher: 'BE', room: 'R7B', emoji: '🇬🇧' },
    { period: 3, subject: 'Deutsch', teacher: 'BU', room: 'R7B', emoji: '📚' },
    { period: 4, subject: 'Geographie', teacher: 'LC', room: 'R7B', emoji: '🌍' },
    { period: 5, subject: 'Chemie', teacher: 'BE', room: 'R7B', emoji: '🧪' },
    { period: 6, subject: 'Geschichte', teacher: 'JA', room: 'R7B', emoji: '🏛️' },
    // nachmittags Wahlpflicht → persönlich
  ],

  // ── Freitag ───────────────────────────────────────────────
  5: [
    { period: 1, subject: 'Chemie', teacher: 'BE', room: 'CHS', emoji: '🧪' },
    { period: 5, subject: 'Psychologie & Philosophie', teacher: 'ES', room: 'R7B', emoji: '🧠' },
    { period: 6, subject: 'Deutsch', teacher: 'BU', room: 'R7B', emoji: '📚' },
    // 2.Std Sprachen · 3.–4.Std Musik ODER Zeichnen (getrennte Gruppen) → persönlich
  ],

  // Samstag
  6: [],
}

/** Name der Klasse (Fallback). Die aktive Klasse wählt man in der App. */
export const CLASS_NAME = '7B'
