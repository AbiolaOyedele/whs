'use client'

import { useEffect, useRef, type ElementType, type ReactNode } from 'react'
import { getGsap, motionAllowed, SplitText } from '@v2/lib/gsap'
import { observeInview } from '@v2/lib/inview'
import { onReady } from '@v2/lib/page-state'
import { keepLastWordsTogether } from '@v2/lib/no-orphans'

interface SplitTitleProps {
  as?: ElementType
  className?: string
  /** Wrapper classes, e.g. layout around the heading. */
  wrapperClassName?: string
  /** A page's first headline: the words glow in lime, then settle into the text colour. */
  glow?: boolean
  children: ReactNode
}

/** Delay after the page is ready before the first word moves. */
const START_DELAY = 0.1

/** Words follow each other closely; the last three hang back a little, as on a breath out. */
function wordStagger(index: number, _target: unknown, list: unknown[]): number {
  return index >= list.length - 3 ? index * 0.075 : index * 0.05
}

/**
 * A heading whose words rise and fade in one after another the first time it
 * scrolls into view. With `glow`, the words light up in lime one by one and
 * settle into the text colour instead. Reduced motion shows it as it is.
 */
export function SplitTitle({
  as: Tag = 'h2',
  className,
  wrapperClassName = '',
  glow = false,
  children,
}: SplitTitleProps) {
  const wrapper = useRef<HTMLDivElement>(null)
  const title = useRef<HTMLElement>(null)

  useEffect(() => {
    const host = wrapper.current
    const heading = title.current
    if (!host || !heading) return
    const gsap = getGsap()

    if (!motionAllowed()) {
      gsap.set(host, { opacity: 1 })
      return
    }

    const split = SplitText.create(heading, { type: 'words', wordsClass: 'word', tag: 'span' })
    const words = split.words
    keepLastWordsTogether(words)
    let started = false
    let inView = false
    let ready = false

    const lightUp = () => {
      const root = getComputedStyle(document.documentElement)
      const lime = root.getPropertyValue('--color-pink-500').trim()
      const deep = root.getPropertyValue('--color-purple-100').trim()
      const ink = getComputedStyle(heading).color
      gsap
        .timeline({ delay: START_DELAY })
        .set(words, {
          color: 'transparent',
          textShadow: `0 0 3px ${lime}, 0 0 10px ${lime}, 0 0 18px ${deep}`,
        })
        .from(words, { opacity: 0, duration: 0.66, ease: 'none', stagger: wordStagger }, 0)
        .to(
          words,
          {
            color: ink,
            textShadow: '0 0 3px transparent, 0 0 10px transparent, 0 0 18px transparent',
            duration: 0.66,
            ease: 'none',
            stagger: wordStagger,
          },
          0.3
        )
        .set(words, { clearProps: 'color,textShadow' })
    }

    const rise = () => {
      gsap
        .timeline({ delay: START_DELAY })
        .from(words, { yPercent: 60, duration: 1, ease: 'expo.out', stagger: wordStagger }, 0)
        .from(words, { opacity: 0, duration: 0.66, ease: 'none', stagger: wordStagger }, 0)
    }

    const run = () => {
      if (started || !inView || !ready) return
      started = true
      stopObserving()
      gsap.set(host, { opacity: 1 })
      if (glow) lightUp()
      else rise()
    }

    // Starts once the heading's top is 10% up from the bottom of the screen.
    const stopObserving = observeInview(
      host,
      (_entry, visible) => {
        inView = visible
        run()
      },
      '0px 0px -10% 0px'
    )
    const stopReady = onReady(() => {
      ready = true
      run()
    })

    return () => {
      stopObserving()
      stopReady()
      gsap.killTweensOf(words)
      split.revert()
    }
  }, [glow])

  return (
    <div ref={wrapper} className={`c-split-title ${wrapperClassName}`}>
      <Tag ref={title} className={className}>
        {children}
      </Tag>
    </div>
  )
}
