'use client'

import { scratchCard } from '@v2/content/home-upper'
import { useRevealOnce } from './useRevealOnce'
import { WhyPanel } from './WhyPanel'

/** Where each card lands when the stack fans out: left, centre, right. */
const FAN = ['c-why-fan-left', 'c-why-fan-centre', 'c-why-fan-right'] as const

/**
 * A blueprint-grid panel with three products WildHands built for three very
 * different businesses. They start as one neat stack and fan out side by
 * side, each showing its logo and its industry.
 */
export function WhyScratchCard() {
  const [ref, revealed] = useRevealOnce<HTMLDivElement>()

  return (
    <WhyPanel tone="slate" revealed={revealed} panelRef={ref} className="justify-between gap-6">
      <p className="self-start">
        <span className="text-label inline-block rounded-sm bg-charcoal px-2 py-1.5 text-white">{scratchCard.chip}</span>
      </p>
      <ul className="relative mx-auto aspect-[5/3] w-full max-w-[560px]">
        {scratchCard.products.map((product, index) => (
          <li
            key={product.name}
            className={`c-why-fan-card absolute top-1/2 left-1/2 flex aspect-[4/5] w-[33%] -translate-x-1/2 -translate-y-1/2 flex-col rounded-md bg-white p-3 shadow-[0_18px_40px_-18px_rgb(19_19_20/0.45)] sm:p-4 ${
              FAN[index] ?? ''
            }`}
          >
            <span className="flex grow items-center justify-center">
              <img src={product.logo.src} alt={product.logo.alt} className="max-h-9 max-w-[78%] object-contain sm:max-h-12" />
            </span>
            <span className="text-label border-t border-slate-100 pt-2 text-center text-navy-500 sm:pt-3">
              {product.industry}
            </span>
          </li>
        ))}
      </ul>
    </WhyPanel>
  )
}
