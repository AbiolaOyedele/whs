import { FluidPanel } from '@v2/components/ui/FluidPanel'
import { Button } from '@v2/components/ui/Button'
import { SplitTitle } from '@v2/components/ui/SplitTitle'
import { site } from '@v2/config/site'
import { HERO } from '@v2/content/pricing'
import { HeroPriceTable } from './HeroPriceTable'

/**
 * Split hero: the pitch on a pale panel on the left, the price card over
 * artwork on the right. Stacks on narrow screens.
 */
export function PricingHero() {
  return (
    <div className="relative container flex items-stretch max-md:flex-col md:min-h-[calc(100svh+--spacing(15))]">
      <div className="relative z-above flex h-auto w-full grow flex-col justify-center gap-10 pt-safe-header max-md:pb-fluid-lg md:px-(--grid-margin) md:pb-18">
        <h1 className="text-label sr-only">Pricing</h1>
        <SplitTitle as="p" className="text-heading-xl max-md:max-w-80 max-md:pt-fluid-lg max-sm:max-w-65 md:max-w-120">
          {HERO.title.highlight} {HERO.title.rest}
        </SplitTitle>
        <div className="wysiwyg wysiwyg-navy anim-transform-opacity -delay-1 max-w-120 md:w-[calc(4/12*(100vw-2*var(--grid-margin))-8/12*var(--grid-gutter))]">
          <p>{HERO.body}</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <div className="anim-transform-opacity -delay-2">
            <Button label={HERO.primary} href={site.signUpUrl} variant="pink" />
          </div>
          <div className="anim-transform-opacity -delay-3">
            <Button label={HERO.secondary} href="/request-a-quote" variant="outline" />
          </div>
        </div>
        <div
          aria-hidden="true"
          className="absolute top-0 z-below h-full bg-white max-md:-right-(--grid-margin) max-md:-left-(--grid-margin) md:right-0 md:w-[50vw]"
        />
      </div>
      <div className="relative flex h-auto w-full grow flex-col items-center justify-center bg-charcoal pb-12.5 max-md:pt-fluid-xl md:px-(--grid-margin) md:pt-safe-header">
        <HeroPriceTable />
        <div className="absolute top-0 -right-(--grid-margin) -left-(--grid-margin) h-full overflow-hidden">
          <FluidPanel seed={4} />
        </div>
      </div>
    </div>
  )
}
