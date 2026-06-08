import { useNavigate } from 'react-router-dom'
import { useStudentConfig } from '../hooks/useStudentConfig'
import { formatDayLabel } from '../lib/format'

function GearIcon() {
  return (
    <svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  )
}

export function Header({ now }: { now: Date }) {
  const navigate = useNavigate()
  const { config } = useStudentConfig()

  return (
    <header className="flex items-center justify-between pt-safe">
      <div className="flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-accent-glow text-lg shadow-glow">
          ⭐
        </div>
        <div>
          <div className="flex items-center gap-1.5 leading-none">
            <h1 className="font-display text-lg font-bold">Rate a Lesson</h1>
            <span className="rounded-md border border-amber/40 bg-amber/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-amber">
              Beta
            </span>
          </div>
          <p className="text-xs text-white/40">Klasse {config.className}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <p className="text-right text-xs font-medium capitalize text-white/40">
          {formatDayLabel(now)}
        </p>
        <button
          onClick={() => navigate('/einstellungen')}
          aria-label="Einstellungen"
          className="rounded-full p-2 text-white/40 transition hover:bg-bg-elevated hover:text-white"
        >
          <GearIcon />
        </button>
      </div>
    </header>
  )
}
