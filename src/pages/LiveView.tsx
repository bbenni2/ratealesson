import { useMemo, useState } from 'react'
import { Header } from '../components/Header'
import { CurrentLessonCard } from '../components/CurrentLessonCard'
import { LessonCard } from '../components/LessonCard'
import { RatingModal } from '../components/RatingModal'
import { EmptyState } from '../components/EmptyState'
import { ListSkeleton } from '../components/Skeleton'
import { NotConfiguredBanner } from '../components/NotConfiguredBanner'
import { useNow } from '../hooks/useNow'
import { useRatings } from '../hooks/useRatings'
import { useStudentConfig } from '../hooks/useStudentConfig'
import { summaryByLesson } from '../lib/ratings'
import { getCurrentState, isRatable, lessonKey } from '../lib/schedule'
import { hasRated } from '../lib/localRatings'
import { formatTime } from '../lib/format'
import type { LessonInstance } from '../types'

export function LiveView() {
  const now = useNow(1000)
  const { ratings, loading, error } = useRatings()
  const { config } = useStudentConfig()
  const [selected, setSelected] = useState<LessonInstance | null>(null)

  const { current, next, today } = useMemo(
    () => getCurrentState(now, config.courses),
    [now, config.courses],
  )
  const summaries = useMemo(() => summaryByLesson(ratings), [ratings])

  // Restliche Stunden (ohne die aktuelle), für die Tagesliste.
  const rest = today.filter((l) => l.period !== current?.period)

  return (
    <div className="space-y-5">
      <Header now={now} />

      {error === 'not-configured' && <NotConfiguredBanner />}

      {/* Aktuelle Stunde / Hero */}
      <section>
        {current ? (
          <CurrentLessonCard
            lesson={current}
            summary={summaries.get(lessonKey(current))}
            now={now}
            rated={hasRated(lessonKey(current))}
            onRate={() => setSelected(current)}
          />
        ) : next ? (
          <NextUp lesson={next} now={now} />
        ) : (
          <EmptyState
            emoji={today.length ? '🏁' : '🌴'}
            title={today.length ? 'Unterricht vorbei' : 'Heute kein Unterricht'}
            hint={
              today.length
                ? 'Für heute war’s das – du kannst die Stunden unten trotzdem noch bewerten.'
                : 'Genieß den freien Tag! Schau im Verlauf vorbei, um ältere Stunden zu bewerten.'
            }
          />
        )}
      </section>

      {/* Heutige Stunden */}
      <section>
        <div className="mb-2.5 flex items-center justify-between">
          <h2 className="font-display text-sm font-bold uppercase tracking-wide text-white/50">
            Heute
          </h2>
          {today.length > 0 && (
            <span className="text-xs text-white/35">{today.length} Stunden</span>
          )}
        </div>

        {loading && error !== 'not-configured' ? (
          <ListSkeleton rows={5} />
        ) : rest.length === 0 && !current ? (
          <EmptyState emoji="📭" title="Keine weiteren Stunden" />
        ) : (
          <div className="space-y-2.5">
            {rest.map((lesson) => {
              const key = lessonKey(lesson)
              return (
                <LessonCard
                  key={key}
                  lesson={lesson}
                  summary={summaries.get(key)}
                  ratable={isRatable(lesson, now)}
                  rated={hasRated(key)}
                  onClick={() => setSelected(lesson)}
                />
              )
            })}
          </div>
        )}
      </section>

      {selected && (
        <RatingModal lesson={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  )
}

/** Kleine Karte für „als Nächstes" wenn gerade Pause/vor dem Unterricht ist. */
function NextUp({ lesson, now }: { lesson: LessonInstance; now: Date }) {
  const minsTo = Math.round((lesson.startsAt.getTime() - now.getTime()) / 60000)
  return (
    <div className="card flex items-center gap-3 p-5 animate-fade-in">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-bg-elevated text-3xl">
        {lesson.emoji ?? '📘'}
      </div>
      <div className="flex-1">
        <p className="text-xs font-bold uppercase tracking-wider text-accent-soft">
          Als Nächstes
        </p>
        <h2 className="font-display text-xl font-bold">{lesson.subject}</h2>
        <p className="text-sm text-white/50">
          ab {formatTime(lesson.startsAt)}
          {minsTo > 0 ? ` · in ${minsTo} min` : ''}
        </p>
      </div>
    </div>
  )
}
