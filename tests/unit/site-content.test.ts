/**
 * The content fallback chain, and the two places edited values reach output.
 *
 * The property that matters: editing content can change the site, but it can
 * never take it down. Every path below either renders an edit or renders the
 * copy committed in the repository.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'

const overrides = { content: new Map<string, unknown>(), tokens: new Map<string, string>() }

vi.mock('@/lib/admin/repositories/content', () => ({
  fetchContentOverrides: () => Promise.resolve(overrides.content),
  fetchTokenOverrides: () => Promise.resolve(overrides.tokens),
}))

const { invalidateSiteContent, list, loadSiteContent, text, token, tokenOverrideCss } =
  await import('@/lib/admin/content')

async function reload(
  content: Record<string, unknown> = {},
  tokens: Record<string, string> = {}
): Promise<void> {
  overrides.content = new Map(Object.entries(content))
  overrides.tokens = new Map(Object.entries(tokens))
  invalidateSiteContent()
  await loadSiteContent()
}

beforeEach(async () => {
  await reload()
})

describe('text', () => {
  it('renders the committed copy when nothing is overridden', () => {
    expect(text('home.hero.title')).toBe('Custom systems that give you your time back.')
  })

  it('renders the edit when there is one', async () => {
    await reload({ 'home.hero.title': 'Software that gets out of your way.' })
    expect(text('home.hero.title')).toBe('Software that gets out of your way.')
  })

  it('falls back to the committed copy for a blank override', async () => {
    // This is what makes "clear the field to restore the original" safe.
    await reload({ 'home.hero.title': '   ' })
    expect(text('home.hero.title')).toBe('Custom systems that give you your time back.')
  })

  it('returns an empty string for an unregistered key rather than throwing', () => {
    expect(text('nope.does.not.exist')).toBe('')
  })
})

describe('list', () => {
  it('renders the committed list when nothing is overridden', () => {
    expect(list('home.hero.logos')).toEqual(['Dumpty', 'Auto Flow', 'Lazy Meet', 'The Ruff Agency'])
  })

  it('accepts an array override', async () => {
    await reload({ 'home.hero.logos': ['One', 'Two'] })
    expect(list('home.hero.logos')).toEqual(['One', 'Two'])
  })

  it('accepts a newline string and trims the blanks out', async () => {
    await reload({ 'home.hero.logos': 'One\n\n  Two  \n' })
    expect(list('home.hero.logos')).toEqual(['One', 'Two'])
  })

  it('falls back rather than rendering an empty strip', async () => {
    await reload({ 'home.hero.logos': [] })
    expect(list('home.hero.logos')).toHaveLength(4)
  })
})

describe('token', () => {
  it('returns the stylesheet value when nothing is overridden', () => {
    expect(token('accent')).toBe('oklch(91.98% 0.1905 128.5)')
  })

  it('returns the edit when there is one', async () => {
    await reload({}, { accent: '#84cc16' })
    expect(token('accent')).toBe('#84cc16')
  })
})

describe('tokenOverrideCss', () => {
  it('emits nothing at all when nothing is overridden', () => {
    expect(tokenOverrideCss()).toBe('')
  })

  it('emits nothing when an override equals the default', async () => {
    await reload({}, { accent: 'oklch(91.98% 0.1905 128.5)' })
    expect(tokenOverrideCss()).toBe('')
  })

  it('emits only the tokens that actually changed', async () => {
    await reload({}, { accent: '#84cc16' })
    const css = tokenOverrideCss()
    expect(css).toBe(':root{--accent:#84cc16}')
    expect(css).not.toContain('--background')
  })

  it('drops a value that could break out of the style block, rather than mangling it', async () => {
    // The save endpoint refuses this first; this is the render-time gate.
    // Dropping falls back to the stylesheet's real colour, where stripping
    // would emit inert nonsense into every page.
    await reload({}, { accent: 'red}</style><script>alert(1)</script>{' })
    expect(tokenOverrideCss()).toBe('')
  })

  it('drops only the offending token and keeps the rest', async () => {
    await reload({}, { accent: '#84cc16', background: 'url(https://evil.test/x.png)' })
    const css = tokenOverrideCss()
    expect(css).toContain('--accent:#84cc16')
    expect(css).not.toContain('--background')
  })

  it('ignores an unknown token key entirely', async () => {
    await reload({}, { 'not-a-token': 'red' })
    expect(tokenOverrideCss()).toBe('')
  })
})
