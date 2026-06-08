import { useEffect } from 'react'
import type { Rating } from '../types'
import { StarDisplay } from './StarRating'
import { CloseIcon } from './icons'
import { formatRelative } from '../lib/format'

interface Props {
  title: string
  subtitle?: string
  /** Alle Ratings für diesen Kontext (mit + ohne Kommentar). */
  ratings: Rating[]
  onClose: () => void
}

export function CommentsDrawer({ title, subtitle, ratings, onClose }: Props) {
  // Nur Ratings mit Text, neueste zuerst
  const withComment = ratings
    .filter((r) => r.comment)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-[55] flex items-end justify-center bg-black/65 backdrop-blur-sm animate-fade-in sm:items-center"
      onClick={onClose}
    >
      <div
        className="max-h-[82dvh] w-full max-w-md flex flex-col rounded-t-3xl border border-line bg-bg-soft shadow-2xl animate-slide-up sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle (nur mobile) */}
        <div className="mx-auto mt-3 h-1.5 w-10 shrink-0 rounded-full bg-line sm:hidden" />

        {/* ── Header ──────────────────────────────────── */}
        <div className="flex shrink-0 items-start gap-3 border-b border-line px-5 pb-4 pt-4">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/35">
              Kommentare
            </p>
            <h2 className="mt-0.5 truncate font-display text-lg font-bold leading-tight">
              {title}
            </h2>
            {subtitle && (
              <p className="mt-0.5 truncate text-xs text-white/40">{subtitle}</p>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-2.5">
            {/* Zähler */}
            <div className="rounded-lg border border-line bg-bg-card px-2.5 py-1 text-center">
              <p className="font-display text-sm font-bold tabular-nums leading-none text-white/70">
                {ratings.length}
              </p>
              <p className="mt-0.5 text-[9px] uppercase tracking-wide text-white/30">Bew.</p>
            </div>
            <div className="rounded-lg border border-line bg-bg-card px-2.5 py-1 text-center">
              <p className="font-display text-sm font-bold tabular-nums leading-none text-accent-soft">
                {withComment.length}
              </p>
              <p className="mt-0.5 text-[9px] uppercase tracking-wide text-white/30">Komm.</p>
            </div>

            <button
              onClick={onClose}
              aria-label="Schließen"
              className="rounded-full p-1.5 text-white/40 transition hover:bg-bg-elevated hover:text-white"
            >
              <CloseIcon width={20} height={20} />
            </button>
          </div>
        </div>

        {/* ── Kommentar-Liste ──────────────────────────── */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-3 pb-[calc(env(safe-area-inset-bottom)+12px)]">
          {withComment.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center py-16 text-center">
              <span className="text-5xl">💬</span>
              <p className="mt-4 font-display text-base font-semibold text-white/50">
                Noch keine Kommentare
              </p>
              <p className="mt-1.5 max-w-[200px] text-xs leading-relaxed text-white/30">
                {ratings.length > 0
                  ? `${ratings.length} Bewertung${ratings.length !== 1 ? 'en' : ''} – niemand hat Text hinterlassen.`
                  : 'Bewerte die Stunde und hinterlass einen Kommentar!'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {withComment.map((r) => (
                <article
                  key={r.id}
                  className="rounded-2xl border border-line bg-bg-card px-4 py-3.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <StarDisplay value={r.stars} size={13} />
                    <time className="shrink-0 text-[11px] text-white/35">
                      {formatRelative(r.created_at)}
                    </time>
                  </div>
                  <p className="mt-2.5 text-sm leading-relaxed text-white/85">{r.comment}</p>
                  {r.nickname && (
                    <p className="mt-2 text-xs text-accent-soft">— {r.nickname}</p>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
