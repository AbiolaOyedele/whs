/**
 * Attaches placeholder images to the demo quotes.
 *
 * Uploads through the same signed Cloudinary path the app uses (image/upload,
 * random public_id) rather than pointing at an external placeholder host, so
 * this exercises the real pipeline and the URLs behave exactly as a real
 * upload's would.
 *
 * Aspect ratios are deliberately mixed — 16:10, square, tall portrait, ultra
 * wide — because a two-column image grid only tells you the truth when the
 * images disagree about shape.
 *
 * Usage:  node scripts/seed-quote-images.mjs
 * Idempotent: clears each quote's existing images first.
 */
import { readFileSync, readdirSync } from 'node:fs'
import { createHash, randomBytes } from 'node:crypto'
import { basename } from 'node:path'

const env = Object.fromEntries(
  readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
    .split('\n')
    .filter((l) => l.trim() && !l.trim().startsWith('#') && l.includes('='))
    .map((l) => {
      const i = l.indexOf('=')
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()]
    })
)

const DIR = process.argv[2]
if (!DIR) {
  console.error('Pass the directory of generated PNGs as the first argument.')
  process.exit(1)
}

const headers = {
  apikey: env.SUPABASE_SERVICE_ROLE_KEY,
  Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
  'Content-Type': 'application/json',
  'Content-Profile': 'wildhands',
  'Accept-Profile': 'wildhands',
}

const db = async (path, init = {}) => {
  const r = await fetch(`${env.SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers: { ...headers, ...(init.headers ?? {}) },
  })
  if (!r.ok) throw new Error(`${init.method ?? 'GET'} ${path} → ${r.status} ${await r.text()}`)
  const t = await r.text()
  return t ? JSON.parse(t) : null
}

/** Mirrors src/lib/cloudinary.ts → sign(). */
function sign(params, secret) {
  const toSign = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join('&')
  return createHash('sha1')
    .update(toSign + secret)
    .digest('hex')
}

/** Mirrors src/lib/cloudinary.ts → storeQuoteImage(). */
async function upload(file) {
  const timestamp = Math.floor(Date.now() / 1000)
  const publicId = `wildhands/quotes/${randomBytes(8).toString('hex')}`
  const form = new FormData()
  form.append('file', new Blob([readFileSync(file)], { type: 'image/png' }), basename(file))
  form.append('api_key', env.CLOUDINARY_API_KEY)
  form.append('public_id', publicId)
  form.append('timestamp', String(timestamp))
  form.append('signature', sign({ public_id: publicId, timestamp }, env.CLOUDINARY_API_SECRET))

  const r = await fetch(
    `https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME}/image/upload`,
    {
      method: 'POST',
      body: form,
    }
  )
  if (!r.ok) throw new Error(`Cloudinary ${r.status}: ${(await r.text()).slice(0, 200)}`)
  const j = await r.json()
  return { url: j.secure_url, publicId: j.public_id, width: j.width, height: j.height }
}

const CAPTIONS = {
  'nw-1-dashboard.png':
    'The main freight dashboard: every live consignment, its carrier and its last scan.',
  'nw-2-chart.png': 'Carrier performance over time, so you can see which one keeps slipping.',
  'nw-3-mobile.png': 'What your customer sees when you send them a status link. No login, no app.',
  'nw-4-wide.png': 'The consignment pipeline, from booked through to delivered.',
  'nw-5-table.png': 'The exception queue: anything that has not scanned when it should have.',
  'nw-6-form.png': 'Alert settings, so each person chooses what they want to hear about.',
  'ec-1-form.png': 'The intake form your client fills in once, on any device.',
  'ec-2-mobile.png': 'The same intake on a phone, which is where most clients will start it.',
  'ec-3-dashboard.png': 'Your review queue: approve, request more, or reject.',
  'ec-4-chart.png': 'Time saved per matter, measured against your current three hours.',
  'ec-5-wide.png': 'The full onboarding path, end to end.',
}

async function main() {
  const files = readdirSync(DIR)
    .filter((f) => f.endsWith('.png'))
    .sort()

  for (const [slug, prefix] of [
    ['northwind-logistics', 'nw-'],
    ['ellis-and-carrow', 'ec-'],
  ]) {
    const [quote] = await db(`quotes?slug=eq.${slug}&select=id,client_company`)
    if (!quote) {
      console.log(`  ${slug}: not found, skipping`)
      continue
    }

    await db(`quote_images?quote_id=eq.${quote.id}`, { method: 'DELETE' })

    const mine = files.filter((f) => f.startsWith(prefix))
    console.log(`\n  ${quote.client_company} — uploading ${mine.length} images`)

    const rows = []
    for (const [position, file] of mine.entries()) {
      const stored = await upload(`${DIR}/${file}`)
      rows.push({
        quote_id: quote.id,
        position,
        url: stored.url,
        public_id: stored.publicId,
        caption: CAPTIONS[file] ?? '',
        width: stored.width,
        height: stored.height,
      })
      console.log(`    ${file.padEnd(22)} ${stored.width}x${stored.height}`)
    }

    await db('quote_images', { method: 'POST', body: JSON.stringify(rows) })
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
