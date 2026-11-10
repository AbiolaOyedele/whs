import { SplitTitle } from '@v2/components/ui/SplitTitle'
import { FaqList } from '@v2/components/features/faq/FaqList'
import { FeatureCards } from '@v2/components/features/feature-cards/FeatureCards'
import type { UseCaseContent } from '@v2/content/use-cases'
import { evenCards } from '@v2/lib/even-cards'
import { FeatureVisual } from './FeatureVisual'
import { HeroUseCase } from './HeroUseCase'
import { StartHereRow } from './StartHereRow'
import { StoryCard } from './StoryCard'
import { TitleText } from './TitleText'

interface UseCaseTemplateProps {
  content: UseCaseContent
}

/**
 * One page per service: the dark hero with its own animation, a white
 * panel with the sticky feature list and animated cards, then a slate panel
 * with ways to start, a row of case studies and common questions.
 */
export function UseCaseTemplate({ content }: UseCaseTemplateProps) {
  const { examples, stories } = content

  return (
    <div className="c-use-case">
      <HeroUseCase title={content.title} intro={content.intro} visual={content.hero} />

      <div className="z-above relative -mt-7.5 rounded-4xl bg-white md:-mt-15">
        <div className="wrapper bg-white">
          <div className="section-spacing container">
            <div className="mb-fluid-3xl gap-gutter grid max-md:hidden md:grid-cols-2">
              <div className="max-w-120 text-balance">
                <p className="text-heading-xs">{content.lede}</p>
              </div>
              <div>
                <SplitTitle as="p" className="text-heading-xl md:-mt-[0.1em]">
                  <TitleText parts={content.why} />
                </SplitTitle>
              </div>
            </div>
            <FeatureCards
              className="mb-fluid-2xl"
              label={content.featuresLabel}
              mobileHeading={
                <SplitTitle as="p" className="text-heading-xl">
                  <TitleText parts={content.why} />
                </SplitTitle>
              }
              items={content.features.map((feature) => ({
                id: feature.id,
                navTitle: feature.navTitle,
                title: feature.title,
                body: <p>{feature.body}</p>,
                visual: <FeatureVisual visual={feature.visual} />,
              }))}
            />
          </div>
        </div>

        <div className="slate wrapper z-above relative -mt-7.5 bg-white md:-mt-15">
          <div className="container">
            <StartHereRow title={examples.title} items={evenCards(examples.items)} />
          </div>
          <div className="section-spacing mt-fluid-xl! container">
            <SplitTitle as="h2" className="text-heading-xl mb-fluid-lg max-w-[13ch]">
              {stories.title}
            </SplitTitle>
            <div className="gap-gutter grid md:grid-cols-2">
              {evenCards(stories.items).map((shop) => (
                <StoryCard key={shop.href} shop={shop} action={stories.action} />
              ))}
            </div>
          </div>
          <div className="section-spacing mt-fluid-xl! container">
            <FaqList title="Common questions" faqs={content.faqs} />
          </div>
        </div>
      </div>
    </div>
  )
}
