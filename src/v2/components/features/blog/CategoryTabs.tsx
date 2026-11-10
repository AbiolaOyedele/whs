'use client'

import { useCallback, useEffect, useLayoutEffect, useRef, type MouseEvent } from 'react'
import { SmartLink } from '@v2/components/ui/SmartLink'

export interface CategoryTab {
  label: string
  href: string
}

interface CategoryTabsProps {
  tabs: CategoryTab[]
  /** Index of the tab for the current address. */
  selected: number
  /** Called instead of a page change, so only the results swap. */
  onSelect: (index: number, event: MouseEvent<HTMLAnchorElement>) => void
}

// The shared SegmentedControls look, with links in place of buttons so each category has its own address.
const TAB =
  'relative z-[1] flex min-h-11 shrink-0 cursor-pointer scroll-mx-1 items-center justify-center rounded-sm bg-transparent px-5 py-2 text-center text-body-md text-navy-900 transition-colors duration-200 aria-[current=page]:text-navy-900 ' +
  "before:absolute before:inset-0 before:z-below before:scale-90 before:rounded-sm before:bg-pink-100 before:opacity-0 before:transition-all before:duration-200 before:ease-(--ease) before:content-[''] not-aria-[current=page]:hover:before:scale-100 not-aria-[current=page]:hover:before:opacity-100"

/**
 * The blog's category filter: segmented tabs on a pill track, a navy block
 * sliding under the chosen one. Each tab is a real link, so it works with no
 * script, opens in a new tab, and shares.
 */
export function CategoryTabs({ tabs, selected, onSelect }: CategoryTabsProps) {
  const list = useRef<HTMLUListElement>(null)
  const indicator = useRef<HTMLLIElement>(null)
  const tabRefs = useRef<(HTMLAnchorElement | null)[]>([])

  const placeIndicator = useCallback((index: number) => {
    const tab = tabRefs.current[index]
    const bar = indicator.current
    if (!tab || !bar) return
    bar.style.left = `${tab.offsetLeft}px`
    bar.style.top = `${tab.offsetTop}px`
    bar.style.width = `${tab.offsetWidth}px`
    bar.style.height = `${tab.offsetHeight}px`
  }, [])

  useLayoutEffect(() => {
    placeIndicator(selected)
    // Bring the chosen tab into the track on a narrow screen, sideways only: the page itself must not move.
    const tab = tabRefs.current[selected]
    const track = list.current
    if (!tab || !track) return
    const left = tab.offsetLeft - 4
    const right = tab.offsetLeft + tab.offsetWidth + 4 - track.clientWidth
    if (track.scrollLeft > left) track.scrollTo({ left, behavior: 'smooth' })
    else if (track.scrollLeft < right) track.scrollTo({ left: right, behavior: 'smooth' })
  }, [selected, placeIndicator])

  useEffect(() => {
    const onResize = () => placeIndicator(selected)
    window.addEventListener('resize', onResize)
    document.fonts?.ready.then(onResize).catch(() => {})
    return () => window.removeEventListener('resize', onResize)
  }, [selected, placeIndicator])

  return (
    <div className="inline-flex max-w-full flex-col">
      <ul ref={list} className="no-scrollbar relative inline-flex shrink-0 flex-nowrap gap-0 overflow-x-auto overflow-y-hidden overscroll-none rounded-sm bg-white p-1 slate:bg-white">
        <li
          ref={indicator}
          aria-hidden="true"
          className="pointer-events-none absolute rounded-sm bg-pink-500 transition-[left,width,top,height] duration-200 ease-out"
        />
        {tabs.map((tab, index) => (
          <li key={tab.href} className="flex shrink-0">
            <SmartLink
              ref={(node) => {
                tabRefs.current[index] = node
              }}
              href={tab.href}
              aria-current={index === selected ? 'page' : undefined}
              onClick={(event) => onSelect(index, event)}
              className={TAB}
            >
              {tab.label}
            </SmartLink>
          </li>
        ))}
      </ul>
    </div>
  )
}
