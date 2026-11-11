export type Tone = 'light' | 'dark'

/** Perceived brightness (0 to 255) above which a background counts as light. */
const LIGHT_ABOVE = 140

interface Paint {
  /** Null when the colour is too transparent to read as a background. */
  tone: Tone | null
  /** Nothing behind it shows through. */
  opaque: boolean
}

const cache = new Map<string, Paint>()
let context: CanvasRenderingContext2D | null | undefined

/**
 * Reads a CSS colour by painting it on a 1px canvas, so every colour syntax
 * the browser reports (rgb, oklch, color()) is handled the same way.
 */
function paintOf(color: string): Paint {
  const known = cache.get(color)
  if (known) return known

  if (context === undefined) {
    const canvas = document.createElement('canvas')
    canvas.width = 1
    canvas.height = 1
    context = canvas.getContext('2d', { willReadFrequently: true })
  }

  const paint: Paint = { tone: null, opaque: false }
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
      paint.tone = 0.2126 * red + 0.7152 * green + 0.0722 * blue > LIGHT_ABOVE ? 'light' : 'dark'
    }
    paint.opaque = alpha === 255
  }

  cache.set(color, paint)
  return paint
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
    const { tone } = paintOf(color)
    if (tone) return { tone, color }
  }
  return { tone: 'dark', color: null }
}

/** Where the viewport is sampled, as fractions of its width and height. */
const SAMPLES = [0.1, 0.5, 0.9]

/**
 * Whether page content hides the fixed background everywhere it was sampled:
 * a fully opaque section sits over each point of a 3 by 3 grid. Anything
 * matching `ignore` (the floating header) does not count as content.
 */
export function viewportCovered(ignore: string): boolean {
  const page = document.documentElement
  for (const across of SAMPLES) {
    for (const down of SAMPLES) {
      let covered = false
      for (const element of document.elementsFromPoint(window.innerWidth * across, window.innerHeight * down)) {
        if (element === page || element === document.body) break
        if (element.closest(ignore)) continue
        if (paintOf(getComputedStyle(element).backgroundColor).opaque) {
          covered = true
          break
        }
      }
      if (!covered) return false
    }
  }
  return true
}
