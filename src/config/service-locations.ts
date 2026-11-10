/**
 * Locations for the service-by-place pages, /use-cases/<service>/<location>.
 *
 * Only places we can speak for honestly get a page: somewhere we are based or
 * have named work to show. The site once had 29 places (87 pages), most of
 * them cities we had no clients in; Google's spam policies describe pages like
 * that as doorway pages, and claims we could not back up cost trust. Those
 * places are listed in RETIRED_LOCATIONS so their old addresses redirect.
 *
 * Add a place only when there is something specific to say: a named client, a
 * case study from there, or a local payment method we actually build with.
 */

export type LocationKind = 'country' | 'city' | 'district'

export interface ServiceLocation {
  slug: string
  label: string
  /** Long-form name used in <title> and H1: "Lagos, Nigeria" vs. "Lagos". */
  longLabel: string
  /** Country the location belongs to. Same as `label` for country entries. */
  country: string
  /** ISO 3166-1 alpha-2. Used in JSON-LD `addressCountry`. */
  countryCode: string
  kind: LocationKind
  /** ISO 4217, the currency clients here actually pay in. */
  currency: string
  /**
   * One paragraph that names something real about building for clients
   * here. Payment rails, connectivity, procurement, the specific
   * regulator, the specific culture — anything that would sound wrong
   * pasted onto another city.
   */
  localContext: string
  /** Direct answer to "do you build for clients in <place>?" */
  faqAnswer: string
}

export const SERVICE_LOCATIONS: readonly ServiceLocation[] = [
  /* --- Nigeria: country + four Lagos districts ---------------------- */
  {
    slug: 'lagos',
    label: 'Lagos',
    longLabel: 'Lagos, Nigeria',
    country: 'Nigeria',
    countryCode: 'NG',
    kind: 'city',
    currency: 'NGN',
    localContext:
      'We are based in Lagos, so we build for how business works here: Paystack for card payments, pages made for a phone on a patchy connection, and prices in naira, with websites from ₦150,000. Calls happen over Zoom or WhatsApp, and we can meet in person in Lagos.',
    faqAnswer:
      'Yes. We are based in Lagos, and most of our discovery calls happen from here. We can meet in person or talk over Zoom or WhatsApp.',
  },
] as const

/**
 * Places that used to have pages, and where their old addresses now go: the
 * Lagos districts fold into Lagos, everywhere else goes to the service's own
 * page (null), which answers "do you work outside Lagos?" in its questions.
 */
export const RETIRED_LOCATIONS: Readonly<Record<string, string | null>> = {
  lekki: 'lagos',
  mainland: 'lagos',
  'victoria-island': 'lagos',
  ikoyi: 'lagos',
  ...Object.fromEntries(
    [
      'canada', 'toronto', 'vancouver', 'montreal',
      'uk', 'london', 'manchester', 'edinburgh',
      'usa', 'new-york', 'san-francisco', 'austin',
      'rwanda', 'kigali', 'butare', 'gisenyi',
      'ghana', 'accra', 'kumasi', 'takoradi',
      'south-africa', 'johannesburg', 'cape-town', 'durban',
    ].map((slug) => [slug, null]),
  ),
}

export const LOCATIONS_BY_SLUG: ReadonlyMap<string, ServiceLocation> = new Map(
  SERVICE_LOCATIONS.map((location) => [location.slug, location])
)

/** Group locations by their country label — used by the "also serving" list. */
export function locationsByCountry(): ReadonlyArray<{
  country: string
  locations: ServiceLocation[]
}> {
  const buckets = new Map<string, ServiceLocation[]>()
  for (const location of SERVICE_LOCATIONS) {
    const bucket = buckets.get(location.country) ?? []
    bucket.push(location)
    buckets.set(location.country, bucket)
  }
  return [...buckets.entries()].map(([country, locations]) => ({ country, locations }))
}
