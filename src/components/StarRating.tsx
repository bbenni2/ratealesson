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

/** Interaktiver Stern-Selektor mit halben Sternen (0,5-Schritte). */
export function StarInput({ value, onChange }: InputProps) {
  const [hover, setHover] = useState(0)
  const active = hover || value
  const size = 44

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex gap-1.5" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((i) => {
          const fill = Math.max(0, Math.min(1, active - (i - 1)))
          return (
            <div key={i} className="relative" style={{ width: size, height: size }}>
              {/* Anzeige */}
              <StarIcon filled width={size} height={size} className="absolute inset-0 text-line" />
              <span
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${fill * 100}%` }}
              >
                <StarIcon
                  filled
                  width={size}
                  height={size}
                  className="text-amber drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]"
                />
              </span>
              {/* zwei Klick-Hälften: links = .5, rechts = ganze */}
              <button
                type="button"
                aria-label={`${i - 0.5} Sterne`}
                onMouseEnter={() => setHover(i - 0.5)}
                onClick={() => onChange(i - 0.5)}
                className="absolute inset-y-0 left-0 w-1/2"
              />
              <button
                type="button"
                aria-label={`${i} Sterne`}
                onMouseEnter={() => setHover(i)}
                onClick={() => onChange(i)}
                className="absolute inset-y-0 right-0 w-1/2"
              />
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
