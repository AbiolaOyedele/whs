'use client'

import { useEffect, useRef, type ElementType, type ReactNode } from 'react'
import { getGsap, motionAllowed, SplitText } from '@v2/lib/gsap'
import { observeInview } from '@v2/lib/inview'
import { onReady } from '@v2/lib/page-state'

interface SplitTitleProps {
  as?: ElementType
  className?: string
  /** Wrapper classes, e.g. layout around the heading. */
  wrapperClassName?: string
  children: ReactNode
}

/** Delay after the page is ready before the first word shows. */
const START_DELAY = 0.35

/**
 * A heading whose words flicker on in random order the first time it is on
 * screen, then dip and come back once, like a sign lighting up.
 * Wrap highlighted words in <span className="text-gradient">.
 */
export function SplitTitle({ as: Tag = 'h2', className, wrapperClassName = '', children }: SplitTitleProps) {
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
    let started = false
    let inView = false
    let ready = false

    const run = () => {
      if (started || !inView || !ready) return
      started = true
      stopObserving()
      gsap.set(host, { opacity: 1 })
      gsap.set(words, { opacity: 0 })
      gsap
        .timeline({ delay: START_DELAY })
        .to(words, { opacity: 1, duration: 0.1, stagger: { each: 0.032, from: 'random' }, ease: 'power2.out' })
        .to(words, { opacity: 0.1, duration: 0.03, ease: 'power1.in' }, '+=0.02')
        .to(words, { opacity: 1, duration: 0.03, ease: 'power1.out' })
    }

    const stopObserving = observeInview(host, (_entry, visible) => {
      inView = visible
      run()
    })
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
  }, [])

  return (
    <div ref={wrapper} className={`c-split-title ${wrapperClassName}`}>
      <Tag ref={title} className={className}>
        {children}
      </Tag>
    </div>
  )
}
