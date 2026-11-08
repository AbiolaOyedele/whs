import { SegmentedControls } from '@v2/components/ui/SegmentedControls'
import { SHOWCASE_TABS, SHOWCASE_TITLE } from '@v2/content/home-lower'
import { ShowcaseCard } from './ShowcaseCard'

/**
 * Centred title over the sphere, then tabs for the three services. Each tab
 * lists the products built under it, each linking to its case study. Tabs
 * hold different numbers of cards; two to a row, and an odd last card sits
 * centred under the pair above it.
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
            <ul key={tab.label} className="flex flex-wrap justify-center gap-gutter">
              {tab.cards.map((card) => (
                <li key={card.href} className="w-full @2xl:w-[calc((100%-var(--spacing-gutter))/2)]">
                  <ShowcaseCard card={card} />
                </li>
              ))}
            </ul>
          ))}
        />
      </div>
    </div>
  )
}
