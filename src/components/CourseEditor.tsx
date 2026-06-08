import { useState } from 'react'
import { useStudentConfig } from '../hooks/useStudentConfig'
import {
  COURSE_SUGGESTIONS,
  QUICK_GROUP_NAMES,
  QUICK_SETUP_GROUPS,
  type QuickOption,
} from '../config/classes'
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

/** Fach-Chips die NICHT von Quick-Gruppen abgedeckt sind. */
const EXTRA_SUGGESTIONS = COURSE_SUGGESTIONS.filter((s) => !QUICK_GROUP_NAMES.has(s.name))

export function CourseEditor() {
  const { config, addCourse, removeCourse } = useStudentConfig()

  // ── Benutzerdefinierter Kurs-Editor ──────────────────────────
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [teacher, setTeacher] = useState('')
  const [isCustom, setIsCustom] = useState(false)
  const [weekday, setWeekday] = useState<Weekday>(1)
  const [period, setPeriod] = useState(PERIODS[0]?.period ?? 1)
  const [length, setLength] = useState<1 | 2>(1)

  // ── Helpers ──────────────────────────────────────────────────

  /** Gibt den aktuell gewählten Options-Namen einer Gruppe zurück (null = keine). */
  function getGroupSelectedName(group: (typeof QUICK_SETUP_GROUPS)[0]): string | null {
    for (const opt of group.options) {
      if (opt.name && config.courses.some((c) => c.name === opt.name)) {
        return opt.name
      }
    }
    return null
  }

  /** Tauscht alle Kurse einer Gruppe gegen die gewählte Option aus. */
  function selectGroupOption(groupId: string, option: QuickOption) {
    const group = QUICK_SETUP_GROUPS.find((g) => g.id === groupId)
    if (!group) return

    // Alte Kurs-Einträge dieser Gruppe entfernen
    const groupNames = new Set(group.options.flatMap((o) => (o.name ? [o.name] : [])))
    for (const c of config.courses) {
      if (groupNames.has(c.name)) removeCourse(c.id)
    }

    // Neue Slots hinzufügen (nichts tun bei „keine"-Option)
    if (option.name && option.slots) {
      for (const slot of option.slots) {
        addCourse({
          name: option.name,
          teacher: option.teacher,
          weekday: slot.weekday as Weekday,
          period: slot.period,
          length: slot.length,
        })
      }
    }
  }

  function addCustomCourse() {
    if (!name.trim()) return
    addCourse({
      name: name.trim(),
      teacher: teacher.trim() || undefined,
      weekday,
      period,
      length,
    })
    setName('')
    setTeacher('')
    setIsCustom(false)
    setShowForm(false)
  }

  /** Kurse die NICHT von Quick-Gruppen stammen (manuell hinzugefügt). */
  const customCourses = config.courses.filter((c) => !QUICK_GROUP_NAMES.has(c.name))

  return (
    <div className="space-y-5">
      {/* ── Quick-Setup Gruppen ─────────────────────────────── */}
      {QUICK_SETUP_GROUPS.map((group) => {
        const selectedName = getGroupSelectedName(group)
        return (
          <div key={group.id} className="space-y-2">
            <p className="text-sm font-semibold text-white/80">
              <span className="mr-1.5">{group.icon}</span>
              {group.question}
            </p>
            <div className="flex flex-wrap gap-2">
              {group.options.map((opt) => {
                const isSelected = opt.name ? selectedName === opt.name : selectedName === null
                return (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => selectGroupOption(group.id, opt)}
                    className={`rounded-xl border px-4 py-2.5 text-sm font-semibold transition active:scale-[0.97] ${
                      isSelected
                        ? opt.name
                          ? 'border-accent bg-accent/20 text-white shadow-glow'
                          : 'border-line bg-bg-elevated text-white/35'
                        : 'border-line bg-bg-card text-white/65 hover:border-accent/40 hover:text-white'
                    }`}
                  >
                    {opt.label}
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}

      {/* ── Sonstige Kurse ───────────────────────────────────── */}
      <div className="flex items-center gap-3 pt-1">
        <div className="flex-1 border-t border-line" />
        <span className="text-[11px] font-medium uppercase tracking-wider text-white/30">
          Sonstige Kurse
        </span>
        <div className="flex-1 border-t border-line" />
      </div>

      {/* Liste benutzerdefinierter Kurse */}
      {customCourses.length > 0 && (
        <ul className="space-y-2">
          {customCourses.map((c) => (
            <li
              key={c.id}
              className="flex items-center gap-3 rounded-xl border border-line bg-bg-card p-3"
            >
              <span className="text-xl">🎓</span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">
                  {c.name}
                  {c.teacher ? (
                    <span className="font-normal text-white/40"> · {c.teacher}</span>
                  ) : null}
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

      {/* Toggle-Button zum Öffnen des Formulars */}
      {!showForm ? (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-line py-3 text-sm font-semibold text-white/40 transition hover:border-accent/40 hover:text-accent active:scale-[0.98]"
        >
          + Anderen Kurs hinzufügen
        </button>
      ) : (
        <div className="card space-y-4 p-4">
          {/* Fach-Auswahl */}
          <div>
            <p className="mb-2 text-xs font-medium text-white/50">Welches Fach?</p>
            <div className="flex flex-wrap gap-2">
              {EXTRA_SUGGESTIONS.map((s) => (
                <button
                  key={s.name}
                  type="button"
                  onClick={() => {
                    setIsCustom(false)
                    setName(s.name)
                    setTeacher(s.teacher ?? '')
                  }}
                  className={`rounded-full border px-3.5 py-2 text-sm font-semibold transition ${
                    !isCustom && name === s.name
                      ? 'border-accent bg-accent/20 text-white'
                      : 'border-line bg-bg-card text-white/70 hover:border-accent/40'
                  }`}
                >
                  {s.name}
                  {s.teacher && (
                    <span
                      className={!isCustom && name === s.name ? 'text-white/60' : 'text-white/35'}
                    >
                      {' '}
                      · {s.teacher}
                    </span>
                  )}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  setIsCustom(true)
                  setName('')
                  setTeacher('')
                }}
                className={`rounded-full border px-3.5 py-2 text-sm font-semibold transition ${
                  isCustom
                    ? 'border-accent bg-accent/20 text-white'
                    : 'border-line bg-bg-card text-white/70 hover:border-accent/40'
                }`}
              >
                + Anderes
              </button>
            </div>
            {isCustom && (
              <div className="mt-2.5 flex gap-2">
                <input
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Fach, z. B. Chor"
                  className="flex-[2] rounded-xl border border-line bg-bg-card px-3 py-2 text-sm text-white outline-none transition focus:border-accent/60"
                />
                <input
                  value={teacher}
                  onChange={(e) => setTeacher(e.target.value)}
                  placeholder="Lehrkraft"
                  className="flex-1 rounded-xl border border-line bg-bg-card px-3 py-2 text-sm text-white outline-none transition focus:border-accent/60"
                />
              </div>
            )}
          </div>

          {/* Wann? */}
          <div>
            <p className="mb-2 text-xs font-medium text-white/50">Wann?</p>
            <div className="flex flex-wrap gap-1.5">
              {WEEKDAYS.map((w) => (
                <button
                  key={w.value}
                  type="button"
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
                className="flex-1 rounded-xl border border-line bg-bg-card px-3 py-2 text-sm text-white outline-none transition focus:border-accent/60"
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
                    type="button"
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
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="btn-ghost flex-1"
            >
              Abbrechen
            </button>
            <button
              type="button"
              onClick={addCustomCourse}
              disabled={!name.trim()}
              className="btn-primary flex-[2]"
            >
              + Hinzufügen
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
