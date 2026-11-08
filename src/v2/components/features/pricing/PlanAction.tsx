import { Button } from '@v2/components/ui/Button'
import { site } from '@v2/config/site'
import { TRIAL_PLAN, type PricingPlan } from '@v2/content/pricing'

interface PlanActionProps {
  plan: PricingPlan
  /** Use the short label, for narrow columns. */
  compact: boolean
}

/** The sign-up button for a plan: pink for the trial plan, navy for the rest. */
export function PlanAction({ plan, compact }: PlanActionProps) {
  const label = compact ? plan.compareCta : plan.cta
  return plan.id === TRIAL_PLAN ? (
    <Button label={label} href={site.signUpUrl} variant="pink" className="w-full" />
  ) : (
    <Button label={label} variant="navy" href={site.signUpUrl} className="w-full" />
  )
}
