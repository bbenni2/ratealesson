import type { TimetableEntry, Weekday } from '../types'

// ════════════════════════════════════════════════════════════
//  📅  STUNDENPLAN  –  HIER BEARBEITEST DU DEINEN PLAN
// ════════════════════════════════════════════════════════════
//
//  Aufbau: pro Wochentag eine Liste von Stunden.
//  Wochentage:  1 = Montag, 2 = Dienstag, 3 = Mittwoch,
//               4 = Donnerstag, 5 = Freitag.
//  (0 = Sonntag, 6 = Samstag – normalerweise leer.)
//
//  Jede Stunde:
//    period   = Stundennummer (muss zu config/periods.ts passen)
//    subject  = Fach (Pflicht)
//    teacher  = Lehrkraft  (optional)
//    room     = Raum       (optional)
//    emoji    = Emoji      (optional, nur Deko)
//
//  Die unten stehenden Fächer sind PLATZHALTER – einfach
//  überschreiben. Stunden, die es nicht gibt, weglassen.
//
//  ⚠️ WICHTIG seit der Kurs-Funktion:
//  Hier kommen NUR die Stunden rein, die die GANZE Klasse
//  gemeinsam hat. Variable Slots (Sprachen wie Italienisch/
//  Latein/Spanisch, Religion/Ethik, Wahlpflicht …) gehören
//  NICHT hierher – die trägt jede:r selbst in der App unter
//  „Einstellungen → Deine Kurse" ein. So sieht jede:r den
//  eigenen Plan und bewertet nur die eigenen Stunden.
// ════════════════════════════════════════════════════════════

export const TIMETABLE: Record<Weekday, TimetableEntry[]> = {
  // Sonntag
  0: [],

  // Montag
  1: [
    { period: 1, subject: 'Mathematik', teacher: 'Mag. Huber', room: 'B204', emoji: '📐' },
    { period: 2, subject: 'Deutsch', teacher: 'Mag. Bauer', room: 'B204', emoji: '📚' },
    { period: 3, subject: 'Englisch', teacher: 'Mag. Gruber', room: 'B204', emoji: '🇬🇧' },
    { period: 4, subject: 'Geschichte', teacher: 'Mag. Wagner', room: 'B204', emoji: '🏛️' },
    { period: 5, subject: 'Biologie', teacher: 'Mag. Pichler', room: 'NW1', emoji: '🧬' },
    { period: 6, subject: 'Bewegung & Sport', teacher: 'Mag. Steiner', room: 'TH', emoji: '⚽' },
  ],

  // Dienstag
  2: [
    { period: 1, subject: 'Englisch', teacher: 'Mag. Gruber', room: 'B204', emoji: '🇬🇧' },
    { period: 2, subject: 'Mathematik', teacher: 'Mag. Huber', room: 'B204', emoji: '📐' },
    { period: 3, subject: 'Physik', teacher: 'Mag. Mayr', room: 'NW2', emoji: '⚛️' },
    { period: 4, subject: 'Geografie', teacher: 'Mag. Wimmer', room: 'B204', emoji: '🌍' },
    { period: 5, subject: 'Religion', teacher: 'Mag. Moser', room: 'B204', emoji: '✝️' },
    { period: 6, subject: 'Bildnerische Erziehung', teacher: 'Mag. Lang', room: 'BE', emoji: '🎨' },
  ],

  // Mittwoch
  3: [
    { period: 1, subject: 'Deutsch', teacher: 'Mag. Bauer', room: 'B204', emoji: '📚' },
    { period: 2, subject: 'Deutsch', teacher: 'Mag. Bauer', room: 'B204', emoji: '📚' },
    { period: 3, subject: 'Mathematik', teacher: 'Mag. Huber', room: 'B204', emoji: '📐' },
    { period: 4, subject: 'Chemie', teacher: 'Mag. Reiter', room: 'NW3', emoji: '🧪' },
    { period: 5, subject: 'Informatik', teacher: 'Mag. Holzer', room: 'EDV1', emoji: '💻' },
    { period: 6, subject: 'Informatik', teacher: 'Mag. Holzer', room: 'EDV1', emoji: '💻' },
  ],

  // Donnerstag
  4: [
    { period: 1, subject: 'Geschichte', teacher: 'Mag. Wagner', room: 'B204', emoji: '🏛️' },
    { period: 2, subject: 'Englisch', teacher: 'Mag. Gruber', room: 'B204', emoji: '🇬🇧' },
    { period: 3, subject: 'Mathematik', teacher: 'Mag. Huber', room: 'B204', emoji: '📐' },
    { period: 4, subject: 'Physik', teacher: 'Mag. Mayr', room: 'NW2', emoji: '⚛️' },
    { period: 5, subject: 'Musikerziehung', teacher: 'Mag. Berger', room: 'MU', emoji: '🎵' },
    { period: 6, subject: 'Bewegung & Sport', teacher: 'Mag. Steiner', room: 'TH', emoji: '🏀' },
  ],

  // Freitag
  5: [
    { period: 1, subject: 'Biologie', teacher: 'Mag. Pichler', room: 'NW1', emoji: '🧬' },
    { period: 2, subject: 'Geografie', teacher: 'Mag. Wimmer', room: 'B204', emoji: '🌍' },
    { period: 3, subject: 'Deutsch', teacher: 'Mag. Bauer', room: 'B204', emoji: '📚' },
    { period: 4, subject: 'Englisch', teacher: 'Mag. Gruber', room: 'B204', emoji: '🇬🇧' },
    { period: 5, subject: 'Mathematik', teacher: 'Mag. Huber', room: 'B204', emoji: '📐' },
  ],

  // Samstag
  6: [],
}

/** Name der Klasse – erscheint im Header. Frei anpassbar. */
export const CLASS_NAME = '4B'
