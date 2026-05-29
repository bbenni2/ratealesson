import { de } from 'date-fns/locale'
import { format, formatDistanceToNowStrict } from 'date-fns'

/** "Mo, 29. Mai" */
export function formatDayLabel(date: Date): string {
  return format(date, 'EEE, d. MMMM', { locale: de })
}

/** "07:55" */
export function formatTime(date: Date): string {
  return format(date, 'HH:mm', { locale: de })
}

/** "vor 3 Minuten" */
export function formatRelative(iso: string): string {
  return formatDistanceToNowStrict(new Date(iso), {
    locale: de,
    addSuffix: true,
  })
}

/** Sekunden -> "MM:SS" für den Countdown. */
export function formatCountdown(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds))
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

/** Schnitt schön: 4.3 (oder "–" bei 0 Bewertungen). */
export function formatAverage(avg: number, count: number): string {
  if (count === 0) return '–'
  return avg.toFixed(1)
}
