import { ArtPanel } from '@v2/components/ui/ArtPanel'
import { ParallaxMedia } from '@v2/components/ui/ParallaxMedia'
import { aboutGallery, type AboutGalleryItem } from '@v2/content/about'

const SPAN: Record<AboutGalleryItem['span'], { cell: string; frame: string }> = {
  one: { cell: 'col-span-1 md:col-span-1', frame: 'max-md:aspect-square md:aspect-(--aspect-ratio)' },
  two: { cell: 'col-span-1 md:col-span-2 md:col-start-3', frame: 'max-md:aspect-square md:aspect-(--aspect-ratio)' },
  full: { cell: 'col-span-full', frame: 'aspect-(--aspect-ratio)' },
}

/** Three stand-in images (a tall one, a wide one, a full-width one), each drifting a little on scroll. */
export function AboutGallery() {
  return (
    <div className="section-spacing container">
      <div className="grid grid-cols-2 gap-gutter md:grid-cols-4">
        {aboutGallery.map((item) => {
          const span = SPAN[item.span]
          return (
            <div key={item.seed} className={span.cell}>
              <div
                className={`relative overflow-hidden rounded-md ${span.frame}`}
                style={{ ['--aspect-ratio' as string]: String(item.ratio) }}
              >
                <ParallaxMedia speed={item.speed}>
                  <ArtPanel seed={item.seed} />
                </ParallaxMedia>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
