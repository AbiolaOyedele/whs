/** A client record, distinct from the client details frozen onto a quote. */
export interface Client {
  id: string
  name: string
  company: string | null
  email: string | null
  phone: string | null
  role: string | null
  website: string | null
  notes: string
  createdAt: string
  updatedAt: string
}

/** A client plus what they have been sent. */
export interface ClientWithActivity extends Client {
  quoteCount: number
  acceptedCount: number
  /** Value of every accepted quote, keyed by currency. */
  wonByCurrency: Record<string, number>
  lastQuoteAt: string | null
}
