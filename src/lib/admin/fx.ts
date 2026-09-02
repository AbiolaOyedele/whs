/**
 * Currency conversion for quotes.
 *
 * Switching a quote's currency used to change only the label: £4,200 became
 * ₦4,200, which is off by a factor of roughly two thousand. This converts the
 * amounts.
 *
 * The rate is fetched once, at the moment of conversion, and the converted
 * amounts are then stored as ordinary figures. A quote is NOT re-priced on
 * every view: a client who was sent a total must see that total tomorrow, not
 * whatever the market did overnight. The rate is a one-time input, not a live
 * dependency.
 *
 * open.er-api.com: free, no key, updates daily. If it is unreachable the
 * conversion is refused rather than guessed — a wrong exchange rate in a quote
 * is worse than no conversion at all.
 */
import { AppError } from '@/lib/errors'

const ENDPOINT = 'https://open.er-api.com/v6/latest'

export interface ConversionRate {
  from: string
  to: string
  rate: number
  /** The provider's own timestamp for the rate, so the operator can see its age. */
  asOf: string
}

/** Cached for the process: a rate does not move within one editing session. */
const cache = new Map<string, { value: ConversionRate; at: number }>()
const CACHE_MS = 60 * 60 * 1000

export async function fetchRate(from: string, to: string): Promise<ConversionRate> {
  if (from === to) {
    return { from, to, rate: 1, asOf: new Date().toISOString() }
  }

  const key = `${from}:${to}`
  const hit = cache.get(key)
  if (hit && Date.now() - hit.at < CACHE_MS) return hit.value

  let payload: {
    result?: string
    time_last_update_utc?: string
    rates?: Record<string, number>
  }

  try {
    const response = await fetch(`${ENDPOINT}/${encodeURIComponent(from)}`, {
      signal: AbortSignal.timeout(8000),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    payload = (await response.json()) as typeof payload
  } catch (cause) {
    throw new AppError(
      502,
      'We could not get today’s exchange rate. Try again in a moment, or change the prices by hand.',
      'FX_RATE_UNAVAILABLE',
      cause
    )
  }

  const rate = payload.rates?.[to]
  if (payload.result !== 'success' || typeof rate !== 'number' || rate <= 0) {
    throw new AppError(
      422,
      `We do not have an exchange rate for ${from} to ${to}.`,
      'FX_PAIR_UNSUPPORTED'
    )
  }

  const value: ConversionRate = {
    from,
    to,
    rate,
    asOf: payload.time_last_update_utc ?? new Date().toISOString(),
  }
  cache.set(key, { value, at: Date.now() })
  return value
}

/**
 * Converts an amount in minor units.
 *
 * Both currencies here use two decimal places, so the exponents cancel and the
 * rate applies directly to the minor figure. Rounded half away from zero, the
 * same rule the rest of the money code uses.
 */
export function convertMinor(amountMinor: number, rate: number): number {
  const converted = amountMinor * rate
  return converted < 0 ? -Math.round(-converted) : Math.round(converted)
}
