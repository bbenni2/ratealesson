import type { Period } from '../types'

// ════════════════════════════════════════════════════════════
//  SCHULSTUNDEN / GLOCKENZEITEN
//  Österreichisches Schema: 1. Stunde ab 07:55, je ~45 Min,
//  mit Pausen dazwischen.
//
//  👉 Wenn an deiner Schule andere Zeiten gelten, passe hier
//     einfach start/end an. "HH:mm" im 24h-Format.
// ════════════════════════════════════════════════════════════

export const PERIODS: Period[] = [
  { period: 1, start: '07:55', end: '08:45' },
  { period: 2, start: '08:45', end: '09:35' },
  // große Pause 09:35–09:50
  { period: 3, start: '09:50', end: '10:40' },
  { period: 4, start: '10:40', end: '11:30' },
  // Pause 11:30–11:40
  { period: 5, start: '11:40', end: '12:30' },
  { period: 6, start: '12:30', end: '13:20' },
  // Mittagspause 13:20–13:50
  { period: 7, start: '13:50', end: '14:40' },
  { period: 8, start: '14:40', end: '15:30' },
  { period: 9, start: '15:30', end: '16:20' },
  { period: 10, start: '16:20', end: '17:10' },
]

/** Schnelles Nachschlagen einer Period anhand ihrer Nummer. */
export const PERIOD_BY_NUMBER: Record<number, Period> = Object.fromEntries(
  PERIODS.map((p) => [p.period, p]),
)
