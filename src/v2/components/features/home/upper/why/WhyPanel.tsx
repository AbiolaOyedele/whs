import type { ReactNode, RefObject } from 'react'
import type { RevealStage } from './useRevealOnce'

export type WhyTone = 'ink' | 'lime' | 'white'

interface WhyPanelProps {
  tone: WhyTone
  stage: RevealStage
  panelRef: RefObject<HTMLDivElement | null>
  children: ReactNode
  className?: string
}

/* The white panel sits on the white page, so an ink hairline gives it its edge. */
const TONES: Record<WhyTone, string> = {
  ink: 'bg-charcoal text-white',
  lime: 'bg-pink-500 text-charcoal',
  white: 'border border-charcoal bg-white text-charcoal',
}

/**
 * The rounded panel each "Why WildHands" card draws on. `data-reveal`
 * drives the staged entrance in home.css; until the script runs, and with
 * reduced motion, the finished state shows.
 */
export function WhyPanel({ tone, stage, panelRef, children, className = '' }: WhyPanelProps) {
  return (
    <div
      ref={panelRef}
      data-reveal={stage}
      className={`c-why relative isolate flex min-h-[340px] flex-col overflow-hidden rounded-lg p-5 sm:p-8 md:min-h-[460px] ${TONES[tone]} ${className}`}
    >
      {children}
    </div>
  )
}
