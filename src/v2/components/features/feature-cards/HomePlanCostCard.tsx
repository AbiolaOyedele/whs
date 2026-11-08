'use client'

import { useEffect, useRef, useState } from 'react'
import { ArtPanel } from '@v2/components/ui/ArtPanel'
import { ParallaxMedia } from '@v2/components/ui/ParallaxMedia'
import { SegmentedControls } from '@v2/components/ui/SegmentedControls'
import { monthlySales, plans, type Plan } from '@v2/content/home-upper'

/** Bars grow over 250ms (shortest) to 4s (longest), then replay after 4s. */
const MIN_MS = 250
const MAX_MS = 4000
const REPLAY_GAP_MS = 4000
/** The dearest plan's bar fills this much of the track. */
const FULL_BAR = 95

interface Row {
  plan: Plan
  /** What the plan costs for the month, in naira, before VAT. */
  cost: number
  /** Bar width, in percent. */
  value: number
  cheapest: boolean
}

/** A month on a plan: its price plus its share of the month's online sales. */
function monthCost(plan: Plan, sales: number): number {
  return plan.monthly + Math.round((sales * plan.feePercent) / 100)
}

function rowsFor(sales: number): Row[] {
  const costs = plans.map((plan) => monthCost(plan, sales))
  const max = Math.max(...costs)
  const min = Math.min(...costs)
  return plans.map((plan, i) => {
    const cost = costs[i] ?? 0
    return { plan, cost, value: Math.max(2, Math.round((cost / max) * FULL_BAR)), cheapest: cost === min }
  })
}

/** ₦1,500,000 → "₦1.5m", ₦18,500 → "₦18.5k". */
function shortNaira(amount: number): string {
  const trim = (n: number) => String(Math.round(n * 10) / 10)
  if (amount >= 1_000_000) return `₦${trim(amount / 1_000_000)}m`
  if (amount >= 1_000) return `₦${trim(amount / 1_000)}k`
  return `₦${amount}`
}

function planLabel(plan: Plan): string {
  const price = plan.monthly === 0 ? '₦0' : `₦${plan.monthly.toLocaleString('en-NG')}`
  return plan.feePercent > 0 ? `${plan.name} : ${price} + ${plan.feePercent}%` : `${plan.name} : ${price}, no fee`
}

const PANELS = monthlySales.map((sales) => ({ sales, rows: rowsFor(sales) }))

interface CycleState {
  inView: boolean
  timer: number | null
  frame: number | null
}

function clearCycle(state: CycleState): void {
  if (state.timer !== null) window.clearTimeout(state.timer)
  if (state.frame !== null) window.cancelAnimationFrame(state.frame)
  state.timer = null
  state.frame = null
}

function resetBars(host: HTMLElement | null): void {
  host?.querySelectorAll<HTMLElement>('[data-plan-bar]').forEach((bar) => {
    bar.style.transitionDuration = '0ms'
    bar.style.width = '0'
    bar.style.opacity = '0'
  })
}

/** Grows the chosen panel's bars, then schedules a replay while on screen. */
function playBars(host: HTMLElement | null, index: number, state: CycleState): void {
  clearCycle(state)
  if (!state.inView || !host) return
  const active = Array.from(host.querySelectorAll<HTMLElement>(`[data-plan-panel="${index}"] [data-plan-bar]`))
  if (!active.length) return
  const values = active.map((bar) => Number(bar.dataset.value) || 0)
  const low = Math.min(...values)
  const span = Math.max(...values) - low || 1
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  resetBars(host)
  state.frame = window.requestAnimationFrame(() => {
    state.frame = null
    if (!state.inView) return
    let longest = MIN_MS
    active.forEach((bar) => {
      const value = Number(bar.dataset.value) || 0
      const ms = reduce ? 0 : MIN_MS + ((value - low) / span) * (MAX_MS - MIN_MS)
      longest = Math.max(longest, ms)
      bar.style.transitionDuration = `${ms}ms`
      bar.style.width = 'var(--value)'
      bar.style.opacity = '1'
    })
    if (!reduce) state.timer = window.setTimeout(() => playBars(host, index, state), longest + REPLAY_GAP_MS)
  })
}

/**
 * Dark artwork behind a frosted panel of bars: what each plan costs for a
 * month of online sales at the chosen size. Bars grow when the card is a
 * quarter on screen, longer bars taking longer, and replay every few seconds.
 * Every figure is worked out from the real plan prices.
 */
export function HomePlanCostCard() {
  const host = useRef<HTMLDivElement>(null)
  const cycle = useRef<CycleState>({ inView: false, timer: null, frame: null })
  const [selected, setSelected] = useState(0)

  useEffect(() => {
    const el = host.current
    const state = cycle.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return
        state.inView = entry.isIntersecting
        if (entry.isIntersecting) playBars(el, selected, state)
        else {
          clearCycle(state)
          resetBars(el)
        }
      },
      { threshold: 0.25 },
    )
    observer.observe(el)
    return () => {
      observer.disconnect()
      clearCycle(state)
    }
  }, [selected])

  return (
    <div
      ref={host}
      className="relative flex justify-center gap-6 overflow-hidden rounded-lg bg-charcoal p-6 md:min-h-[500px]"
    >
      <ParallaxMedia speed={-0.1}>
        <ArtPanel seed={3} />
      </ParallaxMedia>
      <div className="relative z-2 w-full">
        <SegmentedControls
          tabs={monthlySales.map((sales) => shortNaira(sales))}
          onChange={setSelected}
          className="w-full gap-y-6"
          panelsClassName="my-fluid-2xl mx-auto overflow-hidden rounded-md bg-white/90 backdrop-blur-[50px] max-sm:w-full sm:w-[85%]"
          panels={PANELS.map(({ sales, rows }, index) => (
            <div key={sales} data-plan-panel={index} className="flex flex-col gap-4 p-6">
              <p className="sr-only">
                What each plan costs for a month with {shortNaira(sales)} of online sales, before VAT:
              </p>
              {rows.map((row) => (
                <div key={row.plan.name}>
                  <h3 className="text-label text-balance">{planLabel(row.plan)}</h3>
                  <div className="flex items-center gap-2">
                    <div className="h-[5px] w-full rounded-md bg-white">
                      <span
                        data-plan-bar=""
                        data-value={row.value}
                        style={{ ['--value' as string]: `${row.value}%` }}
                        className={`block h-full w-0 rounded-md opacity-0 transition-[width] ease-out ${
                          row.cheapest ? 'bg-pink-500' : 'bg-navy-500'
                        }`}
                      />
                    </div>
                    <p className="text-heading-xs shrink-0 basis-17 text-right">{shortNaira(row.cost)}</p>
                  </div>
                </div>
              ))}
            </div>
          ))}
        />
      </div>
    </div>
  )
}
