'use client'

import { useRef } from 'react'
import { Icon } from '@v2/components/ui/Icon'
import { ScrambleText, type ScrambleHandle } from '@v2/components/ui/ScrambleText'
import { SmartLink } from '@v2/components/ui/SmartLink'
import type { ExampleLink } from '@v2/content/use-cases'

interface ExampleCardProps {
  item: ExampleLink
}

/**
 * A wide link card: an icon tile on the left, title and line on the right,
 * and an underlined action that scrambles and grows an arrow on hover. The
 * whole card is the link.
 */
export function ExampleCard({ item }: ExampleCardProps) {
  const scramble = useRef<ScrambleHandle>(null)

  return (
    <div className="group anim-scale" data-scroll="">
      <div
        className="group relative flex gap-4 rounded-md bg-slate-50 p-4 transition-all duration-200 ease-in-out hover:bg-white slate:bg-white"
        onMouseEnter={() => scramble.current?.scramble()}
        onMouseLeave={() => scramble.current?.reset()}
      >
        <div className="relative shrink-0 basis-1/4">
          <div className="relative">
            <div className={`absolute inset-0 rounded-sm ${item.image?.fit === 'logo' ? 'bg-white' : 'bg-slate-200'} transition-transform duration-200 ease-in-out group-focus-within:scale-102 group-hover:scale-102`} />
            {item.image ? (
              item.image.fit === 'logo' ? (
                <img src={item.image.src} alt={item.image.alt} className="relative aspect-square w-full object-contain p-4" />
              ) : (
                <img src={item.image.src} alt={item.image.alt} className="relative aspect-square w-full rounded-sm object-cover" />
              )
            ) : (
              <span className="relative flex aspect-square w-full items-center justify-center p-5">
                <Icon name={item.icon} className="h-1/2 w-1/2 text-navy-900" />
              </span>
            )}
          </div>
        </div>
        <div className="flex grow flex-col justify-between gap-4">
          <div className="flex flex-col gap-1.5">
            <h3 className="text-heading-2xs">{item.title}</h3>
            <p className="text-body-md max-w-100 text-navy-500">{item.body}</p>
          </div>
          <div className="flex items-center justify-between gap-0.5 max-md:hidden">
            <span className="text-label text-navy-500 underline underline-offset-2 group-focus-within:no-underline group-hover:no-underline">
              <ScrambleText ref={scramble}>{item.action}</ScrambleText>
            </span>
            <span className="translate-x-1 opacity-0 transition-all duration-200 ease-in-out group-focus-within:translate-x-0 group-focus-within:opacity-100 group-hover:translate-x-0 group-hover:opacity-100">
              <Icon name="arrowRight" className="size-6" />
            </span>
          </div>
        </div>
        <SmartLink href={item.href} className="absolute inset-0 z-above rounded-md -outline-offset-2">
          <span className="sr-only">{item.title}</span>
        </SmartLink>
      </div>
    </div>
  )
}
