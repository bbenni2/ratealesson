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

  // Auswahl
  const [name, setName] = useState('')
  const [teacher, setTeacher] = useState('')
  const [custom, setCustom] = useState(false)
  const [weekday, setWeekday] = useState<Weekday>(1)
  const [period, setPeriod] = useState(PERIODS[0]?.period ?? 1)
  const [length, setLength] = useState<1 | 2>(1)

  function pickChip(n: string, t?: string) {
    setCustom(false)
    setName(n)
    setTeacher(t ?? '')
  }

  function add() {
    if (!name.trim()) return
    addCourse({
      name: name.trim(),
      teacher: teacher.trim() || undefined,
      weekday,
      period,
      length,
    })
    // Auswahl zurücksetzen, Tag/Stunde bleiben (oft mehrere Stunden am selben Tag)
    setName('')
    setTeacher('')
    setCustom(false)
  }

  const sorted = [...config.courses].sort(
    (a, b) => a.weekday - b.weekday || a.period - b.period,
  )

  const selectedChip = !custom ? name : '__custom__'

  return (
    <div className="space-y-4">
      {/* Liste der eigenen Kurse */}
      {sorted.length > 0 && (
        <ul className="space-y-2">
          {sorted.map((c) => (
            <li key={c.id} className="card flex items-center gap-3 p-3">
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

      {/* Hinzufügen */}
      <div className="card space-y-4 p-4">
        {/* 1) Fach antippen */}
        <div>
          <p className="mb-2 text-xs font-medium text-white/50">1. Welches Wahlfach?</p>
          <div className="flex flex-wrap gap-2">
            {COURSE_SUGGESTIONS.map((s) => (
              <button
                key={s.name}
                onClick={() => pickChip(s.name, s.teacher)}
                className={`rounded-full border px-3.5 py-2 text-sm font-semibold transition ${
                  selectedChip === s.name
                    ? 'border-accent bg-accent/20 text-white'
                    : 'border-line bg-bg-card text-white/70 hover:border-accent/40'
                }`}
              >
                {s.name}
                {s.teacher && (
                  <span
                    className={selectedChip === s.name ? 'text-white/70' : 'text-white/35'}
                  >
                    {' '}
                    · {s.teacher}
                  </span>
                )}
              </button>
            ))}
            <button
              onClick={() => {
                setCustom(true)
                setName('')
                setTeacher('')
              }}
              className={`rounded-full border px-3.5 py-2 text-sm font-semibold transition ${
                custom
                  ? 'border-accent bg-accent/20 text-white'
                  : 'border-line bg-bg-card text-white/70 hover:border-accent/40'
              }`}
            >
              + Anderes
            </button>
          </div>

          {custom && (
            <div className="mt-2.5 flex gap-2">
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Fach, z. B. Chor"
                className="flex-[2] rounded-xl border border-line bg-bg-card px-3 py-2 text-sm outline-none transition focus:border-accent/60"
              />
              <input
                value={teacher}
                onChange={(e) => setTeacher(e.target.value)}
                placeholder="Lehrkraft"
                className="flex-1 rounded-xl border border-line bg-bg-card px-3 py-2 text-sm outline-none transition focus:border-accent/60"
              />
            </div>
          )}
        </div>

        {/* 2) Wann? */}
        <div>
          <p className="mb-2 text-xs font-medium text-white/50">2. Wann hast du den Kurs?</p>
          <div className="flex flex-wrap gap-1.5">
            {WEEKDAYS.map((w) => (
              <button
                key={w.value}
                onClick={() => setWeekday(w.value)}
                className={`h-9 w-11 rounded-lg text-sm font-semibold transition ${
                  weekday === w.value
                    ? 'bg-accent text-white'
                    : 'bg-bg-card text-white/55 hover:text-white'
                }`}
              >
                {w.label}
              </button>
            ))}
          </div>

          <div className="mt-2 flex gap-2">
            <select
              value={period}
              onChange={(e) => setPeriod(Number(e.target.value))}
              className="flex-1 rounded-xl border border-line bg-bg-card px-3 py-2 text-sm outline-none transition focus:border-accent/60"
            >
              {PERIODS.map((p) => (
                <option key={p.period} value={p.period}>
                  {p.period}. Stunde ({p.start})
                </option>
              ))}
            </select>
            <div className="flex shrink-0 overflow-hidden rounded-xl border border-line">
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

        <button onClick={add} disabled={!name.trim()} className="btn-primary w-full">
          + Wahlfach hinzufügen
        </button>
      </div>
    </div>
  )
}
