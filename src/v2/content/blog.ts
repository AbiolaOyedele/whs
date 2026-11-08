/**
 * Blog posts and the rich-text shape every long page on the site shares
 * (blog posts, help guides, the legal pages).
 *
 * There is no real blog yet, so every post is a clearly marked placeholder
 * with a few paragraphs of stand-in body, enough to check the article layout.
 * Keep `BlogPost`'s original fields and `latestPosts()`: the home page's
 * "Latest from the blog" row reads them.
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

export type BlogCategorySlug = 'seller-stories' | 'guides' | 'product-updates' | 'news'

export interface BlogCategory {
  slug: BlogCategorySlug
  /** On a card or an article, for one post. */
  label: string
  /** On the filter tab. */
  tab: string
}

export const BLOG_CATEGORIES: BlogCategory[] = [
  { slug: 'seller-stories', label: 'Seller story', tab: 'Seller stories' },
  { slug: 'guides', label: 'Guide', tab: 'Guides' },
  { slug: 'product-updates', label: 'Product update', tab: 'Product updates' },
  { slug: 'news', label: 'News', tab: 'News' },
]

export function categoryBySlug(slug: string): BlogCategory | undefined {
  return BLOG_CATEGORIES.find((category) => category.slug === slug)
}

export function categoryByLabel(label: string): BlogCategory | undefined {
  return BLOG_CATEGORIES.find((category) => category.label === label)
}

/* ── posts ────────────────────────────────────────────────────────── */

export interface BlogPost {
  slug: string
  title: string
  /** ISO date, e.g. "2026-11-01". */
  date: string
  /** Category labels from BLOG_CATEGORIES, e.g. "Guide". */
  categories: string[]
  excerpt: string
  /** Seed for the stand-in art. */
  artSeed: number
  /** "story" posts get the plain card with the shop's wordmark instead of art. */
  kind: 'article' | 'story'
  /** The pictogram drawn over the art. */
  icon: IconName
  /** The demo shop a story is about, shown as a text wordmark. */
  wordmark?: string
  author: Author
  body: RichBlock[]
}

const PLACEHOLDER_AUTHOR: Author = { name: 'Placeholder: author name', role: 'Placeholder: role' }

/** A stand-in body: a few paragraphs, a heading or two, and one list. */
function placeholderBody(extra: RichBlock[] = []): RichBlock[] {
  return [
    {
      type: 'p',
      text: 'Placeholder: this paragraph stands in for the opening of a real post. It runs to about the length of one, so the line length, the space between paragraphs and the way headings sit can all be checked.',
    },
    {
      type: 'p',
      text: 'Placeholder: a second paragraph. A real post would say what changed or what the seller can do now, and name the screen where they find it.',
    },
    { type: 'h2', text: 'Placeholder: first section heading' },
    {
      type: 'p',
      text: [
        'Placeholder: body text under a heading, with ',
        { text: 'a bold phrase', strong: true },
        ' and ',
        { text: 'a link to the help centre', href: '/resources' },
        ' so their styles can be checked.',
      ],
    },
    {
      type: 'ul',
      items: [
        'Placeholder: first point in a list.',
        'Placeholder: second point, a little longer so it wraps onto a second line on a phone.',
        'Placeholder: third point.',
      ],
    },
    ...extra,
    { type: 'h2', text: 'Placeholder: closing section heading' },
    {
      type: 'p',
      text: 'Placeholder: a closing paragraph. A real post would end on the next step, such as the setting to turn on or the guide to read.',
    },
  ]
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'placeholder-post-one',
    title: 'Placeholder: first blog post title',
    date: '2026-11-01',
    categories: ['Guide'],
    excerpt: 'Placeholder: a one-line summary of the post.',
    artSeed: 1,
    kind: 'article',
    icon: 'bag',
    author: PLACEHOLDER_AUTHOR,
    body: placeholderBody([
      { type: 'h3', text: 'Placeholder: a smaller heading' },
      {
        type: 'p',
        text: 'Placeholder: a paragraph that leads into a code sample. Hover the sample on a computer, or look at its corner on a phone, to find the copy button.',
      },
      {
        type: 'code',
        language: 'text',
        code: 'Placeholder: a code sample\nsecond line of the sample\nthird line of the sample, a little longer so it can scroll sideways on a phone',
      },
    ]),
  },
  {
    slug: 'placeholder-post-two',
    title: 'Placeholder: second blog post title',
    date: '2026-10-24',
    categories: ['Product update'],
    excerpt: 'Placeholder: a one-line summary of the post.',
    artSeed: 2,
    kind: 'article',
    icon: 'chart',
    author: PLACEHOLDER_AUTHOR,
    body: placeholderBody([
      {
        type: 'quote',
        text: 'Placeholder: a pulled quote, one or two sentences long, to check how quotes sit in the body.',
      },
    ]),
  },
  {
    slug: 'placeholder-post-three',
    title: 'Placeholder: third blog post title',
    date: '2026-10-17',
    categories: ['Product update', 'Guide'],
    excerpt: 'Placeholder: a one-line summary of the post.',
    artSeed: 3,
    kind: 'article',
    icon: 'truck',
    author: PLACEHOLDER_AUTHOR,
    body: placeholderBody(),
  },
  {
    slug: 'placeholder-seller-story-one',
    title: 'Placeholder: seller story title',
    date: '2026-10-10',
    categories: ['Seller story'],
    excerpt: 'Placeholder: a one-line summary of the story.',
    artSeed: 4,
    kind: 'story',
    icon: 'shirt',
    wordmark: 'adirelane',
    author: PLACEHOLDER_AUTHOR,
    body: placeholderBody(),
  },
  {
    slug: 'placeholder-post-four',
    title: 'Placeholder: fourth blog post title, a little longer so it wraps',
    date: '2026-10-03',
    categories: ['News'],
    excerpt: 'Placeholder: a one-line summary of the post.',
    artSeed: 5,
    kind: 'article',
    icon: 'globe',
    author: PLACEHOLDER_AUTHOR,
    body: placeholderBody(),
  },
  {
    slug: 'placeholder-seller-story-two',
    title: 'Placeholder: second seller story title',
    date: '2026-09-26',
    categories: ['Seller story'],
    excerpt: 'Placeholder: a one-line summary of the story.',
    artSeed: 6,
    kind: 'story',
    icon: 'sparkle',
    wordmark: 'itanna',
    author: PLACEHOLDER_AUTHOR,
    body: placeholderBody(),
  },
  {
    slug: 'placeholder-post-five',
    title: 'Placeholder: fifth blog post title',
    date: '2026-09-19',
    categories: ['Guide'],
    excerpt: 'Placeholder: a one-line summary of the post.',
    artSeed: 7,
    kind: 'article',
    icon: 'qr',
    author: PLACEHOLDER_AUTHOR,
    body: placeholderBody(),
  },
  {
    slug: 'placeholder-post-six',
    title: 'Placeholder: sixth blog post title',
    date: '2026-09-12',
    categories: ['Product update'],
    excerpt: 'Placeholder: a one-line summary of the post.',
    artSeed: 8,
    kind: 'article',
    icon: 'mail',
    author: PLACEHOLDER_AUTHOR,
    body: placeholderBody(),
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
  const shared = others.filter((other) => other.categories.some((label) => post.categories.includes(label)))
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
    kind: post.kind,
    wordmark: post.wordmark ?? '',
  }
}

/** Cards on one page of the blog and help centre, as on the reference. */
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
