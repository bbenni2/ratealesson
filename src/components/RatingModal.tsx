import { useEffect, useMemo, useState } from 'react'
import type { LessonInstance, Rating } from '../types'
import { insertRating, ratingsByLesson, summarize } from '../lib/ratings'
import { isRatable, lessonKey } from '../lib/schedule'
import { hasRated, markRated } from '../lib/localRatings'
import { useNow } from '../hooks/useNow'
import { useRatings } from '../hooks/useRatings'
import { useStudentConfig } from '../hooks/useStudentConfig'
import { useToast } from '../hooks/useToast'
import { formatRelative, formatTime } from '../lib/format'
import { StarDisplay, StarInput } from './StarRating'
import { CloseIcon } from './icons'

const MAX_COMMENT = 200
const NICK_KEY = 'ral:nickname'

interface Props {
  lesson: LessonInstance
  onClose: () => void
}

export function RatingModal({ lesson, onClose }: Props) {
  const now = useNow(60000)
  const { ratings, addLocal } = useRatings()
  const { config } = useStudentConfig()
  const { toast } = useToast()

  const [stars, setStars] = useState(0)
  const [comment, setComment] = useState('')
  const [nickname, setNickname] = useState(() => localStorage.getItem(NICK_KEY) ?? '')
  const [submitting, setSubmitting] = useState(false)

  const key = lessonKey(lesson)
  const ratable = isRatable(lesson, now)
  const alreadyRated = hasRated(key)
  const canRate = ratable && !alreadyRated

  const lessonRatings = useMemo(
    () => ratingsByLesson(ratings).get(key) ?? [],
    [ratings, key],
  )
  const summary = useMemo(() => summarize(lessonRatings), [lessonRatings])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  async function submit() {
    if (stars < 1) {
      toast('Bitte wähl zuerst Sterne aus ⭐', 'info')
      return
    }
    setSubmitting(true)
    try {
      const saved = await insertRating({
        class_code: config.className,
        lesson_date: lesson.date,
        period: lesson.period,
        subject: lesson.subject,
        course_code: lesson.courseCode,
        stars,
        comment: comment.trim() || null,
        nickname: nickname.trim() || null,
      })
      markRated(key)
      if (nickname.trim()) localStorage.setItem(NICK_KEY, nickname.trim())
      addLocal(saved)
      toast('Danke für deine Bewertung! 🙌', 'success')
      onClose()
    } catch (e) {
      console.error(e)
      toast('Hat nicht geklappt – probier es nochmal.', 'error')
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[55] flex items-end justify-center bg-black/60 backdrop-blur-sm animate-fade-in sm:items-center"
      onClick={onClose}
    >
      <div
        className="max-h-[90dvh] w-full max-w-md overflow-y-auto overscroll-contain rounded-t-3xl border border-line bg-bg-soft p-5 pb-8 shadow-2xl animate-slide-up pb-safe sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Greif-Leiste (Bottom-Sheet-Optik am Handy) */}
        <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-line sm:hidden" />

        {/* Kopf */}
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-bg-elevated text-2xl">
            {lesson.emoji ?? '📘'}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="truncate font-display text-xl font-bold">{lesson.subject}</h2>
            <p className="text-sm text-white/50">
              {lesson.period}. Stunde
              {lesson.length === 2 ? ' (Doppel)' : ''} · {formatTime(lesson.startsAt)}
              {lesson.teacher ? ` · ${lesson.teacher}` : ''}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Schließen"
            className="rounded-full p-1.5 text-white/40 transition hover:bg-bg-elevated hover:text-white"
          >
            <CloseIcon width={20} height={20} />
          </button>
        </div>

        {/* Eingabe-Bereich */}
        {canRate ? (
          <>
            <div className="mt-6">
              <StarInput value={stars} onChange={setStars} />
            </div>

            <div className="mt-5">
              <label className="mb-1.5 block text-sm font-medium text-white/60">
                Kommentar <span className="text-white/30">(optional)</span>
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value.slice(0, MAX_COMMENT))}
                rows={3}
                placeholder="Was war gut, was nicht? …"
                className="w-full resize-none rounded-xl border border-line bg-bg-card px-3.5 py-2.5 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-accent/60"
              />
              <div className="mt-1 text-right text-[11px] text-white/35">
                {comment.length}/{MAX_COMMENT}
              </div>
            </div>

            <div className="mt-1">
              <label className="mb-1.5 block text-sm font-medium text-white/60">
                Spitzname <span className="text-white/30">(optional, wird bei Kommentar gezeigt)</span>
              </label>
              <input
                value={nickname}
                onChange={(e) => setNickname(e.target.value.slice(0, 40))}
                placeholder="z. B. anonymer Fuchs 🦊"
                className="w-full rounded-xl border border-line bg-bg-card px-3.5 py-2.5 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-accent/60"
              />
            </div>

            <div className="mt-6 flex gap-3">
              <button onClick={onClose} className="btn-ghost flex-1">
                Abbrechen
              </button>
              <button onClick={submit} disabled={submitting} className="btn-primary flex-[2]">
                {submitting ? 'Speichern…' : 'Bewertung absenden'}
              </button>
            </div>
          </>
        ) : (
          <div
            className={`mt-5 rounded-xl border px-3 py-2.5 text-center text-xs ${
              alreadyRated
                ? 'border-lime/30 bg-lime/10 text-lime'
                : 'border-line bg-bg-card text-white/45'
            }`}
          >
            {alreadyRated
              ? '✓ Du hast diese Stunde schon bewertet.'
              : '⏳ Nicht mehr bewertbar – das 5-Tage-Fenster ist vorbei.'}
          </div>
        )}

        {/* Bewertungen & Kommentare – für alle sichtbar */}
        <CommentsSection ratings={lessonRatings} summary={summary} />
      </div>
    </div>
  )
}

function CommentsSection({
  ratings,
  summary,
}: {
  ratings: Rating[]
  summary: { count: number; average: number }
}) {
  const withComment = ratings.filter((r) => r.comment)

  if (summary.count === 0) {
    return (
      <p className="mt-6 border-t border-line pt-5 text-center text-sm text-white/35">
        Noch keine Bewertungen für diese Stunde.
      </p>
    )
  }

  return (
    <div className="mt-6 border-t border-line pt-5">
      <div className="flex items-center justify-center gap-2">
        <span className="font-display text-2xl font-bold">{summary.average.toFixed(1)}</span>
        <div>
          <StarDisplay value={summary.average} size={14} />
          <p className="text-[11px] text-white/40">{summary.count} Bewertungen</p>
        </div>
      </div>

      {withComment.length > 0 && (
        <div className="mt-4 space-y-2.5">
          {withComment.map((r) => (
            <div key={r.id} className="rounded-xl border border-line bg-bg-card p-3">
              <div className="flex items-center justify-between gap-2">
                <StarDisplay value={r.stars} size={12} />
                <span className="text-[11px] text-white/35">{formatRelative(r.created_at)}</span>
              </div>
              <p className="mt-1.5 text-sm text-white/80">{r.comment}</p>
              {r.nickname && <p className="mt-1 text-xs text-accent-soft">— {r.nickname}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
