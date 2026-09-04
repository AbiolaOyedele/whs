/**
 * Turning a server validation failure into somewhere to go.
 *
 * The save endpoint returns `error.fields` as a map of Zod path → message, e.g.
 * `{ "lineItems.3.unitPriceMinor": "That price is too large." }`. A banner
 * saying "Too big: expected number to be <=10000" is useless on a form with
 * eight tabs and forty line items — the operator has to hunt.
 *
 * So a path is resolved to three things: the tab that holds it, a DOM target to
 * scroll to, and a readable name for the banner.
 */

export type QuoteTabId =
  'client' | 'cost' | 'timeline' | 'references' | 'images' | 'terms' | 'sharing' | 'ai'

/** Field-level messages, keyed by the Zod path the server sent. */
export type FieldErrors = Record<string, string>

/** Which tab owns each top-level field of the quote. */
const TAB_BY_FIELD: Record<string, QuoteTabId> = {
  clientName: 'client',
  clientCompany: 'client',
  clientEmail: 'client',
  clientRole: 'client',
  projectTitle: 'client',
  projectSummary: 'client',
  introNote: 'client',
  lineItems: 'cost',
  currency: 'cost',
  discountMinor: 'cost',
  taxRateBp: 'cost',
  depositPercent: 'cost',
  phases: 'timeline',
  references: 'references',
  images: 'images',
  validUntil: 'terms',
  paymentTerms: 'terms',
  terms: 'terms',
  slug: 'sharing',
  status: 'sharing',
}

/** Human names, so the banner reads like a sentence rather than a path. */
const LABEL_BY_FIELD: Record<string, string> = {
  clientName: 'Client name',
  clientCompany: 'Company',
  clientEmail: 'Email',
  clientRole: 'Their role',
  projectTitle: 'Project title',
  projectSummary: 'What the project is about',
  introNote: 'Opening note',
  currency: 'Currency',
  discountMinor: 'Discount',
  taxRateBp: 'Tax rate',
  depositPercent: 'Deposit',
  validUntil: 'Valid until',
  paymentTerms: 'Payment terms',
  terms: 'Terms and conditions',
  slug: 'Link ending',
  status: 'Status',
  title: 'Title',
  description: 'Description',
  quantity: 'Quantity',
  unitPriceMinor: 'Unit price',
  durationLabel: 'How long',
  deliverables: 'Deliverables',
  label: 'Label',
  url: 'URL',
  caption: 'Caption',
}

const COLLECTION_LABEL: Record<string, string> = {
  lineItems: 'Line',
  phases: 'Phase',
  references: 'Link',
  images: 'Image',
}

/** The tab a path belongs to. Falls back to Client, which is the first tab. */
export function tabForPath(path: string): QuoteTabId {
  const root = path.split('.')[0] ?? ''
  return TAB_BY_FIELD[root] ?? 'client'
}

/**
 * A readable name for a path.
 *
 * `lineItems.3.unitPriceMinor` → "Line 4 — Unit price". One-indexed, because
 * the operator is looking at a numbered list on screen, not an array.
 */
export function labelForPath(path: string): string {
  const parts = path.split('.')
  const root = parts[0] ?? ''

  if (parts.length >= 3 && COLLECTION_LABEL[root]) {
    const index = Number(parts[1])
    const leaf = parts[2] ?? ''
    const position = Number.isFinite(index) ? index + 1 : ''
    return `${COLLECTION_LABEL[root]} ${position}: ${LABEL_BY_FIELD[leaf] ?? leaf}`
  }

  return LABEL_BY_FIELD[root] ?? root
}

/**
 * Reads the `fields` map off an error response.
 *
 * Defensive because this is parsing a network payload: anything not shaped like
 * `Record<string, string>` is discarded rather than rendered.
 */
export function readFieldErrors(body: unknown): FieldErrors {
  const fields = (body as { error?: { fields?: unknown } })?.error?.fields
  if (!fields || typeof fields !== 'object' || Array.isArray(fields)) return {}

  const cleaned: FieldErrors = {}
  for (const [key, value] of Object.entries(fields as Record<string, unknown>)) {
    if (typeof value === 'string' && value.length > 0) cleaned[key] = value
  }
  return cleaned
}

/**
 * Scrolls the first errored field into view and focuses it.
 *
 * Runs after a tab switch, so it waits two frames: React has to commit the new
 * tab's content before the node exists to scroll to. `requestAnimationFrame`
 * twice is the cheap, dependency-free way to land after paint.
 */
export function revealField(path: string): void {
  const attempt = () => {
    const node = document.querySelector<HTMLElement>(`[data-field="${CSS.escape(path)}"]`)
    if (!node) return

    node.scrollIntoView({ behavior: 'smooth', block: 'center' })

    const control = node.matches('input, textarea, select')
      ? node
      : node.querySelector<HTMLElement>('input, textarea, select')

    // preventScroll: the smooth scroll above is already running, and focus()
    // would otherwise jump to it instantly and cancel it.
    control?.focus({ preventScroll: true })
  }

  requestAnimationFrame(() => requestAnimationFrame(attempt))
}
