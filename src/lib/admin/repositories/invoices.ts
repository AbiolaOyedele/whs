/**
 * Invoice records.
 *
 * An invoice number must be stable: the same client downloading the same
 * invoice twice must get the same number, and two clients downloading at the
 * same instant must not get the same one. Both fall out of a Postgres sequence
 * plus a unique constraint, rather than counting existing rows.
 */
import { serviceClient } from '@/lib/supabase'
import { AppError } from '@/lib/errors'

export interface InvoiceRecord {
  id: string
  quoteId: string
  number: string
  amountMinor: number
  currency: string
  kind: 'deposit' | 'balance' | 'full'
  issuedAt: string
  dueAt: string | null
  snapshot: Record<string, unknown>
}

interface Row {
  id: string
  quote_id: string
  number: string
  amount_minor: number
  currency: string
  kind: InvoiceRecord['kind']
  issued_at: string
  due_at: string | null
  snapshot: Record<string, unknown>
}

const SELECT = 'id, quote_id, number, amount_minor, currency, kind, issued_at, due_at, snapshot'

const toInvoice = (row: Row): InvoiceRecord => ({
  id: row.id,
  quoteId: row.quote_id,
  number: row.number,
  amountMinor: row.amount_minor,
  currency: row.currency,
  kind: row.kind,
  issuedAt: row.issued_at,
  dueAt: row.due_at,
  snapshot: row.snapshot ?? {},
})

function fail(op: string, cause: unknown): never {
  throw new AppError(
    500,
    'We could not reach the invoice record.',
    `DB_INVOICE_${op}_FAILED`,
    cause
  )
}

/** The most recent invoice of this kind for a quote, if there is one. */
export async function findInvoice(
  quoteId: string,
  kind: InvoiceRecord['kind']
): Promise<InvoiceRecord | null> {
  const { data, error } = await serviceClient()
    .from('invoices')
    .select(SELECT)
    .eq('quote_id', quoteId)
    .eq('kind', kind)
    .order('issued_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) fail('FIND', error)
  return data ? toInvoice(data as Row) : null
}

/**
 * Issues a new invoice.
 *
 * The number comes from the sequence via an RPC, so concurrent callers cannot
 * collide. `WHS-<year>-<0000>` — the year is for humans reading a filing
 * cabinet; uniqueness comes entirely from the sequence.
 */
export async function createInvoice(input: {
  quoteId: string
  amountMinor: number
  currency: string
  kind: InvoiceRecord['kind']
  dueAt: string | null
  snapshot: Record<string, unknown>
}): Promise<InvoiceRecord> {
  const db = serviceClient()

  const { data: nextValue, error: seqError } = await db.rpc('next_invoice_number')
  if (seqError) fail('SEQUENCE', seqError)

  const number = `WHS-${new Date().getUTCFullYear()}-${String(nextValue).padStart(4, '0')}`

  const { data, error } = await db
    .from('invoices')
    .insert({
      quote_id: input.quoteId,
      number,
      amount_minor: input.amountMinor,
      currency: input.currency,
      kind: input.kind,
      due_at: input.dueAt,
      snapshot: input.snapshot,
    })
    .select(SELECT)
    .single()

  if (error) fail('CREATE', error)
  return toInvoice(data as Row)
}

export interface InvoiceListRow extends InvoiceRecord {
  quoteSlug: string
  clientName: string
  clientCompany: string | null
  projectTitle: string
  /** Settled, whether by card or marked off by hand. */
  paid: boolean
  paidAt: string | null
  paidVia: string | null
}

/**
 * Every invoice, with whether it has actually been paid.
 *
 * Paid state comes from `quote_payments`, not from a column on the invoice: a
 * payment is the event, and duplicating its outcome onto the invoice would give
 * two places to disagree about whether money arrived.
 */
export async function listInvoices(): Promise<InvoiceListRow[]> {
  const { data, error } = await serviceClient()
    .from('invoices')
    .select(
      `${SELECT}, quotes ( slug, client_name, client_company, project_title, quote_payments ( status, paid_at, channel, kind ) )`
    )
    .order('issued_at', { ascending: false })

  if (error) fail('LIST', error)

  /* PostgREST types an embedded relation as an array even when the foreign key
     makes it at most one row, so it is read as an array and the first element
     taken. */
  interface JoinedQuote {
    slug: string
    client_name: string
    client_company: string | null
    project_title: string
    quote_payments: Array<{
      status: string
      paid_at: string | null
      channel: string | null
      kind: string
    }> | null
  }

  type Joined = Row & { quotes: JoinedQuote[] | JoinedQuote | null }

  return (data as unknown as Joined[]).map((row) => {
    const quote = Array.isArray(row.quotes) ? (row.quotes[0] ?? null) : row.quotes
    const settled = (quote?.quote_payments ?? []).find(
      (payment) => payment.status === 'paid' && payment.kind === row.kind
    )

    return {
      ...toInvoice(row),
      quoteSlug: quote?.slug ?? '',
      clientName: quote?.client_name ?? 'Unknown',
      clientCompany: quote?.client_company ?? null,
      projectTitle: quote?.project_title ?? '',
      paid: Boolean(settled),
      paidAt: settled?.paid_at ?? null,
      paidVia: settled?.channel ?? null,
    }
  })
}

/**
 * Records a payment that happened outside Paystack.
 *
 * Bank transfers are how most of these will actually be settled, and an invoice
 * list that can only see card payments would show half the truth. Written as a
 * `quote_payments` row with channel `manual`, so paid state still has exactly
 * one source.
 */
export async function markInvoicePaid(invoiceId: string, note: string): Promise<void> {
  const invoice = await serviceClient()
    .from('invoices')
    .select('id, quote_id, amount_minor, currency, kind')
    .eq('id', invoiceId)
    .maybeSingle()

  if (invoice.error || !invoice.data) fail('MARK_PAID_LOOKUP', invoice.error)

  const row = invoice.data as {
    quote_id: string
    amount_minor: number
    currency: string
    kind: string
  }

  const { error } = await serviceClient()
    .from('quote_payments')
    .insert({
      quote_id: row.quote_id,
      reference: `manual_${invoiceId.slice(0, 8)}_${Date.now()}`,
      status: 'paid',
      amount_minor: row.amount_minor,
      currency: row.currency,
      kind: row.kind,
      paid_at: new Date().toISOString(),
      channel: 'manual',
      raw: { markedByOperator: true, note: note.slice(0, 500) },
    })

  if (error) fail('MARK_PAID', error)
}
