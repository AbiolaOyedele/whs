'use client'

import { useEffect, useRef, useState, type RefObject } from 'react'
import { motionAllowed } from '@v2/lib/gsap'
import { observeInview } from '@v2/lib/inview'

/**
 * Where a "Why WildHands" card is in its entrance. `static` is the server
 * render and the reduced-motion state: everything shown, finished. Only once
 * the script has run does a card drop to `waiting` (hidden start state), so
 * a no-JS visitor or a crawler never meets invisible content.
 */
export type RevealStage = 'static' | 'waiting' | 'revealed'

/**
 * Plays a card's entrance once, when it has come a fifth of the way up the
 * screen, then holds the finished state.
 */
export function useRevealOnce<T extends Element>(): [RefObject<T | null>, RevealStage] {
  const ref = useRef<T | null>(null)
  const [stage, setStage] = useState<RevealStage>('static')

  useEffect(() => {
    const el = ref.current
    if (!el || !motionAllowed()) return
    setStage((current) => (current === 'revealed' ? current : 'waiting'))
    const stop = observeInview(
      el,
      (_entry, visible) => {
        if (!visible) return
        setStage('revealed')
        stop()
      },
      '0px 0px -20% 0px',
    )
    return stop
  }, [])

  return [ref, stage]
}
