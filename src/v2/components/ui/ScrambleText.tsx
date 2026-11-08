'use client'

import { forwardRef, useImperativeHandle, useRef } from 'react'

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
 * A label its control can address through the ref. It used to scramble on
 * hover; that is off, and `setText` simply swaps the text.
 */
export const ScrambleText = forwardRef<ScrambleHandle, ScrambleTextProps>(function ScrambleText(
  { children, className },
  ref,
) {
  const element = useRef<HTMLSpanElement>(null)
  const text = useRef(children)

  useImperativeHandle(
    ref,
    () => ({
      // Scrambling is switched off site-wide: WildHands keeps its labels still.
      // The handle stays so the controls that call it need no changes.
      scramble: () => {},
      reset: () => {},
      setText: (next: string) => {
        text.current = next
        if (element.current) element.current.textContent = next
      },
    }),
    [],
  )

  return (
    <span ref={element} className={className}>
      {children}
    </span>
  )
})
