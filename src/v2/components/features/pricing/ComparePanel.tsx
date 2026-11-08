import { Fragment } from 'react'
import { COMPARE_GROUPS, COMPARE_PRICE_LABEL, type PricingPlan } from '@v2/content/pricing'
import { CompareCell } from './CompareCell'
import { formatNaira } from './money'
import { PlanAction } from './PlanAction'

interface ComparePanelProps {
  plan: PricingPlan
  /** The plan's position in PLANS, which is its column in each row. */
  index: number
}

/** Phones: one plan's comparison rows, shown behind its tab. */
export function ComparePanel({ plan, index }: ComparePanelProps) {
  return (
    <div className="mt-6 flex flex-col">
      <div className="flex justify-between gap-1">
        <p className="text-heading-xs">{COMPARE_PRICE_LABEL}</p>
        <p className="text-heading-xs">{formatNaira(plan.monthlyKobo)}</p>
      </div>
      {COMPARE_GROUPS.map((group) => (
        <Fragment key={group.title}>
          <hr className="my-4 border-slate-100" />
          <div className="flex flex-col gap-3">
            <h3 className="text-heading-xs mb-2">{group.title}</h3>
            <ul className="flex flex-col gap-0.5">
              {group.rows.map((row) => (
                <li key={row.label} className="flex items-center justify-between gap-4 pb-2">
                  <span className="text-body-md">{row.label}</span>
                  <span className="text-body-md shrink-0 text-navy-500">
                    <CompareCell value={row.values[index] ?? false} markClassName="size-5" />
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </Fragment>
      ))}
      <div className="mt-6">
        <PlanAction plan={plan} compact={false} />
      </div>
    </div>
  )
}
