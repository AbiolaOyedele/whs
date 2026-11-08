import { SmartLink } from '@v2/components/ui/SmartLink'
import type { ShopDesignTile } from '@v2/content/home-lower'
import { SplitArrow } from './SplitArrow'

interface DesignTileProps {
  tile: ShopDesignTile
}

const FAST = 'duration-(--transition-duration-fast) ease-in-out'

/**
 * A tall slate tile in the designs carousel: tags top left, the design's
 * name large in the middle, a line about it and a link to its demo shop.
 * On hover the backing grows 1%, the text nudges toward the corner and an
 * arrow slides in.
 */
export function DesignTile({ tile }: DesignTileProps) {
  return (
    <div className="group anim-scale relative flex h-full flex-col" data-scroll="">
      <div
        className={`absolute inset-0 rounded-md bg-slate-100 transition-transform group-focus-within:scale-101 group-hover:scale-101 ${FAST}`}
      />
      <div className="relative z-2 flex aspect-464/392 items-center justify-center overflow-hidden p-5">
        <ul
          className={`text-label absolute top-5 right-5 left-5 flex flex-wrap gap-x-3.5 gap-y-1 text-navy-500 transition-transform group-focus-within:-translate-1 group-hover:-translate-1 ${FAST}`}
        >
          {tile.tags.map((tag) => (
            <li key={tag}>{tag}</li>
          ))}
        </ul>
        <p className="text-heading-md text-navy-900" aria-hidden="true">
          {tile.wordmark}
        </p>
      </div>
      <div className="relative z-2 flex grow flex-col justify-between gap-3.5 p-5">
        <h3
          className={`text-heading-xs transition-transform group-focus-within:-translate-x-1 group-hover:-translate-x-1 ${FAST}`}
        >
          {tile.title}
        </h3>
        <div className="flex items-center justify-between">
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
          {tile.wordmark} design: {tile.linkLabel}
        </span>
      </SmartLink>
    </div>
  )
}
