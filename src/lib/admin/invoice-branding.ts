/**
 * Where the invoice renderer looks for a custom logo.
 *
 * The URL is stored in site content (`brand.invoiceLogoUrl`) so it can be
 * swapped from the admin without a deploy — the studio uses it to switch
 * the mark for a sibling brand and back. When nothing is set, or the site
 * content has not been loaded, the renderer falls back to the built-in
 * "whs." mark.
 *
 * Kept in its own module rather than inlined at the call sites so an
 * invoice API route does not have to know about the site-content loader
 * — it asks this function, and that is all.
 */
import { loadSiteContent, text } from '@/lib/admin/content'

export async function getInvoiceLogoUrl(): Promise<string | null> {
  await loadSiteContent()
  const value = text('brand.invoiceLogoUrl').trim()
  return value.length > 0 ? value : null
}
