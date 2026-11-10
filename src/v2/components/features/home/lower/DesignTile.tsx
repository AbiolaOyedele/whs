import { SmartLink } from '@v2/components/ui/SmartLink'
import type { ShopDesignTile } from '@v2/content/home-lower'
import { SplitArrow } from './SplitArrow'

interface DesignTileProps {
  tile: ShopDesignTile
}

const FAST = 'duration-(--transition-duration-fast) ease-in-out'

/**
 * One project in the recent work carousel, set flush on the white panel: the product's logo on its own,
 * then a line about the result, its industry and a link to its case study.
 * On hover the logo grows a touch and the arrow nudges right.
 */
export function DesignTile({ tile }: DesignTileProps) {
  return (
    <div className="group anim-scale relative flex h-full flex-col gap-8" data-scroll="">
      <img
        src={tile.logo.src}
        alt={tile.logo.alt}
        loading="lazy"
        decoding="async"
        draggable={false}
        className={`h-10 w-auto max-w-40 self-start object-contain object-left transition-transform group-focus-within:scale-105 group-hover:scale-105 md:h-12 ${FAST}`}
      />
      <div className="flex grow flex-col gap-3">
        <h3 className="text-heading-xs text-navy-900">{tile.title}</h3>
        <p className="text-body-sm text-navy-900">{tile.tags.join(' · ')}</p>
      </div>
      <span
        className="text-body-md text-navy-900 inline-flex items-center gap-2 font-medium"
        aria-hidden="true"
      >
        {tile.linkLabel}
        <span
          className={`transition-transform group-focus-within:translate-x-1 group-hover:translate-x-1 ${FAST}`}
        >
          <SplitArrow className="size-5" />
        </span>
      </span>
      <SmartLink
        href={tile.href}
        className="absolute inset-0 z-3 rounded-md -outline-offset-2"
        draggable={false}
      >
        <span className="sr-only">
          {tile.name}: {tile.linkLabel}
        </span>
      </SmartLink>
    </div>
  )
}
