import type { LessonInstance, RatingSummary } from '../types'
import { formatAverage, formatCountdown, formatTime } from '../lib/format'
import { StarDisplay } from './StarRating'

interface Props {
  lesson: LessonInstance
  summary?: RatingSummary
  now: Date
  rated: boolean
  onRate: () => void
}

/** Große, animierte „läuft gerade"-Karte mit Fortschritt & Countdown. */
export function CurrentLessonCard({ lesson, summary, now, rated, onRate }: Props) {
  const total = lesson.endsAt.getTime() - lesson.startsAt.getTime()
  const elapsed = now.getTime() - lesson.startsAt.getTime()
  const remainingSec = (lesson.endsAt.getTime() - now.getTime()) / 1000
  const progress = Math.min(100, Math.max(0, (elapsed / total) * 100))

  const count = summary?.count ?? 0
  const avg = summary?.average ?? 0

  return (
    <div className="relative overflow-hidden rounded-3xl border border-accent/30 bg-gradient-to-br from-accent/15 via-bg-card to-bg-card p-5 shadow-glow-lg animate-pulse-glow">
      {/* dezenter Glanz */}
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-accent-glow/20 blur-3xl" />

      <div className="relative">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-lime opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-lime" />
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-lime">
            Läuft gerade
          </span>
          <span className="ml-auto font-display text-sm font-semibold tabular-nums text-white/70">
            {formatTime(lesson.startsAt)}–{formatTime(lesson.endsAt)}
          </span>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-bg-elevated/80 text-3xl">
            {lesson.emoji ?? '📘'}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="truncate font-display text-2xl font-bold text-white">
              {lesson.subject}
            </h2>
            <p className="truncate text-sm text-white/50">
              {lesson.period}. Stunde
              {lesson.teacher ? ` · ${lesson.teacher}` : ''}
              {lesson.room ? ` · ${lesson.room}` : ''}
            </p>
          </div>
        </div>

        {/* Fortschrittsbalken + Countdown */}
        <div className="mt-5">
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="text-white/50">Noch</span>
            <span className="font-display font-bold tabular-nums text-accent-soft">
              {formatCountdown(remainingSec)} min
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-bg-elevated">
            <div
              className="h-full rounded-full bg-gradient-to-r from-accent to-accent-glow transition-[width] duration-1000 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Schnitt + CTA */}
        <div className="mt-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {count > 0 ? (
              <>
                <span className="font-display text-2xl font-bold text-white">
                  {formatAverage(avg, count)}
                </span>
                <div>
                  <StarDisplay value={avg} size={13} />
                  <p className="text-[11px] text-white/40">{count} Bewertungen</p>
                </div>
              </>
            ) : (
              <p className="text-sm text-white/40">Sei der/die Erste! ✨</p>
            )}
          </div>

          <button onClick={onRate} className="btn-primary" disabled={rated}>
            {rated ? 'Bewertet ✓' : 'Jetzt bewerten'}
          </button>
        </div>
      </div>
    </div>
  )
}
