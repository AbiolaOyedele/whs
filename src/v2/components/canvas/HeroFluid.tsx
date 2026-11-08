'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import AnimatedGradient from '@/components/ui/animated-gradient'
import { CANVAS_EVENTS, type ProgressDetail } from '@v2/lib/canvas-events'
import { CANVAS_READY_EVENT } from '@v2/lib/page-state'

const BOOST_EVENTS = { start: CANVAS_EVENTS.holdStart, end: CANVAS_EVENTS.holdEnd }
/** How far the fluid dims once the home hero has scrolled away, so section text stays readable. */
const RESTING_OPACITY = 0.55

/**
 * The site background: the main site's lime fluid gradient, fixed behind
 * every page in place of the old 3D scene. On the home page it is full
 * strength behind the hero, dims as the hero scrolls away, and surges while
 * the hero is clicked and held. Elsewhere it sits at the dimmed strength.
 */
export function HeroFluid() {
  const pathname = usePathname()
  const layer = useRef<HTMLDivElement>(null)
  const onHome = pathname === '/'

  // The page loader waits for the background to report ready; the gradient
  // draws on its first frame, so report straight away.
  // Deferred one tick: the loader's listener is attached in an effect that
  // runs after this one.
  useEffect(() => {
    const timer = window.setTimeout(() => window.dispatchEvent(new CustomEvent(CANVAS_READY_EVENT)), 0)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    const element = layer.current
    if (!element) return
    element.style.opacity = onHome ? '1' : String(RESTING_OPACITY)
    if (!onHome) return
    const onProgress = (event: Event) => {
      const { progress } = (event as CustomEvent<ProgressDetail>).detail
      element.style.opacity = String(Math.max(RESTING_OPACITY, 1 - progress * 1.2))
    }
    window.addEventListener(CANVAS_EVENTS.heroHomeProgress, onProgress)
    return () => window.removeEventListener(CANVAS_EVENTS.heroHomeProgress, onProgress)
  }, [onHome])

  return (
    // Outer layer: the page-change fade (CSS). Inner layer: the scroll fade (set
    // inline above), kept separate so neither overrides the other.
    <div aria-hidden="true" className="c-hero-fluid pointer-events-none fixed inset-0 -z-2 bg-charcoal">
      <div ref={layer} className="absolute inset-0">
        <AnimatedGradient preset="hero" boostEvents={BOOST_EVENTS} className="absolute inset-0" />
        {/* Keeps headings and buttons readable over the brightest lime. */}
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/10 to-transparent" />
      </div>
    </div>
  )
}
