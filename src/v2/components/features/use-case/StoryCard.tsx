import { Icon } from '@v2/components/ui/Icon'
import { SmartLink } from '@v2/components/ui/SmartLink'
import type { DemoShop } from '@v2/content/use-cases'

interface StoryCardProps {
  shop: DemoShop
  action: string
}

/**
 * One case study on the white panel, set flush so it lines up with the heading: the product's logo on its own, then the
 * title, its tags and a link. On hover the logo grows a touch and the arrow
 * nudges right.
 */
export function StoryCard({ shop, action }: StoryCardProps) {
  return (
    <div className="group anim-scale relative flex h-full flex-col gap-8" data-scroll="">
      <img
        src={shop.logo.src}
        alt={shop.logo.alt}
        draggable={false}
        className="h-10 w-auto max-w-40 self-start object-contain object-left transition-transform duration-200 ease-in-out group-focus-within:scale-105 group-hover:scale-105 md:h-12"
      />
      <div className="flex grow flex-col gap-3">
        <h3 className="text-heading-xs text-navy-900">{shop.title}</h3>
        <p className="text-body-sm text-navy-900">
          {shop.trade} · {shop.template}
        </p>
      </div>
      <span
        className="text-body-md text-navy-900 inline-flex items-center gap-2 font-medium"
        aria-hidden="true"
      >
        {action}
        <Icon
          name="arrowRight"
          className="size-5 transition-transform duration-200 ease-in-out group-focus-within:translate-x-1 group-hover:translate-x-1"
        />
      </span>
      <SmartLink href={shop.href} className="absolute inset-0 z-3 rounded-md -outline-offset-2">
        <span className="sr-only">{shop.title}</span>
      </SmartLink>
    </div>
  )
}
