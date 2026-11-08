/**
 * Method:   GET
 * Path:     /llms.txt
 * Auth:     none
 * Response: text/plain (Markdown)
 *
 * Generated at build time from the same content the site renders (src/v2/content
 * and the location list), so it can never drift from what is actually published.
 * Do not hand-write this file.
 */
import type { APIRoute } from 'astro'
import { publicEnv } from '@/config/env'
import { SITE } from '@/config/site'
import { SERVICE_LOCATIONS } from '@/config/service-locations'
import { BLOG_POSTS } from '@v2/content/blog'
import { CAPABILITIES } from '@v2/content/capabilities'
import { HELP_GUIDES } from '@v2/content/resources'
import { USE_CASES_CONTENT, USE_CASE_SLUGS } from '@v2/content/use-cases'

export const prerender = true

export const GET: APIRoute = () => {
  const siteUrl = publicEnv.PUBLIC_SITE_URL.replace(/\/$/, '')

  const line = (title: string, path: string, description: string) =>
    `- [${title}](${siteUrl}${path}): ${description}`

  const services = USE_CASE_SLUGS.map((slug) => USE_CASES_CONTENT[slug])
  const places = SERVICE_LOCATIONS.map((location) => location.longLabel).join('; ')

  const sections: string[] = [
    `# ${SITE.name}`,
    '',
    `> ${SITE.description}`,
    '',
    '## Key pages',
    '',
    line('Pricing', '/pricing', 'The 72-hour website: Starter and Standard, one-off, with half paid to start.'),
    line('Work', '/resources', 'Case studies of the apps, websites and tools we designed and built.'),
    line('Insights', '/blog', 'Answers to the questions businesses in Nigeria ask about websites, apps and tools.'),
    line('About', '/about', 'Who we are and how we work.'),
    line('Request a quote', '/request-a-quote', 'Send a brief and get a scoped quote within a working day.'),
    line('Careers', '/careers', 'Open roles at the studio.'),
    line('Freelance Hub', '/freelance-hub', 'How to freelance with us, and the application form.'),
    line('Get in touch', '/contact', 'Contact form, email and WhatsApp.'),
    '',
    '## Services',
    '',
    ...services.map((service) => line(service.label, `/use-cases/${service.slug}`, service.meta.description)),
    '',
    `Each service also has a page for every place we serve, at /use-cases/<service>/<place>: ${places}.`,
    '',
    '## What we build',
    '',
    ...CAPABILITIES.map((capability) =>
      line(capability.label, `/what-we-build/${capability.slug}`, capability.meta.description)
    ),
    '',
    '## Case studies',
    '',
    ...HELP_GUIDES.map((guide) => line(guide.title, `/resources/${guide.slug}`, guide.lede)),
    '',
    '## Insights',
    '',
    ...[...BLOG_POSTS]
      .sort((a, b) => b.date.localeCompare(a.date))
      .map((post) => line(post.title, `/blog/${post.slug}`, post.excerpt)),
    '',
  ]

  return new Response(sections.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
