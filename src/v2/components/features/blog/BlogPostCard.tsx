import type { BlogCardData } from '@v2/content/blog'
import { PostCard } from '@v2/components/features/blog/PostCard'
import { StoryCard } from '@v2/components/features/blog/StoryCard'

interface BlogPostCardProps {
  post: BlogCardData
  headingLevel?: 'h2' | 'h3'
}

/** A post as a card: the plain wordmark card for stories, the art card for everything else. */
export function BlogPostCard({ post, headingLevel = 'h2' }: BlogPostCardProps) {
  if (post.kind === 'story' && post.wordmark) {
    return (
      <StoryCard
        href={post.href}
        title={post.title}
        wordmark={post.wordmark}
        headingLevel={headingLevel}
      />
    )
  }
  return (
    <PostCard
      href={post.href}
      title={post.title}
      date={post.date}
      dateLabel={post.dateLabel}
      labels={post.labels}
      photo={post.photo}
      headingLevel={headingLevel}
    />
  )
}
