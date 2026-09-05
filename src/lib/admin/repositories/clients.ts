/**
 * Every database query touching a client.
 */
import { serviceClient } from '@/lib/supabase'
import { AppError } from '@/lib/errors'
import { computeTotals } from '@/lib/admin/money'
import type { Client, ClientWithActivity } from '@/types/client'
import type { QuoteOptionPricing, QuoteStatus } from '@/types/quote'

interface Row {
  id: string
  name: string
  company: string | null
  email: string | null
  phone: string | null
  role: string | null
  website: string | null
  notes: string
  created_at: string
  updated_at: string
}

const SELECT = 'id, name, company, email, phone, role, website, notes, created_at, updated_at'

const toClient = (row: Row): Client => ({
  id: row.id,
  name: row.name,
  company: row.company,
  email: row.email,
  phone: row.phone,
  role: row.role,
  website: row.website,
  notes: row.notes ?? '',
  createdAt: row.created_at,
  updatedAt: row.updated_at,
})

function fail(op: string, cause: unknown): never {
  throw new AppError(500, 'We could not reach the client list.', `DB_CLIENT_${op}_FAILED`, cause)
}

/** Emails identify a client, so they are stored one way: lowercased, trimmed. */
const normaliseEmail = (email: string | null | undefined): string | null => {
  const value = email?.trim().toLowerCase()
  return value && value.length > 0 ? value : null
}

export async function listClients(search?: string): Promise<ClientWithActivity[]> {
  let query = serviceClient()
    .from('clients')
    .select(
      `${SELECT}, quotes ( status, currency, discount_minor, tax_rate_bp, deposit_percent, created_at, quote_line_items ( quantity, unit_price_minor, is_optional, option_id ), quote_options ( id, is_selected, pricing_mode, fixed_price_minor ) )`
    )
    .order('updated_at', { ascending: false })

  if (search) {
    const term = search.replace(/[,()*]/g, ' ').trim()
    if (term) {
      query = query.or(`name.ilike.%${term}%,company.ilike.%${term}%,email.ilike.%${term}%`)
    }
  }

  const { data, error } = await query
  if (error) fail('LIST', error)

  type Joined = Row & {
    quotes: Array<{
      status: QuoteStatus
      currency: string
      discount_minor: number
      tax_rate_bp: number
      deposit_percent: number
      created_at: string
      quote_line_items: Array<{
        quantity: number | string
        unit_price_minor: number
        is_optional: boolean
        option_id: string | null
      }> | null
      quote_options: Array<{
        id: string
        is_selected: boolean
        pricing_mode: QuoteOptionPricing
        fixed_price_minor: number | string
      }> | null
    }> | null
  }

  return (data as Joined[]).map((row) => {
    const quotes = row.quotes ?? []
    const wonByCurrency: Record<string, number> = {}

    for (const quote of quotes) {
      if (quote.status !== 'accepted') continue

      const totals = computeTotals({
        lineItems: (quote.quote_line_items ?? []).map((item, index) => ({
          id: String(index),
          position: index,
          title: '',
          description: '',
          quantity: typeof item.quantity === 'string' ? Number(item.quantity) : item.quantity,
          unitPriceMinor: item.unit_price_minor,
          isOptional: item.is_optional,
          optionId: item.option_id,
        })),
        /* Options are joined in for the same reason `computeTotals` demands
           them: without the selection, an accepted quote offering three
           packages would report all three as won revenue. */
        /* `pricing_mode` and `fixed_price_minor` are not decoration here: a
           fixed-price package carries the money itself, so omitting them would
           value every won quote at the sum of its inclusion lines, which is
           usually zero. */
        options: (quote.quote_options ?? []).map((option) => ({
          id: option.id,
          kind: 'package' as const,
          position: 0,
          title: '',
          description: '',
          isSelected: option.is_selected,
          isDefault: false,
          pricing: option.pricing_mode,
          fixedPriceMinor:
            typeof option.fixed_price_minor === 'string'
              ? Number(option.fixed_price_minor)
              : option.fixed_price_minor,
        })),
        discountMinor: quote.discount_minor,
        taxRateBp: quote.tax_rate_bp,
        depositPercent: quote.deposit_percent,
      })

      wonByCurrency[quote.currency] = (wonByCurrency[quote.currency] ?? 0) + totals.totalMinor
    }

    const lastQuoteAt = quotes
      .map((quote) => quote.created_at)
      .sort()
      .at(-1)

    return {
      ...toClient(row),
      quoteCount: quotes.length,
      acceptedCount: quotes.filter((quote) => quote.status === 'accepted').length,
      wonByCurrency,
      lastQuoteAt: lastQuoteAt ?? null,
    }
  })
}

export async function getClient(id: string): Promise<Client | null> {
  const { data, error } = await serviceClient()
    .from('clients')
    .select(SELECT)
    .eq('id', id)
    .maybeSingle()

  if (error) fail('GET', error)
  return data ? toClient(data as Row) : null
}

export interface ClientInput {
  name: string
  company?: string | null | undefined
  email?: string | null | undefined
  phone?: string | null | undefined
  role?: string | null | undefined
  website?: string | null | undefined
  notes?: string | undefined
}

export async function createClient(input: ClientInput, userId: string): Promise<Client> {
  const { data, error } = await serviceClient()
    .from('clients')
    .insert({
      name: input.name,
      company: input.company ?? null,
      email: normaliseEmail(input.email),
      phone: input.phone ?? null,
      role: input.role ?? null,
      website: input.website ?? null,
      notes: input.notes ?? '',
      created_by: userId,
    })
    .select(SELECT)
    .single()

  if (error) {
    if ((error as { code?: string }).code === '23505') {
      throw new AppError(409, 'A client with that email already exists.', 'CLIENT_EMAIL_TAKEN')
    }
    fail('CREATE', error)
  }

  return toClient(data as Row)
}

export async function updateClient(id: string, input: ClientInput): Promise<void> {
  const { error } = await serviceClient()
    .from('clients')
    .update({
      name: input.name,
      company: input.company ?? null,
      email: normaliseEmail(input.email),
      phone: input.phone ?? null,
      role: input.role ?? null,
      website: input.website ?? null,
      notes: input.notes ?? '',
    })
    .eq('id', id)

  if (error) {
    if ((error as { code?: string }).code === '23505') {
      throw new AppError(409, 'A client with that email already exists.', 'CLIENT_EMAIL_TAKEN')
    }
    fail('UPDATE', error)
  }
}

/**
 * Fills in a client record's email when it has none.
 *
 * Used when a client supplies their address on their own quote. Without this
 * the address lands on the quote and the client record beside it still reads
 * blank, which is what "the email did not save" looks like from the Clients
 * page even though it did.
 *
 * Set-once, like the quote's own column, and guarded in the WHERE clause. Best
 * effort by design: it returns false rather than throwing when the address
 * already belongs to another record, because this runs inside a client's
 * payment and must never be the thing that stops it.
 */
export async function setClientEmailIfEmpty(clientId: string, email: string): Promise<boolean> {
  const normalised = normaliseEmail(email)
  if (!normalised) return false

  const { data, error } = await serviceClient()
    .from('clients')
    .update({ email: normalised })
    .eq('id', clientId)
    .is('email', null)
    .select('id')

  /* A unique-violation means another record already holds this address, which
     is a merge for a person to do, not something to fail a payment over. */
  if (error) {
    console.error('[clients] could not fill in email', { clientId, code: error.code })
    return false
  }
  return (data as Array<{ id: string }> | null)?.length === 1
}

export async function deleteClient(id: string): Promise<void> {
  // Quotes survive: `client_id` is ON DELETE SET NULL and each quote keeps its
  // own copy of the name it was sent under.
  const { error } = await serviceClient().from('clients').delete().eq('id', id)
  if (error) fail('DELETE', error)
}

/**
 * Finds a client, or creates one.
 *
 * Called whenever a quote is created or its client details are saved, so the
 * client list stays current without anyone maintaining it by hand — which is
 * the only way a list like this stays accurate.
 *
 * Matching is by email FIRST, because an address identifies a person and a name
 * does not. Two different people called James at the same company must not be
 * merged into one record; that is a worse failure than a duplicate somebody can
 * tidy up.
 *
 * But a quote without an email used to skip matching altogether and create a
 * row every single time it was saved. Nine rows for one client, eight of them
 * holding no quotes, because the tenth save had repointed the quote at the
 * newest. "A duplicate row someone can merge later" was the accepted trade;
 * a new row per keystroke of Save was not.
 *
 * So when there is no email, fall back to an exact match on name AND company,
 * restricted to records that have no email of their own. That cannot merge a
 * James who has an address with a James who does not, and it cannot silently
 * absorb a curated record: a client row with an email is only ever reached by
 * matching that email.
 */
export async function findOrCreateClient(
  input: ClientInput,
  userId: string
): Promise<Client | null> {
  const email = normaliseEmail(input.email)
  if (!input.name.trim()) return null

  if (!email) {
    const name = input.name.trim()
    const company = input.company?.trim() ?? null

    let query = serviceClient().from('clients').select(SELECT).is('email', null).eq('name', name)
    query = company ? query.eq('company', company) : query.is('company', null)

    const { data, error } = await query.limit(1)
    if (error) fail('LOOKUP', error)

    const match = (data as Row[] | null)?.[0]
    if (match) {
      const existing = toClient(match)
      /* Top up the blanks the quote can fill, same as the email path. */
      const patch: ClientInput = {
        name: existing.name,
        company: existing.company ?? company,
        email: existing.email,
        phone: existing.phone ?? input.phone ?? null,
        role: existing.role ?? input.role ?? null,
        website: existing.website,
        notes: existing.notes,
      }
      await updateClient(existing.id, patch)
      return { ...existing, ...patch } as Client
    }
  }

  if (email) {
    const { data, error } = await serviceClient()
      .from('clients')
      .select(SELECT)
      .eq('email', email)
      .maybeSingle()

    if (error) fail('LOOKUP', error)
    if (data) {
      const existing = toClient(data as Row)

      /* Fill blanks from the quote, never overwrite. The client record is the
         one someone has curated; a quote should top it up, not flatten it. */
      const patch: ClientInput = {
        name: existing.name,
        company: existing.company ?? input.company ?? null,
        email: existing.email,
        phone: existing.phone ?? input.phone ?? null,
        role: existing.role ?? input.role ?? null,
        website: existing.website,
        notes: existing.notes,
      }
      await updateClient(existing.id, patch)
      return { ...existing, ...patch } as Client
    }
  }

  try {
    return await createClient(input, userId)
  } catch (cause) {
    // A duplicate here means a concurrent create won the race; that is fine.
    if (cause instanceof AppError && cause.code === 'CLIENT_EMAIL_TAKEN') return null
    throw cause
  }
}
