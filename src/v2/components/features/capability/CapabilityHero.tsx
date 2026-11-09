import { site } from '@v2/config/site'
import { Button } from '@v2/components/ui/Button'
import { LivePreview } from '@v2/components/ui/LivePreview'
import { SplitTitle } from '@v2/components/ui/SplitTitle'
import { TitleText } from '@v2/components/features/use-case/TitleText'
import type { Capability } from '@v2/content/capabilities'

interface CapabilityHeroProps {
  capability: Capability
}

/**
 * The dark first screen of a "What we build" page: the list's label over a
 * line that draws in, the title and the pitch with two buttons, then the live
 * preview, full width, with a note on whose it is.
 */
export function CapabilityHero({ capability }: CapabilityHeroProps) {
  return (
    <section className="dark relative pt-safe-header pb-fluid-3xl text-white">
      <div className="container relative z-above pt-fluid-xl">
        <div className="my-5">
          <div className="animated-line" />
        </div>
        <div className="grid gap-x-gutter gap-y-fluid-md pb-fluid-xl md:grid-cols-12">
          <div className="md:col-span-7">
            <SplitTitle as="h1" className="text-heading-xl text-balance">
              <TitleText parts={capability.title} />
            </SplitTitle>
          </div>
          <div className="md:col-start-9 md:col-end-13">
            <div className="flex max-w-120 flex-col gap-7.5">
              <p className="text-body-md anim-transform-opacity text-balance">{capability.intro}</p>
              <div className="flex flex-wrap gap-4">
                <div className="anim-transform-opacity -delay-2">
                  <Button label="Get in touch" href={site.signUpUrl} />
                </div>
                <div className="anim-transform-opacity -delay-3">
                  <Button label="Request a quote" href={site.signInUrl} variant="glass" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <figure className="anim-transform-opacity -delay-3">
          <LivePreview
            slug={capability.preview}
            className="c-capability-preview relative aspect-4/5 w-full rounded-md sm:aspect-8/5"
          />
          <figcaption className="text-body-sm mt-4 max-w-160 text-white/65">{capability.previewNote}</figcaption>
        </figure>
      </div>
    </section>
  )
}
