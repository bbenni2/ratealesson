import { useMemo, useState } from 'react'
import { subDays } from 'date-fns'
import { useNow } from '../hooks/useNow'
import { useRatings } from '../hooks/useRatings'
import { statsBySubject, summarize } from '../lib/ratings'
import { StarDisplay } from '../components/StarRating'
import { EmptyState } from '../components/EmptyState'
import { ListSkeleton } from '../components/Skeleton'
import { NotConfiguredBanner } from '../components/NotConfiguredBanner'
import { formatAverage } from '../lib/format'

type Range = 7 | 30 | 0 // 0 = alle

const RANGES: { value: Range; label: string }[] = [
  { value: 7, label: '7 Tage' },
  { value: 30, label: '30 Tage' },
  { value: 0, label: 'Alle' },
]

const MEDALS = ['🥇', '🥈', '🥉']

export function StatsView() {
  const now = useNow(30000)
  const { ratings, loading, error } = useRatings()
  const [range, setRange] = useState<Range>(30)

  const filtered = useMemo(() => {
    if (range === 0) return ratings
    const cutoff = subDays(now, range).getTime()
    return ratings.filter((r) => new Date(r.created_at).getTime() >= cutoff)
  }, [ratings, range, now])

  const stats = useMemo(() => statsBySubject(filtered), [filtered])
  const overall = useMemo(() => summarize(filtered), [filtered])
  const maxCount = Math.max(1, ...stats.map((s) => s.count))

  return (
    <div className="space-y-5">
      <header className="pt-safe">
        <h1 className="font-display text-2xl font-bold">Statistik 🏆</h1>
        <p className="text-sm text-white/40">Welche Fächer schneiden am besten ab?</p>
      </header>

      {error === 'not-configured' && <NotConfiguredBanner />}

      {/* Filter */}
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

      {/* Gesamt-Übersicht */}
      {overall.count > 0 && (
        <div className="card flex items-center justify-around p-4 animate-fade-in">
          <Stat label="Bewertungen" value={String(overall.count)} />
          <div className="h-8 w-px bg-line" />
          <Stat label="Ø Schnitt" value={formatAverage(overall.average, overall.count)} />
          <div className="h-8 w-px bg-line" />
          <Stat label="Fächer" value={String(stats.length)} />
        </div>
      )}

      {/* Leaderboard */}
      {loading && error !== 'not-configured' ? (
        <ListSkeleton rows={6} />
      ) : stats.length === 0 ? (
        <EmptyState
          emoji="📊"
          title="Noch keine Daten"
          hint="In diesem Zeitraum gibt es noch keine Bewertungen. Geh in die Live-Ansicht und leg los!"
        />
      ) : (
        <div className="space-y-2.5">
          {stats.map((s, i) => (
            <div
              key={s.subject}
              className="card flex items-center gap-3 p-3.5 animate-fade-in"
            >
              <div className="w-7 shrink-0 text-center font-display text-lg font-bold">
                {MEDALS[i] ?? <span className="text-white/30">{i + 1}</span>}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-display font-semibold">{s.subject}</p>
                <div className="mt-1 flex items-center gap-2">
                  <StarDisplay value={s.average} size={12} />
                  <span className="text-xs text-white/40">{s.count} Bew.</span>
                </div>
                {/* Balken: relativer Anteil an Bewertungen */}
                <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-bg-elevated">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-accent/60 to-accent-glow/60"
                    style={{ width: `${(s.count / maxCount) * 100}%` }}
                  />
                </div>
              </div>
              <span className="shrink-0 font-display text-xl font-bold tabular-nums">
                {formatAverage(s.average, s.count)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <p className="font-display text-2xl font-bold text-white">{value}</p>
      <p className="text-[11px] uppercase tracking-wide text-white/40">{label}</p>
    </div>
  )
}
