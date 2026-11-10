'use client'

import { scratchCard } from '@v2/content/home-upper'
import { useRevealOnce } from './useRevealOnce'
import { WhyPanel } from './WhyPanel'

/**
 * Three products WildHands built for three very different businesses, set
 * like a contents page: each real logo beside its industry and what it
 * does, one row each, ruled off in ink.
 */
export function WhyScratchCard() {
  const [ref, stage] = useRevealOnce<HTMLDivElement>()

  return (
    <WhyPanel tone="white" stage={stage} panelRef={ref} className="justify-center">
      <ul>
        {scratchCard.products.map((product, index) => (
          <li
            key={product.name}
            data-why-step=""
            style={{ ['--why-step' as string]: index }}
            className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] items-center gap-5 border-charcoal py-6 not-first:border-t first:pt-0 last:pb-0 sm:gap-8 sm:py-8"
          >
            <span className="flex h-12 items-center sm:h-14">
              <img
                src={product.logo.src}
                alt={product.logo.alt}
                className="h-9 w-auto max-w-full object-contain object-left sm:h-11"
              />
            </span>
            <span className="flex flex-col gap-1.5">
              <span className="c-why-display text-[clamp(1.25rem,4.5cqw,1.625rem)]">{product.industry}</span>
              <span className="text-body-sm">{product.what}</span>
            </span>
          </li>
        ))}
      </ul>
    </WhyPanel>
  )
}
