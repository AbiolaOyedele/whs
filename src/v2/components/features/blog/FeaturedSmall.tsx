import type { BlogCardData } from '@v2/content/blog'
import { Icon } from '@v2/components/ui/Icon'
import { SmartLink } from '@v2/components/ui/SmartLink'

interface FeaturedSmallProps {
  post: BlogCardData
  /** 1 to 4: staggers the entrance down the column. */
  delay: 1 | 2 | 3 | 4
}

const DELAY = { 1: '-delay-1', 2: '-delay-2', 3: '-delay-3', 4: '-delay-4' } as const

/** A recent post in the column beside the large one: a navy tile with the pictogram, then the words. */
export function FeaturedSmall({ post, delay }: FeaturedSmallProps) {
  return (
    <div className={`group anim-transform-opacity relative flex gap-gutter ${DELAY[delay]}`}>
      <div className="relative flex aspect-square w-1/3 shrink-0">
        <img
          src={post.photo.src}
          alt={post.photo.alt}
          className="absolute inset-0 size-full rounded-md object-cover transition-transform duration-200 ease-in-out group-focus-within:scale-102 group-hover:scale-105"
        />
      </div>
      <div className="flex min-w-0 flex-col justify-between gap-0.5">
        <div>
          <h2 className="text-heading-2xs line-clamp-3">{post.title}</h2>
          <ul className="anim-transform-opacity -delay-1 mt-2 flex flex-wrap gap-x-5 gap-y-1 leading-none">
            <li>
              <time dateTime={post.date} className="text-label">
                {post.shortDateLabel}
              </time>
            </li>
            {post.labels.slice(0, 1).map((label) => (
              <li key={label}>
                <span className="text-label text-navy-900">{label}</span>
              </li>
            ))}
          </ul>
        </div>
        <div
          aria-hidden="true"
          className="shrink-0 translate-x-1 opacity-0 transition-all duration-200 ease-in-out group-focus-within:translate-x-0 group-focus-within:opacity-100 group-hover:translate-x-0 group-hover:opacity-100"
        >
          <Icon name="arrowRight" />
        </div>
      </div>
      <SmartLink href={post.href} className="absolute inset-0 z-above rounded-md -outline-offset-2">
        <span className="sr-only">{post.title}</span>
      </SmartLink>
    </div>
  )
}
