/**
 * Words and figures for the top half of the home page: hero, product rail,
 * intro and the four "why" cards. Every price here is the real 72-hour
 * website offer; every other figure is sample data that the card itself
 * labels as an example.
 */

/* ── hero ─────────────────────────────────────────────────────────── */

export const heroCopy = {
  /** Split around the gradient word: before, gradient, after. */
  title: { before: 'Custom solutions that give you', highlight: 'your time', after: 'back.' },
  body: 'A Lagos-based studio building custom websites, web apps and internal tools for teams done doing repetitive work by hand. We work with businesses across Nigeria and the wider African market.',
  primary: 'Talk to Us',
  secondary: { label: 'See Our Work', href: '/resources' },
  cursorHint: 'Click and hold',
  mobileTrigger: 'Play the intro',
  close: 'Close',
} as const

/** The three words that flicker in while the hero is held, in order. */
export const holdWords = ['Websites', 'Apps', 'Tools'] as const

/* ── product rail ─────────────────────────────────────────────────── */

/** Products WildHands built, each live at <slug>.whstd.com. Shown as text wordmarks. */
export const demoShops: readonly { slug: string; template: string }[] = [
  { slug: 'rayo', template: 'Quotes and invoices' },
  { slug: 'dory', template: 'Personal budgets' },
  { slug: 'planes', template: 'Tasks with friends' },
  { slug: 'marque', template: 'Brand guidelines' },
]

/* ── intro row ────────────────────────────────────────────────────── */

export const introCopy = {
  lead: 'Websites, web apps and internal tools for businesses in Lagos, Nigeria and across Africa.',
  title: { before: 'Built around how you work,', highlight: 'not a template' },
} as const

/* ── card a: how the 72-hour website is paid ──────────────────────── */

export interface Plan {
  name: string
  /** A fixed amount in naira, added to the share below. */
  monthly: number
  /** Share of the package price, in percent. */
  feePercent: number
}

/** The 72-hour website: the deposit that starts the build, and the full price. */
export const plans: readonly Plan[] = [
  { name: 'Deposit to start', monthly: 0, feePercent: 50 },
  { name: 'Full price', monthly: 0, feePercent: 100 },
]

/** The two package prices the tabs compare, in naira: Starter and Standard. */
export const monthlySales: readonly number[] = [150_000, 250_000]

/* ── card b: map ──────────────────────────────────────────────────── */

export const mapChips = {
  left: 'Based in : Lagos',
  right: 'Building for : Nigeria and Africa',
} as const

/* ── card c: example automation run ───────────────────────────────── */

export interface FeedLine {
  text: string
  /** Pink tick lines. */
  done?: boolean
  /** Plain text after the pink part. */
  rest?: string
}

export const feedChip = 'Example run'

export const feedLines: readonly FeedLine[] = [
  { text: 'auto-flow % batch of 24 images' },
  { text: '' },
  { text: '✓ image-01 uploaded : prompt written by Gemini', done: true },
  { text: '✓ image-02 uploaded : 2 generations in flight', done: true },
  { text: '✓ image-03 uploaded : 3 generations in flight', done: true },
  { text: '✓ image-01 video saved to the output folder', done: true },
  { text: '✓ Progress written to CSV', done: true },
  { text: '' },
  { text: 'Failed : image-07, retrying once' },
  { text: 'Retried : image-07, video saved' },
  { text: '' },
  { text: 'Generating [███░░░░░░░░░]' },
  { text: '6 of 24 videos saved' },
  { text: '' },
  { text: 'Generating [██████░░░░░░]' },
  { text: '12 of 24 videos saved' },
  { text: '' },
  { text: 'Generating [█████████░░░]' },
  { text: '18 of 24 videos saved' },
  { text: '' },
  { text: 'Generating [████████████]' },
  { text: '24 of 24 videos saved' },
  { text: '' },
  { text: '✓ Batch done:', done: true, rest: ' nobody at the keyboard' },
]

/* ── card d: example line chart ───────────────────────────────────── */

export interface ChartSeries {
  label: string
  colour: string
  /** One reading per tick on the x axis. */
  values: readonly number[]
}

export interface ChartTab {
  tab: string
  yLabel: string
  /** Top of the y axis; the grid shows quarters of it. */
  max: number
  series: readonly ChartSeries[]
}

/** Legend colours, in the reference's order. */
const LINE = { first: '#6B6A73', second: '#8A8A93', third: '#BEFC65' } as const

export const chartXLabel = 'Day'
/** Days of the month along the x axis. */
export const chartXTicks: readonly string[] = ['1', '8', '15', '22', '29']

export const chartTabs: readonly ChartTab[] = [
  {
    tab: 'Visits',
    yLabel: 'Example visits',
    max: 200,
    series: [
      { label: 'Direct', colour: LINE.first, values: [40, 40, 25, 40, 40, 52, 30, 52, 52, 18, 40, 40, 56] },
      { label: 'Social', colour: LINE.second, values: [92, 92, 70, 58, 92, 92, 130, 92, 70, 92, 50, 92, 130] },
      { label: 'Search', colour: LINE.third, values: [120, 120, 112, 112, 120, 120, 165, 112, 112, 128, 128, 165, 120] },
    ],
  },
  {
    tab: 'Enquiries',
    yLabel: 'Example enquiries',
    max: 40,
    series: [
      { label: 'Email', colour: LINE.first, values: [6, 6, 4, 6, 8, 6, 4, 9, 6, 3, 6, 6, 9] },
      { label: 'WhatsApp', colour: LINE.second, values: [14, 14, 11, 9, 14, 14, 20, 14, 11, 16, 8, 14, 21] },
      { label: 'Website', colour: LINE.third, values: [22, 22, 19, 19, 24, 22, 31, 19, 21, 24, 24, 33, 22] },
    ],
  },
  {
    tab: 'Tasks',
    yLabel: 'Example tasks automated',
    max: 100,
    series: [
      { label: 'Last month', colour: LINE.second, values: [30, 30, 22, 34, 34, 26, 40, 40, 30, 30, 44, 36, 36] },
      { label: 'This month', colour: LINE.third, values: [38, 38, 30, 46, 46, 34, 58, 52, 40, 52, 66, 52, 70] },
    ],
  },
]

/* ── the "why" list and card captions ─────────────────────────────── */

export interface CardCopy {
  id: string
  navTitle: string
  title: string
  body: string
}

export const cardCopy = {
  plans: {
    id: 'live-in-72-hours',
    navTitle: 'Live in 72 hours',
    title: 'A website, live in 72 hours.',
    body: 'Starter is ₦150,000 with a ₦75,000 deposit. Standard is ₦250,000 with a ₦125,000 deposit. You approve the design before any code is written, and the site is live in 72 hours. Message us on WhatsApp on 0812 979 6927.',
  },
  map: {
    id: 'built-in-lagos',
    navTitle: 'Built in Lagos',
    title: 'Built in Lagos, for Africa.',
    body: 'We are based in Lagos and build for businesses across Nigeria and Africa. Most of the process runs over calls, so location is not a barrier, and every site accounts for local hosting, payment and connectivity realities.',
  },
  orders: {
    id: 'automate-the-repeats',
    navTitle: 'Automate the repeats',
    title: 'Automate the repeats.',
    body: 'We build tools that take repetitive work off your plate for good. Auto Flow turned a supervised afternoon of clicking into an unattended half-hour.',
  },
  money: {
    id: 'see-what-is-happening',
    navTitle: 'See it in real time',
    title: 'See what is happening, in real time.',
    body: 'Custom dashboards that show you the numbers that matter, without digging for them. Most teams already produce the data and lose it across several tools.',
  },
} as const satisfies Record<string, CardCopy>
