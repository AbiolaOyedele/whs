'use client'

import { useEffect, useRef } from 'react'
import { feedChip, feedLines } from '@v2/content/home-upper'
import { observeInview } from '@v2/lib/inview'
import { motionAllowed } from '@v2/lib/gsap'

/** A new line every 80ms; the finished feed stays up for 3.5s, then replays. */
const LINE_MS = 80
const HOLD_MS = 3500

/**
 * A charcoal card with a frosted terminal-style window. When it comes on
 * screen the lines of an example dashboard feed appear one after another
 * (paid orders, a delivery booked, stock running low, packing progress),
 * hold, then clear and start again. All lines show at once when motion is
 * reduced.
 */
export function HomeFeedCard() {
  const host = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = host.current
    if (!el) return
    const lines = Array.from(el.querySelectorAll<HTMLElement>('[data-feed-line]'))
    const show = (line: HTMLElement | undefined, on: boolean) => {
      if (line) line.style.opacity = on ? '1' : '0'
    }
    if (!motionAllowed()) {
      lines.forEach((line) => show(line, true))
      return
    }
    let index = 0
    let timer: number | null = null
    let visible = false
    const cancel = () => {
      if (timer !== null) window.clearTimeout(timer)
      timer = null
    }
    const clear = () => lines.forEach((line) => show(line, false))
    const next = () => {
      if (!visible) return
      if (index < lines.length) {
        show(lines[index], true)
        index += 1
        timer = window.setTimeout(next, LINE_MS)
        return
      }
      timer = window.setTimeout(() => {
        if (!visible) return
        clear()
        index = 0
        next()
      }, HOLD_MS)
    }
    clear()
    const stopObserving = observeInview(el, (_entry, isVisible) => {
      if (isVisible && !visible) {
        visible = true
        next()
      } else if (!isVisible) {
        visible = false
        cancel()
        index = 0
        clear()
      }
    })
    return () => {
      cancel()
      stopObserving()
    }
  }, [])

  return (
    <div
      ref={host}
      className="group/terminal relative grid grid-cols-1 place-content-center gap-6 overflow-hidden rounded-lg bg-charcoal p-6 md:min-h-[462px] @2xl/feature-card:aspect-707/600"
    >
      <div className="relative z-2 @2xl/feature-card:absolute @2xl/feature-card:top-6 @2xl/feature-card:left-6">
        <span className="text-label rounded-sm bg-slate-300 p-2 text-charcoal">{feedChip}</span>
      </div>
      <div className="relative z-2 m-auto flex-col rounded-md bg-white/90 backdrop-blur-[50px] max-sm:w-full sm:w-[85%]">
        <div className="flex-1 p-4 font-mono text-[13px] text-wrap">
          {feedLines.map((line, i) => (
            <div key={i} className="min-h-[1em] leading-[1.07] opacity-0" data-feed-line="">
              {line.done ? <span className="text-pink-500">{line.text}</span> : line.text}
              {line.rest ?? null}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
