'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { getGsap, motionAllowed } from '@v2/lib/gsap'
import { observeInview } from '@v2/lib/inview'
import { getScrollState } from '@v2/lib/scroll'

/** The row only scrolls when it has this many items or the screen is this narrow. */
const MIN_ITEMS = 8
const NARROW_SCREEN = 1400

interface RailProps {
  children: ReactNode
  itemCount: number
  /** -1 drifts left, 1 drifts right. */
  direction?: 1 | -1
  /** Pixels per frame at rest. */
  velocity?: number
  /** Tile spacing (gutter) instead of logo spacing. */
  tile?: boolean
  /** Always scroll, however few items or wide the screen. */
  forceActive?: boolean
  className?: string
}

/**
 * An endless row (logos or tiles). It drifts on its own and speeds up while
 * the page is being scrolled, in the scroll's direction. Copies of the row are
 * added to fill the screen width.
 */
export function Rail({
  children,
  itemCount,
  direction = 1,
  velocity = 0.35,
  tile = false,
  forceActive = false,
  className = '',
}: RailProps) {
  const host = useRef<HTMLDivElement>(null)
  const container = useRef<HTMLDivElement>(null)
  const pattern = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = host.current
    const track = container.current
    const row = pattern.current
    if (!el || !track || !row || !motionAllowed()) return
    const gsap = getGsap()
    let offset = 0
    let playing = false
    let active = false
    let copies = 0

    const fill = () => {
      const width = row.offsetWidth
      const needed = Math.ceil(window.innerWidth / width) + 1
      if (needed === copies) return
      copies = needed
      track.querySelectorAll('[data-clone]').forEach((clone) => clone.remove())
      for (let i = 0; i < needed - 1; i++) {
        const clone = row.cloneNode(true) as HTMLElement
        clone.setAttribute('data-clone', '')
        clone.setAttribute('aria-hidden', 'true')
        track.appendChild(clone)
      }
      offset = direction === 1 ? -width : 0
    }

    const tick = () => {
      const width = row.offsetWidth
      const scroll = getScrollState()
      const boost = Math.abs(scroll.velocity) * 0.5
      const scrollDirection = scroll.direction === 0 ? 1 : scroll.direction
      offset += (velocity + boost * velocity * 0.6) * direction * scrollDirection
      if (offset <= -width) offset += width
      else if (offset >= 0) offset -= width
      track.style.transform = `translate3d(${offset}px,0,0)`
    }

    const start = () => {
      if (playing) return
      playing = true
      gsap.ticker.add(tick)
    }
    const stop = () => {
      if (!playing) return
      playing = false
      gsap.ticker.remove(tick)
    }

    const update = () => {
      const should = forceActive || itemCount >= MIN_ITEMS || window.innerWidth <= NARROW_SCREEN
      if (should) {
        if (!active) {
          active = true
          el.classList.add('is-initialized')
          fill()
          const box = el.getBoundingClientRect()
          if (box.top < window.innerHeight && box.bottom > 0) start()
          return
        }
        fill()
      } else if (active) {
        active = false
        el.classList.remove('is-initialized')
        stop()
        track.querySelectorAll('[data-clone]').forEach((clone) => clone.remove())
        copies = 0
        offset = 0
        track.style.transform = ''
      }
    }

    update()
    const stopObserving = observeInview(el, (_entry, visible) => (visible && active ? start() : stop()))
    window.addEventListener('resize', update)
    return () => {
      stop()
      stopObserving()
      window.removeEventListener('resize', update)
    }
  }, [itemCount, direction, velocity, forceActive])

  return (
    <div ref={host} className={`c-rail ${tile ? '-tile' : ''} ${className}`}>
      <div ref={container} className="c-rail_container">
        <div ref={pattern} className="c-rail_pattern">
          {children}
        </div>
      </div>
    </div>
  )
}
