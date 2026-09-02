/**
 * Reading edited content at render time.
 *
 * Called from `.astro` templates. During the static build this runs once per
 * page render inside a single process, so the overrides are fetched once and
 * held for the run: fifty-six pages produce one database read, not fifty-six.
 *
 * The fallback chain is the whole design. For any key:
 *
 *   database override → registry default (the copy in the repository) → ''
 *
 * so a missing row, an unreachable database, or an admin that was never set up
 * all render the site exactly as it is committed. Editing content can change
 * the site; it can never take it down.
 */
import { CONTENT_BY_KEY } from '@/config/content-registry'
import { TOKEN_BY_KEY, TOKEN_REGISTRY } from '@/config/token-registry'
import { fetchContentOverrides, fetchTokenOverrides } from './repositories/content'

let contentCache: Map<string, unknown> | null = null
let tokenCache: Map<string, string> | null = null
let loading: Promise<void> | null = null

/**
 * Loads both override sets once per process.
 *
 * The in-flight promise is shared so that pages rendering concurrently do not
 * each start their own fetch — without it, a parallel build issues one query
 * per page in the first moments and then settles.
 */
export async function loadSiteContent(): Promise<void> {
  if (contentCache && tokenCache) return
  if (loading) return loading

  loading = (async () => {
    const [content, tokens] = await Promise.all([fetchContentOverrides(), fetchTokenOverrides()])
    contentCache = content
    tokenCache = tokens
  })()

  await loading
  loading = null
}

/** Clears the cache. Used by the admin preview, which must show edits at once. */
export function invalidateSiteContent(): void {
  contentCache = null
  tokenCache = null
}

/**
 * An edited string, or the copy committed in the repository.
 *
 * `loadSiteContent()` must have been awaited first — from the layout, so every
 * page inherits it. Calling this before the load returns the default, which is
 * a correct page rather than an empty one.
 */
export function text(key: string): string {
  const override = contentCache?.get(key)
  if (typeof override === 'string' && override.trim().length > 0) return override

  const entry = CONTENT_BY_KEY.get(key)
  if (!entry) {
    // A typo'd key would otherwise render an empty string and look like an
    // intentional blank. Loud in the build log, harmless in the page.
    console.warn(`[content] Unknown key "${key}". Add it to src/config/content-registry.ts.`)
    return ''
  }

  return Array.isArray(entry.defaultValue) ? entry.defaultValue.join('\n') : entry.defaultValue
}

/** An edited list, or the committed one. */
export function list(key: string): string[] {
  const override = contentCache?.get(key)
  if (Array.isArray(override)) {
    const cleaned = override.filter((item): item is string => typeof item === 'string')
    if (cleaned.length > 0) return cleaned
  }
  if (typeof override === 'string' && override.trim().length > 0) {
    return override
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
  }

  const entry = CONTENT_BY_KEY.get(key)
  if (!entry) return []
  return Array.isArray(entry.defaultValue)
    ? [...entry.defaultValue]
    : entry.defaultValue.split('\n').filter(Boolean)
}

/** The current value of one design token, edited or committed. */
export function token(key: string): string {
  const override = tokenCache?.get(key)
  if (override) return override
  return TOKEN_BY_KEY.get(key)?.defaultValue ?? ''
}

/**
 * What a design token value is allowed to look like.
 *
 * Mirrors the validator on the save endpoint deliberately: hex, the colour
 * functions, plain keywords and numbers cover every value the token registry
 * holds, and nothing else has a reason to appear in a stylesheet we generate.
 */
const SAFE_TOKEN_VALUE = /^[a-zA-Z0-9\s.,%#()/-]{1,120}$/

/**
 * A `:root` rule carrying only the tokens that differ from the stylesheet.
 *
 * Emitted inline in the document head so it cascades over `global.css` without
 * a second stylesheet request. Returns an empty string when nothing is
 * overridden, so an unedited site ships no extra bytes at all.
 */
export function tokenOverrideCss(): string {
  if (!tokenCache || tokenCache.size === 0) return ''

  const declarations = TOKEN_REGISTRY.flatMap((entry) => {
    const override = tokenCache?.get(entry.key)
    if (!override || override === entry.defaultValue) return []

    /*
     * Second gate. The save endpoint validates these first, and this is the
     * pass that runs at render time — anything reaching a <style> block
     * deserves two.
     *
     * A bad value is DROPPED, not stripped down to whatever characters happen
     * to survive. Stripping produced things like `--accent:red/stylescript…`:
     * inert, but meaningless CSS emitted into every page. Dropping falls back
     * to the value in the stylesheet, which is a real colour.
     */
    if (!SAFE_TOKEN_VALUE.test(override)) {
      console.warn(`[tokens] Ignoring unsafe value for "${entry.key}".`)
      return []
    }

    return [`--${entry.key}:${override}`]
  })

  return declarations.length > 0 ? `:root{${declarations.join(';')}}` : ''
}

/** All current values, for the editor to render its fields against. */
export function currentContent(): Record<string, unknown> {
  return Object.fromEntries(contentCache ?? new Map())
}

export function currentTokens(): Record<string, string> {
  return Object.fromEntries(tokenCache ?? new Map())
}
