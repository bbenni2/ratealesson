import { addDays, differenceInCalendarDays, format, parse } from 'date-fns'
import { PERIOD_BY_NUMBER, PERIODS } from '../config/periods'
import { TIMETABLE } from '../config/timetable'
import { isSchoolFreeDay } from '../config/events'
import { courseCodeFrom } from './courseCode'
import type { LessonInstance, StudentCourse, Weekday } from '../types'

/** Wie lange nach Stundenbeginn darf noch bewertet werden (in Tagen). */
export const RATING_WINDOW_DAYS = 5

/** yyyy-MM-dd für ein Datum. */
export function toDateKey(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

/** Baut aus "HH:mm" + Tag einen vollständigen Date. */
function withTime(day: Date, time: string): Date {
  return parse(time, 'HH:mm', day)
}

/** Endstunde einer Einheit, die bei `period` beginnt und `length` Stunden dauert. */
function endPeriodNumber(period: number, length: number): number {
  // Wir nehmen die `length`-te existierende Stunde ab `period`.
  const ordered = PERIODS.map((p) => p.period).sort((a, b) => a - b)
  const startIdx = ordered.indexOf(period)
  if (startIdx === -1) return period
  return ordered[Math.min(startIdx + length - 1, ordered.length - 1)]
}

/**
 * Löst Stundenplan + persönliche Kurse für ein konkretes Datum in echte
 * Stunden-Instanzen (mit Uhrzeiten) auf. Sortiert nach Startzeit.
 */
export function lessonsForDate(date: Date, courses: StudentCourse[]): LessonInstance[] {
  const weekday = date.getDay() as Weekday
  const dateKey = toDateKey(date)

  // Kein Unterricht an Feiertagen, Ferien & schulautonomen Tagen
  if (isSchoolFreeDay(dateKey)) return []

  const out: LessonInstance[] = []

  // 1) Gemeinsame Stunden der ganzen Klasse
  for (const entry of TIMETABLE[weekday] ?? []) {
    const p = PERIOD_BY_NUMBER[entry.period]
    if (!p) continue
    out.push({
      date: dateKey,
      period: entry.period,
      length: 1,
      subject: entry.subject,
      teacher: entry.teacher,
      room: entry.room,
      emoji: entry.emoji,
      courseCode: null,
      isCourse: false,
      startsAt: withTime(date, p.start),
      endsAt: withTime(date, p.end),
    })
  }

  // 2) Persönliche Kurse an diesem Wochentag
  for (const course of courses) {
    if (course.weekday !== weekday) continue
    const startP = PERIOD_BY_NUMBER[course.period]
    if (!startP) continue
    const endP = PERIOD_BY_NUMBER[endPeriodNumber(course.period, course.length)] ?? startP
    out.push({
      date: dateKey,
      period: course.period,
      length: course.length,
      subject: course.name,
      teacher: course.teacher,
      emoji: '🎓',
      courseCode: courseCodeFrom(course.name, course.teacher),
      isCourse: true,
      startsAt: withTime(date, startP.start),
      endsAt: withTime(date, endP.end),
    })
  }

  return out.sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime())
}

export interface CurrentState {
  current: LessonInstance | null
  next: LessonInstance | null
  today: LessonInstance[]
}

/** Bestimmt aktuelle & nächste Einheit anhand der Uhrzeit `now`. */
export function getCurrentState(now: Date, courses: StudentCourse[]): CurrentState {
  const today = lessonsForDate(now, courses)
  const t = now.getTime()
  const current =
    today.find((l) => t >= l.startsAt.getTime() && t < l.endsAt.getTime()) ?? null
  const next = today.find((l) => l.startsAt.getTime() > t) ?? null
  return { current, next, today }
}

/** Bewertbar ab Stundenbeginn bis RATING_WINDOW_DAYS Tage danach. */
export function isRatable(lesson: LessonInstance, now: Date): boolean {
  if (now.getTime() < lesson.startsAt.getTime()) return false
  return differenceInCalendarDays(now, lesson.startsAt) <= RATING_WINDOW_DAYS
}

/** Verbleibende Tage im Bewertungsfenster (0 = letzter Tag). */
export function daysLeftToRate(lesson: LessonInstance, now: Date): number {
  return Math.max(0, RATING_WINDOW_DAYS - differenceInCalendarDays(now, lesson.startsAt))
}

/** Alle Einheiten der letzten `days` Tage (heute eingeschlossen), neueste zuerst. */
export function pastLessons(now: Date, courses: StudentCourse[], days = 30): LessonInstance[] {
  const out: LessonInstance[] = []
  for (let i = 0; i < days; i++) {
    const day = addDays(now, -i)
    for (const l of lessonsForDate(day, courses)) {
      if (l.startsAt.getTime() <= now.getTime()) out.push(l)
    }
  }
  return out.sort((a, b) => b.startsAt.getTime() - a.startsAt.getTime())
}

/** Eindeutiger Schlüssel je Einheit (Datum + Stunde + Kurs). */
export function lessonKey(lesson: {
  date: string
  period: number
  courseCode: string | null
}): string {
  return `${lesson.date}#${lesson.period}#${lesson.courseCode ?? ''}`
}
