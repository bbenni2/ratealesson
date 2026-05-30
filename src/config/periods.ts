import type { Period } from '../types'

// ════════════════════════════════════════════════════════════
//  SCHULSTUNDEN / GLOCKENZEITEN
//  Exakt nach eurem Stundenplan (mit Mittagspause 13:15–13:45).
//
//  👉 Wenn sich Zeiten ändern, einfach start/end anpassen.
//     Format "HH:mm" im 24h-Format.
// ════════════════════════════════════════════════════════════

export const PERIODS: Period[] = [
  { period: 1, start: '07:45', end: '08:35' },
  { period: 2, start: '08:35', end: '09:25' },
  // kurze Pause 09:25–09:30
  { period: 3, start: '09:30', end: '10:20' },
  // Pause 10:20–10:35
  { period: 4, start: '10:35', end: '11:25' },
  // Pause 11:25–11:30
  { period: 5, start: '11:30', end: '12:20' },
  // Pause 12:20–12:25
  { period: 6, start: '12:25', end: '13:15' },
  // Mittagspause 13:15–13:45
  { period: 7, start: '13:45', end: '14:35' },
  { period: 8, start: '14:35', end: '15:25' },
  { period: 9, start: '15:25', end: '16:15' },
  { period: 10, start: '16:15', end: '17:05' },
  { period: 11, start: '17:05', end: '17:55' },
]

/** Schnelles Nachschlagen einer Period anhand ihrer Nummer. */
export const PERIOD_BY_NUMBER: Record<number, Period> = Object.fromEntries(
  PERIODS.map((p) => [p.period, p]),
)
