import { PHOTOS, type Photo } from '@v2/content/photos'
/**
 * WildHands Insights, and the rich-text shape every long page on the site
 * shares (insights, case studies, the legal pages).
 *
 * Each post is a published article from the main site's
 * `src/content/insights/**`, word for word, with its frequently asked
 * questions at the foot. Drafts and entries still marked `placeholder` are
 * left out, as they are on the main site. Keep `BlogPost`'s original fields
 * and `latestPosts()`: the home page's latest posts row reads them.
 */

/* ── rich text ────────────────────────────────────────────────────── */

/** A run of text inside a paragraph or list item. */
export interface RichSpan {
  text: string
  /** Internal paths go through SmartLink; `mailto:` and `https:` open as plain links. */
  href?: string
  strong?: boolean
  code?: boolean
}

/** Plain text, or a mix of plain text and styled runs. */
export type RichText = string | (string | RichSpan)[]

export type RichBlock =
  | { type: 'h2'; text: string }
  | { type: 'h3'; text: string }
  | { type: 'p'; text: RichText }
  | { type: 'ul'; items: RichText[] }
  | { type: 'ol'; items: RichText[] }
  | { type: 'quote'; text: string }
  | { type: 'code'; language: string; code: string }
  | { type: 'table'; caption: string; head: string[]; rows: string[][] }

/* ── authors and categories ───────────────────────────────────────── */

export interface Author {
  name: string
  role: string
}

export type BlogCategorySlug = 'websites' | 'apps' | 'tools-and-systems' | 'pricing'

export interface BlogCategory {
  slug: BlogCategorySlug
  /** On a card or an article, for one post. */
  label: string
  /** On the filter tab. */
  tab: string
}

/**
 * The insight categories with published articles. Websites is labelled as on
 * the main site (INSIGHT_CATEGORY_LABELS); Apps, Tools & Systems and Pricing
 * follow the v2 service names. Each one gets a /blog/category/<slug> page.
 */
export const BLOG_CATEGORIES: BlogCategory[] = [
  { slug: 'websites', label: 'Websites', tab: 'Websites' },
  { slug: 'apps', label: 'Apps', tab: 'Apps' },
  { slug: 'tools-and-systems', label: 'Tools & Systems', tab: 'Tools & Systems' },
  { slug: 'pricing', label: 'Pricing', tab: 'Pricing' },
]

export function categoryBySlug(slug: string): BlogCategory | undefined {
  return BLOG_CATEGORIES.find((category) => category.slug === slug)
}

export function categoryByLabel(label: string): BlogCategory | undefined {
  return BLOG_CATEGORIES.find((category) => category.label === label)
}

/* ── posts ────────────────────────────────────────────────────────── */

export interface BlogPost {
  /** Pexels photo shown on the post's cards and as its banner (content/photos.ts). */
  photo: Photo
  slug: string
  title: string
  /** ISO date, e.g. "2026-11-01". */
  date: string
  /** Category labels from BLOG_CATEGORIES, e.g. "Websites". */
  categories: string[]
  excerpt: string
  /** "story" posts get the plain card with a wordmark instead of art. None use it yet. */
  kind: 'article' | 'story'
  /** The name a story is about, shown as a text wordmark. */
  wordmark?: string
  author: Author
  body: RichBlock[]
}

const WILDHANDS: Author = { name: 'WildHands', role: 'Studio' }

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'choose-web-development-agency-lagos',
    photo: PHOTOS.insightAgencyLagos,
    title: 'How to Choose a Web Development Agency in Lagos',
    date: '2026-09-07',
    categories: ['Websites'],
    excerpt:
      'What to check before hiring a web development agency in Lagos, from portfolio and process to ownership and aftercare.',
    kind: 'article',
    author: WILDHANDS,
    body: [
      {
        type: 'p',
        text: "Picking the wrong agency costs more than the invoice. It costs the months spent waiting for a launch that never quite happens, and the second project you need just to fix the first one. Here's what to check before you sign anything.",
      },
      {
        type: 'h2',
        text: 'Look at their actual portfolio',
      },
      {
        type: 'p',
        text: 'Ask for live sites, not mockups or screenshots. Open them on your own phone. Click around. A polished screenshot tells you almost nothing about how the finished site actually feels to use, or how fast it loads on a real connection.',
      },
      {
        type: 'h2',
        text: 'Ask about their process',
      },
      {
        type: 'p',
        text: 'Do they start by understanding your business and your customers, or do they open Figma on day one? An agency that jumps straight to design without asking what problem the site is actually solving tends to produce something that looks fine and does very little. A short discovery conversation before any design work starts is a good sign, not a delay.',
      },
      {
        type: 'h2',
        text: 'Check how they communicate',
      },
      {
        type: 'p',
        text: 'Ask directly: how will I get updates, and how often? A vague answer here usually means radio silence for weeks once the project is underway, followed by a rushed version right before the deadline. A clear cadence, even a simple weekly update, is worth more than a slicker pitch deck.',
      },
      {
        type: 'h2',
        text: "Understand exactly what's included",
      },
      {
        type: 'p',
        text: 'Get this in writing before you pay anything:',
      },
      {
        type: 'ul',
        items: [
          'Is hosting setup included, or a separate cost?',
          'How many rounds of revisions are covered?',
          'Is there support after launch, and for how long?',
          'What happens if you need a small change three months from now: is that free, or billed separately?',
          'Does the site come with a CMS so you can edit it yourself, and is basic technical SEO (sitemap, crawl rules) included or a separate line item?',
        ],
      },
      {
        type: 'p',
        text: "An agency that's vague about any of these is telling you something about how the rest of the project will go. We build all of this in by default: every WildHands project ships with a CMS, an XML sitemap, and crawl rules set up correctly, not sold back to you later.",
      },
      {
        type: 'h2',
        text: 'Local knowledge is a real advantage, not a nice-to-have',
      },
      {
        type: 'p',
        text: "An agency based in Lagos, working with Nigerian businesses regularly, already knows things a foreign or inexperienced developer has to learn the hard way: which payment gateways actually work reliably here, how to build for real mobile data conditions rather than fast fibre, and what local customers expect to see before they trust a business online. Ask directly whether they've handled Paystack or Flutterwave integration before, and ask to see it live on a site they've shipped.",
      },
      {
        type: 'h2',
        text: 'Ask about ownership',
      },
      {
        type: 'p',
        text: "Do you own the code and design files once the project is paid for, or are you locked into that agency for every future change? This should be a simple, direct answer. If it isn't, that's worth pressing on before you commit.",
      },
      {
        type: 'h2',
        text: 'Red flags worth taking seriously',
      },
      {
        type: 'ul',
        items: [
          'No written contract or scope document, just a verbal agreement.',
          'A quote with no detail behind it, just a single number.',
          'A timeline that sounds too fast for the scope described.',
          'No mention of what happens after launch, as if support ends the moment the site goes live.',
        ],
      },
      {
        type: 'p',
        text: "None of these are automatically disqualifying on their own. Together, they're a pattern worth asking harder questions about.",
      },
      {
        type: 'h2',
        text: 'What a good process actually looks like',
      },
      {
        type: 'p',
        text: "A conversation about your business before any design work starts. A clear, itemised quote. Regular updates you don't have to chase. A finished site that works properly on the phone in your own hand, not just in a demo. And a straight answer about what happens if something breaks six months from now.",
      },
      {
        type: 'p',
        text: "At WildHands, that process runs in five stages: a scaffold you approve before we build anything further, the full site build, the CMS and admin panel once the site itself is signed off, a final round of security checks and fine-tuning, then handover. You know what's happening at every stage, because you've already approved the one before it.",
      },
      {
        type: 'p',
        text: [
          "That's the standard to hold any agency to, including us. ",
          {
            text: 'Talk to WildHands',
            href: '/contact',
          },
          ' about your project and see how we handle it.',
        ],
      },
      {
        type: 'h2',
        text: 'Frequently asked questions',
      },
      {
        type: 'h3',
        text: 'How long should a website project take in Lagos?',
      },
      {
        type: 'p',
        text: 'A simple site typically runs two to six weeks depending on scope. Anything quoted at a few days for a full business site is either very small in scope or cutting corners somewhere.',
      },
      {
        type: 'h3',
        text: 'Should I choose a freelancer or an agency?',
      },
      {
        type: 'p',
        text: "A freelancer can work well for a small, well-defined project and a tight budget. An agency generally offers more reliability for anything with real complexity, since the project isn't dependent on one person's availability, and there's usually a proper process behind it rather than an individual working solo.",
      },
    ],
  },
  {
    slug: 'ecommerce-development-cost-nigeria',
    photo: PHOTOS.insightEcommerceCost,
    title: 'How Much Does E-commerce Development Cost in Nigeria?',
    date: '2026-09-07',
    categories: ['Websites'],
    excerpt:
      'What actually drives the cost of an e-commerce site in Nigeria, from platform choice to payment integration and delivery logistics.',
    kind: 'article',
    author: WILDHANDS,
    body: [
      {
        type: 'p',
        text: 'E-commerce costs more to build than a standard business website, and the range between projects is wider too. A ten-product store and a full multi-vendor marketplace are both "online stores," but they\'re not close to the same job. Here\'s what actually moves the price.',
      },
      {
        type: 'h2',
        text: 'What drives e-commerce cost',
      },
      {
        type: 'p',
        text: [
          {
            text: 'Platform choice.',
            strong: true,
          },
          " An off-the-shelf platform like Shopify or WooCommerce gets you a working store faster, with built-in features you'd otherwise have to build. A fully custom platform costs more and takes longer, but gives you complete control over features and how the business scales.",
        ],
      },
      {
        type: 'p',
        text: [
          {
            text: 'Catalog size and complexity.',
            strong: true,
          },
          ' Ten products in one category is simple. Five hundred products across variants, sizes, and colours needs a more thought-out admin system and product structure.',
        ],
      },
      {
        type: 'p',
        text: [
          {
            text: 'Payment integration.',
            strong: true,
          },
          " This isn't optional in Nigeria, and it isn't one gateway. Card payments, bank transfer, and USSD all need to work reliably, usually through Paystack or Flutterwave, and each payment method needs to be tested properly, not just switched on. On our own builds, this extends past checkout too: quotes and invoices that clients can pay directly through Paystack, so payment doesn't sit as a separate manual step outside the site.",
        ],
      },
      {
        type: 'p',
        text: [
          {
            text: 'Inventory management.',
            strong: true,
          },
          ' Do you need stock levels tracked automatically, or are you updating manually? Automatic stock tracking that syncs with orders is more development work than a simple product list.',
        ],
      },
      {
        type: 'p',
        text: [
          {
            text: 'Delivery and logistics.',
            strong: true,
          },
          " Calculating delivery cost by zone, integrating a courier's API, or just listing flat delivery rates: each is a different level of complexity, and delivery in Nigeria rarely fits a single flat-rate assumption the way it might elsewhere.",
        ],
      },
      {
        type: 'p',
        text: [
          {
            text: 'Admin dashboard.',
            strong: true,
          },
          ' How much do you need to see and control from the backend? Order status, customer messages, discount codes, reporting: the more control you want, the more there is to build.',
        ],
      },
      {
        type: 'p',
        text: [
          {
            text: 'Mobile checkout.',
            strong: true,
          },
          " Most online shopping in Nigeria happens on a phone. A checkout flow that's smooth on mobile, not just functional, takes real design attention, not a default template.",
        ],
      },
      {
        type: 'h2',
        text: 'Off-the-shelf vs custom',
      },
      {
        type: 'p',
        text: "An off-the-shelf platform is the right call for most businesses starting out. It's faster to launch, cheaper up front, and covers the features most stores actually need.",
      },
      {
        type: 'p',
        text: "Custom development becomes worth it once your business has specific needs a template genuinely can't handle: a particular checkout flow, a complex product configurator, tight integration with your own inventory or accounting system. Building custom before you've proven you need it usually means paying for flexibility you haven't used yet.",
      },
      {
        type: 'h2',
        text: 'What makes Nigerian e-commerce different',
      },
      {
        type: 'p',
        text: [
          {
            text: 'Multiple payment methods, not one.',
            strong: true,
          },
          ' Cards alone will lose you customers. Bank transfer and USSD need to work just as reliably.',
        ],
      },
      {
        type: 'p',
        text: [
          {
            text: 'Delivery zones matter more.',
            strong: true,
          },
          " Flat-rate shipping that works in a smaller country often breaks down across Nigeria's actual delivery reality, where cost and time vary a lot by state and by courier coverage.",
        ],
      },
      {
        type: 'p',
        text: [
          {
            text: 'Low-bandwidth performance.',
            strong: true,
          },
          ' A slow product page loses a sale before the customer even sees the price. Image optimisation and page speed matter more here than in markets with consistently fast connections.',
        ],
      },
      {
        type: 'p',
        text: [
          {
            text: 'WhatsApp as a fallback channel.',
            strong: true,
          },
          ' A lot of Nigerian shoppers still want to confirm an order or ask a question over WhatsApp before or after checking out online. Building that into the flow, rather than fighting against it, tends to convert better than ignoring it.',
        ],
      },
      {
        type: 'h2',
        text: 'Costs that continue after launch',
      },
      {
        type: 'ul',
        items: [
          [
            {
              text: 'Transaction fees',
              strong: true,
            },
            ', charged per sale by your payment provider.',
          ],
          [
            {
              text: 'Hosting',
              strong: true,
            },
            ', scaled to your traffic and catalog size.',
          ],
          [
            {
              text: 'Maintenance',
              strong: true,
            },
            ', for security and platform updates.',
          ],
          [
            {
              text: 'Catalog upkeep',
              strong: true,
            },
            ', adding products, updating stock, running promotions.',
          ],
        ],
      },
      {
        type: 'h2',
        text: 'Questions to ask before committing',
      },
      {
        type: 'ul',
        items: [
          'Which payment methods are included, and has bank transfer specifically been tested?',
          'How is delivery cost calculated, and can it handle different zones?',
          'What happens to my store if the platform changes its pricing or shuts down a feature I depend on?',
          'Is the admin dashboard something I can actually use day to day, or does every change need a developer?',
        ],
      },
      {
        type: 'p',
        text: "Every WildHands build includes a dashboard built for the person actually running the business day to day, not just the developer who built it, so managing orders, quotes, or invoices doesn't require calling us for routine work.",
      },
      {
        type: 'p',
        text: [
          'Building or fixing an online store? ',
          {
            text: 'Talk to WildHands',
            href: '/contact',
          },
          ' about what your catalog and customers actually need.',
        ],
      },
      {
        type: 'h2',
        text: 'Frequently asked questions',
      },
      {
        type: 'h3',
        text: 'Is Shopify good enough for Nigerian businesses?',
      },
      {
        type: 'p',
        text: "For a lot of them, yes, especially once local payment gateways are integrated properly. It's a strong starting point for most stores under a few hundred products.",
      },
      {
        type: 'h3',
        text: 'Do I need a custom e-commerce platform?',
      },
      {
        type: 'p',
        text: "Only once you've hit a specific limitation an off-the-shelf platform can't solve, like a checkout flow or inventory system genuinely unique to how your business operates. Most stores don't need custom until they've outgrown the standard options.",
      },
    ],
  },
  {
    slug: 'nigerian-business-website-checklist',
    photo: PHOTOS.insightWebsiteChecklist,
    title: 'What Should a Nigerian Business Website Include?',
    date: '2026-09-07',
    categories: ['Websites'],
    excerpt:
      'A practical checklist of what every Nigerian business website needs, from essential pages to local payment and trust signals.',
    kind: 'article',
    author: WILDHANDS,
    body: [
      {
        type: 'p',
        text: "Here's the checklist, then the reasoning behind each item.",
      },
      {
        type: 'h2',
        text: 'Essential pages',
      },
      {
        type: 'ul',
        items: [
          [
            {
              text: 'Home',
              strong: true,
            },
            ', stating what you do and for whom, immediately.',
          ],
          [
            {
              text: 'About',
              strong: true,
            },
            ", who's behind the business and why it exists.",
          ],
          [
            {
              text: 'Services or products',
              strong: true,
            },
            ', specific enough that a visitor can act on it.',
          ],
          [
            {
              text: 'Contact',
              strong: true,
            },
            ', with a real phone number and location, not just a form.',
          ],
          [
            {
              text: 'Testimonials or social proof',
              strong: true,
            },
            ', from real clients wherever you can get permission to name them.',
          ],
          [
            {
              text: 'A CMS admin panel',
              strong: true,
            },
            ', so you can add a project or update a page yourself without waiting on a developer. This should come as standard, not an upsell.',
          ],
        ],
      },
      {
        type: 'h2',
        text: 'Trust signals',
      },
      {
        type: 'ul',
        items: [
          'A physical address or clearly stated service area.',
          "A phone number that's actually answered.",
          'Real photos of your team, premises, or work, not stock imagery.',
          'A secure connection (https), which most hosting providers set up by default now but is still worth checking.',
          "Business registration details, if that's relevant to how your industry builds trust.",
        ],
      },
      {
        type: 'p',
        text: 'These matter more than they might seem to. A site with no address, no real photos, and a contact form as the only way to reach anyone reads as unreachable, even if the business behind it is completely legitimate.',
      },
      {
        type: 'h2',
        text: 'Local payment options',
      },
      {
        type: 'p',
        text: 'If you sell anything, Paystack or Flutterwave checkout should be visibly working, not buried behind an extra click. Bank transfer as an option matters too: plenty of Nigerian customers still prefer it over cards, and a store that only accepts cards is quietly losing sales it never sees.',
      },
      {
        type: 'h2',
        text: 'Mobile optimisation and speed',
      },
      {
        type: 'p',
        text: "Most visits to a Nigerian business site come from a phone, often on mobile data rather than WiFi. Test your site on an actual phone, on an actual mobile connection, not just in a desktop browser's mobile preview. A page that looks fine in a preview can still load painfully slowly in the real conditions your customers are browsing under.",
      },
      {
        type: 'h2',
        text: 'SEO basics',
      },
      {
        type: 'ul',
        items: [
          'Your city or service area mentioned in page titles and content, not just implied.',
          'A Google Business Profile set up and linked, especially if you have a physical location or serve a specific area.',
          'LocalBusiness schema markup, which helps Google understand where you actually operate.',
          'An XML sitemap and correct crawl rules, so search engines can actually index the site properly.',
          "Basic setup for AI search visibility. More buyers now ask ChatGPT or Perplexity for recommendations before they open Google, and most business sites aren't structured to be picked up by either.",
        ],
      },
      {
        type: 'p',
        text: "A site that never mentions where it's based struggles to rank for local searches, no matter how good the content is. Every WildHands build includes the technical items on this list by default, not as a separate line item.",
      },
      {
        type: 'h2',
        text: 'Clear calls to action',
      },
      {
        type: 'p',
        text: 'Every page should make the next step obvious: call, message, buy, book. A visitor who has to hunt for what to do next usually just leaves instead.',
      },
      {
        type: 'h2',
        text: 'Analytics',
      },
      {
        type: 'p',
        text: "Set up basic analytics from day one, not after you've already wondered for six months whether the site is working. You can't improve what you're not measuring, and waiting to add tracking means losing months of data you'll never get back.",
      },
      {
        type: 'h2',
        text: 'What most sites are missing',
      },
      {
        type: 'p',
        text: "The pattern we see most often isn't bad design. It's a site with no location mentioned anywhere, a contact form as the only way in, and no local payment method visible. Individually small, together they add up to a site that looks fine and quietly underperforms.",
      },
      {
        type: 'h2',
        text: 'Frequently asked questions',
      },
      {
        type: 'h3',
        text: 'Do I need a blog on my business website?',
      },
      {
        type: 'p',
        text: 'Not essential, but useful. A blog gives you a reason to keep publishing, and each post is another way to be found in search. Skip it if you will not keep it updated; an abandoned blog looks worse than no blog at all.',
      },
      {
        type: 'h3',
        text: 'Should I list prices on my site?',
      },
      {
        type: 'p',
        text: 'If your pricing is straightforward, yes, since it saves you and potential customers time. If pricing genuinely varies project to project, a clear "get a quote" path works better than vague, unhelpful ranges.',
      },
    ],
  },
  {
    slug: 'website-cost-nigeria',
    photo: PHOTOS.insightWebsiteCost,
    title: 'How Much Does a Website Cost in Nigeria?',
    date: '2026-09-07',
    categories: ['Websites'],
    excerpt:
      'A real answer to what drives website cost in Nigeria, the three main scope tiers, and what to check before you accept a quote.',
    kind: 'article',
    author: WILDHANDS,
    body: [
      {
        type: 'p',
        text: 'There\'s no single figure that answers this honestly. A five-page brochure site and a custom booking platform are both "websites," and pricing them the same way would be dishonest. What you can get is a clear picture of what actually drives the cost, so you can judge a quote when one lands in your inbox.',
      },
      {
        type: 'h2',
        text: 'What actually drives the price',
      },
      {
        type: 'p',
        text: [
          {
            text: 'Number of pages and content.',
            strong: true,
          },
          ' A homepage, about page, and contact page is a small job. Ten service pages, a blog, and a portfolio gallery is a bigger one.',
        ],
      },
      {
        type: 'p',
        text: [
          {
            text: 'Custom design vs a template.',
            strong: true,
          },
          ' A template gets you online faster and cheaper. A custom design is built around your brand, your content, and how your customers actually browse, which takes more design and build time.',
        ],
      },
      {
        type: 'p',
        text: [
          {
            text: 'A content management system.',
            strong: true,
          },
          " If you want to edit pages, add blog posts, or update prices yourself, the site needs a CMS built in. That's more development work than a static site nobody but the developer can touch.",
        ],
      },
      {
        type: 'p',
        text: [
          {
            text: 'Payment and third-party integrations.',
            strong: true,
          },
          ' Paystack or Flutterwave checkout, a booking calendar, a newsletter signup, a CRM connection: each one adds scope.',
        ],
      },
      {
        type: 'p',
        text: [
          {
            text: 'Copy and photography.',
            strong: true,
          },
          " If you're supplying finished content, that's less work for the agency. If they're writing your copy and sourcing or shooting photography, that's a separate cost most quotes should show as its own line.",
        ],
      },
      {
        type: 'p',
        text: [
          {
            text: 'Timeline.',
            strong: true,
          },
          ' A rushed launch usually costs more, because it means paying for concentrated hours instead of hours spread across a normal schedule.',
        ],
      },
      {
        type: 'h2',
        text: 'Three broad scope tiers',
      },
      {
        type: 'p',
        text: [
          {
            text: 'A simple site.',
            strong: true,
          },
          " A handful of pages, no CMS, no payment processing. Right for a business that needs a professional web presence and doesn't update it often.",
        ],
      },
      {
        type: 'p',
        text: [
          {
            text: 'A full business site.',
            strong: true,
          },
          ' Multiple pages, a CMS so you can update content yourself, contact forms, maybe a blog. Right for most Nigerian businesses that want to keep the site current without calling a developer every time.',
        ],
      },
      {
        type: 'p',
        text: [
          {
            text: 'A custom platform or web app.',
            strong: true,
          },
          ' User accounts, dashboards, e-commerce, or anything with real logic behind it. This is a different scale of project, closer to software development than website design. (More on that distinction in ',
          {
            text: 'Website vs Web App: What Does Your Business Need?',
            href: '/blog/website-vs-web-app',
          },
          '.)',
        ],
      },
      {
        type: 'h2',
        text: "Costs that don't end at launch",
      },
      {
        type: 'p',
        text: "A website isn't a one-time purchase. Budget for:",
      },
      {
        type: 'ul',
        items: [
          [
            {
              text: 'Hosting',
              strong: true,
            },
            ', paid monthly or annually.',
          ],
          [
            {
              text: 'Domain renewal',
              strong: true,
            },
            ', usually annual.',
          ],
          [
            {
              text: 'Maintenance',
              strong: true,
            },
            ', for security updates and fixing anything that breaks.',
          ],
          [
            {
              text: 'Content updates',
              strong: true,
            },
            ', either your own time or a retainer with your developer.',
          ],
        ],
      },
      {
        type: 'p',
        text: "An agency that only quotes the build and says nothing about what happens after launch hasn't given you the full picture.",
      },
      {
        type: 'h2',
        text: 'What to ask before you accept a quote',
      },
      {
        type: 'ul',
        items: [
          'Does this include hosting setup, or just the build?',
          'How many rounds of revisions are included?',
          'Is the site mobile-optimised, and has that been tested on an actual phone, not just a browser preview?',
          'Is basic SEO included, or is that a separate line item?',
          'What happens if I need a small content change six months from now?',
        ],
      },
      {
        type: 'p',
        text: 'A vague answer to any of these is worth pushing on before you sign anything.',
      },
      {
        type: 'h2',
        text: 'The Nigeria-specific factors',
      },
      {
        type: 'p',
        text: "Two things push cost in ways that don't show up in a generic pricing guide written for a different market. First, performance: a site that loads fine on fast fibre in another country can be painfully slow on the mobile data most people in Nigeria are actually browsing on, and building for that from the start takes more care, not less. Second, payment: if you're selling anything, you need local gateways like Paystack or Flutterwave properly integrated, not bolted on as an afterthought.",
      },
      {
        type: 'h2',
        text: 'What comes as standard in a WildHands build',
      },
      {
        type: 'p',
        text: "Every site we build is custom, not a template, with a CMS included so you can edit pages, add projects, or update content yourself without calling us for every small change. Technical SEO is built in from the start rather than sold as an add-on: an XML sitemap, proper crawl rules, and increasingly, setup for AI search visibility, so the site is positioned to be found whether someone's searching on Google or asking ChatGPT.",
      },
      {
        type: 'p',
        text: 'For businesses that need more than a marketing site, that same build can extend into a client dashboard, an invoice or quote generator with Paystack built in, and basic analytics, so the site does actual work for the business instead of just sitting there.',
      },
      {
        type: 'p',
        text: [
          'Want a quote built around your actual scope instead of a guess? ',
          {
            text: 'Get in touch with WildHands',
            href: '/contact',
          },
          " and tell us what you're trying to build.",
        ],
      },
      {
        type: 'h2',
        text: 'Frequently asked questions',
      },
      {
        type: 'h3',
        text: 'Why do website prices vary so much between agencies?',
      },
      {
        type: 'p',
        text: 'Scope, not just skill. Two agencies quoting wildly different prices for "a website" are often quoting different amounts of actual work. Always compare what is included, not just the number.',
      },
      {
        type: 'h3',
        text: 'Is a cheap website worth it?',
      },
      {
        type: 'p',
        text: 'Sometimes. A simple template site from a low-cost provider can be the right call if your needs are simple. It stops being worth it if it cannot be updated, breaks on mobile, or needs to be rebuilt within a year.',
      },
      {
        type: 'h3',
        text: 'How long does a website take to build in Nigeria?',
      },
      {
        type: 'p',
        text: 'A simple site can take two to three weeks. A full business site with a CMS is closer to four to six weeks. A custom platform can run several months, depending on complexity.',
      },
    ],
  },
  {
    slug: 'website-structure-nigerian-businesses',
    photo: PHOTOS.insightWebsiteStructure,
    title: 'Best Website Structure for Nigerian Businesses',
    date: '2026-09-07',
    categories: ['Websites'],
    excerpt:
      'How to structure a business website for Nigerian customers: essential pages, mobile-first design, trust signals, and local payment integration.',
    kind: 'article',
    author: WILDHANDS,
    body: [
      {
        type: 'p',
        text: "A well-designed site with confusing structure still loses customers. People land on a page, can't find what they need in a few taps, and leave. Structure decides whether your design ever gets seen properly.",
      },
      {
        type: 'h2',
        text: 'The pages every business site needs',
      },
      {
        type: 'p',
        text: [
          {
            text: 'Home.',
            strong: true,
          },
          ' States what you do and for whom, in the first few seconds. This is where most first-time visitors land, so it needs to work as a summary of the whole site, not just a hero image.',
        ],
      },
      {
        type: 'p',
        text: [
          {
            text: 'About.',
            strong: true,
          },
          " Who's behind the business and why it exists. This page matters more than it looks: it's also where Google checks for trust and location signals.",
        ],
      },
      {
        type: 'p',
        text: [
          {
            text: 'Services or products.',
            strong: true,
          },
          ' Specific, not vague. "What we do" pages that list three abstract categories tell a visitor nothing they can act on.',
        ],
      },
      {
        type: 'p',
        text: [
          {
            text: 'Contact.',
            strong: true,
          },
          " A real phone number and physical location, not just a form. A form alone reads as a business that's hard to reach.",
        ],
      },
      {
        type: 'p',
        text: [
          {
            text: 'Blog',
            strong: true,
          },
          ' (optional, but useful). Gives you a reason to keep publishing, and each post is a new way to be found in search.',
        ],
      },
      {
        type: 'p',
        text: "Behind these pages, a proper build gives you a CMS admin panel, so you can add a new project or update a page yourself instead of emailing a developer every time something changes. Every site we build at WildHands includes this by default, along with an XML sitemap and crawl rules set up correctly so search engines can actually find and index the structure you've built.",
      },
      {
        type: 'h2',
        text: "Navigation that doesn't make people think",
      },
      {
        type: 'p',
        text: "Keep the main navigation to five or six items. If you're tempted to nest a submenu three levels deep, that's usually a sign the site needs fewer, better-organised sections rather than more structure to hold everything.",
      },
      {
        type: 'p',
        text: "Every page should be reachable in three clicks or fewer from the homepage. If a customer has to hunt for your pricing or your contact details, they'll assume you're hard to reach and go elsewhere.",
      },
      {
        type: 'h2',
        text: 'Design for mobile first, not as an afterthought',
      },
      {
        type: 'p',
        text: 'Most traffic to a Nigerian business site comes from phones, often on mobile data rather than WiFi. That changes the priorities:',
      },
      {
        type: 'ul',
        items: [
          'Keep image file sizes small. A beautiful hero photo that takes six seconds to load on 3G costs you visitors before they see anything.',
          'Put the most important information first, since people scroll less on mobile than they think they do.',
          'Make buttons and links big enough to tap accurately with a thumb.',
        ],
      },
      {
        type: 'p',
        text: 'Design for the phone first, then adapt up to desktop. Doing it the other way around usually produces a mobile version that feels like an afterthought, because it is one.',
      },
      {
        type: 'h2',
        text: 'Trust signals that matter locally',
      },
      {
        type: 'ul',
        items: [
          'A real address or service area, not just "Nigeria."',
          "A phone number, ideally one that's actually answered.",
          'A WhatsApp link. For a lot of Nigerian customers, WhatsApp is the real contact channel, and a contact form is just the formality Google expects to see.',
          'Genuine photos of your team, premises, or product, not generic stock imagery.',
          'Testimonials from real, named clients where you can get permission to use them.',
        ],
      },
      {
        type: 'h2',
        text: 'Payment and contact, built in properly',
      },
      {
        type: 'p',
        text: 'If you sell online, Paystack or Flutterwave checkout should be visible and working, not an afterthought bolted onto a template. If most of your enquiries start on WhatsApp anyway, put a WhatsApp button somewhere persistent, not buried at the bottom of a contact page.',
      },
      {
        type: 'h2',
        text: 'Structural mistakes that quietly cost you customers',
      },
      {
        type: 'ul',
        items: [
          'No clear next step on the homepage. Every page should make it obvious what to do next: call, message, buy, book.',
          'Contact information hidden in a footer nobody scrolls to.',
          'Heavy, unoptimised images slowing every page down.',
          'No mention of location anywhere on the site, which makes it harder for Google to show you in local search results at all.',
        ],
      },
      {
        type: 'p',
        text: [
          'Want your site structured around how Nigerian customers actually browse? ',
          {
            text: 'Talk to WildHands',
            href: '/contact',
          },
          ' about your project.',
        ],
      },
      {
        type: 'h2',
        text: 'Frequently asked questions',
      },
      {
        type: 'h3',
        text: 'How many pages should a business website have?',
      },
      {
        type: 'p',
        text: 'Enough to cover what you actually do, and no more. Most small and mid-sized businesses need five to eight core pages. Adding pages for the sake of it dilutes the site rather than strengthening it.',
      },
      {
        type: 'h3',
        text: 'Should WhatsApp replace a contact form?',
      },
      {
        type: 'p',
        text: 'Not replace, but sit alongside it. Some visitors prefer a form, especially for a formal enquiry. Offer both and let people choose.',
      },
    ],
  },
  {
    slug: 'website-vs-web-app',
    photo: PHOTOS.insightWebsiteVsApp,
    title: 'Website vs Web App: What Does Your Business Need?',
    date: '2026-09-07',
    categories: ['Websites'],
    excerpt:
      'A clear way to decide whether your business needs a website or a web app, with real examples and what each one costs to build and maintain.',
    kind: 'article',
    author: WILDHANDS,
    body: [
      {
        type: 'p',
        text: "A website presents information. A web app lets someone do something. That's the real distinction, and most confusion about which one a business needs comes from skipping past it.",
      },
      {
        type: 'h2',
        text: 'What a website is',
      },
      {
        type: 'p',
        text: "A website is mostly static content: pages that tell visitors who you are, what you offer, and how to reach you. Visitors browse anonymously. Content is the same for everyone who lands on it. A restaurant's menu page, a consultancy's services pages, a portfolio: these are websites, however polished they are.",
      },
      {
        type: 'h2',
        text: 'What a web app is',
      },
      {
        type: 'p',
        text: "A web app is interactive. Users log in, the app stores and acts on their data, and it does something a static page can't: books an appointment, tracks an order, generates a report, manages inventory. Content and function often differ from one logged-in user to the next.",
      },
      {
        type: 'h2',
        text: 'The questions that settle it',
      },
      {
        type: 'ul',
        items: [
          [
            {
              text: 'Does a visitor need to log in to get value from it?',
              strong: true,
            },
            " If yes, you're looking at a web app.",
          ],
          [
            {
              text: 'Does the business need to store data specific to each user?',
              strong: true,
            },
            ' Order history, saved preferences, account balances: all signs you need an app.',
          ],
          [
            {
              text: 'Is there a repeatable action a user performs, again and again?',
              strong: true,
            },
            " Booking a table, tracking a delivery, reordering stock. A website can list your services; it can't let someone manage an ongoing relationship with your business.",
          ],
          [
            {
              text: "Does the content change based on who's viewing it?",
              strong: true,
            },
            ' A dashboard showing one client their own invoices is fundamentally different from a page showing the same services list to everyone.',
          ],
        ],
      },
      {
        type: 'p',
        text: 'If you answered no to all of these, a website covers it. If you answered yes to any of them, you need a web app, or a website with an app-like feature built in.',
      },
      {
        type: 'h2',
        text: 'Real examples',
      },
      {
        type: 'p',
        text: 'A restaurant showcasing its menu and location needs a website. A logistics company letting customers track a delivery in real time needs a web app.',
      },
      {
        type: 'p',
        text: 'A real estate agency listing available properties can run on a website, possibly with a search filter. A property management company handling tenant payments and maintenance requests needs a web app, because tenants are logging in to manage something specific to their account.',
      },
      {
        type: 'p',
        text: 'A consultancy presenting its services and case studies needs a website. A fintech letting users check a balance and move money needs a web app, no question.',
      },
      {
        type: 'p',
        text: "We've built this exact hybrid for a service agency: a public-facing website to show off their portfolio and bring in leads, plus a client dashboard behind a login where their own clients can view quotes, pay invoices through Paystack, and track project status. The public side stays a simple, fast website. The parts that need accounts and data get proper app treatment. That split, rather than forcing everything into one or the other, is usually the right call.",
      },
      {
        type: 'h2',
        text: 'Where e-commerce sits',
      },
      {
        type: 'p',
        text: [
          'E-commerce is the case that confuses people most, because it has features of both. Product pages are essentially a website: static content anyone can browse. But checkout, accounts, and order tracking are app-like functionality layered on top. Most e-commerce sites are built as websites with an app-like commerce layer built in, rather than as full custom apps from the ground up. For more on what that costs, see ',
          {
            text: 'How Much Does E-commerce Development Cost in Nigeria?',
            href: '/blog/ecommerce-development-cost-nigeria',
          },
        ],
      },
      {
        type: 'h2',
        text: 'What this means for cost and timeline',
      },
      {
        type: 'p',
        text: 'A website is usually the faster, cheaper build. Content, design, and launch, done. A web app takes longer, because it needs a database, user authentication, and testing across the actual logic of what users can do, not just how pages look.',
      },
      {
        type: 'p',
        text: 'Web apps also carry more ongoing cost. Bugs in logic need fixing, not just content updates. Security around user accounts and data needs regular attention. A website mostly needs content refreshes and the occasional design update; a web app needs real, ongoing development.',
      },
      {
        type: 'h2',
        text: "Starting with a website doesn't box you in",
      },
      {
        type: 'p',
        text: "Plenty of businesses launch with a website and add app-like functionality later, once they know exactly what their customers actually need. Starting simple and adding complexity when it's proven necessary is usually the smarter build order, not a compromise.",
      },
      {
        type: 'p',
        text: [
          'Not sure which one fits your business? ',
          {
            text: "Tell WildHands what you're trying to build",
            href: '/contact',
          },
          " and we'll help you work out the right scope.",
        ],
      },
      {
        type: 'h2',
        text: 'Frequently asked questions',
      },
      {
        type: 'h3',
        text: 'Can a website become a web app later?',
      },
      {
        type: 'p',
        text: "Yes. It's common to launch a website first, prove the business need, then add accounts, dashboards, or other app functionality once you know exactly what's required.",
      },
      {
        type: 'h3',
        text: 'Do I need a web app for e-commerce?',
      },
      {
        type: 'p',
        text: 'Not usually a full custom app. Most e-commerce runs well as a website built with commerce functionality (accounts, checkout, order tracking) added on top, rather than a ground-up app build.',
      },
    ],
  },
  {
    slug: 'how-long-does-it-take-to-build-a-website',
    photo: PHOTOS.insightWebsiteTimeline,
    title: 'How Long Does It Take to Build a Website?',
    date: '2026-09-15',
    categories: ['Websites'],
    excerpt:
      'A small business website can be live within days once the design is approved and the content is ready. Larger sites take weeks. Here is what sets the pace.',
    kind: 'article',
    author: WILDHANDS,
    body: [
      {
        type: 'p',
        text: "A small business website of one to four pages can be live within a few days once the design is agreed and your content is ready. A larger site with many pages, a blog or online payments usually takes several weeks, and a custom web app takes longer again. At WildHands, Starter and Standard websites go live 72 hours after you approve the design.",
      },
      {
        type: 'p',
        text: "The build itself is rarely the slow part. What decides the timeline is how much there is to build, how quickly decisions get made, and whether the words and photos are ready when the work starts.",
      },
      { type: 'h2', text: 'What decides how long a website takes?' },
      {
        type: 'ul',
        items: [
          [{ text: 'The number of pages.', strong: true }, ' A one-page site with your services, prices and a WhatsApp button is a small job. Twenty service pages and a blog are a bigger one.'],
          [{ text: 'Whether your content is ready.', strong: true }, ' In our experience this is the single biggest delay. A site cannot launch while it waits for a logo, photos or the text for the About page.'],
          [{ text: 'How decisions get made.', strong: true }, ' One person approving the design keeps things moving. Five people giving feedback in turn can add weeks.'],
          [{ text: 'Features.', strong: true }, ' Online payments, bookings, a product catalogue or a members area each add design, build and testing time.'],
          [{ text: 'Accounts you need to set up.', strong: true }, ' Your domain, a payment gateway account and a Google Business Profile each have their own sign-up and verification steps, and some of those are outside anyone’s control.'],
        ],
      },
      { type: 'h2', text: 'How long does each type of website take?' },
      {
        type: 'table',
        caption: 'Typical timelines at WildHands, by type of build',
        head: ['Build', 'Includes', 'Timeline'],
        rows: [
          ['Starter website', 'One page, WhatsApp and contact buttons', '72 hours after design approval'],
          ['Standard website', 'Up to 4 pages and an admin dashboard', '72 hours after design approval'],
          ['Larger website', 'More pages, a blog, payments or bookings', 'Set in the written scope'],
          ['Web app or tool', 'Logins, dashboards and workflows', 'Set in the written scope'],
        ],
      },
      { type: 'h2', text: 'Why can a website be built in 72 hours?' },
      {
        type: 'p',
        text: "Because the scope is fixed and the slow decisions happen first. On Starter and Standard, you send your logo, photos and text, we design the site, and you approve the design within 24 hours, before any code is written. Once the design is approved there is nothing left to debate, so the build is a known quantity. Speed comes from a small, clear scope, not from cutting corners.",
      },
      { type: 'h2', text: 'What slows a website project down?' },
      {
        type: 'ul',
        items: [
          'Waiting for photos, prices or page text after the work has started.',
          'Feedback arriving in pieces from several people, sometimes contradicting each other.',
          'New pages or features added halfway through the build.',
          'A previous developer holding the login for your domain, so it cannot be connected to the new site.',
          'Payment gateway verification that has not been started, so checkout cannot go live with the rest of the site.',
        ],
      },
      { type: 'h2', text: 'How can you get your website live faster?' },
      {
        type: 'ol',
        items: [
          'Gather your logo, your best photos and the text you want on each page before you start.',
          'Choose one person who approves the design and the final site.',
          'Find the login for your domain, or decide on a new domain name, before the build starts.',
          'Split your wish list into what must be there at launch and what can come later.',
          [
            'If you want to take payments, open your payment gateway account early. Our guide to ',
            { text: 'accepting payments on a website in Nigeria', href: '/blog/accept-payments-website-nigeria' },
            ' explains what you need.',
          ],
        ],
      },
      { type: 'h2', text: 'Is a website built in days lower quality?' },
      {
        type: 'p',
        text: [
          'Not if the scope is small and fixed. Quality comes from the process: an approved design, real content and proper testing on a phone. Whatever the timeline, a business website should still load quickly on mobile data, work on a small screen and have contact buttons that actually work. Our ',
          { text: 'checklist for a Nigerian business website', href: '/blog/nigerian-business-website-checklist' },
          ' covers what every site should include.',
        ],
      },
      { type: 'h2', text: 'How long does a web app or internal tool take?' },
      {
        type: 'p',
        text: [
          'Longer than a website, because there is more to decide and test: who logs in, what each person can see and change, which payments or messages the system sends, and what happens when something goes wrong. We scope ',
          { text: 'apps', href: '/use-cases/apps' },
          ' and ',
          { text: 'tools and systems', href: '/use-cases/tools-and-systems' },
          ' after a discovery call and agree a written scope, with a timeline, before any work starts.',
        ],
      },
      {
        type: 'p',
        text: [
          'Want a date for your own site? See our ',
          { text: 'fixed prices', href: '/pricing' },
          ' or ',
          { text: 'request a quote', href: '/request-a-quote' },
          " and we will tell you how long your build will take.",
        ],
      },
      { type: 'h2', text: 'Frequently asked questions' },
      { type: 'h3', text: 'Can I get a website in 24 hours?' },
      {
        type: 'p',
        text: 'Some website builders let you publish a basic page the same day. A designed business site needs a design you have approved first. With WildHands you approve the design within 24 hours, and the site is live 72 hours after approval.',
      },
      { type: 'h3', text: 'What do I need to send before you start?' },
      {
        type: 'p',
        text: 'Your logo, your photos and the text you want on the site. On Standard we can write the copy for you from a 15-minute call.',
      },
      { type: 'h3', text: 'What if I need changes after launch?' },
      {
        type: 'p',
        text: 'Starter includes 2 rounds of edits and Standard includes 3. Further changes are billed by the hour, and we quote them before we start.',
      },
      { type: 'h3', text: 'Does a faster build cost more?' },
      {
        type: 'p',
        text: 'No. Starter is ₦150,000 and Standard is ₦250,000, with half paid as a deposit to start. The 72-hour timeline is part of the price, not an extra.',
      },
    ],
  },
  {
    slug: 'domain-hosting-maintenance-cost-nigeria',
    photo: PHOTOS.insightWebsiteRunningCosts,
    title: 'How Much Are Domain, Hosting and Maintenance in Nigeria?',
    date: '2026-09-22',
    categories: ['Websites', 'Pricing'],
    excerpt:
      'After launch, a website needs its domain renewed yearly, hosting, and changes now and then. Here is what each cost covers in Nigeria and how to budget for it.',
    kind: 'article',
    author: WILDHANDS,
    body: [
      {
        type: 'p',
        text: "A website has three running costs: the domain name, renewed every year; hosting, which keeps the site online; and maintenance, which covers updates, fixes and changes. The security certificate that puts the padlock in the address bar can be free. Prices vary from one registrar and host to the next, so the most useful thing to know is what each cost is, who should own each account, and what to check before you pay.",
      },
      { type: 'h2', text: 'What is the difference between a domain and hosting?' },
      {
        type: 'p',
        text: "The domain is your address, such as yourbusiness.com.ng. Hosting is the computer that stores the website and sends it to visitors when they type that address. You rent the domain from a registrar, year by year, and you pay for hosting to keep the site online. They can come from the same company or from different ones.",
      },
      { type: 'h2', text: 'How do you register a .ng or .com.ng domain?' },
      {
        type: 'p',
        text: [
          '.ng domains are run by the ',
          { text: 'Nigeria Internet Registration Association (NiRA)', href: 'https://nira.org.ng/' },
          ', but NiRA does not sell them directly. ',
          { text: 'According to NiRA', href: 'https://nira.org.ng/?p=948' },
          ', all registrations, renewals and transfers go through its accredited registrars. The steps are:',
        ],
      },
      {
        type: 'ol',
        items: [
          [ 'Check the name is free at ', { text: 'register.ng', href: 'https://register.ng' }, '.' ],
          'Pick a registrar from NiRA’s list of accredited registrars.',
          'Register the name through that registrar, in your business’s name and with an email address you control.',
        ],
      },
      {
        type: 'p',
        text: [
          'Which ending should you choose? Pick the one your customers will remember and type. Google treats country-code domains such as .ng as ',
          { text: 'a strong signal that a site is meant for a certain country', href: 'https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites' },
          ', which suits a business that mainly serves Nigeria. A .com can make more sense if you sell abroad.',
        ],
      },
      { type: 'h2', text: 'How much is a domain name in Nigeria?' },
      {
        type: 'p',
        text: "Each registrar sets its own price, and first-year discounts are common. The figure that matters is the renewal price, because you pay it every year for as long as you keep the site. Before you buy, check the renewal price, whether the domain is registered in your name, and whether you can move it to another registrar later.",
      },
      {
        type: 'p',
        text: 'If you build with WildHands and already have a domain, we connect it. If you do not, we register one for you and add the cost to the invoice.',
      },
      { type: 'h2', text: 'How much does hosting cost, and what kind do you need?' },
      {
        type: 'p',
        text: "Hosting ranges from cheap shared plans, where many sites share one server, to cloud servers sized for busy web apps. A small business website needs very little: it should load quickly on mobile data, stay online and be backed up. Paying for a large hosting plan for a four-page site is money better spent elsewhere. A web app with logins and a database needs more, and that should be part of its quote.",
      },
      {
        type: 'p',
        text: [
          'Starter and Standard websites from WildHands are hosted and connected to your domain as part of the build. See ',
          { text: 'what each plan includes', href: '/pricing' },
          '.',
        ],
      },
      { type: 'h2', text: 'Do you need to pay for an SSL certificate?' },
      {
        type: 'p',
        text: [
          'Usually not. The SSL certificate is what puts https and the padlock on your site, and browsers warn visitors about pages without one. ',
          { text: "Let's Encrypt", href: 'https://letsencrypt.org/about/' },
          ' gives anyone who owns a domain a trusted certificate at no cost, and most good hosts set it up and renew it automatically. Paid certificates exist, but a small business website rarely needs one.',
        ],
      },
      { type: 'h2', text: 'What does website maintenance include?' },
      {
        type: 'ul',
        items: [
          [{ text: 'Renewals.', strong: true }, ' The domain every year, and hosting on whatever cycle you pay for it.'],
          [{ text: 'Updates and security.', strong: true }, ' Sites built on plugins and themes, such as many WordPress sites, need regular updates to stay secure.'],
          [{ text: 'Backups.', strong: true }, ' A copy of the site you can restore if something breaks.'],
          [{ text: 'Content changes.', strong: true }, ' New prices, new photos, a new service page.'],
          [{ text: 'Fixes when other services change.', strong: true }, ' Payment gateways, maps and booking tools update their systems, and the site sometimes needs to follow.'],
        ],
      },
      { type: 'h2', text: 'How much should you budget for maintenance?' },
      {
        type: 'p',
        text: "It depends on how the site is built. A site with many plugins needs regular attention whether or not you change anything. A simpler site with fewer moving parts needs less. The biggest saving is being able to make everyday changes yourself, so you are not paying a developer every time a price changes.",
      },
      {
        type: 'p',
        text: "That is why our Standard plan includes an admin dashboard where you edit text, images, prices and announcements yourself. Starter includes 2 rounds of edits and Standard includes 3. After that, changes are billed by the hour, and we quote them before we start, so there are no surprise invoices.",
      },
      { type: 'h2', text: 'Who should own the domain and hosting accounts?' },
      {
        type: 'p',
        text: [
          'You should. Register the domain in your business’s name, with your own email address, and keep the logins somewhere safe. A common problem is a developer who registered the domain in their own name and then became hard to reach, leaving the business unable to move or renew it. With WildHands you own the site, the domain and everything on it. Our guide to ',
          { text: 'choosing a web development agency in Lagos', href: '/blog/choose-web-development-agency-lagos' },
          ' covers the other questions to ask before you sign.',
        ],
      },
      {
        type: 'p',
        text: [
          'For the cost of building the site in the first place, read ',
          { text: 'How Much Does a Website Cost in Nigeria?', href: '/blog/website-cost-nigeria' },
        ],
      },
      { type: 'h2', text: 'Frequently asked questions' },
      { type: 'h3', text: 'What happens if I forget to renew my domain?' },
      {
        type: 'p',
        text: 'Your website and any email on that domain stop working. Once any grace period your registrar offers has passed, someone else may be able to register the name. Turn on auto-renew and keep the payment card on the account up to date.',
      },
      { type: 'h3', text: 'Can I get a free domain and hosting?' },
      {
        type: 'p',
        text: 'Some website builders offer a free address on their own domain, such as yourname.builder.com, usually with their branding on your site. A domain of your own, such as yourbusiness.com.ng, always costs money.',
      },
      { type: 'h3', text: 'Is .com.ng better than .com for Google?' },
      {
        type: 'p',
        text: 'Google treats country-code domains as a strong signal that a site is meant for that country, which helps a business serving Nigeria. A .com can still rank in Nigeria. Choose the one your customers will remember.',
      },
      { type: 'h3', text: 'Do I need a business email address?' },
      {
        type: 'p',
        text: 'It is not required, but an address on your own domain looks more professional than a free email account. Email hosting is usually a separate cost from website hosting, so ask whether it is included.',
      },
    ],
  },
  {
    slug: 'accept-payments-website-nigeria',
    photo: PHOTOS.insightAcceptPayments,
    title: 'How to Accept Payments on Your Website in Nigeria',
    date: '2026-09-29',
    categories: ['Websites', 'Pricing'],
    excerpt:
      'To take payments on a Nigerian website, open a Paystack or Flutterwave account, verify it and add their checkout. Here is how it works and what it costs.',
    kind: 'article',
    author: WILDHANDS,
    body: [
      {
        type: 'p',
        text: "To accept payments on a website in Nigeria, you use a payment gateway. The two most Nigerian businesses compare are Paystack and Flutterwave. You open an account, verify your identity or business, and add the gateway’s checkout to your site. Customers pay by card, bank transfer or USSD on the gateway’s secure checkout, the gateway takes a fee on each payment, and the rest is paid into your bank account.",
      },
      { type: 'h2', text: 'What do you need before you can accept payments online?' },
      {
        type: 'ul',
        items: [
          'A payment gateway account, such as Paystack or Flutterwave.',
          'Proof of identity, and business registration documents if you are signing up as a registered business.',
          'A bank account for the money to be paid into.',
          'A website, or at least a page, where customers can see what they are paying for.',
        ],
      },
      {
        type: 'p',
        text: [
          'You do not always need CAC registration to start. Paystack offers a ',
          { text: 'Starter Business account', href: 'https://support.paystack.com/hc/en-us/articles/360009972719-What-is-a-Paystack-Starter-Business' },
          ' for businesses that are not yet registered. It verifies the owner’s identity and address instead, but it has a lifetime limit on how much you can collect and leaves out some features, such as Transfers. Upgrading to a registered business lifts those limits.',
        ],
      },
      { type: 'h2', text: 'How much does Paystack charge per transaction?' },
      {
        type: 'p',
        text: [
          'At the time of writing, ',
          { text: 'Paystack’s published charges', href: 'https://support.paystack.com/hc/en-us/articles/360009881920-What-are-Paystack-s-transaction-charges' },
          ' for Nigerian businesses are 1.5% + ₦100 on local payments. The ₦100 is waived on payments under ₦2,500, and the fee on any local payment is capped at ₦2,000. International cards cost 3.9% + ₦100, or 4.5% for American Express. Here is what that means on a few order sizes:',
        ],
      },
      {
        type: 'table',
        caption: 'Paystack fees on local payments, worked out from its published rates',
        head: ['Order', 'Rate', 'Fee', 'You receive'],
        rows: [
          ['₦2,000', '1.5% only', '₦30', '₦1,970'],
          ['₦10,000', '1.5% + ₦100', '₦250', '₦9,750'],
          ['₦50,000', '1.5% + ₦100', '₦850', '₦49,150'],
          ['₦200,000', 'Capped', '₦2,000', '₦198,000'],
        ],
      },
      {
        type: 'p',
        text: 'The ₦2,000 order is under ₦2,500, so only the 1.5% applies. On the ₦200,000 order, 1.5% + ₦100 would come to ₦3,100, so the ₦2,000 cap applies instead. Rates change, so check the current figures before you set your prices or decide who absorbs the fee.',
      },
      { type: 'h2', text: 'Paystack or Flutterwave: which is better?' },
      {
        type: 'p',
        text: [
          'Both are established and both work well on a business website. At the time of writing, ',
          { text: 'Flutterwave’s Nigerian pricing page', href: 'https://flutterwave.com/ng/pricing' },
          ' lists a 2% fee on local transactions, so the cheaper option depends on your typical order size. Rather than asking which is better in general, ask which fits you:',
        ],
      },
      {
        type: 'ul',
        items: [
          [{ text: 'Where are your customers?', strong: true }, ' If you sell mostly in Nigeria, either works. If you sell across several African countries, compare which countries and currencies each one supports for your business.'],
          [{ text: 'What is your usual order size?', strong: true }, ' Work out the fee on your typical basket with each gateway’s current rates. A cap on fees matters most if your orders are large.'],
          [{ text: 'How do your customers like to pay?', strong: true }, ' Card, bank transfer, USSD or mobile money. Check that the methods your customers use are switched on for your account.'],
          [{ text: 'Which dashboard can you live with?', strong: true }, ' You will use it every week to check payments and settlements. Open a test account with both and look around.'],
        ],
      },
      {
        type: 'p',
        text: 'Some businesses use both. That adds a little build and admin work, so it is usually something to do later, not on day one.',
      },
      { type: 'h2', text: 'How does a website payment work, step by step?' },
      {
        type: 'ol',
        items: [
          'The customer chooses what to buy and taps Pay.',
          'The gateway’s checkout opens, and the customer pays by card, transfer or USSD. Card details go to the gateway, not to your website.',
          'The gateway confirms the result to your website.',
          'Your website checks the payment with the gateway, from the server, before it marks the order as paid.',
          'You and the customer get a confirmation, and the gateway pays the money into your bank account on its settlement schedule.',
        ],
      },
      {
        type: 'p',
        text: "Step 4 is the one that matters most. A screenshot of a transfer alert, or a browser that says “payment successful”, is not proof of payment. A properly built site confirms every payment directly with the gateway before it releases an order, which also protects you from fake payment alerts.",
      },
      { type: 'h2', text: 'Can you take payments without a full online store?' },
      {
        type: 'p',
        text: [
          'Yes. Both gateways offer payment links you can send in a chat, which suits a business that takes orders on WhatsApp. On a website, a service business might only need a Pay button on each service, or quotes that turn into invoices the client pays online, which is what we built for ',
          { text: 'Rayo', href: '/resources/rayo' },
          '. A shop with many products needs a cart and checkout; our guide to ',
          { text: 'e-commerce costs in Nigeria', href: '/blog/ecommerce-development-cost-nigeria' },
          ' covers that.',
        ],
      },
      { type: 'h2', text: 'Why not just ask customers to transfer to your account?' },
      {
        type: 'p',
        text: "Direct transfers have no gateway fee, which is why many businesses start there. The cost is time and risk: someone has to check every alert by hand, match it to an order and spot fake ones. Paying by transfer through a gateway gives the customer the same familiar method, while the gateway confirms the payment and records it against the order for you.",
      },
      { type: 'h2', text: 'What does it cost to add payments to a website?' },
      {
        type: 'p',
        text: [
          'It depends on what the payment does. A single Pay button on a service page is a small job. A shop with a cart, delivery fees and stock that updates itself is a larger one. ',
          { text: 'TOMORI', href: '/resources/tomori' },
          ', a fashion shop we built, takes card, transfer or USSD through Paystack, shows delivery fees before anyone pays, and lets the owner create a QR code at a market stall for a customer to pay on their own phone. Tell us what you sell and how you take orders, and we will scope it: ',
          { text: 'request a quote', href: '/request-a-quote' },
          '.',
        ],
      },
      { type: 'h2', text: 'Frequently asked questions' },
      { type: 'h3', text: 'Do I need CAC registration to use Paystack?' },
      {
        type: 'p',
        text: 'Not to start. A Paystack Starter Business account is for businesses that are not yet registered. It has a lifetime limit on collections and fewer features, and upgrading to a registered business lifts the limits.',
      },
      { type: 'h3', text: 'Can customers outside Nigeria pay on my website?' },
      {
        type: 'p',
        text: 'Yes, with an international card. Paystack charges 3.9% + ₦100 on international Visa, Mastercard and Verve payments, and 4.5% on American Express, at the time of writing.',
      },
      { type: 'h3', text: 'Is it safe to take card payments on my website?' },
      {
        type: 'p',
        text: 'Yes, when the card details are entered on the gateway’s checkout rather than stored by your site, and every payment is confirmed with the gateway before an order is released. That is how we build every payment flow.',
      },
      { type: 'h3', text: 'When does the money reach my bank account?' },
      {
        type: 'p',
        text: 'Each gateway pays out on its own settlement schedule, which can depend on your account type. Your gateway dashboard shows the schedule for your account.',
      },
    ],
  },
  {
    slug: 'shopify-vs-custom-website-nigeria',
    photo: PHOTOS.insightShopifyVsCustom,
    title: 'Shopify vs a Custom Website in Nigeria: Which Is Better?',
    date: '2026-10-06',
    categories: ['Websites', 'Pricing'],
    excerpt:
      'Shopify works in Nigeria, but you pay a monthly fee in dollars plus an extra cut of each sale made through Paystack. Here is when that is worth paying.',
    kind: 'article',
    author: WILDHANDS,
    body: [
      {
        type: 'p',
        text: "Shopify is available in Nigeria and works with Paystack, so you can run a real online shop on it. The catch is cost. You pay a monthly subscription in US dollars, and because Shopify’s own payment service is not offered in Nigeria, Shopify adds its own fee on every sale you take through a gateway like Paystack, on top of Paystack’s fee. A custom website costs more up front but has no platform subscription and no platform cut of each sale, and it is built around how you actually sell.",
      },
      { type: 'h2', text: 'Is Shopify available in Nigeria?' },
      {
        type: 'p',
        text: [
          'Yes. You can sign up from Nigeria, and ',
          { text: 'Shopify’s Nigerian pricing page', href: 'https://www.shopify.com/ng/pricing' },
          ' lists its plans in US dollars. Shopify Payments, its built-in payment service, is ',
          { text: 'not available in Nigeria', href: 'https://help.shopify.com/en/manual/payments/shopify-payments/supported-countries' },
          ', so Nigerian stores take payments through a third-party provider such as Paystack.',
        ],
      },
      { type: 'h2', text: 'How much does Shopify cost in Nigeria?' },
      {
        type: 'table',
        caption: 'Shopify plans per month, in US dollars, as listed on shopify.com/ng/pricing at the time of writing. The last column is the extra fee Shopify adds when you use a third-party gateway such as Paystack.',
        head: ['Plan', 'Billed yearly', 'Billed monthly', 'Extra fee per sale'],
        rows: [
          ['Basic', 'US$19', 'US$27', '2%'],
          ['Grow', 'US$54', 'US$72', '1%'],
          ['Advanced', 'US$299', 'US$399', '0.6%'],
        ],
      },
      {
        type: 'p',
        text: "On top of that come the payment gateway’s own fees, any paid theme, and any paid apps you add. Because the subscription is billed in dollars, what it costs you in naira moves with the exchange rate.",
      },
      {
        type: 'p',
        text: [
          'Here is one sale worked through. A ₦50,000 order on the Basic plan, paid through Paystack: Shopify’s 2% third-party fee is ₦1,000, and ',
          { text: 'Paystack’s 1.5% + ₦100', href: 'https://support.paystack.com/hc/en-us/articles/360009881920-What-are-Paystack-s-transaction-charges' },
          ' is ₦850. That is ₦1,850 in fees on that order, before the monthly subscription.',
        ],
      },
      { type: 'h2', text: 'How do you connect Paystack to Shopify?' },
      {
        type: 'p',
        text: [
          { text: 'Paystack’s guide', href: 'https://support.paystack.com/hc/en-us/articles/360009881240' },
          ' sets it out: in your Shopify admin, go to Settings, then Payments, and add a payment method. Search for Paystack, connect it and install the app, paste in your Paystack API keys, then activate Paystack. Shopify then updates orders automatically when a Paystack payment succeeds.',
        ],
      },
      { type: 'h2', text: 'When is Shopify the better choice?' },
      {
        type: 'ul',
        items: [
          'You have a large catalogue with many sizes, colours and variants, and you want to manage it all yourself.',
          'You want to launch quickly on a small up-front budget and can carry a monthly fee.',
          'Your needs are standard: products, cart, checkout and delivery, with nothing unusual about how you sell.',
          'You are comfortable paying a dollar subscription from a card that works for international payments.',
        ],
      },
      { type: 'h2', text: 'When is a custom website the better choice?' },
      {
        type: 'ul',
        items: [
          'You sell in ways a standard store does not handle well: WhatsApp orders, deposits, custom quotes, market stalls or delivery fees that change by area.',
          'You sell a small range, or you sell services, and do not need a full store platform.',
          'Your margins are thin enough that a platform fee on every sale really adds up.',
          'You want the brand, not a theme, to set how the shop looks and feels.',
          'You want an admin that does exactly what your business needs and nothing more.',
        ],
      },
      {
        type: 'p',
        text: [
          'That is the case for ',
          { text: 'TOMORI', href: '/resources/tomori' },
          ', a hand-dyed fashion label we built a shop for. Shoppers find the pieces on Instagram and WhatsApp, so the site is built for a phone on mobile data, with a WhatsApp button on every page. At a market the owner picks a piece by its code and the shop creates a QR code the customer pays through on their own phone. Bags left unpaid for twenty minutes are listed so she can follow up. None of that comes in a standard store.',
        ],
      },
      { type: 'h2', text: 'Which costs less over three years?' },
      {
        type: 'p',
        text: 'Add up the whole cost for each option, not just the first month. For Shopify, that is the subscription for 36 months, plus paid apps and theme, plus the extra per-sale fee on your expected sales. For a custom site, it is the build, plus hosting, plus the changes you expect to pay for.',
      },
      {
        type: 'p',
        text: "The per-sale fee is the part people forget. On the Basic plan, a shop selling ₦1,000,000 a month through Paystack pays Shopify ₦20,000 a month in third-party fees, which is ₦720,000 over three years, before the subscription and before Paystack’s own fees. Use your own sales figures and today’s exchange rate to work out where your break-even point is.",
      },
      {
        type: 'p',
        text: [
          'For what a custom shop costs to build, read ',
          { text: 'How Much Does E-commerce Development Cost in Nigeria?', href: '/blog/ecommerce-development-cost-nigeria' },
          ' Or ',
          { text: 'tell us what you sell', href: '/request-a-quote' },
          ' and we will scope it.',
        ],
      },
      { type: 'h2', text: 'Frequently asked questions' },
      { type: 'h3', text: 'Can Nigerians use Shopify?' },
      {
        type: 'p',
        text: 'Yes. You can open a Shopify store from Nigeria and take payments through Paystack. Shopify Payments, Shopify’s own payment service, is not available in Nigeria.',
      },
      { type: 'h3', text: 'Does Shopify charge in naira?' },
      {
        type: 'p',
        text: 'At the time of writing, Shopify’s Nigerian pricing page lists its plans in US dollars, from US$19 a month on the Basic plan billed yearly.',
      },
      { type: 'h3', text: 'Can I move from Shopify to a custom website later?' },
      {
        type: 'p',
        text: 'Yes. Products, customers and orders can be exported from Shopify and brought into a new site. Plan redirects from your old product addresses so customers and Google can still find them.',
      },
      { type: 'h3', text: 'Do I need a developer to use Shopify?' },
      {
        type: 'p',
        text: 'Not to start: you can set up a store with a theme yourself. You need a developer when you want something the themes and apps do not do, which is often the point at which a custom site is worth comparing.',
      },
    ],
  },
  {
    slug: 'how-much-does-it-cost-to-build-an-app-in-nigeria',
    photo: PHOTOS.insightAppCost,
    title: 'How Much Does It Cost to Build an App in Nigeria?',
    date: '2026-10-13',
    categories: ['Apps', 'Pricing'],
    excerpt:
      'App prices in Nigeria vary widely: one app is a booking tool, another a fintech platform. Here is what drives the cost and how to get a quote you can trust.',
    kind: 'article',
    author: WILDHANDS,
    body: [
      {
        type: 'p',
        text: "There is no single honest price for an app, because “an app” can mean a simple booking tool or a platform that moves money for thousands of people. What sets the cost is how many types of user it has, what each of them can do, which other services it connects to, and whether it runs in the browser, on Android, on iPhone, or all three. The fastest way to a reliable price is a short, clear description of the one job the app must do.",
      },
      { type: 'h2', text: 'What makes an app expensive?' },
      {
        type: 'ul',
        items: [
          [{ text: 'Types of user.', strong: true }, ' Customers, staff and admins each need their own screens and permissions. Every extra role adds work.'],
          [{ text: 'Features.', strong: true }, ' Payments, notifications, chat, maps, file uploads and offline use each add design, build and testing.'],
          [{ text: 'Integrations.', strong: true }, ' Connecting to Paystack, WhatsApp, SMS, Google Sheets or your accounting software means working with someone else’s system and its rules.'],
          [{ text: 'Platforms.', strong: true }, ' A web app works on any phone with a browser. Separate Android and iPhone apps add their own builds, testing and store reviews.'],
          [{ text: 'The admin side.', strong: true }, ' Every app needs a back office to manage users, content and problems. It is the part most often left out of early quotes.'],
          [{ text: 'Security and data.', strong: true }, ' Apps that hold money, health or personal information need more care, and more testing, to build properly.'],
        ],
      },
      { type: 'h2', text: 'Does the platform change the cost: web, Android or iPhone?' },
      {
        type: 'p',
        text: [
          'Yes. A web app is one build that works on every phone, tablet and laptop, and you can update it without waiting for an app store review. Native apps for Android and iPhone add their own work and their own fees: ',
          { text: 'Apple’s Developer Program', href: 'https://developer.apple.com/support/enrollment/' },
          ' costs US$99 a year, and ',
          { text: 'Google Play', href: 'https://support.google.com/googleplay/android-developer/answer/6112435' },
          ' charges a one-time US$25 registration fee. Our guide to ',
          { text: 'web apps versus mobile apps', href: '/blog/web-app-vs-mobile-app' },
          ' explains when each one makes sense.',
        ],
      },
      { type: 'h2', text: 'What costs come after the app is launched?' },
      {
        type: 'ul',
        items: [
          'Hosting and a database, which grow with the number of users.',
          'Third-party services, such as SMS, email and payment gateway fees.',
          [
            'WhatsApp messages, if the app sends them through the WhatsApp Business Platform: ',
            { text: 'Meta charges per message', href: 'https://developers.facebook.com/docs/whatsapp/pricing' },
            ', and from 1 October 2026 that includes service replies beyond a free monthly allowance.',
          ],
          'App store fees, if you publish native apps.',
          'Updates when phones, browsers and the services you rely on change, plus fixes and support.',
        ],
      },
      { type: 'h2', text: 'How can you reduce the cost of building an app?' },
      {
        type: 'ol',
        items: [
          'Start with the one job that matters most, and leave the nice-to-haves for a second phase.',
          'Build a web app first, and add native apps once people are using it and you know they need one.',
          'Use proven services for payments, email and messaging instead of building your own.',
          'Plan the admin side from the start, so it is not a surprise later.',
          'Agree a written scope before work starts, so everyone is pricing the same thing.',
        ],
      },
      { type: 'h2', text: 'How do you get an accurate quote?' },
      {
        type: 'p',
        text: 'Whoever you ask, you will get a better price if you can answer these questions:',
      },
      {
        type: 'ul',
        items: [
          'Who will use the app, and what is the one thing each of them needs to do?',
          'How does that work today: on paper, in spreadsheets, over WhatsApp?',
          'What must be there on launch day, and what can wait?',
          'Which services must it connect to, such as Paystack or your existing website?',
          'Is there a date it has to be ready by, and why?',
        ],
      },
      {
        type: 'p',
        text: [
          'At WildHands, ',
          { text: 'apps', href: '/use-cases/apps' },
          ' are quoted after a discovery call, and you get a written scope before any work starts. To see the range of what we build, look at ',
          { text: 'Dory', href: '/resources/dory' },
          ', a budgeting app, or ',
          { text: 'The Ruff Agency', href: '/resources/the-ruff-agency' },
          ', a workspace that replaced six separate tools.',
        ],
      },
      { type: 'h2', text: 'How long does it take to build an app?' },
      {
        type: 'p',
        text: [
          'Usually weeks or months rather than days, depending on the scope. A focused first version with one main job is much faster than an app that tries to do everything at launch. For website timelines, see ',
          { text: 'How Long Does It Take to Build a Website?', href: '/blog/how-long-does-it-take-to-build-a-website' },
        ],
      },
      {
        type: 'p',
        text: [
          'Ready to price yours? ',
          { text: 'Request a quote', href: '/request-a-quote' },
          ' and tell us what the app needs to do.',
        ],
      },
      { type: 'h2', text: 'Frequently asked questions' },
      { type: 'h3', text: 'Is a web app cheaper than a mobile app?' },
      {
        type: 'p',
        text: 'Usually, because one web app works on every device and needs no app store fees or reviews. Separate Android and iPhone apps mean more building and testing.',
      },
      { type: 'h3', text: 'Can I build an app with no-code tools?' },
      {
        type: 'p',
        text: 'Yes, for a prototype or a simple internal tool. No-code tools get harder to work with as your rules, users and data grow, and you depend on the tool’s pricing and limits.',
      },
      { type: 'h3', text: 'What should I budget for after launch?' },
      {
        type: 'p',
        text: 'Hosting, third-party services such as SMS or WhatsApp messages, app store fees if you publish native apps, and ongoing updates and support.',
      },
      { type: 'h3', text: 'Who owns the app once it is built?' },
      {
        type: 'p',
        text: 'Agree this in writing before you start: who owns the code, the design files, the app store accounts and the hosting accounts. You should be able to take the app to another developer if you ever need to.',
      },
    ],
  },
  {
    slug: 'web-app-vs-mobile-app',
    photo: PHOTOS.insightWebAppVsMobileApp,
    title: 'Web App or Mobile App: Which Should You Build First?',
    date: '2026-10-20',
    categories: ['Apps'],
    excerpt:
      'For most businesses a web app is the better first build: one version for every phone, no app store fees, no store reviews. Here is when to go native instead.',
    kind: 'article',
    author: WILDHANDS,
    body: [
      {
        type: 'p',
        text: "For most businesses, a web app is the better first build. It works on every phone, tablet and laptop from a single link, there are no app store fees or reviews, and customers can use it without downloading anything. A native mobile app is worth building when your app needs deep access to the phone, such as tracking a rider’s location in the background, or when people will open it every day and expect it on their home screen.",
      },
      { type: 'h2', text: 'What is the difference between a web app and a mobile app?' },
      {
        type: 'p',
        text: "A web app runs in the browser. You open it from a link, log in, and use it on any device. A native mobile app is downloaded from Google Play or the App Store and installed on the phone. Both can have accounts, payments, dashboards and notifications. The differences are in how people get it, what it can do on the phone, and what it costs to build and run.",
      },
      {
        type: 'p',
        text: [
          'If you are still deciding between a plain website and a web app, start with ',
          { text: 'Website vs Web App: What Does Your Business Need?', href: '/blog/website-vs-web-app' },
        ],
      },
      { type: 'h2', text: 'Why do most businesses start with a web app?' },
      {
        type: 'ul',
        items: [
          [{ text: 'No download.', strong: true }, ' A link shared on WhatsApp opens straight away. Every extra step between a customer and your app loses some of them.'],
          [{ text: 'One build for every device.', strong: true }, ' Android, iPhone, tablet and laptop all use the same app.'],
          [
            { text: 'No app store fees or reviews.', strong: true },
            ' Native apps need an ',
            { text: 'Apple Developer Program', href: 'https://developer.apple.com/support/enrollment/' },
            ' membership at US$99 a year and a ',
            { text: 'Google Play', href: 'https://support.google.com/googleplay/android-developer/answer/6112435' },
            ' account with a one-time US$25 fee, and every update goes through store review.',
          ],
          [{ text: 'Faster changes.', strong: true }, ' Fix a problem or change a price and everyone has it the next time they open the app.'],
          [{ text: 'Found on Google.', strong: true }, ' The public pages of a web app can show up in search results. An app inside an app store cannot.'],
        ],
      },
      { type: 'h2', text: 'Can a web app be installed on a phone like a normal app?' },
      {
        type: 'p',
        text: [
          'Yes. A progressive web app, or PWA, is a web app that can be added to the home screen and opened in its own window like any other app. ',
          { text: 'Google’s guide to PWAs', href: 'https://web.dev/articles/what-are-pwas' },
          ' explains that they can also keep working without a connection, showing the most recent content when the network drops. Since iOS 16.4, ',
          { text: 'iPhones support notifications', href: 'https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/' },
          ' from web apps added to the home screen, and Android has supported them for longer.',
        ],
      },
      { type: 'h2', text: 'When do you actually need a mobile app?' },
      {
        type: 'ul',
        items: [
          'The app needs features a browser cannot reach reliably, such as tracking location in the background, Bluetooth printers or card readers.',
          'People will use it many times a day, such as a rider app or a staff app, and expect it to open instantly from the home screen.',
          'It must work for long stretches with no connection and sync later.',
          'Being listed in Google Play or the App Store is part of how customers will find you.',
        ],
      },
      {
        type: 'p',
        text: "Many businesses need both: a web app for customers, who come and go, and a native app for staff or riders, who use it all day. Both can share the same back end, so the second one is not a rebuild.",
      },
      { type: 'h2', text: 'Why are PWAs not more popular?' },
      {
        type: 'p',
        text: "Mostly because they are less visible. There is no app store listing to point people to, installing one from the browser menu is less familiar than tapping Install in a store, and iPhone support for features like notifications arrived years after Android. For a business, those are reasons to explain the install step to your customers, not reasons to avoid web apps.",
      },
      { type: 'h2', text: 'Can you turn a web app into a mobile app later?' },
      {
        type: 'p',
        text: "Yes. If the web app is built with its data and logic on the server, a native app can use the same back end later, so you only build the new screens. Starting with a web app lets you learn what customers actually use before you pay for two more versions of it.",
      },
      { type: 'h2', text: 'Which one costs less?' },
      {
        type: 'p',
        text: [
          'Usually the web app, because it is one build with no store fees. Our guide to ',
          { text: 'what an app costs to build in Nigeria', href: '/blog/how-much-does-it-cost-to-build-an-app-in-nigeria' },
          ' covers the full list of costs, including the ones that come after launch.',
        ],
      },
      {
        type: 'p',
        text: [
          'Not sure which you need? ',
          { text: 'Tell us what the app has to do', href: '/request-a-quote' },
          ' and we will recommend the simplest version that does the job. See the kinds of ',
          { text: 'apps we build', href: '/use-cases/apps' },
          '.',
        ],
      },
      { type: 'h2', text: 'Frequently asked questions' },
      { type: 'h3', text: 'Is it better to have a website or an app?' },
      {
        type: 'p',
        text: 'Start with a website if people only need to find you, learn about you and contact you. You need an app, usually a web app first, when people log in to do something again and again, such as book, order, track or pay.',
      },
      { type: 'h3', text: 'Can a web app send notifications?' },
      {
        type: 'p',
        text: 'Yes. Web apps can send push notifications on Android, and on iPhones running iOS 16.4 or later when the app has been added to the home screen. Email, SMS and WhatsApp messages are other ways to reach people.',
      },
      { type: 'h3', text: 'Will customers download my app?' },
      {
        type: 'p',
        text: 'Some will, but every download is an extra step. A link that opens straight away usually reaches more people at the start. Ask for the download once customers already value what the app does.',
      },
      { type: 'h3', text: 'Which should I build for a delivery business?' },
      {
        type: 'p',
        text: 'Often both: a web app or website for customers to order and track, and a native app for riders if it needs background location and must run all day. The two can share one back end.',
      },
    ],
  },
  {
    slug: 'replace-spreadsheets-with-custom-tool',
    photo: PHOTOS.insightReplaceSpreadsheets,
    title: 'When Should You Replace Spreadsheets With a Custom Tool?',
    date: '2026-10-27',
    categories: ['Tools & Systems'],
    excerpt:
      'Replace a spreadsheet when several people edit it, mistakes cost money, or data is copied between files. Here are the signs, and your options from cheapest up.',
    kind: 'article',
    author: WILDHANDS,
    body: [
      {
        type: 'p',
        text: "Replace a spreadsheet when it has stopped being a tool for one person and become the system the business runs on: several people edit it, mistakes in it cost money, and the same information is copied between files by hand. Before that point, a tidier spreadsheet is often enough. After it, a simple custom tool with a proper database, logins and screens shaped around your work usually pays for itself in hours saved.",
      },
      { type: 'h2', text: 'Why do spreadsheets stop working as a business grows?' },
      {
        type: 'p',
        text: [
          'Size is rarely the problem. Excel allows ',
          { text: '1,048,576 rows per sheet', href: 'https://support.microsoft.com/en-us/office/excel-specifications-and-limits-1672b34d-7043-467e-8e27-269d656771c3' },
          ' and Google Sheets allows ',
          { text: 'up to 20 million cells', href: 'https://support.google.com/docs/answer/37603' },
          ', far more than most small businesses use. The problems are about people:',
        ],
      },
      {
        type: 'ul',
        items: [
          'Everyone who can open the file can change anything in it, including the formulas.',
          'Copies multiply: “Orders final”, “Orders final v2”, and the one on someone’s laptop.',
          'The same customer or order is typed into three sheets, and they slowly stop agreeing.',
          'Nobody can see who changed a number, or why.',
          'It is hard to use on a phone, so staff in the field send updates on WhatsApp and someone types them in later.',
          'How it all fits together lives in one person’s head.',
        ],
      },
      { type: 'h2', text: 'What are the signs it is time to move on?' },
      {
        type: 'ol',
        items: [
          'More than one person edits the same sheet every day.',
          'You have lost money, an order or a customer because of a spreadsheet mistake.',
          'Someone spends hours each week copying data between sheets or from WhatsApp into a sheet.',
          'Different staff should see different things, such as sales staff not seeing salaries, and the sheet cannot do that.',
          'You need a report every week and it takes someone half a day to build it.',
          'Customers or partners need to see their part of the data, and you send them screenshots.',
        ],
      },
      {
        type: 'p',
        text: 'One or two of these can be fixed inside the spreadsheet. Three or more usually means the business has outgrown it.',
      },
      { type: 'h2', text: 'What can replace a spreadsheet?' },
      {
        type: 'p',
        text: 'There are four options, from the cheapest up. Start with the first one that solves the problem.',
      },
      {
        type: 'ol',
        items: [
          [{ text: 'Tidy the spreadsheet.', strong: true }, ' One tab per kind of thing, dropdowns instead of free typing, protected formulas, and one shared file instead of copies.'],
          [{ text: 'Automate around it.', strong: true }, ' A form that feeds the sheet, so nobody types the same order twice, and reports that build themselves.'],
          [{ text: 'Use a no-code app builder.', strong: true }, ' Good for a quick internal tool, as long as your rules are simple and you accept the platform’s limits and monthly pricing.'],
          [{ text: 'Build a custom internal tool.', strong: true }, ' A proper database, logins for each person, screens that match how your team works, a record of who changed what, and dashboards that are always up to date.'],
        ],
      },
      { type: 'h2', text: 'How do you turn a spreadsheet into an app?' },
      {
        type: 'ol',
        items: [
          'List what each column means and which columns belong together, such as customers, orders and payments.',
          'Write down who adds, edits and only views each kind of information.',
          'Map what happens when something changes: an order moves from paid to packed to delivered, and who is told.',
          'List the reports and numbers people actually read each week.',
          'Import your existing data into the new tool, and run both side by side for a short time before you switch over.',
        ],
      },
      {
        type: 'p',
        text: 'Most of this is thinking, not building. It is also the work a good discovery call does with you.',
      },
      { type: 'h2', text: 'What does a custom tool look like in practice?' },
      {
        type: 'ul',
        items: [
          [
            { text: 'The Ruff Agency', href: '/resources/the-ruff-agency' },
            ': clients lived in a spreadsheet, invoices in a separate system and payment tracking in someone’s head. Now clients, contracts, invoices, tasks and a client portal sit in one shared workspace.',
          ],
          [
            { text: 'Marvy', href: '/resources/marvy' },
            ': drop a course video in, and it lands in the right Google Drive folder with the right people tagged, instead of someone filing each one by hand.',
          ],
          [
            { text: 'TOMORI', href: '/resources/tomori' },
            ': a shop owner who works alone runs orders, stock, takings, costs and discount codes from one back office on her phone.',
          ],
        ],
      },
      { type: 'h2', text: 'Is a custom tool worth the cost?' },
      {
        type: 'p',
        text: 'Judge it on hours returned. Count the hours your team spends each week on copying, checking and fixing spreadsheet work, and what an error costs you when it happens. If three people each lose four hours a week to it, that is 12 hours a week, or more than 600 hours a year. Put a value on those hours and compare it with the price of the tool.',
      },
      {
        type: 'p',
        text: [
          'That is how we scope ',
          { text: 'tools and systems', href: '/use-cases/tools-and-systems' },
          ' at WildHands: quoted after a discovery call, with a written scope before work starts, and judged on the hours it gives back. ',
          { text: 'Request a quote', href: '/request-a-quote' },
          ' and tell us which spreadsheet is causing the most trouble.',
        ],
      },
      { type: 'h2', text: 'Frequently asked questions' },
      { type: 'h3', text: 'Which app can replace Excel?' },
      {
        type: 'p',
        text: 'For calculations and one-off analysis, Excel is still hard to beat. For shared records that several people update, such as orders, stock or clients, a tool built on a database is the better replacement, whether off the shelf or custom.',
      },
      { type: 'h3', text: 'Can I keep using Google Sheets alongside a custom tool?' },
      {
        type: 'p',
        text: 'Yes. A custom tool can export to a spreadsheet, or keep one in sync, so anyone who prefers working in Sheets can still do their analysis there.',
      },
      { type: 'h3', text: 'What happens to the data already in my spreadsheets?' },
      {
        type: 'p',
        text: 'It is cleaned up and imported into the new tool before you switch over, so you start with your full history.',
      },
      { type: 'h3', text: 'How long does it take to build an internal tool?' },
      {
        type: 'p',
        text: 'It depends on how many screens, roles and connections it needs. A focused tool that replaces one spreadsheet is much quicker than a system that replaces five. We agree the timeline in the written scope.',
      },
    ],
  },
  {
    slug: 'do-i-need-a-website-instagram-whatsapp',
    photo: PHOTOS.insightWebsiteInstagramWhatsapp,
    title: 'Do You Need a Website If You Sell on Instagram and WhatsApp?',
    date: '2026-11-02',
    categories: ['Websites'],
    excerpt:
      'You can sell on Instagram and WhatsApp without a website, but you own neither. A simple site gives you an address on Google that no platform can switch off.',
    kind: 'article',
    author: WILDHANDS,
    body: [
      {
        type: 'p',
        text: "No, you can start selling without one, and many Nigerian businesses do. But you do not own your Instagram account or the rules WhatsApp sets for businesses, and neither puts you in front of people searching Google for what you sell. A website is the one place online that is entirely yours. Most growing businesses use all three: Instagram to be discovered, WhatsApp to talk to customers, and a website to be found and trusted.",
      },
      { type: 'h2', text: 'Can you sell on Instagram without a website?' },
      {
        type: 'p',
        text: "Yes. Plenty of businesses take orders entirely through Instagram posts, direct messages and WhatsApp chats. It costs nothing to start and it is where many customers already spend their time. For testing an idea or selling to people who already know you, it is often the right place to begin.",
      },
      { type: 'h2', text: 'What are the risks of relying only on Instagram and WhatsApp?' },
      {
        type: 'ul',
        items: [
          [{ text: 'You do not control the account.', strong: true }, ' A hacked, restricted or reported account can take your whole shop offline overnight, with no one to call.'],
          [
            { text: 'The platform’s future is not your decision.', strong: true },
            ' In May 2025, ',
            { text: 'Meta threatened to suspend its platforms in Nigeria', href: 'https://nairametrics.com/2025/05/03/fccpc-reacts-to-metas-threat-of-exiting-nigeria-over-220-million-fine/' },
            ' after a tribunal upheld a US$220 million fine from the Federal Competition and Consumer Protection Commission. Whatever comes of that dispute, it showed how much of a business can rest on one company’s decisions.',
          ],
          [
            { text: 'The prices and rules can change.', strong: true },
            ' From 1 October 2026, ',
            { text: 'Meta started charging', href: 'https://developers.facebook.com/docs/whatsapp/pricing' },
            ' businesses on the WhatsApp Business Platform for service replies beyond a free monthly allowance. The free WhatsApp Business app and personal chats are ',
            { text: 'not affected', href: 'https://dubawa.org/misleading-whatsapp-not-set-to-charge-nigerians-n14-per-message/' },
            ', but it is a reminder that someone else sets the terms.',
          ],
          [{ text: 'Google cannot send you customers.', strong: true }, ' When someone searches for what you sell in your area, a website and a Google Business Profile are what show up, not your Instagram posts.'],
          [{ text: 'Customers have to ask for everything.', strong: true }, ' Prices, sizes, delivery areas and opening hours get answered one chat at a time, every day.'],
        ],
      },
      { type: 'h2', text: 'What does a website do that social media cannot?' },
      {
        type: 'ul',
        items: [
          'Gives you an address you own, such as yourbusiness.com.ng, that you can print, share and keep for years.',
          'Shows up when people search Google for what you sell.',
          'Puts your products, prices, delivery areas and policies in one place customers can check without messaging you.',
          'Takes payments through a proper checkout, so you are not checking transfer alerts by hand.',
          'Shows customers you are an established business, which matters to someone paying a seller they have never met.',
          'Tells you how many people visited and where they came from.',
        ],
      },
      { type: 'h2', text: 'Will customers still message you on WhatsApp?' },
      {
        type: 'p',
        text: [
          'Yes, and they should. A good website sends people to WhatsApp rather than replacing it. The difference is that they arrive already knowing your prices and what they want. On ',
          { text: 'TOMORI', href: '/resources/tomori' },
          ', a fashion shop we built, shoppers find pieces on Instagram and WhatsApp, buy on the website with Paystack, and a WhatsApp button sits on every page for anyone who would rather ask first.',
        ],
      },
      { type: 'h2', text: 'When is social media enough on its own?' },
      {
        type: 'p',
        text: 'If you are testing whether people will buy, sell to a small circle who already know you, or get all your customers through referrals, social media can carry you for a while. These are signs it is time for a website:',
      },
      {
        type: 'ul',
        items: [
          'You answer the same questions about prices, location and delivery every day.',
          'Customers ask whether you have a website, or say they could not find you on Google.',
          'You want to run ads and need somewhere better than a profile to send people.',
          'You want to take payments without checking every transfer by hand.',
          'You want to approach bigger clients who will look you up before they reply.',
        ],
      },
      { type: 'h2', text: 'What is the smallest website worth having?' },
      {
        type: 'p',
        text: [
          'One good page: who you are, what you sell, your prices or a price guide, where you deliver, and buttons to WhatsApp and call you. That is our Starter plan: ₦150,000, one mobile-ready page with working WhatsApp and contact buttons, hosted on your own domain and live 72 hours after you approve the design. ',
          { text: 'See the plans', href: '/pricing' },
          ', or read ',
          { text: 'what a Nigerian business website should include', href: '/blog/nigerian-business-website-checklist' },
          '.',
        ],
      },
      { type: 'h2', text: 'Frequently asked questions' },
      { type: 'h3', text: 'Is a link-in-bio page the same as a website?' },
      {
        type: 'p',
        text: 'No. It sits on someone else’s domain, follows their rules and does little for Google. It is a useful signpost, and the best thing to point it at is your own website.',
      },
      { type: 'h3', text: 'Will Meta’s new WhatsApp charges affect my small business?' },
      {
        type: 'p',
        text: 'Not if you use the free WhatsApp Business app. The per-message charges apply to businesses using the WhatsApp Business Platform, the API used by banks, fintechs and large online stores to message customers at scale.',
      },
      { type: 'h3', text: 'How will customers find my website?' },
      {
        type: 'p',
        text: 'Through Google, especially once you have a Google Business Profile linked to it, and through everywhere you already are: your Instagram bio, WhatsApp status, receipts, packaging and flyers.',
      },
      { type: 'h3', text: 'Can my website show my Instagram posts?' },
      {
        type: 'p',
        text: 'It can link to your profile, and some sites embed recent posts, though every embed adds weight and slows the page on mobile data. We usually link out and keep the page fast.',
      },
    ],
  },
  {
    slug: 'what-is-an-internal-tool',
    photo: PHOTOS.insightInternalTools,
    title: 'What Is an Internal Tool, and Does Your Business Need One?',
    date: '2026-11-05',
    categories: ['Tools & Systems'],
    excerpt:
      'An internal tool is software your team uses to run the business, like an admin panel or dashboard. Here are real examples and how to tell if you need one.',
    kind: 'article',
    author: WILDHANDS,
    body: [
      {
        type: 'p',
        text: "An internal tool is software your own team uses to run the business, rather than something your customers see. Admin panels, dashboards, order trackers, approval flows and automations that move information between your other tools are all internal tools. You need one when a job your team does every week is slow, error-prone or stuck in spreadsheets and WhatsApp chats, and the time lost is worth more than the tool would cost.",
      },
      { type: 'h2', text: 'What are examples of internal tools?' },
      {
        type: 'ul',
        items: [
          [{ text: 'Admin panel.', strong: true }, ' Where staff update products, prices, orders, bookings or website content without a developer.'],
          [{ text: 'Dashboard.', strong: true }, ' Sales, stock, cash and the few other numbers that matter, in one place and always up to date.'],
          [{ text: 'Order or job tracker.', strong: true }, ' Every order or job, its status, who owns it and what happens next.'],
          [{ text: 'Approval flow.', strong: true }, ' Expenses, discounts, leave or purchase requests that need a yes from the right person.'],
          [{ text: 'Client portal.', strong: true }, ' A login where clients see their own invoices, quotes or project progress. Clients use it, but your team runs it.'],
          [{ text: 'Automation.', strong: true }, ' Work that happens by itself, such as filing files, sending reminders or copying a paid order into your records.'],
        ],
      },
      { type: 'h2', text: 'What is an admin panel, and does every website need one?' },
      {
        type: 'p',
        text: "An admin panel is the private side of a website or app where you manage what the public sees. Not every website needs one, but any site where prices, products or announcements change often does, because otherwise every small change means paying a developer. Our Standard websites include an admin dashboard for editing text, images, prices and announcements for this reason.",
      },
      {
        type: 'p',
        text: [
          'A good admin panel is written for the person who uses it, not for a developer. The back office we built for ',
          { text: 'TOMORI', href: '/resources/tomori' },
          ' says in a few words what each section is for, shows times as “3 hours ago”, and says on every empty screen what will appear there.',
        ],
      },
      { type: 'h2', text: 'What makes a good business dashboard?' },
      {
        type: 'ul',
        items: [
          'It shows a handful of numbers that lead to decisions, not every number you have.',
          'It updates itself from the systems where the work happens, so nobody copies figures into it.',
          'Labels are plain English: “Unpaid invoices”, not a code from the accounts system.',
          'It works on a phone, because that is where most owners check it.',
          'Every number can be traced back to the orders or payments behind it.',
        ],
      },
      { type: 'h2', text: 'Should you buy software or build a custom tool?' },
      {
        type: 'p',
        text: "Buy when the job is the same in every business, such as payroll, accounting or email. Those products are mature and cheaper than anything built from scratch. Build when the job is how your business is different, or when off-the-shelf software forces your team into workarounds and double entry. Often the best answer is in between: keep the tools you already use and connect them, so information moves between them without anyone retyping it.",
      },
      {
        type: 'p',
        text: [
          'For a business still running on spreadsheets, our guide to ',
          { text: 'when to replace spreadsheets with a custom tool', href: '/blog/replace-spreadsheets-with-custom-tool' },
          ' walks through the options from cheapest up.',
        ],
      },
      { type: 'h2', text: 'What do internal tools look like in practice?' },
      {
        type: 'ul',
        items: [
          [
            { text: 'The Ruff Agency', href: '/resources/the-ruff-agency' },
            ': clients, contracts, invoices, tasks and a client portal in one shared workspace, instead of six separate tools.',
          ],
          [
            { text: 'Marvy', href: '/resources/marvy' },
            ': course videos filed into the right Google Drive folder, with the right people tagged, in one step.',
          ],
          [
            { text: 'Auto Flow', href: '/resources/auto-flow' },
            ': point it at a folder of images and it generates every video unattended, three at a time.',
          ],
        ],
      },
      { type: 'h2', text: 'How much does an internal tool cost?' },
      {
        type: 'p',
        text: [
          'It depends on how many screens, user roles and connections it needs, so we quote ',
          { text: 'tools and systems', href: '/use-cases/tools-and-systems' },
          ' after a discovery call, with a written scope before work starts. The useful test is hours returned: if a tool gives your team back ten hours a week, put a value on those hours and compare it with the price.',
        ],
      },
      { type: 'h2', text: 'How do you get started?' },
      {
        type: 'ol',
        items: [
          'Pick the one weekly job that wastes the most time or causes the most mistakes.',
          'Write down who does it, where the information comes from and where it ends up.',
          'Note the decision it feeds, such as what to restock, who to chase or what to pay.',
          [
            'Bring that to a ',
            { text: 'discovery call', href: '/request-a-quote' },
            ', and we will tell you what the smallest useful tool looks like.',
          ],
        ],
      },
      { type: 'h2', text: 'Frequently asked questions' },
      { type: 'h3', text: 'Is an internal tool the same as an app?' },
      {
        type: 'p',
        text: 'It is an app built for your team rather than your customers. It usually runs in the browser, so staff can use it on a laptop or a phone without installing anything.',
      },
      { type: 'h3', text: 'Can my staff use it on their phones?' },
      {
        type: 'p',
        text: 'Yes. We build every tool to work on a phone first, because that is where most people in the field, on the shop floor or on the road will use it.',
      },
      { type: 'h3', text: 'Who can see what?' },
      {
        type: 'p',
        text: 'Each person logs in, and their role decides what they can see and change. Sales staff can see orders without seeing salaries, for example. Ask any developer how access, backups and logins are handled before you agree a build.',
      },
      { type: 'h3', text: 'Can it connect to Paystack, WhatsApp or Google Sheets?' },
      {
        type: 'p',
        text: 'Usually, yes. Most services your business already uses have a way for other software to connect to them. Some, like the WhatsApp Business Platform, charge per message, so that cost belongs in the plan.',
      },
    ],
  },
  {
    slug: 'how-to-get-your-business-on-google',
    photo: PHOTOS.insightBusinessOnGoogle,
    title: 'How to Get Your Business on Google in Nigeria (Free)',
    date: '2026-11-08',
    categories: ['Websites'],
    excerpt:
      'Create a free Google Business Profile, verify it, and give Google a website it can read. Here are the steps, and what helps a small business rank higher.',
    kind: 'article',
    author: WILDHANDS,
    body: [
      {
        type: 'p',
        text: "There are two free steps. First, create and verify a Google Business Profile, which puts your business on Google Maps and in local search results. Second, give Google a website it can read and tell it where your pages are through Google Search Console. Neither costs anything, and Google does not sell higher places in its normal search results.",
      },
      { type: 'h2', text: 'Is it free to put your business on Google?' },
      {
        type: 'p',
        text: [
          'Yes. Google says you can ',
          { text: 'add or claim your business at no charge', href: 'https://support.google.com/business/answer/2911778' },
          '. It also says that it ',
          { text: 'never accepts money to include or rank sites', href: 'https://developers.google.com/search/docs/fundamentals/do-i-need-seo' },
          ' in its search results. Paid ads are a separate product and are labelled as ads.',
        ],
      },
      { type: 'h2', text: 'How do you add your business to Google Maps?' },
      {
        type: 'ol',
        items: [
          [ 'Go to ', { text: 'business.google.com/add', href: 'https://business.google.com/add' }, ' and choose to add your business.' ],
          'Enter your business name, category, phone number and website, following the steps on screen.',
          'Make sure your address is correct, or set a service area if customers do not visit you.',
          'Choose a verification method and complete it.',
          'Once verified, add your opening hours, photos, products or services, and a short description.',
        ],
      },
      {
        type: 'p',
        text: [
          'If your business already appears on Google Maps, search for it, open the listing and choose the option to claim it. If you do not serve customers at your address, such as a mobile business or one run from home, ',
          { text: 'Google’s advice', href: 'https://support.google.com/business/answer/9157481' },
          ' is to remove the address from your profile and set the areas you serve instead, up to 20 of them.',
        ],
      },
      { type: 'h2', text: 'How do you get your website to show up on Google?' },
      {
        type: 'ol',
        items: [
          'Make sure the site can be crawled: no setting that hides it from search engines, and a sitemap listing every page.',
          'Add the site to Google Search Console and verify that you own it.',
          [
            'Submit your sitemap in the Sitemaps report. Google notes that ',
            { text: 'a sitemap is only a hint', href: 'https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap' },
            ', but it helps Google find your pages.',
          ],
          'Link your website from your Google Business Profile, and your profile from your website.',
        ],
      },
      {
        type: 'p',
        text: 'Every WildHands website ships with an XML sitemap and crawl rules set up correctly, so this part is ready on launch day.',
      },
      { type: 'h2', text: 'How long does it take to appear on Google?' },
      {
        type: 'p',
        text: [
          'Google says ',
          { text: 'crawling can take anywhere from a few days to a few weeks', href: 'https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl' },
          '. Appearing for your business name usually comes first. Ranking for what you sell, such as “bakery in Lekki”, takes longer and depends on your competition. Be wary of anyone who promises a top spot: Google itself says no one can guarantee a number one ranking.',
        ],
      },
      { type: 'h2', text: 'What helps a small business rank higher?' },
      {
        type: 'ul',
        items: [
          [{ text: 'A page for each main service.', strong: true }, ' One page about “event catering in Abuja” beats one page that lists twelve services in a line each.'],
          [{ text: 'Words your customers actually search.', strong: true }, ' Write how they talk: “how much is”, “near me”, the area names they use.'],
          [{ text: 'The same name, address and phone number everywhere.', strong: true }, ' On your website, your Google Business Profile and your social media.'],
          [{ text: 'Reviews from real customers.', strong: true }, ' Ask happy customers and reply to every review, good or bad.'],
          [{ text: 'A fast site that works on a phone.', strong: true }, ' Most of your customers will find you on mobile data.'],
          [{ text: 'Real photos.', strong: true }, ' Of your work, your team and your premises, on both your profile and your site.'],
        ],
      },
      {
        type: 'p',
        text: [
          'For how to lay those pages out, see ',
          { text: 'Best Website Structure for Nigerian Businesses', href: '/blog/website-structure-nigerian-businesses' },
          '.',
        ],
      },
      { type: 'h2', text: 'Can you be on Google without a website?' },
      {
        type: 'p',
        text: [
          'Yes, a Google Business Profile works on its own and is worth having either way. But a profile is one listing. A website gives Google pages to show for every service you offer and every question your customers ask, and gives people somewhere to go when they want more than a phone number. If you sell mostly on social media, read ',
          { text: 'Do You Need a Website If You Sell on Instagram and WhatsApp?', href: '/blog/do-i-need-a-website-instagram-whatsapp' },
        ],
      },
      {
        type: 'p',
        text: [
          'Need a website Google can read? Our ',
          { text: 'websites', href: '/use-cases/websites' },
          ' start at ₦150,000 and go live 72 hours after you approve the design. ',
          { text: 'See the prices', href: '/pricing' },
          '.',
        ],
      },
      { type: 'h2', text: 'Frequently asked questions' },
      { type: 'h3', text: 'Do I need a physical shop to be on Google Maps?' },
      {
        type: 'p',
        text: 'No. If you serve customers at their location or online, remove your address from your Business Profile and set the areas you serve instead.',
      },
      { type: 'h3', text: 'Does it cost money to verify my business on Google?' },
      {
        type: 'p',
        text: 'No. Adding, claiming and verifying a Google Business Profile is free.',
      },
      { type: 'h3', text: 'Should I pay someone who guarantees first page on Google?' },
      {
        type: 'p',
        text: 'No. Google says no one can guarantee a number one ranking, and it never accepts money to rank sites in its normal results. Good SEO help explains what it will do and what results to expect, without guarantees.',
      },
      { type: 'h3', text: 'Can I offer a discount for Google reviews?' },
      {
        type: 'p',
        text: 'No. Google’s Maps content policy does not allow offering incentives, such as payment, discounts or free goods, in exchange for reviews. Ask happy customers and make it easy with the review link from your profile.',
      },
    ],
  },
]

/** Newest first. */
export function sortedPosts(): BlogPost[] {
  return [...BLOG_POSTS].sort((a, b) => b.date.localeCompare(a.date))
}

export function latestPosts(count = 3): BlogPost[] {
  return sortedPosts().slice(0, count)
}

export function postBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((post) => post.slug === slug)
}

/** Rich text flattened to plain text, for structured data and meta tags. */
export function plainText(text: RichText): string {
  if (typeof text === 'string') return text
  return text.map((part) => (typeof part === 'string' ? part : part.text)).join('')
}

/** The heading every post's closing questions sit under. */
export const FAQ_HEADING = 'Frequently asked questions'

/** A question from the foot of a post, with its answer as plain text. */
export interface PostFaq {
  question: string
  answer: string
}

/**
 * The questions under a post's "Frequently asked questions" heading. Each h3
 * is a question; the paragraphs and lists after it, up to the next h3 or h2,
 * are its answer. Feeds the post's FAQPage structured data, so the markup
 * always matches the questions a reader sees on the page.
 */
export function postFaqs(post: BlogPost): PostFaq[] {
  const start = post.body.findIndex((block) => block.type === 'h2' && block.text === FAQ_HEADING)
  if (start === -1) return []
  const faqs: PostFaq[] = []
  for (const block of post.body.slice(start + 1)) {
    if (block.type === 'h2') break
    if (block.type === 'h3') {
      faqs.push({ question: block.text, answer: '' })
      continue
    }
    const current = faqs[faqs.length - 1]
    if (!current) continue
    const text =
      block.type === 'p'
        ? plainText(block.text)
        : block.type === 'ul' || block.type === 'ol'
          ? block.items.map(plainText).join(' ')
          : ''
    if (text) current.answer = current.answer ? `${current.answer} ${text}` : text
  }
  return faqs.filter((faq) => faq.answer.length > 0)
}

/** Posts sharing a category with `post` first, then the newest others. */
export function relatedPosts(post: BlogPost, count = 3): BlogPost[] {
  const others = sortedPosts().filter((other) => other.slug !== post.slug)
  const shared = others.filter((other) =>
    other.categories.some((label) => post.categories.includes(label))
  )
  const rest = others.filter((other) => !shared.includes(other))
  return [...shared, ...rest].slice(0, count)
}

/** What a card needs: small and plain, so it can cross to the browser. */
export interface BlogCardData {
  slug: string
  href: string
  title: string
  date: string
  dateLabel: string
  shortDateLabel: string
  labels: string[]
  categorySlugs: BlogCategorySlug[]
  photo: Photo
  kind: BlogPost['kind']
  wordmark: string
}

export function toBlogCard(post: BlogPost): BlogCardData {
  return {
    slug: post.slug,
    href: `/blog/${post.slug}`,
    title: post.title,
    date: post.date,
    dateLabel: formatPostDate(post.date),
    shortDateLabel: formatPostDate(post.date, 'short'),
    labels: post.categories,
    categorySlugs: post.categories.flatMap((label) => categoryByLabel(label)?.slug ?? []),
    photo: post.photo,
    kind: post.kind,
    wordmark: post.wordmark ?? '',
  }
}

/** Cards on one page of Insights and Work, as on the reference. */
export const POSTS_PER_PAGE = 15

/**
 * "1 July 2026" or "1 Jul 2026". Fixed to UTC so the server and the browser
 * always print the same day.
 */
export function formatPostDate(iso: string, style: 'long' | 'short' = 'long'): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-NG', {
    day: 'numeric',
    month: style,
    year: 'numeric',
    timeZone: 'UTC',
  })
}
