'use client'

import { useEffect, useState, type RefObject } from 'react'
import { motionAllowed } from '@v2/lib/gsap'
import { observeInview } from '@v2/lib/inview'

/**
 * True while the element is on screen and the visitor allows motion, so a
 * looping animation only runs when someone can see it.
 */
export function useInviewPlaying(ref: RefObject<Element | null>): boolean {
  const [playing, setPlaying] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el || !motionAllowed()) return
    return observeInview(el, (_entry, visible) => setPlaying(visible))
  }, [ref])
  return playing
}
