import { ParallaxMedia } from '@v2/components/ui/ParallaxMedia'
import { SmartLink } from '@v2/components/ui/SmartLink'
import type { BlogPost } from '@v2/content/blog'
import { SplitArrow } from './SplitArrow'

interface PostCardProps {
  post: BlogPost
}

const FAST = 'duration-(--transition-duration-fast) ease-in-out'

const DATE_FORMAT = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })

/**
 * A blog card: art that drifts as the page scrolls and zooms slowly on
 * hover, then the date and categories in mono and the title. The whole card
 * is the link.
 */
export function PostCard({ post }: PostCardProps) {
  return (
    <div className="group anim-scale relative flex h-full flex-col overflow-hidden rounded-md" data-scroll="">
      <div className="relative flex aspect-464/392 items-center justify-center overflow-hidden">
        <ParallaxMedia speed={-0.1}>
          <div className="absolute inset-0 transition-transform duration-(--transition-duration-slow) ease-in-out group-focus-within:scale-105 group-hover:scale-105">
            <img src={post.photo.src} alt={post.photo.alt} className="size-full object-cover" />
          </div>
        </ParallaxMedia>
      </div>
      <div className="flex grow flex-col gap-3.5 bg-slate-50 p-5 pb-7 slate:bg-white">
        <h3 className="text-heading-xs">{post.title}</h3>
        <div className="mt-auto flex items-center justify-between">
          <ul className="text-label flex flex-wrap gap-x-3.5 gap-y-1">
            <li>
              <time dateTime={post.date}>{DATE_FORMAT.format(new Date(`${post.date}T00:00:00Z`))}</time>
            </li>
            {post.categories.map((category) => (
              <li key={category} className={`text-navy-500 transition-all group-hover:text-navy-900 ${FAST}`}>
                {category}
              </li>
            ))}
          </ul>
          <span
            className={`shrink-0 translate-x-1 opacity-0 transition-all group-focus-within:translate-x-0 group-focus-within:opacity-100 group-hover:translate-x-0 group-hover:opacity-100 ${FAST}`}
            aria-hidden="true"
          >
            <SplitArrow />
          </span>
        </div>
      </div>
      <SmartLink href={`/blog/${post.slug}`} className="absolute inset-0 z-above rounded-md -outline-offset-2">
        <span className="sr-only">{post.title}</span>
      </SmartLink>
    </div>
  )
}
