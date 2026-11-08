import { FeatureCards, type FeatureCardItem } from '@v2/components/features/feature-cards/FeatureCards'
import { Button } from '@v2/components/ui/Button'
import { site } from '@v2/config/site'
import { introCopy, whyCopy, type WhyCopy } from '@v2/content/home-upper'
import type { ReactNode } from 'react'
import { HeroHome } from './upper/HeroHome'
import { HomeIntroTitle } from './upper/HomeIntroTitle'
import { WhyLaunchCard } from './upper/why/WhyLaunchCard'
import { WhyOwnCard } from './upper/why/WhyOwnCard'
import { WhyProposalCard } from './upper/why/WhyProposalCard'
import { WhyScratchCard } from './upper/why/WhyScratchCard'

/** One "Why WildHands" entry: its words, its visual and, if it has one, its button. */
function whyItem(copy: WhyCopy, visual: ReactNode): FeatureCardItem {
  return {
    id: copy.id,
    navTitle: copy.navTitle,
    title: copy.title,
    visual,
    body: <p>{copy.body}</p>,
    ...(copy.action ? { actions: <Button label={copy.action.label} href={copy.action.href} variant="navy" /> } : {}),
  }
}

const CARDS: FeatureCardItem[] = [
  whyItem(whyCopy.price, <WhyProposalCard />),
  whyItem(whyCopy.design, <WhyLaunchCard />),
  whyItem(whyCopy.scratch, <WhyScratchCard />),
  whyItem(whyCopy.own, <WhyOwnCard />),
]

/**
 * The top half of the home page: the click-and-hold hero, then the white
 * panel with the intro row and the sticky "Why WildHands" list beside its
 * four cards: priced up front, design first, built from scratch, yours to keep.
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
