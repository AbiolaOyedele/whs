import { Button } from '@v2/components/ui/Button'
import { SplitTitle } from '@v2/components/ui/SplitTitle'
import { FaqList } from '@v2/components/features/faq/FaqList'
import { FeatureCards } from '@v2/components/features/feature-cards/FeatureCards'
import type { UseCaseContent } from '@v2/content/use-cases'
import { ExampleCard } from './ExampleCard'
import { FeatureVisual } from './FeatureVisual'
import { HeroUseCase } from './HeroUseCase'
import { StoryCarousel } from './StoryCarousel'
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
      <HeroUseCase label={content.label} title={content.title} intro={content.intro} visual={content.hero} />

      <div className="relative z-above -mt-7.5 rounded-4xl bg-white md:-mt-15">
        <div className="wrapper bg-white">
          <div className="section-spacing container">
            <div className="mb-fluid-3xl grid gap-gutter max-md:hidden md:grid-cols-2">
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

        <div className="slate wrapper relative z-above -mt-7.5 bg-slate-50 md:-mt-15">
          <div className="container mb-fluid-xl">
            <div className="flex flex-col gap-12.5">
              <SplitTitle as="h2" className="text-heading-xl">
                {examples.title}
              </SplitTitle>
            </div>
          </div>
          <div className="section-spacing mt-fluid-xl!">
            <div className="container">
              <div className="@container">
                <div className="mb-fluid-lg flex items-center justify-between">
                  <div />
                  {examples.seeAll ? (
                    <div>
                      <Button label={examples.seeAll.label} href={examples.seeAll.href} variant="light" />
                    </div>
                  ) : null}
                </div>
                <div className="grid gap-gutter @2xl:grid-cols-2">
                  {examples.items.map((item) => (
                    <ExampleCard key={item.title} item={item} />
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="section-spacing mt-fluid-xl! overflow-clip pb-4">
            <div className="container">
              <StoryCarousel title={stories.title} action={stories.action} items={stories.items} />
            </div>
          </div>
          <div className="section-spacing container mt-fluid-xl!">
            <FaqList title="Common questions" faqs={content.faqs} />
          </div>
        </div>
      </div>
    </div>
  )
}
