import { Icon } from '@v2/components/ui/Icon'
import { SmartLink } from '@v2/components/ui/SmartLink'
import type { DemoShop } from '@v2/content/use-cases'

interface StoryCardProps {
  shop: DemoShop
  action: string
}

/**
 * A tall tile for one case study: the product's logo on white, then the
 * title, its tags and an arrow below. Hovering nudges the parts
 * apart.
 */
export function StoryCard({ shop, action }: StoryCardProps) {
  return (
    <div className="group anim-scale relative flex h-full flex-col" data-scroll="">
      <div className="absolute inset-0 rounded-md bg-white transition-transform duration-200 ease-in-out group-focus-within:scale-101 group-hover:scale-101" />
      <div className="relative z-2 flex aspect-464/392 items-center justify-center overflow-hidden border-b border-slate-100 p-5">
        <img
          src={shop.logo.src}
          alt={shop.logo.alt}
          draggable={false}
          className="max-h-[34%] max-w-[46%] object-contain transition-transform duration-200 ease-in-out group-focus-within:scale-105 group-hover:scale-105"
        />
      </div>
      <div className="relative z-2 flex grow flex-col gap-3.5 p-5">
        <h3 className="text-heading-xs transition-transform duration-200 ease-in-out group-focus-within:-translate-x-1 group-hover:-translate-x-1">
          {shop.title}
        </h3>
        <ul className="text-label -mt-1 flex flex-wrap gap-x-3.5 gap-y-1 text-navy-500">
          <li>{shop.trade}</li>
          <li>{shop.template}</li>
        </ul>
        <div className="mt-auto flex items-center justify-between">
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
