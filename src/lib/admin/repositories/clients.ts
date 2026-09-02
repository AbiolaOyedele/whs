/**
 * Every database query touching a client.
 */
import { serviceClient } from '@/lib/supabase'
import { AppError } from '@/lib/errors'
import { computeTotals } from '@/lib/admin/money'
import type { Client, ClientWithActivity } from '@/types/client'
import type { QuoteStatus } from '@/types/quote'

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
      `${SELECT}, quotes ( status, currency, discount_minor, tax_rate_bp, deposit_percent, created_at, quote_line_items ( quantity, unit_price_minor, is_optional ) )`
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

export async function deleteClient(id: string): Promise<void> {
  // Quotes survive: `client_id` is ON DELETE SET NULL and each quote keeps its
  // own copy of the name it was sent under.
  const { error } = await serviceClient().from('clients').delete().eq('id', id)
  if (error) fail('DELETE', error)
}

/**
 * Finds a client by email, or creates one.
 *
 * Called whenever a quote is created or its client details are saved, so the
 * client list stays current without anyone maintaining it by hand — which is
 * the only way a list like this stays accurate.
 *
 * Matching is by email only. Matching on name would merge two different people
 * called James at the same company, and that is a worse failure than a
 * duplicate row someone can merge later.
 */
export async function findOrCreateClient(
  input: ClientInput,
  userId: string
): Promise<Client | null> {
  const email = normaliseEmail(input.email)
  if (!input.name.trim()) return null

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
