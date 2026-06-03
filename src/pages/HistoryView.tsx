import { useMemo, useState } from 'react'
import { addDays, parseISO } from 'date-fns'
import { useNow } from '../hooks/useNow'
import { useRatings } from '../hooks/useRatings'
import { useStudentConfig } from '../hooks/useStudentConfig'
import { summaryByLesson } from '../lib/ratings'
import { isRatable, lessonKey, pastLessons, toDateKey } from '../lib/schedule'
import { hasRated } from '../lib/localRatings'
import { formatDayLabel } from '../lib/format'
import { eventsForDate, eventTypeLabel, type SchoolEvent } from '../config/events'
import { LessonCard } from '../components/LessonCard'
import { RatingModal } from '../components/RatingModal'
import { EmptyState } from '../components/EmptyState'
import { ListSkeleton } from '../components/Skeleton'
import { NotConfiguredBanner } from '../components/NotConfiguredBanner'
import { TIMETABLE } from '../config/timetable'
import type { LessonInstance } from '../types'

const HISTORY_DAYS = 30

export function HistoryView() {
  const now = useNow(60000)
  const { ratings, loading, error } = useRatings()
  const { config } = useStudentConfig()
  const [selected, setSelected] = useState<LessonInstance | null>(null)
  const [subject, setSubject] = useState<string>('')
  const [onlyRatable, setOnlyRatable] = useState(false)

  // Fächer für den Filter: gemeinsame Stunden + Wahlfächer
  const allSubjects = useMemo(() => {
    const fromPlan = Object.values(TIMETABLE).flatMap((day) => day.map((e) => e.subject))
    const fromCourses = config.courses.map((c) => c.name)
    return Array.from(new Set([...fromPlan, ...fromCourses])).sort((a, b) =>
      a.localeCompare(b, 'de'),
    )
  }, [config.courses])

  const summaries = useMemo(() => summaryByLesson(ratings), [ratings])

  const lessons = useMemo(
    () => pastLessons(now, config.courses, HISTORY_DAYS),
    [now, config.courses],
  )

  const filtered = useMemo(() => {
    return lessons.filter((l) => {
      if (subject && l.subject !== subject) return false
      if (onlyRatable && !isRatable(l, now)) return false
      return true
    })
  }, [lessons, subject, onlyRatable, now])

  // Gruppen: neueste Tage zuerst. Jede Gruppe enthält Stunden + Events.
  // Auch schulfreie Tage (Feiertage, Ferien, …) werden eingeblendet.
  const grouped = useMemo(() => {
    // Lesson-Map aus den gefilterten Stunden
    const lessonMap = new Map<string, LessonInstance[]>()
    for (const l of filtered) {
      const arr = lessonMap.get(l.date) ?? []
      arr.push(l)
      lessonMap.set(l.date, arr)
    }

    // Alle Tage der letzten HISTORY_DAYS Tage (neueste zuerst)
    const result: Array<{ date: string; lessons: LessonInstance[]; events: SchoolEvent[] }> = []
    for (let i = 0; i < HISTORY_DAYS; i++) {
      const d = addDays(now, -i)
      if (d > now) continue
      const dateStr = toDateKey(d)
      const dayLessons = (lessonMap.get(dateStr) ?? []).sort(
        (a, b) => a.startsAt.getTime() - b.startsAt.getTime(),
      )
      const dayEvents = eventsForDate(dateStr)

      // Zeige den Tag nur, wenn er Stunden oder Events hat
      if (dayLessons.length > 0 || dayEvents.length > 0) {
        result.push({ date: dateStr, lessons: dayLessons, events: dayEvents })
      }
    }
    return result
  }, [filtered, now])

  return (
    <div className="space-y-5">
      <header className="pt-safe">
        <h1 className="font-display text-2xl font-bold">Verlauf 🕘</h1>
        <p className="text-sm text-white/40">
          Die letzten {HISTORY_DAYS} Tage – noch nachträglich bewertbar.
        </p>
      </header>

      {error === 'not-configured' && <NotConfiguredBanner />}

      {/* Filter */}
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="flex-1 rounded-xl border border-line bg-bg-card px-3 py-2 text-sm text-white outline-none transition focus:border-accent/60"
        >
          <option value="">Alle Fächer &amp; Wahlfächer</option>
          {allSubjects.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <button
          onClick={() => setOnlyRatable((v) => !v)}
          className={`shrink-0 rounded-xl border px-3 py-2 text-sm font-semibold transition ${
            onlyRatable
              ? 'border-accent/60 bg-accent/15 text-accent-soft'
              : 'border-line bg-bg-card text-white/50 hover:text-white'
          }`}
        >
          ⏳ bewertbar
        </button>
      </div>

      {/* Liste */}
      {loading && error !== 'not-configured' ? (
        <ListSkeleton rows={6} />
      ) : grouped.length === 0 ? (
        <EmptyState
          emoji="🔍"
          title="Nichts gefunden"
          hint="Mit diesen Filtern gibt es keine Stunden. Setz den Filter zurück oder wähle ein anderes Fach."
        />
      ) : (
        <div className="space-y-5">
          {grouped.map(({ date, lessons: dayLessons, events: dayEvents }) => (
            <section key={date}>
              <h2 className="mb-2 px-1 text-xs font-bold uppercase tracking-wide text-white/40">
                {formatDayLabel(parseISO(date))}
              </h2>

              {/* Events des Tages (Feiertag, Ferien, Schulreise …) */}
              {dayEvents.length > 0 && (
                <div className="mb-2 space-y-1.5">
                  {dayEvents.map((ev) => (
                    <div
                      key={ev.name}
                      className={`flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-sm ${
                        ev.type === 'feiertag' || ev.type === 'ferien'
                          ? 'border-amber/20 bg-amber/10 text-amber'
                          : ev.type === 'schulreise'
                            ? 'border-lime/20 bg-lime/10 text-lime'
                            : 'border-accent/20 bg-accent/10 text-accent-soft'
                      }`}
                    >
                      <span className="text-base">{ev.emoji}</span>
                      <span className="font-semibold">{ev.name}</span>
                      <span className="ml-auto text-xs opacity-60">{eventTypeLabel(ev.type)}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Stunden des Tages */}
              {dayLessons.length > 0 && (
                <div className="space-y-2.5">
                  {dayLessons.map((lesson) => {
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
          ))}
        </div>
      )}

      {selected && <RatingModal lesson={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
