/**
 * Visitors over time. One series, area plus line.
 *
 * One series on purpose. Visitors and page views on one plot would either need
 * two y-scales (which invents a correlation that is not in the data) or would
 * flatten visitors against the larger number. Page views is a stat tile
 * instead, which is what a single number deserves.
 *
 * Inline SVG rather than a charting library: one chart does not justify a
 * dependency, and hand-drawn marks are the only way to hold the brand's line
 * weights and radii exactly.
 *
 * Interaction is not optional on an HTML chart, so there is a crosshair and a
 * tooltip, plus a table view underneath for anyone the hover layer does not
 * reach.
 */
import { useMemo, useRef, useState } from 'react'
import { CHART_GRID, CHART_INK, CHART_WASH } from './chart-tokens'
import type { AnalyticsPoint } from '@/lib/admin/analytics'

interface Props {
  series: AnalyticsPoint[]
  label: string
}

/* A viewBox-based coordinate space, scaled by CSS. The x-axis band is inside
   the box, so the card never grows a nested scrollbar to reach the labels. */
const WIDTH = 720
const PLOT_HEIGHT = 220
const AXIS_BAND = 28
const HEIGHT = PLOT_HEIGHT + AXIS_BAND
const PAD_LEFT = 8
const PAD_RIGHT = 8

const dayFormat = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' })

function formatDate(value: string): string {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : dayFormat.format(date)
}

export function TimeSeriesChart({ series, label }: Props) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [hover, setHover] = useState<number | null>(null)

  const geometry = useMemo(() => {
    if (series.length === 0) return null

    const max = Math.max(...series.map((point) => point.visitors), 1)
    const innerWidth = WIDTH - PAD_LEFT - PAD_RIGHT
    const step = series.length > 1 ? innerWidth / (series.length - 1) : 0

    const points = series.map((point, index) => ({
      ...point,
      x: PAD_LEFT + (series.length > 1 ? index * step : innerWidth / 2),
      // 12px of headroom so the peak marker is never clipped by the viewBox.
      y: PLOT_HEIGHT - 12 - (point.visitors / max) * (PLOT_HEIGHT - 24),
    }))

    const line = points.map((point) => `${point.x},${point.y}`).join(' ')
    const area = `${PAD_LEFT},${PLOT_HEIGHT} ${line} ${PAD_LEFT + innerWidth},${PLOT_HEIGHT}`

    const peakIndex = points.reduce(
      (best, point, index) => (point.visitors > (points[best]?.visitors ?? 0) ? index : best),
      0
    )

    return { points, line, area, max, peakIndex }
  }, [series])

  if (!geometry) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center">
        <p className="text-base text-muted-foreground">No visits recorded in this period yet.</p>
      </div>
    )
  }

  const { points, line, area, max, peakIndex } = geometry
  const active = hover !== null ? points[hover] : null
  const peak = points[peakIndex]

  /** Maps a pointer position to the nearest data point. */
  const handleMove = (event: React.PointerEvent<SVGSVGElement>) => {
    const svg = svgRef.current
    if (!svg) return

    const rect = svg.getBoundingClientRect()
    const ratio = (event.clientX - rect.left) / rect.width
    const index = Math.round(ratio * (points.length - 1))
    setHover(Math.min(points.length - 1, Math.max(0, index)))
  }

  return (
    <figure className="rounded-2xl border border-border bg-card p-5">
      <figcaption className="mb-1 font-display text-lg">{label}</figcaption>
      <p className="mb-4 text-sm text-muted-foreground">
        Peak {peak?.visitors.toLocaleString('en-GB')} on {formatDate(peak?.date ?? '')}
      </p>

      <div className="relative">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="w-full touch-none"
          role="img"
          aria-label={`${label}. Peak ${peak?.visitors} on ${formatDate(peak?.date ?? '')}.`}
          onPointerMove={handleMove}
          onPointerLeave={() => setHover(null)}
        >
          {/* Recessive grid: solid hairlines, one shade off the surface. */}
          {[0, 0.5, 1].map((fraction) => {
            const y = 12 + fraction * (PLOT_HEIGHT - 24)
            return (
              <line
                key={fraction}
                x1={PAD_LEFT}
                x2={WIDTH - PAD_RIGHT}
                y1={y}
                y2={y}
                stroke={CHART_GRID}
                strokeWidth={1}
              />
            )
          })}

          <polygon points={area} fill={CHART_WASH} />
          <polyline
            points={line}
            fill="none"
            stroke={CHART_INK}
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {/* Peak marker. Selectively labelled — a number on every point is chaos. */}
          {peak && (
            <circle
              cx={peak.x}
              cy={peak.y}
              r={4.5}
              fill={CHART_INK}
              stroke="var(--card)"
              strokeWidth={2}
            />
          )}

          {active && (
            <>
              <line
                x1={active.x}
                x2={active.x}
                y1={12}
                y2={PLOT_HEIGHT}
                stroke={CHART_GRID}
                strokeWidth={1}
              />
              <circle
                cx={active.x}
                cy={active.y}
                r={5}
                fill={CHART_INK}
                stroke="var(--card)"
                strokeWidth={2}
              />
            </>
          )}

          {/* X axis: first, middle and last only. More collide at this width. */}
          {[0, Math.floor(points.length / 2), points.length - 1]
            .filter((index, position, all) => all.indexOf(index) === position)
            .map((index) => {
              const point = points[index]
              if (!point) return null
              return (
                <text
                  key={index}
                  x={point.x}
                  y={PLOT_HEIGHT + 18}
                  textAnchor={
                    index === 0 ? 'start' : index === points.length - 1 ? 'end' : 'middle'
                  }
                  className="fill-[var(--muted-foreground)] text-[11px]"
                >
                  {formatDate(point.date)}
                </text>
              )
            })}
        </svg>

        {active && (
          <div
            role="status"
            className="pointer-events-none absolute top-0 rounded-xl border border-border bg-card px-3 py-2 shadow-sm"
            style={{
              left: `${(active.x / WIDTH) * 100}%`,
              transform: `translateX(${active.x > WIDTH * 0.6 ? '-100%' : '0'})`,
            }}
          >
            <p className="text-sm text-muted-foreground">{formatDate(active.date)}</p>
            <p className="text-base tabular-nums">
              {active.visitors.toLocaleString('en-GB')} visitors
            </p>
            <p className="text-sm text-muted-foreground tabular-nums">
              {active.views.toLocaleString('en-GB')} views
            </p>
          </div>
        )}
      </div>

      {/* Table view, so the data is reachable without a pointer. */}
      <details className="mt-4">
        <summary className="min-h-11 cursor-pointer list-none text-sm text-muted-foreground underline">
          View as a table
        </summary>
        <div className="mt-3 max-h-64 overflow-x-auto overflow-y-auto">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 bg-card">
              <tr className="text-muted-foreground">
                <th scope="col" className="py-2 font-normal">
                  Date
                </th>
                <th scope="col" className="py-2 text-right font-normal">
                  Visitors
                </th>
                <th scope="col" className="py-2 text-right font-normal">
                  Views
                </th>
              </tr>
            </thead>
            <tbody>
              {series.map((point) => (
                <tr key={point.date} className="border-t border-border">
                  <td className="py-2">{formatDate(point.date)}</td>
                  <td className="py-2 text-right tabular-nums">
                    {point.visitors.toLocaleString('en-GB')}
                  </td>
                  <td className="py-2 text-right tabular-nums">
                    {point.views.toLocaleString('en-GB')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>

      <p className="sr-only">Highest recorded value in this period: {max}.</p>
    </figure>
  )
}
