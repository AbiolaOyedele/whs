'use client'

import { useEffect, useRef, useState } from 'react'
import { motionAllowed } from '@v2/lib/gsap'
import { observeInview } from '@v2/lib/inview'

/** Bar count by the row's own width, widest first. */
const COUNTS: [minWidth: number, lines: number][] = [
  [1800, 52],
  [1600, 48],
  [1440, 40],
  [700, 28],
  [0, 18],
]
const MIN_SCALE = 0.15
const MAX_SCALE = 1
/** Share of the gap to its target a bar closes each frame. */
const FOLLOW = 0.04
/** Each bar picks a new height every 180–380ms. */
const RETARGET_MIN = 180
const RETARGET_SPREAD = 200

function lineCountFor(width: number): number {
  return COUNTS.find(([min]) => width >= min)?.[1] ?? 18
}

function between(min: number, max: number): number {
  return min + Math.random() * (max - min)
}

/** A fixed starting height per bar, so the server and browser draw the same thing. */
function restingScale(index: number): number {
  const wave = (Math.sin(index * 1.7) + Math.sin(index * 0.6 + 1)) / 4 + 0.5
  return MIN_SCALE + wave * (MAX_SCALE - MIN_SCALE)
}

/**
 * A row of thin white and pink bars under the hero that rise and fall like a
 * level meter. Each bar eases toward a random height and picks a new one every
 * few hundred milliseconds; it only runs while on screen.
 */
export function VoiceVisualizer() {
  const host = useRef<HTMLDivElement>(null)
  const [count, setCount] = useState(COUNTS[COUNTS.length - 1]?.[1] ?? 18)

  useEffect(() => {
    const el = host.current
    if (!el) return
    const update = () => setCount(lineCountFor(el.getBoundingClientRect().width || window.innerWidth))
    update()
    const resize = new ResizeObserver(update)
    resize.observe(el)
    return () => resize.disconnect()
  }, [])

  useEffect(() => {
    const el = host.current
    if (!el || !motionAllowed()) return
    const lines = Array.from(el.children) as HTMLElement[]
    const now = performance.now()
    const scales = lines.map((_, index) => restingScale(index))
    const targets = lines.map(() => between(MIN_SCALE, MAX_SCALE))
    const nextAt = lines.map(() => now + between(RETARGET_MIN, RETARGET_MIN + RETARGET_SPREAD))
    let frame: number | null = null

    const tick = () => {
      frame = requestAnimationFrame(tick)
      const time = performance.now()
      lines.forEach((line, index) => {
        if (time >= (nextAt[index] ?? 0)) {
          targets[index] = between(MIN_SCALE, MAX_SCALE)
          nextAt[index] = time + between(RETARGET_MIN, RETARGET_MIN + RETARGET_SPREAD)
        }
        const current = scales[index] ?? MIN_SCALE
        const next = current + ((targets[index] ?? current) - current) * FOLLOW
        scales[index] = next
        line.style.transform = `scaleY(${Math.max(MIN_SCALE, Math.min(MAX_SCALE, next))})`
      })
    }
    const stop = () => {
      if (frame !== null) cancelAnimationFrame(frame)
      frame = null
    }

    const unobserve = observeInview(el, (_entry, visible) => {
      if (visible && frame === null) frame = requestAnimationFrame(tick)
      if (!visible) stop()
    })
    return () => {
      unobserve()
      stop()
    }
  }, [count])

  return (
    <div ref={host} className="c-voice-visualizer" aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          className="c-voice-visualizer_line"
          style={{ transform: `scaleY(${restingScale(index).toFixed(3)})` }}
        />
      ))}
    </div>
  )
}
