import { Button } from '@v2/components/ui/Button'
import { latestPosts } from '@v2/content/blog'
import { BLOG_ROW } from '@v2/content/home-lower'
import { PostCard } from './PostCard'

/**
 * The newest three posts. Three columns from 1000px; below that a sideways
 * row that snaps card by card and runs to the screen edges.
 */
export function LatestPosts() {
  const posts = latestPosts(3)
  if (posts.length === 0) return null

  return (
    <div className="c-home-lower-spacing container">
      <div className="mb-fluid-lg flex items-center justify-between gap-4">
        <h2 className="text-heading-sm">{BLOG_ROW.title}</h2>
        <Button label={BLOG_ROW.seeAll.label} href={BLOG_ROW.seeAll.href} variant="outline" className="shrink-0" />
      </div>
      <div className="no-scrollbar gap-gutter max-md:-mx-(--grid-margin) max-md:flex max-md:snap-x max-md:snap-mandatory max-md:scroll-pl-(--grid-margin) max-md:overflow-x-auto max-md:px-(--grid-margin) max-md:pb-gutter md:grid md:grid-cols-3">
        {posts.map((post) => (
          <div key={post.slug} className="c-home-lower-post max-md:shrink-0 max-md:snap-start">
            <PostCard post={post} />
          </div>
        ))}
      </div>
    </div>
  )
}
