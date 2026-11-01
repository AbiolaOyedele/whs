/**
 * One counted thing over time. The generic sibling of TimeSeriesChart.
 *
 * TimeSeriesChart is locked to the site analytics shape (visitors + views in
 * one tooltip) on purpose — that pairing is a correlated pair with a shared
 * unit. The product dashboards (Dory, Rayo, Planes, Amber) each have their
 * own single counted event — expenses, quotes, tasks, banners — with its own
 * unit and its own magnitude, so mixing it onto someone else's scale would
 * invent a correlation that isn't there (see chart-tokens.ts). This component
 * plots exactly one series, and a page that wants two metrics renders two of
 * these rather than one dual-axis chart.
 *
 * Visuals are deliberately identical to TimeSeriesChart: same grid, same
 * crosshair-and-tooltip interaction, same peak marker, same table fallback.
 * One chart language across the whole admin, not a bespoke one per page.
 */
import { useMemo, useRef, useState } from 'react'
import { CHART_GRID, CHART_INK, CHART_WASH } from './chart-tokens'

export interface TrendPoint {
  date: string
  value: number
}

interface Props {
  series: TrendPoint[]
  /** Caption above the chart, e.g. "Expenses logged". */
  label: string
  /** Noun for the tooltip and table column, e.g. "expenses", "quotes". */
  unitLabel: string
  /** Rendered when there is nothing to plot for this window. */
  emptyMessage?: string
}

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

export function TrendChart({ series, label, unitLabel, emptyMessage }: Props) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [hover, setHover] = useState<number | null>(null)

  const geometry = useMemo(() => {
    if (series.length === 0) return null

    const max = Math.max(...series.map((point) => point.value), 1)
    const innerWidth = WIDTH - PAD_LEFT - PAD_RIGHT
    const step = series.length > 1 ? innerWidth / (series.length - 1) : 0

    const points = series.map((point, index) => ({
      ...point,
      x: PAD_LEFT + (series.length > 1 ? index * step : innerWidth / 2),
      y: PLOT_HEIGHT - 12 - (point.value / max) * (PLOT_HEIGHT - 24),
    }))

    const line = points.map((point) => `${point.x},${point.y}`).join(' ')
    const area = `${PAD_LEFT},${PLOT_HEIGHT} ${line} ${PAD_LEFT + innerWidth},${PLOT_HEIGHT}`

    const peakIndex = points.reduce(
      (best, point, index) => (point.value > (points[best]?.value ?? 0) ? index : best),
      0
    )

    return { points, line, area, max, peakIndex }
  }, [series])

  if (!geometry) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center">
        <p className="text-base text-muted-foreground">
          {emptyMessage ?? 'Nothing recorded in this period yet.'}
        </p>
      </div>
    )
  }

  const { points, line, area, max, peakIndex } = geometry
  const active = hover !== null ? points[hover] : null
  const peak = points[peakIndex]

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
        Peak {peak?.value.toLocaleString('en-GB')} on {formatDate(peak?.date ?? '')}
      </p>

      <div className="relative">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="w-full touch-none"
          role="img"
          aria-label={`${label}. Peak ${peak?.value} ${unitLabel} on ${formatDate(peak?.date ?? '')}.`}
          onPointerMove={handleMove}
          onPointerLeave={() => setHover(null)}
        >
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
              {active.value.toLocaleString('en-GB')} {unitLabel}
            </p>
          </div>
        )}
      </div>

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
                <th scope="col" className="py-2 text-right font-normal capitalize">
                  {unitLabel}
                </th>
              </tr>
            </thead>
            <tbody>
              {series.map((point) => (
                <tr key={point.date} className="border-t border-border">
                  <td className="py-2">{formatDate(point.date)}</td>
                  <td className="py-2 text-right tabular-nums">
                    {point.value.toLocaleString('en-GB')}
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
