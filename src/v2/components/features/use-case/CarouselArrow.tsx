'use client'

import { Icon } from '@v2/components/ui/Icon'

interface CarouselArrowProps {
  direction: 'previous' | 'next'
  disabled: boolean
  onClick: () => void
}

/** A square light button with an arrow, for stepping a carousel. Fades when there is nowhere to go. */
export function CarouselArrow({ direction, disabled, onClick }: CarouselArrowProps) {
  return (
    <button
      type="button"
      aria-label={direction === 'previous' ? 'Previous slide' : 'Next slide'}
      disabled={disabled}
      onClick={onClick}
      className="button group relative isolate inline-flex cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-sm bg-white text-navy-900 disabled:cursor-default disabled:opacity-50 max-md:h-10.5 max-md:w-10.5 slate:bg-white md:h-13.5 md:w-13.5"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 rounded-[inherit] bg-pink-100 opacity-0 transition-[transform,opacity] duration-200 ease-(--ease) [transform:scale3d(0.9,0.7,1)] group-hover:opacity-100 group-hover:[transform:scale3d(1,1,1)] group-disabled:opacity-0 group-disabled:[transform:scale3d(0.9,0.7,1)]"
      />
      <span className="pointer-events-none relative inline-flex size-5 items-center justify-center">
        <Icon name={direction === 'previous' ? 'arrowLeft' : 'arrowRight'} className="size-full" />
      </span>
    </button>
  )
}
