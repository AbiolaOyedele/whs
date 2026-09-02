/**
 * Chart colour, derived from the brand token rather than hard-coded.
 *
 * The accent is editable in the website editor, so a fixed green here would
 * clash the moment someone changed the brand. Mixing the accent toward the ink
 * colour keeps the brand hue and buys the contrast a thin mark needs.
 *
 * The 45% ratio is not arbitrary. The brand lime is oklch(0.92 0.19 128) —
 * beautiful, and about 1.3:1 against a white card, which is invisible as a 2px
 * line. Mixing 45% accent with 55% foreground lands on roughly
 * oklch(0.52 0.14 128) — hex #507700 — which the palette validator passes at
 * >= 3:1 against a light surface. Raising the accent share breaks that.
 *
 * The fill underneath is the unmixed accent at low alpha, where contrast does
 * not apply and the brand colour can be itself.
 */

/** Stroke and bar fill. Meets 3:1 on the light card surface. */
export const CHART_INK = 'color-mix(in oklab, var(--accent) 45%, var(--foreground))'

/** Area fill under the line. Decorative, so the raw accent is fine. */
export const CHART_WASH = 'color-mix(in oklab, var(--accent) 28%, transparent)'

/** Hairline grid, one shade off the surface. Solid, never dashed. */
export const CHART_GRID = 'var(--border)'
