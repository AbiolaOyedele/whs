import { Button } from '@v2/components/ui/Button'
import { SmartLink } from '@v2/components/ui/SmartLink'
import { SplitTitle } from '@v2/components/ui/SplitTitle'
import { NumberedGrid } from '@v2/components/features/content-page/NumberedGrid'
import { FaqList } from '@v2/components/features/faq/FaqList'
import { PlanCard } from '@v2/components/features/pricing/PlanCard'
import { HeroUseCase } from '@v2/components/features/use-case/HeroUseCase'
import { StoryCard } from '@v2/components/features/use-case/StoryCard'
import { getUseCase } from '@v2/content/use-cases'
import { WEBSITE_OFFER, offerPlan } from '@v2/content/website-offer'
import { evenCards } from '@v2/lib/even-cards'
import { DepositButton } from './DepositButton'
import { WebsiteLeadForm } from './WebsiteLeadForm'

/**
 * /72-hour-website: one page a prospect reads top to bottom and pays from.
 * The service-page hero, the three steps and sites already built on a white
 * sheet, then the two prices with pay buttons, questions and a short form for
 * anyone still deciding.
 */
export function WebsiteOfferPage() {
  const stories = getUseCase('websites')?.stories
  const [primary, secondary] = WEBSITE_OFFER.actions

  return (
    <div className="c-use-case">
      <HeroUseCase title={WEBSITE_OFFER.title} intro={WEBSITE_OFFER.intro} visual={undefined} actions={[primary, secondary]} />

      <div className="z-above relative -mt-7.5 rounded-4xl bg-white md:-mt-15">
        <div className="wrapper bg-white">
          <div className="section-spacing container">
            <SplitTitle as="h2" className="text-heading-xl mb-fluid-lg max-w-[14ch]">
              {WEBSITE_OFFER.stepsTitle}
            </SplitTitle>
            <NumberedGrid items={WEBSITE_OFFER.steps} />
          </div>
          {stories ? (
            <div className="section-spacing container pt-0!">
              <SplitTitle as="h2" className="text-heading-xl mb-fluid-lg max-w-[13ch]">
                {stories.title}
              </SplitTitle>
              <div className="gap-gutter grid md:grid-cols-2">
                {evenCards(stories.items).map((shop) => (
                  <StoryCard key={shop.href} shop={shop} action={stories.action} />
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className="slate wrapper z-above relative -mt-7.5 bg-white md:-mt-15">
          <section id="prices" aria-label={WEBSITE_OFFER.pricesTitle} className="section-spacing container scroll-mt-safe-header">
            <SplitTitle as="h2" className="text-heading-xl mb-fluid-lg">
              {WEBSITE_OFFER.pricesTitle}
            </SplitTitle>
            <div className="gap-gutter grid grid-cols-1 sm:mt-13 md:grid-cols-2">
              {WEBSITE_OFFER.tiers.map((tier) => {
                const featured = tier === WEBSITE_OFFER.featured
                return (
                  <PlanCard
                    key={tier}
                    plan={offerPlan(tier)}
                    featured={featured}
                    action={<DepositButton tier={tier} featured={featured} />}
                  />
                )
              })}
            </div>
            <p className="text-body-md mt-8 text-navy-900">
              {WEBSITE_OFFER.usdNote}{' '}
              <SmartLink href={WEBSITE_OFFER.usdLink.href} className="underline underline-offset-4">
                {WEBSITE_OFFER.usdLink.label}
              </SmartLink>
              .
            </p>
          </section>

          <div className="section-spacing mt-fluid-xl! container">
            <FaqList title="Common questions" faqs={WEBSITE_OFFER.faqs} />
          </div>

          <section aria-labelledby="lead-title" className="section-spacing container">
            <div className="gap-gutter grid rounded-lg bg-white p-6 sm:p-10 md:grid-cols-2 lg:p-14">
              <div className="flex flex-col gap-5">
                <h2 id="lead-title" className="text-heading-md max-w-[22ch]">
                  {WEBSITE_OFFER.lead.title}
                </h2>
                <p className="text-body-md max-w-110 text-navy-900">{WEBSITE_OFFER.lead.body}</p>
                <div>
                  <Button label={WEBSITE_OFFER.lead.whatsapp.label} href={WEBSITE_OFFER.lead.whatsapp.href} variant="outline" />
                </div>
              </div>
              <WebsiteLeadForm />
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
