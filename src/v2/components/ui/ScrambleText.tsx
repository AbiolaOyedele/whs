'use client'

import { forwardRef, useCallback, useImperativeHandle, useRef } from 'react'
import { getGsap, isTouchDevice } from '@v2/lib/gsap'

export interface ScrambleHandle {
  scramble: () => void
  reset: () => void
  setText: (text: string) => void
}

interface ScrambleTextProps {
  children: string
  className?: string
}

/**
 * Text that briefly scrambles into random characters and back, run by the
 * control it sits in (on hover) through the ref. Does nothing on touch screens.
 */
export const ScrambleText = forwardRef<ScrambleHandle, ScrambleTextProps>(function ScrambleText(
  { children, className },
  ref,
) {
  const element = useRef<HTMLSpanElement>(null)
  const text = useRef(children)

  const run = useCallback((to: string, duration: number) => {
    if (!element.current || isTouchDevice()) return
    getGsap().to(element.current, { duration, scrambleText: { text: to } })
  }, [])

  useImperativeHandle(
    ref,
    () => ({
      scramble: () => run(text.current, 0.5),
      reset: () => run(text.current, 0.5),
      setText: (next: string) => {
        text.current = next
        if (!element.current) return
        if (isTouchDevice()) element.current.textContent = next
        else run(next, 0.4)
      },
    }),
    [run],
  )

  return (
    <span ref={element} className={className}>
      {children}
    </span>
  )
})
