import { useMemo, useState } from 'react'
import { subDays } from 'date-fns'
import { useNow } from '../hooks/useNow'
import { useRatings } from '../hooks/useRatings'
import {
  statsBySubject,
  statsByTeacher,
  summarize,
  trendByMonth,
  trendByYear,
} from '../lib/ratings'
import { teacherName } from '../config/classes'
import { StarDisplay } from '../components/StarRating'
import { TrendChart } from '../components/TrendChart'
import { EmptyState } from '../components/EmptyState'
import { ListSkeleton } from '../components/Skeleton'
import { NotConfiguredBanner } from '../components/NotConfiguredBanner'
import { formatAverage } from '../lib/format'

type Range = 7 | 30 | 0  // 0 = alle
type TrendView = 'month' | 'year'

const RANGES: { value: Range; label: string }[] = [
  { value: 7,  label: '7 Tage' },
  { value: 30, label: '30 Tage' },
  { value: 0,  label: 'Alle' },
]

const MEDALS = ['🥇', '🥈', '🥉']

export function StatsView() {
  const now = useNow(30000)
  const { ratings, loading, error } = useRatings()
  const [range, setRange] = useState<Range>(30)
  const [trendView, setTrendView] = useState<TrendView>('month')

  // Gefiltert nach Zeitraum (für Fächer-Leaderboard)
  const filtered = useMemo(() => {
    if (range === 0) return ratings
    const cutoff = subDays(now, range).getTime()
    return ratings.filter((r) => new Date(r.created_at).getTime() >= cutoff)
  }, [ratings, range, now])

  const stats    = useMemo(() => statsBySubject(filtered), [filtered])
  const overall  = useMemo(() => summarize(filtered), [filtered])
  const maxCount = Math.max(1, ...stats.map((s) => s.count))

  // Lehrer: immer All-time (alle ratings, nicht gefiltert)
  const teachers = useMemo(() => statsByTeacher(ratings), [ratings])

  // Trend-Daten: immer All-time
  const trendData = useMemo(
    () => trendView === 'month' ? trendByMonth(ratings, 12) : trendByYear(ratings),
    [ratings, trendView],
  )

  return (
    <div className="space-y-6">
      <header className="pt-safe">
        <h1 className="font-display text-2xl font-bold">Statistik 📊</h1>
        <p className="text-sm text-white/40">Fächer, Lehrkräfte & Trend auf einen Blick.</p>
      </header>

      {error === 'not-configured' && <NotConfiguredBanner />}

      {/* ── Trend-Chart ─────────────────────────────────── */}
      <section className="card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-sm font-bold uppercase tracking-wide text-white/50">
            Trend
          </h2>
          {/* Monat / Jahr Toggle */}
          <div className="flex overflow-hidden rounded-lg border border-line">
            {(['month', 'year'] as TrendView[]).map((v) => (
              <button
                key={v}
                onClick={() => setTrendView(v)}
                className={`px-3 py-1 text-xs font-semibold transition ${
                  trendView === v
                    ? 'bg-accent text-white'
                    : 'bg-bg-card text-white/45 hover:text-white'
                }`}
              >
                {v === 'month' ? 'Monat' : 'Jahr'}
              </button>
            ))}
          </div>
        </div>

        {ratings.length === 0 ? (
          <p className="py-6 text-center text-sm text-white/30">
            Noch keine Bewertungen vorhanden.
          </p>
        ) : (
          <>
            <TrendChart data={trendData} />
            <p className="text-center text-[10px] text-white/25">
              Ø-Bewertung pro {trendView === 'month' ? 'Monat' : 'Jahr'} · Alle Klassen-Ratings
            </p>
          </>
        )}
      </section>

      {/* ── Zeitraum-Filter ──────────────────────────────── */}
      <div className="flex gap-1.5 rounded-xl border border-line bg-bg-card p-1">
        {RANGES.map((r) => (
          <button
            key={r.value}
            onClick={() => setRange(r.value)}
            className={`flex-1 rounded-lg py-1.5 text-sm font-semibold transition ${
              range === r.value
                ? 'bg-gradient-to-r from-accent to-accent-glow text-white shadow-glow'
                : 'text-white/50 hover:text-white'
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* ── Gesamt-Schnitt ───────────────────────────────── */}
      {overall.count > 0 && (
        <div className="card flex items-center gap-5 p-4 animate-fade-in">
          {/* Score – IMDB-Stil */}
          <div className="text-center">
            <div className="flex items-end gap-1 leading-none">
              <span className="font-display text-4xl font-bold text-amber">
                {formatAverage(overall.average, overall.count)}
              </span>
              <span className="mb-1 font-display text-base text-white/30">/5</span>
            </div>
            <StarDisplay value={overall.average} size={13} className="mt-1.5" />
          </div>
          <div className="h-10 w-px bg-line" />
          <div className="flex-1 space-y-2">
            <StatRow label="Bewertungen" value={String(overall.count)} />
            <StatRow label="Fächer" value={String(stats.length)} />
            {/* Fortschrittsbalken */}
            <div className="h-1.5 overflow-hidden rounded-full bg-bg-elevated">
              <div
                className="h-full rounded-full bg-amber transition-[width] duration-700"
                style={{ width: `${(overall.average / 5) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Fächer-Leaderboard ───────────────────────────── */}
      <section className="space-y-2.5">
        <h2 className="px-1 font-display text-sm font-bold uppercase tracking-wide text-white/50">
          Fächer
        </h2>

        {loading && error !== 'not-configured' ? (
          <ListSkeleton rows={6} />
        ) : stats.length === 0 ? (
          <EmptyState
            emoji="📊"
            title="Noch keine Daten"
            hint="In diesem Zeitraum gibt es noch keine Bewertungen. Geh in die Live-Ansicht und leg los!"
          />
        ) : (
          <div className="space-y-2">
            {stats.map((s, i) => (
              <div key={s.subject} className="card flex items-center gap-3 p-3.5 animate-fade-in">
                {/* Platz */}
                <div className="w-7 shrink-0 text-center font-display text-lg">
                  {MEDALS[i] ?? <span className="text-sm font-bold text-white/30">{i + 1}</span>}
                </div>

                {/* Fach */}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display font-bold">{s.subject}</p>
                  <div className="mt-1 h-1 overflow-hidden rounded-full bg-bg-elevated">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-accent/50 to-accent-glow/50"
                      style={{ width: `${(s.count / maxCount) * 100}%` }}
                    />
                  </div>
                  <p className="mt-0.5 text-xs text-white/40">{s.count} Bewertungen</p>
                </div>

                {/* Score */}
                <div className="shrink-0 text-right">
                  <div className="flex items-end justify-end gap-0.5 leading-none">
                    <span className="font-display text-2xl font-bold text-amber">
                      {formatAverage(s.average, s.count)}
                    </span>
                    <span className="mb-0.5 text-xs text-white/30">/5</span>
                  </div>
                  <StarDisplay value={s.average} size={10} className="mt-1" />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Lehrer-Leaderboard (All-time) ───────────────── */}
      <section className="space-y-2.5">
        <div className="flex items-baseline gap-2 px-1">
          <h2 className="font-display text-sm font-bold uppercase tracking-wide text-white/50">
            Lehrkräfte
          </h2>
          <span className="text-xs text-white/30">All-time</span>
        </div>

        {teachers.length === 0 ? (
          <p className="px-1 text-sm text-white/30">
            {ratings.length === 0
              ? 'Noch keine Bewertungen vorhanden.'
              : 'Keine Lehrkraft-Daten gefunden.'}
          </p>
        ) : (
          <div className="space-y-2">
            {teachers.map((t, i) => (
              <div key={t.teacher} className="card flex items-center gap-3 p-3.5 animate-fade-in">
                {/* Avatar mit Kürzel */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/15 font-display text-xs font-bold text-accent-soft">
                  {t.teacher}
                </div>

                {/* Name + Fächer */}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display font-bold text-sm">
                    {teacherName(t.teacher)}
                  </p>
                  <p className="truncate text-xs text-white/45">
                    {t.subjects.join(' · ')}
                  </p>
                  <p className="text-[10px] text-white/30 mt-0.5">{t.count} Bew.</p>
                </div>

                {/* Rang + Score */}
                <div className="shrink-0 text-right">
                  <div className="text-xs text-white/40 mb-0.5">
                    {MEDALS[i] ?? `#${i + 1}`}
                  </div>
                  <div className="flex items-end justify-end gap-0.5 leading-none">
                    <span className="font-display text-2xl font-bold text-amber">
                      {formatAverage(t.average, t.count)}
                    </span>
                    <span className="mb-0.5 text-xs text-white/30">/5</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Abstand für Nav */}
      <div className="h-2" />
    </div>
  )
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-white/50">{label}</span>
      <span className="font-bold">{value}</span>
    </div>
  )
}
