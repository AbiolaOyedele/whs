'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '@v2/components/ui/Button'
import { MenuIcon } from '@v2/components/ui/Icon'
import { SplitTitle } from '@v2/components/ui/SplitTitle'
import { heroCopy, holdWords } from '@v2/content/home-upper'
import { site } from '@v2/config/site'
import { CANVAS_EVENTS } from '@v2/lib/canvas-events'
import { getGsap, motionAllowed } from '@v2/lib/gsap'
import { HeroHoldWords } from './HeroHoldWords'
import { HeroCursor } from './HeroCursor'
import { PlayIcon } from './PlayIcon'
import type { ReactNode } from 'react'

/** A full hold fills the cursor ring in this many seconds. */
const HOLD_SECONDS = 9
/** When each hold word starts, in seconds after the press. */
const WORD_STARTS = [1, 3.75, 6]
/** Letter stagger and the flicker's dip/return length. */
const LETTER_STAGGER = 0.03
const FLICKER = 0.07
const APPEAR = 0.12
const DWELL = 0.75
const CURSOR_LERP = 0.2
const ACTIVE_CLASS = 'is-hero-hold-active'

/** Elements that keep the normal pointer and never start a hold. */
const NO_HOLD = '[data-hero-cursor-hide], [data-hero-hold-trigger], button, a, [role="button"], input, select, textarea, label'

interface HeroHomeProps {
  /** The logo rail and dot grid, which sit inside the hero like the reference. */
  children?: ReactNode
}

/**
 * The home hero. On a mouse, a ring follows the pointer; pressing and holding
 * anywhere fills the ring over nine seconds, hides the page chrome, tells the
 * 3D background to react and flickers three words in one after another.
 * On touch, a round button toggles the same thing and a tap anywhere ends it.
 */
export function HeroHome({ children }: HeroHomeProps) {
  const root = useRef<HTMLDivElement>(null)
  const cursor = useRef<HTMLDivElement>(null)
  const progress = useRef<SVGCircleElement>(null)
  const words = useRef<HTMLDivElement>(null)
  const finishRef = useRef<() => void>(() => {})
  const [holding, setHolding] = useState(false)

  useEffect(() => {
    const host = root.current
    const ring = progress.current
    const cursorEl = cursor.current
    const wordHost = words.current
    if (!host || !ring || !cursorEl || !wordHost) return
    const gsap = getGsap()
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)')
    const letterGroups = Array.from(wordHost.querySelectorAll<HTMLElement>('[data-hero-hold-word]')).map((word) =>
      Array.from(word.querySelectorAll<HTMLElement>('[data-hero-hold-letter]')),
    )

    const circumference = Math.PI * 2 * Number(ring.getAttribute('r') ?? 0)
    ring.style.strokeDasharray = `${circumference}`
    const resetRing = () => {
      ring.style.strokeDashoffset = `${circumference}`
    }
    resetRing()

    let isHolding = false
    let tapSession = false
    let desktop = false
    let moved = false
    let shouldHide = false
    let pointerX = 0
    let pointerY = 0
    let cursorX = 0
    let cursorY = 0
    let setX: ((value: number) => void) | null = null
    let setY: ((value: number) => void) | null = null
    let ringTween: gsap.core.Tween | null = null
    let sequence: gsap.core.Timeline | null = null
    let globalListening = false
    let globalRaf: number | null = null

    const hideLetters = () => letterGroups.forEach((letters) => gsap.set(letters, { opacity: 0 }))
    hideLetters()

    const refreshCursor = () => {
      if (!desktop) return
      cursorEl.classList.toggle('is-hidden', shouldHide && !isHolding)
    }

    const buildSequence = () => {
      const timeline = gsap.timeline({ paused: true })
      const animate = motionAllowed()
      letterGroups.forEach((letters, index) => {
        const start = WORD_STARTS[index] ?? index * 0.35
        if (!animate) {
          timeline.set(letters, { opacity: 1 }, start)
          timeline.set(letters, { opacity: 0 }, start + APPEAR + DWELL)
          return
        }
        const appear = gsap
          .timeline()
          .to(letters, { opacity: 1, duration: APPEAR, stagger: { each: LETTER_STAGGER, from: 'start' }, ease: 'power2.out' })
          .to(letters, { opacity: 0.12, duration: FLICKER / 2, stagger: { each: LETTER_STAGGER, from: 'random' }, ease: 'power1.in' })
          .to(letters, { opacity: 1, duration: FLICKER / 2, stagger: { each: LETTER_STAGGER, from: 'random' }, ease: 'power1.out' })
        timeline.add(appear, start)
        timeline.to(
          letters,
          { opacity: 0, duration: FLICKER / 2, stagger: { each: LETTER_STAGGER, from: 'random' }, ease: 'power1.out' },
          start + appear.duration() + DWELL,
        )
      })
      return timeline
    }

    const stopGlobal = () => {
      if (globalRaf !== null) {
        window.cancelAnimationFrame(globalRaf)
        globalRaf = null
      }
      if (globalListening) {
        document.removeEventListener('pointerdown', onGlobalPointerDown, true)
        globalListening = false
      }
    }

    const onGlobalPointerDown = (event: PointerEvent) => {
      if (!isHolding || !tapSession || !event.isPrimary) return
      if ((event.target as Element | null)?.closest('[data-hero-hold-trigger]')) return
      finish()
    }

    const startGlobal = () => {
      if (desktop || globalListening || globalRaf !== null) return
      // Wait a frame so the tap that started the hold does not end it.
      globalRaf = window.requestAnimationFrame(() => {
        globalRaf = null
        if (desktop || !isHolding || globalListening) return
        document.addEventListener('pointerdown', onGlobalPointerDown, true)
        globalListening = true
      })
    }

    const start = (fromTap: boolean) => {
      if (isHolding) return
      isHolding = true
      tapSession = fromTap
      setHolding(true)
      cursorEl.classList.add('is-holding')
      cursorEl.classList.remove('is-hidden')
      document.documentElement.classList.add(ACTIVE_CLASS)
      window.dispatchEvent(new CustomEvent(CANVAS_EVENTS.holdStart))
      ringTween?.kill()
      sequence?.kill()
      resetRing()
      hideLetters()
      sequence = buildSequence()
      sequence.play(0)
      if (fromTap) startGlobal()
      ringTween = gsap.to(ring, {
        strokeDashoffset: 0,
        duration: HOLD_SECONDS,
        ease: 'none',
        onComplete: () => {
          ringTween = null
        },
      })
    }

    const finish = () => {
      if (!isHolding) return
      ringTween?.kill()
      ringTween = null
      sequence?.kill()
      sequence = null
      isHolding = false
      tapSession = false
      setHolding(false)
      resetRing()
      document.documentElement.classList.remove(ACTIVE_CLASS)
      stopGlobal()
      cursorEl.classList.remove('is-holding')
      refreshCursor()
      window.dispatchEvent(new CustomEvent(CANVAS_EVENTS.holdEnd))
      letterGroups.forEach((letters) => gsap.killTweensOf(letters))
      hideLetters()
    }
    finishRef.current = finish

    // A filter or transform on an ancestor (the page transition wrapper) makes
    // `position: fixed` relative to that ancestor, so offset by where it sits.
    const findContainingBlock = (): HTMLElement | null => {
      for (let node = cursorEl.parentElement; node; node = node.parentElement) {
        const style = getComputedStyle(node)
        if (style.filter !== 'none' || style.transform !== 'none' || style.perspective !== 'none') return node
      }
      return null
    }
    let containingBlock = findContainingBlock()

    const tick = () => {
      if (!desktop || !moved) return
      cursorX += (pointerX - cursorX) * CURSOR_LERP
      cursorY += (pointerY - cursorY) * CURSOR_LERP
      const box = containingBlock?.getBoundingClientRect()
      setX?.(cursorX - (box?.left ?? 0))
      setY?.(cursorY - (box?.top ?? 0))
    }

    const enableDesktop = () => {
      desktop = true
      gsap.set(cursorEl, { xPercent: -50, yPercent: -50 })
      setX = gsap.quickSetter(cursorEl, 'x', 'px') as (value: number) => void
      setY = gsap.quickSetter(cursorEl, 'y', 'px') as (value: number) => void
      gsap.ticker.add(tick)
    }

    const disableDesktop = () => {
      desktop = false
      moved = false
      shouldHide = false
      cursorEl.classList.remove('is-visible', 'is-hidden', 'is-holding')
      setX = null
      setY = null
      gsap.ticker.remove(tick)
    }

    const onModeChange = () => {
      if (fine.matches && !desktop) {
        stopGlobal()
        enableDesktop()
      } else if (!fine.matches && desktop) {
        disableDesktop()
      }
    }

    const onPointerMove = (event: PointerEvent) => {
      if (!desktop) return
      pointerX = event.clientX
      pointerY = event.clientY
      containingBlock = findContainingBlock()
      if (!moved) {
        cursorX = pointerX
        cursorY = pointerY
        moved = true
        cursorEl.classList.add('is-visible')
      }
      cursorEl.classList.remove('is-hidden')
      shouldHide = Boolean((event.target as Element | null)?.closest(NO_HOLD))
      refreshCursor()
    }

    const onPointerDown = (event: PointerEvent) => {
      if (!desktop || event.button !== 0 || !event.isPrimary) return
      if ((event.target as Element | null)?.closest(NO_HOLD)) return
      event.preventDefault()
      start(false)
    }

    const onPointerUp = () => {
      if (isHolding && desktop) finish()
    }

    const onPointerCancel = () => {
      if (isHolding) finish()
    }

    const onPointerLeave = () => {
      if (!desktop) return
      if (isHolding) {
        finish()
        return
      }
      cursorEl.classList.add('is-hidden')
    }

    const trigger = host.querySelector<HTMLButtonElement>('[data-hero-hold-trigger="mobile"]')
    const onTriggerClick = (event: MouseEvent) => {
      event.preventDefault()
      if (isHolding) finish()
      else start(true)
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') finish()
    }

    host.addEventListener('pointermove', onPointerMove)
    host.addEventListener('pointerdown', onPointerDown)
    host.addEventListener('pointerup', onPointerUp)
    host.addEventListener('pointercancel', onPointerCancel)
    host.addEventListener('pointerleave', onPointerLeave)
    trigger?.addEventListener('click', onTriggerClick)
    window.addEventListener('keydown', onKeyDown)
    fine.addEventListener('change', onModeChange)
    onModeChange()

    return () => {
      finish()
      disableDesktop()
      stopGlobal()
      host.removeEventListener('pointermove', onPointerMove)
      host.removeEventListener('pointerdown', onPointerDown)
      host.removeEventListener('pointerup', onPointerUp)
      host.removeEventListener('pointercancel', onPointerCancel)
      host.removeEventListener('pointerleave', onPointerLeave)
      trigger?.removeEventListener('click', onTriggerClick)
      window.removeEventListener('keydown', onKeyDown)
      fine.removeEventListener('change', onModeChange)
      document.documentElement.classList.remove(ACTIVE_CLASS)
    }
  }, [])

  return (
    <div
      ref={root}
      className="c-hero-home dark relative block pb-18 text-white"
      data-scroll=""
      data-scroll-event-progress={CANVAS_EVENTS.heroHomeProgress}
      data-hero-hold-root=""
    >
      <div className="pointer-events-none sticky top-0 left-0">
        <HeroHoldWords ref={words} words={holdWords} />
        {/* Pinned to the bottom of the screen through the sticky parent: the page's
            transition wrapper has a filter, which stops position: fixed working here. */}
        <div className="absolute inset-x-0 top-0 h-svh md:hidden">
          <div
            className="absolute right-(--grid-margin) bottom-(--grid-margin) left-(--grid-margin)"
            data-hero-hold-only-active=""
          >
            <Button
              label={heroCopy.close}
              variant="pink"
              className="w-full [&_svg]:rotate-45"
              onClick={() => finishRef.current()}
              trailing={
                <span className="pointer-events-none relative inline-flex size-5 items-center justify-center">
                  <MenuIcon />
                </span>
              }
            />
          </div>
        </div>
      </div>

      <HeroCursor ref={cursor} progressRef={progress} hint={heroCopy.cursorHint} />

      <div
        className="relative z-above flex min-h-svh flex-col justify-end pt-(--spacing-header) max-md:pb-fluid-xl md:pb-fluid-2xl"
        data-hero-hold-hide=""
      >
        <div className="container">
          <div className="grid items-end gap-x-gutter gap-y-fluid-lg sm:grid-cols-12">
            <div className="anim-transform-opacity md:hidden">
              <div className="inline-block rounded-sm border border-slate-50/15">
                <button
                  type="button"
                  data-hero-hold-trigger="mobile"
                  aria-pressed={holding}
                  className="button group relative isolate inline-flex size-15 items-center justify-center gap-2 overflow-hidden rounded-sm bg-charcoal/35 text-white backdrop-blur-lg"
                >
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 -z-10 rounded-[inherit] bg-charcoal/50 opacity-0 transition-[transform,opacity] duration-200 ease-(--ease) [transform:scale3d(0.9,0.7,1)] group-hover:opacity-100 group-hover:[transform:scale3d(1,1,1)]"
                  />
                  <span className="sr-only">{heroCopy.mobileTrigger}</span>
                  <span className="pointer-events-none relative inline-flex size-3 items-center justify-center">
                    <PlayIcon />
                  </span>
                </button>
              </div>
            </div>
            <div className="sm:col-start-1 sm:col-end-7" data-hero-cursor-hide="">
              <SplitTitle as="h1" className="text-heading-2xl">
                {heroCopy.title.before} <span className="text-gradient">{heroCopy.title.highlight}</span>{' '}
                {heroCopy.title.after}
              </SplitTitle>
            </div>
            <div className="sm:col-start-9 sm:col-end-13 lg:col-end-12" data-hero-cursor-hide="">
              <div className="flex max-w-100 flex-col gap-7.5">
                <div className="wysiwyg wysiwyg-navy anim-transform-opacity text-balance [&_p]:text-body-md!">
                  <p>{heroCopy.body}</p>
                </div>
                <div className="flex flex-wrap gap-4">
                  <div className="anim-transform-opacity -delay-2">
                    <Button label={heroCopy.primary} variant="pink" href={site.signUpUrl} />
                  </div>
                  <div className="anim-transform-opacity -delay-3">
                    <Button label={heroCopy.secondary.label} variant="glass" href={heroCopy.secondary.href} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {children}
    </div>
  )
}
