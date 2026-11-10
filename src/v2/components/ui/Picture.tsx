/**
 * A photo from public/images/stock, sent at the size it is shown.
 *
 * scripts/optimize-images.mjs saves each photo as AVIF and WebP at the widths
 * below. The browser reads `sizes`, works out how wide the photo will be on
 * this screen, and downloads the smallest copy that is still sharp: a phone
 * showing a card fetches a ~15 KB file instead of the 200 KB+ original. The
 * original JPEG is the fallback for browsers with neither format.
 *
 * Photos load lazily unless `priority` is set, which is for the one photo at
 * the top of a page that is seen straight away.
 */

/** Must match WIDTHS in scripts/optimize-images.mjs. */
const PHOTO_WIDTHS = [480, 800, 1400] as const

interface PictureProps {
  src: string
  alt: string
  /** How wide the photo is shown, as an HTML `sizes` value, e.g. "(min-width: 768px) 33vw, 100vw". */
  sizes: string
  className?: string
  /** Load straight away and ahead of other images: only for a photo at the top of the page. */
  priority?: boolean
}

function srcSet(base: string, ext: 'avif' | 'webp'): string {
  return PHOTO_WIDTHS.map((width) => `${base}-${width}.${ext} ${width}w`).join(', ')
}

export function Picture({ src, alt, sizes, className = '', priority = false }: PictureProps) {
  const image = (
    <img
      src={src}
      alt={alt}
      className={className}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      fetchPriority={priority ? 'high' : 'auto'}
    />
  )

  const base = /^(\/images\/stock\/.+)\.jpe?g$/i.exec(src)?.[1]
  if (!base) return image

  return (
    // `contents` keeps the wrapper out of layout, so the image sizes and
    // positions against its container exactly as a bare <img> would.
    <picture className="contents">
      <source type="image/avif" srcSet={srcSet(base, 'avif')} sizes={sizes} />
      <source type="image/webp" srcSet={srcSet(base, 'webp')} sizes={sizes} />
      {image}
    </picture>
  )
}
