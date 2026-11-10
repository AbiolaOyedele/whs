/**
 * Makes the light versions of every photo in public/images/stock.
 *
 * Each photo is saved at 1400px wide as a JPEG. A phone showing it in a 300px
 * card does not need that, so this writes AVIF and WebP copies at a few widths
 * beside it (name-480.avif, name-800.webp, ...). The <Picture> component in
 * src/v2/components/ui/Picture.tsx lists them, and the browser downloads only
 * the smallest one that is sharp at its size. The JPEG stays as the fallback.
 *
 *   node scripts/optimize-images.mjs          writes any copies that are missing or older than their photo
 *   node scripts/optimize-images.mjs --check  fails if any are missing (run by the build; needs no image library)
 *
 * Widths and formats must match PHOTO_WIDTHS and the sources in Picture.tsx.
 */
import { readdir, stat } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public', 'images', 'stock')
const WIDTHS = [480, 800, 1400]
const FORMATS = [
  { ext: 'avif', options: { quality: 50, effort: 6 } },
  { ext: 'webp', options: { quality: 72, effort: 6 } },
]

const check = process.argv.includes('--check')

async function modified(file) {
  try {
    return (await stat(file)).mtimeMs
  } catch {
    return null
  }
}

const photos = (await readdir(DIR)).filter((name) => /\.jpe?g$/i.test(name))
const stale = []

for (const name of photos) {
  const source = path.join(DIR, name)
  const sourceTime = await modified(source)
  const base = name.replace(/\.jpe?g$/i, '')
  for (const width of WIDTHS) {
    for (const format of FORMATS) {
      const target = path.join(DIR, `${base}-${width}.${format.ext}`)
      const targetTime = await modified(target)
      if (targetTime === null || (!check && targetTime < sourceTime)) {
        stale.push({ source, target, width, format })
      }
    }
  }
}

if (check) {
  if (stale.length > 0) {
    const missing = [...new Set(stale.map((item) => path.basename(item.source)))]
    console.error(`Light versions are missing for: ${missing.join(', ')}. Run: npm run images`)
    process.exit(1)
  }
  console.log(`All ${photos.length} photos have their light versions.`)
} else {
  // Loaded only when there is work to do, so --check runs without it.
  const { default: sharp } = await import('sharp')
  for (const { source, target, width, format } of stale) {
    await sharp(source)
      .resize({ width, withoutEnlargement: true })
      [format.ext](format.options)
      .toFile(target)
    console.log(`wrote ${path.basename(target)}`)
  }
  console.log(stale.length === 0 ? 'Nothing to do.' : `Wrote ${stale.length} files.`)
}
