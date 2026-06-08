import { useMemo, useState } from 'react'
import { Header } from '../components/Header'
import { CurrentLessonCard } from '../components/CurrentLessonCard'
import { LessonCard } from '../components/LessonCard'
import { RatingModal } from '../components/RatingModal'
import { CommentsDrawer } from '../components/CommentsDrawer'
import { EmptyState } from '../components/EmptyState'
import { ListSkeleton } from '../components/Skeleton'
import { NotConfiguredBanner } from '../components/NotConfiguredBanner'
import { useNow } from '../hooks/useNow'
import { useRatings } from '../hooks/useRatings'
import { useStudentConfig } from '../hooks/useStudentConfig'
import { ratingsByLesson, summaryByLesson } from '../lib/ratings'
import { getCurrentState, isRatable, lessonKey, toDateKey } from '../lib/schedule'
import { hasRated } from '../lib/localRatings'
import { formatTime } from '../lib/format'
import { eventsForDate, eventTypeLabel, type SchoolEvent } from '../config/events'
import { useNavigate } from 'react-router-dom'
import type { LessonInstance } from '../types'

export function LiveView() {
  const now = useNow(1000)
  const navigate = useNavigate()
  const { ratings, loading, error } = useRatings()
  const { config } = useStudentConfig()
  const [selected, setSelected] = useState<LessonInstance | null>(null)
  const [commentsLesson, setCommentsLesson] = useState<LessonInstance | null>(null)

  const { current, next, today } = useMemo(
    () => getCurrentState(now, config.courses),
    [now, config.courses],
  )
  const summaries      = useMemo(() => summaryByLesson(ratings), [ratings])
  const allByLesson    = useMemo(() => ratingsByLesson(ratings),  [ratings])
  const todayEvents    = useMemo(() => eventsForDate(toDateKey(now)), [now])
  const isFreeDay      = todayEvents.some((e) => e.noLessons)

  /** Anzahl Kommentare (mit Text) für eine konrete Stunde. */
  const commentCountByLesson = useMemo(() => {
    const map = new Map<string, number>()
    for (const [k, rs] of allByLesson) {
      const n = rs.filter((r) => r.comment).length
      if (n > 0) map.set(k, n)
    }
    return map
  }, [allByLesson])

  // Restliche Stunden (ohne die aktuelle), für die Tagesliste.
  const rest = today.filter((l) => l.period !== current?.period)

  return (
    <div className="space-y-5">
      <Header now={now} />

      {error === 'not-configured' && <NotConfiguredBanner />}

      {/* Hinweis: Keine Wahlfächer konfiguriert */}
      {config.courses.length === 0 && !isFreeDay && (
        <button
          onClick={() => navigate('/einstellungen')}
          className="flex w-full items-center gap-3 rounded-2xl border border-accent/25 bg-accent/10 px-4 py-3 text-left transition hover:border-accent/50"
        >
          <span className="text-xl">🎓</span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-accent-soft">Wahlfächer fehlen noch</p>
            <p className="text-xs text-white/50">
              Ital. · Lat. · Span. · Religion · Ethik → Einstellungen
            </p>
          </div>
          <span className="text-white/40">›</span>
        </button>
      )}

      {/* Events des heutigen Tages (Feiertag, Schulreise, …) */}
      {todayEvents.length > 0 && <EventBanner events={todayEvents} />}

      {/* ── Aktuelle Stunde / Hero ────────────────────── */}
      <section>
        {isFreeDay ? (
          <EmptyState
            emoji={todayEvents[0]?.emoji ?? '🏖️'}
            title={todayEvents[0]?.name ?? 'Schulfrei'}
            hint={eventTypeLabel(todayEvents[0]?.type ?? 'feiertag') + ' – genieß den freien Tag!'}
          />
        ) : current ? (
          <div>
            <CurrentLessonCard
              lesson={current}
              summary={summaries.get(lessonKey(current))}
              now={now}
              rated={hasRated(lessonKey(current))}
              onRate={() => setSelected(current)}
            />
            <CommentTrigger
              count={commentCountByLesson.get(lessonKey(current)) ?? 0}
              onClick={() => setCommentsLesson(current)}
            />
          </div>
        ) : next ? (
          <NextUp lesson={next} now={now} />
        ) : (
          <EmptyState
            emoji={today.length ? '🏁' : '🌴'}
            title={today.length ? 'Unterricht vorbei' : 'Heute kein Unterricht'}
            hint={
              today.length
                ? "Für heute war’s das – du kannst die Stunden unten trotzdem noch bewerten."
                : 'Genieß den freien Tag! Schau im Verlauf vorbei, um ältere Stunden zu bewerten.'
            }
          />
        )}
      </section>

      {/* ── Heutige Stunden ──────────────────────────── */}
      {!isFreeDay && (
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
                const cCount = commentCountByLesson.get(key) ?? 0
                return (
                  <div key={key}>
                    <LessonCard
                      lesson={lesson}
                      summary={summaries.get(key)}
                      ratable={isRatable(lesson, now)}
                      rated={hasRated(key)}
                      onClick={() => setSelected(lesson)}
                    />
                    <CommentTrigger
                      count={cCount}
                      onClick={() => setCommentsLesson(lesson)}
                    />
                  </div>
                )
              })}
            </div>
          )}
        </section>
      )}

      {/* ── Modals & Drawer ───────────────────────────── */}
      {selected && (
        <RatingModal lesson={selected} onClose={() => setSelected(null)} />
      )}
      {commentsLesson && (
        <CommentsDrawer
          title={commentsLesson.subject}
          subtitle={`${commentsLesson.period}. Std. · ${formatTime(commentsLesson.startsAt)}–${formatTime(commentsLesson.endsAt)}`}
          ratings={allByLesson.get(lessonKey(commentsLesson)) ?? []}
          onClose={() => setCommentsLesson(null)}
        />
      )}
    </div>
  )
}

// ── Kleine Hilfskomponenten ───────────────────────────────

/** Zeigt „💬 N Kommentare" wenn es welche gibt. */
function CommentTrigger({ count, onClick }: { count: number; onClick: () => void }) {
  if (count === 0) return null
  return (
    <button
      onClick={onClick}
      className="mt-0.5 flex w-full items-center gap-1.5 px-3.5 py-1.5 text-[11px] text-white/40 transition hover:text-white/70 active:text-white/60"
    >
      <span>💬</span>
      <span>
        {count} Kommentar{count !== 1 ? 'e' : ''} ansehen
      </span>
    </button>
  )
}

/** Banner für Feiertage, Ferien, Schulreisen & Veranstaltungen. */
function EventBanner({ events }: { events: SchoolEvent[] }) {
  return (
    <div className="space-y-2">
      {events.map((ev) => (
        <div
          key={ev.date + ev.name}
          className={`flex items-center gap-3 rounded-2xl border px-4 py-3 ${
            ev.type === 'feiertag' || ev.type === 'ferien'
              ? 'border-amber/25 bg-amber/10 text-amber'
              : ev.type === 'schulreise'
                ? 'border-lime/25 bg-lime/10 text-lime'
                : 'border-accent/25 bg-accent/10 text-accent-soft'
          }`}
        >
          <span className="text-2xl">{ev.emoji}</span>
          <div className="min-w-0 flex-1">
            <p className="font-display font-bold leading-tight">{ev.name}</p>
            <p className="text-xs opacity-70">{eventTypeLabel(ev.type)}</p>
          </div>
        </div>
      ))}
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
