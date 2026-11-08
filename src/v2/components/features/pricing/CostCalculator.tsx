'use client'

import { useState } from 'react'
import { ChoiceListbox } from '@v2/components/features/forms/ChoiceListbox'
import { CALCULATOR, CYCLES, PLANS, type PlanId } from '@v2/content/pricing'
import { formatNaira, formatPercent, groupDigits, monthlyCost } from './money'
import { RangeField } from './RangeField'

const MONTH_OPTIONS = CYCLES.map((cycle) => ({
  value: String(cycle.months),
  label:
    cycle.months === 1
      ? '1 month'
      : `${cycle.months} months (${cycle.discount}% off)`,
}))

const PLAN_OPTIONS = PLANS.map((plan) => ({ value: plan.id, label: plan.name }))

function clampOrders(value: number): number {
  return Math.min(CALCULATOR.orders.typedMax, Math.max(0, Math.round(value)))
}

/**
 * Orders a month times the average order gives a month of online sales.
 * Each plan then costs its price (less the discount for paying ahead) plus
 * VAT, plus its fee on those sales. Shows the chosen plan in full and names
 * the cheapest one for the same sales.
 */
export function CostCalculator() {
  const [orders, setOrders] = useState<number>(CALCULATOR.defaults.orders)
  const [ordersText, setOrdersText] = useState(String(CALCULATOR.defaults.orders))
  const [average, setAverage] = useState<number>(CALCULATOR.defaults.average)
  const [months, setMonths] = useState(String(CALCULATOR.defaults.months))
  const [planId, setPlanId] = useState<PlanId>(CALCULATOR.defaults.plan)

  const cycle = CYCLES.find((item) => String(item.months) === months) ?? CYCLES[0]
  const plan = PLANS.find((item) => item.id === planId) ?? PLANS[0]
  const salesKobo = orders * average * 100

  const costs = PLANS.map((item) => ({ plan: item, cost: monthlyCost(item, cycle.months, cycle.discount, salesKobo) }))
  const cheapest = costs.reduce((best, item) => (item.cost.totalKobo < best.cost.totalKobo ? item : best))
  const chosen = costs.find((item) => item.plan.id === plan?.id) ?? cheapest

  const setOrdersFromSlider = (value: number) => {
    setOrders(value)
    setOrdersText(String(value))
  }

  const onOrdersTyped = (text: string) => {
    const digits = text.replace(/\D/g, '').slice(0, 6)
    setOrdersText(digits)
    setOrders(clampOrders(Number(digits || 0)))
  }

  const rows = [
    { label: `${chosen.plan.name} ${CALCULATOR.planLine}`, kobo: chosen.cost.planKobo },
    { label: CALCULATOR.vatLine, kobo: chosen.cost.vatKobo },
    {
      label: `${CALCULATOR.feeLine} (${formatPercent(chosen.plan.feeBps)})`,
      kobo: chosen.cost.feeKobo,
    },
  ]

  return (
    <div className="@container grid gap-12.5 md:grid-cols-12 md:gap-gutter">
      <div className="max-md:order-2 md:col-span-5">
        <div className="flex flex-col rounded-md bg-slate-50 p-8.5 slate:bg-white max-sm:p-6">
          <h3 className="text-body-md text-center">{CALCULATOR.totalHeading}</h3>
          <p className="text-heading-xl mt-7.5 text-center tabular-nums" aria-live="polite">
            {formatNaira(chosen.cost.totalKobo)}
          </p>
          <p className="text-body-sm mt-4 text-center text-navy-500">
            {CALCULATOR.onSales} {formatNaira(salesKobo)}
          </p>
          <div className="mt-25 max-sm:mt-12.5">
            <div className="flex justify-between gap-4">
              <span className="text-label text-navy-900 opacity-60">{CALCULATOR.details}</span>
              <span className="text-label text-right text-navy-900 opacity-60">{CALCULATOR.estimate}</span>
            </div>
            <hr className="my-4 border-slate-200" />
            <div className="flex flex-col gap-1">
              {rows.map((row) => (
                <div key={row.label} className="flex justify-between gap-4">
                  <span className="text-body-sm">{row.label}</span>
                  <span className="text-body-sm shrink-0 tabular-nums">
                    {formatNaira(row.kobo)}
                    {CALCULATOR.perMonth}
                  </span>
                </div>
              ))}
              <div className="flex justify-between gap-4">
                <span className="text-body-sm font-bold">{CALCULATOR.totalLine}</span>
                <span className="text-body-sm shrink-0 font-bold tabular-nums">
                  {formatNaira(chosen.cost.totalKobo)}
                  {CALCULATOR.perMonth}
                </span>
              </div>
            </div>
            <hr className="my-4 border-slate-200" />
            <p className="text-body-sm" aria-live="polite">
              {CALCULATOR.cheapest} <strong className="font-semibold">{cheapest.plan.name}</strong>,{' '}
              {formatNaira(cheapest.cost.totalKobo)}
              {CALCULATOR.perMonth}
            </p>
            <p className="text-label mt-6 opacity-60">{CALCULATOR.footnote}</p>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-12.5 max-md:order-1 md:col-span-6 md:col-start-7">
        <RangeField
          id="pricing-orders"
          label={CALCULATOR.orders.label}
          hint={CALCULATOR.orders.hint}
          min={CALCULATOR.orders.min}
          max={CALCULATOR.orders.max}
          step={CALCULATOR.orders.step}
          value={orders}
          valueText={`${groupDigits(orders)} orders`}
          onChange={setOrdersFromSlider}
          aside={
            <input
              id="pricing-orders-typed"
              type="text"
              inputMode="numeric"
              aria-labelledby="pricing-orders-label"
              className="text-body-lg c-pricing-number w-28 shrink-0 text-right tabular-nums"
              value={ordersText}
              onChange={(event) => onOrdersTyped(event.target.value)}
              onBlur={() => setOrdersText(String(orders))}
            />
          }
        />
        <div className="flex items-start justify-between gap-gutter @max-xl:flex-col">
          <ChoiceListbox
            id="pricing-months"
            name="months"
            label={CALCULATOR.months.label}
            placeholder={CALCULATOR.months.placeholder}
            options={MONTH_OPTIONS}
            value={months}
            onChange={setMonths}
            className="grow basis-0 @max-xl:w-full @max-xl:basis-auto"
          />
          <ChoiceListbox
            id="pricing-plan"
            name="plan"
            label={CALCULATOR.plan.label}
            placeholder={CALCULATOR.plan.placeholder}
            options={PLAN_OPTIONS}
            value={planId}
            onChange={(value) => {
              const next = PLANS.find((item) => item.id === value)
              if (next) setPlanId(next.id)
            }}
            className="grow basis-0 @max-xl:w-full @max-xl:basis-auto"
          />
        </div>
        <RangeField
          id="pricing-average"
          label={CALCULATOR.average.label}
          hint={CALCULATOR.average.hint}
          min={CALCULATOR.average.min}
          max={CALCULATOR.average.max}
          step={CALCULATOR.average.step}
          value={average}
          valueText={formatNaira(average * 100)}
          onChange={setAverage}
          aside={<span className="text-body-lg shrink-0 tabular-nums">{formatNaira(average * 100)}</span>}
        />
      </div>
    </div>
  )
}
