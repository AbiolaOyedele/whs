'use client'

import { useEffect, useRef } from 'react'
import { launchCard } from '@v2/content/home-upper'
import { motionAllowed } from '@v2/lib/gsap'
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
 * Lime panel: the hours from an approved design to a live website count up
 * to 72 while a track fills under the three steps, each step lighting as the
 * fill reaches it. Shows the finished state at once with reduced motion.
 */
export function WhyLaunchCard() {
  const [ref, revealed] = useRevealOnce<HTMLDivElement>()
  const count = useRef<HTMLSpanElement>(null)
  const { hours, steps } = launchCard

  useEffect(() => {
    const el = count.current
    if (!el || !revealed) return
    if (!motionAllowed()) {
      el.textContent = String(hours)
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
  }, [revealed, hours])

  return (
    <WhyPanel tone="lime" revealed={revealed} panelRef={ref} className="justify-between gap-8">
      <p className="self-start">
        <span className="text-label inline-block rounded-sm bg-charcoal px-2 py-1.5 text-pink-500">{launchCard.chip}</span>
      </p>

      <div className="flex flex-col items-start">
        <p className="sr-only">
          {hours} {launchCard.unit} {launchCard.caption}.
        </p>
        <p aria-hidden="true" className="flex items-end gap-3">
          <span ref={count} className="c-why-display text-[clamp(6rem,30cqw,12rem)] tabular-nums">
            0
          </span>
          <span className="c-why-display mb-[0.6em] text-[clamp(1.5rem,5cqw,2.25rem)]">{launchCard.unit}</span>
        </p>
        <p aria-hidden="true" className="text-body-md max-w-80 text-charcoal/75">
          {launchCard.caption}
        </p>
      </div>

      <ol className="relative grid grid-cols-3 gap-2 pt-7">
        <span aria-hidden="true" className="absolute top-[7px] right-[7px] left-[7px] h-0.5 rounded-full bg-charcoal/15">
          <span className="c-why-track block h-full rounded-full bg-charcoal" />
        </span>
        {steps.map((step, index) => (
          <li
            key={step}
            className={`text-body-sm relative flex flex-col gap-2 ${
              index === 0 ? 'items-start text-left' : index === steps.length - 1 ? 'items-end text-right' : 'items-center text-center'
            }`}
          >
            <span
              aria-hidden="true"
              style={{ ['--why-delay' as string]: `${stepDelay(index, steps.length)}ms` }}
              className="c-why-node absolute -top-7 size-4 rounded-full border-2 border-charcoal bg-pink-500"
            />
            <span className="max-w-32">{step}</span>
          </li>
        ))}
      </ol>
    </WhyPanel>
  )
}
