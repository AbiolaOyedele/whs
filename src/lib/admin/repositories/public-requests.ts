/**
 * Every database query touching the public-requests queue.
 *
 * One inbox for every kind of ask the public site sends the studio.
 * `kind` distinguishes them; the admin queue filters by it. See
 * `src/types/public-request.ts` for the shape.
 */
import { serviceClient } from '@/lib/supabase'
import { AppError } from '@/lib/errors'
import type {
  PublicRequest,
  PublicRequestInput,
  RequestDetails,
  RequestKind,
  RequestStatus,
} from '@/types/public-request'

interface Row {
  id: string
  kind: RequestKind
  contact_name: string | null
  contact_email: string
  contact_phone: string | null
  company: string | null
  message: string
  details: RequestDetails
  status: RequestStatus
  client_id: string | null
  linked_quote_id: string | null
  submitted_at: string
  updated_at: string
}

const SELECT =
  'id, kind, contact_name, contact_email, contact_phone, company, message, details, status, client_id, linked_quote_id, submitted_at, updated_at'

const toRequest = (row: Row): PublicRequest => ({
  id: row.id,
  kind: row.kind,
  contactName: row.contact_name,
  contactEmail: row.contact_email,
  contactPhone: row.contact_phone,
  company: row.company,
  message: row.message ?? '',
  details: row.details ?? {},
  status: row.status,
  clientId: row.client_id,
  linkedQuoteId: row.linked_quote_id,
  submittedAt: row.submitted_at,
  updatedAt: row.updated_at,
})

function fail(op: string, cause: unknown): never {
  throw new AppError(
    500,
    'We could not reach the request queue.',
    `DB_PUBLIC_REQUEST_${op}_FAILED`,
    cause
  )
}

export interface CreateRequestOptions {
  ipHash?: string | undefined
  userAgent?: string | undefined
}

/**
 * Inserts a new request. The follow-up wiring — creating a client row,
 * spawning a draft quote — is done by the caller, so the request row is
 * saved even if any of those follow-ups later fails.
 */
export async function createPublicRequest(
  input: PublicRequestInput,
  options: CreateRequestOptions = {}
): Promise<PublicRequest> {
  const { data, error } = await serviceClient()
    .from('public_requests')
    .insert({
      kind: input.kind,
      contact_name: input.contactName,
      contact_email: input.contactEmail.toLowerCase(),
      contact_phone: input.contactPhone,
      company: input.company,
      message: input.message,
      details: input.details,
      ip_hash: options.ipHash ?? null,
      user_agent: options.userAgent ?? null,
    })
    .select(SELECT)
    .single()

  if (error) fail('CREATE', error)
  return toRequest(data as Row)
}

/** Attach a client / draft-quote id to the row once triage has produced them. */
export async function attachRequestRelations(
  requestId: string,
  relations: { clientId?: string | null; linkedQuoteId?: string | null }
): Promise<void> {
  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (relations.clientId !== undefined) patch['client_id'] = relations.clientId
  if (relations.linkedQuoteId !== undefined) patch['linked_quote_id'] = relations.linkedQuoteId

  const { error } = await serviceClient()
    .from('public_requests')
    .update(patch)
    .eq('id', requestId)

  if (error) fail('ATTACH_RELATIONS', error)
}

export interface PublicRequestListRow extends PublicRequest {
  linkedQuoteSlug: string | null
}

/** Every request in the queue, newest first. Optionally filtered by kind. */
export async function listPublicRequests(kind?: RequestKind): Promise<PublicRequestListRow[]> {
  let query = serviceClient()
    .from('public_requests')
    .select(`${SELECT}, quotes ( slug )`)
    .order('submitted_at', { ascending: false })

  if (kind) query = query.eq('kind', kind)

  const { data, error } = await query
  if (error) fail('LIST', error)

  type Joined = Row & { quotes: { slug: string } | { slug: string }[] | null }
  return (data as unknown as Joined[]).map((row) => {
    const quote = Array.isArray(row.quotes) ? (row.quotes[0] ?? null) : row.quotes
    return { ...toRequest(row), linkedQuoteSlug: quote?.slug ?? null }
  })
}

export async function getPublicRequestById(id: string): Promise<PublicRequestListRow | null> {
  const { data, error } = await serviceClient()
    .from('public_requests')
    .select(`${SELECT}, quotes ( slug )`)
    .eq('id', id)
    .maybeSingle()

  if (error) fail('GET_BY_ID', error)
  if (!data) return null

  type Joined = Row & { quotes: { slug: string } | { slug: string }[] | null }
  const row = data as unknown as Joined
  const quote = Array.isArray(row.quotes) ? (row.quotes[0] ?? null) : row.quotes
  return { ...toRequest(row), linkedQuoteSlug: quote?.slug ?? null }
}

export async function updatePublicRequestStatus(
  id: string,
  status: RequestStatus
): Promise<void> {
  const { error } = await serviceClient()
    .from('public_requests')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) fail('UPDATE_STATUS', error)
}
