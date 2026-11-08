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
import type { IconName } from '@v2/components/ui/Icon'

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

export type BlogCategorySlug = 'websites'

export interface BlogCategory {
  slug: BlogCategorySlug
  /** On a card or an article, for one post. */
  label: string
  /** On the filter tab. */
  tab: string
}

/** The insight categories with published articles, labelled as on the main site (INSIGHT_CATEGORY_LABELS). */
export const BLOG_CATEGORIES: BlogCategory[] = [
  { slug: 'websites', label: 'Websites', tab: 'Websites' },
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
  /** Seed for the stand-in art. */
  artSeed: number
  /** "story" posts get the plain card with a wordmark instead of art. None use it yet. */
  kind: 'article' | 'story'
  /** The pictogram drawn over the art. */
  icon: IconName
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
    artSeed: 1,
    kind: 'article',
    icon: 'globe',
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
    artSeed: 2,
    kind: 'article',
    icon: 'bag',
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
    artSeed: 3,
    kind: 'article',
    icon: 'sparkle',
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
    artSeed: 4,
    kind: 'article',
    icon: 'chart',
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
    artSeed: 5,
    kind: 'article',
    icon: 'qr',
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
    artSeed: 6,
    kind: 'article',
    icon: 'mail',
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
  artSeed: number
  icon: IconName
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
    artSeed: post.artSeed,
    icon: post.icon,
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
