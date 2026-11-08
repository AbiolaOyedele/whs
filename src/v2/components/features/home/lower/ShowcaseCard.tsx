'use client'

import { useRef } from 'react'
import { ScrambleText, type ScrambleHandle } from '@v2/components/ui/ScrambleText'
import { SmartLink } from '@v2/components/ui/SmartLink'
import type { ShowcaseCard as ShowcaseCardData } from '@v2/content/home-lower'
import { SplitArrow } from './SplitArrow'

interface ShowcaseCardProps {
  card: ShowcaseCardData
}

const FAST = 'duration-(--transition-duration-fast) ease-in-out'

/**
 * A light card on the dark section: the product's logo on a white square,
 * title, one line and an underlined link to its case study. On hover the
 * card turns white, the tile grows a touch, the link loses its underline and
 * scrambles, and an arrow slides in. The whole card is the link.
 */
export function ShowcaseCard({ card }: ShowcaseCardProps) {
  const scramble = useRef<ScrambleHandle>(null)

  return (
    <div
      className="group anim-scale h-full"
      data-scroll=""
      onMouseEnter={() => scramble.current?.scramble()}
      onMouseLeave={() => scramble.current?.reset()}
    >
      <div className={`group relative flex h-full gap-4 rounded-md bg-slate-50 p-4 transition-all hover:bg-white slate:bg-white ${FAST}`}>
        <div className="relative w-22 shrink-0 sm:w-28">
          <div
            className={`absolute inset-0 rounded-sm border border-slate-100 bg-white transition-transform group-focus-within:scale-102 group-hover:scale-102 ${FAST}`}
          />
          <span className="relative flex aspect-square w-full items-center justify-center p-3 sm:p-4">
            <img src={card.logo.src} alt={card.logo.alt} className="max-h-full max-w-full object-contain" />
          </span>
        </div>
        <div className="flex grow flex-col justify-between gap-4">
          <div className="flex flex-col gap-1.5">
            <h3 className="text-heading-2xs">{card.title}</h3>
            <p className="text-body-md max-w-100 text-navy-500">{card.description}</p>
          </div>
          <div className="flex items-center justify-between gap-0.5 max-md:hidden" aria-hidden="true">
            <span className="text-label text-navy-500 underline underline-offset-2 group-focus-within:no-underline group-hover:no-underline">
              <ScrambleText ref={scramble}>{card.linkLabel}</ScrambleText>
            </span>
            <span
              className={`translate-x-1 opacity-0 transition-all group-focus-within:translate-x-0 group-focus-within:opacity-100 group-hover:translate-x-0 group-hover:opacity-100 ${FAST}`}
            >
              <SplitArrow />
            </span>
          </div>
        </div>
        <SmartLink href={card.href} className="absolute inset-0 z-above rounded-md -outline-offset-2">
          <span className="sr-only">
            {card.title}: {card.linkLabel}
          </span>
        </SmartLink>
      </div>
    </div>
  )
}
