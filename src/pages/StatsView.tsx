import { useMemo, useState } from 'react'
import { subDays } from 'date-fns'
import { useNow } from '../hooks/useNow'
import { useRatings } from '../hooks/useRatings'
import {
  statsBySubject,
  statsByTeacher,
  trendByMonth,
  trendByYear,
  summarize,
} from '../lib/ratings'
import { StarDisplay } from '../components/StarRating'
import { TrendChart } from '../components/TrendChart'
import { EmptyState } from '../components/EmptyState'
import { ListSkeleton } from '../components/Skeleton'
import { NotConfiguredBanner } from '../components/NotConfiguredBanner'
import { formatAverage } from '../lib/format'

type Range = 7 | 30 | 90 | 0
type TrendView = 'month' | 'year'

const RANGES: { value: Range; label: string }[] = [
  { value: 7, label: '7 Tage' },
  { value: 30, label: '30 Tage' },
  { value: 90, label: '3 Mon.' },
  { value: 0, label: 'Alle' },
]

const MEDALS = ['🥇', '🥈', '🥉']

export function StatsView() {
  const now = useNow(30000)
  const { ratings, loading, error } = useRatings()
  const [range, setRange] = useState<Range>(30)
  const [trendView, setTrendView] = useState<TrendView>('month')

  // Gefilterte Ratings für Fach-Rangliste
  const filtered = useMemo(() => {
    if (range === 0) return ratings
    const cutoff = subDays(now, range).getTime()
    return ratings.filter((r) => new Date(r.created_at).getTime() >= cutoff)
  }, [ratings, range, now])

  const subjectStats = useMemo(() => statsBySubject(filtered), [filtered])
  const overall = useMemo(() => summarize(filtered), [filtered])
  const maxCount = Math.max(1, ...subjectStats.map((s) => s.count))

  // Lehrer-Rangliste immer auf Basis ALLER geladenen Ratings (All-time)
  const teacherStats = useMemo(() => statsByTeacher(ratings), [ratings])

  // Trend-Daten ebenfalls All-time
  const trendData = useMemo(
    () => (trendView === 'month' ? trendByMonth(ratings, 12) : trendByYear(ratings)),
    [ratings, trendView],
  )

  return (
    <div className="space-y-6">
      <header className="pt-safe">
        <h1 className="font-display text-2xl font-bold">Statistik</h1>
        <p className="text-sm text-white/40">Welche Fächer &amp; Lehrkräfte sind top?</p>
      </header>

      {error === 'not-configured' && <NotConfiguredBanner />}

      {/* ── Range-Tabs ── */}
      <div className="flex gap-1 rounded-xl border border-line bg-bg-card p-1">
        {RANGES.map((r) => (
          <button
            key={r.value}
            onClick={() => setRange(r.value)}
            className={`flex-1 rounded-lg py-1.5 text-xs font-bold tracking-wide transition ${
              range === r.value
                ? 'bg-gradient-to-r from-accent to-accent-glow text-white shadow-glow'
                : 'text-white/45 hover:text-white'
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {loading && error !== 'not-configured' ? (
        <ListSkeleton rows={8} />
      ) : (
        <>
          {/* ── IMDB-Hero-Score ── */}
          {overall.count > 0 && (
            <div className="card overflow-hidden p-0 animate-fade-in">
              {/* Goldener Streifen oben */}
              <div className="h-1 w-full bg-gradient-to-r from-amber/80 via-amber to-amber/60" />
              <div className="flex items-center gap-5 px-5 py-4">
                {/* Score-Block (IMDB-Stil) */}
                <div className="flex flex-col items-center gap-1">
                  <div className="flex items-end gap-0.5 leading-none">
                    <span className="font-display text-5xl font-bold tabular-nums text-amber">
                      {formatAverage(overall.average, overall.count)}
                    </span>
                    <span className="mb-1 font-display text-lg font-semibold text-white/25">/5</span>
                  </div>
                  <StarDisplay value={overall.average} size={13} />
                </div>

                {/* Trennlinie */}
                <div className="h-16 w-px bg-line" />

                {/* Kennzahlen */}
                <div className="flex flex-1 flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/45">Bewertungen</span>
                    <span className="font-display font-bold text-white">{overall.count}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/45">Fächer</span>
                    <span className="font-display font-bold text-white">{subjectStats.length}</span>
                  </div>
                  {/* Amber Fortschrittsbalken */}
                  <div className="h-1.5 overflow-hidden rounded-full bg-bg-elevated">
                    <div
                      className="h-full rounded-full bg-amber transition-[width] duration-700"
                      style={{ width: `${(overall.average / 5) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Trend-Chart ── */}
          <section className="space-y-3 animate-fade-in">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-sm font-bold uppercase tracking-widest text-white/40">
                Trend
              </h2>
              <div className="flex overflow-hidden rounded-lg border border-line">
                {(['month', 'year'] as TrendView[]).map((v) => (
                  <button
                    key={v}
                    onClick={() => setTrendView(v)}
                    className={`px-3 py-1 text-xs font-semibold transition ${
                      trendView === v
                        ? 'bg-accent/20 text-accent-soft'
                        : 'bg-bg-card text-white/40 hover:text-white'
                    }`}
                  >
                    {v === 'month' ? 'Monat' : 'Jahr'}
                  </button>
                ))}
              </div>
            </div>

            <div className="card px-3 py-4">
              <TrendChart data={trendData} />
              <p className="mt-1 text-center text-[10px] text-white/25">
                Ø Bewertung · {trendView === 'month' ? 'letzte 12 Monate' : 'nach Schuljahr'}
              </p>
            </div>
          </section>

          {/* ── Fächer-Rangliste ── */}
          <section className="space-y-3">
            <h2 className="font-display text-sm font-bold uppercase tracking-widest text-white/40">
              Fächer-Rangliste
            </h2>

            {subjectStats.length === 0 ? (
              <EmptyState
                emoji="📊"
                title="Noch keine Daten"
                hint="In diesem Zeitraum gibt es noch keine Bewertungen."
              />
            ) : (
              <div className="space-y-2">
                {subjectStats.map((s, i) => (
                  <div
                    key={s.subject}
                    className="card flex items-center gap-3 p-3.5 animate-fade-in"
                  >
                    {/* Rang */}
                    <div className="w-7 shrink-0 text-center">
                      {MEDALS[i] ? (
                        <span className="text-lg">{MEDALS[i]}</span>
                      ) : (
                        <span className="font-display text-sm font-bold text-white/25">{i + 1}</span>
                      )}
                    </div>

                    {/* Fach */}
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-display font-bold text-white">{s.subject}</p>
                      <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-bg-elevated">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-accent/50 to-accent-glow/60 transition-[width] duration-500"
                          style={{ width: `${(s.count / maxCount) * 100}%` }}
                        />
                      </div>
                      <p className="mt-1 text-[10px] text-white/35">{s.count} Bewertungen</p>
                    </div>

                    {/* Score – IMDB-Stil */}
                    <div className="shrink-0 text-right">
                      <div className="flex items-end justify-end gap-0.5 leading-none">
                        <span className="font-display text-2xl font-bold tabular-nums text-amber">
                          {formatAverage(s.average, s.count)}
                        </span>
                        <span className="mb-0.5 text-[10px] font-semibold text-white/25">/5</span>
                      </div>
                      <StarDisplay value={s.average} size={10} className="mt-1" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ── Lehrer-Rangliste (All-time) ── */}
          {teacherStats.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <h2 className="font-display text-sm font-bold uppercase tracking-widest text-white/40">
                  Lehrkräfte
                </h2>
                <span className="chip border border-amber/30 bg-amber/10 text-amber text-[10px]">
                  All-time
                </span>
              </div>

              <div className="space-y-2">
                {teacherStats.map((t, i) => (
                  <div
                    key={t.teacher}
                    className="card flex items-center gap-3 p-3.5 animate-fade-in"
                  >
                    {/* Lehrer-Avatar */}
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-display text-sm font-bold ${
                        i === 0
                          ? 'bg-amber/20 text-amber shadow-[0_0_16px_-4px_rgba(251,191,36,0.4)]'
                          : i === 1
                            ? 'bg-white/10 text-white/80'
                            : i === 2
                              ? 'bg-accent/15 text-accent-soft'
                              : 'bg-bg-elevated text-white/40'
                      }`}
                    >
                      {t.teacher}
                    </div>

                    {/* Fächer-Liste */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white/25">
                          {MEDALS[i] ?? `#${i + 1}`}
                        </span>
                        <p className="truncate text-sm text-white/60">
                          {t.subjects.join(' · ')}
                        </p>
                      </div>
                      <p className="mt-0.5 text-[10px] text-white/30">{t.count} Bewertungen</p>
                    </div>

                    {/* Score */}
                    <div className="shrink-0 text-right">
                      <div className="flex items-end justify-end gap-0.5 leading-none">
                        <span className="font-display text-2xl font-bold tabular-nums text-amber">
                          {formatAverage(t.average, t.count)}
                        </span>
                        <span className="mb-0.5 text-[10px] text-white/25">/5</span>
                      </div>
                      <StarDisplay value={t.average} size={10} className="mt-1" />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}
