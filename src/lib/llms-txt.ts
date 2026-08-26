/**
 * llms.txt generator. Crawls a public site's robots.txt and sitemap(s), picks
 * the shallowest high-value URLs, reads their titles and descriptions, and
 * renders a Markdown llms.txt index.
 *
 * Nothing is persisted — this is a stateless request/response.
 *
 * SECURITY: this endpoint fetches a URL supplied by an anonymous caller, so it
 * is an SSRF vector by construction. Every outbound request goes through
 * `safeFetch`, which enforces the scheme, blocks private and loopback address
 * space, caps the response size, and refuses to follow redirects to a blocked
 * host. Do not add a fetch to this module that bypasses it.
 */
import { gunzipSync } from 'node:zlib'
import { lookup } from 'node:dns/promises'
import { AppError } from './errors'

const MAX_URLS = 30
const MAX_BYTES = 5_000_000
const MAX_PAGE_FETCHES = 30
const FETCH_TIMEOUT_MS = 8_000
const USER_AGENT = 'WildHandsStudios-llms-txt-generator/1.0 (+https://wildhands.example.com)'

/**
 * Blocks loopback, link-local, and RFC1918 space so this cannot reach internal hosts.
 * Exported for direct unit testing — not part of the module's intended public surface.
 */
export function isBlockedAddress(address: string, family: number): boolean {
  if (family === 6) {
    const v6 = address.toLowerCase()
    if (v6 === '::1' || v6 === '::') return true
    // Unique-local (fc00::/7) and link-local (fe80::/10).
    if (v6.startsWith('fc') || v6.startsWith('fd') || v6.startsWith('fe8')) return true
    // IPv4-mapped, e.g. ::ffff:127.0.0.1
    const mapped = v6.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/)
    if (mapped?.[1]) return isBlockedAddress(mapped[1], 4)
    return false
  }

  const parts = address.split('.').map(Number)
  if (parts.length !== 4 || parts.some((n) => Number.isNaN(n))) return true
  const [a = 0, b = 0] = parts

  if (a === 0 || a === 10 || a === 127) return true
  if (a === 169 && b === 254) return true // link-local + cloud metadata (169.254.169.254)
  if (a === 172 && b >= 16 && b <= 31) return true
  if (a === 192 && b === 168) return true
  if (a === 100 && b >= 64 && b <= 127) return true // carrier-grade NAT
  if (a >= 224) return true // multicast + reserved
  return false
}

/** Validates a URL's scheme and resolves its host, rejecting internal targets. */
async function assertPublicUrl(raw: string): Promise<URL> {
  let url: URL
  try {
    url = new URL(raw)
  } catch {
    throw new AppError(422, 'That does not look like a valid URL.', 'TOOL_LLMS_URL_INVALID')
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new AppError(
      422,
      'Only http and https addresses can be checked.',
      'TOOL_LLMS_URL_SCHEME_UNSUPPORTED'
    )
  }

  let resolved: Array<{ address: string; family: number }>
  try {
    resolved = await lookup(url.hostname, { all: true })
  } catch {
    throw new AppError(
      422,
      'We could not find that domain. Please check the address.',
      'TOOL_LLMS_URL_UNRESOLVABLE'
    )
  }

  if (resolved.length === 0 || resolved.some((r) => isBlockedAddress(r.address, r.family))) {
    throw new AppError(422, 'That address cannot be checked.', 'TOOL_LLMS_URL_BLOCKED')
  }

  return url
}

interface SafeResponse {
  body: Buffer
  contentType: string
  finalUrl: string
}

/** Size-capped, timeout-bound fetch that re-validates the host on every hop. */
async function safeFetch(target: string, redirectsLeft = 3): Promise<SafeResponse | null> {
  const url = await assertPublicUrl(target)
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

  try {
    const response = await fetch(url, {
      redirect: 'manual',
      signal: controller.signal,
      headers: { 'User-Agent': USER_AGENT, Accept: '*/*' },
    })

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location')
      if (!location || redirectsLeft <= 0) return null
      return await safeFetch(new URL(location, url).href, redirectsLeft - 1)
    }

    if (!response.ok || !response.body) return null

    const declared = Number(response.headers.get('content-length') ?? '0')
    if (declared > MAX_BYTES) return null

    const chunks: Uint8Array[] = []
    let total = 0
    for await (const chunk of response.body as unknown as AsyncIterable<Uint8Array>) {
      total += chunk.byteLength
      if (total > MAX_BYTES) return null
      chunks.push(chunk)
    }

    return {
      body: Buffer.concat(chunks),
      contentType: response.headers.get('content-type') ?? '',
      finalUrl: url.href,
    }
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}

/** Decompresses gzipped sitemaps, otherwise returns the body as UTF-8 text. */
function decode(response: SafeResponse): string {
  const isGzip =
    response.finalUrl.endsWith('.gz') ||
    response.contentType.includes('gzip') ||
    (response.body[0] === 0x1f && response.body[1] === 0x8b)

  if (isGzip) {
    try {
      return gunzipSync(response.body).toString('utf8')
    } catch {
      return ''
    }
  }
  return response.body.toString('utf8')
}

/** Pulls `Sitemap:` declarations out of a robots.txt body. */
function sitemapsFromRobots(body: string): string[] {
  return body
    .split(/\r?\n/)
    .map((line) => line.match(/^\s*sitemap:\s*(\S+)/i)?.[1])
    .filter((value): value is string => Boolean(value))
}

function matchAll(xml: string, tag: string): string[] {
  const pattern = new RegExp(`<${tag}>\\s*([\\s\\S]*?)\\s*</${tag}>`, 'gi')
  return [...xml.matchAll(pattern)].map((m) => (m[1] ?? '').trim())
}

/** Strips CDATA wrappers and decodes the five XML entities. */
function unescapeXml(value: string): string {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .trim()
}

/** Recursively walks sitemap indexes, collecting page URLs. */
async function collectUrls(sitemapUrl: string, seen: Set<string>, depth = 0): Promise<string[]> {
  if (depth > 2 || seen.has(sitemapUrl)) return []
  seen.add(sitemapUrl)

  const response = await safeFetch(sitemapUrl)
  if (!response) return []
  const xml = decode(response)
  if (!xml.includes('<urlset') && !xml.includes('<sitemapindex')) return []

  if (xml.includes('<sitemapindex')) {
    const children = matchAll(xml, 'sitemap')
      .map((block) => unescapeXml(matchAll(block, 'loc')[0] ?? ''))
      .filter(Boolean)
      .slice(0, 5)

    const nested = await Promise.all(children.map((child) => collectUrls(child, seen, depth + 1)))
    return nested.flat()
  }

  return matchAll(xml, 'url')
    .map((block) => unescapeXml(matchAll(block, 'loc')[0] ?? ''))
    .filter(Boolean)
}

/** Depth of a URL's path, used to prefer shallow (higher-value) pages. */
function pathDepth(url: string): number {
  try {
    return new URL(url).pathname
      .replace(/^\/|\/$/g, '')
      .split('/')
      .filter(Boolean).length
  } catch {
    return 99
  }
}

function extractTitle(html: string): string | null {
  const raw = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]
  return raw ? unescapeXml(raw).replace(/\s+/g, ' ').slice(0, 120) : null
}

function extractDescription(html: string): string | null {
  const patterns = [
    /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i,
    /<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["']/i,
    /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']*)["']/i,
  ]
  for (const pattern of patterns) {
    const value = html.match(pattern)?.[1]
    if (value) return unescapeXml(value).replace(/\s+/g, ' ').slice(0, 180)
  }
  return null
}

export interface GeneratedLlmsTxt {
  markdown: string
  /** How many sitemap URLs were discovered before the top-30 cut. */
  discovered: number
  /** How many made it into the output. */
  included: number
}

/**
 * Generates an llms.txt index for a public website.
 * @param input A site origin, a page URL, or a direct sitemap URL.
 */
export async function generateLlmsTxt(input: string): Promise<GeneratedLlmsTxt> {
  const url = await assertPublicUrl(input)
  const origin = url.origin

  // Find → a direct sitemap, else robots.txt declarations, else the conventional paths.
  let candidates: string[] = []
  if (/sitemap.*\.xml(\.gz)?$/i.test(url.pathname)) {
    candidates = [url.href]
  } else {
    const robots = await safeFetch(`${origin}/robots.txt`)
    if (robots) candidates = sitemapsFromRobots(decode(robots))
    if (candidates.length === 0) {
      candidates = [`${origin}/sitemap-index.xml`, `${origin}/sitemap.xml`]
    }
  }

  const seen = new Set<string>()
  const collected: string[] = []
  for (const candidate of candidates.slice(0, 5)) {
    collected.push(...(await collectUrls(candidate, seen)))
    if (collected.length > 500) break
  }

  const unique = [...new Set(collected)].filter((href) => {
    try {
      return new URL(href).origin === origin
    } catch {
      return false
    }
  })

  if (unique.length === 0) {
    throw new AppError(
      404,
      'We could not find a sitemap for that site. Check the address, or paste the sitemap URL directly.',
      'TOOL_LLMS_SITEMAP_NOT_FOUND'
    )
  }

  // Choose → shallowest paths first, alphabetical within a depth for stability.
  const chosen = unique
    .sort((a, b) => pathDepth(a) - pathDepth(b) || a.localeCompare(b))
    .slice(0, MAX_URLS)

  const entries = await Promise.all(
    chosen.slice(0, MAX_PAGE_FETCHES).map(async (href) => {
      const page = await safeFetch(href)
      const html = page ? decode(page) : ''
      const path = new URL(href).pathname
      return {
        href,
        title: (html ? extractTitle(html) : null) ?? path,
        description: html ? extractDescription(html) : null,
      }
    })
  )

  const siteTitle = entries[0]?.title ?? url.hostname
  const lines = [
    `# ${siteTitle}`,
    '',
    `> Index of key pages on ${url.hostname}, generated for AI answer engines.`,
    '',
    '## Pages',
    '',
    ...entries.map((entry) =>
      entry.description
        ? `- [${entry.title}](${entry.href}): ${entry.description}`
        : `- [${entry.title}](${entry.href})`
    ),
    '',
  ]

  return {
    markdown: lines.join('\n'),
    discovered: unique.length,
    included: entries.length,
  }
}
