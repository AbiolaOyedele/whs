/**
 * Every v2 route: its title, description and page element. Replaces the
 * per-route page.tsx files and metadata exports of the Next app, which lived
 * in website-v2/src/app. Each case below is that file's body, unchanged.
 *
 * Used twice: by the Astro pages (title, description, and which paths to
 * prerender) and by `App` (which element to render for the current path).
 */
import type { ReactElement } from 'react'
import { SITE } from '@/config/site'
import { site } from '@v2/config/site'
import { AboutOverview } from '@v2/components/features/about/AboutOverview'
import { HeroAbout } from '@v2/components/features/about/HeroAbout'
import { ArticleShell } from '@v2/components/features/blog/ArticleShell'
import { BlogIndex } from '@v2/components/features/blog/BlogIndex'
import { BlogPostCard } from '@v2/components/features/blog/BlogPostCard'
import { CaseStudyPreview } from '@v2/components/features/blog/CaseStudyPreview'
import { GuideCallToAction } from '@v2/components/features/blog/GuideCallToAction'
import { GuideQuestions } from '@v2/components/features/blog/GuideQuestions'
import { HelpIndex } from '@v2/components/features/blog/HelpIndex'
import { PostCard } from '@v2/components/features/blog/PostCard'
import { RelatedRow } from '@v2/components/features/blog/RelatedRow'
import { RichContent } from '@v2/components/features/blog/RichContent'
import { BrandHero } from '@v2/components/features/brand/BrandHero'
import { ContactForm } from '@v2/components/features/forms/ContactForm'
import { FormPage } from '@v2/components/features/forms/FormPage'
import { FreelanceHub } from '@v2/components/features/freelance/FreelanceHub'
import { JobApplicationForm } from '@v2/components/features/forms/JobApplicationForm'
import { QuoteForm } from '@v2/components/features/forms/QuoteForm'
import { CareersIndex } from '@v2/components/features/careers/CareersIndex'
import { RolePage } from '@v2/components/features/careers/RolePage'
import { QuoteAside } from '@v2/components/features/quote/QuoteAside'
import { HomeLower } from '@v2/components/features/home/HomeLower'
import { HomeUpper } from '@v2/components/features/home/HomeUpper'
import { LegalPage } from '@v2/components/features/legal/LegalPage'
import { PricingPage } from '@v2/components/features/pricing/PricingPage'
import { LlmsToolPage } from '@v2/components/features/tools/LlmsToolPage'
import { LLMS_TOOL } from '@v2/content/tools'
import { UseCaseTemplate } from '@v2/components/features/use-case/UseCaseTemplate'
import { CapabilityPage } from '@v2/components/features/capability/CapabilityPage'
import { WhatWeBuildIndex } from '@v2/components/features/capability/WhatWeBuildIndex'
import { CAPABILITY_SLUGS, capabilityBySlug } from '@v2/content/capabilities'
import { Button } from '@v2/components/ui/Button'
import {
  BLOG_CATEGORIES,
  BLOG_POSTS,
  POSTS_PER_PAGE,
  categoryByLabel,
  categoryBySlug,
  formatPostDate,
  postBySlug,
  relatedPosts,
  toBlogCard,
} from '@v2/content/blog'
import { APPLY_PAGE, CAREERS_PAGE, ROLES, applyPath, findRole, rolePath } from '@v2/content/careers'
import { CONTACT_PAGE, QUOTE_PAGE } from '@v2/content/forms'
import { FREELANCE_PAGE } from '@v2/content/freelance'
import { serviceLocationContent, serviceLocationPaths } from '@v2/content/service-locations'
import { PRIVACY_POLICY, TERMS_OF_SERVICE } from '@v2/content/legal'
import { HELP_AUTHOR, HELP_GUIDES, guideBySlug, relatedGuides } from '@v2/content/resources'
import { USE_CASE_SLUGS, getUseCase } from '@v2/content/use-cases'

export interface ResolvedRoute {
  /** Full <title>, template applied. */
  title: string
  description: string
  element: ReactElement
  notFound?: boolean
  /** Kept out of search results even after launch. */
  noindex?: boolean
}

const DEFAULT_TITLE = `${site.name} | Website & Web App Development in Lagos, Nigeria`
const DEFAULT_DESCRIPTION = SITE.description

const BLOG_PAGES = Math.max(1, Math.ceil(BLOG_POSTS.length / POSTS_PER_PAGE))
const HELP_PAGES = Math.max(1, Math.ceil(HELP_GUIDES.length / POSTS_PER_PAGE))

const titled = (title: string) => `${title} | ${site.name}`

function parsePage(value: string, total: number): number | null {
  const page = Number(value)
  return Number.isInteger(page) && page >= 2 && page <= total ? page : null
}

function NotFoundPage() {
  return (
    <div className="flex min-h-svh flex-col justify-center pt-safe-header pb-fluid-4xl text-white">
      <div className="container flex flex-col gap-8.5 pt-fluid-lg">
        <h1 className="text-heading-xl">
          Nothing here
        </h1>
        <div className="flex flex-col gap-7.5">
          <p className="text-body-md anim-transform-opacity -delay-1 max-w-84">
            There is no page at this address. The link may be old or mistyped.
          </p>
          <div className="anim-transform-opacity -delay-2">
            <Button label="Go to the home page" href="/" className="min-h-15!" />
          </div>
        </div>
      </div>
    </div>
  )
}

const NOT_FOUND: ResolvedRoute = {
  title: titled('No page here'),
  description: DEFAULT_DESCRIPTION,
  element: <NotFoundPage />,
  notFound: true,
}

/** Static routes, keyed by path. */
const STATIC_ROUTES: Record<string, () => ResolvedRoute> = {
  '/': () => ({
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    element: (
      <>
        <HomeUpper />
        <HomeLower />
      </>
    ),
  }),
  '/what-we-build': () => ({
    title: titled('What we build'),
    description: `Every website, app and tool ${site.name} builds, from a one-page site to jobs that run on their own, each with its own page.`,
    element: <WhatWeBuildIndex />,
  }),
  '/about': () => ({
    title: titled('About'),
    description: `${site.name} is a Lagos-based studio building custom websites, apps and internal tools for businesses across Nigeria and Africa.`,
    element: (
      <div className="c-about">
        <HeroAbout />
        <AboutOverview />
      </div>
    ),
  }),
  '/contact': () => ({
    title: titled('Get in touch'),
    description: 'Tell WildHands about your project. We reply to every enquiry, usually within one working day.',
    element: (
      <FormPage title={CONTACT_PAGE.title} lead={CONTACT_PAGE.lead}>
        <ContactForm />
      </FormPage>
    ),
  }),
  '/request-a-quote': () => ({
    title: titled(QUOTE_PAGE.title),
    description: "Tell us what you're building and we come back with a scoped quote within a working day. Nothing here is binding.",
    element: (
      <FormPage title={QUOTE_PAGE.title} lead={QUOTE_PAGE.lead} aside={<QuoteAside />}>
        <QuoteForm />
      </FormPage>
    ),
  }),
  '/careers': () => ({
    title: titled(CAREERS_PAGE.meta.title),
    description: CAREERS_PAGE.meta.description,
    element: <CareersIndex />,
  }),
  '/freelance-hub': () => ({
    title: titled(FREELANCE_PAGE.meta.title),
    description: FREELANCE_PAGE.meta.description,
    element: <FreelanceHub />,
  }),
  '/brand-assets': () => ({
    title: titled('Brand assets'),
    description: `How to use the ${site.name} logo in articles, videos and marketing, and how to ask us for the files.`,
    element: (
      <div className="c-brand-assets slate rounded-b-4xl bg-white pt-safe-header pb-fluid-3xl">
        <div className="container pt-fluid-lg">
          <BrandHero />
        </div>
      </div>
    ),
  }),
  '/pricing': () => ({
    title: titled('Pricing'),
    description:
      'A website live in 72 hours: Starter ₦150,000 or Standard ₦250,000, one-off, with half paid to start. Apps and internal tools are quoted after a discovery call.',
    element: <PricingPage />,
  }),
  '/privacy': () => ({
    title: titled(PRIVACY_POLICY.title),
    description: PRIVACY_POLICY.description,
    element: <LegalPage document={PRIVACY_POLICY} />,
  }),
  '/terms-of-service': () => ({
    title: titled(TERMS_OF_SERVICE.title),
    description: TERMS_OF_SERVICE.description,
    element: <LegalPage document={TERMS_OF_SERVICE} />,
  }),
  '/resources': () => ({
    title: titled('Work'),
    description: `Case studies from ${site.name}: the apps, websites, tools and internal systems we designed and built end to end.`,
    element: <HelpIndex />,
  }),
  '/tools/llms-txt-generator': () => ({
    title: titled(LLMS_TOOL.meta.title),
    description: LLMS_TOOL.meta.description,
    element: <LlmsToolPage />,
    // Works, but is not part of the offer right now (see the sitemap filter).
    noindex: true,
  }),
  '/blog': () => ({
    title: titled('Insights'),
    description: `${site.name} Insights: what a website costs in Nigeria, how to choose an agency, and what a business website needs.`,
    element: <BlogIndex />,
  }),
}

function blogPost(slug: string): ResolvedRoute | null {
  const post = postBySlug(slug)
  if (!post) return null
  const labels = post.categories.flatMap((label) => {
    const category = categoryByLabel(label)
    return category ? [{ label: category.label, href: `/blog/category/${category.slug}` }] : []
  })
  return {
    title: titled(post.title),
    description: post.excerpt,
    element: (
      <ArticleShell
        title={post.title}
        date={post.date}
        dateLabel={formatPostDate(post.date, 'short')}
        labels={labels}
        author={post.author}
        photo={post.photo}
        back={{ label: 'See all posts', href: '/blog' }}
        after={
          <RelatedRow
            title="Related posts"
            seeAllHref="/blog"
            cards={relatedPosts(post).map((related) => ({
              key: related.slug,
              node: <BlogPostCard post={toBlogCard(related)} headingLevel="h3" />,
            }))}
          />
        }
      >
        <RichContent blocks={post.body} className="not-first:mt-fluid-xl not-last:mb-fluid-xl" />
      </ArticleShell>
    ),
  }
}

function guide(slug: string): ResolvedRoute | null {
  const entry = guideBySlug(slug)
  if (!entry) return null
  const [lead, ...more] = entry.previews
  return {
    title: titled(entry.title),
    description: entry.lede,
    element: (
      <ArticleShell
        title={entry.title}
        date={entry.date}
        dateLabel={formatPostDate(entry.date, 'short')}
        author={HELP_AUTHOR}
        logo={entry.logo}
        back={{ label: 'See all work', href: '/resources' }}
        after={
          <RelatedRow
            title="More work"
            seeAllHref="/resources"
            cards={relatedGuides(entry).map((related) => ({
              key: related.slug,
              node: (
                <PostCard
                  href={`/resources/${related.slug}`}
                  title={related.title}
                  date={related.date}
                  dateLabel={formatPostDate(related.date)}
                  labels={[]}
                  logo={related.logo}
                  headingLevel="h3"
                />
              ),
            }))}
          />
        }
      >
        <p className="text-body-lg mb-fluid-lg text-balance">{entry.lede}</p>
        {lead && <CaseStudyPreview slug={lead} />}
        <RichContent blocks={entry.body} className="not-first:mt-fluid-xl not-last:mb-fluid-xl" />
        {more.map((slug) => (
          <CaseStudyPreview key={slug} slug={slug} />
        ))}
        <GuideQuestions questions={entry.faqs} />
        <GuideCallToAction />
      </ArticleShell>
    ),
  }
}

/** Resolves a normalised pathname to its page, or the not-found page. */
export function resolveRoute(pathname: string): ResolvedRoute {
  const staticRoute = STATIC_ROUTES[pathname]
  if (staticRoute) return staticRoute()

  const [, first, second, third, fourth] = pathname.split('/')

  if (first === 'use-cases' && second && third && !fourth) {
    const content = serviceLocationContent(second, third)
    if (content) {
      return {
        title: titled(content.meta.title),
        description: content.meta.description,
        element: <UseCaseTemplate content={content} />,
      }
    }
  }

  if (first === 'careers' && second && !fourth) {
    const role = findRole(second)
    if (role && !third) {
      return { title: titled(role.title), description: role.summary, element: <RolePage role={role} /> }
    }
    if (role && third === 'apply') {
      return {
        title: titled(`Apply for ${role.title}`),
        description: `Apply for the ${role.title} role at ${site.name}.`,
        element: (
          <FormPage title={`Apply for ${role.title}`} lead={APPLY_PAGE.lead}>
            <JobApplicationForm role={role.title} roleSlug={role.slug} />
          </FormPage>
        ),
      }
    }
  }

  if (first === 'use-cases' && second && !third) {
    const content = getUseCase(second)
    if (content) {
      return {
        title: titled(content.meta.title),
        description: content.meta.description,
        element: <UseCaseTemplate content={content} />,
      }
    }
  }

  if (first === 'what-we-build' && second && !third) {
    const capability = capabilityBySlug(second)
    if (capability) {
      return {
        title: titled(capability.meta.title),
        description: capability.meta.description,
        element: <CapabilityPage capability={capability} />,
      }
    }
  }

  if (first === 'blog' && second === 'page' && third) {
    const page = parsePage(third, BLOG_PAGES)
    if (page) return { title: titled(`Insights, page ${page}`), description: DEFAULT_DESCRIPTION, element: <BlogIndex /> }
  }

  if (first === 'blog' && second === 'category' && third) {
    const category = categoryBySlug(third)
    if (category) {
      return {
        title: titled(`${category.tab} | Insights`),
        description: `${category.tab} articles from ${site.name} Insights.`,
        element: <BlogIndex />,
      }
    }
  }

  if (first === 'blog' && second && !third) {
    const post = blogPost(second)
    if (post) return post
  }

  if (first === 'resources' && second === 'page' && third) {
    const page = parsePage(third, HELP_PAGES)
    if (page) {
      return {
        title: titled(`Work, page ${page}`),
        description: DEFAULT_DESCRIPTION,
        element: <HelpIndex page={page} />,
      }
    }
  }

  if (first === 'resources' && second && !third) {
    const entry = guide(second)
    if (entry) return entry
  }

  return NOT_FOUND
}

/** Every path Astro prerenders, for the catch-all page's getStaticPaths. */
export function allPaths(): string[] {
  return [
    ...Object.keys(STATIC_ROUTES),
    ...USE_CASE_SLUGS.map((slug) => `/use-cases/${slug}`),
    ...CAPABILITY_SLUGS.map((slug) => `/what-we-build/${slug}`),
    ...serviceLocationPaths(),
    ...ROLES.flatMap((role) => [rolePath(role.slug), applyPath(role.slug)]),
    ...BLOG_POSTS.map((post) => `/blog/${post.slug}`),
    ...BLOG_CATEGORIES.map((category) => `/blog/category/${category.slug}`),
    ...Array.from({ length: BLOG_PAGES - 1 }, (_, index) => `/blog/page/${index + 2}`),
    ...HELP_GUIDES.map((entry) => `/resources/${entry.slug}`),
    ...Array.from({ length: HELP_PAGES - 1 }, (_, index) => `/resources/page/${index + 2}`),
  ]
}
