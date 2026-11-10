import type { LivePreviewSlug } from '@/config/previews'
/**
 * Work: the WildHands case studies, one per project in the main site's
 * `src/content/work/*.md`, ordered by each entry's `order`. Each body is that
 * entry's sections, numbers and outcome, then its Markdown body, word for
 * word. If a detail is not in those files, it is left out.
 */
import { site } from '@v2/config/site'
import type { RichBlock } from '@v2/content/blog'

export interface HelpQuestion {
  q: string
  a: string
}

export interface HelpGuide {
  slug: string
  title: string
  /** ISO date the case study was last updated on the main site. */
  date: string
  /** Live previews of the project, shown in the write-up (from `previews` in src/content/work). */
  previews: LivePreviewSlug[]
  /** The product's own logo, from public/work-logos. Shown on the card and as the page header. */
  logo: string
  /** The project's one-line summary. */
  lede: string
  body: RichBlock[]
  faqs: HelpQuestion[]
}

/** The day every case study was last updated in `src/content/work`. */
const UPDATED = '2026-11-02'

export const HELP_GUIDES: HelpGuide[] = [
  {
    slug: 'auto-flow',
    title: 'Auto Flow: bulk video generation without the manual loop',
    date: UPDATED,
    previews: ['autoflow'],
    logo: '/work-logos/auto-flow.png',
    lede: 'Point it at a folder of images and it generates every video unattended, three at a time.',
    body: [
      {
        type: 'h2',
        text: 'The problem',
      },
      {
        type: 'p',
        text: 'Google Flow asks for the same six steps on every single image: upload, configure, prompt, generate, wait, download. At a dozen images that is tedious. At a hundred it is a full working day of clicking, and one missed step means starting that image again.',
      },
      {
        type: 'h2',
        text: 'What we built',
      },
      {
        type: 'p',
        text: 'A cross-platform desktop app that drives the Flow interface directly. It takes a folder of images, a prompt template (or per-image prompts written by Gemini from the image itself), and runs the whole batch. Progress is written to CSV as it goes, so an interrupted run picks up where it stopped instead of reprocessing everything.',
      },
      {
        type: 'h2',
        text: 'Pipelining, not queueing',
      },
      {
        type: 'p',
        text: 'The obvious build runs one image at a time and spends most of its life waiting. This one starts uploading the next image once the current generation passes 20%, keeping up to three in flight, and parallelises every download at the end. That is where the time saving actually comes from.',
      },
      {
        type: 'h2',
        text: 'Knowing when a generation is done',
      },
      {
        type: 'p',
        text: 'Flow shows a live percentage overlay that simply vanishes on completion. Polling for the absence of an element is fragile: a network stall or a UI flicker reads as success. Completion is confirmed two ways instead: the overlay has to disappear and the finished video has to appear in the media picker with a valid ID. Failed generations are caught and retried once.',
      },
      {
        type: 'h2',
        text: 'By the numbers',
      },
      {
        type: 'ul',
        items: [
          [
            {
              text: '~3×',
              strong: true,
            },
            ': Faster per batch',
          ],
          [
            {
              text: '3',
              strong: true,
            },
            ': Generations in flight at once',
          ],
        ],
      },
      {
        type: 'h2',
        text: 'Outcome',
      },
      {
        type: 'p',
        text: 'A 24-image batch that took roughly two hours of supervised clicking now runs in about half an hour, unattended.',
      },
      {
        type: 'p',
        text: 'Auto Flow exists because the interesting part of generating video from images is choosing the images. Everything after that is the same six interactions repeated until the folder is empty.',
      },
      {
        type: 'h2',
        text: 'Two frontends, one automation core',
      },
      {
        type: 'p',
        text: 'The same automation logic is wired to two interfaces (a PyWebView app for the Python build and an Electron app for the Node build), so the tool can be packaged for macOS and Windows without maintaining two behaviours. A second mode downloads every video from an existing Flow project link, which turned out to be the feature people reached for most after the first batch.',
      },
      {
        type: 'h2',
        text: 'The part we chose not to build',
      },
      {
        type: 'p',
        text: 'The Electron build contains a half-finished engine pointing at Higgsfield, another video platform. It does not work, and it is staying that way. Higgsfield actively detects browser automation and refuses authenticated access; the standard workaround is to strip the automation flag with stealth launch flags, which would breach their terms of service. The selectors were written. The bypass was not.',
      },
    ],
    faqs: [],
  },
  {
    slug: 'lazy-meet',
    title: 'Lazy Meet: joining the call so you do not have to',
    date: UPDATED,
    previews: ['lazy-meet'],
    logo: '/work-logos/lazy-meet.png',
    lede: 'Joins your calls at start time, muted and camera off, across three accounts.',
    body: [
      {
        type: 'h2',
        text: 'The problem',
      },
      {
        type: 'p',
        text: 'Running several Google accounts turns every meeting into a small sequence of chores: find the right session, open the link, mute, turn the camera off, join. Repeat it four times a day and eventually you join a call live and unmuted, or you stay chained to your desk so you do not.',
      },
      {
        type: 'h2',
        text: 'What we built',
      },
      {
        type: 'p',
        text: 'A desktop app that connects up to three Google accounts over OAuth, stores each refresh token encrypted in the system keychain, and checks every connected calendar every five minutes for meetings with a Meet link. Each account gets its own isolated browser session, so signing in to one never disturbs another.',
      },
      {
        type: 'h2',
        text: 'The join sequence',
      },
      {
        type: 'p',
        text: 'At join time it opens the meeting in that account session, confirms the microphone toggle reads as off, confirms the camera toggle reads as off, clicks Join, then verifies the in-call interface actually appeared. A native notification follows, with a button to bring the window forward.',
      },
      {
        type: 'h2',
        text: 'Failing safe',
      },
      {
        type: 'p',
        text: 'Google changes the Meet interface without notice, so every selector lives in one file. If either toggle state cannot be confirmed, the join is abandoned before the button is clicked. The app will occasionally skip a meeting after a Google redesign. It will never join one with your microphone live.',
      },
      {
        type: 'h2',
        text: 'By the numbers',
      },
      {
        type: 'ul',
        items: [
          [
            {
              text: '3',
              strong: true,
            },
            ': Google accounts, kept separate',
          ],
          [
            {
              text: '5 min',
              strong: true,
            },
            ': Calendar poll interval',
          ],
        ],
      },
      {
        type: 'h2',
        text: 'Outcome',
      },
      {
        type: 'p',
        text: 'Meetings join themselves at the scheduled minute, muted, whether the window is focused, minimised or behind everything else.',
      },
      {
        type: 'p',
        text: 'The core idea is small: a calendar already knows when your meetings are and where they live. Nothing else should need your attention.',
      },
      {
        type: 'h2',
        text: 'Beyond the calendar',
      },
      {
        type: 'p',
        text: 'Not every meeting arrives as a calendar invite, so links can be pasted in directly and either scheduled once or repeated weekly. Out-of-office days are respected, the join lead time is configurable (a minute early or exactly on the hour), and optional reminders fire beforehand for the calls you do want to prepare for.',
      },
      {
        type: 'h2',
        text: 'Read-only, by design',
      },
      {
        type: 'p',
        text: [
          'The Google integration requests ',
          {
            text: 'calendar.readonly',
            code: true,
          },
          ' and nothing more. The app never writes to a calendar, never creates events, and never touches anything outside the meeting links it needs to open.',
        ],
      },
    ],
    faqs: [],
  },
  {
    slug: 'the-ruff-agency',
    title: 'The Ruff Agency: one workspace instead of six tools',
    date: UPDATED,
    previews: ['fey'],
    logo: '/work-logos/the-ruff-agency.svg',
    lede: 'Clients, contracts, invoices, tasks and a client portal in one shared workspace.',
    body: [
      {
        type: 'h2',
        text: 'The problem',
      },
      {
        type: 'p',
        text: 'Agencies run on scattered infrastructure. Clients live in a spreadsheet, invoices in a separate system, payment tracking in someone head, and project handoffs in email. Growing the business means buying another tool, and teams work in silos because there is nowhere central to see who is doing what.',
      },
      {
        type: 'h2',
        text: 'What we built',
      },
      {
        type: 'p',
        text: 'A workspace where contacts, contracts, invoices and tasks all sit together, and every member sees the same data gated by their role. Clients get their own portal on a workspace subdomain with independent credentials: the same records, a different view, read-only or collaborative depending on what they are given.',
      },
      {
        type: 'h2',
        text: 'The hard part: two access patterns, one database',
      },
      {
        type: 'p',
        text: 'Team access had to be added to a schema whose policies assumed a single owner, across more than twenty tables, without a single existing read path breaking. The answer was two SECURITY DEFINER functions that resolve workspace membership once, referenced from permissive policies everywhere else. Postgres ORs permissive policies together, so the original owner-only check and the new member check coexist: adding a teammate can only ever grant access, never revoke it.',
      },
      {
        type: 'h2',
        text: 'Getting paid',
      },
      {
        type: 'p',
        text: 'Invoices carry their own lifecycle from draft through sent to paid, with customisable templates, and settle through Stripe or Paystack depending on where the client is. Transactional email runs on Resend, and a WhatsApp bot pushes task updates to people who live in messaging rather than dashboards.',
      },
      {
        type: 'h2',
        text: 'By the numbers',
      },
      {
        type: 'ul',
        items: [
          [
            {
              text: '88',
              strong: true,
            },
            ': Database migrations shipped',
          ],
          [
            {
              text: '20+',
              strong: true,
            },
            ': Tables under row-level security',
          ],
        ],
      },
      {
        type: 'h2',
        text: 'Outcome',
      },
      {
        type: 'p',
        text: 'A client goes from invited to working inside their own portal without manual setup, pending approvals or a single email thread.',
      },
      {
        type: 'p',
        text: 'The Ruff Agency is the platform an agency runs on, built because the alternative was renting five products that do not know about each other.',
      },
      {
        type: 'h2',
        text: 'Beyond the core',
      },
      {
        type: 'p',
        text: 'An admin-only playground generates marketing assets through DALL-E 3 and Gemini, with a reference-image workflow and prompt review before anything is produced. A separate vault holds legal, brand and finance documents with a visibility model that decides which portals can see what, so a contract shared with one client is not quietly readable by another.',
      },
    ],
    faqs: [],
  },
  {
    slug: 'tomori',
    title: 'Tomori: a shop for hand-dyed Adire, built for a phone',
    date: UPDATED,
    previews: ['tomori'],
    logo: '/work-logos/tomori.svg',
    lede: 'A quiet, phone-first shop for hand-dyed clothes, and a back office that fits in a pocket.',
    body: [
      {
        type: 'h2',
        text: 'The problem',
      },
      {
        type: 'p',
        text: 'TOMORI makes hand-dyed Adire and Ankara bubu dresses, pants and two-piece sets. Most shoppers find a piece on Instagram or WhatsApp, on a phone, on mobile data. Marketplaces bury the clothes between phone cases, stock themes cover them in badges and countdowns, and selling through DMs leaves orders, payments and stock in one person’s head.',
      },
      {
        type: 'h2',
        text: 'What we built',
      },
      {
        type: 'p',
        text: 'A storefront that opens on a full-width photo of each collection, with every piece priced in naira. Paystack takes card, transfer or USSD, every step is sized for a thumb, and delivery fees are set by the owner and shown before anyone pays. A WhatsApp button sits on every page for shoppers who would rather ask first.',
      },
      {
        type: 'h2',
        text: 'A back office for one person',
      },
      {
        type: 'p',
        text: 'The owner runs the shop alone, between packing orders and answering messages, so the admin is written for a shop owner rather than a developer. Every section says what it is for in a few words, times read “3 hours ago”, and every empty screen says what will show up there.',
      },
      {
        type: 'h2',
        text: 'The parts most shop admins do not have',
      },
      {
        type: 'p',
        text: 'At a market she picks a piece by its code and the shop makes a QR code the customer pays through on their own phone. Bags left unpaid for twenty minutes are listed so she can follow up. Visitors are counted on the shop itself, with no ad trackers. QR codes printed on delivery bags report every scan and can be pointed somewhere new after printing. Takings, costs and discount codes live in the same place.',
      },
      {
        type: 'h2',
        text: 'The rule behind it',
      },
      {
        type: 'p',
        text: 'The interface keeps to deep navy, white and one soft lilac for the main button, so the brightest thing on screen is always the fabric. No countdowns and no “only 2 left”.',
      },
      {
        type: 'h2',
        text: 'Outcome',
      },
      {
        type: 'p',
        text: 'The clothes are the loudest thing on every page, and the owner runs the whole shop from her phone.',
      },
    ],
    faqs: [],
  },
  {
    slug: 'marvy',
    title: 'Marvy: course videos filed in one step',
    date: UPDATED,
    previews: ['marvy'],
    logo: '/work-logos/marvy.svg',
    lede: 'Drop a video in and it lands in the right Drive folder, with the right people tagged.',
    body: [
      {
        type: 'h2',
        text: 'The problem',
      },
      {
        type: 'p',
        text: 'A course-production team uploads videos to shared Google Drive folders all day. For every video someone found the folder by hand, dragged the file in, opened the tag sheet, copied four groups of email addresses and pasted four comments. Twenty videos in a sitting meant the same routine twenty times.',
      },
      {
        type: 'h2',
        text: 'What we built',
      },
      {
        type: 'p',
        text: 'Marvy reads the course code and week from the filename, finds the folder, checks the person has access and that the video is not already there, then uploads the video with its matching audio. The @mention comments come from the tag sheet and post as whoever is signed in, so it is always clear who did what. Every video then sits on one board with the team’s own statuses, through to final render.',
      },
      {
        type: 'h2',
        text: 'Quiet by default',
      },
      {
        type: 'p',
        text: 'The happy path asks nothing. Marvy only speaks up when something looks wrong, and then asks one clear question. A near match is shown, never accepted, and nothing it does can delete anything in Drive.',
      },
      {
        type: 'h2',
        text: 'Built for the team’s own machines',
      },
      {
        type: 'p',
        text: 'It runs entirely on the computer it is installed on, with no server and no tracking; the only thing it talks to is Google. The window works from 375 pixels wide to full screen, because people keep it docked beside After Effects between renders.',
      },
      {
        type: 'h2',
        text: 'Outcome',
      },
      {
        type: 'p',
        text: 'Nobody on the team has to think about where a video goes.',
      },
    ],
    faqs: [],
  },
  {
    slug: 'rayo',
    title: 'Rayo: quotes your client accepts on the page',
    date: UPDATED,
    previews: ['rayo'],
    logo: '/work-logos/rayo.svg',
    lede: 'Send a quote with options, the client accepts one, and it becomes the invoice.',
    body: [
      {
        type: 'h2',
        text: 'The problem',
      },
      {
        type: 'p',
        text: 'Freelancers and small studios write a quote in one document, then rebuild the same numbers in an invoice once the client agrees. The client usually gets a PDF with three options and replies by email to say which one.',
      },
      {
        type: 'h2',
        text: 'What we built',
      },
      {
        type: 'p',
        text: 'Rayo puts the choice on the page. You build a quote with options and send a link. The client picks one, watches the total update, and accepts it without a PDF to sign or an email to reply to. The accepted option becomes an invoice with your logo, bank details and terms already on it, and nothing is retyped.',
      },
      {
        type: 'h2',
        text: 'Money, followed through',
      },
      {
        type: 'p',
        text: 'The ledger shows paid, part paid and overdue, and what is still owed on each invoice, deposits included. Documents export as PDFs, and the mail Rayo sends goes out on your behalf.',
      },
      {
        type: 'h2',
        text: 'Two questions first',
      },
      {
        type: 'p',
        text: 'The overview answers where each quote stands and what money is in or owed before anything else. Most clients open their quote on a phone, so the quote page was designed for one first.',
      },
      {
        type: 'h2',
        text: 'Outcome',
      },
      {
        type: 'p',
        text: 'A quote that answers itself, and an invoice nobody has to retype.',
      },
    ],
    faqs: [],
  },
  {
    slug: 'dory',
    title: 'Dory: a budget app that always knows what is left',
    date: UPDATED,
    previews: ['dory'],
    logo: '/work-logos/dory.svg',
    lede: 'Budget, shopping, loans and subscriptions in one place, with what is left always on top.',
    body: [
      {
        type: 'h2',
        text: 'The problem',
      },
      {
        type: 'p',
        text: 'Money in Lagos moves in naira and gets typed in shorthand: 5k, 1.2m. It also lives in too many places: a bank app, a shopping list in notes, a mental tally of who borrowed what, and subscriptions that renew before anyone remembers them.',
      },
      {
        type: 'h2',
        text: 'What we built',
      },
      {
        type: 'p',
        text: 'Dory pulls all of it into one place. The money left for the month sits at the top of every screen. Food, rent, transport and data each get a bar for how much is spent. Shopping lists remember what things cost, and receipt scanning fills them in. Loans show who owes you and who you owe, right beside the budget, and subscriptions due this week are flagged.',
      },
      {
        type: 'h2',
        text: 'A bank, built in',
      },
      {
        type: 'p',
        text: 'Dory shows the Kuda balance and can make transfers from it, so checking what is left and paying for something happen in the same app.',
      },
      {
        type: 'h2',
        text: 'Playful frame, serious figures',
      },
      {
        type: 'p',
        text: 'Shapes and colour carry the personality, while amounts stay calm and exact. The common action on each screen is large and in reach of one thumb, and every press, save and error answers, briefly.',
      },
      {
        type: 'h2',
        text: 'Outcome',
      },
      {
        type: 'p',
        text: 'You always know what is left without doing the maths.',
      },
    ],
    faqs: [],
  },
  {
    slug: 'planes',
    title: 'Planes: a to-do list you race your friends on',
    date: UPDATED,
    previews: ['planes'],
    logo: '/work-logos/planes.png',
    lede: 'Swipe to land a task, fly one to a friend, and race your crew on the leaderboard.',
    body: [
      {
        type: 'h2',
        text: 'The problem',
      },
      {
        type: 'p',
        text: 'Most to-do apps are good at collecting tasks and bad at getting them done. The list grows, nobody else knows either way, and adding a task means stopping to type, which is enough friction that half of them never go in.',
      },
      {
        type: 'h2',
        text: 'What we built',
      },
      {
        type: 'p',
        text: 'Planes plans tasks by the day. Swipe right to land one, swipe left to push it to tomorrow, time it, or send it to a friend like a paper plane. Tasks go in by voice, or get pulled out of a screenshot or a note. XP, streaks and badges keep score, and a live leaderboard has only your crew on it.',
      },
      {
        type: 'h2',
        text: 'One codebase, three places',
      },
      {
        type: 'p',
        text: 'One Next.js codebase runs Planes on the web and as a desktop app, with an Android app alongside.',
      },
      {
        type: 'h2',
        text: 'Fast hands, quick feedback',
      },
      {
        type: 'p',
        text: 'Gestures follow the finger, every action answers in under 250 milliseconds, and celebrations finish in about a second. Anything you can swipe you can also tap, colour is never the only signal, and movement steps aside for anyone who asks for less of it.',
      },
      {
        type: 'h2',
        text: 'Outcome',
      },
      {
        type: 'p',
        text: 'Finishing a task feels like landing a plane.',
      },
    ],
    faqs: [],
  },
  {
    slug: 'marque',
    title: 'Marque: brand guidelines, made easy',
    date: UPDATED,
    previews: ['marque-app', 'marque'],
    logo: '/work-logos/marque.svg',
    lede: 'Start from a logo, edit the guide in place, and publish it at one link.',
    body: [
      {
        type: 'h2',
        text: 'Starting from a logo',
      },
      {
        type: 'p',
        text: 'Name the brand and add its website, and Marque reads its logo, colours and description. Pick a palette, and AI can write the first draft of the copy.',
      },
      {
        type: 'h2',
        text: 'An editor, not a form',
      },
      {
        type: 'p',
        text: 'Every guide starts from a twelve-section template with 29 block types, edited right where they sit, with undo and redo, an asset library and a Brand panel for the logo, palette, type, motion, icons and cover.',
      },
      {
        type: 'h2',
        text: 'Published at one link',
      },
      {
        type: 'p',
        text: 'A finished guide goes live at its own address, with sidebar navigation, search, one section per page and a Markdown export.',
      },
      {
        type: 'h2',
        text: 'Works before you sign up',
      },
      {
        type: 'p',
        text: 'Marque runs signed out, saving in the browser. Signing in saves to an account, syncs across tabs and devices, and offers to move the brands already made into it.',
      },
      {
        type: 'h2',
        text: 'Outcome',
      },
      {
        type: 'p',
        text: 'A brand guide that lives at a link, not in a PDF nobody can find.',
      },
    ],
    faqs: [],
  },
]

/** Newest first; case studies updated on the same day keep their order above. */
export function sortedGuides(): HelpGuide[] {
  return HELP_GUIDES.map((guide, index) => ({ guide, index }))
    .sort((a, b) => b.guide.date.localeCompare(a.guide.date) || a.index - b.index)
    .map(({ guide }) => guide)
}

export function guideBySlug(slug: string): HelpGuide | undefined {
  return HELP_GUIDES.find((guide) => guide.slug === slug)
}

/** The next case studies in the list after `guide`, wrapping round to the start. */
export function relatedGuides(guide: HelpGuide, count = 3): HelpGuide[] {
  const all = sortedGuides()
  const start = all.findIndex((item) => item.slug === guide.slug)
  const related: HelpGuide[] = []
  for (let step = 1; step < all.length && related.length < count; step += 1) {
    const next = all[(start + step) % all.length]
    if (next) related.push(next)
  }
  return related
}

/** The byline on every case study. */
export const HELP_AUTHOR = { name: site.name, role: 'Studio' } as const

/** Shown at the foot of every case study, as on the main site's case study pages. */
export const HELP_CTA = {
  title: 'Got a job like this one?',
  body: 'Tell us where it hurts and we will tell you what we would do about it.',
  label: 'Talk to us',
  href: site.signUpUrl,
} as const
