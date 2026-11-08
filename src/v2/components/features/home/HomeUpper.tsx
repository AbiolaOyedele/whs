import { FeatureCards, type FeatureCardItem } from '@v2/components/features/feature-cards/FeatureCards'
import { HomeFeedCard } from '@v2/components/features/feature-cards/HomeFeedCard'
import { HomeLineChartCard } from '@v2/components/features/feature-cards/HomeLineChartCard'
import { nigeriaCityPoint, type NigeriaCity } from '@v2/components/features/feature-cards/HomeMapGeometry'
import { HomePlanCostCard } from '@v2/components/features/feature-cards/HomePlanCostCard'
import { MapCard } from '@v2/components/features/feature-cards/MapCard'
import { site } from '@v2/config/site'
import { cardCopy, introCopy, mapChips } from '@v2/content/home-upper'
import { HeroHome } from './upper/HeroHome'
import { HomeIntroTitle } from './upper/HomeIntroTitle'

/** Cities the map marks, three waves of four. */
const MAP_CITIES: NigeriaCity[] = [
  'Lagos', 'Kano', 'Enugu', 'Calabar',
  'Ibadan', 'Abuja', 'Port Harcourt', 'Sokoto',
  'Benin', 'Kaduna', 'Ilorin', 'Maiduguri',
]

const CARDS: FeatureCardItem[] = [
  { ...cardCopy.plans, visual: <HomePlanCostCard />, body: <p>{cardCopy.plans.body}</p> },
  {
    ...cardCopy.map,
    visual: (
      <MapCard leftChip={mapChips.left} rightChip={mapChips.right} points={MAP_CITIES.map((city) => nigeriaCityPoint(city))} />
    ),
    body: <p>{cardCopy.map.body}</p>,
  },
  { ...cardCopy.orders, visual: <HomeFeedCard />, body: <p>{cardCopy.orders.body}</p> },
  { ...cardCopy.money, visual: <HomeLineChartCard />, body: <p>{cardCopy.money.body}</p> },
]

/**
 * The top half of the home page: the click-and-hold hero with the product rail
 * and dot grid, then the white panel with the intro row and the sticky
 * "why" list beside its four animated cards.
 */
export function HomeUpper() {
  return (
    <>
      <div data-background-canvas-inview="">
        <HeroHome />
      </div>

      <div className="wrapper relative z-above -mt-7.5 -mb-7.5 bg-white md:-mt-15 md:-mb-15">
        <div className="section-spacing container">
          <div className="mb-fluid-3xl grid gap-gutter max-md:hidden md:grid-cols-2">
            <div className="max-w-120 text-balance">
              <p className="text-heading-xs">{introCopy.lead}</p>
            </div>
            <HomeIntroTitle className="md:-mt-[0.1em]" />
          </div>
          <FeatureCards
            className="mb-fluid-2xl"
            label={`Why ${site.name}`}
            mobileHeading={<HomeIntroTitle />}
            items={CARDS}
          />
        </div>
      </div>
    </>
  )
}
