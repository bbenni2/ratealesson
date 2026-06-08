import { format, subMonths } from 'date-fns'
import { de } from 'date-fns/locale'
import { supabase } from './supabase'
import type { NewRating, Rating, RatingSummary } from '../types'
import { TIMETABLE } from '../config/timetable'
import { COURSE_SUGGESTIONS } from '../config/classes'

/** Schlüssel einer Bewertung (passend zu schedule.lessonKey). */
function keyOf(r: Rating): string {
  return `${r.lesson_date}#${r.period}#${r.course_code ?? ''}`
}

/** Holt alle Bewertungen einer Klasse seit `sinceISO` (Default: letztes Jahr). */
export async function fetchRatings(className: string, sinceISO?: string): Promise<Rating[]> {
  const since =
    sinceISO ?? new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString()

  const { data, error } = await supabase
    .from('ratings')
    .select('*')
    .eq('class_code', className)
    .gte('created_at', since)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []).map((r) => ({ ...r, stars: Number(r.stars) })) as Rating[]
}

/** Speichert eine neue Bewertung. Wenn eingeloggt wird user_id automatisch gesetzt. */
export async function insertRating(rating: NewRating): Promise<Rating> {
  const { data: sessionData } = await supabase.auth.getSession()
  const userId = sessionData.session?.user.id ?? null

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
      user_id: userId,
    })
    .select()
    .single()

  if (error) throw error
  return { ...data, stars: Number(data.stars) } as Rating
}

/** Aktualisiert eine bestehende Bewertung (Sterne, Kommentar, Spitzname). */
export async function updateRating(
  id: string,
  updates: { stars: number; comment: string | null; nickname: string | null },
): Promise<Rating> {
  const { data, error } = await supabase
    .from('ratings')
    .update({
      stars: updates.stars,
      comment: updates.comment?.trim() || null,
      nickname: updates.nickname?.trim() || null,
    })
    .eq('id', id)
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

// ── Lehrer-Statistik ─────────────────────────────────────────

/** Fach → Lehrkraft-Kürzel, aus dem gemeinsamen Plan + Kursvorschlägen. */
function buildSubjectTeacherMap(): Map<string, string> {
  const map = new Map<string, string>()
  for (const day of Object.values(TIMETABLE)) {
    for (const entry of day) {
      if (entry.teacher) map.set(entry.subject, entry.teacher)
    }
  }
  for (const s of COURSE_SUGGESTIONS) {
    if (s.teacher) map.set(s.name, s.teacher)
  }
  return map
}

const SUBJECT_TEACHER_MAP = buildSubjectTeacherMap()

export interface TeacherStat extends RatingSummary {
  teacher: string
  /** Alle Fächer, die diese Lehrkraft unterrichtet (aus den Bewertungen). */
  subjects: string[]
}

/** Leaderboard: pro Lehrkraft aggregiert (All-time), sortiert nach Schnitt. */
export function statsByTeacher(ratings: Rating[]): TeacherStat[] {
  const teacherData = new Map<string, { ratings: Rating[]; subjects: Set<string> }>()

  for (const r of ratings) {
    const teacher = SUBJECT_TEACHER_MAP.get(r.subject)
    if (!teacher) continue

    const entry = teacherData.get(teacher) ?? { ratings: [], subjects: new Set() }
    entry.ratings.push(r)
    entry.subjects.add(r.subject)
    teacherData.set(teacher, entry)
  }

  const out: TeacherStat[] = []
  for (const [teacher, { ratings: arr, subjects }] of teacherData) {
    out.push({
      teacher,
      subjects: [...subjects].sort((a, b) => a.localeCompare(b, 'de')),
      ...summarize(arr),
    })
  }
  return out.sort((a, b) => b.average - a.average || b.count - a.count)
}

// ── Trend-Daten ──────────────────────────────────────────────

export interface TrendPoint {
  /** Anzeigelabel, z. B. "Jan 26" oder "2025". */
  label: string
  /** Sortierschlüssel, z. B. "2026-01" oder "2025". */
  period: string
  average: number
  count: number
}

/** Monatstrend: letzte `months` Monate (inklusive laufendem Monat). */
export function trendByMonth(ratings: Rating[], months = 12): TrendPoint[] {
  const now = new Date()
  const points: TrendPoint[] = []
  for (let i = months - 1; i >= 0; i--) {
    const d = subMonths(now, i)
    const period = format(d, 'yyyy-MM')
    const label = format(d, 'MMM yy', { locale: de })
    const subset = ratings.filter((r) => r.lesson_date.slice(0, 7) === period)
    const { count, average } = summarize(subset)
    points.push({ label, period, average, count })
  }
  return points
}

/** Jahrestrend: alle Kalenderjahre, in denen es Bewertungen gibt. */
export function trendByYear(ratings: Rating[]): TrendPoint[] {
  const years = new Set(ratings.map((r) => r.lesson_date.slice(0, 4)))
  if (years.size === 0) return []
  return [...years].sort().map((year) => {
    const subset = ratings.filter((r) => r.lesson_date.startsWith(year))
    const { count, average } = summarize(subset)
    return { label: year, period: year, average, count }
  })
}
