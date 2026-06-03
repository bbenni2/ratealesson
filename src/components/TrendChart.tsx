import type { TrendPoint } from '../lib/ratings'

const CHART_H = 100
const LABEL_H = 24
const TOP_PAD = 18  // Platz für Wertelabel über den Balken
const TOTAL_H = TOP_PAD + CHART_H + LABEL_H
const CHART_W = 300

/** Balkenfarbe nach Ø-Bewertung (rot → amber → grün). */
function barColor(avg: number, count: number): string {
  if (count === 0) return 'rgba(255,255,255,0.07)'
  if (avg < 2.5)  return '#f87171'  // rot
  if (avg < 3.5)  return '#fb923c'  // orange
  if (avg < 4.2)  return '#fbbf24'  // amber
  return '#4ade80'                   // grün
}

interface Props {
  data: TrendPoint[]
}

export function TrendChart({ data }: Props) {
  if (data.length === 0) return null

  const n = data.length
  const GAP = n > 8 ? 2 : 4
  const SIDE = 6
  const usableW = CHART_W - SIDE * 2
  const barW = Math.max(8, (usableW - GAP * (n - 1)) / n)

  // Referenzlinie bei 3.0
  const refY = TOP_PAD + CHART_H - (3 / 5) * CHART_H

  return (
    <svg
      viewBox={`0 0 ${CHART_W} ${TOTAL_H}`}
      className="w-full"
      aria-label="Bewertungstrend"
      role="img"
    >
      {/* Referenzlinie bei 3.0 */}
      <line
        x1={SIDE}
        y1={refY}
        x2={CHART_W - SIDE}
        y2={refY}
        stroke="rgba(255,255,255,0.10)"
        strokeWidth="1"
        strokeDasharray="3 3"
      />

      {data.map((point, i) => {
        const x = SIDE + i * (barW + GAP)
        const barH = point.count > 0
          ? Math.max(5, (point.average / 5) * CHART_H)
          : 3
        const y = TOP_PAD + CHART_H - barH
        const color = barColor(point.average, point.count)
        // Label: nur jeden 2. bei ≥9 Balken, aber immer den letzten
        const showLabel = n <= 8 || i % 2 === 0 || i === n - 1

        return (
          <g key={point.period}>
            {/* Balken */}
            <rect
              x={x}
              y={y}
              width={barW}
              height={barH}
              fill={color}
              opacity={point.count > 0 ? 1 : 0.4}
              rx={Math.min(3, barW / 4)}
            />

            {/* Wert über dem Balken */}
            {point.count > 0 && (
              <text
                x={x + barW / 2}
                y={Math.max(TOP_PAD - 2, y - 3)}
                textAnchor="middle"
                fontSize={Math.min(9, barW - 1)}
                fill={color}
                fontWeight="700"
                fontFamily="Space Grotesk, system-ui, sans-serif"
              >
                {point.average.toFixed(1)}
              </text>
            )}

            {/* Periodenbezeichnung */}
            {showLabel && (
              <text
                x={x + barW / 2}
                y={TOP_PAD + CHART_H + LABEL_H - 4}
                textAnchor="middle"
                fontSize={Math.min(8, barW)}
                fill="rgba(255,255,255,0.35)"
                fontFamily="Outfit, system-ui, sans-serif"
              >
                {point.label}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}
