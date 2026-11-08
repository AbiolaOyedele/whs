import { SegmentedControls } from '@v2/components/ui/SegmentedControls'
import { SHOWCASE_TABS, SHOWCASE_TITLE } from '@v2/content/home-lower'
import { ShowcaseCard } from './ShowcaseCard'

/**
 * Centred title over the sphere, then tabs for the three services.
 * Each tab shows four cards: case studies to read and the service itself.
 */
export function BuiltWithSection() {
  return (
    <div className="c-home-lower-spacing container-sm">
      <div className="@container flex flex-col items-center">
        <h2 className="text-heading-md mb-10 text-center dark:text-white">{SHOWCASE_TITLE}</h2>
        <SegmentedControls
          className="w-full gap-y-fluid-2xl"
          panelsClassName="overflow-hidden"
          tabs={SHOWCASE_TABS.map((tab) => tab.label)}
          panels={SHOWCASE_TABS.map((tab) => (
            <div key={tab.label} className="grid gap-gutter @2xl:grid-cols-2">
              {tab.cards.map((card) => (
                <ShowcaseCard key={card.title} card={card} />
              ))}
            </div>
          ))}
        />
      </div>
    </div>
  )
}
