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
  'A sample shop on example data, in WildHands colours. It follows the back offices we have built for real shops.'

const DISCOVERY: CapabilityStep = {
  title: 'Discovery call',
  body: 'We learn what is broken and what it is costing you in time.',
}
const PROPOSAL: CapabilityStep = {
  title: 'Written plan',
  body: 'A written plan for your brief, with what we will build and what we will not.',
}

export const CAPABILITIES: Capability[] = [
  {
    slug: 'marketing-sites',
    label: 'Marketing sites',
    subject: 'your marketing site',
    meta: {
      title: 'Marketing websites in Lagos, Nigeria',
      description:
        'A website built from scratch to show what your business does and bring in enquiries. Starter and Standard sites are live in 72 hours.',
    },
    title: [{ text: 'A site that turns' }, { text: 'visitors into enquiries', highlight: true }],
    intro:
      'A clear site that shows what you do and makes it easy to contact you. We design it from scratch around your business, not from a theme.',
    preview: 'marque',
    previewNote: 'The Marque website, designed and built by WildHands.',
    whatItIs: {
      statement: 'A clear, simple site and an easy way to get in touch.',
      body: 'A marketing site is the right fit when people need to understand what you do and then contact you. We plan every page around what you actually put on your site. We also plan for how people here use the web, such as customers opening your site on a phone, on mobile data.',
    },
    whoFor: [
      'You need a clear place online for your business',
      'You want visitors to call, message or email you',
      'Your words and prices change now and then, not every hour',
    ],
    youGet: [
      {
        icon: 'monitorSmartphone',
        title: 'A site made for you',
        body: 'Designed for your business and built to work on every screen, phones first.',
      },
      {
        icon: 'cms',
        title: 'Edit it yourself',
        body: 'On Standard, a simple dashboard where you change words and photos yourself, with no developer needed.',
      },
      {
        icon: 'search',
        title: 'Easy to find on Google',
        body: 'Google can read every page from day one, and AI assistants get a plain summary of what you do.',
      },
      {
        icon: 'chart',
        title: 'See who visits',
        body: 'On Standard: how many people came, where from, and what they looked at.',
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
        body: 'You see the design and approve it before we build anything. Starter includes 2 rounds of edits and Standard includes 3.',
      },
      {
        title: 'Build',
        body: 'Pay the deposit, half the price, to start. We build the site from scratch. On Standard, we set it up so you can change words and photos yourself.',
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
      title: 'Custom website builds in Lagos, Nigeria',
      description:
        'More pages and more features, for a business whose website has to sell, take payments or run a back office. Built from scratch in Lagos.',
    },
    title: [{ text: 'A website that does' }, { text: 'more than represent you', highlight: true }],
    intro:
      'More pages and more features, for a business that needs the site to do real work: take orders and payments, show a catalogue, or run a back office behind it.',
    preview: 'tomori',
    previewNote: 'The Tomori shop, designed and built by WildHands.',
    whatItIs: {
      statement: 'Built for what you sell, and for what the site has to do.',
      body: 'A full custom build starts from your products and how you work, not a theme. Tomori is one: a shop for hand-dyed Adire, built for a phone. Its Paystack checkout takes card, transfer or USSD. Delivery fees show before anyone pays. The owner runs the back office from her own phone.',
    },
    whoFor: [
      'The site needs to take orders or payments',
      'What you sell does not fit a template',
      'Your team will run it day to day, without a developer',
    ],
    youGet: [
      {
        icon: 'layers',
        title: 'Pages made for what you sell',
        body: 'Every page is planned around your products and your words, not copied from someone else’s site.',
      },
      {
        icon: 'creditCard',
        title: 'Payments that work in Nigeria',
        body: 'A Paystack checkout that takes card, transfer or USSD, with every price in naira.',
      },
      {
        icon: 'layoutDashboard',
        title: 'A back office for your team',
        body: 'Your back office, on your phone or laptop, written for the person running the business.',
      },
      {
        icon: 'listChecks',
        title: 'Everything a site comes with',
        body: 'A simple dashboard to change words and photos, pages Google can read, a summary for AI assistants, and visitor numbers.',
      },
      {
        icon: 'mapPin',
        title: 'Built for how Nigeria works',
        body: 'Planned for customers on phones and mobile data, paying in naira by card, transfer or USSD.',
      },
    ],
    howWeBuild: [
      DISCOVERY,
      PROPOSAL,
      {
        title: 'Custom quote',
        body: 'One price, worked out from that plan. The price follows the work, not the other way around.',
      },
      {
        title: 'Build and hand over',
        body: 'Editing is part of the build, not an extra, so routine changes never need a developer.',
      },
    ],
    related: ['tomori', 'the-ruff-agency', 'marque'],
  },
  {
    slug: 'cms-admin-panel',
    label: 'Edit your site yourself',
    subject: 'editing your own site',
    meta: {
      title: 'A dashboard to edit your own website',
      description:
        'Change the words and photos on your site yourself, from a simple dashboard written for the person running the business. Check it in a preview, then publish.',
    },
    title: [{ text: 'Change your site' }, { text: 'without a developer', highlight: true }],
    intro:
      'We give you a simple dashboard where you change words and photos yourself. You see each change in a preview, and publish it when you are ready.',
    preview: 'wh-cms',
    previewNote: SAMPLE_NOTE,
    whatItIs: {
      statement: 'Editing is part of the build, not an extra.',
      body: 'We set it up so routine changes never need a developer. Each section says what it is for in a few words. Every empty screen says what will show up there. Your changes stay private until you choose to publish them.',
    },
    whoFor: [
      'You update prices, photos or wording yourself',
      'You want to check a change before customers see it',
      'You would rather not message a developer for every edit',
    ],
    youGet: [
      {
        icon: 'penTool',
        title: 'Words and pictures',
        body: 'Headings, paragraphs, buttons and photos, edited in plain boxes beside a live preview.',
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
        body: 'The Tomori owner runs her whole shop, back office included, from her own phone.',
      },
    ],
    howWeBuild: [
      {
        title: 'Map what changes',
        body: 'We list everything on the site that changes, and who changes it.',
      },
      {
        title: 'Name things in your words',
        body: 'Every box is labelled the way your business talks, so the dashboard reads like your shop, not like software.',
      },
      {
        title: 'Build it with the site',
        body: 'We build the dashboard alongside the site, so its preview shows your real pages.',
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
    label: 'Getting found in search',
    subject: 'getting found in search',
    meta: {
      title: 'Getting found on Google and AI assistants',
      description:
        'Every WildHands site is set up so Google and other search engines can read each page, and AI assistants can read a plain summary of what your business does.',
    },
    title: [{ text: 'Set up to be found' }, { text: 'from day one', highlight: true }],
    intro:
      'Every site we build is set up so Google can find each page, and AI assistants can read a plain summary of what your business does.',
    preview: 'wh-search',
    previewNote: SAMPLE_NOTE,
    whatItIs: {
      statement: 'The groundwork Google and AI assistants read first.',
      body: 'We tell search engines which pages to read and which to skip, such as your dashboard. We give them a list of every public page. AI assistants get a plain summary of the business. You can edit page titles and descriptions yourself. None of it guarantees a ranking, and we will not promise you one.',
    },
    whoFor: [
      'You are launching a new site',
      'Your current site was never set up for search engines',
      'You want AI assistants to be able to read what you do',
    ],
    youGet: [
      {
        icon: 'sitemap',
        title: 'A list of every page',
        body: 'Search engines get a list of every public page, made from the site itself, so new pages are added.',
      },
      {
        icon: 'search',
        title: 'Private pages kept out',
        body: 'Your dashboard and other private pages stay out of search results.',
      },
      {
        icon: 'bot',
        title: 'A summary for AI',
        body: 'A plain-text summary of your business, written for AI assistants to read.',
      },
      {
        icon: 'fileText',
        title: 'Titles and descriptions',
        body: 'Edited in your dashboard, with a preview of how the page looks on Google and in shared links.',
      },
      {
        icon: 'mapPin',
        title: 'Business details',
        body: 'Your name, location and contact details set out so search engines can read them.',
      },
    ],
    howWeBuild: [
      {
        title: 'Part of every build',
        body: 'The page list, the private-page rules and the AI summary come with the site. They are not an extra.',
      },
      {
        title: 'Kept current',
        body: 'The page list updates itself from the site’s own pages, so nobody has to remember to do it.',
      },
      {
        title: 'Yours to edit',
        body: 'Titles and descriptions sit in your dashboard, next to the rest of your words and photos.',
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
    label: 'See who visits your site',
    subject: 'your visitor numbers',
    meta: {
      title: 'Simple visitor numbers, no ad trackers',
      description:
        'See how many people visited your site and what they looked at, with no ad trackers: who is browsing now, where they came from and when the site is busiest.',
    },
    title: [{ text: 'Know who visits,' }, { text: 'without ad trackers', highlight: true }],
    intro:
      'Visitors are counted on your own site, with no ad trackers. See who is browsing now, where they came from, what they looked at and when the site is busiest.',
    preview: 'wh-analytics',
    previewNote: SAMPLE_NOTE,
    whatItIs: {
      statement: 'The few numbers that matter, in plain words.',
      body: 'Visitor numbers come with Standard. They answer the questions a business owner actually asks: how many people came, where from, on what device, and what they did once they arrived. Times are shown in Lagos time, and the numbers sit in the same dashboard as everything else.',
    },
    whoFor: [
      'You want to know whether the site is working',
      'You would rather not put ad trackers on your customers',
      'You do not have time to learn charts you cannot read',
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
        title: 'In your dashboard',
        body: 'The numbers sit in the same dashboard you already use for the site.',
      },
      {
        title: 'Labelled as answers',
        body: 'Each number reads as an answer, such as “Browsing now”, not as a technical name.',
      },
      {
        title: 'Only what you use',
        body: 'We add the numbers your business needs and leave out the rest.',
      },
    ],
    related: ['tomori'],
  },
  {
    slug: 'quotes-and-invoices',
    label: 'Quotes and invoices',
    subject: 'your quotes and invoices',
    meta: {
      title: 'Quote and invoice generator',
      description:
        'Quotes your client accepts on the page, and an invoice that fills itself from the accepted option. Built by WildHands in Lagos.',
    },
    title: [{ text: 'Quotes your client' }, { text: 'accepts on the page', highlight: true }],
    intro:
      'Send a quote with options. The client picks one, watches the total update and accepts it. The accepted option becomes the invoice, with nothing retyped.',
    preview: 'rayo',
    previewNote: 'Rayo, designed and built by WildHands, on sample data.',
    whatItIs: {
      statement: 'One set of numbers, from quote to paid.',
      body: 'Most freelancers and small studios write a quote in one document, then rebuild the same numbers in an invoice once the client agrees. We build quoting and invoicing that carries the numbers through. Your logo, bank details and terms are already on the invoice. A ledger shows what is paid, part paid and overdue, and you get PDFs when you need them.',
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
        body: 'Documents save as PDFs, and emails go out on your behalf.',
      },
      {
        icon: 'creditCard',
        title: 'Paystack or Stripe',
        body: 'Clients pay invoices through Paystack or Stripe, depending on where they are.',
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
        body: 'Payment, PDFs and email are connected, so a quote can go all the way to paid.',
      },
    ],
    related: ['rayo', 'the-ruff-agency'],
  },
  {
    slug: 'client-management',
    label: 'Client management dashboard',
    subject: 'your client workspace',
    meta: {
      title: 'Client management dashboards',
      description:
        'Contacts, contracts, invoices and tasks in one place your team shares, with a private area where each client sees only their own records.',
    },
    title: [{ text: 'Every client,' }, { text: 'in one workspace', highlight: true }],
    intro:
      'Contacts, contracts, invoices and tasks in one place your whole team can see, with a private area where each client sees only their own records.',
    preview: 'fey',
    previewNote: 'The Ruff Agency’s workspace, designed and built by WildHands.',
    whatItIs: {
      statement: 'One workspace instead of six tools that do not know about each other.',
      body: 'Clients in a spreadsheet, invoices somewhere else and handoffs in email means nobody can see who is doing what. For The Ruff Agency we built one place where contacts, contracts, invoices and tasks sit together. Each team member sees only what their role allows. Each client gets their own area, at its own web address, with its own sign-in.',
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
        body: 'A safe place for documents, where you choose which client can see each one.',
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
        icon: 'panelsTopLeft',
        title: 'A client area',
        body: 'Clients see the same records your team sees, read only or able to work on them, depending on what you give them.',
      },
      {
        icon: 'lock',
        title: 'Access by role',
        body: 'Each person only sees what they are allowed to see. A contract shared with one client stays hidden from the others.',
      },
    ],
    howWeBuild: [
      DISCOVERY,
      {
        title: 'One set of records, two views',
        body: 'Your team and your clients see the same records from different sides, so nothing is copied between them.',
      },
      {
        title: 'Locked down properly',
        body: 'Who sees what is checked behind the scenes, not just hidden on the screen.',
      },
      {
        title: 'Built in stages',
        body: 'The Ruff Agency has been built in stages, and we are still adding to it.',
      },
    ],
    related: ['the-ruff-agency', 'rayo'],
  },
  {
    slug: 'custom-web-apps',
    label: 'Custom web apps',
    subject: 'your web app',
    meta: {
      title: 'Custom web app development in Lagos, Nigeria',
      description:
        'Software your team or your customers sign in to, built around how you work, for a job off-the-shelf tools do not quite do.',
    },
    title: [{ text: 'Software built around' }, { text: 'how you work', highlight: true }],
    intro:
      'Software your team or your customers sign in to, built for a job that off-the-shelf tools do not quite do.',
    preview: 'planes',
    previewNote: 'Planes, designed and built by WildHands.',
    whatItIs: {
      statement: 'Worth building when ready-made software makes the work harder.',
      body: 'We build web apps around how you really work, so the software fits you instead of you bending to fit the software. A good sign an app is worth building: a spreadsheet that three people keep up and everybody is slightly afraid of. If an off-the-shelf tool fits, we will tell you.',
    },
    whoFor: [
      'Your team needs something to sign in to and do the work',
      'The process is specific to how your business runs',
      'Off-the-shelf software almost fits, but not quite',
    ],
    youGet: [
      {
        icon: 'workflow',
        title: 'Built around how you work',
        body: 'Every app here started as a job someone was doing by hand. Lazy Meet replaced the five clicks before every call.',
      },
      {
        icon: 'monitorSmartphone',
        title: 'Web, desktop or phone',
        body: 'Planes is one build that runs on the web and as a desktop app, with an Android app alongside.',
      },
      {
        icon: 'lock',
        title: 'Private by default',
        body: 'Each person only sees what they are allowed to see, checked behind the scenes, not just hidden on screen.',
      },
    ],
    howWeBuild: [
      DISCOVERY,
      PROPOSAL,
      {
        title: 'Custom quote',
        body: 'What moves the price is how many different jobs the app does, not how many screens it has.',
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
    label: 'Tools for your team',
    subject: 'your team’s tool',
    meta: {
      title: 'Tools for your team',
      description:
        'A tool built for one job your team repeats every day, so the routine runs on its own and only asks you when something looks wrong.',
    },
    title: [{ text: 'Tools for the job' }, { text: 'your team does all day', highlight: true }],
    intro:
      'Built for one job and the people who do it every day, so the routine runs on its own.',
    preview: 'marvy',
    previewNote: 'Marvy, designed and built by WildHands.',
    whatItIs: {
      statement: 'The same routine, 20 times a sitting, done in one step.',
      body: 'A course-production team was finding a Google Drive folder by hand for every video, dragging the file in and pasting four comments to tag reviewers. Marvy reads the course and week from the file name, finds the folder, uploads the video with its audio and tags the right people. That is what a tool for your team is for: one routine your team repeats, done properly.',
    },
    whoFor: [
      'A task your team repeats many times a day',
      'A routine that lives in one person’s head',
      'Work that runs between tools you already pay for',
    ],
    youGet: [
      {
        icon: 'bell',
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
        body: 'Marvy runs on the team’s own computers, with no server and no tracking, in a small window or full screen.',
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
      title: 'Live business dashboards',
      description:
        'The numbers that matter in one live view, instead of rebuilt every week, pulled from records your business already keeps.',
    },
    title: [{ text: 'The numbers that matter,' }, { text: 'in one place', highlight: true }],
    intro:
      'The numbers that matter, up to date and in one place, instead of rebuilt by hand every week.',
    preview: 'wh-dashboard',
    previewNote: SAMPLE_NOTE,
    whatItIs: {
      statement: 'How is it going, and what do I do next?',
      body: 'Most teams already have the numbers, spread across several tools. The work is pulling them into one live view, not typing anything in again. A good dashboard answers how the business is doing first, then what needs doing next.',
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
        icon: 'fileText',
        title: 'Reports to print',
        body: 'A daily report, one day at a time, to print or download.',
      },
      {
        icon: 'database',
        title: 'From records you already keep',
        body: 'Pulled from the tools and records you already keep, not typed in again.',
      },
    ],
    howWeBuild: [
      {
        title: 'Count the hours',
        body: 'We start by working out how many hours your current reports cost, because that is what the build is measured against.',
      },
      {
        title: 'Find the numbers',
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
    label: 'Jobs that run on their own',
    subject: 'the jobs you repeat',
    meta: {
      title: 'Repetitive jobs that run on their own',
      description:
        'We take the repeated steps between your tools off your hands for good, so the job runs on its own. Judged by the hours it gives back.',
    },
    title: [{ text: 'Remove the manual steps' }, { text: 'for good', highlight: true }],
    intro:
      'The repetitive job runs on its own, for good. The goal is removing the step, not doing it faster.',
    preview: 'autoflow',
    previewNote: 'Auto Flow, designed and built by WildHands.',
    whatItIs: {
      statement: 'The same clicks, done for you, unattended.',
      body: 'Auto Flow works through a whole folder of images in Google Flow: upload, generate, download, with nobody at the keyboard. A 24-image batch that took about 2 hours of watched clicking now runs in about 30 minutes, unattended. That is how we judge every job like this we take on: the hours it gives back.',
    },
    whoFor: [
      'Someone repeats the same clicks all day',
      'Someone copies the same details from one tool to another',
      'The job is done the same way every time',
    ],
    youGet: [
      {
        icon: 'bot',
        title: 'Runs on its own',
        body: 'Start it and walk away. Auto Flow keeps up to 3 videos generating at once.',
      },
      {
        icon: 'repeat',
        title: 'Picks up where it stopped',
        body: 'Progress is saved as it goes, so an interrupted run carries on instead of starting again.',
      },
      {
        icon: 'badgeCheck',
        title: 'Checks its own work',
        body: 'A step counts as done only when it can be confirmed two ways. If a step fails, it is caught and tried once more.',
      },
      {
        icon: 'shield',
        title: 'Within the rules',
        body: 'We will not build anything that breaks a platform’s terms of service.',
      },
      {
        icon: 'hourglass',
        title: 'Measured in hours',
        body: 'We find out what the job costs in time first, and measure the build against it.',
      },
    ],
    howWeBuild: [
      DISCOVERY,
      {
        title: 'Map every step',
        body: 'We write down the routine exactly as it runs today, including the steps people forget they do.',
      },
      {
        title: 'Build and check',
        body: 'Each step is checked as it runs, so a hiccup reads as a failure, never as a success.',
      },
      {
        title: 'Measure',
        body: 'The finished build is measured against the hours the old way cost.',
      },
    ],
    related: ['auto-flow', 'marvy', 'lazy-meet'],
  },
  {
    slug: 'connected-tools',
    label: 'Connecting the tools you use',
    subject: 'connecting your tools',
    meta: {
      title: 'Connecting the tools your business uses',
      description:
        'Paystack, Stripe, Google, WhatsApp, email and more, connected so your tools talk to each other and you stop copying between them.',
    },
    title: [{ text: 'Your tools,' }, { text: 'talking to each other', highlight: true }],
    intro:
      'We connect the tools you already pay for, so they talk to each other and you stop copying between them.',
    preview: 'lazy-meet',
    previewNote: 'Lazy Meet, designed and built by WildHands. It reads up to 3 Google calendars.',
    whatItIs: {
      statement: 'The gap between your tools is where the manual work lives.',
      body: 'Often we do not replace the software you already pay for. We build the piece that sits between those tools, because that gap is usually where someone is copying things by hand. Lazy Meet reads 3 Google calendars and joins each call on time, muted, without anyone opening a link.',
    },
    whoFor: [
      'Someone copies details by hand from one tool to another',
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
        body: 'Emails that send themselves through Resend, and a WhatsApp bot that sends task updates.',
      },
      {
        icon: 'bot',
        title: 'AI tools',
        body: 'Claude, Gemini and Deepgram (which turns speech into text), used where they take real work off you.',
      },
      {
        icon: 'lock',
        title: 'Only the access needed',
        body: 'Lazy Meet can only read your calendars, never change them, and keeps its sign-in details locked away on your computer.',
      },
    ],
    howWeBuild: [
      {
        title: 'List the tools',
        body: 'Everything you use today, and where details are copied between them by hand.',
      },
      {
        title: 'Find the gap',
        body: 'We build the missing piece rather than replacing what already works.',
      },
      {
        title: 'Ask for as little as possible',
        body: 'Each connection asks only for the access it needs to do its job.',
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
