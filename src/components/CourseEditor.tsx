import { useState } from 'react'
import { useStudentConfig } from '../hooks/useStudentConfig'
import { COURSE_SUGGESTIONS } from '../config/classes'
import { PERIODS } from '../config/periods'
import { CloseIcon } from './icons'
import type { Weekday } from '../types'

const WEEKDAYS: { value: Weekday; label: string }[] = [
  { value: 1, label: 'Mo' },
  { value: 2, label: 'Di' },
  { value: 3, label: 'Mi' },
  { value: 4, label: 'Do' },
  { value: 5, label: 'Fr' },
]

export function CourseEditor() {
  const { config, addCourse, removeCourse } = useStudentConfig()

  const [name, setName] = useState('')
  const [teacher, setTeacher] = useState('')
  const [weekday, setWeekday] = useState<Weekday>(1)
  const [period, setPeriod] = useState(PERIODS[0]?.period ?? 1)
  const [length, setLength] = useState<1 | 2>(1)

  // Bekannter Kurs mit fest hinterlegter Lehrkraft? Dann keine Auswahl nötig.
  const matched = COURSE_SUGGESTIONS.find(
    (s) => s.name.toLowerCase() === name.trim().toLowerCase(),
  )
  const fixedTeacher = matched?.teacher
  const effectiveTeacher = (fixedTeacher ?? teacher).trim() || undefined

  function add() {
    if (!name.trim()) return
    addCourse({ name: name.trim(), teacher: effectiveTeacher, weekday, period, length })
    setName('')
    setTeacher('')
  }

  const sorted = [...config.courses].sort(
    (a, b) => a.weekday - b.weekday || a.period - b.period,
  )

  return (
    <div className="space-y-4">
      {/* Liste der eigenen Kurse */}
      {sorted.length > 0 && (
        <ul className="space-y-2">
          {sorted.map((c) => (
            <li
              key={c.id}
              className="card flex items-center gap-3 p-3"
            >
              <span className="text-xl">🎓</span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">
                  {c.name}
                  {c.teacher ? <span className="text-white/40"> · {c.teacher}</span> : null}
                </p>
                <p className="text-xs text-white/45">
                  {WEEKDAYS.find((w) => w.value === c.weekday)?.label} · {c.period}. Stunde
                  {c.length === 2 ? ' (Doppel)' : ''}
                </p>
              </div>
              <button
                onClick={() => removeCourse(c.id)}
                aria-label="Kurs entfernen"
                className="rounded-full p-1.5 text-white/40 transition hover:bg-bg-elevated hover:text-red-300"
              >
                <CloseIcon width={16} height={16} />
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Formular */}
      <div className="card space-y-3 p-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-white/50">Fach / Kurs</label>
          <input
            list="course-suggestions"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="z. B. Italienisch"
            className="w-full rounded-xl border border-line bg-bg-card px-3 py-2 text-sm outline-none transition focus:border-accent/60"
          />
          <datalist id="course-suggestions">
            {COURSE_SUGGESTIONS.map((s) => (
              <option key={s.name} value={s.name} />
            ))}
          </datalist>
        </div>

        <div className="flex gap-2">
          <div className="flex-1">
            <label className="mb-1 block text-xs font-medium text-white/50">Lehrkraft</label>
            {fixedTeacher ? (
              <div className="flex items-center gap-1.5 rounded-xl border border-line bg-bg-elevated/60 px-3 py-2 text-sm">
                <span className="font-semibold text-accent-soft">{fixedTeacher}</span>
                <span className="text-xs text-white/35">· automatisch</span>
              </div>
            ) : (
              <input
                value={teacher}
                onChange={(e) => setTeacher(e.target.value)}
                placeholder="optional"
                className="w-full rounded-xl border border-line bg-bg-card px-3 py-2 text-sm outline-none transition focus:border-accent/60"
              />
            )}
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-white/50">Dauer</label>
            <div className="flex overflow-hidden rounded-xl border border-line">
              {([1, 2] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setLength(l)}
                  className={`px-3 py-2 text-sm font-semibold transition ${
                    length === l ? 'bg-accent text-white' : 'bg-bg-card text-white/50'
                  }`}
                >
                  {l === 1 ? '1 Std' : '2 Std'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <div className="flex-1">
            <label className="mb-1 block text-xs font-medium text-white/50">Tag</label>
            <select
              value={weekday}
              onChange={(e) => setWeekday(Number(e.target.value) as Weekday)}
              className="w-full rounded-xl border border-line bg-bg-card px-3 py-2 text-sm outline-none transition focus:border-accent/60"
            >
              {WEEKDAYS.map((w) => (
                <option key={w.value} value={w.value}>
                  {w.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="mb-1 block text-xs font-medium text-white/50">Ab Stunde</label>
            <select
              value={period}
              onChange={(e) => setPeriod(Number(e.target.value))}
              className="w-full rounded-xl border border-line bg-bg-card px-3 py-2 text-sm outline-none transition focus:border-accent/60"
            >
              {PERIODS.map((p) => (
                <option key={p.period} value={p.period}>
                  {p.period}. ({p.start})
                </option>
              ))}
            </select>
          </div>
        </div>

        <button onClick={add} disabled={!name.trim()} className="btn-primary w-full">
          + Kurs hinzufügen
        </button>
      </div>
    </div>
  )
}
