/**
 * Every database query touching a quote lives in this file.
 *
 * Services call these functions; nothing else builds a Supabase query. The rule
 * exists so that when the shape of a quote changes there is exactly one file to
 * audit, and so no route can quietly select a column it should not.
 *
 * Row types are declared locally rather than generated. The migration is the
 * source of truth; these interfaces mirror it, and `toQuote` is the single
 * boundary where a database row becomes a domain object.
 */
import { serviceClient } from '@/lib/supabase'
import { AppError } from '@/lib/errors'
import { computeTotals } from '@/lib/admin/money'
import type {
  CollapsedEvent,
  CurrencyCode,
  Quote,
  QuoteEvent,
  QuoteImage,
  QuoteLineItem,
  QuoteOption,
  QuoteOptionKind,
  QuotePhase,
  QuoteReference,
  QuoteStatus,
  QuoteSummary,
} from '@/types/quote'

/* -------------------------------------------------------------------------
 * Row shapes — mirror supabase/migrations/0001_admin_panel.sql
 * ---------------------------------------------------------------------- */

interface QuoteRow {
  id: string
  slug: string
  pin_hash: string
  status: QuoteStatus
  client_name: string
  client_company: string | null
  client_email: string | null
  client_role: string | null
  project_title: string
  project_summary: string
  intro_note: string
  currency: string
  discount_minor: number
  tax_rate_bp: number
  deposit_percent: number
  payment_terms: string
  terms: string
  valid_until: string | null
  created_at: string
  updated_at: string
  sent_at: string | null
  first_viewed_at: string | null
  last_viewed_at: string | null
  view_count: number
  decided_at: string | null
  decision_note: string | null
}

interface LineItemRow {
  id: string
  position: number
  title: string
  description: string
  quantity: number | string
  unit_price_minor: number
  is_optional: boolean
  option_id: string | null
}

interface OptionRow {
  id: string
  kind: QuoteOptionKind
  position: number
  title: string
  description: string
  is_selected: boolean
  is_default: boolean
}

interface PhaseRow {
  id: string
  position: number
  title: string
  description: string
  duration_label: string
  deliverables: string[] | null
}

interface ReferenceRow {
  id: string
  position: number
  label: string
  url: string
  description: string
}

interface ImageRow {
  id: string
  position: number
  url: string
  public_id: string
  caption: string
  width: number | null
  height: number | null
}

/** Children selected alongside a quote, in one round trip. */
const CHILDREN_SELECT = `
  *,
  quote_line_items ( id, position, title, description, quantity, unit_price_minor, is_optional, option_id ),
  quote_options ( id, kind, position, title, description, is_selected, is_default ),
  quote_phases ( id, position, title, description, duration_label, deliverables ),
  quote_references ( id, position, label, url, description ),
  quote_images ( id, position, url, public_id, caption, width, height )
`

type QuoteWithChildren = QuoteRow & {
  quote_line_items: LineItemRow[] | null
  quote_options: OptionRow[] | null
  quote_phases: PhaseRow[] | null
  quote_references: ReferenceRow[] | null
  quote_images: ImageRow[] | null
}

/* -------------------------------------------------------------------------
 * Mapping
 * ---------------------------------------------------------------------- */

const byPosition = <T extends { position: number }>(rows: T[] | null): T[] =>
  [...(rows ?? [])].sort((a, b) => a.position - b.position)

function toLineItem(row: LineItemRow): QuoteLineItem {
  return {
    id: row.id,
    position: row.position,
    title: row.title,
    description: row.description,
    // numeric(10,2) comes back as a string from PostgREST. Coercing here rather
    // than at every call site is the difference between "2.5" * 100 working and
    // silently producing a string.
    quantity: typeof row.quantity === 'string' ? Number(row.quantity) : row.quantity,
    unitPriceMinor: row.unit_price_minor,
    isOptional: row.is_optional,
    optionId: row.option_id,
  }
}

function toOption(row: OptionRow): QuoteOption {
  return {
    id: row.id,
    kind: row.kind,
    position: row.position,
    title: row.title,
    description: row.description,
    isSelected: row.is_selected,
    isDefault: row.is_default,
  }
}

function toQuote(row: QuoteWithChildren): Quote {
  const lineItems = byPosition(row.quote_line_items).map(toLineItem)
  const options = byPosition(row.quote_options).map(toOption)
  const totals = computeTotals({
    lineItems,
    options,
    discountMinor: row.discount_minor,
    taxRateBp: row.tax_rate_bp,
    depositPercent: row.deposit_percent,
  })

  return {
    id: row.id,
    slug: row.slug,
    status: row.status,
    clientName: row.client_name,
    clientCompany: row.client_company,
    clientEmail: row.client_email,
    clientRole: row.client_role,
    projectTitle: row.project_title,
    projectSummary: row.project_summary,
    introNote: row.intro_note,
    currency: row.currency as CurrencyCode,
    discountMinor: row.discount_minor,
    taxRateBp: row.tax_rate_bp,
    depositPercent: row.deposit_percent,
    paymentTerms: row.payment_terms,
    terms: row.terms,
    totalMinor: totals.totalMinor,
    validUntil: row.valid_until,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    sentAt: row.sent_at,
    firstViewedAt: row.first_viewed_at,
    lastViewedAt: row.last_viewed_at,
    viewCount: row.view_count,
    decidedAt: row.decided_at,
    decisionNote: row.decision_note,
    lineItems,
    options,
    phases: byPosition(row.quote_phases).map((phase) => ({
      id: phase.id,
      position: phase.position,
      title: phase.title,
      description: phase.description,
      durationLabel: phase.duration_label,
      deliverables: phase.deliverables ?? [],
    })),
    references: byPosition(row.quote_references).map((reference) => ({
      id: reference.id,
      position: reference.position,
      label: reference.label,
      url: reference.url,
      description: reference.description,
    })),
    images: byPosition(row.quote_images).map((image) => ({
      id: image.id,
      position: image.position,
      url: image.url,
      publicId: image.public_id,
      caption: image.caption,
      width: image.width,
      height: image.height,
    })),
  }
}

/** Projects a full quote down to what the list renders. Explicit, so adding a
 *  field to `Quote` cannot silently widen what the list ships. */
function toSummary(quote: Quote): QuoteSummary {
  return {
    id: quote.id,
    slug: quote.slug,
    status: quote.status,
    clientName: quote.clientName,
    clientCompany: quote.clientCompany,
    projectTitle: quote.projectTitle,
    currency: quote.currency,
    totalMinor: quote.totalMinor,
    validUntil: quote.validUntil,
    createdAt: quote.createdAt,
    updatedAt: quote.updatedAt,
    sentAt: quote.sentAt,
    firstViewedAt: quote.firstViewedAt,
    lastViewedAt: quote.lastViewedAt,
    viewCount: quote.viewCount,
  }
}

/** Wraps a PostgREST failure so the client never sees a driver message. */
function fail(operation: string, cause: unknown): never {
  throw new AppError(
    500,
    'We could not reach the quote store just then. Please try again.',
    `DB_QUOTE_${operation}_FAILED`,
    cause
  )
}

/* -------------------------------------------------------------------------
 * Reads
 * ---------------------------------------------------------------------- */

export interface QuoteListFilter {
  status?: QuoteStatus | undefined
  search?: string | undefined
}

/** Quotes for the admin list, newest activity first. */
export async function listQuotes(filter: QuoteListFilter = {}): Promise<QuoteSummary[]> {
  let query = serviceClient().from('quotes').select(CHILDREN_SELECT).order('updated_at', {
    ascending: false,
  })

  if (filter.status) query = query.eq('status', filter.status)

  if (filter.search) {
    // Escape PostgREST's `or` delimiters so a comma or paren in a client name
    // cannot restructure the filter expression.
    const term = filter.search.replace(/[,()*]/g, ' ').trim()
    if (term) {
      query = query.or(
        `client_name.ilike.%${term}%,client_company.ilike.%${term}%,project_title.ilike.%${term}%,slug.ilike.%${term}%`
      )
    }
  }

  const { data, error } = await query
  if (error) fail('LIST', error)

  // The list needs the total the children produce, not the children.
  return (data as QuoteWithChildren[]).map((row) => toSummary(toQuote(row)))
}

export async function getQuoteById(id: string): Promise<Quote | null> {
  const { data, error } = await serviceClient()
    .from('quotes')
    .select(CHILDREN_SELECT)
    .eq('id', id)
    .maybeSingle()

  if (error) fail('GET', error)
  return data ? toQuote(data as QuoteWithChildren) : null
}

export async function getQuoteBySlug(slug: string): Promise<Quote | null> {
  const { data, error } = await serviceClient()
    .from('quotes')
    .select(CHILDREN_SELECT)
    .eq('slug', slug)
    .maybeSingle()

  if (error) fail('GET_BY_SLUG', error)
  return data ? toQuote(data as QuoteWithChildren) : null
}

/**
 * The PIN hash for a slug, and nothing else.
 *
 * Separate from `getQuoteBySlug` on purpose: verifying a PIN must not require
 * loading the document it protects. Fetching the whole quote first and checking
 * the PIN afterwards is how pricing ends up in a response that should have been
 * a 401.
 */
export async function getQuoteAuthBySlug(
  slug: string
): Promise<{ id: string; pinHash: string; status: QuoteStatus } | null> {
  const { data, error } = await serviceClient()
    .from('quotes')
    .select('id, pin_hash, status')
    .eq('slug', slug)
    .maybeSingle()

  if (error) fail('GET_AUTH', error)
  if (!data) return null

  const row = data as Pick<QuoteRow, 'id' | 'pin_hash' | 'status'>
  return { id: row.id, pinHash: row.pin_hash, status: row.status }
}

export async function slugExists(slug: string, excludeId?: string): Promise<boolean> {
  let query = serviceClient().from('quotes').select('id').eq('slug', slug)
  if (excludeId) query = query.neq('id', excludeId)

  const { data, error } = await query.maybeSingle()
  if (error) fail('SLUG_CHECK', error)
  return data !== null
}

/**
 * Groups a run of identical consecutive events into one entry.
 *
 * A quote sent to a client's team gets opened repeatedly — twenty colleagues
 * reading it produces twenty "Opened the quote" rows, and the one line that
 * matters ("Accepted") disappears into them. Runs are collapsed with a count
 * and a time range, so the log stays readable however much it is viewed.
 *
 * Only CONSECUTIVE runs collapse: two views either side of an acceptance stay
 * two entries, because the order is the information.
 */
export function collapseEvents(events: readonly QuoteEvent[]): CollapsedEvent[] {
  const out: CollapsedEvent[] = []

  for (const event of events) {
    const last = out[out.length - 1]
    if (last && last.type === event.type) {
      last.count += 1
      // Events arrive newest-first, so the running entry's earliest moves back.
      last.firstAt = event.createdAt
      continue
    }
    out.push({
      type: event.type,
      count: 1,
      firstAt: event.createdAt,
      lastAt: event.createdAt,
    })
  }

  return out
}

export async function listQuoteEvents(quoteId: string, limit = 50): Promise<QuoteEvent[]> {
  const { data, error } = await serviceClient()
    .from('quote_events')
    .select('id, type, created_at, user_agent')
    .eq('quote_id', quoteId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) fail('EVENTS', error)

  return (
    data as Array<{
      id: string
      type: QuoteEvent['type']
      created_at: string
      user_agent: string | null
    }>
  ).map((row) => ({
    id: row.id,
    type: row.type,
    createdAt: row.created_at,
    userAgent: row.user_agent,
  }))
}

/* -------------------------------------------------------------------------
 * Writes
 * ---------------------------------------------------------------------- */

export interface CreateQuoteInput {
  slug: string
  pinHash: string
  pinEncrypted: string
  clientName: string
  projectTitle: string
  currency: string
  createdBy: string
}

export async function createQuote(input: CreateQuoteInput): Promise<string> {
  const { data, error } = await serviceClient()
    .from('quotes')
    .insert({
      slug: input.slug,
      pin_hash: input.pinHash,
      pin_encrypted: input.pinEncrypted,
      client_name: input.clientName,
      project_title: input.projectTitle,
      currency: input.currency,
      created_by: input.createdBy,
    })
    .select('id')
    .single()

  if (error) {
    // 23505 is unique_violation — almost always the slug, which is a user
    // mistake with a clear fix, not a server fault.
    if ((error as { code?: string }).code === '23505') {
      throw new AppError(
        409,
        'A quote already uses that link. Pick a different one.',
        'QUOTE_SLUG_TAKEN'
      )
    }
    fail('CREATE', error)
  }

  return (data as { id: string }).id
}

/** Fields of a quote the editor may change. */
export interface QuotePatch {
  slug?: string
  status?: QuoteStatus
  clientName?: string
  clientCompany?: string | null
  clientEmail?: string | null
  clientRole?: string | null
  projectTitle?: string
  projectSummary?: string
  introNote?: string
  currency?: string
  discountMinor?: number
  taxRateBp?: number
  depositPercent?: number
  paymentTerms?: string
  terms?: string
  validUntil?: string | null
  pinHash?: string
  pinEncrypted?: string
  sentAt?: string | null
  clientId?: string | null
}

const PATCH_COLUMNS: Record<keyof QuotePatch, string> = {
  slug: 'slug',
  status: 'status',
  clientName: 'client_name',
  clientCompany: 'client_company',
  clientEmail: 'client_email',
  clientRole: 'client_role',
  projectTitle: 'project_title',
  projectSummary: 'project_summary',
  introNote: 'intro_note',
  currency: 'currency',
  discountMinor: 'discount_minor',
  taxRateBp: 'tax_rate_bp',
  depositPercent: 'deposit_percent',
  paymentTerms: 'payment_terms',
  terms: 'terms',
  validUntil: 'valid_until',
  pinHash: 'pin_hash',
  pinEncrypted: 'pin_encrypted',
  sentAt: 'sent_at',
  clientId: 'client_id',
}

export async function updateQuote(id: string, patch: QuotePatch): Promise<void> {
  const row: Record<string, unknown> = {}
  for (const [key, column] of Object.entries(PATCH_COLUMNS)) {
    const value = patch[key as keyof QuotePatch]
    if (value !== undefined) row[column] = value
  }
  if (Object.keys(row).length === 0) return

  const { error } = await serviceClient().from('quotes').update(row).eq('id', id)
  if (error) {
    if ((error as { code?: string }).code === '23505') {
      throw new AppError(
        409,
        'A quote already uses that link. Pick a different one.',
        'QUOTE_SLUG_TAKEN'
      )
    }
    fail('UPDATE', error)
  }
}

export async function deleteQuote(id: string): Promise<void> {
  // Children go with it: every child table declares ON DELETE CASCADE.
  const { error } = await serviceClient().from('quotes').delete().eq('id', id)
  if (error) fail('DELETE', error)
}

/**
 * Replaces a quote's child rows wholesale.
 *
 * Delete-then-insert rather than a diff. The editor sends the full list every
 * save, ordering is positional, and reconciling that against existing ids would
 * add a class of bug (a stale id resurrecting a deleted row) to save one query
 * on a table with at most a few dozen rows.
 *
 * Not transactional across the four tables: PostgREST has no multi-statement
 * transaction. A failure part-way leaves children from a mix of saves, which is
 * why each collection is replaced independently and the editor reloads from the
 * server after saving rather than trusting its own state.
 */
export async function replaceQuoteChildren(
  quoteId: string,
  children: {
    lineItems: Array<Omit<QuoteLineItem, 'id'>>
    /** Carries the editor's own id so line items can point at a new option. */
    options: Array<Omit<QuoteOption, 'position'> & { id: string }>
    phases: Array<Omit<QuotePhase, 'id'>>
    references: Array<Omit<QuoteReference, 'id'>>
    images: Array<Omit<QuoteImage, 'id'>>
  }
): Promise<void> {
  /*
   * Options are written FIRST and their new ids captured.
   *
   * Every save deletes and reinserts, so an option's database id changes on
   * each write. Line items reference options by id, so writing the items
   * against the ids the editor sent would point them at rows that no longer
   * exist — Postgres would reject the insert, and if it did not, the items
   * would silently detach from their option and stop being charged.
   */
  const optionIds = await replaceQuoteOptions(quoteId, children.options)

  await replaceCollection(
    'quote_line_items',
    quoteId,
    children.lineItems
      /* An item whose option is gone is dropped, not promoted to base scope.
         Promoting it would add a charge the client never selected, which is the
         one direction this must never fail in. It also matches what the
         database does on its own: option_id cascades on delete. */
      .filter((item) => item.optionId === null || optionIds.has(item.optionId))
      .map((item, index) => ({
        quote_id: quoteId,
        position: index,
        title: item.title,
        description: item.description,
        quantity: item.quantity,
        unit_price_minor: item.unitPriceMinor,
        is_optional: item.isOptional,
        option_id: item.optionId === null ? null : (optionIds.get(item.optionId) ?? null),
      }))
  )

  await replaceCollection(
    'quote_phases',
    quoteId,
    children.phases.map((phase, index) => ({
      quote_id: quoteId,
      position: index,
      title: phase.title,
      description: phase.description,
      duration_label: phase.durationLabel,
      deliverables: phase.deliverables,
    }))
  )

  await replaceCollection(
    'quote_references',
    quoteId,
    children.references.map((reference, index) => ({
      quote_id: quoteId,
      position: index,
      label: reference.label,
      url: reference.url,
      description: reference.description,
    }))
  )

  await replaceCollection(
    'quote_images',
    quoteId,
    children.images.map((image, index) => ({
      quote_id: quoteId,
      position: index,
      url: image.url,
      public_id: image.publicId,
      caption: image.caption,
      width: image.width,
      height: image.height,
    }))
  )
}

/**
 * Rewrites a quote's options and returns editor id → database id.
 *
 * Selection state comes from the payload rather than being preserved from the
 * existing rows. That is deliberate: the editor loaded the quote, so it holds
 * the client's current choice and writes it straight back. The cost is a narrow
 * race — a client choosing a package in the seconds between the editor loading
 * and saving has their choice overwritten. Acceptable, because selection locks
 * the moment a quote is accepted or paid, which is when it starts to matter.
 */
async function replaceQuoteOptions(
  quoteId: string,
  options: Array<Omit<QuoteOption, 'position'> & { id: string }>
): Promise<Map<string, string>> {
  const db = serviceClient()

  const { error: deleteError } = await db.from('quote_options').delete().eq('quote_id', quoteId)
  if (deleteError) fail('OPTIONS_CLEAR', deleteError)

  if (options.length === 0) return new Map()

  const { data, error: insertError } = await db
    .from('quote_options')
    .insert(
      options.map((option, index) => ({
        quote_id: quoteId,
        kind: option.kind,
        position: index,
        title: option.title,
        description: option.description,
        is_selected: option.isSelected,
        is_default: option.isDefault,
      }))
    )
    .select('id')

  if (insertError) fail('OPTIONS_WRITE', insertError)

  const inserted = data as Array<{ id: string }>
  if (inserted.length !== options.length) {
    fail('OPTIONS_WRITE', new Error('inserted option count did not match the payload'))
  }

  // PostgREST returns inserted rows in the order they were sent, which is how
  // the editor's ids line up with the new database ids.
  return new Map(options.map((option, index) => [option.id, inserted[index]!.id]))
}

/**
 * Clears one child collection for a quote and writes the replacement.
 *
 * Rows are typed loosely on purpose: the four collections have four different
 * shapes, and the alternative is a generic that would have to describe every
 * column of every table to say nothing useful. The shapes are pinned by the
 * call sites above and by the migration's own constraints.
 */
async function replaceCollection(
  table: 'quote_line_items' | 'quote_phases' | 'quote_references' | 'quote_images',
  quoteId: string,
  rows: Array<Record<string, unknown>>
): Promise<void> {
  const db = serviceClient()

  const { error: deleteError } = await db.from(table).delete().eq('quote_id', quoteId)
  if (deleteError) fail('CHILDREN_CLEAR', deleteError)

  if (rows.length === 0) return

  const { error: insertError } = await db.from(table).insert(rows)
  if (insertError) fail('CHILDREN_WRITE', insertError)
}

/* -------------------------------------------------------------------------
 * Client-facing activity
 * ---------------------------------------------------------------------- */

export async function recordQuoteEvent(
  quoteId: string,
  type: QuoteEvent['type'],
  meta: { ipHash?: string | undefined; userAgent?: string | undefined } = {}
): Promise<void> {
  const { error } = await serviceClient()
    .from('quote_events')
    .insert({
      quote_id: quoteId,
      type,
      ip_hash: meta.ipHash ?? null,
      user_agent: meta.userAgent?.slice(0, 500) ?? null,
    })
  // An audit-log write must never break the page the client is trying to read.
  if (error) console.error('[quote-event]', error)
}

/**
 * Stamps a view. Moves a quote from `sent` to `viewed` the first time, and
 * never downgrades a quote the client has already decided on.
 */
export async function markQuoteViewed(quoteId: string, currentStatus: QuoteStatus): Promise<void> {
  const now = new Date().toISOString()
  const patch: Record<string, unknown> = { last_viewed_at: now }

  if (currentStatus === 'sent') patch['status'] = 'viewed'

  const db = serviceClient()
  const { data, error: readError } = await db
    .from('quotes')
    .select('first_viewed_at, view_count')
    .eq('id', quoteId)
    .maybeSingle()

  if (readError || !data) return

  const row = data as { first_viewed_at: string | null; view_count: number }
  if (!row.first_viewed_at) patch['first_viewed_at'] = now
  patch['view_count'] = row.view_count + 1

  const { error: writeError } = await db.from('quotes').update(patch).eq('id', quoteId)
  if (writeError) console.error('[quote-view]', writeError)
}

/** Records the client's decision from the quote page. */
export async function recordQuoteDecision(
  quoteId: string,
  decision: 'accepted' | 'declined',
  note: string
): Promise<void> {
  const { error } = await serviceClient()
    .from('quotes')
    .update({
      status: decision,
      decided_at: new Date().toISOString(),
      decision_note: note.slice(0, 2000),
    })
    .eq('id', quoteId)

  if (error) fail('DECISION', error)
}

/**
 * The stored ciphertext of a quote's access code.
 *
 * Deliberately its own query rather than a column on `getQuoteById`: the
 * encrypted PIN should travel only when someone has explicitly asked to see the
 * code, not on every editor load and every list render.
 */
export async function getQuotePinCipher(id: string): Promise<string | null> {
  const { data, error } = await serviceClient()
    .from('quotes')
    .select('pin_encrypted')
    .eq('id', id)
    .maybeSingle()

  if (error) fail('GET_PIN', error)
  return (data as { pin_encrypted: string | null } | null)?.pin_encrypted ?? null
}

/**
 * Applies a client's choice.
 *
 * Packages are exclusive, so choosing one clears its siblings in the same
 * write. Add-ons toggle on their own. The caller has already established that
 * the quote is unlocked; this function does not re-check, because a repository
 * that enforces business rules is a business rule nobody can find.
 */
export async function setOptionSelection(
  quoteId: string,
  optionId: string,
  selected: boolean
): Promise<void> {
  const db = serviceClient()

  const { data, error } = await db
    .from('quote_options')
    .select('id, kind')
    .eq('quote_id', quoteId)
    .eq('id', optionId)
    .maybeSingle()

  if (error) fail('OPTION_GET', error)
  if (!data) {
    throw new AppError(404, 'That option is no longer on this quote.', 'QUOTE_OPTION_NOT_FOUND')
  }

  /*
   * Siblings are cleared BEFORE the chosen one is set, never after. The
   * database holds a partial unique index allowing one selected package per
   * quote; setting first would collide with the outgoing selection and the
   * write would fail with the client's click already registered in the UI.
   */
  if ((data as { kind: QuoteOptionKind }).kind === 'package') {
    const { error: clearError } = await db
      .from('quote_options')
      .update({ is_selected: false })
      .eq('quote_id', quoteId)
      .eq('kind', 'package')
    if (clearError) fail('OPTION_CLEAR', clearError)
  }

  if (!selected && (data as { kind: QuoteOptionKind }).kind === 'package') return

  const { error: setError } = await db
    .from('quote_options')
    .update({ is_selected: selected })
    .eq('quote_id', quoteId)
    .eq('id', optionId)
  if (setError) fail('OPTION_SET', setError)
}
