'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import AnimatedGradient from '@/components/ui/animated-gradient'
import { CANVAS_EVENTS, type ProgressDetail } from '@v2/lib/canvas-events'

const BOOST_EVENTS = { start: CANVAS_EVENTS.holdStart, end: CANVAS_EVENTS.holdEnd }

/**
 * The home hero's backdrop: the main site's lime fluid gradient, in place of
 * the ribbon tunnel. It sits fixed between the 3D canvas and the page, fades
 * out as the hero scrolls away (the same progress event the 3D scene reads),
 * and surges while the hero is clicked and held.
 */
export function HeroFluid() {
  const pathname = usePathname()
  const layer = useRef<HTMLDivElement>(null)
  const onHome = pathname === '/'

  useEffect(() => {
    if (!onHome) return
    const element = layer.current
    if (!element) return
    element.style.opacity = '1'
    const onProgress = (event: Event) => {
      const { progress } = (event as CustomEvent<ProgressDetail>).detail
      element.style.opacity = String(Math.max(0, 1 - progress * 1.6))
    }
    window.addEventListener(CANVAS_EVENTS.heroHomeProgress, onProgress)
    return () => window.removeEventListener(CANVAS_EVENTS.heroHomeProgress, onProgress)
  }, [onHome])

  if (!onHome) return null

  return (
    // Outer layer: the page-change fade (CSS). Inner layer: the scroll fade (set
    // inline above), kept separate so neither overrides the other.
    <div aria-hidden="true" className="c-hero-fluid pointer-events-none fixed inset-0 -z-1">
      <div ref={layer} className="absolute inset-0">
        <AnimatedGradient preset="hero" boostEvents={BOOST_EVENTS} className="absolute inset-0" />
        {/* Keeps the headline and buttons readable over the brightest lime. */}
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/10 to-transparent" />
      </div>
    </div>
  )
}
