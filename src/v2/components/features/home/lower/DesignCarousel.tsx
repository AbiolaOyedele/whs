'use client'

import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { motionAllowed } from '@v2/lib/gsap'
import type { ShopDesignTile } from '@v2/content/home-lower'
import { DesignTile } from './DesignTile'
import { SplitArrow } from './SplitArrow'

interface DesignCarouselProps {
  tiles: ShopDesignTile[]
}

/** Snap animation, as the reference carousel (300ms, CSS `ease`). */
const SNAP_MS = 300
/** Drag past an end gives way less and less (the reference's resistance ratio). */
const RESISTANCE = 0.85
/** A flick shorter than this moves one slide whichever way it went. */
const SHORT_SWIPE_MS = 300
/** Movement under this many pixels is a click, not a drag. */
const DRAG_THRESHOLD = 5
/** Wheel events closer together than this belong to one gesture. */
const WHEEL_GESTURE_GAP_MS = 150

const ARROW_BUTTON =
  'button group relative isolate inline-flex cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-sm bg-white text-navy-900 slate:bg-white disabled:cursor-default disabled:opacity-50 md:h-13.5 md:w-13.5 max-md:h-10.5 max-md:w-10.5'
const ARROW_FILL =
  'pointer-events-none absolute inset-0 -z-10 rounded-[inherit] bg-pink-100 opacity-0 transition-[transform,opacity] duration-200 ease-(--ease) [transform:scale3d(0.9,0.7,1)] group-hover:opacity-100 group-hover:[transform:scale3d(1,1,1)] group-disabled:opacity-0 group-disabled:[transform:scale3d(0.9,0.7,1)]'

interface DragState {
  pointerId: number
  startX: number
  startY: number
  startTranslate: number
  startTime: number
  moved: boolean
  /** Decided on the first real move: horizontal drags the carousel, vertical lets the page scroll. */
  axis: 'x' | 'y' | null
}

/**
 * The designs carousel: 1.25 tiles per view on a phone, 2 from 700px, 3
 * from 1000px, 15px apart. Drag or flick to move (it snaps to the nearest
 * tile and resists past the ends), use the arrows, or scroll sideways on a
 * trackpad for one tile per gesture. Tiles run past the container edge; the
 * section clips them at the screen edge.
 */
export function DesignCarousel({ tiles }: DesignCarouselProps) {
  const root = useRef<HTMLDivElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const slides = useRef<(HTMLDivElement | null)[]>([])
  const snaps = useRef<number[]>([0])
  const translate = useRef(0)
  const drag = useRef<DragState | null>(null)
  const suppressClick = useRef(false)
  const wheel = useRef({ lastEvent: 0, used: false })
  const [index, setIndex] = useState(0)
  const [snapCount, setSnapCount] = useState(1)
  const indexRef = useRef(0)

  const apply = useCallback((x: number, animate: boolean) => {
    const el = track.current
    if (!el) return
    translate.current = x
    el.style.transitionDuration = animate && motionAllowed() ? `${SNAP_MS}ms` : '0ms'
    el.style.transform = `translate3d(${x}px, 0, 0)`
  }, [])

  /** Snap points: each tile's left edge, capped where the last tile meets the container's right edge. */
  const measure = useCallback(() => {
    const host = root.current
    const el = track.current
    if (!host || !el) return
    const max = Math.max(0, el.scrollWidth - host.clientWidth)
    const points: number[] = []
    for (const slide of slides.current) {
      if (!slide) continue
      const left = Math.min(slide.offsetLeft, max)
      if (points.length === 0 || left - (points[points.length - 1] ?? 0) > 1) points.push(left)
      if (left >= max) break
    }
    snaps.current = points.length ? points : [0]
    setSnapCount(snaps.current.length)
    const clamped = Math.min(indexRef.current, snaps.current.length - 1)
    indexRef.current = clamped
    setIndex(clamped)
    apply(-(snaps.current[clamped] ?? 0), false)
  }, [apply])

  const goTo = useCallback(
    (next: number) => {
      const last = snaps.current.length - 1
      const target = Math.max(0, Math.min(last, next))
      indexRef.current = target
      setIndex(target)
      apply(-(snaps.current[target] ?? 0), true)
    },
    [apply],
  )

  useEffect(() => {
    const host = root.current
    if (!host) return
    measure()
    const observer = new ResizeObserver(() => measure())
    observer.observe(host)
    return () => observer.disconnect()
  }, [measure])

  // Sideways trackpad or wheel scroll moves one tile per gesture; vertical scroll is left to the page.
  useEffect(() => {
    const host = root.current
    if (!host) return
    const onWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return
      event.preventDefault()
      const now = performance.now()
      const state = wheel.current
      if (now - state.lastEvent > WHEEL_GESTURE_GAP_MS) state.used = false
      state.lastEvent = now
      if (state.used || Math.abs(event.deltaX) < 4) return
      state.used = true
      goTo(indexRef.current + (event.deltaX > 0 ? 1 : -1))
    }
    host.addEventListener('wheel', onWheel, { passive: false })
    return () => host.removeEventListener('wheel', onWheel)
  }, [goTo])

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return
    suppressClick.current = false
    drag.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startTranslate: translate.current,
      startTime: performance.now(),
      moved: false,
      axis: null,
    }
  }

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const state = drag.current
    if (!state || state.pointerId !== event.pointerId) return
    const dx = event.clientX - state.startX
    const dy = event.clientY - state.startY
    if (state.axis === null) {
      if (Math.abs(dx) < DRAG_THRESHOLD && Math.abs(dy) < DRAG_THRESHOLD) return
      state.axis = Math.abs(dx) >= Math.abs(dy) ? 'x' : 'y'
      if (state.axis === 'y') {
        drag.current = null
        return
      }
      state.moved = true
      root.current?.setPointerCapture(event.pointerId)
    }
    const min = -(snaps.current[snaps.current.length - 1] ?? 0)
    let next = state.startTranslate + dx
    if (next > 0) next = -1 + (1 + next) ** RESISTANCE
    else if (next < min) next = min + 1 - (1 + min - next) ** RESISTANCE
    apply(next, false)
  }

  const endDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    const state = drag.current
    if (!state || state.pointerId !== event.pointerId) return
    drag.current = null
    if (root.current?.hasPointerCapture(event.pointerId)) root.current.releasePointerCapture(event.pointerId)
    if (!state.moved) return
    suppressClick.current = true
    const dx = event.clientX - state.startX
    const quick = performance.now() - state.startTime < SHORT_SWIPE_MS
    if (quick && Math.abs(dx) > 10) {
      goTo(indexRef.current + (dx < 0 ? 1 : -1))
      return
    }
    const position = -translate.current
    let nearest = 0
    snaps.current.forEach((point, i) => {
      if (Math.abs(point - position) < Math.abs((snaps.current[nearest] ?? 0) - position)) nearest = i
    })
    goTo(nearest)
  }

  /** Tabbing onto a tile that sits off screen brings it into view. */
  const onFocus = (slideIndex: number) => {
    const host = root.current
    const slide = slides.current[slideIndex]
    if (!host || !slide) return
    // Focus can scroll the clipping section sideways; undo that before moving the track ourselves.
    const clip = host.closest<HTMLElement>('.overflow-hidden')
    if (clip) clip.scrollLeft = 0
    const left = slide.offsetLeft + translate.current
    if (left >= 0 && left + slide.offsetWidth <= host.clientWidth + 1) return
    const target = snaps.current.findIndex((point) => point >= Math.min(slide.offsetLeft, snaps.current[snaps.current.length - 1] ?? 0) - 1)
    goTo(target === -1 ? snaps.current.length - 1 : target)
  }

  return (
    <div
      ref={root}
      className="c-design-carousel relative touch-pan-y select-none"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onClickCapture={(event) => {
        if (!suppressClick.current) return
        suppressClick.current = false
        event.preventDefault()
        event.stopPropagation()
      }}
      onDragStart={(event) => event.preventDefault()}
      role="region"
      aria-roledescription="carousel"
      aria-label="Recent work"
    >
      <div className="mb-fluid-lg flex items-center justify-between">
        <div />
        <div className="flex gap-1 max-md:hidden">
          <button
            type="button"
            className={ARROW_BUTTON}
            aria-label="Previous project"
            disabled={index === 0}
            onClick={() => goTo(index - 1)}
          >
            <span aria-hidden="true" className={ARROW_FILL} />
            <span className="pointer-events-none relative inline-flex h-5 w-5 items-center justify-center">
              <SplitArrow direction="left" className="size-full" />
            </span>
          </button>
          <button
            type="button"
            className={ARROW_BUTTON}
            aria-label="Next project"
            disabled={index >= snapCount - 1}
            onClick={() => goTo(index + 1)}
          >
            <span aria-hidden="true" className={ARROW_FILL} />
            <span className="pointer-events-none relative inline-flex h-5 w-5 items-center justify-center">
              <SplitArrow className="size-full" />
            </span>
          </button>
        </div>
      </div>
      <div ref={track} className="c-design-carousel_track flex items-stretch">
        {tiles.map((tile, i) => (
          <div
            key={tile.name}
            ref={(node) => {
              slides.current[i] = node
            }}
            className="c-design-carousel_slide"
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${tiles.length}`}
            onFocusCapture={() => onFocus(i)}
          >
            <DesignTile tile={tile} />
          </div>
        ))}
      </div>
    </div>
  )
}
