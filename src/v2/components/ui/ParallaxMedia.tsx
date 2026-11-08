import type { ReactNode } from 'react'

interface ParallaxMediaProps {
  children: ReactNode
  /** Negative drifts against the scroll. The reference uses -0.1 for card art. */
  speed?: number
  className?: string
}

/**
 * Fills its positioned parent and drifts its content slightly as the page
 * scrolls (Locomotive's data-scroll-speed). The content is oversized a
 * little so the drift never shows an edge.
 */
export function ParallaxMedia({ children, speed = -0.1, className = '' }: ParallaxMediaProps) {
  return (
    <div className={`absolute inset-0 block overflow-hidden ${className}`}>
      <div className="absolute inset-x-0 -inset-y-[12%]" data-scroll="" data-scroll-speed={String(speed)}>
        {children}
      </div>
    </div>
  )
}
