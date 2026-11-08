import type { TemplateGlyph as GlyphName } from '@v2/content/use-cases'

/** Blocks of each template's first screen, on a 40 × 40 grid. */
const LAYOUTS: Record<GlyphName, string> = {
  // Full-screen banner, then one big panel per collection.
  default: 'M4 4h32v16H4zM4 23h15v13H4zM21 23h15v13H21z',
  // Framed banner, a row of round collection tiles, a product row.
  glow: 'M6 4h28v13H6zM10 24a3 3 0 1 0 0 .1zM20 24a3 3 0 1 0 0 .1zM30 24a3 3 0 1 0 0 .1zM6 30h8v6H6zM16 30h8v6h-8zM26 30h8v6h-8z',
  // Full-width photo with collections laid over it.
  blush: 'M4 4h32v22H4zM8 18h7v5H8zM17 18h7v5h-7zM26 18h6v5h-6zM4 29h32v2H4zM4 33h20v2H4z',
  // Words beside the product, then tiles.
  haven: 'M4 6h14v2H4zM4 11h11v2H4zM4 16h8v3H4zM21 4h15v17H21zM4 25h9v11H4zM16 25h9v11h-9zM28 25h8v11h-8z',
  // Tinted band with a framed picture cut out of it, then a top three.
  oak: 'M4 4h32v18H4zM22 7h11v12H22zM4 26h10v10H4zM15 26h10v10H15zM26 26h10v10H26z',
}

interface TemplateGlyphProps {
  name: GlyphName
  className?: string
}

/** A tiny sketch of a template's layout, in place of the reference's logos. */
export function TemplateGlyph({ name, className = '' }: TemplateGlyphProps) {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true" className={className}>
      <path d={LAYOUTS[name]} className="fill-navy-900" fillRule="evenodd" />
    </svg>
  )
}
