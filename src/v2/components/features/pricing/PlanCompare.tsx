import { Fragment } from 'react'
import { SegmentedControls } from '@v2/components/ui/SegmentedControls'
import { COMPARE_GROUPS, COMPARE_PRICE_LABEL, COMPARE_TITLE, PLANS } from '@v2/content/pricing'
import { CompareCell } from './CompareCell'
import { ComparePanel } from './ComparePanel'
import { formatNaira } from './money'
import { PlanAction } from './PlanAction'

/**
 * Every plan side by side. A 12-column grid from tablet up (label over four
 * columns, two per plan); on phones the same rows sit behind plan tabs.
 */
export function PlanCompare() {
  return (
    <div className="container-sm">
      <div className="my-fluid-4xl hidden md:block">
        <div className="grid grid-cols-12 gap-gutter">
          <div className="col-span-4">
            <h2 className="text-heading-xs">{COMPARE_TITLE}</h2>
          </div>
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className="text-body-md col-span-2 flex items-center justify-center text-center text-navy-500"
            >
              {plan.name}
            </div>
          ))}
        </div>
        <hr className="my-9 border-slate-200" />
        <div className="grid grid-cols-12 gap-gutter">
          <div className="col-span-4">
            <h3 className="text-heading-xs">{COMPARE_PRICE_LABEL}</h3>
          </div>
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className="text-heading-xs col-span-2 flex items-center justify-center text-center text-navy-500"
            >
              {formatNaira(plan.monthlyKobo)}
            </div>
          ))}
        </div>
        {COMPARE_GROUPS.map((group) => (
          <Fragment key={group.title}>
            <hr className="my-9 border-slate-200" />
            <div className="mb-6 grid grid-cols-12 gap-gutter">
              <div className="col-span-4">
                <h3 className="text-heading-xs">{group.title}</h3>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              {group.rows.map((row) => (
                <div key={row.label} className="grid grid-cols-12 gap-gutter">
                  <div className="col-span-4">
                    <p className="text-body-md">{row.label}</p>
                  </div>
                  {row.values.map((value, index) => (
                    <div
                      key={PLANS[index]?.id ?? index}
                      className="col-span-2 flex justify-center text-center text-navy-500"
                    >
                      <CompareCell value={value} />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </Fragment>
        ))}
        <div className="mt-12.5 grid grid-cols-12 gap-gutter">
          <div className="col-span-4" />
          {PLANS.map((plan) => (
            <div key={plan.id} className="col-span-2">
              <PlanAction plan={plan} compact />
            </div>
          ))}
        </div>
      </div>

      <div className="c-pricing-compare mt-fluid-3xl mb-fluid-2xl block md:hidden">
        <h2 className="text-heading-sm text-center">{COMPARE_TITLE}</h2>
        <SegmentedControls
          tabs={PLANS.map((plan) => plan.name)}
          panels={PLANS.map((plan, index) => (
            <ComparePanel key={plan.id} plan={plan} index={index} />
          ))}
          className="mt-fluid-lg w-full"
          tablistClassName="w-full"
        />
      </div>
    </div>
  )
}
