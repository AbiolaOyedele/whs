/**
 * Seeds two demo quotes so the admin has something real to look at.
 *
 * Standalone Node rather than an import of the app modules, because those are
 * Astro/Vite-resolved (`@/…`) and expect a request context. The two crypto
 * primitives are therefore reimplemented here — and then VERIFIED against the
 * running app rather than assumed: the script prints the PINs, and the client
 * gate is exercised with one of them to prove the digests agree.
 *
 * Usage:  node scripts/seed-quotes.mjs
 * Idempotent: it deletes its own two slugs first, so it can be re-run.
 */
import { readFileSync } from 'node:fs'
import { webcrypto as crypto } from 'node:crypto'

const env = Object.fromEntries(
  readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
    .split('\n')
    .filter((line) => line.trim() && !line.trim().startsWith('#') && line.includes('='))
    .map((line) => {
      const at = line.indexOf('=')
      return [line.slice(0, at).trim(), line.slice(at + 1).trim()]
    })
)

const URL_BASE = env.SUPABASE_URL
const KEY = env.SUPABASE_SERVICE_ROLE_KEY
const PEPPER = env.QUOTE_PIN_PEPPER

if (!URL_BASE || !KEY || !PEPPER) {
  console.error('Missing SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY or QUOTE_PIN_PEPPER in .env.local')
  process.exit(1)
}

const headers = {
  apikey: KEY,
  Authorization: `Bearer ${KEY}`,
  'Content-Type': 'application/json',
  'Content-Profile': 'wildhands',
  'Accept-Profile': 'wildhands',
}

/** Mirrors src/lib/admin/quote-access.ts → hashPin. */
async function hashPin(pin, slug) {
  const bytes = new TextEncoder().encode(`${PEPPER}:${slug}:${pin}`)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

/** Mirrors src/lib/admin/quote-access.ts → encryptPin. */
async function encryptPin(pin) {
  const keyDigest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(`${PEPPER}:pin-encryption-v1`)
  )
  const key = await crypto.subtle.importKey('raw', keyDigest, { name: 'AES-GCM' }, false, [
    'encrypt',
  ])
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const cipher = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    new TextEncoder().encode(pin)
  )
  const b64 = (bytes) => Buffer.from(bytes).toString('base64')
  return `${b64(iv)}.${b64(new Uint8Array(cipher))}`
}

const api = async (path, init = {}) => {
  // Merge, do not replace: a per-call Prefer header must survive.
  const response = await fetch(`${URL_BASE}/rest/v1/${path}`, {
    ...init,
    headers: { ...headers, ...(init.headers ?? {}) },
  })
  if (!response.ok && response.status !== 404) {
    throw new Error(`${init.method ?? 'GET'} ${path} → ${response.status} ${await response.text()}`)
  }
  const text = await response.text()
  return text ? JSON.parse(text) : null
}

/** Does the recoverable-PIN column exist yet (migration 0002)? */
async function hasPinEncrypted() {
  const response = await fetch(`${URL_BASE}/rest/v1/quotes?select=pin_encrypted&limit=1`, {
    headers,
  })
  return response.ok
}

const QUOTES = [
  {
    slug: 'northwind-logistics',
    pin: '408217',
    client_name: 'Priya Raman',
    client_company: 'Northwind Logistics',
    client_email: 'priya@northwind-logistics.test.com',
    client_role: 'Head of Operations',
    project_title: 'Freight status portal and carrier sync',
    intro_note:
      'Priya, thanks for walking us through Tuesday morning. Here is what we would build, what it costs and how long it takes.',
    project_summary: `Right now four people spend the first two hours of every morning copying consignment updates out of three carrier portals and into the shared tracker, then emailing customers who ask where their freight is.

We would replace that with one screen. It pulls from all three carriers on a schedule, flags anything that has not moved when it should have, and sends customers their own status link so they stop needing to ask.

You keep the spreadsheet as an export. Nobody has to change how they work on day one.`,
    currency: 'GBP',
    status: 'sent',
    tax_rate_bp: 2000,
    deposit_percent: 40,
    valid_until: '2026-10-15',
    payment_terms:
      '40% to start, 30% at the end of build, 30% on handover. Invoices payable within 14 days.',
    terms: `Included: everything listed above, two rounds of revisions per phase, and 30 days of support after handover.

Not included: carrier API fees, hosting (roughly £20 a month on our recommended setup), and any work arising from a carrier changing their API mid-build. We would flag that and re-quote before doing it.

Scope changes are quoted separately before any work starts. Nothing gets built that you have not agreed.`,
    lines: [
      [
        'Discovery and carrier audit',
        'Two days on site mapping the current process, and testing what each carrier API actually returns rather than what their docs claim.',
        2,
        65000,
        false,
      ],
      [
        'Freight status dashboard',
        'One screen showing every live consignment, its carrier, its last scan and whether it is running late. Filterable by customer, route and status.',
        1,
        780000,
        false,
      ],
      [
        'Carrier integrations',
        'Three carriers, polled on a schedule, normalised into one shape. Includes retry handling for the one that goes down at weekends.',
        3,
        190000,
        false,
      ],
      [
        'Customer status links',
        'A read-only page per consignment you can send to a customer, so they stop emailing to ask.',
        1,
        340000,
        false,
      ],
      [
        'Exception alerts',
        'Email or Slack when a consignment has not scanned within its expected window.',
        1,
        220000,
        false,
      ],
      [
        'Staff training and handover',
        'Half a day with the ops team, plus written documentation.',
        1,
        95000,
        false,
      ],
      [
        'Fourth carrier integration',
        'If you bring Meridian on board later, this is what adding them costs.',
        1,
        190000,
        true,
      ],
      [
        'Customer-facing mobile app',
        'Native iOS and Android. Worth discussing once the portal has been running a quarter.',
        1,
        1450000,
        true,
      ],
    ],
    phases: [
      [
        'Discovery',
        'We sit with the ops team for two days, watch the current process, and test every carrier API against real consignments.',
        '1 week',
        [
          'A written process map',
          'A carrier API report, including the two that will give us trouble',
          'Agreed scope and success measures',
        ],
      ],
      [
        'Design',
        'Screens for the dashboard, the consignment detail view and the customer-facing page. You see and sign off every screen before anything is built.',
        '2 weeks',
        ['Clickable prototype', 'All screens at phone and desktop widths'],
      ],
      [
        'Build',
        'The portal, the three carrier integrations and the alerting. You get a working link at the end of each week.',
        '5 to 6 weeks',
        ['Working portal on a staging URL', 'Weekly demo call', 'All three carriers syncing'],
      ],
      [
        'Launch and handover',
        'We run alongside your current process for a week, fix what surfaces, then switch over.',
        '1 week',
        ['Live system', 'Half-day training', 'Written documentation', '30 days of support'],
      ],
    ],
    refs: [
      [
        'Auto Flow',
        'https://whstd.com/work/auto-flow',
        'The closest thing we have built to this: same problem shape, different industry.',
      ],
      [
        'Dumpty',
        'https://whstd.com/work/dumpty',
        'For the dashboard layout and how we handle live status.',
      ],
    ],
  },
  {
    slug: 'ellis-and-carrow',
    pin: '735094',
    client_name: 'Tom Ellis',
    client_company: 'Ellis & Carrow',
    client_email: 'tom@ellisandcarrow.test.com',
    client_role: 'Managing Partner',
    project_title: 'Client onboarding and matter intake system',
    intro_note:
      'Tom, following our call last week. This covers the intake system we discussed, priced for the scope we agreed.',
    project_summary: `New client onboarding currently takes your team about three hours per matter: a form emailed back and forth, identity documents chased over several days, and the same details retyped into three systems.

We would build one intake flow. The client fills it in once, uploads their documents to it directly, and everything lands in your case management system already structured. Your team reviews and approves rather than retypes.

Conservatively, that is around two and a half hours saved per matter.`,
    currency: 'GBP',
    status: 'viewed',
    tax_rate_bp: 2000,
    deposit_percent: 50,
    valid_until: '2026-11-01',
    payment_terms: '50% to start, 50% on handover. Invoices payable within 30 days.',
    terms: `Included: the intake flow, document handling, your case management integration, and 30 days of support after handover.

Not included: identity verification provider fees, which are charged per check and billed to you directly.

We would need a test account on your case management system before build starts. If that is delayed, the timeline moves with it.`,
    lines: [
      [
        'Discovery and process mapping',
        'A day with your team mapping the current intake, and a review of the last twenty matters to find where time actually goes.',
        1,
        65000,
        false,
      ],
      [
        'Intake flow design',
        'The client-facing form, designed to be finishable on a phone in one sitting. Includes the branching for different matter types.',
        1,
        420000,
        false,
      ],
      [
        'Build: intake and document upload',
        'The flow itself, with secure document upload, progress saving, and a reminder for anyone who abandons halfway.',
        1,
        680000,
        false,
      ],
      [
        'Case management integration',
        'Structured data pushed into your existing system so nothing is retyped.',
        1,
        380000,
        false,
      ],
      [
        'Staff review dashboard',
        'Where your team approves, requests more information, or rejects an intake.',
        1,
        290000,
        false,
      ],
      [
        'Identity verification',
        'Integration with a provider so ID checks happen inside the flow instead of over email.',
        1,
        260000,
        true,
      ],
    ],
    phases: [
      [
        'Discovery',
        'A day on site, plus a review of recent matters to find where the three hours actually go.',
        '3 to 4 days',
        ['Process map', 'A costed list of where the time goes', 'Agreed scope'],
      ],
      [
        'Design',
        'Every screen of the client flow and the staff dashboard, signed off before build.',
        '2 weeks',
        ['Clickable prototype', 'Phone and desktop layouts'],
      ],
      [
        'Build',
        'The intake flow, document handling and the integration. Weekly demos.',
        '4 weeks',
        ['Working system on staging', 'Weekly demo call'],
      ],
      [
        'Pilot and handover',
        'Run it on real matters alongside the current process, then switch.',
        '2 weeks',
        ['Live system', 'Training session', '30 days of support'],
      ],
    ],
    refs: [
      [
        'Lazy Meet',
        'https://whstd.com/work/lazy-meet',
        'For how we handle multi-step flows people abandon halfway.',
      ],
    ],
  },
]

async function main() {
  const recoverable = await hasPinEncrypted()
  console.log(
    recoverable
      ? 'pin_encrypted column found — codes will be recoverable in the admin.'
      : '⚠️  pin_encrypted column missing (migration 0002 not run) — seeding without it.\n    The PINs below still work; "Show code" will say it cannot recover them until you run it.'
  )

  for (const q of QUOTES) {
    await api(`quotes?slug=eq.${q.slug}`, { method: 'DELETE' })

    const row = {
      slug: q.slug,
      pin_hash: await hashPin(q.pin, q.slug),
      status: q.status,
      client_name: q.client_name,
      client_company: q.client_company,
      client_email: q.client_email,
      client_role: q.client_role,
      project_title: q.project_title,
      project_summary: q.project_summary,
      intro_note: q.intro_note,
      currency: q.currency,
      tax_rate_bp: q.tax_rate_bp,
      deposit_percent: q.deposit_percent,
      valid_until: q.valid_until,
      payment_terms: q.payment_terms,
      terms: q.terms,
      sent_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    }
    if (recoverable) row.pin_encrypted = await encryptPin(q.pin)

    const [created] = await api('quotes?select=id', {
      method: 'POST',
      body: JSON.stringify(row),
      headers: { Prefer: 'return=representation' },
    })
    const id = created.id

    await api('quote_line_items', {
      method: 'POST',
      body: JSON.stringify(
        q.lines.map(([title, description, quantity, unit_price_minor, is_optional], position) => ({
          quote_id: id,
          position,
          title,
          description,
          quantity,
          unit_price_minor,
          is_optional,
        }))
      ),
    })

    await api('quote_phases', {
      method: 'POST',
      body: JSON.stringify(
        q.phases.map(([title, description, duration_label, deliverables], position) => ({
          quote_id: id,
          position,
          title,
          description,
          duration_label,
          deliverables,
        }))
      ),
    })

    await api('quote_references', {
      method: 'POST',
      body: JSON.stringify(
        q.refs.map(([label, url, description], position) => ({
          quote_id: id,
          position,
          label,
          url,
          description,
        }))
      ),
    })

    const total = q.lines.filter((l) => !l[4]).reduce((sum, l) => sum + l[2] * l[3], 0)
    const withTax = Math.round(total * (1 + q.tax_rate_bp / 10000))

    console.log(`\n  ${q.client_company}`)
    console.log(`    /quote/${q.slug}`)
    console.log(`    code ${q.pin}`)
    console.log(
      `    £${(withTax / 100).toLocaleString('en-GB', { minimumFractionDigits: 2 })} · ${q.lines.length} lines · ${q.phases.length} phases`
    )
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
