/**
 * JSON-LD structured data builders.
 *
 * Every builder returns a plain object that the layout serialises into a
 * <script type="application/ld+json">. Values come from validated frontmatter
 * or site config, never from user input, so no sanitisation gap exists here.
 */
import { SITE } from '@/config/site'

/** Loosely-typed JSON-LD node. Schema.org shapes are too varied to model fully. */
export type JsonLd = Record<string, unknown>

/** Site-wide Organization node. Emitted once, on every page. */
export function organizationSchema(siteUrl: string): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${siteUrl}/#organization`,
    name: SITE.legalName,
    url: siteUrl,
    description: SITE.description,
    email: SITE.email,
  }
}

/** WebSite node, so search engines can resolve the canonical site name. */
export function webSiteSchema(siteUrl: string): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${siteUrl}/#website`,
    name: SITE.name,
    url: siteUrl,
    publisher: { '@id': `${siteUrl}/#organization` },
  }
}

export interface BreadcrumbItem {
  name: string
  url: string
}

/** BreadcrumbList for any nested page. Skip on top-level routes. */
export function breadcrumbSchema(items: readonly BreadcrumbItem[]): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

/** Service node for a service detail page. */
export function serviceSchema(input: {
  name: string
  description: string
  url: string
  siteUrl: string
}): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: input.name,
    description: input.description,
    url: input.url,
    provider: { '@id': `${input.siteUrl}/#organization` },
    areaServed: 'Worldwide',
  }
}

/** Article node for an insights post. */
export function articleSchema(input: {
  headline: string
  description: string
  url: string
  siteUrl: string
  datePublished: Date
  dateModified?: Date | undefined
  authorName: string
}): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: input.headline,
    description: input.description,
    url: input.url,
    datePublished: input.datePublished.toISOString(),
    dateModified: (input.dateModified ?? input.datePublished).toISOString(),
    author: { '@type': 'Person', name: input.authorName },
    publisher: { '@id': `${input.siteUrl}/#organization` },
    mainEntityOfPage: { '@type': 'WebPage', '@id': input.url },
  }
}

/** CaseStudy pages use CreativeWork — there is no dedicated schema.org type. */
export function caseStudySchema(input: {
  name: string
  description: string
  url: string
  siteUrl: string
}): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: input.name,
    description: input.description,
    url: input.url,
    creator: { '@id': `${input.siteUrl}/#organization` },
  }
}

/** FAQPage node. Emit on any page rendering a FAQ accordion. */
export function faqPageSchema(faqs: ReadonlyArray<{ question: string; answer: string }>): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  }
}
