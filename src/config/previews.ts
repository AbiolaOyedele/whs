/**
 * Live product previews.
 *
 * Each one is a self-contained page in `public/previews/screens/<slug>.html`:
 * the real app's markup, CSS, fonts and motion, with a scripted pointer that
 * taps through it. They are web pages, not videos, so they stay sharp at any
 * size and weigh a fraction of a recording.
 *
 * The pages are generated in the Joisti project (`mockups/_build/`) and must
 * not be edited by hand. Regenerate them there and copy the new file over.
 *
 * Every page is shown in an iframe at the device's true screen size, so the
 * app's own responsive CSS picks the layout, then scaled down to fit. The sizes
 * below are those true sizes, copied from the handover catalog.
 */

export const PREVIEW_DEVICES = ['laptop', 'tablet', 'phone'] as const
export type PreviewDevice = (typeof PREVIEW_DEVICES)[number]

export interface PreviewSize {
  w: number
  h: number
}

export interface LivePreview {
  /** Read aloud in place of the preview. Says what the visitor would see. */
  label: string
  /** Shown above the preview on a case study with more than one. */
  caption: string
  sizes: Readonly<Record<PreviewDevice, PreviewSize>>
}

/* The two shapes the generator records at. Websites run a little shorter on
   tablet and phone because they leave no room for an app's status bar. */
const APP: LivePreview['sizes'] = {
  laptop: { w: 1280, h: 800 },
  tablet: { w: 820, h: 1180 },
  phone: { w: 390, h: 844 },
}
const SITE: LivePreview['sizes'] = {
  laptop: { w: 1280, h: 800 },
  tablet: { w: 820, h: 1154 },
  phone: { w: 390, h: 790 },
}

export const LIVE_PREVIEWS = {
  dumpty: {
    label: 'The Dumpty app recording an idea and returning it as a tidy, tagged note.',
    caption: 'The app',
    sizes: APP,
  },
  'dumpty-site': {
    label: 'The Dumpty website’s homepage.',
    caption: 'The website',
    sizes: SITE,
  },
  autoflow: {
    label: 'Auto Flow working through a folder of images, three videos at a time.',
    caption: 'The app',
    sizes: { ...APP, laptop: { w: 1220, h: 800 } },
  },
  'lazy-meet': {
    label: 'Lazy Meet listing the day’s meetings across three Google accounts.',
    caption: 'The app',
    sizes: { ...APP, laptop: { w: 1040, h: 760 } },
  },
  fey: {
    label: 'The Fey workspace: the dashboard, the CRM and the Playground.',
    caption: 'The workspace',
    sizes: APP,
  },
  tomori: {
    label: 'The Tomori shop’s homepage, with its collections.',
    caption: 'The shop',
    sizes: SITE,
  },
  marvy: {
    label: 'Marvy’s board of course videos, a video’s details, and its version history.',
    caption: 'The app',
    sizes: { ...APP, laptop: { w: 1120, h: 720 } },
  },
  rayo: {
    label: 'Rayo’s welcome tour, then its quotes, a client’s quote, invoices and clients.',
    caption: 'The app',
    sizes: APP,
  },
  dory: {
    label: 'Dory moving through the dashboard, budget, shopping, loans and subscriptions.',
    caption: 'The app',
    sizes: APP,
  },
  planes: {
    label:
      'Planes ticking a task off for 10 XP, then showing progress and the friends leaderboard.',
    caption: 'The app',
    sizes: APP,
  },
  beam: {
    label: 'Beam turning a saved brand into a client document.',
    caption: 'The app',
    sizes: { ...APP, laptop: { w: 1280, h: 820 } },
  },
  'marque-app': {
    label: 'The Marque editor working on a sample brand guide.',
    caption: 'The app',
    sizes: APP,
  },
  marque: {
    label: 'The Marque website’s homepage.',
    caption: 'The website',
    sizes: SITE,
  },
  /* The four below are not from Joisti: one hand-written page of a sample
     shop's admin panel, in WildHands colours, copied under four names. The
     file name picks the tour. See the comment at the top of wh-cms.html. */
  'wh-cms': {
    label:
      'A sample shop’s admin panel: the home page heading is rewritten beside a live preview, saved, published, then a product’s stock is changed.',
    caption: 'Sample admin panel',
    sizes: APP,
  },
  'wh-dashboard': {
    label:
      'A sample shop’s dashboard: a new order lifts the week’s takings, then the best sellers, finance and the daily report.',
    caption: 'Sample dashboard',
    sizes: APP,
  },
  'wh-analytics': {
    label:
      'A sample shop’s visitors page: visitors each day, where they came from, devices, cities, busiest hours and visit to sale.',
    caption: 'Sample analytics',
    sizes: APP,
  },
  'wh-search': {
    label:
      'A sample shop’s search settings: the page title and description are rewritten with a live search preview, then the sitemap, robots.txt, llms.txt and business details files.',
    caption: 'Sample search settings',
    sizes: APP,
  },
} as const satisfies Record<string, LivePreview>

export type LivePreviewSlug = keyof typeof LIVE_PREVIEWS

/** For the content schema, which needs a non-empty tuple. */
export const LIVE_PREVIEW_SLUGS = Object.keys(LIVE_PREVIEWS) as [
  LivePreviewSlug,
  ...LivePreviewSlug[],
]
