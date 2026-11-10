'use client'

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { Flip, getGsap } from '@v2/lib/gsap'

interface SegmentedControlsProps {
  tabs: string[]
  /** One panel per tab. Leave empty for tabs that only report the choice. */
  panels?: ReactNode[]
  initialIndex?: number
  onChange?: (index: number) => void
  className?: string
  tablistClassName?: string
  panelsClassName?: string
  /** Extra classes on every tab, e.g. a minimum width. */
  tabClassName?: string
}

const TAB =
  'relative z-[1] flex min-h-11 shrink-0 cursor-pointer scroll-mx-1 items-center justify-center rounded-sm bg-transparent px-5 py-2 text-center text-body-md text-navy-900 transition-colors duration-200 aria-selected:text-navy-900 ' +
  "before:absolute before:inset-0 before:z-below before:scale-90 before:rounded-sm before:bg-pink-100 before:opacity-0 before:transition-all before:duration-200 before:ease-(--ease) before:content-[''] not-aria-selected:hover:before:scale-100 not-aria-selected:hover:before:opacity-100"

/**
 * Tabs on a pill track. A lime block slides under the chosen tab; the old
 * panel drifts 5% and fades out while the new one drifts in, and the box
 * eases to the new height.
 */
export function SegmentedControls({
  tabs,
  panels = [],
  initialIndex = 0,
  onChange,
  className = '',
  tablistClassName = '',
  panelsClassName = '',
  tabClassName = '',
}: SegmentedControlsProps) {
  const baseId = useId()
  const [selected, setSelected] = useState(initialIndex)
  const tablist = useRef<HTMLDivElement>(null)
  const indicator = useRef<HTMLDivElement>(null)
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
  const panelsWrap = useRef<HTMLDivElement>(null)
  const panelRefs = useRef<(HTMLDivElement | null)[]>([])
  const animating = useRef(false)

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
  }, [selected, placeIndicator])

  useEffect(() => {
    const onResize = () => placeIndicator(selected)
    window.addEventListener('resize', onResize)
    document.fonts?.ready.then(onResize).catch(() => {})
    return () => window.removeEventListener('resize', onResize)
  }, [selected, placeIndicator])

  /** Returns true when the tab actually changed. */
  const select = (next: number): boolean => {
    if (next === selected || next < 0 || next >= tabs.length || animating.current) return false
    const previous = selected
    const forward = next > previous
    const wrap = panelsWrap.current
    const from = panelRefs.current[previous]
    const to = panelRefs.current[next]
    setSelected(next)
    onChange?.(next)
    requestAnimationFrame(() =>
      tabRefs.current[next]?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' }),
    )
    if (!wrap || !from || !to) return true

    const gsap = getGsap()
    const state = Flip.getState(wrap)
    animating.current = true
    gsap.set(wrap, { position: 'relative' })
    gsap.set(from, { position: 'absolute', top: 0, left: 0, width: '100%', zIndex: 1 })
    to.hidden = false
    gsap.set(to, { xPercent: forward ? 5 : -5, opacity: 0 })
    const duration = 0.25
    const ease = 'power2.inOut'
    gsap.to(from, {
      xPercent: forward ? -5 : 5,
      opacity: 0,
      duration,
      ease,
      onComplete: () => {
        from.hidden = true
        gsap.set(from, { clearProps: 'all' })
      },
    })
    gsap.to(to, {
      xPercent: 0,
      opacity: 1,
      duration,
      ease,
      onComplete: () => {
        gsap.set(to, { clearProps: 'transform,opacity' })
        gsap.set(wrap, { clearProps: 'position' })
        animating.current = false
      },
    })
    Flip.from(state, { duration, ease })
    return true
  }

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const current = tabRefs.current.findIndex((tab) => tab === document.activeElement)
    if (current === -1) return
    let next: number | null = null
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = current === 0 ? tabs.length - 1 : current - 1
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = current === tabs.length - 1 ? 0 : current + 1
    if (event.key === 'Home') next = 0
    if (event.key === 'End') next = tabs.length - 1
    if (next === null) return
    event.preventDefault()
    if (select(next)) tabRefs.current[next]?.focus()
  }

  return (
    <div className={`inline-flex max-w-full flex-col ${className}`}>
      <div
        ref={tablist}
        role="tablist"
        hidden={tabs.length <= 1}
        className={`no-scrollbar relative inline-flex max-w-full shrink-0 flex-nowrap gap-0 self-center overflow-x-auto overflow-y-hidden overscroll-none rounded-sm bg-white p-1 slate:bg-white ${tablistClassName}`}
      >
        <div
          ref={indicator}
          aria-hidden="true"
          className="pointer-events-none absolute rounded-sm bg-pink-500 transition-[left,width,top,height] duration-200 ease-out"
        />
        {tabs.map((label, index) => (
          <button
            key={label}
            ref={(node) => {
              tabRefs.current[index] = node
            }}
            id={`${baseId}-tab-${index}`}
            type="button"
            role="tab"
            aria-selected={index === selected}
            aria-controls={panels.length ? `${baseId}-panel-${index}` : undefined}
            tabIndex={index === selected ? 0 : -1}
            onClick={() => select(index)}
            onKeyDown={onKeyDown}
            className={`${TAB} ${tabClassName}`}
          >
            {label}
          </button>
        ))}
      </div>
      {panels.length > 0 ? (
        <div ref={panelsWrap} className={panelsClassName}>
          {panels.map((panel, index) => (
            <div
              key={tabs[index] ?? index}
              ref={(node) => {
                panelRefs.current[index] = node
              }}
              id={`${baseId}-panel-${index}`}
              role="tabpanel"
              aria-labelledby={`${baseId}-tab-${index}`}
              // Visibility is handed over imperatively during the cross-fade, so React only sets it once.
              hidden={index !== initialIndex}
              className="flex h-full flex-col"
            >
              {panel}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}
