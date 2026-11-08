'use client'

import { useEffect, useLayoutEffect, useMemo, useRef, useState, type MouseEvent, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { site } from '@v2/config/site'
import { BLOG_CATEGORIES, categoryBySlug, POSTS_PER_PAGE, type BlogCardData } from '@v2/content/blog'
import { motionAllowed } from '@v2/lib/gsap'
import { refreshScrollElements } from '@v2/lib/scroll'
import { BlogPostCard } from '@v2/components/features/blog/BlogPostCard'
import { CategoryTabs, type CategoryTab } from '@v2/components/features/blog/CategoryTabs'
import { Pagination } from '@v2/components/features/blog/Pagination'

interface BlogExplorerProps {
  /** Every post, newest first. */
  posts: BlogCardData[]
  /** The newest posts, drawn above the filter. */
  featured: ReactNode
}

/** Must match --transition-page-duration, the reference's fade on a fragment swap. */
const FADE_MS = 300

const TABS: CategoryTab[] = [
  { label: 'All posts', href: '/blog' },
  ...BLOG_CATEGORIES.map((category) => ({ label: category.tab, href: `/blog/category/${category.slug}` })),
]

/** The category slug in a blog address, or null for the all-posts list. */
function categoryFromPath(pathname: string): string | null {
  const match = /^\/blog\/category\/([^/]+)/.exec(pathname)
  return match?.[1] ?? null
}

/** The all-posts page number in a blog address; 1 when there is none. */
function pageFromPath(pathname: string): number {
  const match = /^\/blog\/page\/(\d+)/.exec(pathname)
  return match?.[1] ? Number(match[1]) : 1
}

/** What the grid shows: a category slug, or a page of every post. */
type View = { category: string; page: 1 } | { category: null; page: number }

function viewFromPath(pathname: string): View {
  const category = categoryFromPath(pathname)
  return category ? { category, page: 1 } : { category: null, page: pageFromPath(pathname) }
}

/** The same title a direct load of that address gets from its route's metadata. */
function titleFor(view: View): string {
  const category = view.category ? categoryBySlug(view.category) : undefined
  if (category) return `${category.tab} | Insights | ${site.name}`
  if (view.page > 1) return `Insights, page ${view.page} | ${site.name}`
  return `Insights | ${site.name}`
}

function sameView(a: View, b: View): boolean {
  return a.category === b.category && a.page === b.page
}

/**
 * The blog list: featured posts, the category filter and the results grid.
 * Choosing a category changes the address but swaps only the grid, which
 * fades out and back in; the rest of the page stays put, as on the reference.
 */
export function BlogExplorer({ posts, featured }: BlogExplorerProps) {
  const pathname = usePathname()
  const target = viewFromPath(pathname)
  const [shown, setShown] = useState<View>(target)
  const fading = !sameView(shown, target)
  const grid = useRef<HTMLDivElement>(null)

  // Choosing a category, or going back and forward, loads no route metadata, so set the title here.
  useEffect(() => {
    if (pathname === '/blog' || pathname.startsWith('/blog/category/') || pathname.startsWith('/blog/page/')) {
      document.title = titleFor(viewFromPath(pathname))
    }
  }, [pathname])

  // Fade the old cards out, then swap in the new ones, which fade back in.
  useEffect(() => {
    if (!fading) return
    const next = viewFromPath(pathname)
    const timer = window.setTimeout(() => setShown(next), motionAllowed() ? FADE_MS : 0)
    return () => window.clearTimeout(timer)
  }, [fading, pathname])

  // New cards need the scroll engine to watch them, for their entrance and parallax.
  useLayoutEffect(() => {
    const node = grid.current
    if (node) refreshScrollElements(node, node)
  }, [shown])

  const visible = useMemo(() => {
    const { category, page } = shown
    if (category) return posts.filter((post) => post.categorySlugs.some((slug) => slug === category))
    return posts.slice((page - 1) * POSTS_PER_PAGE, page * POSTS_PER_PAGE)
  }, [posts, shown])

  const totalPages = shown.category ? 1 : Math.max(1, Math.ceil(posts.length / POSTS_PER_PAGE))
  const selected = Math.max(
    0,
    TABS.findIndex((tab) => tab.href === (target.category ? `/blog/category/${target.category}` : '/blog')),
  )

  const onSelect = (index: number, event: MouseEvent<HTMLAnchorElement>) => {
    const tab = TABS[index]
    if (!tab || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    event.preventDefault()
    if (tab.href === pathname) return
    window.history.pushState(null, '', tab.href)
  }

  return (
    <>
      <div className="slate bg-slate-50">
        <div className="container">
          <header className="mb-fluid-lg h-safe-header">
            <h1 className="sr-only">Insights</h1>
          </header>
          {featured}
          <div className="mb-6">
            <nav className="anim-transform-opacity -delay-2 mt-4" aria-label="Filter by category">
              <CategoryTabs tabs={TABS} selected={selected} onSelect={onSelect} />
            </nav>
          </div>
          <div className="anim-transform-opacity -delay-3">
            <div
              ref={grid}
              id="blog-article-results"
              data-fading={fading ? 'true' : undefined}
              className="c-blog-results transition-fade grid gap-gutter md:grid-cols-3"
            >
              {visible.map((post) => (
                <BlogPostCard key={post.slug} post={post} />
              ))}
              {visible.length === 0 ? (
                <p className="text-body-lg md:col-span-3">No posts in this category yet.</p>
              ) : null}
            </div>
          </div>
        </div>
      </div>
      <div className="bg-slate-50 py-fluid-3xl">
        <div className="container flex justify-center">
          <Pagination basePath="/blog" current={shown.page} total={totalPages} />
        </div>
      </div>
    </>
  )
}
