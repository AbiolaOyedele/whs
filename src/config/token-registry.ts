/**
 * Editable design tokens.
 *
 * A curated subset of `global.css`, not everything in it. The stylesheet holds
 * roughly sixty custom properties; most are structural (the radius ramp, the
 * easing curves, the breakpoint steps) and exposing them would let a wrong
 * click break the layout with no obvious way back.
 *
 * What is here is what a brand actually changes: the colours, the two
 * typefaces, and the display weight. Everything else stays in the stylesheet
 * where it belongs, under review.
 *
 * `defaultValue` must match `global.css` exactly. When one changes, change both:
 * a drifted default means the editor shows a colour the site is not using.
 */

export type TokenType = 'colour' | 'font' | 'weight'

export interface TokenEntry {
  /** CSS custom property name, without the leading dashes. */
  key: string
  group: string
  label: string
  help?: string
  type: TokenType
  defaultValue: string
}

export const TOKEN_REGISTRY: readonly TokenEntry[] = [
  {
    key: 'accent',
    group: 'Brand',
    label: 'Accent',
    help: 'The WildHands lime. Buttons, highlights, and the dot in the logo.',
    type: 'colour',
    defaultValue: 'oklch(91.98% 0.1905 128.5)',
  },
  {
    key: 'accent-foreground',
    group: 'Brand',
    label: 'Text on accent',
    help: 'Must stay readable on the accent colour. Check the contrast if you change either.',
    type: 'colour',
    defaultValue: 'oklch(18.72% 0.002 286.2)',
  },
  {
    key: 'background',
    group: 'Surfaces',
    label: 'Page background',
    type: 'colour',
    defaultValue: 'oklch(96.44% 0.0013 286.38)',
  },
  {
    key: 'foreground',
    group: 'Surfaces',
    label: 'Body text',
    type: 'colour',
    defaultValue: 'oklch(18.72% 0.002 286.2)',
  },
  {
    key: 'card',
    group: 'Surfaces',
    label: 'Card background',
    type: 'colour',
    defaultValue: 'oklch(100% 0 0)',
  },
  {
    key: 'muted',
    group: 'Surfaces',
    label: 'Muted background',
    type: 'colour',
    defaultValue: 'oklch(94.31% 0 0)',
  },
  {
    key: 'muted-foreground',
    group: 'Surfaces',
    label: 'Muted text',
    type: 'colour',
    defaultValue: 'oklch(50.81% 0.0143 296.07)',
  },
  {
    key: 'border',
    group: 'Surfaces',
    label: 'Borders',
    type: 'colour',
    defaultValue: 'oklch(91.36% 0.006 239.83)',
  },
  {
    key: 'surface-dark',
    group: 'Surfaces',
    label: 'Dark band',
    help: 'The hero, the footer, and the closing panels.',
    type: 'colour',
    defaultValue: '#131314',
  },
  {
    key: 'primary',
    group: 'Surfaces',
    label: 'Primary button',
    type: 'colour',
    defaultValue: 'oklch(18.72% 0.002 286.2)',
  },
  {
    key: 'destructive',
    group: 'Surfaces',
    label: 'Error',
    type: 'colour',
    defaultValue: '#ef4444',
  },
  {
    key: 'font-weight-display',
    group: 'Typography',
    label: 'Heading weight',
    help: '400, 500 or 600. Moves the entire display scale at once. 500 is the default: at 64px and above, 600 starts closing up Diagramm’s counters.',
    type: 'weight',
    defaultValue: '500',
  },
] as const

export const TOKEN_BY_KEY: ReadonlyMap<string, TokenEntry> = new Map(
  TOKEN_REGISTRY.map((entry) => [entry.key, entry])
)

export const TOKEN_GROUPS: readonly string[] = [
  ...new Set(TOKEN_REGISTRY.map((entry) => entry.group)),
]
