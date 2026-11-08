'use client'

import { useEffect, useRef } from 'react'
import { getGsap, motionAllowed } from '@v2/lib/gsap'
import { breakEven, type PlanCost } from '@v2/content/use-cases'

interface CostChartProps {
  plans: [PlanCost, PlanCost]
  /** True while this chart's tab is chosen and the card is on screen. */
  playing: boolean
}

/** Drawing area on a 486 × 322 grid, like the reference chart. */
const VIEW_W = 486
const VIEW_H = 322
const PLOT = { left: 48, right: 478, top: 24, bottom: 284 }
const MAX_SALES = 1_000_000
const MAX_COST = 30_000
const X_TICKS = [0, 250_000, 500_000, 750_000, 1_000_000]
const Y_TICKS = [0, 10_000, 20_000, 30_000]
const COLOURS = ['#8A8A93', '#BEFC65'] as const

const DELAY = 0.3
const DURATION = 1.7
const STAGGER = 0.2

const sx = (sales: number) => PLOT.left + (sales / MAX_SALES) * (PLOT.right - PLOT.left)
const sy = (cost: number) => PLOT.bottom - (Math.min(cost, MAX_COST) / MAX_COST) * (PLOT.bottom - PLOT.top)
const costAt = (plan: PlanCost, sales: number) => plan.monthly + plan.fee * sales

/**
 * Tick and crossing labels. The chart illustrates time spent by hand against
 * a build, not measured figures, so it prints no amounts.
 */
function short(value: number): string {
  if (value === 0) return ''
  if (value >= 1_000_000) return ''
  return ''
}

/** One line's hours as the weeks go by, clipped to the top of the chart. */
function linePath(plan: PlanCost): string {
  const end = plan.fee > 0 ? Math.min(MAX_SALES, (MAX_COST - plan.monthly) / plan.fee) : MAX_SALES
  return `M${sx(0)} ${sy(costAt(plan, 0))}L${sx(end)} ${sy(costAt(plan, end))}`
}

/**
 * Hours spent by hand against hours spent on a build, as the weeks go by.
 * The lines draw themselves in on a loop and a dot marks where they cross.
 */
export function CostChart({ plans, playing }: CostChartProps) {
  const lines = useRef<(SVGPathElement | null)[]>([])
  const marker = useRef<SVGGElement>(null)
  const crossing = breakEven(plans[0], plans[1])
  const crossX = sx(crossing)
  const crossY = sy(costAt(plans[0], crossing))

  useEffect(() => {
    const gsap = getGsap()
    const paths = lines.current.filter((path): path is SVGPathElement => !!path)
    const dot = marker.current
    const hide = () => {
      paths.forEach((path) => {
        const length = path.getTotalLength()
        gsap.set(path, { strokeDasharray: length, strokeDashoffset: length })
      })
      if (dot) gsap.set(dot, { opacity: 0 })
    }
    if (!motionAllowed()) {
      gsap.set(paths, { strokeDasharray: 'none', strokeDashoffset: 0 })
      if (dot) gsap.set(dot, { opacity: 1 })
      return
    }
    if (!playing) {
      hide()
      return
    }
    hide()
    const tl = gsap.timeline({ delay: DELAY, repeat: -1, repeatDelay: 1, onRepeat: hide })
    tl.to(paths, { strokeDashoffset: 0, duration: DURATION, ease: 'power2.out', stagger: STAGGER })
    if (dot) tl.to(dot, { opacity: 1, duration: 0.3 }, DURATION * 0.6)
    return () => {
      tl.kill()
    }
  }, [playing])

  return (
    <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className="h-full w-full" aria-hidden="true">
      {Y_TICKS.map((tick) => (
        <g key={tick}>
          <line x1={PLOT.left} x2={PLOT.right} y1={sy(tick)} y2={sy(tick)} stroke="#CFCFD4" strokeDasharray="5 5" />
          <text x={PLOT.left - 8} y={sy(tick) + 4} textAnchor="end" className="fill-navy-500 font-mono text-[11px]">
            {short(tick)}
          </text>
        </g>
      ))}
      {X_TICKS.map((tick) => (
        <text key={tick} x={sx(tick)} y={VIEW_H - 14} textAnchor="middle" className="fill-navy-500 font-mono text-[11px]">
          {short(tick)}
        </text>
      ))}
      {plans.map((plan, index) => (
        <path
          key={plan.name}
          ref={(node) => {
            lines.current[index] = node
          }}
          d={linePath(plan)}
          stroke={COLOURS[index]}
          className="c-uc-chart_line"
        />
      ))}
      <g ref={marker}>
        <circle cx={crossX} cy={crossY} r="5" className="fill-navy-900" />
        <text x={crossX} y={crossY - 12} textAnchor="middle" className="fill-navy-900 font-mono text-[11px]">
          {short(crossing)}
        </text>
      </g>
    </svg>
  )
}
