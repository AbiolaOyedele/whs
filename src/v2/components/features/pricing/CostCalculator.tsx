'use client'

import { useState } from 'react'
import { ChoiceListbox } from '@v2/components/features/forms/ChoiceListbox'
import { CALCULATOR, CYCLES, PLANS, PRICE_CARD, type PlanId, type PricingPlan } from '@v2/content/pricing'
import { formatNaira, formatPercent, groupDigits } from './money'
import { RangeField } from './RangeField'

/** Full price or deposit, keyed by position in CYCLES. */
const PAYMENT_OPTIONS = CYCLES.map((cycle, index) => ({
  value: String(index),
  label: cycle.discount === 0 ? 'Full price' : 'Deposit to start',
}))

const PLAN_OPTIONS = PLANS.map((plan) => ({ value: plan.id, label: plan.name }))

function clampPages(value: number): number {
  return Math.min(CALCULATOR.orders.typedMax, Math.max(CALCULATOR.orders.min, Math.round(value)))
}

/** The smallest build that covers this many pages: Starter is one page, Standard up to 4, past that is quoted. */
function planForPages(pages: number): PricingPlan | undefined {
  const id: PlanId = pages <= 1 ? 'starter' : pages <= 4 ? 'growth' : 'pro'
  return PLANS.find((plan) => plan.id === id)
}

/** A price in naira, or "Quoted" for a build priced after a discovery call. */
function priceText(kobo: number | null): string {
  return kobo === null ? PRICE_CARD.noFee : formatNaira(kobo)
}

/**
 * The chosen plan's full price and deposit, what you pay now (full price or
 * the deposit), and what is left of your budget after the full price. The
 * pages slider names the build that fits. Quoted builds show "Quoted".
 */
export function CostCalculator() {
  const [pages, setPages] = useState<number>(CALCULATOR.defaults.orders)
  const [pagesText, setPagesText] = useState(String(CALCULATOR.defaults.orders))
  const [budget, setBudget] = useState<number>(CALCULATOR.defaults.average)
  const [payment, setPayment] = useState(String(CALCULATOR.defaults.months))
  const [planId, setPlanId] = useState<PlanId>(CALCULATOR.defaults.plan)

  const cycle = CYCLES[Number(payment)] ?? CYCLES[0]
  const plan = PLANS.find((item) => item.id === planId) ?? PLANS[0]
  const fit = planForPages(pages)
  const budgetKobo = budget * 100

  const quoted = !plan || plan.monthlyKobo === 0
  const fullKobo = quoted ? null : plan.monthlyKobo
  const depositKobo = quoted ? null : Math.round((plan.monthlyKobo * plan.feeBps) / 10_000)
  const nowKobo = cycle.discount === 0 ? fullKobo : depositKobo

  const setPagesFromSlider = (value: number) => {
    setPages(value)
    setPagesText(String(value))
  }

  const onPagesTyped = (text: string) => {
    const digits = text.replace(/\D/g, '').slice(0, 2)
    setPagesText(digits)
    setPages(clampPages(Number(digits || 0)))
  }

  const rows = [
    { label: `${plan?.name ?? ''} ${CALCULATOR.planLine}`, kobo: fullKobo },
    {
      label: plan && !quoted ? `${CALCULATOR.vatLine} (${formatPercent(plan.feeBps)})` : CALCULATOR.vatLine,
      kobo: depositKobo,
    },
    { label: CALCULATOR.feeLine, kobo: fullKobo === null ? null : budgetKobo - fullKobo },
  ]

  return (
    <div className="@container grid gap-12.5 md:grid-cols-12 md:gap-gutter">
      <div className="max-md:order-2 md:col-span-5">
        <div className="flex flex-col rounded-md bg-slate-50 p-8.5 slate:bg-white max-sm:p-6">
          <h3 className="text-body-md text-center">{CALCULATOR.totalHeading}</h3>
          <p className="text-heading-xl mt-7.5 text-center tabular-nums" aria-live="polite">
            {priceText(nowKobo)}
          </p>
          <p className="text-body-sm mt-4 text-center text-navy-500">
            {CALCULATOR.onSales} {formatNaira(budgetKobo)}
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
                    {priceText(row.kobo)}
                    {CALCULATOR.perMonth}
                  </span>
                </div>
              ))}
              <div className="flex justify-between gap-4">
                <span className="text-body-sm font-bold">{CALCULATOR.totalLine}</span>
                <span className="text-body-sm shrink-0 font-bold tabular-nums">
                  {priceText(nowKobo)}
                  {CALCULATOR.perMonth}
                </span>
              </div>
            </div>
            <hr className="my-4 border-slate-200" />
            <p className="text-body-sm" aria-live="polite">
              {CALCULATOR.cheapest} <strong className="font-semibold">{fit?.name ?? ''}</strong>,{' '}
              {fit && fit.monthlyKobo > 0 ? formatNaira(fit.monthlyKobo) : 'quoted after a discovery call'}
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
          value={pages}
          valueText={pages === 1 ? '1 page' : `${groupDigits(pages)} pages`}
          onChange={setPagesFromSlider}
          aside={
            <input
              id="pricing-orders-typed"
              type="text"
              inputMode="numeric"
              aria-labelledby="pricing-orders-label"
              className="text-body-lg c-pricing-number w-28 shrink-0 text-right tabular-nums"
              value={pagesText}
              onChange={(event) => onPagesTyped(event.target.value)}
              onBlur={() => setPagesText(String(pages))}
            />
          }
        />
        <div className="flex items-start justify-between gap-gutter @max-xl:flex-col">
          <ChoiceListbox
            id="pricing-months"
            name="months"
            label={CALCULATOR.months.label}
            placeholder={CALCULATOR.months.placeholder}
            options={PAYMENT_OPTIONS}
            value={payment}
            onChange={setPayment}
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
          value={budget}
          valueText={formatNaira(budgetKobo)}
          onChange={setBudget}
          aside={<span className="text-body-lg shrink-0 tabular-nums">{formatNaira(budgetKobo)}</span>}
        />
      </div>
    </div>
  )
}
