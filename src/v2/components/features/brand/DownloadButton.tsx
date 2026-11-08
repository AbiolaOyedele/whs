'use client'

import { useRef } from 'react'
import { Icon } from '@v2/components/ui/Icon'
import { ScrambleText, type ScrambleHandle } from '@v2/components/ui/ScrambleText'

interface DownloadButtonProps {
  label: string
  href: string
  className?: string
}

/**
 * The tall navy download button from the brand page: the site button's
 * hover (fill grows in, label scrambles) in navy, with a download icon.
 */
export function DownloadButton({ label, href, className = '' }: DownloadButtonProps) {
  const scramble = useRef<ScrambleHandle>(null)
  return (
    <a
      href={href}
      className={`button group relative isolate inline-flex min-h-15 items-center justify-center gap-2 overflow-hidden rounded-sm bg-navy-500 px-3.5 text-white md:px-5 ${className}`}
      onMouseEnter={() => scramble.current?.scramble()}
      onMouseLeave={() => scramble.current?.reset()}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 rounded-[inherit] bg-navy-900 opacity-0 transition-[transform,opacity] duration-200 ease-(--ease) [transform:scale3d(0.9,0.7,1)] group-hover:opacity-100 group-hover:[transform:scale3d(1,1,1)]"
      />
      <ScrambleText ref={scramble} className="text-label z-2 inline-block leading-none">
        {label}
      </ScrambleText>
      <span className="pointer-events-none relative inline-flex items-center justify-center" aria-hidden="true">
        <Icon name="download" className="size-6.5" />
      </span>
    </a>
  )
}
