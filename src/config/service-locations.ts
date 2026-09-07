/**
 * Locations for the programmatic service pages.
 *
 * Each entry drives one row of the cross-product `/services/<service>/<location>`
 * — 3 services × 29 locations = 87 pages, published to the sitemap so a
 * client searching for "custom website design in Lekki" or "app developer
 * in Manchester" has something for Google to surface.
 *
 * `localContext` is the paragraph that makes each page different from its
 * siblings. Deliberately hand-written per location, not templated: Google's
 * helpful-content system flags find-and-replace pages, and there is nothing
 * a Nigerian client hears more clearly than a page written like it has
 * never met them.
 *
 * `faqAnswer` powers the "do you work here?" FAQ entry, honest per place —
 * a client in Butare should not read the same reassurance as one in
 * downtown Toronto.
 *
 * When a new city is added: give it a real paragraph. Copy-pasting one
 * from a neighbour and swapping the name is worse than not having the
 * page.
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
      'Lagos is where most of our clients are, so we build with the realities in mind: Paystack for card payments, mobile-first for users who read on the go over patchy connections, and a checkout that survives an intermittent 4G handoff without losing the cart. We are based here, so scoping calls happen over Zoom or in person, and delivery does not carry a ten-hour timezone gap.',
    faqAnswer:
      'Yes — we are based in Lagos. Most of our discovery calls happen from here and we work with businesses across Lagos, Nigeria and the wider region.',
  },
  {
    slug: 'lekki',
    label: 'Lekki',
    longLabel: 'Lekki, Lagos',
    country: 'Nigeria',
    countryCode: 'NG',
    kind: 'district',
    currency: 'NGN',
    localContext:
      'Lekki has become the corridor for founders and product teams, and most of the businesses we build for here are on their second or third iteration of something and want it right this time. Payment rails are Paystack and Flutterwave; connectivity is better than the average for the city but still mobile-first for most users. We meet clients in Admiralty Way or over a call and can be on-site inside the day when that helps.',
    faqAnswer:
      'Yes. A lot of our clients are on the Lekki–Ajah corridor. We meet in person around Admiralty Way, or over a call if that is easier.',
  },
  {
    slug: 'mainland',
    label: 'Lagos Mainland',
    longLabel: 'Lagos Mainland',
    country: 'Nigeria',
    countryCode: 'NG',
    kind: 'district',
    currency: 'NGN',
    localContext:
      'Yaba, Ikeja, Surulere — the Mainland is where the customer bases of most of the businesses we work with actually live and buy. Sites we build for Mainland brands lean harder into speed and small payloads: users on modest phones, mixed networks, and a checkout that has to finish on the first attempt because a second one might not happen. Bank transfer is often the payment method a client would choose over card, and we support both by default.',
    faqAnswer:
      'Yes. A large share of our audience research is Mainland-based even when the client is not, and we regularly build directly for Mainland businesses.',
  },
  {
    slug: 'victoria-island',
    label: 'Victoria Island',
    longLabel: 'Victoria Island, Lagos',
    country: 'Nigeria',
    countryCode: 'NG',
    kind: 'district',
    currency: 'NGN',
    localContext:
      'Victoria Island is head-office country: banks, insurers, oil and consulting. Work here often means talking to a procurement team as well as a product owner, and integrating with existing enterprise systems that were bought a decade ago. We build the front the customer sees and the internal tool the operations desk uses, and we sign the paperwork that lets us do both.',
    faqAnswer:
      'Yes. We work with a number of Victoria Island businesses — mostly financial services and consulting — including with their internal IT and procurement processes.',
  },
  {
    slug: 'ikoyi',
    label: 'Ikoyi',
    longLabel: 'Ikoyi, Lagos',
    country: 'Nigeria',
    countryCode: 'NG',
    kind: 'district',
    currency: 'NGN',
    localContext:
      'Ikoyi is where we do a lot of our high-touch work — private practices, boutique services, founders whose brand is the business. The pages tend to be smaller and more considered than a Mainland retail build, with a focus on how the site looks and reads to a specific audience rather than how many people it reaches. Discovery calls often start over coffee near Awolowo Road.',
    faqAnswer:
      'Yes. A lot of our smaller, more considered builds are for Ikoyi-based businesses. We can meet in person or over a call.',
  },

  /* --- Canada: country + Toronto, Vancouver, Montreal --------------- */
  {
    slug: 'canada',
    label: 'Canada',
    longLabel: 'Canada',
    country: 'Canada',
    countryCode: 'CA',
    kind: 'country',
    currency: 'CAD',
    localContext:
      'For Canadian clients we work in the timezone that suits: our calls flex to Pacific or Eastern depending on where the team sits. Payments run through Stripe with Interac for local bank transfers when a customer prefers that, and PIPEDA compliance is planned in from the start rather than retrofitted at launch. Bilingual (EN/FR) is supported when the audience needs it, and we set the content model up to make that a switch rather than a rewrite.',
    faqAnswer:
      'Yes. We work with Canadian clients across the country, in either timezone. Bilingual (EN/FR) is supported when needed.',
  },
  {
    slug: 'toronto',
    label: 'Toronto',
    longLabel: 'Toronto, Ontario',
    country: 'Canada',
    countryCode: 'CA',
    kind: 'city',
    currency: 'CAD',
    localContext:
      'Toronto is a fintech and enterprise city, and most of the briefs that reach us from there involve integrations — with a CRM already in place, with a legacy back-office system, with a compliance team that has strong views. We work with those constraints rather than around them. Stripe is the default payment rail; PIPEDA and Ontario-specific consumer law shape the checkout copy from day one.',
    faqAnswer:
      'Yes. We work with Toronto-based businesses regularly, including on procurement-heavy integrations. Calls happen on Eastern time.',
  },
  {
    slug: 'vancouver',
    label: 'Vancouver',
    longLabel: 'Vancouver, British Columbia',
    country: 'Canada',
    countryCode: 'CA',
    kind: 'city',
    currency: 'CAD',
    localContext:
      'Vancouver clients are frequently building for both Canadian and adjacent US audiences — the border is short and the customer base overlaps. That shapes what a site does out of the box: dual-currency where it matters, taxes worked out per region rather than assumed, and analytics that separate the two audiences instead of averaging them. Calls happen on Pacific time, which suits our early afternoons.',
    faqAnswer:
      'Yes. We work with Vancouver-based clients, including on dual-market builds that serve both Canada and the US Pacific Northwest.',
  },
  {
    slug: 'montreal',
    label: 'Montreal',
    longLabel: 'Montreal, Quebec',
    country: 'Canada',
    countryCode: 'CA',
    kind: 'city',
    currency: 'CAD',
    localContext:
      'Montreal work is French-first for most public-facing surfaces — Quebec\'s Charter of the French Language shapes what appears on a landing page before anything else does. We set the content model up so that switching, mirroring, or fully separating the two locales is a configuration decision, not a rebuild. Bill 25 and its consent requirements are treated as a starting point, not a launch-week discovery.',
    faqAnswer:
      'Yes. We build for Montreal businesses, French-first where appropriate, and we plan Bill 25 compliance in from the start.',
  },

  /* --- United Kingdom: country + London, Manchester, Edinburgh ------ */
  {
    slug: 'uk',
    label: 'United Kingdom',
    longLabel: 'the United Kingdom',
    country: 'United Kingdom',
    countryCode: 'GB',
    kind: 'country',
    currency: 'GBP',
    localContext:
      'UK builds default to Stripe for cards, GoCardless when Direct Debit fits the business, and GDPR + PECR compliance handled properly rather than papered over with a banner. We work in GMT/BST, and our afternoons are UK mornings, so the working day overlaps naturally. Domain, hosting and analytics choices assume UK data-residency preferences where those matter.',
    faqAnswer:
      'Yes. We work with UK-based businesses across the country. Calls happen during UK hours, and everything we build ships GDPR-compliant.',
  },
  {
    slug: 'london',
    label: 'London',
    longLabel: 'London',
    country: 'United Kingdom',
    countryCode: 'GB',
    kind: 'city',
    currency: 'GBP',
    localContext:
      'London briefs tend to be more considered — a marketing team, a design partner already involved, a brand book we are asked to work inside. We fit into that stack: build the thing, hand it off in a form the marketing team can update, and stay available for the changes the brief did not anticipate. Enterprise clients get the procurement paperwork they need without us needing to be asked.',
    faqAnswer:
      'Yes. A number of our clients are London-based, including agencies and marketing teams looking for a build partner.',
  },
  {
    slug: 'manchester',
    label: 'Manchester',
    longLabel: 'Manchester',
    country: 'United Kingdom',
    countryCode: 'GB',
    kind: 'city',
    currency: 'GBP',
    localContext:
      'Manchester\'s tech scene is one of the fastest-growing in the country, and the businesses we hear from there are usually value-conscious in the same breath as they are ambitious. We keep scope honest — the shortest build that gets the job done, priced so a growing business can afford it and grow into the next phase without a rebuild. Calls fit the UK working day.',
    faqAnswer:
      'Yes. We work with a lot of Manchester businesses. Scope is kept tight so a first build does not become a barrier to a second.',
  },
  {
    slug: 'edinburgh',
    label: 'Edinburgh',
    longLabel: 'Edinburgh',
    country: 'United Kingdom',
    countryCode: 'GB',
    kind: 'city',
    currency: 'GBP',
    localContext:
      'Edinburgh work often has a public-sector, fintech, or higher-education tilt — organisations for whom "how you handle data" is the first question, not the last. We take that as the point: pick tooling that is auditable, keep the data model boring on purpose, and document what the site actually does with a request. Scottish accessibility guidance is baked in from the start.',
    faqAnswer:
      'Yes. Edinburgh clients often bring data-handling or accessibility requirements up-front, which suits how we build by default.',
  },

  /* --- United States: country + New York, San Francisco, Austin ---- */
  {
    slug: 'usa',
    label: 'the United States',
    longLabel: 'the United States',
    country: 'United States',
    countryCode: 'US',
    kind: 'country',
    currency: 'USD',
    localContext:
      'US builds run on Stripe by default, with ACH added when repeat billing lands better in that channel. State-level sales tax is handled via TaxJar or Stripe Tax so a client is not manually reconciling forty-plus jurisdictions. We work across US timezones — most of our US calls sit in the afternoon UK / morning Eastern overlap, but we adjust when a Pacific client needs it.',
    faqAnswer:
      'Yes. We work with US-based businesses across the country. Sales tax, ACH and Stripe are set up as defaults, not add-ons.',
  },
  {
    slug: 'new-york',
    label: 'New York',
    longLabel: 'New York, NY',
    country: 'United States',
    countryCode: 'US',
    kind: 'city',
    currency: 'USD',
    localContext:
      'New York work usually means a brand with an audience already in place and a bar that is set by whatever agency built the site before. We build to that bar, on a schedule an in-house marketing team can plan around, with a content model designed for a copy team that ships new stories weekly rather than quarterly. Financial-services clients get SOC 2-adjacent hosting choices without needing to ask.',
    faqAnswer:
      'Yes. NYC-based clients — often financial services, media or DTC brands — regularly work with us. Calls happen Eastern time.',
  },
  {
    slug: 'san-francisco',
    label: 'San Francisco',
    longLabel: 'San Francisco, CA',
    country: 'United States',
    countryCode: 'US',
    kind: 'city',
    currency: 'USD',
    localContext:
      'San Francisco briefs are usually product-shaped — a founder who knows exactly what they want to see next, a marketing site that has to keep up with a product changing week to week. We build with that cadence in mind: preview URLs on every branch, a content model the product team can adjust without a code change, and a delivery rhythm that assumes a launch is not the finish line.',
    faqAnswer:
      'Yes. Startup and product clients in the Bay Area work with us regularly. We are available on Pacific time when needed.',
  },
  {
    slug: 'austin',
    label: 'Austin',
    longLabel: 'Austin, TX',
    country: 'United States',
    countryCode: 'US',
    kind: 'city',
    currency: 'USD',
    localContext:
      'Austin has become the address for distributed teams and no-state-income-tax founders, and the sites we build there reflect that mix — often serving a US-wide audience, sometimes with international customers already showing up on day one. We set analytics and payment rails up for that reality: multi-region caching, Stripe with international cards, and a checkout that does not assume US billing.',
    faqAnswer:
      'Yes. We work with Austin-based teams, including distributed startups serving audiences across and beyond the US.',
  },

  /* --- Rwanda: country + Kigali, Butare, Gisenyi -------------------- */
  {
    slug: 'rwanda',
    label: 'Rwanda',
    longLabel: 'Rwanda',
    country: 'Rwanda',
    countryCode: 'RW',
    kind: 'country',
    currency: 'RWF',
    localContext:
      'Rwanda\'s digital push is real, and the businesses we hear from there — from ambitious independents to government-adjacent projects — expect a site that works cleanly on modest devices, integrates with MTN Mobile Money or Airtel Money as the primary payment channel, and reads correctly in English (with Kinyarwanda where the audience calls for it). We build for the actual mix of hardware and networks rather than assuming a fibre-and-flagship-phone baseline.',
    faqAnswer:
      'Yes. We work with Rwandan clients, with Mobile Money and modest-device performance built in from the start.',
  },
  {
    slug: 'kigali',
    label: 'Kigali',
    longLabel: 'Kigali, Rwanda',
    country: 'Rwanda',
    countryCode: 'RW',
    kind: 'city',
    currency: 'RWF',
    localContext:
      'Kigali is where most of the country\'s digital work concentrates — the fintech scene around Norrsken, the government-led ID and payments initiatives, the education-adjacent tech coming out of the university corridor. We work with those environments: build to expected accessibility and language standards, integrate cleanly with existing government-issued digital identity where it makes sense, and treat Mobile Money as the default.',
    faqAnswer:
      'Yes. Kigali is our main Rwandan point of contact; we work with fintech, education and government-adjacent projects there.',
  },
  {
    slug: 'butare',
    label: 'Butare',
    longLabel: 'Butare (Huye), Rwanda',
    country: 'Rwanda',
    countryCode: 'RW',
    kind: 'city',
    currency: 'RWF',
    localContext:
      'Butare — administratively Huye — is Rwanda\'s university town, and the briefs we get from there lean towards research groups, small institutions and NGOs. That shapes what we build: content-heavy sites with genuine multilingual support, small budgets treated as constraints rather than excuses, and hosting picked so it survives an unreliable connection on the admin side.',
    faqAnswer:
      'Yes. We work with Butare-based research, education and civic-sector clients, and price accordingly.',
  },
  {
    slug: 'gisenyi',
    label: 'Gisenyi',
    longLabel: 'Gisenyi (Rubavu), Rwanda',
    country: 'Rwanda',
    countryCode: 'RW',
    kind: 'city',
    currency: 'RWF',
    localContext:
      'Gisenyi — Rubavu on newer maps — sits on the DRC border and its business surface tends to be tourism, hospitality and cross-border trade. Sites we build here are frequently bilingual (English and French) with content aimed at travellers, and payment surfaces that accept both Rwandan Mobile Money and international cards without making the visitor guess which will work.',
    faqAnswer:
      'Yes. We work with Gisenyi-based clients — mostly tourism and cross-border businesses — and build with a bilingual audience in mind.',
  },

  /* --- Ghana: country + Accra, Kumasi, Takoradi --------------------- */
  {
    slug: 'ghana',
    label: 'Ghana',
    longLabel: 'Ghana',
    country: 'Ghana',
    countryCode: 'GH',
    kind: 'country',
    currency: 'GHS',
    localContext:
      'Ghana is mobile-money-first for most transactions — MTN MoMo, Vodafone Cash, AirtelTigo — with card as the second channel. We build both in from day one, along with a checkout that copes with the Cedi\'s day-to-day volatility by pricing in a stable base currency where the business prefers that. Data-residency preferences shaped by Ghana\'s DPA are planned in rather than papered over.',
    faqAnswer:
      'Yes. We work with Ghanaian businesses, with MoMo and card both handled as first-class payment channels.',
  },
  {
    slug: 'accra',
    label: 'Accra',
    longLabel: 'Accra, Ghana',
    country: 'Ghana',
    countryCode: 'GH',
    kind: 'city',
    currency: 'GHS',
    localContext:
      'Accra\'s startup scene has thickened fast, and most of the Accra briefs that reach us are from small teams building something on a considered budget with an ambitious product roadmap. We keep scope honest — ship a first release that earns the second — and default to payment integrations that Ghanaian customers actually reach for, not the ones a US-shaped SaaS assumes.',
    faqAnswer:
      'Yes. Accra-based startups and small teams work with us regularly, on scoped, phased builds that keep costs in check.',
  },
  {
    slug: 'kumasi',
    label: 'Kumasi',
    longLabel: 'Kumasi, Ghana',
    country: 'Ghana',
    countryCode: 'GH',
    kind: 'city',
    currency: 'GHS',
    localContext:
      'Kumasi work leans commercial: retail, trading, service businesses whose customers browse and buy on modest Android phones over mixed networks. The site has to load quickly with a small budget, handle a MoMo checkout without a redirect that loses the sale, and read plainly in English or Twi where that matters. We build to that reality rather than to a lighthouse score on desktop.',
    faqAnswer:
      'Yes. We work with Kumasi retail and service businesses. Mobile performance and MoMo checkout are non-negotiable defaults.',
  },
  {
    slug: 'takoradi',
    label: 'Takoradi',
    longLabel: 'Takoradi, Ghana',
    country: 'Ghana',
    countryCode: 'GH',
    kind: 'city',
    currency: 'GHS',
    localContext:
      'Takoradi\'s economy leans on the port and the oil sector, and the sites we build there are frequently B2B — logistics, engineering services, industrial supply. That means a content model that carries technical detail cleanly, a lead-capture flow set up for long-cycle enquiries, and language that reads correctly to a specification manager as well as to a marketing director.',
    faqAnswer:
      'Yes. We work with Takoradi-based industrial and B2B businesses, including those tied to the port and oil sectors.',
  },

  /* --- South Africa: country + Johannesburg, Cape Town, Durban ----- */
  {
    slug: 'south-africa',
    label: 'South Africa',
    longLabel: 'South Africa',
    country: 'South Africa',
    countryCode: 'ZA',
    kind: 'country',
    currency: 'ZAR',
    localContext:
      'South African builds have to survive load-shedding on the operator side as well as the customer side — background workers idempotent, admin sessions that come back cleanly after a two-hour outage, notifications queued rather than fired-and-lost. PoPIA compliance is scoped in from day one; payment rails default to Peach, PayFast or Stripe depending on which fits the client\'s existing setup.',
    faqAnswer:
      'Yes. We work with South African clients across the country. Load-shedding and PoPIA are treated as build-time inputs, not launch-day surprises.',
  },
  {
    slug: 'johannesburg',
    label: 'Johannesburg',
    longLabel: 'Johannesburg, South Africa',
    country: 'South Africa',
    countryCode: 'ZA',
    kind: 'city',
    currency: 'ZAR',
    localContext:
      'Johannesburg work tilts towards financial services, insurance and the enterprise side of retail — organisations with existing systems, procurement teams, and an internal IT function that already has strong views on hosting. We work with that reality: integrations rather than replacements, security review baked into delivery, and documentation the internal team can read without our help six months later.',
    faqAnswer:
      'Yes. Johannesburg-based enterprise and financial-services clients work with us on integration-heavy builds.',
  },
  {
    slug: 'cape-town',
    label: 'Cape Town',
    longLabel: 'Cape Town, South Africa',
    country: 'South Africa',
    countryCode: 'ZA',
    kind: 'city',
    currency: 'ZAR',
    localContext:
      'Cape Town\'s mix — startups, tourism, creative agencies — shapes what a good build looks like there. Sites need to work for an international audience as often as a domestic one, run cleanly on modest mobile networks in Khayelitsha as reliably as they do on fibre in Sea Point, and handle both local and international payment methods without making the visitor pick between them.',
    faqAnswer:
      'Yes. We work with Cape Town startups, tourism operators and creative agencies. Multi-audience, multi-network builds are standard.',
  },
  {
    slug: 'durban',
    label: 'Durban',
    longLabel: 'Durban, South Africa',
    country: 'South Africa',
    countryCode: 'ZA',
    kind: 'city',
    currency: 'ZAR',
    localContext:
      'Durban work often has a port, logistics or retail tilt — businesses whose operations are the point and whose website is the calmer face of a much noisier back office. We build the site the customer sees and, where it helps, the internal tool the operations team uses, treating them as one system so a change in one is not a surprise in the other.',
    faqAnswer:
      'Yes. Durban-based logistics, retail and port-adjacent clients work with us on both public sites and internal tooling.',
  },
] as const

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
