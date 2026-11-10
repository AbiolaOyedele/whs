'use client'

import { Icon } from '@v2/components/ui/Icon'
import { proposalCard } from '@v2/content/home-upper'
import { useRevealOnce } from './useRevealOnce'
import { WhyPanel } from './WhyPanel'

/**
 * The written proposal for a Standard website, set straight onto an ink
 * panel: what is in scope, what is out, and the one fixed price on a lime
 * block, the card's single lime. Lines arrive one after another.
 */
export function WhyProposalCard() {
  const [ref, stage] = useRevealOnce<HTMLDivElement>()
  const { inScope, outScope } = proposalCard
  let step = 0
  const next = () => ({ ['--why-step' as string]: step++ })

  return (
    <WhyPanel tone="ink" stage={stage} panelRef={ref} className="gap-6">
      <div data-why-step="" style={next()} className="border-b border-white pb-4">
        <p className="c-why-display text-[clamp(1.5rem,6cqw,2rem)]">{proposalCard.project}</p>
        <p className="text-body-sm mt-2">{proposalCard.label}</p>
      </div>

      <div className="grid gap-6 @lg/feature-card:grid-cols-[3fr_2fr]">
        <div>
          <p data-why-step="" style={next()} className="text-body-md mb-3 font-medium">
            {proposalCard.inLabel}
          </p>
          <ul className="flex flex-col gap-2.5">
            {inScope.map((line) => (
              <li key={line} data-why-step="" style={next()} className="text-body-sm flex items-start gap-2.5">
                <Icon name="check" className="mt-px size-4 shrink-0" strokeWidth={2.25} />
                {line}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p data-why-step="" style={next()} className="text-body-md mb-3 font-medium">
            {proposalCard.outLabel}
          </p>
          <ul className="flex flex-col gap-2.5">
            {outScope.map((line) => (
              <li key={line} data-why-step="" style={next()} className="text-body-sm flex items-start gap-2.5">
                <Icon name="x" className="mt-px size-4 shrink-0" strokeWidth={2.25} />
                {line}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <dl data-why-step="" style={next()} className="mt-auto rounded-md bg-pink-500 p-4 text-charcoal sm:p-5">
        <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-1">
          <dt className="text-body-md">{proposalCard.priceLabel}</dt>
          <dd className="font-mono text-[clamp(1.75rem,8cqw,2.75rem)] leading-none tabular-nums">{proposalCard.price}</dd>
        </div>
        <div className="mt-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-t border-charcoal pt-3">
          <dt className="text-body-sm">{proposalCard.depositLabel}</dt>
          <dd className="text-body-sm font-mono tabular-nums">{proposalCard.deposit}</dd>
        </div>
      </dl>
    </WhyPanel>
  )
}
