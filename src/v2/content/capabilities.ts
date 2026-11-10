import type { LivePreviewSlug } from '@/config/previews'
import type { IconName } from '@v2/components/ui/Icon'
import type { TitlePart } from '@v2/content/use-cases'

/**
 * "What we build": one page per thing on the home page's list, at
 * /what-we-build/<slug>. Each explains what it is, who it is for, what you
 * get and how WildHands builds it, with a live preview and the real projects
 * behind it.
 *
 * Every claim comes from the main site: the service pages in
 * `src/content/services/`, the case studies in `src/content/work/`, the
 * prices in `src/v2/content/pricing.ts` and the process in
 * `src/config/site.ts`. The previews named `wh-*` are a sample shop's admin
 * panel on example data, modelled on the admin panels WildHands has built;
 * every other preview is a real project.
 *
 * Two items on the old list have no page of their own: "Websites live in 72
 * hours" is an offer, not a thing we build (it lives on Marketing sites and
 * /pricing), and "Sitemap and crawl rules" is part of Search and AI
 * visibility.
 */

export interface CapabilityPoint {
  icon: IconName
  title: string
  body: string
}

export interface CapabilityStep {
  title: string
  body: string
}

export interface Capability {
  slug: string
  /** As listed on the home page and in "More we build". */
  label: string
  /** Closes "Let's talk about …" in the call to action. */
  subject: string
  meta: { title: string; description: string }
  /** The hero heading; `highlight` runs wear the lime gradient. */
  title: TitlePart[]
  intro: string
  preview: LivePreviewSlug
  /** Under the preview: whose it is, or that the data is a sample. */
  previewNote: string
  whatItIs: { statement: string; body: string }
  whoFor: string[]
  youGet: CapabilityPoint[]
  howWeBuild: CapabilityStep[]
  /** Case study slugs, as at /resources/<slug>. */
  related: string[]
}

const SAMPLE_NOTE =
  'A sample shop on example data, in WildHands colours. It follows the admin panels we have built for real shops.'

const DISCOVERY: CapabilityStep = {
  title: 'Discovery call',
  body: 'We learn what is broken and what it is costing you in time.',
}
const PROPOSAL: CapabilityStep = {
  title: 'Scoped proposal',
  body: 'A written plan for your brief, with what is in scope and what is out.',
}

export const CAPABILITIES: Capability[] = [
  {
    slug: 'marketing-sites',
    label: 'Marketing sites',
    subject: 'your marketing site',
    meta: {
      title: 'Marketing Websites in Lagos, Nigeria',
      description:
        'A focused website built from scratch to represent your business and turn visitors into enquiries. Starter and Standard sites are live in 72 hours.',
    },
    title: [{ text: 'A site built to' }, { text: 'convert visitors', highlight: true }],
    intro:
      'A focused site that represents you and gives visitors a clear path to contact. Designed from scratch around what your business publishes, not adapted from a theme.',
    preview: 'marque',
    previewNote: 'The Marque website, designed and built by WildHands.',
    whatItIs: {
      statement: 'A strong, simple presence and a clear path to contact.',
      body: 'A marketing site is the right fit when people need to understand what you do and get in touch. We design the structure, the content model and the page templates around what you actually publish, and every site accounts for local hosting, payment and connectivity realities, not just international defaults.',
    },
    whoFor: [
      'You need a strong public presence',
      'The goal is to turn visitors into enquiries',
      'Your content changes now and then, not every hour',
    ],
    youGet: [
      {
        icon: 'monitorSmartphone',
        title: 'A custom responsive site',
        body: 'Designed for your business and built to work on every screen, phones first.',
      },
      {
        icon: 'cms',
        title: 'A CMS admin panel',
        body: 'Change words and pictures yourself. Routine changes never need a developer.',
      },
      {
        icon: 'search',
        title: 'Search and AI visibility',
        body: 'Search engine crawl rules, an XML sitemap and AI search visibility setup, from day one.',
      },
      {
        icon: 'chart',
        title: 'Simple website analytics',
        body: 'How many people came, where from, and what they looked at.',
      },
      {
        icon: 'clock',
        title: 'Live in 72 hours',
        body: 'Starter (one page, ₦150,000) and Standard (up to 4 pages, ₦250,000) are live 72 hours after you approve the design.',
      },
    ],
    howWeBuild: [
      DISCOVERY,
      {
        title: 'Design first',
        body: 'You see the design and approve it before any code is written. Starter includes 2 rounds of edits and Standard includes 3.',
      },
      {
        title: 'Build',
        body: 'Pay the deposit, half the price, to start. We build the site from scratch, with editing set up so you can make routine changes yourself.',
      },
      {
        title: 'Live',
        body: 'Starter and Standard sites go live in 72 hours. A bigger site is quoted after the discovery call.',
      },
    ],
    related: ['marque', 'tomori', 'the-ruff-agency'],
  },
  {
    slug: 'full-custom-builds',
    label: 'Full custom builds',
    subject: 'your custom build',
    meta: {
      title: 'Custom Website Builds in Lagos, Nigeria',
      description:
        'More pages and more functionality, for businesses whose website has to sell, take payments or run a back office. Built from scratch in Lagos.',
    },
    title: [{ text: 'A website that does' }, { text: 'more than represent you', highlight: true }],
    intro:
      'More pages and more functionality, for a business that needs the site to do real work: take orders and payments, run a catalogue, or carry a back office behind it.',
    preview: 'tomori',
    previewNote: 'The Tomori shop, designed and built by WildHands.',
    whatItIs: {
      statement: 'Built for what you publish, and for what the site has to do.',
      body: 'A full custom build starts from your content and your workflow, not a theme. Tomori is one: a phone-first shop for hand-dyed Adire with a Paystack checkout that takes card, transfer or USSD, delivery fees shown before anyone pays, and a back office the owner runs from her own phone.',
    },
    whoFor: [
      'The site needs to take orders or payments',
      'What you publish does not fit a template',
      'Your team will run it day to day, without a developer',
    ],
    youGet: [
      {
        icon: 'layers',
        title: 'Pages designed for your content',
        body: 'Templates and a content model built around what you publish, not adapted from someone else’s site.',
      },
      {
        icon: 'creditCard',
        title: 'Payments that work in Nigeria',
        body: 'A Paystack checkout that takes card, transfer or USSD, with every price in naira.',
      },
      {
        icon: 'layoutDashboard',
        title: 'A back office for your team',
        body: 'An admin written for the person running the business, not for a developer.',
      },
      {
        icon: 'listChecks',
        title: 'Everything a site ships with',
        body: 'A CMS admin panel, crawl rules, an XML sitemap, AI search visibility setup and simple website analytics.',
      },
      {
        icon: 'globe',
        title: 'Built for local realities',
        body: 'Local hosting, payment and connectivity are planned for, not just international defaults.',
      },
    ],
    howWeBuild: [
      DISCOVERY,
      PROPOSAL,
      {
        title: 'Custom quote',
        body: 'One price, worked out from that scope. The price follows the scope, not the other way around.',
      },
      {
        title: 'Build and hand over',
        body: 'Editing is part of the build, not an add-on, so routine changes never need a developer.',
      },
    ],
    related: ['tomori', 'the-ruff-agency', 'marque'],
  },
  {
    slug: 'cms-admin-panel',
    label: 'CMS admin panel',
    subject: 'your admin panel',
    meta: {
      title: 'CMS Admin Panels for Business Websites',
      description:
        'Every WildHands site ships with an admin panel written for the person running the business: change words and pictures, preview them, then publish.',
    },
    title: [{ text: 'Change your site' }, { text: 'without a developer', highlight: true }],
    intro:
      'Every site we build ships with an admin panel written for the person running the business. Change any words or pictures, see them in a live preview, and publish when you are ready.',
    preview: 'wh-cms',
    previewNote: SAMPLE_NOTE,
    whatItIs: {
      statement: 'Editing is part of the build, not an add-on.',
      body: 'We set up the content model so routine changes never need a developer. Each section says what it is for in a few words, every empty screen says what will show up there, and your changes stay private until you choose to publish them.',
    },
    whoFor: [
      'You update prices, photos or wording yourself',
      'You want to check a change before customers see it',
      'You would rather not file a ticket for every edit',
    ],
    youGet: [
      {
        icon: 'penTool',
        title: 'Words and pictures',
        body: 'Headings, paragraphs, buttons and photos, edited in plain-language fields beside a live preview.',
      },
      {
        icon: 'eye',
        title: 'Save, then publish',
        body: 'Save keeps changes private. Publish is the only thing that changes the live site.',
      },
      {
        icon: 'layers',
        title: 'Products, pages and posts',
        body: 'Products and stock, policy pages such as shipping and returns, and a blog where the site needs one.',
      },
      {
        icon: 'badgeCheck',
        title: 'Links checked first',
        body: 'A button that points nowhere is flagged before it goes live, so nobody lands on a missing page.',
      },
      {
        icon: 'phone',
        title: 'Runs from a phone',
        body: 'The Tomori owner runs her whole shop, admin included, from her own phone.',
      },
    ],
    howWeBuild: [
      {
        title: 'Map what changes',
        body: 'We list everything on the site that changes, and who changes it.',
      },
      {
        title: 'Name things in your words',
        body: 'Fields are labelled the way your business talks, so the admin reads like your shop, not a database.',
      },
      {
        title: 'Build it with the site',
        body: 'The admin is built alongside the site, so its preview shows the real pages, not an approximation.',
      },
      {
        title: 'Hand over',
        body: 'We walk you through it. Times read “3 hours ago”, and nothing needs a manual.',
      },
    ],
    related: ['tomori', 'marque', 'the-ruff-agency'],
  },
  {
    slug: 'search-visibility',
    label: 'Search and AI visibility',
    subject: 'your search setup',
    meta: {
      title: 'Search and AI Visibility Setup',
      description:
        'Crawl rules, an XML sitemap and AI search visibility setup on every WildHands site, so search engines and AI assistants can read what your business does.',
    },
    title: [{ text: 'Set up to be found' }, { text: 'from day one', highlight: true }],
    intro:
      'Every site we build ships with search engine crawl rules, an XML sitemap and AI search visibility setup, so search engines and AI assistants can read what your business does.',
    preview: 'wh-search',
    previewNote: SAMPLE_NOTE,
    whatItIs: {
      statement: 'The groundwork search engines and AI assistants read first.',
      body: 'Crawl rules tell search engines which pages to read and which to skip, such as the admin. The XML sitemap lists every public page. AI search visibility setup gives AI assistants a plain summary of the business. Page titles and descriptions are fields you can edit yourself. None of it guarantees a ranking, and we will not promise you one.',
    },
    whoFor: [
      'You are launching a new site',
      'Your current site has no sitemap or crawl rules',
      'You want AI assistants to be able to read what you do',
    ],
    youGet: [
      {
        icon: 'sitemap',
        title: 'An XML sitemap',
        body: 'Every public page listed, built from the site itself so new pages are included.',
      },
      {
        icon: 'shield',
        title: 'Crawl rules',
        body: 'A robots.txt that keeps private areas such as the admin out of search and points crawlers to the sitemap.',
      },
      {
        icon: 'bot',
        title: 'AI search visibility setup',
        body: 'A plain-text summary of the business, in the llms.txt format, for AI assistants to read.',
      },
      {
        icon: 'fileText',
        title: 'Titles and descriptions',
        body: 'Edited in the admin panel, with a preview of how the page shows in search and in shared links.',
      },
      {
        icon: 'mapPin',
        title: 'Business details',
        body: 'Your name, location and contact details marked up so search engines can read them.',
      },
    ],
    howWeBuild: [
      {
        title: 'Part of every build',
        body: 'Crawl rules, the sitemap and the AI summary ship with the site. They are not an add-on.',
      },
      {
        title: 'Kept current',
        body: 'The sitemap is generated from the site’s own pages, so nobody has to remember to update it.',
      },
      {
        title: 'Yours to edit',
        body: 'Titles and descriptions sit in the admin panel, next to the rest of your content.',
      },
      {
        title: 'Honest about results',
        body: 'We set up what search engines and AI assistants need to read the site. We do not promise rankings.',
      },
    ],
    related: ['tomori', 'marque', 'the-ruff-agency'],
  },
  {
    slug: 'website-analytics',
    label: 'Simple website analytics',
    subject: 'your analytics',
    meta: {
      title: 'Simple Website Analytics, No Ad Trackers',
      description:
        'Visitors counted on your own site with no ad trackers: who is browsing now, where they came from, what they looked at, and when the site is busiest.',
    },
    title: [{ text: 'Know who visits,' }, { text: 'without ad trackers', highlight: true }],
    intro:
      'Visitors are counted on your own site, with no ad trackers. See who is browsing now, where they came from, what they looked at and when the site is busiest.',
    preview: 'wh-analytics',
    previewNote: SAMPLE_NOTE,
    whatItIs: {
      statement: 'The few numbers that matter, in plain words.',
      body: 'Simple website analytics ships with every site we build. It answers the questions a business owner actually asks: how many people came, where from, on what device, and what they did once they arrived. Times are shown in Lagos time, and it sits in the same admin panel as everything else.',
    },
    whoFor: [
      'You want to know whether the site is working',
      'You would rather not put ad trackers on your customers',
      'You do not have time to learn a big analytics tool',
    ],
    youGet: [
      {
        icon: 'eye',
        title: 'Browsing now',
        body: 'How many people are on the site at this moment.',
      },
      {
        icon: 'globe',
        title: 'Where visitors came from',
        body: 'Instagram, WhatsApp, Google, or typed in directly.',
      },
      {
        icon: 'monitorSmartphone',
        title: 'Devices and cities',
        body: 'Phone or computer, and which cities your visitors are in.',
      },
      {
        icon: 'clock',
        title: 'Busiest times',
        body: 'The days and hours the site is busiest, in Lagos time.',
      },
      {
        icon: 'trendingUp',
        title: 'From visit to sale',
        body: 'On a shop: how many looked at a piece, added it to the bag, and paid.',
      },
      {
        icon: 'qr',
        title: 'QR code scans',
        body: 'Codes printed on delivery bags report every scan, and can be pointed somewhere new after printing.',
      },
    ],
    howWeBuild: [
      {
        title: 'Counted on your site',
        body: 'Visits are recorded by the site itself, with no ad trackers.',
      },
      {
        title: 'In the admin',
        body: 'The numbers sit in the same admin panel you already use for the site.',
      },
      {
        title: 'Labelled as answers',
        body: 'Each view reads as an answer, such as “Browsing now”, not as a metric name.',
      },
      {
        title: 'Only what you use',
        body: 'We add the views your business needs and leave out the rest.',
      },
    ],
    related: ['tomori'],
  },
  {
    slug: 'quotes-and-invoices',
    label: 'Quotes and invoices',
    subject: 'your quotes and invoices',
    meta: {
      title: 'Quote and Invoice Generator',
      description:
        'Quotes your client accepts on the page, and an invoice that fills itself from the accepted option. Built by WildHands in Lagos.',
    },
    title: [{ text: 'Quotes your client' }, { text: 'accepts on the page', highlight: true }],
    intro:
      'Send a quote with options. The client picks one, watches the total update and accepts it, and the accepted option becomes the invoice, with nothing retyped.',
    preview: 'rayo',
    previewNote: 'Rayo, designed and built by WildHands, on sample data.',
    whatItIs: {
      statement: 'One set of numbers, from quote to paid.',
      body: 'Most freelancers and small studios write a quote in one document, then rebuild the same numbers in an invoice once the client agrees. We build quoting and invoicing that carries the numbers through: your logo, bank details and terms already on the invoice, a ledger of what is paid, part paid and overdue, and PDFs when you need them.',
    },
    whoFor: [
      'Freelancers and small studios',
      'Businesses that send quotes with options',
      'Anyone retyping a quote into an invoice',
    ],
    youGet: [
      {
        icon: 'listChecks',
        title: 'Quotes with options',
        body: 'The client picks an option and watches the total update.',
      },
      {
        icon: 'check',
        title: 'Accepted on the page',
        body: 'No PDF to sign and no email to reply to. Designed for a phone first, because most clients open their quote on one.',
      },
      {
        icon: 'receipt',
        title: 'Invoices that fill themselves',
        body: 'The accepted option becomes the invoice, with your logo, bank details and terms on it.',
      },
      {
        icon: 'wallet',
        title: 'A ledger that follows the money',
        body: 'Paid, part paid and overdue, and what is still owed on each invoice, deposits included.',
      },
      {
        icon: 'mail',
        title: 'PDFs and email',
        body: 'Documents export as PDFs, and the mail goes out on your behalf.',
      },
      {
        icon: 'creditCard',
        title: 'Paystack or Stripe',
        body: 'Invoices can settle through Paystack or Stripe, depending on where the client is.',
      },
    ],
    howWeBuild: [
      {
        title: 'Start from your documents',
        body: 'We look at the quotes and invoices you send today, and at what gets retyped between them.',
      },
      {
        title: 'Two questions first',
        body: 'The overview answers where each quote stands and what money is in or owed, before anything else.',
      },
      {
        title: 'Phone first for clients',
        body: 'The page your client opens is designed for a phone first.',
      },
      {
        title: 'Connected to how you get paid',
        body: 'Payment, PDFs and email are wired in, so a quote can go all the way to paid.',
      },
    ],
    related: ['rayo', 'the-ruff-agency'],
  },
  {
    slug: 'client-management',
    label: 'Client management dashboard',
    subject: 'your client workspace',
    meta: {
      title: 'Client Management Dashboards',
      description:
        'Contacts, contracts, invoices and tasks in one workspace your team shares, with a portal where each client sees their own records.',
    },
    title: [{ text: 'Every client,' }, { text: 'in one workspace', highlight: true }],
    intro:
      'Contacts, contracts, invoices and tasks in one place your whole team can see, with a portal where each client sees their own records.',
    preview: 'fey',
    previewNote: 'The Ruff Agency’s workspace, designed and built by WildHands.',
    whatItIs: {
      statement: 'One workspace instead of six tools that do not know about each other.',
      body: 'Clients in a spreadsheet, invoices in another system and handoffs in email means nobody can see who is doing what. For The Ruff Agency we built one workspace where contacts, contracts, invoices and tasks sit together, every member sees the same data gated by their role, and each client gets a portal on its own address with its own sign-in.',
    },
    whoFor: [
      'Agencies and service businesses',
      'Teams that track clients in a spreadsheet',
      'Businesses whose clients chase progress over email',
    ],
    youGet: [
      {
        icon: 'users',
        title: 'Clients and contacts',
        body: 'Everyone you work with, and everything about them, in one place.',
      },
      {
        icon: 'fileText',
        title: 'Contracts and documents',
        body: 'A vault that decides which client portals can see which document.',
      },
      {
        icon: 'receipt',
        title: 'Invoices and payments',
        body: 'From draft to sent to paid, settled through Stripe or Paystack.',
      },
      {
        icon: 'listChecks',
        title: 'Tasks',
        body: 'Who is doing what, with updates sent to WhatsApp for people who live in messaging.',
      },
      {
        icon: 'globe',
        title: 'A client portal',
        body: 'The same records, a different view: read-only or collaborative, depending on what each client is given.',
      },
      {
        icon: 'lock',
        title: 'Access by role',
        body: 'Each member sees what their role allows, enforced in the database itself.',
      },
    ],
    howWeBuild: [
      DISCOVERY,
      {
        title: 'One database, two views',
        body: 'Your team and your clients read the same records through different doors, so nothing is copied between them.',
      },
      {
        title: 'Access in the database',
        body: 'Who sees what is enforced with row-level security, not just hidden in the interface.',
      },
      {
        title: 'Shipped in stages',
        body: 'The Ruff Agency has shipped 88 database migrations and is still shipping.',
      },
    ],
    related: ['the-ruff-agency', 'rayo'],
  },
  {
    slug: 'custom-web-apps',
    label: 'Custom web apps',
    subject: 'your web app',
    meta: {
      title: 'Custom Web App Development in Lagos, Nigeria',
      description:
        'Software your team or your customers log into, built around how you work, for a job off-the-shelf tools do not quite do.',
    },
    title: [{ text: 'Software built around' }, { text: 'how you work', highlight: true }],
    intro:
      'Software your team or your customers log into, built for a job that off-the-shelf tools do not quite do.',
    preview: 'planes',
    previewNote: 'Planes, designed and built by WildHands.',
    whatItIs: {
      statement: 'Worth building when generic software makes the work harder.',
      body: 'We build web apps around your real workflow, so the software fits the process instead of the process bending to the software. The best sign an app is worth building is a spreadsheet that three people maintain and everybody is slightly afraid of. If an off-the-shelf tool fits, we will tell you.',
    },
    whoFor: [
      'Your team needs something to log into to do the work',
      'The process is specific to how your business runs',
      'Off-the-shelf software almost fits, but not quite',
    ],
    youGet: [
      {
        icon: 'workflow',
        title: 'Built around your workflow',
        body: 'Every app here started as a workflow someone was doing by hand.',
      },
      {
        icon: 'monitorSmartphone',
        title: 'Web, desktop or phone',
        body: 'Planes runs from one codebase on the web and as a desktop app, with an Android app alongside.',
      },
      {
        icon: 'lock',
        title: 'Private by default',
        body: 'Data sits under row-level security, so each person reads only what is theirs.',
      },
    ],
    howWeBuild: [
      DISCOVERY,
      PROPOSAL,
      {
        title: 'Custom quote',
        body: 'What moves the number is how many distinct workflows the app supports, not how many screens it has.',
      },
      {
        title: 'Build',
        body: 'The shape of the build follows the shape of the problem, which is why none of our apps look like each other.',
      },
    ],
    related: ['rayo', 'planes', 'dory'],
  },
  {
    slug: 'internal-tools',
    label: 'Internal-facing tools',
    subject: 'your internal tool',
    meta: {
      title: 'Internal Tools for Business Teams',
      description:
        'Tools built for one specific workflow and the people who live with it every day, so the routine runs itself and only asks when something looks wrong.',
    },
    title: [{ text: 'Tools for the job' }, { text: 'your team does all day', highlight: true }],
    intro:
      'Built for one specific workflow and the people who have to live with it every day, so the routine runs itself.',
    preview: 'marvy',
    previewNote: 'Marvy, designed and built by WildHands.',
    whatItIs: {
      statement: 'The same routine, twenty times a sitting, done in one step.',
      body: 'A course-production team was finding a Google Drive folder by hand for every video, dragging the file in and pasting four comments to tag reviewers. Marvy reads the course and week from the file name, finds the folder, uploads the video with its audio and tags the right people. That is what an internal tool is for: one routine your team repeats, done properly.',
    },
    whoFor: [
      'A task your team repeats many times a day',
      'A routine that lives in one person’s head',
      'Work that runs between tools you already pay for',
    ],
    youGet: [
      {
        icon: 'check',
        title: 'Quiet by default',
        body: 'The usual case asks nothing. The tool speaks up only when something looks wrong, and then asks one clear question.',
      },
      {
        icon: 'shield',
        title: 'Safe by design',
        body: 'Nothing Marvy does can delete anything in Drive. A near match is shown, never accepted.',
      },
      {
        icon: 'monitorSmartphone',
        title: 'Runs where your team works',
        body: 'Marvy runs on the team’s own computers, with no server and no tracking, from 375 pixels wide to full screen.',
      },
      {
        icon: 'users',
        title: 'Clear about who did what',
        body: 'Comments post as whoever is signed in.',
      },
    ],
    howWeBuild: [
      {
        title: 'Watch the routine',
        body: 'We learn it step by step, and what it costs in time.',
      },
      {
        title: 'Remove steps',
        body: 'The goal is removing manual steps for good, not making them faster.',
      },
      {
        title: 'Fail safe',
        body: 'When the tool cannot be sure, it stops and asks rather than guessing.',
      },
      {
        title: 'Measured in hours',
        body: 'We judge the tool by how much time it gives back.',
      },
    ],
    related: ['marvy', 'lazy-meet', 'auto-flow'],
  },
  {
    slug: 'live-dashboards',
    label: 'Live dashboards',
    subject: 'your dashboard',
    meta: {
      title: 'Live Business Dashboards',
      description:
        'The numbers that matter in one live view instead of rebuilt every week, pulled from data your business already produces.',
    },
    title: [{ text: 'The numbers that matter,' }, { text: 'in one place', highlight: true }],
    intro:
      'Data visibility and live tracking, so the numbers that matter are in one place instead of rebuilt every week.',
    preview: 'wh-dashboard',
    previewNote: SAMPLE_NOTE,
    whatItIs: {
      statement: 'How is it going, and what do I do next?',
      body: 'Most teams already produce the data and lose it across several tools. The work is pulling it into one live view rather than generating anything new. A good dashboard answers how the business is doing first, then what needs doing next.',
    },
    whoFor: [
      'The same report gets rebuilt from scratch every week',
      'Nobody can see what is happening without digging',
      'Your numbers sit in tools that do not talk to each other',
    ],
    youGet: [
      {
        icon: 'gauge',
        title: 'Live totals',
        body: 'Today’s and this week’s figures, updated as orders come in.',
      },
      {
        icon: 'listChecks',
        title: 'What needs doing',
        body: 'Orders to pack, unread messages and overdue debts, in one list.',
      },
      {
        icon: 'wallet',
        title: 'Money in and out',
        body: 'Takings, costs and profit in the same place.',
      },
      {
        icon: 'download',
        title: 'Reports to print',
        body: 'A daily report, one day at a time, to print or download.',
      },
      {
        icon: 'database',
        title: 'From data you already have',
        body: 'Pulled from the tools and records you already keep, not typed in again.',
      },
    ],
    howWeBuild: [
      {
        title: 'Count the hours',
        body: 'We start by working out how many hours the current reporting costs, because that is what the build is measured against.',
      },
      {
        title: 'Find the data',
        body: 'We trace where each number lives today and pull it into one view.',
      },
      {
        title: 'Answer two questions first',
        body: 'How it is going, then what to do next. Everything else is one tap away.',
      },
      {
        title: 'Judged on hours returned',
        body: 'If we cannot say how much time it saves you, it was not worth building.',
      },
    ],
    related: ['the-ruff-agency', 'dory', 'tomori'],
  },
  {
    slug: 'workflow-automation',
    label: 'Workflow automation',
    subject: 'your automation',
    meta: {
      title: 'Workflow Automation for Businesses',
      description:
        'Automation that removes the manual steps between your tools for good. Judged by the hours it gives back.',
    },
    title: [{ text: 'Remove the manual steps' }, { text: 'for good', highlight: true }],
    intro:
      'Automation that removes the manual steps in your day permanently. The goal is removing the step, not doing it faster.',
    preview: 'autoflow',
    previewNote: 'Auto Flow, designed and built by WildHands.',
    whatItIs: {
      statement: 'The same clicks, done for you, unattended.',
      body: 'Auto Flow drives Google Flow through a whole folder of images: upload, generate, download, with nobody at the keyboard. A 24-image batch that took roughly two hours of supervised clicking now runs in about half an hour, unattended. That is the test for every automation we build: the hours it gives back.',
    },
    whoFor: [
      'Someone repeats the same clicks all day',
      'Data is re-keyed by hand between tools',
      'The process is stable enough to automate',
    ],
    youGet: [
      {
        icon: 'bot',
        title: 'Runs unattended',
        body: 'Start it and walk away. Auto Flow keeps up to three generations in flight at once.',
      },
      {
        icon: 'repeat',
        title: 'Picks up where it stopped',
        body: 'Progress is saved as it goes, so an interrupted run resumes instead of starting again.',
      },
      {
        icon: 'badgeCheck',
        title: 'Checks its own work',
        body: 'A step counts as done only when it can be confirmed two ways. Failures are caught and retried once.',
      },
      {
        icon: 'shield',
        title: 'Within the rules',
        body: 'We will not build automation that breaks a platform’s terms of service.',
      },
      {
        icon: 'hourglass',
        title: 'Measured in hours',
        body: 'We find out what the process costs in time first, and measure the build against it.',
      },
    ],
    howWeBuild: [
      DISCOVERY,
      {
        title: 'Map every step',
        body: 'We write down the routine exactly as it runs today, including the steps people forget they do.',
      },
      {
        title: 'Build and verify',
        body: 'Each step is checked as it runs, so a hiccup reads as a failure, never as a success.',
      },
      {
        title: 'Measure',
        body: 'The finished build is measured against the hours the old process cost.',
      },
    ],
    related: ['auto-flow', 'marvy', 'lazy-meet'],
  },
  {
    slug: 'connected-tools',
    label: 'Connecting the tools you use',
    subject: 'connecting your tools',
    meta: {
      title: 'Connecting the Tools Your Business Uses',
      description:
        'Paystack, Stripe, Google, WhatsApp, email and more, connected so data moves between them without anyone re-keying it.',
    },
    title: [{ text: 'Your tools,' }, { text: 'talking to each other', highlight: true }],
    intro:
      'We connect the tools you already pay for, so data moves between them without anyone re-keying it.',
    preview: 'lazy-meet',
    previewNote: 'Lazy Meet, designed and built by WildHands. It reads up to three Google calendars.',
    whatItIs: {
      statement: 'The gap between your tools is where the manual work lives.',
      body: 'Often we do not replace the software you already pay for. We build the piece that sits between those tools, because that gap is usually where someone is copying data by hand. Lazy Meet reads three Google calendars and joins each call on time, muted, without anyone opening a link.',
    },
    whoFor: [
      'Data is copied by hand from one tool to another',
      'You pay for tools that do not know about each other',
      'Your team lives in WhatsApp more than in dashboards',
    ],
    youGet: [
      {
        icon: 'creditCard',
        title: 'Payments',
        body: 'Paystack and Stripe, for clients at home and abroad.',
      },
      {
        icon: 'calendarCheck',
        title: 'Google',
        body: 'Calendar and Drive: Lazy Meet reads calendars, and Marvy files videos into the right Drive folder.',
      },
      {
        icon: 'bank',
        title: 'Banking',
        body: 'Dory shows a Kuda balance and makes transfers from it, beside the budget.',
      },
      {
        icon: 'messageCircle',
        title: 'Email and WhatsApp',
        body: 'Transactional email through Resend, and a WhatsApp bot that sends task updates.',
      },
      {
        icon: 'sparkle',
        title: 'AI models',
        body: 'Claude, Gemini and Deepgram, used where they remove real work.',
      },
      {
        icon: 'lock',
        title: 'Only the access needed',
        body: 'Lazy Meet asks for read-only calendar access and nothing more, and keeps its keys encrypted in the system keychain.',
      },
    ],
    howWeBuild: [
      {
        title: 'List the tools',
        body: 'Everything you use today, and where data moves between them by hand.',
      },
      {
        title: 'Find the gap',
        body: 'We build the missing piece rather than replacing what already works.',
      },
      {
        title: 'Ask for least access',
        body: 'Each connection asks only for what it needs to do its job.',
      },
      {
        title: 'Fail safe',
        body: 'When a connection cannot confirm what it is doing, it stops before acting.',
      },
    ],
    related: ['lazy-meet', 'marvy', 'dory'],
  },
]

export const CAPABILITY_SLUGS = CAPABILITIES.map((capability) => capability.slug)

export function capabilityBySlug(slug: string): Capability | undefined {
  return CAPABILITIES.find((capability) => capability.slug === slug)
}

/** The route each capability page lives at. */
export function capabilityHref(slug: string): string {
  return `/what-we-build/${slug}`
}
