/**
 * Exchange rates for the template pickers, fetched through our own endpoint.
 *
 * One request per distinct source currency, in parallel. A picker inserting
 * three NGN items and a GBP package into a USD invoice needs two rates, not
 * four.
 */

export interface RateSet {
  /** Source currency → multiplier into the document's currency. */
  rates: Map<string, number>
  /** "1 GBP = 2,041.5 NGN", for telling the operator what was applied. */
  notes: string[]
}

export class RateError extends Error {}

export async function fetchRates(sources: readonly string[], to: string): Promise<RateSet> {
  const foreign = [...new Set(sources)].filter((from) => from !== to)
  const rates = new Map<string, number>([[to, 1]])
  const notes: string[] = []

  await Promise.all(
    foreign.map(async (from) => {
      let response: Response
      try {
        response = await fetch(
          `/api/v1/admin/fx?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`
        )
      } catch {
        throw new RateError('We could not reach the server to convert prices. Try again.')
      }

      const body = (await response.json().catch(() => ({}))) as {
        rate?: number
        error?: { message?: string }
      }
      if (!response.ok || typeof body.rate !== 'number') {
        throw new RateError(
          body.error?.message ?? `We could not get a rate from ${from} to ${to}. Try again.`
        )
      }

      rates.set(from, body.rate)
      notes.push(
        `1 ${from} = ${body.rate.toLocaleString('en-GB', { maximumFractionDigits: 4 })} ${to}`
      )
    })
  )

  return { rates, notes }
}

/** The error message a failed API call carries, or a fallback in plain English. */
export async function messageFrom(response: Response, fallback: string): Promise<string> {
  try {
    const body = (await response.json()) as { error?: { message?: string } }
    return body.error?.message ?? fallback
  } catch {
    return fallback
  }
}
