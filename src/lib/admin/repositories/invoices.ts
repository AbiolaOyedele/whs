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
