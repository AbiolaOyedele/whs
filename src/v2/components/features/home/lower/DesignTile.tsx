import { SmartLink } from '@v2/components/ui/SmartLink'
import type { ShopDesignTile } from '@v2/content/home-lower'
import { SplitArrow } from './SplitArrow'

interface DesignTileProps {
  tile: ShopDesignTile
}

const FAST = 'duration-(--transition-duration-fast) ease-in-out'

/**
 * A tall white tile in the recent work carousel, as on the Work page: the
 * product's logo centred, then a line about the result, its industry and a
 * link to its case study. On hover the backing grows 1%, the
 * logo eases up a touch, the text nudges toward the corner and an arrow
 * slides in.
 */
export function DesignTile({ tile }: DesignTileProps) {
  return (
    <div className="group anim-scale relative flex h-full flex-col" data-scroll="">
      <div
        className={`absolute inset-0 rounded-md bg-white transition-transform group-focus-within:scale-101 group-hover:scale-101 ${FAST}`}
      />
      <div className="relative z-2 flex aspect-464/392 items-center justify-center overflow-hidden border-b border-slate-100 p-5">
        <img
          src={tile.logo.src}
          alt={tile.logo.alt}
          draggable={false}
          className={`max-h-[34%] max-w-[46%] object-contain transition-transform group-focus-within:scale-105 group-hover:scale-105 ${FAST}`}
        />
      </div>
      <div className="relative z-2 flex grow flex-col gap-3.5 p-5">
        <h3
          className={`text-heading-xs transition-transform group-focus-within:-translate-x-1 group-hover:-translate-x-1 ${FAST}`}
        >
          {tile.title}
        </h3>
        <ul className="text-label -mt-1 flex flex-wrap gap-x-3.5 gap-y-1 text-navy-500">
          {tile.tags.map((tag) => (
            <li key={tag}>{tag}</li>
          ))}
        </ul>
        <div className="mt-auto flex items-center justify-between">
          <span
            className={`text-body-sm text-navy-500 group-focus-within:-translate-x-1 group-focus-within:translate-y-1 group-hover:-translate-x-1 group-hover:translate-y-1 ${FAST}`}
          >
            {tile.linkLabel}
          </span>
          <span
            className={`-translate-x-1 opacity-0 transition-all group-focus-within:translate-1 group-focus-within:opacity-100 group-hover:translate-1 group-hover:opacity-100 ${FAST}`}
            aria-hidden="true"
          >
            <SplitArrow />
          </span>
        </div>
      </div>
      <SmartLink href={tile.href} className="absolute inset-0 z-3 rounded-md -outline-offset-2" draggable={false}>
        <span className="sr-only">
          {tile.name}: {tile.linkLabel}
        </span>
      </SmartLink>
    </div>
  )
}
