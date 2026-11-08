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
        <div
          aria-hidden="true"
          className="absolute inset-0 rounded-md bg-navy-500 transition-transform duration-200 ease-in-out group-focus-within:scale-102 group-hover:scale-105"
        />
        <div className="relative z-above flex grow items-center justify-center">
          <div className="flex aspect-square w-1/2 items-center justify-center">
            <Icon name={post.icon} strokeWidth={1.25} className="size-full text-white" />
          </div>
        </div>
      </div>
      <div className="flex min-w-0 flex-col justify-between gap-0.5">
        <div>
          <ul className="anim-transform-opacity -delay-1 mb-1 flex flex-wrap gap-x-5 gap-y-1 leading-none">
            <li>
              <time dateTime={post.date} className="text-label">
                {post.shortDateLabel}
              </time>
            </li>
            {post.labels.slice(0, 1).map((label) => (
              <li key={label}>
                <span className="text-label text-navy-500">{label}</span>
              </li>
            ))}
          </ul>
          <h2 className="text-heading-2xs line-clamp-3">{post.title}</h2>
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
