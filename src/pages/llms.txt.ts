/**
 * Method:   GET
 * Path:     /llms.txt
 * Auth:     none
 * Response: text/plain (Markdown)
 *
 * Generated from the content collections at build time so it can never drift
 * from what is actually published. Do not hand-write this file.
 */
import type { APIRoute } from 'astro'
import { getCollection } from 'astro:content'
import { publicEnv } from '@/config/env'
import { SITE } from '@/config/site'
import { INSIGHT_CATEGORY_LABELS, STACK_CATEGORY_LABELS } from '@/content.config'

export const prerender = true

export const GET: APIRoute = async () => {
  const siteUrl = publicEnv.PUBLIC_SITE_URL.replace(/\/$/, '')

  const [services, work, stack, insights, industries] = await Promise.all([
    getCollection('services', ({ data }) => !data.draft),
    getCollection('work', ({ data }) => !data.draft),
    getCollection('stack', ({ data }) => !data.draft),
    getCollection('insights', ({ data }) => !data.draft),
    getCollection('industries', ({ data }) => !data.draft),
  ])

  const line = (title: string, path: string, description: string) =>
    `- [${title}](${siteUrl}${path}): ${description}`

  const sections: string[] = [
    `# ${SITE.name}`,
    '',
    `> ${SITE.description}`,
    '',
    '## Key pages',
    '',
    line(
      'Services',
      '/services',
      'What we do, organised into four pillars: audit, design, migrate, run.'
    ),
    line('Work', '/work', 'Selected case studies, filterable by service, technology and industry.'),
    line(
      'Stack',
      '/stack',
      'The platforms we build on, each with a note on when to look elsewhere.'
    ),
    line(
      'Insights',
      '/insights',
      'Writing on migrations, platform decisions and running a website.'
    ),
    line('About', '/about', 'Who we are and how we work.'),
    line(
      'Enterprise',
      '/enterprise',
      'How we work with procurement, security review and governance.'
    ),
    line('Careers', '/careers', 'Open roles. Remote-only and async-first.'),
    line('Freelance Hub', '/freelance-hub', 'How to freelance with us, and the application form.'),
    line('Get in touch', '/get-in-touch', 'Contact form and direct email addresses.'),
    '',
    '## Services',
    '',
    ...services
      .sort((a, b) => a.data.order - b.data.order)
      .map((entry) => line(entry.data.title, `/services/${entry.id}`, entry.data.summary)),
    '',
    '## Case studies',
    '',
    ...work
      .sort((a, b) => a.data.order - b.data.order)
      .map((entry) => line(entry.data.client, `/work/${entry.id}`, entry.data.summary)),
    '',
    '## Industries',
    '',
    ...industries
      .sort((a, b) => a.data.order - b.data.order)
      .map((entry) => line(entry.data.title, `/industries/${entry.id}`, entry.data.summary)),
    '',
    '## Stack',
    '',
    ...stack
      .sort((a, b) => a.data.category.localeCompare(b.data.category) || a.data.order - b.data.order)
      .map((entry) =>
        line(
          `${entry.data.name} (${STACK_CATEGORY_LABELS[entry.data.category]})`,
          `/stack/${entry.data.category}/${entry.id.split('/').pop()}`,
          entry.data.positioning
        )
      ),
    '',
    '## Insights',
    '',
    ...insights
      .sort((a, b) => b.data.publishDate.getTime() - a.data.publishDate.getTime())
      .map((entry) =>
        line(
          `${entry.data.title} (${INSIGHT_CATEGORY_LABELS[entry.data.category]})`,
          `/insights/${entry.data.category}/${entry.id.split('/').pop()}`,
          entry.data.description
        )
      ),
    '',
    '## Tools',
    '',
    line(
      'llms.txt Generator',
      '/tools/llms-txt-generator',
      'Generate an llms.txt index for any public website from its sitemap. Nothing is stored.'
    ),
    '',
    '## Notes',
    '',
    '- All case studies, client names and figures currently on this site are fictional placeholders.',
    '',
  ]

  return new Response(sections.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
