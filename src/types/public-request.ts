/**
 * Shapes for public-facing request submissions.
 *
 * ONE type covers every kind of ask that lands in the admin request
 * queue — quote requests, site-check requests, whatever comes next. The
 * `kind` field distinguishes them; `details` carries kind-specific
 * fields as JSON so a new form can ship without a schema migration.
 */

export const REQUEST_KINDS = ['quote', 'site-check'] as const
export type RequestKind = (typeof REQUEST_KINDS)[number]

export const REQUEST_KIND_LABELS: Record<RequestKind, string> = {
  quote: 'Quote request',
  'site-check': 'Site check',
}

export const REQUEST_STATUSES = ['new', 'in_progress', 'quoted', 'closed'] as const
export type RequestStatus = (typeof REQUEST_STATUSES)[number]

export const REQUEST_STATUS_LABELS: Record<RequestStatus, string> = {
  new: 'New',
  in_progress: 'In progress',
  quoted: 'Quoted',
  closed: 'Closed',
}

/**
 * The kind-specific fields, stored in `details` jsonb. Each kind gets a
 * narrow interface so the admin can render the right block without a
 * runtime cast.
 */
export interface QuoteRequestDetails {
  projectType?: string
  projectSummary?: string
  budgetRange?: string
  timeline?: string
  referralSource?: string
}

export interface SiteCheckDetails {
  /** The URL the visitor wants us to look at. */
  websiteUrl: string
}

export type RequestDetails = QuoteRequestDetails | SiteCheckDetails | Record<string, unknown>

export interface PublicRequestInput {
  kind: RequestKind
  contactName: string | null
  contactEmail: string
  contactPhone: string | null
  company: string | null
  message: string
  details: RequestDetails
}

export interface PublicRequest extends PublicRequestInput {
  id: string
  status: RequestStatus
  clientId: string | null
  linkedQuoteId: string | null
  submittedAt: string
  updatedAt: string
}
