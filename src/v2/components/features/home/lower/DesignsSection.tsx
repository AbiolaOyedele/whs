import { Label } from '@v2/components/ui/Label'
import { SplitTitle } from '@v2/components/ui/SplitTitle'
import { DESIGN_TILES, DESIGNS_SECTION } from '@v2/content/home-lower'
import { DesignCarousel } from './DesignCarousel'

/** Three-line title, then the carousel of recent projects. */
export function DesignsSection() {
  const { title } = DESIGNS_SECTION
  return (
    <>
      <div className="c-home-lower-spacing container">
        <div className="flex flex-col gap-12.5">
          <Label className="sr-only">{DESIGNS_SECTION.label}</Label>
          <SplitTitle
            as="p"
            wrapperClassName="max-w-150"
            className="max-md:text-heading-xl md:text-heading-lg text-balance"
          >
            {title.before} {title.highlight} {title.after}
          </SplitTitle>
        </div>
      </div>
      <div className="c-home-lower-spacing overflow-hidden">
        <div className="container">
          <div className="pb-4">
            <DesignCarousel tiles={DESIGN_TILES} />
          </div>
        </div>
      </div>
    </>
  )
}
