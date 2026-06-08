import { useNavigate } from 'react-router-dom'
import { CLASSES } from '../config/classes'
import { useStudentConfig } from '../hooks/useStudentConfig'
import { useToast } from '../hooks/useToast'
import { AccountSection } from '../components/AccountSection'
import { CourseEditor } from '../components/CourseEditor'

export function SettingsView() {
  const navigate = useNavigate()
  const { config, setClassName, reset } = useStudentConfig()
  const { toast } = useToast()

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between pt-safe">
        <div>
          <h1 className="font-display text-2xl font-bold">Einstellungen ⚙️</h1>
          <p className="text-sm text-white/40">Klasse & deine Wahlfächer verwalten.</p>
        </div>
        <button onClick={() => navigate('/')} className="btn-ghost">
          Fertig
        </button>
      </header>

      {/* Konto */}
      <section className="space-y-2.5">
        <h2 className="font-display text-sm font-bold uppercase tracking-wide text-white/50">
          Konto
        </h2>
        <AccountSection />
      </section>

      {/* Klasse */}
      <section className="space-y-2.5">
        <h2 className="font-display text-sm font-bold uppercase tracking-wide text-white/50">
          Klasse
        </h2>
        <div className="grid grid-cols-3 gap-2.5">
          {CLASSES.map((c) => (
            <button
              key={c}
              onClick={() => setClassName(c)}
              className={`rounded-xl border p-3 text-center font-display font-bold transition ${
                config.className === c
                  ? 'border-accent bg-accent/15 text-white shadow-glow'
                  : 'border-line bg-bg-card text-white/60'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </section>

      {/* Kurse */}
      <section className="space-y-2.5">
        <h2 className="font-display text-sm font-bold uppercase tracking-wide text-white/50">
          Deine Wahlfächer
        </h2>
        <CourseEditor />
      </section>

      {/* Zurücksetzen */}
      <section className="pt-2">
        <button
          onClick={() => {
            if (confirm('Wirklich alle Einstellungen auf diesem Gerät zurücksetzen?')) {
              reset()
              toast('Einstellungen zurückgesetzt.', 'info')
              navigate('/')
            }
          }}
          className="w-full rounded-xl border border-red-500/30 bg-red-500/10 py-2.5 text-sm font-semibold text-red-300 transition active:scale-[0.98]"
        >
          Alles zurücksetzen
        </button>
      </section>
    </div>
  )
}
