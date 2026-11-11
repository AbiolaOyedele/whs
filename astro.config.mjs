// @ts-check
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'astro/config'
import vercel from '@astrojs/vercel'
import sitemap from '@astrojs/sitemap'
import react from '@astrojs/react'
import tailwindcss from '@tailwindcss/vite'
import { loadEnv } from 'vite'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import preloadIsland from './scripts/preload-island.mjs'

// Astro does not load .env into the config context automatically, so hydrate
// process.env here BEFORE importing the validated env module. This file is
// build tooling; every file under src/ imports from src/config/env.ts instead.
Object.assign(process.env, loadEnv(process.env.NODE_ENV ?? 'development', process.cwd(), ''))

const { publicEnv } = await import('./src/config/env.ts')

/*
 * Content still carrying `placeholder: true` is unfinished, and unfinished
 * pages have no business in a sitemap. Five insight articles shipped whose body
 * text read "Placeholder article body", indexable and listed, because noindex
 * had not been wired up and the sitemap reads the route manifest rather than
 * the content.
 *
 * Read here rather than through the content collection API, which is not
 * available in the config context. A missing directory yields an empty list, so
 * this never blocks a build.
 */
const placeholderPaths = (() => {
  const roots = [
    'src/content/insights',
    'src/content/work',
    'src/content/industries',
    'src/content/stack',
  ]
  const paths = []

  for (const root of roots) {
    let files = []
    try {
      files = readdirSync(root, { recursive: true, encoding: 'utf8' })
    } catch {
      continue
    }

    for (const file of files) {
      if (!file.endsWith('.md')) continue
      const source = readFileSync(join(root, file), 'utf8')
      if (!/^placeholder:\s*true\s*$/m.test(source)) continue
      // "field-notes/what-a-website-actually-costs.md" -> the URL tail.
      paths.push('/' + file.replace(/\.md$/, ''))
    }
  }

  if (paths.length > 0) {
    console.warn(`[sitemap] ${paths.length} placeholder page(s) excluded and set to noindex.`)
  }
  return paths
})()

/**
 * Insight categories with nothing published in them.
 *
 * A placeholder article is no longer routed at all, which empties the category
 * index it belonged to. An empty index still builds, still resolves and would
 * still be listed: five URLs whose entire content is one line saying there is
 * nothing here. Excluded until a category has a real article.
 */
const emptyInsightCategories = (() => {
  const root = 'src/content/insights'
  const populated = new Set()
  let files = []
  try {
    files = readdirSync(root, { recursive: true, encoding: 'utf8' })
  } catch {
    return []
  }

  const categories = new Set()
  for (const file of files) {
    if (!file.endsWith('.md')) continue
    const category = file.split('/')[0]
    categories.add(category)
    const source = readFileSync(join(root, file), 'utf8')
    const unfinished =
      /^placeholder:\s*true\s*$/m.test(source) || /^draft:\s*true\s*$/m.test(source)
    if (!unfinished) populated.add(category)
  }

  const empty = [...categories].filter((category) => !populated.has(category))
  if (empty.length > 0) {
    console.warn(`[sitemap] ${empty.length} empty insight category page(s) excluded.`)
  }
  return empty.map((category) => `/insights/${category}`)
})()

/**
 * Permanent redirects from the original site's URLs to the v2 pages that
 * replaced them, so old links, bookmarks and search results keep working.
 * The original .astro pages were removed (they remain in git history); a
 * redirect and a page on the same path would conflict.
 *
 * Listed out rather than written as [slug] patterns: the old URL set is fixed,
 * a few old pages have no direct counterpart (the Beam case study, the
 * placeholder insight categories), and a static build needs every source path
 * spelled out anyway.
 */
const { SERVICE_LOCATIONS, RETIRED_LOCATIONS } = await import('./src/config/service-locations.ts')

const permanentRedirects = (() => {
  /** @type {Record<string, { status: 301, destination: string }>} */
  const map = {}
  const add = (/** @type {string} */ from, /** @type {string} */ to) => {
    map[from] = { status: 301, destination: to }
  }

  // Pages moved to a new address.
  add('/get-in-touch', '/contact')
  add('/book-demo', '/request-a-quote')
  add('/legal/privacy-policy', '/privacy')
  add('/services', '/')
  add('/work', '/resources')
  add('/insights', '/blog')

  // Services and the service-by-location pages. Retired places go to Lagos or
  // to the page for clients outside Nigeria, from both their original and v2 address.
  for (const service of ['websites', 'apps', 'tools-and-systems']) {
    add(`/services/${service}`, `/use-cases/${service}`)
    for (const location of SERVICE_LOCATIONS) {
      add(`/services/${service}/${location.slug}`, `/use-cases/${service}/${location.slug}`)
    }
    for (const [slug, target] of Object.entries(RETIRED_LOCATIONS)) {
      const destination = target ? `/use-cases/${service}/${target}` : '/outside-nigeria'
      add(`/services/${service}/${slug}`, destination)
      add(`/use-cases/${service}/${slug}`, destination)
    }
  }

  // Case studies. Beam has no v2 case study yet, so it goes to the list.
  for (const slug of [
    'auto-flow',
    'dory',
    'dumpty',
    'lazy-meet',
    'marque',
    'marvy',
    'planes',
    'rayo',
    'the-ruff-agency',
    'tomori',
  ]) {
    add(`/work/${slug}`, `/resources/${slug}`)
  }
  add('/work/beam', '/resources')

  // Insights. Only the websites category had published articles.
  for (const category of ['design-systems', 'field-notes', 'migration', 'operations', 'platform-choice']) {
    add(`/insights/${category}`, '/blog')
  }
  add('/insights/websites', '/blog/category/websites')
  for (const slug of [
    'choose-web-development-agency-lagos',
    'ecommerce-development-cost-nigeria',
    'nigerian-business-website-checklist',
    'website-cost-nigeria',
    'website-structure-nigerian-businesses',
    'website-vs-web-app',
  ]) {
    add(`/insights/websites/${slug}`, `/blog/${slug}`)
  }

  // The industry pages were unfinished placeholders, never indexed or listed.
  for (const slug of ['consumer-brands', 'financial-services', 'saas-data-platforms']) {
    add(`/industries/${slug}`, '/')
  }

  // The job application's old thank-you and video steps. The application now
  // confirms on its own page, and the video step never uploaded anything.
  add('/careers/apply/video', '/careers')
  add('/careers/apply/video/thank-you', '/careers')
  for (const role of ['senior-frontend-engineer', 'product-designer']) {
    add(`/careers/${role}/apply/thank-you`, `/careers/${role}`)
  }

  return map
})()

/**
 * Hybrid rendering: every page is prerendered to static HTML by default.
 * API routes under src/pages/api/v1/ opt into SSR with `export const prerender = false`.
 */
export default defineConfig({
  site: publicEnv.PUBLIC_SITE_URL,
  output: 'static',
  adapter: vercel(),
  redirects: permanentRedirects,
  integrations: [
    react(),
    sitemap({
      /*
       * Private routes are excluded here, not only by their noindex tag.
       *
       * @astrojs/sitemap reads the route manifest, so on-demand routes are
       * listed too unless filtered — which is how /admin/sign-in ended up
       * advertised to every crawler. noindex stops them being indexed; it does
       * not stop a sitemap naming the admin surface out loud, and a client
       * quote URL has no business in a public file at all.
       *
       * The llms.txt generator is unlisted for a different reason: the route
       * works, but it is not part of the offer right now. Delete that clause
       * to bring it back.
       */
      filter: (page) =>
        !page.includes('/admin') &&
        !page.includes('/quote/') &&
        !page.includes('/tools/llms-txt-generator') &&
        !placeholderPaths.some((path) => page.includes(path)) &&
        !emptyInsightCategories.some((path) => page.replace(/\/$/, '').endsWith(path)),
    }),
    preloadIsland(),
  ],
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      /*
       * The v2 site (src/v2) was built on Next.js. Its two Next imports are
       * pointed at small stand-ins so its components run here unchanged.
       */
      alias: {
        'next/navigation': fileURLToPath(new URL('./src/v2/shims/next-navigation.ts', import.meta.url)),
        'next/link': fileURLToPath(new URL('./src/v2/shims/next-link.tsx', import.meta.url)),
      },
    },
  },
})
