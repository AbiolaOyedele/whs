import { Label } from '@v2/components/ui/Label'
import { SplitTitle } from '@v2/components/ui/SplitTitle'
import { DESIGN_TILES, DESIGNS_SECTION } from '@v2/content/home-lower'
import { DesignCarousel } from './DesignCarousel'

/** Two-line title, then the carousel of shop designs with their demo shops. */
export function DesignsSection() {
  const { title } = DESIGNS_SECTION
  return (
    <>
      <div className="c-home-lower-spacing container">
        <div className="flex flex-col gap-12.5">
          <Label className="sr-only">{DESIGNS_SECTION.label}</Label>
          <SplitTitle as="p" className="text-heading-xl">
            {title.before} <span className="text-gradient">{title.highlight}</span>
            <br />
            {title.after}
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
