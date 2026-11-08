'use client'

import { Icon } from '@v2/components/ui/Icon'
import { proposalCard } from '@v2/content/home-upper'
import { useRevealOnce } from './useRevealOnce'
import { WhyPanel } from './WhyPanel'

/**
 * A written proposal for the Standard website on an ink panel: what is in
 * scope, what is out, and the one fixed price. The sheet slides up, its
 * lines arrive one after another, then a lime marker sweeps under the price.
 */
export function WhyProposalCard() {
  const [ref, revealed] = useRevealOnce<HTMLDivElement>()
  const { inScope, outScope } = proposalCard
  let step = 0
  const next = () => ({ ['--why-step' as string]: step++ })

  return (
    <WhyPanel tone="ink" revealed={revealed} panelRef={ref} className="items-center justify-center">
      <div className="relative w-full max-w-[440px]">
        <div aria-hidden="true" className="c-why-sheet-back absolute inset-0 rounded-md bg-white/10" />
        <div className="c-why-sheet relative rounded-md bg-white p-5 text-charcoal shadow-[0_24px_60px_-20px_rgb(0_0_0/0.6)] sm:p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-slate-100 pb-4">
            <p className="text-label text-navy-500">{proposalCard.label}</p>
            <p className="c-why-display text-[1.25rem]">{proposalCard.project}</p>
          </div>

          <p className="text-label mt-4 mb-2 text-navy-500">{proposalCard.inLabel}</p>
          <ul className="flex flex-col gap-2">
            {inScope.map((line) => (
              <li key={line} data-why-step="" style={next()} className="text-body-sm flex items-start gap-2.5">
                <span className="mt-px flex size-5 shrink-0 items-center justify-center rounded-full bg-pink-500">
                  <Icon name="check" className="size-3" strokeWidth={2.5} />
                </span>
                {line}
              </li>
            ))}
          </ul>

          <p className="text-label mt-4 mb-2 text-navy-500">{proposalCard.outLabel}</p>
          <ul className="flex flex-col gap-2">
            {outScope.map((line) => (
              <li key={line} data-why-step="" style={next()} className="text-body-sm flex items-start gap-2.5 text-navy-500">
                <span className="mt-px flex size-5 shrink-0 items-center justify-center rounded-full bg-slate-100">
                  <Icon name="x" className="size-3" strokeWidth={2.5} />
                </span>
                {line}
              </li>
            ))}
          </ul>

          <div data-why-step="" style={next()} className="mt-5 border-t border-slate-100 pt-4">
            <div className="flex items-end justify-between gap-4">
              <p className="text-label text-navy-500">{proposalCard.priceLabel}</p>
              <p className="c-why-display text-[2rem] sm:text-[2.5rem]">
                <span className="c-why-mark">{proposalCard.price}</span>
              </p>
            </div>
            <div className="mt-2 flex items-center justify-between gap-4 text-navy-500">
              <p className="text-body-sm">{proposalCard.depositLabel}</p>
              <p className="text-body-sm">{proposalCard.deposit}</p>
            </div>
          </div>
        </div>
      </div>
    </WhyPanel>
  )
}
