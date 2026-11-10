'use client'

import { useEffect, useRef } from 'react'
import { launchCard } from '@v2/content/home-upper'
import { useRevealOnce } from './useRevealOnce'
import { WhyPanel } from './WhyPanel'

/** The count and the track run together: 0.3s in, over 2.4s, easing out (see home.css). */
const DELAY_MS = 300
const RUN_MS = 2400

function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3
}

/** When a step is reached, as a share of the run: the inverse of easeOutCubic at its place on the track. */
function stepDelay(index: number, count: number): number {
  const place = count > 1 ? index / (count - 1) : 1
  const t = 1 - (1 - place) ** (1 / 3)
  return DELAY_MS + t * RUN_MS
}

/**
 * Lime panel, the card's one lime: the hours from an approved design to a
 * live website count up to 72 while a solid ink line runs over the dashed
 * one under the three steps, each step filling as the line reaches it.
 */
export function WhyLaunchCard() {
  const [ref, stage] = useRevealOnce<HTMLDivElement>()
  const count = useRef<HTMLSpanElement>(null)
  const { hours, steps } = launchCard

  useEffect(() => {
    const el = count.current
    if (!el || stage === 'static') return
    if (stage === 'waiting') {
      el.textContent = '0'
      return
    }
    let frame = 0
    const start = performance.now() + DELAY_MS
    const tick = (now: number) => {
      const t = Math.min(1, Math.max(0, (now - start) / RUN_MS))
      el.textContent = String(Math.round(easeOutCubic(t) * hours))
      if (t < 1) frame = window.requestAnimationFrame(tick)
    }
    frame = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(frame)
  }, [stage, hours])

  return (
    <WhyPanel tone="lime" stage={stage} panelRef={ref} className="justify-between gap-10">
      <div className="flex flex-col items-start">
        <p className="sr-only">
          {hours} {launchCard.unit} {launchCard.caption}.
        </p>
        <p aria-hidden="true" className="flex items-end gap-3">
          <span ref={count} className="c-why-display text-[clamp(6rem,30cqw,12rem)] tabular-nums">
            {hours}
          </span>
          <span className="c-why-display mb-[0.6em] text-[clamp(1.5rem,5cqw,2.25rem)]">{launchCard.unit}</span>
        </p>
        <p aria-hidden="true" className="text-body-md max-w-80">
          {launchCard.caption}
        </p>
      </div>

      <ol className="relative grid grid-cols-3 gap-2 pt-8">
        <span aria-hidden="true" className="absolute top-[7px] right-2 left-2 border-t-2 border-dashed border-charcoal">
          <span className="c-why-track absolute -top-0.5 right-0 left-0 block h-0.5 bg-charcoal" />
        </span>
        {steps.map((step, index) => (
          <li
            key={step}
            className={`text-body-sm relative flex flex-col ${
              index === 0 ? 'items-start text-left' : index === steps.length - 1 ? 'items-end text-right' : 'items-center text-center'
            }`}
          >
            <span
              aria-hidden="true"
              style={{ ['--why-delay' as string]: `${stepDelay(index, steps.length)}ms` }}
              className="c-why-node absolute -top-8 size-4 rounded-full border-2 border-charcoal bg-charcoal"
            />
            <span className="max-w-32">{step}</span>
          </li>
        ))}
      </ol>
    </WhyPanel>
  )
}
