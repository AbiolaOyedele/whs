import { HELP_CTA } from '@v2/content/resources'
import { Button } from '@v2/components/ui/Button'

/** The panel at the foot of every case study that points to the contact page. */
export function GuideCallToAction() {
  return (
    <section
      className="rounded-lg bg-white p-fluid-md not-first:mt-fluid-xl md:p-fluid-lg"
      aria-labelledby="guide-cta"
    >
      <h2 className="text-heading-xs text-balance" id="guide-cta">
        {HELP_CTA.title}
      </h2>
      <p className="text-body-md mt-3 max-w-160 text-navy-900">{HELP_CTA.body}</p>
      <Button label={HELP_CTA.label} href={HELP_CTA.href} className="mt-8" />
    </section>
  )
}
