export type Tone = 'light' | 'dark'

/** Perceived brightness (0 to 255) above which a background counts as light. */
const LIGHT_ABOVE = 140

const cache = new Map<string, Tone | null>()
let context: CanvasRenderingContext2D | null | undefined

/**
 * The tone of a CSS colour, or null when it is too transparent to count.
 * Painted on a 1px canvas so every colour syntax the browser reports
 * (rgb, oklch, color()) is read the same way.
 */
function toneOf(color: string): Tone | null {
  const known = cache.get(color)
  if (known !== undefined) return known

  if (context === undefined) {
    const canvas = document.createElement('canvas')
    canvas.width = 1
    canvas.height = 1
    context = canvas.getContext('2d', { willReadFrequently: true })
  }

  let tone: Tone | null = null
  if (context) {
    context.clearRect(0, 0, 1, 1)
    // An unparseable colour leaves fillStyle untouched, so start from clear.
    context.fillStyle = 'rgba(0, 0, 0, 0)'
    context.fillStyle = color
    context.fillRect(0, 0, 1, 1)
    const pixel = context.getImageData(0, 0, 1, 1).data
    const red = pixel[0] ?? 0
    const green = pixel[1] ?? 0
    const blue = pixel[2] ?? 0
    const alpha = pixel[3] ?? 0
    if (alpha >= 128) {
      tone = 0.2126 * red + 0.7152 * green + 0.0722 * blue > LIGHT_ABOVE ? 'light' : 'dark'
    }
  }

  cache.set(color, tone)
  return tone
}

export interface Backdrop {
  tone: Tone
  /** The CSS colour found, or null when nothing opaque is painted there. */
  color: string | null
}

/**
 * What is painted behind a point in the viewport, ignoring `skip` and
 * everything inside it. Falls back to dark, the colour of the page behind
 * every section.
 */
export function backdropAt(x: number, y: number, skip: Element): Backdrop {
  for (const element of document.elementsFromPoint(x, y)) {
    if (skip.contains(element)) continue
    const color = getComputedStyle(element).backgroundColor
    const tone = toneOf(color)
    if (tone) return { tone, color }
  }
  return { tone: 'dark', color: null }
}
