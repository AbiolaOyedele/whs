import { sortedPosts, toBlogCard } from '@v2/content/blog'
import { BlogExplorer } from '@v2/components/features/blog/BlogExplorer'
import { FeaturedLarge } from '@v2/components/features/blog/FeaturedLarge'
import { FeaturedSmall } from '@v2/components/features/blog/FeaturedSmall'

const SIDE_DELAYS = [1, 2, 3, 4] as const

/** The blog's list page, shared by /blog, /blog/page/n and /blog/category/x. */
export function BlogIndex() {
  const cards = sortedPosts().map(toBlogCard)
  const [lead, ...rest] = cards
  const side = rest.slice(0, SIDE_DELAYS.length)

  const featured = lead ? (
    <div className="grid gap-gutter max-md:mb-6 md:mb-fluid-xl md:grid-cols-12">
      <FeaturedLarge post={lead} />
      <div className="max-md:hidden md:col-span-4">
        <div className="flex h-full flex-col gap-gutter">
          {side.map((post, index) => (
            <FeaturedSmall key={post.slug} post={post} delay={SIDE_DELAYS[index] ?? 4} />
          ))}
        </div>
      </div>
    </div>
  ) : null

  return (
    <div className="overflow-hidden rounded-b-4xl">
      <BlogExplorer posts={cards} featured={featured} />
    </div>
  )
}
