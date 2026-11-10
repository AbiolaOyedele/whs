import { site } from '@v2/config/site'
import { Button } from '@v2/components/ui/Button'

interface CapabilityCallToActionProps {
  /** Closes the heading, e.g. "your admin panel". */
  subject: string
}

/** The ink panel near the foot of a "What we build" page: talk to us, or ask for a price. */
export function CapabilityCallToAction({ subject }: CapabilityCallToActionProps) {
  return (
    <section
      className="dark section-spacing rounded-lg bg-charcoal p-fluid-md text-white md:p-fluid-xl"
      aria-labelledby="capability-cta"
    >
      <h2 id="capability-cta" className="text-heading-md max-w-200 text-balance">
        Let’s talk about {subject}
      </h2>
      <p className="text-body-md mt-5 max-w-160 text-white">
        Tell us where it hurts. We start with a discovery call, then send a written plan and one price worked out from
        that scope. If an off-the-shelf tool already does the job, we will tell you.
      </p>
      <div className="mt-8 flex flex-wrap gap-4">
        <Button label="Get in touch" href={site.signUpUrl} />
        <Button label="Request a quote" href={site.signInUrl} variant="outline" />
      </div>
    </section>
  )
}
