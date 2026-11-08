import type { ReactNode, RefObject } from 'react'

export type WhyTone = 'ink' | 'lime' | 'slate'

interface WhyPanelProps {
  tone: WhyTone
  revealed: boolean
  panelRef: RefObject<HTMLDivElement | null>
  children: ReactNode
  className?: string
}

const TONES: Record<WhyTone, string> = {
  ink: 'bg-charcoal text-white',
  lime: 'bg-pink-500 text-charcoal',
  slate: 'bg-slate-100 text-charcoal',
}

/**
 * The rounded panel each "Why WildHands" card draws on. `data-revealed`
 * drives the staged entrance in home.css; with reduced motion the finished
 * state shows straight away.
 */
export function WhyPanel({ tone, revealed, panelRef, children, className = '' }: WhyPanelProps) {
  return (
    <div
      ref={panelRef}
      data-revealed={revealed ? 'true' : 'false'}
      className={`c-why relative isolate flex min-h-[340px] flex-col overflow-hidden rounded-lg p-5 sm:p-8 md:min-h-[460px] ${TONES[tone]} ${className}`}
    >
      {children}
    </div>
  )
}
