import { site } from '@v2/config/site'

/** Logo mark bars on a 24-unit grid (x, y, width), drawn 9× so the mark is 216 units tall. */
const MARK_BARS = [
  [5, 0, 19],
  [0, 10, 13],
  [16, 10, 4],
  [5, 20, 19],
] as const
const SCALE = 9
const BAR_HEIGHT = 4
const VIEW_WIDTH = 1570
const VIEW_HEIGHT = 216
const WORD_X = 270

/**
 * The full logo (mark and name) as hairline outlines, as wide as the screen
 * (1.5× on phones). It drifts across the brand page's dark panel.
 */
export function BrandOutlineLogo() {
  return (
    <svg
      className="c-brand-outline"
      viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
      fill="none"
      stroke="currentColor"
      strokeWidth={1}
      aria-hidden="true"
      focusable="false"
    >
      {MARK_BARS.map(([x, y, width]) => (
        <rect
          key={`${x}-${y}`}
          x={x * SCALE + 0.5}
          y={y * SCALE + 0.5}
          width={width * SCALE - 1}
          height={BAR_HEIGHT * SCALE - 1}
          rx={(BAR_HEIGHT * SCALE) / 2}
          vectorEffect="non-scaling-stroke"
        />
      ))}
      <text
        x={WORD_X}
        y={VIEW_HEIGHT - 8}
        textLength={VIEW_WIDTH - WORD_X - 4}
        lengthAdjust="spacingAndGlyphs"
        className="c-brand-outline_word"
        vectorEffect="non-scaling-stroke"
      >
        {site.name}
      </text>
    </svg>
  )
}
