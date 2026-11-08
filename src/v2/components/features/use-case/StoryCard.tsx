import { Icon } from '@v2/components/ui/Icon'
import { SmartLink } from '@v2/components/ui/SmartLink'
import type { DemoShop } from '@v2/content/use-cases'

interface StoryCardProps {
  shop: DemoShop
  action: string
}

/**
 * A tall tile for one case study: its tags top left, the client as a wordmark in
 * the middle, the title and an arrow below. Hovering nudges the parts apart.
 */
export function StoryCard({ shop, action }: StoryCardProps) {
  return (
    <div className="group anim-scale relative flex h-full flex-col" data-scroll="">
      <div className="absolute inset-0 rounded-md bg-slate-100 transition-transform duration-200 ease-in-out group-focus-within:scale-101 group-hover:scale-101" />
      <div className="relative z-2 flex aspect-464/392 items-center justify-center overflow-hidden p-5">
        <ul className="text-label absolute top-5 left-5 flex gap-3.5 text-navy-500 transition-transform duration-200 ease-in-out group-focus-within:-translate-1 group-hover:-translate-1">
          <li>{shop.trade}</li>
          <li>{shop.template}</li>
        </ul>
        <span className="font-secondary text-heading-lg leading-none text-navy-900" aria-hidden="true">
          {shop.slug}
        </span>
      </div>
      <div className="relative z-2 flex grow flex-col justify-between gap-3.5 p-5">
        <h3 className="text-heading-xs transition-transform duration-200 ease-in-out group-focus-within:-translate-x-1 group-hover:-translate-x-1">
          {shop.title}
        </h3>
        <div className="flex items-center justify-between">
          <span className="text-body-sm text-navy-500 duration-200 ease-in-out group-focus-within:-translate-x-1 group-focus-within:translate-y-1 group-hover:-translate-x-1 group-hover:translate-y-1">
            {action}
          </span>
          <span className="-translate-x-1 opacity-0 transition-all duration-200 ease-in-out group-focus-within:translate-1 group-focus-within:opacity-100 group-hover:translate-1 group-hover:opacity-100">
            <Icon name="arrowRight" className="size-6" />
          </span>
        </div>
      </div>
      <SmartLink href={shop.href} className="absolute inset-0 z-3 rounded-md -outline-offset-2">
        <span className="sr-only">{shop.title}</span>
      </SmartLink>
    </div>
  )
}
