import type { LessonInstance, RatingSummary } from '../types'
import { formatTime, formatAverage } from '../lib/format'
import { StarDisplay } from './StarRating'
import { ClockIcon } from './icons'

interface Props {
  lesson: LessonInstance
  summary?: RatingSummary
  /** Ist die Stunde aktuell bewertbar? */
  ratable: boolean
  /** Wurde sie von diesem Gerät schon bewertet? */
  rated: boolean
  onClick: () => void
  /** Optional: Datum mit anzeigen (für Verlauf). */
  showDate?: string
}

export function LessonCard({ lesson, summary, ratable, rated, onClick, showDate }: Props) {
  const count = summary?.count ?? 0
  const avg = summary?.average ?? 0

  return (
    <button
      onClick={onClick}
      disabled={!ratable && count === 0}
      className="card group flex w-full items-center gap-3 p-3.5 text-left transition hover:border-accent/40 active:scale-[0.99] disabled:opacity-60 disabled:hover:border-line"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-bg-elevated text-xl">
        {lesson.emoji ?? '📘'}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate font-display font-semibold text-white">{lesson.subject}</p>
          {rated && (
            <span className="chip shrink-0 bg-lime/15 text-lime">bewertet</span>
          )}
        </div>
        <div className="mt-0.5 flex items-center gap-2 text-xs text-white/45">
          <span className="inline-flex items-center gap-1">
            <ClockIcon width={12} height={12} />
            {formatTime(lesson.startsAt)}–{formatTime(lesson.endsAt)}
          </span>
          <span>·</span>
          <span>{lesson.period}. Std.</span>
          {showDate && (
            <>
              <span>·</span>
              <span>{showDate}</span>
            </>
          )}
        </div>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-1">
        {count > 0 ? (
          <>
            <span className="font-display text-lg font-bold leading-none text-white">
              {formatAverage(avg, count)}
            </span>
            <StarDisplay value={avg} size={11} />
            <span className="text-[10px] text-white/40">{count} Bew.</span>
          </>
        ) : (
          <span className="chip border border-line text-white/40">
            {ratable ? 'bewerten' : '—'}
          </span>
        )}
      </div>
    </button>
  )
}
