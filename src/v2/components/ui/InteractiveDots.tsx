'use client'

import { useEffect, useRef, useState } from 'react'
import { observeInview } from '@v2/lib/inview'

const NARROW = 700
const NARROW_GRID = { columns: 6, count: 24 }
const WIDE_GRID = { columns: 20, count: 100 }
/** Quiet this long and the grid starts lighting random dots by itself. */
const IDLE_AFTER_MS = 1800
const IDLE_MIN_MS = 800
const IDLE_MAX_MS = 1500
/** A dot under the pointer stays lit this long. */
const TRAIL_MS = 2400
const MAX_TRAIL = 45

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * A grid of tiny dots. Moving the pointer over it lights pink squares that
 * fade after a moment; left alone, it lights one to five random dots every
 * second or so.
 */
export function InteractiveDots({ className = '' }: { className?: string }) {
  const host = useRef<HTMLDivElement>(null)
  const [grid, setGrid] = useState(WIDE_GRID)

  useEffect(() => {
    const el = host.current
    if (!el) return
    const measure = () => setGrid((el.getBoundingClientRect().width || window.innerWidth) < NARROW ? NARROW_GRID : WIDE_GRID)
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  useEffect(() => {
    const el = host.current
    if (!el) return
    const dots = () => Array.from(el.querySelectorAll<HTMLElement>('[data-dot]'))
    const trail: HTMLElement[] = []
    const timeouts = new Set<number>()
    let idleTimer: number | null = null
    let idleTick: number | null = null
    let idle = false

    const clearIdle = () => {
      if (idleTimer !== null) window.clearTimeout(idleTimer)
      if (idleTick !== null) window.clearTimeout(idleTick)
      idleTimer = null
      idleTick = null
    }

    const tickIdle = () => {
      const all = dots()
      all.forEach((dot) => !dot.classList.contains('is-trail') && dot.classList.remove('is-active'))
      const shuffled = [...all].sort(() => Math.random() - 0.5)
      const lit = Math.min(randomBetween(1, 5), all.length)
      for (let i = 0; i < lit; i++) shuffled[i]?.classList.add('is-active')
    }

    const scheduleIdle = () => {
      if (!idle) return
      idleTick = window.setTimeout(() => {
        tickIdle()
        scheduleIdle()
      }, randomBetween(IDLE_MIN_MS, IDLE_MAX_MS))
    }

    const startIdleTimer = () => {
      clearIdle()
      idle = false
      idleTimer = window.setTimeout(() => {
        idle = true
        scheduleIdle()
      }, IDLE_AFTER_MS)
    }

    const stopAll = () => {
      idle = false
      clearIdle()
      timeouts.forEach((t) => window.clearTimeout(t))
      timeouts.clear()
      dots().forEach((dot) => dot.classList.remove('is-active', 'is-trail'))
      trail.length = 0
    }

    const onMove = (event: MouseEvent) => {
      const rect = el.getBoundingClientRect()
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) return
      startIdleTimer()
      const hit = document.elementFromPoint(event.clientX, event.clientY)
      const dot = hit?.closest<HTMLElement>('[data-dot]')
      if (!dot || !el.contains(dot) || trail[trail.length - 1] === dot) return
      while (trail.length >= MAX_TRAIL) trail.shift()?.classList.remove('is-active', 'is-trail')
      trail.push(dot)
      dot.classList.add('is-active', 'is-trail')
      const timeout = window.setTimeout(() => {
        timeouts.delete(timeout)
        const index = trail.indexOf(dot)
        if (index !== -1) trail.splice(index, 1)
        dot.classList.remove('is-active', 'is-trail')
      }, TRAIL_MS)
      timeouts.add(timeout)
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    const stopObserving = observeInview(el, (_entry, visible) => (visible ? startIdleTimer() : stopAll()))
    return () => {
      window.removeEventListener('mousemove', onMove)
      stopObserving()
      stopAll()
    }
  }, [grid])

  return (
    <div
      ref={host}
      aria-hidden="true"
      className={`c-interactive-dots ${className}`}
      style={{ ['--cols' as string]: String(grid.columns) }}
    >
      {Array.from({ length: grid.count }, (_, i) => (
        <div key={i} className="c-interactive-dots_dot" data-dot="" />
      ))}
    </div>
  )
}
