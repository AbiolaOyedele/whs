import { BrandOutlineLogo } from '@v2/components/features/brand/BrandOutlineLogo'
import { DownloadButton } from '@v2/components/features/brand/DownloadButton'
import { ArtPanel } from '@v2/components/ui/ArtPanel'
import { Rail } from '@v2/components/ui/Rail'
import { SplitTitle } from '@v2/components/ui/SplitTitle'
import { brandHero } from '@v2/content/brand'

/** Dashed guide lines across the panel, at the reference's heights. */
const GUIDES = ['top-[1.5%]', 'top-[17%]', 'top-[42%]', 'top-[58%]', 'bottom-[1.5%]', 'bottom-[17%]'] as const

/** Title, intro and the download button on the left; a dark panel with a drifting outlined logo on the right. */
export function BrandHero() {
  return (
    <div className="grid gap-x-gutter gap-y-fluid-2xl max-md:grid-cols-1 md:grid-cols-2">
      <div>
        <div className="flex flex-col gap-8.5">
          <SplitTitle as="h1" className="text-heading-lg">
            {brandHero.title}
          </SplitTitle>
          <div className="wysiwyg-navy wysiwyg anim-transform-opacity max-w-150!">
            <p>{brandHero.intro}</p>
          </div>
          <div className="anim-transform-opacity -delay-1">
            <DownloadButton label={brandHero.contact.label} href={brandHero.contact.href} />
          </div>
        </div>
      </div>
      <div>
        <div className="relative flex items-center overflow-hidden rounded-md bg-charcoal max-md:aspect-square md:aspect-700/600">
          <ArtPanel seed={5} />
          <div className="relative z-2 w-full overflow-hidden" aria-hidden="true">
            {GUIDES.map((position) => (
              <div key={position} className={`absolute ${position} w-full border-t border-dashed border-white opacity-30`} />
            ))}
            <Rail itemCount={1} forceActive direction={-1} velocity={0.5}>
              <div className="px-10">
                <BrandOutlineLogo />
              </div>
            </Rail>
          </div>
        </div>
      </div>
    </div>
  )
}
