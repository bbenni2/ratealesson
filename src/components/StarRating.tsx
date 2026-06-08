import { useState } from 'react'
import { StarIcon } from './icons'

interface DisplayProps {
  /** Durchschnitt 0..5 (auch mit Nachkommastellen). */
  value: number
  size?: number
  className?: string
}

/** Reine Anzeige – unterstützt teilweise gefüllte Sterne (halbe etc.). */
export function StarDisplay({ value, size = 16, className = '' }: DisplayProps) {
  return (
    <div
      className={`inline-flex gap-0.5 ${className}`}
      aria-label={`${value.toFixed(1)} von 5 Sternen`}
    >
      {[1, 2, 3, 4, 5].map((i) => {
        const fill = Math.max(0, Math.min(1, value - (i - 1)))
        return (
          <span key={i} className="relative inline-block" style={{ width: size, height: size }}>
            <StarIcon filled width={size} height={size} className="absolute inset-0 text-line" />
            <span
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${fill * 100}%` }}
            >
              <StarIcon filled width={size} height={size} className="text-amber" />
            </span>
          </span>
        )
      })}
    </div>
  )
}

interface InputProps {
  value: number
  onChange: (stars: number) => void
}

const LABELS: Record<number, string> = {
  1: 'Mies',
  2: 'Naja',
  3: 'Okay',
  4: 'Cool',
  5: 'Mega!',
}

function labelFor(v: number): string {
  if (v <= 0) return ''
  return LABELS[Math.ceil(v)] ?? ''
}

/** Berechnet 0,5 oder ganzen Wert aus der Pointer-X-Position innerhalb eines Sterns. */
function starsAt(e: React.PointerEvent<HTMLDivElement>, starIndex: number): number {
  const { left, width } = e.currentTarget.getBoundingClientRect()
  return e.clientX - left < width / 2 ? starIndex - 0.5 : starIndex
}

/**
 * Interaktiver Stern-Selektor mit halben Sternen (0,5-Schritte).
 *
 * Nutzt Pointer-Events (nicht Mouse-Events) damit es auf Touch-Geräten
 * zuverlässig funktioniert: kein 300 ms-Delay, kein falsches Half-Star
 * durch Touch-Ungenauigkeit.
 */
export function StarInput({ value, onChange }: InputProps) {
  const [hover, setHover] = useState(0)
  const active = hover || value
  const size = 44

  return (
    <div className="flex flex-col items-center gap-2">
      {/* touch-none verhindert Scroll beim Tippen auf die Sterne */}
      <div className="flex touch-none gap-1.5" onPointerLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((i) => {
          const fill = Math.max(0, Math.min(1, active - (i - 1)))
          return (
            <div
              key={i}
              className="relative cursor-pointer select-none"
              style={{ width: size, height: size }}
              onPointerMove={(e) => setHover(starsAt(e, i))}
              onPointerDown={(e) => {
                // preventDefault verhindert den nachfolgenden synthetischen
                // click-Event auf Touch – so wird onChange nur einmal aufgerufen.
                e.preventDefault()
                onChange(starsAt(e, i))
              }}
              role="button"
              aria-label={`${i} oder ${i - 0.5} Sterne`}
            >
              {/* Leerer Stern (Hintergrund) */}
              <StarIcon
                filled
                width={size}
                height={size}
                className="pointer-events-none absolute inset-0 text-line"
              />
              {/* Gefüllter Anteil (Clip-Trick) */}
              <span
                className="pointer-events-none absolute inset-0 overflow-hidden"
                style={{ width: `${fill * 100}%` }}
              >
                <StarIcon
                  filled
                  width={size}
                  height={size}
                  className="text-amber drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]"
                />
              </span>
            </div>
          )
        })}
      </div>
      <span className="flex h-5 items-center gap-1.5 text-sm font-semibold text-amber">
        {active > 0 && <span className="tabular-nums">{active.toFixed(1)}</span>}
        <span>{labelFor(active)}</span>
      </span>
    </div>
  )
}
