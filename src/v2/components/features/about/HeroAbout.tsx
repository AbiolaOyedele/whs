'use client'

import AnimatedGradient from '@/components/ui/animated-gradient'
import { useEffect, useRef } from 'react'
import { Label } from '@v2/components/ui/Label'
import { SplitTitle } from '@v2/components/ui/SplitTitle'
import { observeInview } from '@v2/lib/inview'
import { aboutHero } from '@v2/content/about'

/** Scroll (px) before the dark layer starts closing in. */
const SCROLL_START = 60
/** Scroll distance (px) the close-in takes, by viewport height. */
const SCROLL_RANGES: readonly { minHeight: number; range: number }[] = [
  { minHeight: 900, range: 980 },
  { minHeight: 750, range: 500 },
]
const SCROLL_RANGE_SHORT = 400
/** The right edge runs this much faster than the left, so the card closes in from the right first. */
const RIGHT_SPEED = 1.4
/** Top and bottom ease out a little before the right edge lands, then settle slowly. */
const VERTICAL_LEAD = 0.08
const VERTICAL_SETTLE = 1
const MD_FALLBACK = '1000px'

interface Inset {
  top: number
  right: number
  bottom: number
  left: number
  radius: number
}

function scrollRange(): number {
  const height = window.innerHeight
  for (const { minHeight, range } of SCROLL_RANGES) if (height >= minHeight) return range
  return SCROLL_RANGE_SHORT
}

function easeOutQuad(t: number): number {
  return 1 - (1 - t) ** 2
}

function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3
}

/**
 * Follows easeOutQuad up to `knee`, then eases the rest of the way in with a
 * cubic curve slowed by `settle`, so the top and bottom edges land softly.
 */
function settleCurve(t: number, knee: number, settle: number): number {
  const quad = easeOutQuad(t)
  if (t <= knee) return quad
  const rest = 1 - knee
  if (rest <= 0) return 1
  const local = (t - knee) / rest
  const slowed = local / (1 + settle * (1 - local))
  const atKnee = easeOutQuad(knee)
  return atKnee + easeOutCubic(slowed) * (1 - atKnee)
}

function toPixels(value: string): number {
  const trimmed = value.trim()
  if (trimmed.endsWith('rem')) return parseFloat(trimmed) * 16 || 0
  return parseFloat(trimmed) || 0
}

/**
 * The about hero. A dark layer (title, label, 3D backdrop) sits over a light
 * copy of the same layout. As the page scrolls, the dark layer's clip-path
 * closes in to the rounded card on the left of the light copy and the label
 * glides into the card's corner. On touch screens, narrow screens and with
 * reduced motion it starts in that end state.
 */
export function HeroAbout() {
  const host = useRef<HTMLDivElement>(null)
  const mask = useRef<HTMLDivElement>(null)
  const maskReference = useRef<HTMLDivElement>(null)
  const label = useRef<HTMLDivElement>(null)
  const labelReference = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = host.current
    const maskEl = mask.current
    const refEl = maskReference.current
    const labelEl = label.current
    const labelRefEl = labelReference.current
    if (!root || !maskEl || !refEl || !labelEl || !labelRefEl) return

    const start = Number(root.dataset.heroAboutScrollStart) || SCROLL_START
    const md = getComputedStyle(document.documentElement).getPropertyValue('--breakpoint-md').trim() || MD_FALLBACK
    const touchQuery = window.matchMedia('(hover: none)')
    const narrowQuery = window.matchMedia(`(max-width: ${md})`)
    const reducedQuery = window.matchMedia('(prefers-reduced-motion: reduce)')

    let range = scrollRange()
    let inset: Inset = { top: 0, right: 0, bottom: 0, left: 0, radius: 0 }
    let isStatic = false
    let isIntersecting = false
    let isBound = false
    let frame: number | null = null

    const computeInset = () => {
      const outer = maskEl.getBoundingClientRect()
      const inner = refEl.getBoundingClientRect()
      inset = {
        top: inner.top - outer.top,
        left: inner.left - outer.left,
        right: outer.right - inner.right,
        bottom: outer.bottom - inner.bottom,
        radius: toPixels(getComputedStyle(refEl).borderRadius),
      }
    }

    const progress = () => {
      if (isStatic) return 1
      return Math.max(0, Math.min(1, (window.scrollY - start) / range))
    }

    const updateMask = (eased: number, vertical: number) => {
      const right = Math.min(1, eased * RIGHT_SPEED)
      maskEl.style.setProperty('--hero-about-mask-inset-top', `${vertical * inset.top}px`)
      maskEl.style.setProperty('--hero-about-mask-inset-right', `${right * inset.right}px`)
      maskEl.style.setProperty('--hero-about-mask-inset-bottom', `${vertical * inset.bottom}px`)
      maskEl.style.setProperty('--hero-about-mask-inset-left', `${eased * inset.left}px`)
      maskEl.style.setProperty('--hero-about-mask-radius', `${eased * inset.radius}px`)
    }

    const updateLabel = (eased: number) => {
      labelEl.style.transform = ''
      const from = labelEl.getBoundingClientRect()
      const to = labelRefEl.getBoundingClientRect()
      labelEl.style.transform = `translate(${eased * (to.left - from.left)}px, ${eased * (to.top - from.top)}px)`
    }

    const tick = (t: number) => {
      const eased = easeOutQuad(t)
      const knee = Math.max(0, 1 / RIGHT_SPEED - VERTICAL_LEAD)
      updateMask(eased, settleCurve(t, knee, VERTICAL_SETTLE))
      updateLabel(eased)
    }

    const onScroll = () => {
      if (isStatic || frame !== null) return
      frame = window.requestAnimationFrame(() => {
        frame = null
        tick(progress())
      })
    }

    const bind = () => {
      if (isStatic || isBound) return
      isBound = true
      window.addEventListener('scroll', onScroll, { passive: true })
      window.addEventListener('heroAbout', onScroll)
    }

    const unbind = () => {
      if (!isBound) return
      isBound = false
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('heroAbout', onScroll)
    }

    const sync = () => {
      isStatic = touchQuery.matches || narrowQuery.matches || reducedQuery.matches
      if (isIntersecting && !isStatic) bind()
      else unbind()
      tick(progress())
    }

    const onModeChange = () => {
      computeInset()
      sync()
    }

    const onResize = () => {
      range = scrollRange()
      computeInset()
      sync()
    }

    computeInset()
    sync()

    const resizeObserver = new ResizeObserver(() => {
      computeInset()
      tick(progress())
    })
    resizeObserver.observe(maskEl)
    window.addEventListener('resize', onResize)
    touchQuery.addEventListener('change', onModeChange)
    narrowQuery.addEventListener('change', onModeChange)
    reducedQuery.addEventListener('change', onModeChange)
    const stopObserving = observeInview(root, (_entry, visible) => {
      isIntersecting = visible
      if (visible) sync()
      else unbind()
    })

    return () => {
      unbind()
      stopObserving()
      resizeObserver.disconnect()
      window.removeEventListener('resize', onResize)
      touchQuery.removeEventListener('change', onModeChange)
      narrowQuery.removeEventListener('change', onModeChange)
      reducedQuery.removeEventListener('change', onModeChange)
      if (frame !== null) window.cancelAnimationFrame(frame)
    }
  }, [])

  const titleWords = (
    <>
      {aboutHero.before} <span className="text-gradient">{aboutHero.highlight}</span> {aboutHero.after}
    </>
  )

  return (
    <div data-background-canvas-inview="">
      <div
        ref={host}
        className="c-hero-about"
        data-scroll=""
        data-scroll-event-progress="heroAbout"
        data-scroll-position="start, end"
        data-scroll-offset="0, 100%"
        data-scroll-css-progress=""
        data-hero-about-scroll-start={String(SCROLL_START)}
      >
        <div ref={mask} className="c-hero-about_inner -front" data-hero-about-mask="">
          <div className="c-hero-about_background">
            <div className="c-hero-about_background_sticky">
              <AnimatedGradient preset="hero" className="absolute inset-0" />
            </div>
          </div>
          <div className="c-hero-about_top container">
            <SplitTitle as="h2" className="c-hero-about_title pointer-events-auto">
              {titleWords}
            </SplitTitle>
          </div>
          <div className="c-hero-about_bottom container grid gap-x-gutter gap-y-fluid-lg sm:grid-cols-12">
            <div className="relative sm:col-start-1 sm:col-end-9">
              <div
                ref={label}
                className="absolute top-[calc((var(--spacing-fluid-2xl)+var(--spacing-fluid-md))*-1)] left-0"
                data-hero-about-label=""
              >
                <Label as="h1" className="pointer-events-auto z-above text-white [--label-circle-color:var(--color-pink-500)]">
                  {aboutHero.label}
                </Label>
              </div>
              <div className="rounded-md bg-transparent max-xs:aspect-360/418 xs:aspect-948/720" />
            </div>
            <div className="sm:col-start-9 sm:col-end-13">
              <div className="c-hero-about_content" aria-hidden="true">
                <div className="c-hero-about_content_text wysiwyg-navy wysiwyg pointer-events-auto opacity-0">
                  <p>{aboutHero.intro}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="c-hero-about_inner -back slate">
          <div className="c-hero-about_top container" aria-hidden="true">
            <div className="c-hero-about_title pointer-events-auto">
              {titleWords}
            </div>
          </div>
          <div className="c-hero-about_bottom container grid gap-x-gutter gap-y-fluid-lg overflow-hidden sm:grid-cols-12">
            <div className="relative sm:col-start-1 sm:col-end-9" aria-hidden="true">
              <div
                ref={labelReference}
                className="absolute max-md:top-gutter max-md:left-gutter md:top-8 md:left-8"
                data-hero-about-label-reference=""
              >
                <Label as="span" className="pointer-events-auto z-above text-white [--label-circle-color:var(--color-pink-500)]">
                  {aboutHero.label}
                </Label>
              </div>
              <div
                ref={maskReference}
                className="rounded-md max-xs:aspect-360/418 xs:aspect-948/720"
                data-hero-about-mask-reference=""
              />
            </div>
            <div className="sm:col-start-9 sm:col-end-13">
              <div className="c-hero-about_content">
                <div className="c-hero-about_content_text wysiwyg-navy wysiwyg anim-transform-opacity pointer-events-auto">
                  <p>{aboutHero.intro}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
