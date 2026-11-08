'use client'

import { useEffect, useRef, useState, type RefObject } from 'react'
import { observeInview } from '@v2/lib/inview'

/**
 * True once the element has come a fifth of the way up the screen, and
 * stays true: the "Why WildHands" cards play their entrance once and then
 * hold their finished state.
 */
export function useRevealOnce<T extends Element>(): [RefObject<T | null>, boolean] {
  const ref = useRef<T | null>(null)
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el || revealed) return
    const stop = observeInview(
      el,
      (_entry, visible) => {
        if (!visible) return
        setRevealed(true)
        stop()
      },
      '0px 0px -20% 0px',
    )
    return stop
  }, [revealed])

  return [ref, revealed]
}
