import { useState } from 'react'
import { CLASSES } from '../config/classes'
import { useStudentConfig } from '../hooks/useStudentConfig'
import { CourseEditor } from '../components/CourseEditor'

type View = 'intro' | 'class' | 'courses'

const SLIDES = [
  {
    emoji: '⭐',
    title: 'Bewerte deine Stunden',
    text: 'Gib jeder Stunde 1–5 Sterne (auch halbe) und optional einen Kommentar – komplett anonym.',
  },
  {
    emoji: '📺',
    title: 'Sieh, was gerade läuft',
    text: 'Die App kennt euren Stundenplan, zeigt die aktuelle Stunde mit Countdown und alle Schnitte in Echtzeit.',
  },
  {
    emoji: '🎓',
    title: 'Deine Wahlfächer',
    text: 'Trag deine Wahlfächer ein (Sprachen, Religion/Ethik …). Du bewertest nur deine Stunden, siehst aber alle Bewertungen.',
  },
]

/** Erst-Start: kurzes Tutorial → Klasse wählen → eigene Kurse. */
export function Onboarding() {
  const { config, setClassName, completeOnboarding } = useStudentConfig()
  const [view, setView] = useState<View>('intro')
  const [slide, setSlide] = useState(0)

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col px-4 pb-10 pt-safe">
      <div className="pt-8 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-accent-glow text-3xl shadow-glow-lg">
          ⭐
        </div>
        <h1 className="mt-4 font-display text-2xl font-bold">Rate a Lesson</h1>
        <p className="mt-1 text-sm text-white/50">
          {view === 'intro'
            ? 'In 10 Sekunden erklärt 👇'
            : 'Kurz einrichten – alles bleibt anonym & nur auf diesem Gerät.'}
        </p>
      </div>

      {/* ── Tutorial ── */}
      {view === 'intro' && (
        <div className="mt-8 flex flex-1 flex-col animate-fade-in">
          <div className="card flex flex-1 flex-col items-center justify-center gap-4 px-6 py-10 text-center">
            <div className="text-6xl">{SLIDES[slide].emoji}</div>
            <h2 className="font-display text-xl font-bold">{SLIDES[slide].title}</h2>
            <p className="max-w-xs text-sm leading-relaxed text-white/60">
              {SLIDES[slide].text}
            </p>
          </div>

          {/* Punkte */}
          <div className="mt-5 flex justify-center gap-2">
            {SLIDES.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === slide ? 'w-6 bg-accent' : 'w-1.5 bg-line'
                }`}
              />
            ))}
          </div>

          <div className="mt-5 flex items-center gap-3">
            <button
              onClick={() => setView('class')}
              className="btn-ghost flex-1"
            >
              Überspringen
            </button>
            <button
              onClick={() =>
                slide < SLIDES.length - 1 ? setSlide(slide + 1) : setView('class')
              }
              className="btn-primary flex-[2]"
            >
              {slide < SLIDES.length - 1 ? 'Weiter' : 'Einrichten'}
            </button>
          </div>
        </div>
      )}

      {/* ── Klasse ── */}
      {view === 'class' && (
        <div className="mt-8 space-y-4 animate-fade-in">
          <h2 className="font-display text-lg font-semibold">In welche Klasse gehst du?</h2>
          <div className="grid grid-cols-2 gap-2.5">
            {CLASSES.map((c) => (
              <button
                key={c}
                onClick={() => setClassName(c)}
                className={`rounded-2xl border p-5 text-center font-display text-xl font-bold transition ${
                  config.className === c
                    ? 'border-accent bg-accent/15 text-white shadow-glow'
                    : 'border-line bg-bg-card text-white/60 hover:border-accent/40'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          <button onClick={() => setView('courses')} className="btn-primary mt-4 w-full">
            Weiter
          </button>
        </div>
      )}

      {/* ── Kurse ── */}
      {view === 'courses' && (
        <div className="mt-8 space-y-4 animate-fade-in">
          <div>
            <h2 className="font-display text-lg font-semibold">Deine Wahlfächer</h2>
            <p className="text-sm text-white/50">
              Trag deine Wahlfächer ein: Sprachen (Ital./Lat./Span.), Religion, Ethik …
              Doppelstunden = „2 Std". Keine Wahlfächer? Einfach überspringen.
            </p>
          </div>

          <CourseEditor />

          <div className="flex gap-3 pt-2">
            <button onClick={() => setView('class')} className="btn-ghost flex-1">
              Zurück
            </button>
            <button onClick={completeOnboarding} className="btn-primary flex-[2]">
              Los geht’s 🚀
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
