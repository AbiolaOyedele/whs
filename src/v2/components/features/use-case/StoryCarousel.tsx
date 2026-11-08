'use client'

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type PointerEvent,
  type WheelEvent,
} from 'react'
import type { DemoShop } from '@v2/content/use-cases'
import { CarouselArrow } from './CarouselArrow'
import { StoryCard } from './StoryCard'

interface StoryCarouselProps {
  title: string
  action: string
  items: DemoShop[]
}

/** Drag further than this and the release counts as a swipe, not a tap. */
const DRAG_THRESHOLD = 6
const WHEEL_COOLDOWN = 400

/**
 * A row of demo-shop tiles: 1¼ on phones, 2 on tablets, 3 on desktop, with
 * the next one peeking past the edge. Arrows step it on desktop; on any
 * screen it can be dragged or swiped and snaps to the nearest tile.
 */
export function StoryCarousel({ title, action, items }: StoryCarouselProps) {
  const viewport = useRef<HTMLDivElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const [index, setIndex] = useState(0)
  const [offset, setOffset] = useState(0)
  const [atEnd, setAtEnd] = useState(false)
  const [dragging, setDragging] = useState(false)
  const drag = useRef<{ startX: number; startOffset: number; moved: boolean; id: number } | null>(null)
  const lastWheel = useRef(0)
  const justDragged = useRef(false)

  /** Every stop the row can rest at: each slide's left edge, capped at the end. */
  const stops = useCallback((): number[] => {
    const row = track.current
    const box = viewport.current
    if (!row || !box) return [0]
    const max = Math.max(0, row.scrollWidth - box.clientWidth)
    const lefts = Array.from(row.children).map((child) => Math.min((child as HTMLElement).offsetLeft, max))
    return lefts.filter((left, i) => i === 0 || left > (lefts[i - 1] ?? 0) + 0.5)
  }, [])

  const goTo = useCallback(
    (next: number) => {
      const list = stops()
      const clamped = Math.max(0, Math.min(list.length - 1, next))
      setIndex(clamped)
      setOffset(list[clamped] ?? 0)
      setAtEnd(clamped >= list.length - 1)
    },
    [stops],
  )

  useEffect(() => {
    const box = viewport.current
    if (!box) return
    const resize = new ResizeObserver(() => goTo(index))
    resize.observe(box)
    return () => resize.disconnect()
  }, [goTo, index])

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return
    drag.current = { startX: event.clientX, startOffset: offset, moved: false, id: event.pointerId }
  }

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const state = drag.current
    if (!state) return
    const delta = event.clientX - state.startX
    if (!state.moved && Math.abs(delta) < DRAG_THRESHOLD) return
    if (!state.moved) {
      state.moved = true
      setDragging(true)
      event.currentTarget.setPointerCapture(state.id)
    }
    const list = stops()
    const max = list[list.length - 1] ?? 0
    const raw = state.startOffset - delta
    // Resist a little past either end.
    setOffset(raw < 0 ? raw / 3 : raw > max ? max + (raw - max) / 3 : raw)
  }

  const endDrag = () => {
    const state = drag.current
    drag.current = null
    if (!state?.moved) return
    setDragging(false)
    justDragged.current = true
    window.setTimeout(() => {
      justDragged.current = false
    }, 0)
    const list = stops()
    let nearest = 0
    list.forEach((stop, i) => {
      if (Math.abs(stop - offset) < Math.abs((list[nearest] ?? 0) - offset)) nearest = i
    })
    goTo(nearest)
  }

  const onClickCapture = (event: MouseEvent<HTMLDivElement>) => {
    // A drag that ends over a tile must not open it.
    if (justDragged.current) {
      event.preventDefault()
      event.stopPropagation()
    }
  }

  const onWheel = (event: WheelEvent<HTMLDivElement>) => {
    if (Math.abs(event.deltaX) <= Math.abs(event.deltaY) || Math.abs(event.deltaX) < 10) return
    const now = Date.now()
    if (now - lastWheel.current < WHEEL_COOLDOWN) return
    lastWheel.current = now
    goTo(index + (event.deltaX > 0 ? 1 : -1))
  }

  return (
    <div className="c-uc-carousel">
      <div className="mb-fluid-lg flex items-center justify-between">
        <div>
          <h3 className="text-heading-sm">{title}</h3>
        </div>
        <div className="flex gap-1 max-md:hidden">
          <CarouselArrow direction="previous" disabled={index === 0} onClick={() => goTo(index - 1)} />
          <CarouselArrow direction="next" disabled={atEnd} onClick={() => goTo(index + 1)} />
        </div>
      </div>
      <div
        ref={viewport}
        role="region"
        aria-roledescription="carousel"
        aria-label={title}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onClickCapture={onClickCapture}
        onWheel={onWheel}
      >
        <div
          ref={track}
          className={`c-uc-carousel_track items-stretch ${dragging ? 'is-dragging' : ''}`}
          style={{ transform: `translate3d(${-offset}px, 0, 0)` }}
        >
          {items.map((shop, slide) => (
            <div
              key={shop.slug}
              className="c-uc-carousel_slide h-auto"
              onFocusCapture={() => goTo(Math.min(slide, stops().length - 1))}
            >
              <StoryCard shop={shop} action={action} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
