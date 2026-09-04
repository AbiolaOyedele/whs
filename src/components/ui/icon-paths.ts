/**
 * The icon set. Path data only, so the Astro and React wrappers draw the same
 * shapes from one definition.
 *
 * No icon package is installed and none should be. `lucide-react` was added
 * once for a single arrow and took every form on the site down with it: Vite
 * had never pre-bundled it, the dynamic import 404'd, and the islands never
 * hydrated, which left the selects looking clickable and doing nothing.
 *
 * Text glyphs are not an alternative. `▾`, `✓` and `→` resolve through the font
 * stack, so they arrive at a different size, weight and baseline on every
 * platform and fall out of the brand faces entirely.
 *
 * House spec: 24x24 box, no fill, `currentColor` stroke at 1.8, round caps and
 * joins. The chevron keeps its own 12x8 box because it is drawn as a hairline
 * marker rather than a glyph and reads better without the surrounding padding.
 */
export interface IconSpec {
  /** `viewBox` for this icon. */
  box: string
  /** One or more `d` attributes, drawn in order. */
  paths: readonly string[]
}

export const ICONS = {
  chevronDown: { box: '0 0 12 8', paths: ['M1 1l5 5 5-5'] },
  check: { box: '0 0 24 24', paths: ['M5 13l4 4L19 7'] },
  arrowLeft: { box: '0 0 24 24', paths: ['M19 12H5', 'm12 19-7-7 7-7'] },
  arrowRight: { box: '0 0 24 24', paths: ['M5 12h14', 'm12 5 7 7-7 7'] },
} as const satisfies Record<string, IconSpec>

export type IconName = keyof typeof ICONS
