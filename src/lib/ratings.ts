import { supabase } from './supabase'
import type { NewRating, Rating, RatingSummary } from '../types'

/** Schlüssel einer Bewertung (passend zu schedule.lessonKey). */
function keyOf(r: Rating): string {
  return `${r.lesson_date}#${r.period}#${r.course_code ?? ''}`
}

/** Holt alle Bewertungen einer Klasse seit `sinceISO` (Default: letzte 35 Tage). */
export async function fetchRatings(className: string, sinceISO?: string): Promise<Rating[]> {
  const since =
    sinceISO ?? new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString()

  const { data, error } = await supabase
    .from('ratings')
    .select('*')
    .eq('class_code', className)
    .gte('created_at', since)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []).map((r) => ({ ...r, stars: Number(r.stars) })) as Rating[]
}

/** Speichert eine neue Bewertung. */
export async function insertRating(rating: NewRating): Promise<Rating> {
  const { data, error } = await supabase
    .from('ratings')
    .insert({
      class_code: rating.class_code,
      lesson_date: rating.lesson_date,
      period: rating.period,
      subject: rating.subject,
      course_code: rating.course_code ?? null,
      stars: rating.stars,
      comment: rating.comment?.trim() || null,
      nickname: rating.nickname?.trim() || null,
    })
    .select()
    .single()

  if (error) throw error
  return { ...data, stars: Number(data.stars) } as Rating
}

// ── Aggregationen (rein im Client gerechnet) ─────────────────

export function summarize(ratings: Rating[]): RatingSummary {
  if (ratings.length === 0) return { count: 0, average: 0 }
  const sum = ratings.reduce((acc, r) => acc + r.stars, 0)
  return { count: ratings.length, average: sum / ratings.length }
}

/** Map: Einheiten-Key -> Summary. */
export function summaryByLesson(ratings: Rating[]): Map<string, RatingSummary> {
  const groups = groupBy(ratings, keyOf)
  const out = new Map<string, RatingSummary>()
  for (const [key, arr] of groups) out.set(key, summarize(arr))
  return out
}

/** Map: Einheiten-Key -> alle Bewertungen dieser Einheit (neueste zuerst). */
export function ratingsByLesson(ratings: Rating[]): Map<string, Rating[]> {
  return groupBy(ratings, keyOf)
}

export interface SubjectStat extends RatingSummary {
  subject: string
}

/** Leaderboard: pro Fach/Kurs aggregiert, sortiert nach Schnitt (desc). */
export function statsBySubject(ratings: Rating[]): SubjectStat[] {
  const groups = groupBy(ratings, (r) => r.subject)
  const out: SubjectStat[] = []
  for (const [subject, arr] of groups) out.push({ subject, ...summarize(arr) })
  return out.sort((a, b) => b.average - a.average || b.count - a.count)
}

function groupBy<T>(items: T[], keyFn: (item: T) => string): Map<string, T[]> {
  const map = new Map<string, T[]>()
  for (const item of items) {
    const key = keyFn(item)
    const arr = map.get(key) ?? []
    arr.push(item)
    map.set(key, arr)
  }
  return map
}
