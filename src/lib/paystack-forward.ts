/**
 * Passes a Paystack webhook on to the other products on the same Paystack
 * business.
 *
 * A Paystack business has one webhook URL per mode, and the Wild Hands
 * business takes payments for several products (Dumpty, the shop platform).
 * This site holds that URL, so any event that is not one of our own payments
 * is sent on, byte for byte, with Paystack's original signature. Every
 * product shares the business's secret key, so each one still checks the
 * signature itself and ignores references it does not know. Nothing here is
 * trusted downstream.
 */
import { adminEnv } from '@/config/env'

/** Long enough for a cold start downstream, short enough that Paystack does not time us out. */
const FORWARD_TIMEOUT_MS = 8000

export interface ForwardResult {
  url: string
  ok: boolean
  /** HTTP status, or null when the request never completed. */
  status: number | null
}

/** The downstream webhook URLs from `PAYSTACK_FORWARD_URLS`, comma-separated. Empty when unset. */
export function forwardUrls(): string[] {
  let raw: string | undefined
  try {
    raw = adminEnv().PAYSTACK_FORWARD_URLS
  } catch {
    return []
  }
  return parseForwardUrls(raw)
}

/** Splits and checks a comma-separated list. Anything that is not an https URL is dropped. */
export function parseForwardUrls(raw: string | undefined): string[] {
  if (!raw) return []
  return raw
    .split(',')
    .map((part) => part.trim())
    .filter((part) => {
      try {
        return new URL(part).protocol === 'https:'
      } catch {
        return false
      }
    })
}

/**
 * Sends the raw body and signature to every URL at once. Never throws: one
 * product being down must not stop the others hearing about their payments,
 * nor make Paystack retry the event at us.
 */
export async function forwardWebhook(
  rawBody: string,
  signature: string,
  urls: string[],
  send: typeof fetch = fetch
): Promise<ForwardResult[]> {
  return Promise.all(
    urls.map(async (url): Promise<ForwardResult> => {
      try {
        const response = await send(url, {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'x-paystack-signature': signature,
          },
          body: rawBody,
          signal: AbortSignal.timeout(FORWARD_TIMEOUT_MS),
        })
        return { url, ok: response.ok, status: response.status }
      } catch {
        return { url, ok: false, status: null }
      }
    })
  )
}
