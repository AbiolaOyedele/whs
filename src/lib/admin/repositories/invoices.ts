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

/**
 * The figures as they stood when the invoice was issued.
 *
 * An invoice is a document, not a view of a quote. Everything it shows is
 * frozen here so it renders identically forever, whatever happens to the quote
 * afterwards.
 */
export interface InvoiceSnapshot {
  currency: string
  clientName: string
  clientCompany: string | null
  clientEmail: string | null
  projectTitle: string
  paymentTerms: string
  lines: Array<{
    title: string
    description: string
    quantity: number
    unitPriceMinor: number
    amountMinor: number
  }>
  subtotalMinor: number
  discountMinor: number
  taxRateBp: number
  taxMinor: number
  totalMinor: number
}

export interface InvoiceRecord {
  id: string
  quoteId: string
  number: string
  amountMinor: number
  currency: string
  kind: 'deposit' | 'balance' | 'full'
  issuedAt: string
  dueAt: string | null
  snapshot: InvoiceSnapshot
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
  snapshot: InvoiceSnapshot
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
  snapshot: row.snapshot,
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
/**
 * The most recent invoice of this kind for a quote, if there is one.
 *
 * The caller must check that it still matches the quote before reusing it —
 * see `matchesQuote`. Reusing a stale one produced an invoice that mixed
 * currencies: NGN line items beside a deposit still denominated in pence.
 */
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
/**
 * Rewrites an UNPAID invoice to match the quote as it stands.
 *
 * The number is kept. An unpaid invoice is a bill that has not been settled, so
 * regenerating its contents costs nothing and is what the operator expects:
 * they edit a quote, download the invoice, and see the edit. Issuing a fresh
 * number on every wording change would burn the sequence and make the ledger
 * unreadable.
 *
 * A PAID invoice is never touched. That is a record of money that moved, and
 * rewriting it after the fact is the one thing an invoice must not do — the
 * caller checks and issues a new one instead.
 */
export async function refreshInvoice(
  id: string,
  input: {
    amountMinor: number
    currency: string
    dueAt: string | null
    snapshot: InvoiceSnapshot
  }
): Promise<InvoiceRecord> {
  const { data, error } = await serviceClient()
    .from('invoices')
    .update({
      amount_minor: input.amountMinor,
      currency: input.currency,
      due_at: input.dueAt,
      snapshot: input.snapshot,
      issued_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select(SELECT)
    .single()

  if (error) fail('REFRESH', error)
  return toInvoice(data as Row)
}

/** Whether any payment has settled this invoice's kind on its quote. */
export async function isInvoiceSettled(
  quoteId: string,
  kind: InvoiceRecord['kind']
): Promise<boolean> {
  const { data, error } = await serviceClient()
    .from('quote_payments')
    .select('id')
    .eq('quote_id', quoteId)
    .eq('kind', kind)
    .eq('status', 'paid')
    .limit(1)

  if (error) fail('SETTLED_CHECK', error)
  return (data as Array<{ id: string }>).length > 0
}

export async function createInvoice(input: {
  quoteId: string
  amountMinor: number
  currency: string
  kind: InvoiceRecord['kind']
  dueAt: string | null
  snapshot: InvoiceSnapshot
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
  /** Everything settled against this quote, by card or marked off by hand. */
  paidMinor: number
  /** What is still owed. Never negative: an overpayment reads as zero owed. */
  outstandingMinor: number
  settledInFull: boolean
  lastPaidAt: string | null
}

/**
 * Every invoice, with what has been paid against it and what is still owed.
 *
 * An invoice is for the quote total, and payments reduce a balance. It is not
 * one document per instalment: a client who pays a 40% deposit has not settled
 * a separate deposit invoice, they have paid 40% of one bill and owe the rest.
 * That is what an invoice ledger has to be able to say.
 *
 * Paid amounts come from `quote_payments` rather than a column here, so a card
 * payment and a bank transfer marked off by hand are counted the same way and
 * there is only one place that knows whether money arrived.
 */
export async function listInvoices(): Promise<InvoiceListRow[]> {
  const { data, error } = await serviceClient()
    .from('invoices')
    .select(
      `${SELECT}, quotes ( slug, client_name, client_company, project_title, status, quote_payments ( status, paid_at, amount_minor ) )`
    )
    .order('issued_at', { ascending: false })

  if (error) fail('LIST', error)

  interface JoinedQuote {
    slug: string
    client_name: string
    client_company: string | null
    project_title: string
    status: string
    quote_payments: Array<{
      status: string
      paid_at: string | null
      amount_minor: number
    }> | null
  }

  type Joined = Row & { quotes: JoinedQuote[] | JoinedQuote | null }

  return (data as unknown as Joined[]).map((row) => {
    const quote = Array.isArray(row.quotes) ? (row.quotes[0] ?? null) : row.quotes
    const settledPayments = (quote?.quote_payments ?? []).filter(
      (payment) => payment.status === 'paid'
    )

    const paidMinor = settledPayments.reduce((sum, payment) => sum + payment.amount_minor, 0)
    const invoice = toInvoice(row)

    const lastPaidAt = settledPayments
      .map((payment) => payment.paid_at)
      .filter((value): value is string => Boolean(value))
      .sort()
      .at(-1)

    return {
      ...invoice,
      quoteSlug: quote?.slug ?? '',
      clientName: quote?.client_name ?? 'Unknown',
      clientCompany: quote?.client_company ?? null,
      projectTitle: quote?.project_title ?? '',
      paidMinor,
      // Clamped: an overpayment should read as nothing owed, not as a negative.
      outstandingMinor: Math.max(0, invoice.amountMinor - paidMinor),
      settledInFull: paidMinor >= invoice.amountMinor,
      lastPaidAt: lastPaidAt ?? null,
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
export async function markInvoicePaid(
  invoiceId: string,
  amountMinor: number,
  note: string
): Promise<void> {
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

  if (amountMinor <= 0 || amountMinor > row.amount_minor) {
    throw new AppError(
      422,
      'That amount is not between zero and the invoice total.',
      'PAYMENT_AMOUNT_OUT_OF_RANGE'
    )
  }

  const { error } = await serviceClient()
    .from('quote_payments')
    .insert({
      quote_id: row.quote_id,
      reference: `manual_${invoiceId.slice(0, 8)}_${Date.now()}`,
      status: 'paid',
      amount_minor: amountMinor,
      currency: row.currency,
      kind: row.kind,
      paid_at: new Date().toISOString(),
      channel: 'manual',
      raw: { markedByOperator: true, note: note.slice(0, 500) },
    })

  if (error) fail('MARK_PAID', error)
}
