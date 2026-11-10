import { Accordion } from '@v2/components/ui/Accordion'
import { Button } from '@v2/components/ui/Button'
import { FREELANCE_PAGE } from '@v2/content/freelance'
import { ContentPage, PageSection } from '@v2/components/features/content-page/ContentPage'
import { NumberedGrid } from '@v2/components/features/content-page/NumberedGrid'
import { FreelanceApplicationForm } from '@v2/components/features/forms/FreelanceApplicationForm'
import { NewsletterForm } from '@v2/components/features/forms/NewsletterForm'

/**
 * /freelance-hub: why freelancers stay, how it runs, the application form,
 * common questions, and a way to hear about briefs without applying yet.
 */
export function FreelanceHub() {
  const page = FREELANCE_PAGE
  return (
    <ContentPage
      title={page.title}
      intro={page.intro}
      heroExtra={<Button label={page.applyCta.label} href={page.applyCta.href} />}
    >
      <PageSection title={page.benefitsTitle}>
        <NumberedGrid items={page.benefits} columns={3} />
      </PageSection>

      <PageSection title={page.processTitle}>
        <NumberedGrid items={page.process} columns={4} />
      </PageSection>

      <section id="apply" aria-labelledby="apply-title" className="scroll-mt-safe-header">
        <div className="grid gap-x-gutter gap-y-fluid-lg md:grid-cols-12">
          <div className="min-w-0 md:col-span-4 lg:col-span-3">
            <h2 id="apply-title" className="text-heading-sm">
              {page.applyTitle}
            </h2>
            <p className="text-body-md mt-3 text-navy-900">{page.applyLead}</p>
          </div>
          <div className="min-w-0 md:col-span-8 lg:col-span-7 lg:col-start-5">
            <FreelanceApplicationForm />
          </div>
        </div>
      </section>

      <section aria-labelledby="freelance-faq-title">
        <div className="grid gap-gutter md:grid-cols-2">
          <div>
            <h2 id="freelance-faq-title" className="text-heading-xl max-w-[9ch] md:sticky md:top-32">
              {page.faqTitle}
            </h2>
          </div>
          <div>
            {page.faqs.map((faq) => (
              <div key={faq.question} className="anim-scale" data-scroll="">
                <Accordion title={faq.question}>
                  <p>{faq.answer}</p>
                </Accordion>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="grid gap-gutter rounded-lg bg-white p-fluid-md md:grid-cols-2 md:p-fluid-lg">
        <section aria-labelledby="freelance-email-title">
          <h2 id="freelance-email-title" className="text-heading-xs">
            {page.email.title}
          </h2>
          <p className="text-body-md mt-3 text-navy-900">{page.email.body}</p>
          <a
            href={`mailto:${page.email.address}`}
            className="text-body-md mt-2 inline-flex min-h-11 items-center underline underline-offset-4"
          >
            {page.email.address}
          </a>
        </section>
        <section aria-labelledby="freelance-newsletter-title" className="max-md:border-t max-md:border-charcoal max-md:pt-fluid-md">
          <h2 id="freelance-newsletter-title" className="text-heading-xs">
            {page.newsletter.title}
          </h2>
          <p className="text-body-md mt-3 mb-5 text-navy-900">{page.newsletter.body}</p>
          <NewsletterForm idPrefix="freelance-news" />
        </section>
      </div>
    </ContentPage>
  )
}
