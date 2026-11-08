'use client'

import { useEffect, useRef } from 'react'
import type { ChartSeries } from '@v2/content/home-upper'
import { getGsap, motionAllowed } from '@v2/lib/gsap'
import { observeInview } from '@v2/lib/inview'

/** The reference chart's box: plot from x 32 to 520, gridlines 64 apart. */
const WIDTH = 520
const HEIGHT = 287
const LEFT = 32.5
const RIGHT = 519.5
const TOP = 6.5
const BOTTOM = 262.5
const GRID = [262.5, 198.5, 134.5, 70.5, 6.5]
/** Lines draw over 1.7s, 0.2s apart, after 0.3s; replay after a 1s pause. */
const DELAY = 0.3
const DRAW = 1.7
const STAGGER = 0.2

interface HomeAnimatedChartProps {
  series: readonly ChartSeries[]
  max: number
  xTicks: readonly string[]
  /** Only the chart on the chosen tab plays. */
  active: boolean
  title: string
}

/** Readings to a path: level runs joined by short slopes, like the reference. */
function toPath(values: readonly number[], max: number): string {
  if (!values.length) return ''
  const step = (RIGHT - LEFT) / Math.max(values.length - 1, 1)
  const y = (v: number) => BOTTOM - (Math.min(v, max) / max) * (BOTTOM - TOP)
  return values
    .map((v, i) => {
      const x = LEFT + i * step
      if (i === 0) return `M${x} ${y(v)}`
      const prev = values[i - 1] ?? v
      // Hold the previous level for most of the step, then slope to the new one.
      const hold = x - step * 0.35
      return prev === v ? `H${x}` : `H${hold}L${x} ${y(v)}`
    })
    .join('')
}

function hideLine(line: SVGPathElement): void {
  let length = 0
  try {
    length = line.getTotalLength()
  } catch {
    // Some browsers cannot measure a path inside a hidden panel; it is measured again when shown.
    return
  }
  if (!Number.isFinite(length) || length <= 0) return
  line.style.strokeDasharray = `${length}`
  line.style.strokeDashoffset = `${length}`
}

/**
 * A line chart on dashed gridlines. While on screen and on the chosen tab,
 * its lines draw themselves left to right, one after another, then redraw
 * after a pause. Lines are fully drawn when motion is reduced.
 */
export function HomeAnimatedChart({ series, max, xTicks, active, title }: HomeAnimatedChartProps) {
  const host = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = host.current
    if (!el || !motionAllowed()) return
    const gsap = getGsap()
    const lines = Array.from(el.querySelectorAll<SVGPathElement>('path[data-line]'))
    let timeline: gsap.core.Timeline | null = null

    const reset = () => {
      timeline?.kill()
      timeline = null
      lines.forEach(hideLine)
    }
    const play = () => {
      reset()
      timeline = gsap.timeline({ delay: DELAY, repeat: -1, repeatDelay: 1, onRepeat: () => lines.forEach(hideLine) })
      timeline.to(lines, { strokeDashoffset: 0, duration: DRAW, ease: 'power2.out', stagger: STAGGER, overwrite: true })
    }

    reset()
    const stopObserving = observeInview(el, (_entry, visible) => {
      if (visible && active) play()
      else reset()
    })
    return () => {
      stopObserving()
      timeline?.kill()
    }
  }, [active])

  const tickStep = (RIGHT - LEFT) / Math.max(xTicks.length - 1, 1)

  return (
    <div ref={host} className="aspect-520/286 w-full [&_svg]:h-full [&_svg]:w-full">
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} fill="none" role="img" aria-label={title}>
        {GRID.map((y) => (
          <line key={y} x1="32" y1={y} x2="520" y2={y} stroke="#CFCFD4" strokeDasharray="5 5" />
        ))}
        <g opacity="0.7" className="fill-navy-500 font-mono text-[11px]">
          {GRID.map((y, i) => (
            <text key={y} x="26" y={y + 4} textAnchor="end">
              {Math.round((max / (GRID.length - 1)) * i)}
            </text>
          ))}
          {xTicks.map((tick, i) => (
            <text
              key={tick}
              x={LEFT + i * tickStep}
              y="285"
              textAnchor={i === 0 ? 'start' : i === xTicks.length - 1 ? 'end' : 'middle'}
            >
              {tick}
            </text>
          ))}
        </g>
        {series.map((line) => (
          <path
            key={line.label}
            d={toPath(line.values, max)}
            stroke={line.colour}
            strokeWidth="2"
            strokeLinejoin="bevel"
            data-line=""
          />
        ))}
      </svg>
    </div>
  )
}
