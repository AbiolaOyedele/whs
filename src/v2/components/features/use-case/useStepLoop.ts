'use client'

import { useEffect, useState, type RefObject } from 'react'
import { motionAllowed } from '@v2/lib/gsap'
import { observeInview } from '@v2/lib/inview'

export interface StepLoop {
  /** The state the illustration is in, 0 to count - 1. */
  step: number
  /** How many times the loop has started over since the page loaded. */
  round: number
}

/**
 * Steps a looping illustration through `count` states, one every `everyMs`,
 * while its element is on screen; it rests on the last state for `hold`
 * extra ticks before starting over. It starts, and server-renders, on the
 * last state, so the static page and reduced motion both show the finished
 * picture. The element must not be observed by another in-view hook.
 */
export function useStepLoop(ref: RefObject<Element | null>, count: number, everyMs = 1100, hold = 2): StepLoop {
  const [state, setState] = useState<StepLoop>({ step: count - 1, round: 0 })

  useEffect(() => {
    const el = ref.current
    if (!el || count < 2 || !motionAllowed()) return
    let timer: number | null = null
    let tick = 0
    let round = 0
    const stop = () => {
      if (timer !== null) window.clearInterval(timer)
      timer = null
    }
    const unobserve = observeInview(el, (_entry, visible) => {
      stop()
      if (!visible) return
      tick = 0
      setState({ step: 0, round })
      timer = window.setInterval(() => {
        tick += 1
        if (tick >= count + hold) {
          tick = 0
          round += 1
        }
        setState({ step: Math.min(tick, count - 1), round })
      }, everyMs)
    })
    return () => {
      stop()
      unobserve()
    }
  }, [ref, count, everyMs, hold])

  return state
}
