'use client'

import { useState } from 'react'
import { SegmentedControls } from '@v2/components/ui/SegmentedControls'
import { CYCLES, PLANS, PRICE_CARD } from '@v2/content/pricing'
import { formatNaira, formatPercent, quoteCycle } from './money'

/** Short enough that all four fit a 345px phone track. */
const CYCLE_TABS = CYCLES.map((cycle) =>
  cycle.months === 1 ? 'Monthly' : cycle.months === 12 ? 'Yearly' : `${cycle.months} months`,
)

/**
 * The price card beside the pricing hero. The tabs switch how long you pay
 * for at once; each plan's price becomes the total for that stretch, with the
 * discount taken off.
 */
export function HeroPriceTable() {
  const [cycleIndex, setCycleIndex] = useState(0)
  const cycle = CYCLES[cycleIndex] ?? CYCLES[0]
  const unit = cycle.months === 1 ? '/mo' : `/${cycle.months} mo`
  const note =
    cycle.discount > 0
      ? `*${cycle.discount}% off for paying ${cycle.months} months at once. Before 7.5% VAT`
      : '*Before 7.5% VAT'

  return (
    <div className="relative z-above flex w-full max-w-md grow flex-col justify-between gap-gutter pb-12.5 xl:max-w-lg">
      <div className="anim-transform-opacity -delay-2 flex grow flex-col justify-center">
        <div className="w-full rounded-sm bg-slate-50 p-6">
          <h2 className="text-heading-xs mb-6 text-center">{PRICE_CARD.title}</h2>
          <div>
            <div className="mb-4 flex justify-between">
              <h3 className="text-label opacity-60">{PRICE_CARD.planHeading}</h3>
              <p className="text-label opacity-60">{PRICE_CARD.priceHeading}</p>
            </div>
            <ul className="space-y-2" aria-live="polite">
              {PLANS.map((plan) => (
                <li key={plan.id} className="flex justify-between gap-4">
                  <span className="text-body-sm">{plan.name}</span>
                  <span className="text-body-sm text-right tabular-nums">
                    <span>{formatNaira(quoteCycle(plan, cycle.months, cycle.discount).subtotalKobo)}</span>
                    <span className="text-navy-900 opacity-60">{unit}</span>
                  </span>
                </li>
              ))}
            </ul>
            <p className="text-label mt-6 opacity-60">{note}</p>
          </div>
          <hr className="my-6 border-slate-200" />
          <div>
            <div className="mb-4 flex justify-between">
              <h3 className="text-label opacity-60">{PRICE_CARD.feeSection}</h3>
              <p className="text-label opacity-60">{PRICE_CARD.feeHeading}</p>
            </div>
            <ul className="space-y-2">
              {PLANS.map((plan) => (
                <li key={plan.id} className="flex justify-between gap-4">
                  <span className="text-body-sm">{plan.name}</span>
                  <span className="text-body-sm">
                    {plan.feeBps > 0 ? (
                      <>
                        <span>{formatPercent(plan.feeBps)}</span>
                        <span className="text-navy-900 opacity-60">/sale</span>
                      </>
                    ) : (
                      PRICE_CARD.noFee
                    )}
                  </span>
                </li>
              ))}
            </ul>
            <p className="text-label mt-6 opacity-60">{PRICE_CARD.feeNote}</p>
          </div>
        </div>
      </div>
      <div className="anim-transform-opacity -delay-3 flex">
        <SegmentedControls
          tabs={CYCLE_TABS}
          onChange={setCycleIndex}
          className="mx-auto"
          tablistClassName="max-w-full"
          tabClassName="grow px-2.5!"
        />
      </div>
    </div>
  )
}
