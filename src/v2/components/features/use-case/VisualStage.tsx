import type { ReactNode } from 'react'
import { FluidPanel } from '@v2/components/ui/FluidPanel'
import { ParallaxMedia } from '@v2/components/ui/ParallaxMedia'

interface VisualStageProps {
  /** Turns the art so neighbouring cards do not look identical. */
  artSeed: number
  /** What the illustration shows, for screen readers. */
  label: string
  children: ReactNode
}

/**
 * The frame every feature illustration sits in: the fluid art, with the
 * illustration centred on it. From `sm` it keeps the cards' shared 707 × 600
 * shape; on a phone it is as tall as its contents, so nothing inside has to
 * shrink below a legible size. The art clips itself, not the frame, so a
 * taller illustration grows the card rather than being cut off.
 */
export function VisualStage({ artSeed, label, children }: VisualStageProps) {
  return (
    <div
      role="img"
      aria-label={label}
      className="relative isolate flex items-center justify-center rounded-lg bg-charcoal px-4 py-8 sm:aspect-707/600 sm:p-6 md:p-8"
    >
      <ParallaxMedia className="rounded-[inherit]">
        <FluidPanel seed={artSeed} />
      </ParallaxMedia>
      <div className="relative z-2 w-full max-w-[460px] text-navy-900">{children}</div>
    </div>
  )
}
