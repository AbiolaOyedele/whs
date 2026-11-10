/**
 * The service-by-location pages: one per service and place, such as
 * /use-cases/websites/lagos. Only places we can speak for honestly have one;
 * see src/config/service-locations.ts for the list and the retired places.
 *
 * Each page is the service's own page with the place in its title, a hero
 * line written for that place, and that place's answer to "do you build for
 * businesses here?" leading the questions. Both pieces come from elsewhere and are not
 * copied: the service from ./use-cases.ts, the places and their hand-written
 * answers from src/config/service-locations.ts. Add a place there and its
 * three pages appear here.
 */
import { SERVICE_LOCATIONS, type ServiceLocation } from '@/config/service-locations'
import { USE_CASE_SLUGS, getUseCase, type UseCaseContent } from '@v2/content/use-cases'
import { site } from '@v2/config/site'

export { SERVICE_LOCATIONS }

export function locationBySlug(slug: string): ServiceLocation | undefined {
  return SERVICE_LOCATIONS.find((location) => location.slug === slug)
}

/** Every service and place pair, as URL paths. */
export function serviceLocationPaths(): string[] {
  return USE_CASE_SLUGS.flatMap((service) => SERVICE_LOCATIONS.map((location) => `/use-cases/${service}/${location.slug}`))
}

/**
 * The service page's content, retitled for one place. The hero line is the
 * place's own answer to "do you build for businesses here?", without its
 * leading "Yes." so it reads as a statement.
 */
export function serviceLocationContent(serviceSlug: string, locationSlug: string): UseCaseContent | null {
  const service = getUseCase(serviceSlug)
  const location = locationBySlug(locationSlug)
  if (!service || !location) return null

  const noun = service.label.toLowerCase()
  const local = location.faqAnswer.replace(/^Yes\.\s*/, '')
  const localFaq = {
    question: `Do you build ${noun} for businesses in ${location.label}?`,
    answer: location.faqAnswer,
  }

  return {
    ...service,
    meta: {
      title: `Custom ${noun} in ${location.longLabel}`,
      description: `${site.name} builds custom ${noun} for businesses in ${location.longLabel}. ${service.lede}`,
    },
    label: `${service.label} in ${location.label}`,
    title: [{ text: `${service.label} in` }, { text: location.longLabel, highlight: true }],
    intro: `${local} ${service.lede}`,
    // The place's own answer leads, in place of the general "outside Lagos?" one.
    faqs: [localFaq, ...service.faqs.filter((faq) => !faq.aboutLocation)],
  }
}
