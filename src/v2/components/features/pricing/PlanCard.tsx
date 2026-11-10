import type { ReactNode } from 'react'
import { PER_MONTH, PRICE_CARD, TRIAL_TAB, type PricingPlan } from '@v2/content/pricing'
import { formatNaira } from './money'
import { PlanAction } from './PlanAction'
import { TickIcon } from './TickIcon'
import { TrialIcon } from './TrialIcon'

interface PlanCardProps {
  plan: PricingPlan
  /** The most popular plan: gets the pink tab and the pink button. */
  featured: boolean
  /** Replaces the plan's usual button, e.g. a pay button on the campaign page. */
  action?: ReactNode
}

/** One plan: name, who it is for, its price (or "Quoted"), what it includes, and a button. */
export function PlanCard({ plan, featured, action }: PlanCardProps) {
  return (
    <div className={`relative h-auto ${featured ? 'max-sm:mt-13' : ''}`}>
      {featured ? (
        <div className="absolute bottom-full left-0 flex w-full items-center justify-between rounded-t-md bg-pink-500 px-8.5 py-4 text-charcoal">
          <span className="text-body-md text-charcoal">{TRIAL_TAB}</span>
          <span>
            <TrialIcon />
          </span>
        </div>
      ) : null}
      <div
        className={`flex h-full flex-col rounded-b-md bg-white max-sm:gap-10 max-sm:p-6 sm:gap-15 sm:p-gutter ${featured ? '' : 'rounded-t-md'}`}
      >
        <div>
          <h3 className="text-heading-xs">{plan.name}</h3>
          <p className="text-navy-900">{plan.tagline}</p>
        </div>
        <div>
          <p className="max-md:text-heading-xl md:text-heading-lg">
            {plan.monthlyKobo > 0 ? formatNaira(plan.monthlyKobo) : PRICE_CARD.noFee} <span className="text-body-md whitespace-nowrap text-navy-900 lg:mt-1 lg:block">{plan.monthlyKobo > 0 ? PER_MONTH : ''}</span>
          </p>
        </div>
        <div>
          <ul className="flex flex-col gap-2">
            {plan.highlights.map((line) => (
              <li key={line} className="text-body-md flex gap-2">
                <span className="text-navy-900">
                  <TickIcon />
                </span>
                <span className="text-navy-900">{line}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex grow items-end">
          {action ?? <PlanAction plan={plan} compact={false} />}
        </div>
      </div>
    </div>
  )
}
