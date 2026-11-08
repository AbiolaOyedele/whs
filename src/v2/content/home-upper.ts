/**
 * Words and figures for the top half of the home page: hero, shop rail,
 * intro and the four "why" cards. Every number here is either a real plan
 * figure (mirrored from the main app's src/config/plans.ts) or sample data
 * that the card itself labels as an example.
 */

/* ── hero ─────────────────────────────────────────────────────────── */

export const heroCopy = {
  /** Split around the gradient word: before, gradient, after. */
  title: { before: 'Get your shop', highlight: 'online', after: 'today.' },
  body: 'Open an online shop with your own address. Take card, transfer and USSD payments through Paystack, then run orders, stock and delivery from your phone.',
  primary: 'Open your shop',
  secondary: { label: 'Talk to us', href: '/book-demo' },
  cursorHint: 'Click and hold',
  mobileTrigger: 'Play the intro',
  close: 'Close',
} as const

/** The three words that flicker in while the hero is held, in order. */
export const holdWords = ['Sell', 'Get paid', 'Deliver'] as const

/* ── shop rail ────────────────────────────────────────────────────── */

/** The real demo shops, one per template. Shown as text wordmarks. */
export const demoShops: readonly { slug: string; template: string }[] = [
  { slug: 'adirelane', template: 'Default' },
  { slug: 'itanna', template: 'Glow' },
  { slug: 'oso', template: 'Blush' },
  { slug: 'ile', template: 'Haven' },
  { slug: 'igi', template: 'Oak' },
]

/* ── intro row ────────────────────────────────────────────────────── */

export const introCopy = {
  lead: 'Your website, payments, stock and delivery in one dashboard.',
  title: { before: 'Made for sellers,', highlight: 'run from your phone' },
} as const

/* ── card a: what each plan costs in a month ──────────────────────── */

export interface Plan {
  name: string
  /** Monthly price in naira, before 7.5% VAT. */
  monthly: number
  /** Share of each online sale, in percent. */
  feePercent: number
}

/** Mirrors PLANS in the main app's src/config/plans.ts. Keep in step. */
export const plans: readonly Plan[] = [
  { name: 'Free', monthly: 0, feePercent: 3 },
  { name: 'Starter', monthly: 3_500, feePercent: 1 },
  { name: 'Growth', monthly: 9_000, feePercent: 0 },
  { name: 'Pro', monthly: 20_000, feePercent: 0 },
]

/** Monthly online sales the tabs compare, in naira. */
export const monthlySales: readonly number[] = [100_000, 500_000, 1_500_000]

/* ── card b: map ──────────────────────────────────────────────────── */

export const mapChips = {
  left: 'Payments : card, transfer, USSD',
  right: 'Paid to : your own bank account',
} as const

/* ── card c: example dashboard feed ───────────────────────────────── */

export interface FeedLine {
  text: string
  /** Pink tick lines. */
  done?: boolean
  /** Plain text after the pink part. */
  rest?: string
}

export const feedChip = 'Example feed'

export const feedLines: readonly FeedLine[] = [
  { text: 'adirelane % today' },
  { text: '' },
  { text: '✓ Order #1042 paid : ₦18,500 by transfer', done: true },
  { text: '✓ Order #1043 paid : ₦7,200 by card', done: true },
  { text: '✓ Delivery booked with Fez : order #1042', done: true },
  { text: '✓ Discount code ADIRE10 used on order #1043', done: true },
  { text: '✓ Order #1044 paid : ₦12,000 by USSD', done: true },
  { text: '' },
  { text: 'Stock low : Adire tote, 2 left' },
  { text: 'Stock low : Indigo scarf, 1 left' },
  { text: '' },
  { text: 'Packing [███░░░░░░░░░]' },
  { text: '2 of 8 orders packed' },
  { text: '' },
  { text: 'Packing [██████░░░░░░]' },
  { text: '4 of 8 orders packed' },
  { text: '' },
  { text: 'Packing [█████████░░░]' },
  { text: '6 of 8 orders packed' },
  { text: '' },
  { text: 'Packing [████████████]' },
  { text: '8 of 8 orders packed' },
  { text: '' },
  { text: '✓ Ready for pickup:', done: true, rest: ' 8 orders, 3 with Fez' },
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
const LINE = { first: '#7A7FB2', second: '#90AADE', third: '#FF488B' } as const

export const chartXLabel = 'Day'
/** Days of the month along the x axis. */
export const chartXTicks: readonly string[] = ['1', '8', '15', '22', '29']

export const chartTabs: readonly ChartTab[] = [
  {
    tab: 'Takings',
    yLabel: "Example, ₦'000",
    max: 200,
    series: [
      { label: 'Stall', colour: LINE.first, values: [40, 40, 25, 40, 40, 52, 30, 52, 52, 18, 40, 40, 56] },
      { label: 'WhatsApp', colour: LINE.second, values: [92, 92, 70, 58, 92, 92, 130, 92, 70, 92, 50, 92, 130] },
      { label: 'Website', colour: LINE.third, values: [120, 120, 112, 112, 120, 120, 165, 112, 112, 128, 128, 165, 120] },
    ],
  },
  {
    tab: 'Orders',
    yLabel: 'Example orders',
    max: 40,
    series: [
      { label: 'Stall', colour: LINE.first, values: [6, 6, 4, 6, 8, 6, 4, 9, 6, 3, 6, 6, 9] },
      { label: 'WhatsApp', colour: LINE.second, values: [14, 14, 11, 9, 14, 14, 20, 14, 11, 16, 8, 14, 21] },
      { label: 'Website', colour: LINE.third, values: [22, 22, 19, 19, 24, 22, 31, 19, 21, 24, 24, 33, 22] },
    ],
  },
  {
    tab: 'Profit',
    yLabel: "Example, ₦'000",
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
    id: 'fees-that-shrink',
    navTitle: 'Fees that shrink',
    title: 'Pay less as you sell more.',
    body: 'Start on Free and pay 3% of each online sale. Starter takes 1% for ₦3,500 a month. Growth and Pro take nothing from your sales. Pick a month’s online sales to see what each plan costs, before 7.5% VAT and Paystack’s own charge.',
  },
  map: {
    id: 'paid-to-your-bank',
    navTitle: 'Paid to your bank',
    title: 'Paid to your bank.',
    body: 'Buyers pay by card, transfer or USSD through Paystack, and the money is settled to your own account. Set your delivery fees, or connect Fez and paid orders are booked for you.',
  },
  orders: {
    id: 'every-order-one-place',
    navTitle: 'Every order, one place',
    title: 'Every order, one place.',
    body: 'Website sales, WhatsApp sales and sales at your stall land in one list. Pack, send and refund from your phone.',
  },
  money: {
    id: 'know-what-you-made',
    navTitle: 'What you really made',
    title: 'Know what you really made.',
    body: 'Takings, costs and profit side by side. Record what you spend and see what is left at the end of the month.',
  },
} as const satisfies Record<string, CardCopy>
