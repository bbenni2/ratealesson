import type { TimetableEntry, Weekday } from '../types'

// ════════════════════════════════════════════════════════════
//  📅  GEMEINSAMER STUNDENPLAN  (für die ganze Klasse gleich)
// ════════════════════════════════════════════════════════════
//
//  Hier kommen NUR die Stunden rein, die ALLE gemeinsam haben
//  (Mathe, Physik, Chemie, …). NICHT hierher gehören:
//    • Sprachen (Italienisch / Latein / Spanisch)
//    • Religion / Ethik
//    • Wahlpflichtfächer
//  Die trägt jede:r selbst in der App ein („Deine Kurse").
//
//  Wochentage: 1=Mo, 2=Di, 3=Mi, 4=Do, 5=Fr.
//  Jede Stunde:
//    period  = Stundennummer (siehe config/periods.ts)
//    subject = Fach (Pflicht)
//    teacher/room/emoji = optional
//
//  ⚠️ Aktuell ist nur MONTAG befüllt (aus dem Stundenplan-Bild).
//     Di–Fr sind noch leer – bitte mit den echten Fächern füllen
//     (oder Bilder schicken, dann ergänze ich sie).
// ════════════════════════════════════════════════════════════

export const TIMETABLE: Record<Weekday, TimetableEntry[]> = {
  // Sonntag
  0: [],

  // Montag
  1: [
    { period: 1, subject: 'Darstellende Geometrie', teacher: 'KR', room: 'INF2', emoji: '📐' },
    { period: 2, subject: 'Darstellende Geometrie', teacher: 'KR', room: 'INF2', emoji: '📐' },
    { period: 5, subject: 'Mathematik', teacher: 'KE', room: 'R7B', emoji: '🔢' },
    { period: 6, subject: 'Physik', teacher: 'KP', room: 'PHS', emoji: '⚛️' },
    { period: 7, subject: 'Chemie', teacher: 'BE', room: 'CHS', emoji: '🧪' },
    // 3. Std = Sprachen · 4. Std = Religion/Ethik · 8./9. Std = Kurse
    //         → das trägt jede:r selbst unter „Deine Kurse" ein.
  ],

  // Dienstag  (noch leer – bitte ergänzen)
  2: [],

  // Mittwoch  (noch leer – bitte ergänzen)
  3: [],

  // Donnerstag  (noch leer – bitte ergänzen)
  4: [],

  // Freitag  (noch leer – bitte ergänzen)
  5: [],

  // Samstag
  6: [],
}

/** Name der Klasse (Fallback). Die aktive Klasse wählt man in der App. */
export const CLASS_NAME = '7B'
