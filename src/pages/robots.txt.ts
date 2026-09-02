/**
 * Method:   GET
 * Path:     /robots.txt
 * Auth:     none
 * Response: text/plain
 *
 * Generated rather than static so the sitemap URL always matches
 * PUBLIC_SITE_URL. AI crawlers are allowed explicitly — the whole content
 * strategy depends on being readable by answer engines.
 */
import type { APIRoute } from 'astro'
import { publicEnv } from '@/config/env'

export const prerender = true

/** Crawlers granted explicit access, beyond the default wildcard rule. */
const AI_CRAWLERS = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-User',
  'Claude-SearchBot',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended',
  'CCBot',
  'Applebot-Extended',
  'meta-externalagent',
]

/** Routes that should never be indexed. */
const DISALLOWED = [
  '/api/',
  // The admin panel and client quotes. Both already send noindex; this is the
  // belt to that pair of braces. A quote URL carries commercial pricing, so it
  // should never be fetched by a crawler in the first place.
  '/admin',
  '/quote/',
  '/tools/ai-ascii-art-generator',
  '/careers/apply/',
]

export const GET: APIRoute = () => {
  const siteUrl = publicEnv.PUBLIC_SITE_URL.replace(/\/$/, '')

  const blocks = [
    ['User-agent: *', ...DISALLOWED.map((path) => `Disallow: ${path}`), 'Allow: /'].join('\n'),
    ...AI_CRAWLERS.map((agent) =>
      [`User-agent: ${agent}`, ...DISALLOWED.map((path) => `Disallow: ${path}`), 'Allow: /'].join(
        '\n'
      )
    ),
    `Sitemap: ${siteUrl}/sitemap-index.xml`,
  ]

  return new Response(`${blocks.join('\n\n')}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
