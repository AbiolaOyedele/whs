import { SplitTitle } from '@v2/components/ui/SplitTitle'
import { CALCULATOR, PLANS, TRIAL_PLAN } from '@v2/content/pricing'
import { CostCalculator } from './CostCalculator'
import { PlanCard } from './PlanCard'
import { PlanCompare } from './PlanCompare'
import { PricingFaqs } from './PricingFaqs'
import { PricingHero } from './PricingHero'

/** Spacing between blocks inside a section (the reference's .section-spacing). */
const SECTION = 'max-md:my-fluid-xl md:my-fluid-3xl first:mt-0 last:mb-0'

/**
 * /pricing, in the reference's order: split hero with the price card, plan
 * cards and the comparison on a white sheet, then the cost calculator and
 * questions on a pale sheet.
 */
export function PricingPage() {
  return (
    <div className="slate overflow-hidden">
      <PricingHero />
      <div className="relative z-above -mt-7.5 rounded-4xl bg-white md:-mt-15">
        <section className="rounded-4xl bg-white max-md:py-fluid-xl">
          <div className={`container pt-fluid-xl md:pt-fluid-4xl ${SECTION}`}>
            <div className="grid grid-cols-1 gap-gutter sm:grid-cols-2 sm:max-lg:gap-y-18 lg:grid-cols-4">
              {PLANS.map((plan) => (
                <PlanCard key={plan.id} plan={plan} featured={plan.id === TRIAL_PLAN} />
              ))}
            </div>
          </div>
          <div className={`container ${SECTION}`}>
            <PlanCompare />
          </div>
        </section>
        <section className="slate rounded-4xl bg-slate-50 max-md:py-fluid-xl md:py-fluid-2xl">
          <div className={`container ${SECTION}`}>
            <div className="mb-10 grid gap-gutter md:mb-fluid-4xl md:grid-cols-12">
              <div className="md:col-span-6 md:col-start-7 md:row-start-1">
                <SplitTitle className="text-heading-xl">
                  {CALCULATOR.title.line}
                  <br />
                  <span className="text-gradient">{CALCULATOR.title.highlight}</span>
                </SplitTitle>
              </div>
              <div className="md:col-span-4 md:row-start-1">
                <div className="wysiwyg wysiwyg-navy mb-8 text-balance">
                  <p>{CALCULATOR.intro}</p>
                </div>
              </div>
            </div>
            <CostCalculator />
          </div>
          <div className="container">
            <hr className="border-slate-300 max-md:my-fluid-xl md:my-fluid-3xl" />
          </div>
          <div className={`container ${SECTION}`}>
            <PricingFaqs />
          </div>
        </section>
      </div>
    </div>
  )
}
