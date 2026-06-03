import type { TrendPoint } from '../lib/ratings'

/** Gibt eine Farbe für einen Durchschnittswert zurück (wie IMDB: rot→gelb→grün). */
function barColor(avg: number, count: number): string {
  if (count === 0) return 'rgba(255,255,255,0.07)'
  if (avg >= 4.2) return '#4ade80' // grün
  if (avg >= 3.5) return '#fbbf24' // amber/gold
  if (avg >= 2.5) return '#fb923c' // orange
  return '#f87171' // rot
}

interface Props {
  data: TrendPoint[]
}

const CHART_H = 96
const TOP_PAD = 18 // Platz für den Wert-Label über dem Balken
const BOT_PAD = 22 // Platz für den Zeit-Label unter dem Balken
const SIDE = 4
const VIEW_W = 300

/**
 * SVG-Balkendiagramm für den Bewertungstrend (IMDB-Stil).
 * Balkenfarbe signalisiert Qualität: grün → amber → orange → rot.
 */
export function TrendChart({ data }: Props) {
  if (data.length === 0) return null

  const n = data.length
  const gap = n > 8 ? 2 : 4
  const usableW = VIEW_W - SIDE * 2
  const barW = Math.max(4, (usableW - gap * (n - 1)) / n)
  const totalH = TOP_PAD + CHART_H + BOT_PAD

  // Referenzlinie bei 3.0 (Mitte der Skala)
  const refY = TOP_PAD + CHART_H - (3 / 5) * CHART_H

  // Welche Labels anzeigen (bei vielen Balken nur jeden 2./3.)
  const showLabel = (i: number) => {
    if (n <= 6) return true
    if (n <= 9) return i % 2 === 0
    return i % 3 === 0
  }

  const hasAnyData = data.some((p) => p.count > 0)

  return (
    <div className="relative">
      {/* Y-Achsen-Beschriftung links */}
      <div className="pointer-events-none absolute left-0 top-0 flex flex-col justify-between text-right"
        style={{ height: CHART_H, marginTop: TOP_PAD, width: 20 }}>
        {[5, 3, 1].map((v) => (
          <span key={v} style={{ fontSize: 8, color: 'rgba(255,255,255,0.25)', lineHeight: 1 }}>
            {v}★
          </span>
        ))}
      </div>

      <svg
        viewBox={`0 0 ${VIEW_W} ${totalH}`}
        className="w-full"
        role="img"
        aria-label="Bewertungstrend im Zeitverlauf"
        style={{ marginLeft: 0 }}
      >
        {/* Horizontale Referenzlinien */}
        {[5, 4, 3, 2, 1].map((v) => (
          <line
            key={v}
            x1={SIDE}
            x2={VIEW_W - SIDE}
            y1={TOP_PAD + CHART_H - (v / 5) * CHART_H}
            y2={TOP_PAD + CHART_H - (v / 5) * CHART_H}
            stroke={v === 3 ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)'}
            strokeWidth={v === 3 ? 1.5 : 1}
            strokeDasharray={v === 3 ? '4,3' : undefined}
          />
        ))}

        {/* Referenzlinie-Label "Ø 3" */}
        <text
          x={VIEW_W - SIDE}
          y={refY - 3}
          textAnchor="end"
          fontSize={7}
          fill="rgba(255,255,255,0.25)"
        >
          Ø 3
        </text>

        {/* Balken */}
        {data.map((point, i) => {
          const x = SIDE + i * (barW + gap)
          const rawH = point.count > 0 ? (point.average / 5) * CHART_H : 0
          const barH = rawH > 0 ? Math.max(4, rawH) : 3
          const y = TOP_PAD + CHART_H - barH
          const color = barColor(point.average, point.count)
          const rx = Math.min(3, barW / 3)

          return (
            <g key={point.period}>
              {/* Balken */}
              <rect
                x={x}
                y={y}
                width={barW}
                height={barH}
                fill={color}
                fillOpacity={point.count > 0 ? 1 : 0.4}
                rx={rx}
                ry={rx}
              />

              {/* Glanz-Highlight oben im Balken */}
              {point.count > 0 && barH > 10 && (
                <rect
                  x={x + 1}
                  y={y + 1}
                  width={barW - 2}
                  height={Math.min(4, barH / 3)}
                  fill="white"
                  fillOpacity={0.12}
                  rx={rx}
                />
              )}

              {/* Wert-Label über dem Balken */}
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

              {/* Zeit-Label unter dem Balken */}
              {showLabel(i) && (
                <text
                  x={x + barW / 2}
                  y={TOP_PAD + CHART_H + BOT_PAD - 5}
                  textAnchor="middle"
                  fontSize={Math.min(8, barW - 1)}
                  fill="rgba(255,255,255,0.35)"
                >
                  {point.label}
                </text>
              )}
            </g>
          )
        })}

        {/* Leerer Zustand */}
        {!hasAnyData && (
          <text
            x={VIEW_W / 2}
            y={TOP_PAD + CHART_H / 2 + 4}
            textAnchor="middle"
            fontSize={11}
            fill="rgba(255,255,255,0.2)"
          >
            Noch keine Daten
          </text>
        )}
      </svg>
    </div>
  )
}
