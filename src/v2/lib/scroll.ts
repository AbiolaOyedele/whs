import type LocomotiveScroll from 'locomotive-scroll'

export interface ScrollState {
  scroll: number
  limit: number
  velocity: number
  direction: number
  progress: number
}

const state: ScrollState = { scroll: 0, limit: 0, velocity: 0, direction: 0, progress: 0 }
let instance: LocomotiveScroll | null = null

/** The last scroll reading, for components that react to scroll speed (the logo rail). */
export function getScrollState(): ScrollState {
  return state
}

const FIXED_HEADER_CLASS = 'has-header-fixed-visible'
const FIXED_HEADER_AFTER = 200

/**
 * Smooth scrolling for the whole site: Locomotive Scroll v5 on Lenis.
 * It also tags `[data-scroll]` elements `is-inview`, moves `data-scroll-speed`
 * elements for parallax and fires `data-scroll-event-progress` events.
 * Scrolling up past 200px shows the fixed header.
 */
export async function startScroll(): Promise<void> {
  if (instance) return
  const { default: Locomotive } = await import('locomotive-scroll')
  const coarse = window.matchMedia('(pointer: coarse)').matches
  instance = new Locomotive({
    lenisOptions: {
      smoothWheel: !coarse,
    },
    scrollCallback: ({ scroll, limit, velocity, direction, progress }: ScrollState) => {
      Object.assign(state, { scroll, limit, velocity, direction, progress })
      const root = document.documentElement
      if (scroll > FIXED_HEADER_AFTER && direction === -1) root.classList.add(FIXED_HEADER_CLASS)
      else root.classList.remove(FIXED_HEADER_CLASS)
    },
  })
}

export function stopScroll(): void {
  instance?.destroy()
  instance = null
}

/** Re-reads `[data-scroll]` elements under `root` after a route change. */
export function refreshScrollElements(oldRoot: HTMLElement | null, newRoot: HTMLElement | null): void {
  if (!instance) return
  if (oldRoot) instance.removeScrollElements(oldRoot)
  if (newRoot) instance.addScrollElements(newRoot)
}

export function scrollToTop(): void {
  instance?.scrollTo(0, { immediate: true, force: true })
  window.scrollTo(0, 0)
}

/** Smooth-scrolls to an element, stopping `offset` pixels above it. */
export function scrollToElement(element: HTMLElement, offset = 0): void {
  if (instance) instance.scrollTo(element, { offset: -offset })
  else window.scrollTo({ top: element.getBoundingClientRect().top + window.scrollY - offset, behavior: 'smooth' })
}

/** The fixed header's height plus breathing room, read from the CSS token. */
export function safeHeaderOffset(): number {
  const probe = document.createElement('div')
  probe.style.paddingTop = 'var(--spacing-safe-header)'
  document.body.appendChild(probe)
  const value = parseFloat(getComputedStyle(probe).paddingTop) || 0
  probe.remove()
  return value
}

export function lockScroll(locked: boolean): void {
  if (!instance) return
  if (locked) instance.stop()
  else instance.start()
}
