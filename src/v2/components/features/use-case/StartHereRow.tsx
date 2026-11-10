'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Icon } from '@v2/components/ui/Icon'
import { SplitTitle } from '@v2/components/ui/SplitTitle'
import type { ExampleLink } from '@v2/content/use-cases'
import { ExampleCard } from './ExampleCard'

interface StartHereRowProps {
  title: string
  items: ExampleLink[]
}

/**
 * The next steps as a sideways row: the browser's own scrolling, snapping to
 * each card, so a swipe on a phone moves at the finger's pace. The row runs
 * to the screen edge with the next card peeking in. On larger screens two
 * arrow buttons step it a card at a time for a mouse.
 */
export function StartHereRow({ title, items }: StartHereRowProps) {
  const row = useRef<HTMLDivElement>(null)
  const [atStart, setAtStart] = useState(true)
  const [atEnd, setAtEnd] = useState(false)

  const update = useCallback(() => {
    const el = row.current
    if (!el) return
    setAtStart(el.scrollLeft <= 2)
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 2)
  }, [])

  useEffect(() => {
    const el = row.current
    if (!el) return
    update()
    el.addEventListener('scroll', update, { passive: true })
    const resize = new ResizeObserver(update)
    resize.observe(el)
    return () => {
      el.removeEventListener('scroll', update)
      resize.disconnect()
    }
  }, [update])

  const step = (direction: 1 | -1) => {
    const el = row.current
    const card = el?.firstElementChild as HTMLElement | null
    if (!el || !card) return
    const gap = parseFloat(getComputedStyle(el).columnGap) || 0
    el.scrollBy({ left: direction * (card.offsetWidth + gap), behavior: 'smooth' })
  }

  return (
    <div>
      <div className="mb-fluid-lg flex items-end justify-between gap-6">
        <SplitTitle as="h2" className="text-heading-xl">
          {title}
        </SplitTitle>
        <div className="flex gap-2 max-md:hidden">
          <RowArrow direction="previous" disabled={atStart} onClick={() => step(-1)} />
          <RowArrow direction="next" disabled={atEnd} onClick={() => step(1)} />
        </div>
      </div>
      <div
        ref={row}
        role="region"
        aria-label={title}
        className="no-scrollbar gap-gutter -mx-(--grid-margin) flex snap-x snap-mandatory scroll-px-(--grid-margin) overflow-x-auto overscroll-x-contain px-(--grid-margin)"
      >
        {items.map((item) => (
          <div
            key={item.title}
            className="w-[82%] shrink-0 snap-start sm:w-[55%] md:w-[42%] lg:w-[calc((100%-2*var(--grid-gutter))/3.2)]"
          >
            <ExampleCard item={item} />
          </div>
        ))}
      </div>
    </div>
  )
}

interface RowArrowProps {
  direction: 'previous' | 'next'
  disabled: boolean
  onClick: () => void
}

function RowArrow({ direction, disabled, onClick }: RowArrowProps) {
  return (
    <button
      type="button"
      aria-label={direction === 'previous' ? 'Previous' : 'Next'}
      disabled={disabled}
      onClick={onClick}
      className="text-navy-900 ring-charcoal hover:bg-pink-500 inline-flex size-13.5 cursor-pointer items-center justify-center rounded-full ring-1 transition-colors ring-inset disabled:cursor-default disabled:opacity-30 disabled:hover:bg-transparent"
    >
      <Icon name={direction === 'previous' ? 'arrowLeft' : 'arrowRight'} className="size-5" />
    </button>
  )
}
