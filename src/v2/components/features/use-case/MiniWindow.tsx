import type { ReactNode } from 'react'
import { VISUAL_SMALL, VISUAL_TEXT } from './visualText'

interface MiniWindowProps {
  /** Left of the title bar: what this window is. */
  title: ReactNode
  /** Right of the title bar, if anything. */
  aside?: ReactNode
  children: ReactNode
  className?: string
}

/** A small white app window for the feature illustrations: a title bar over its contents. */
export function MiniWindow({ title, aside, children, className = '' }: MiniWindowProps) {
  return (
    <div className={`overflow-hidden rounded-md bg-white text-navy-900 ${className}`}>
      <div className="flex min-h-10 items-center justify-between gap-3 border-b border-navy-900 px-3 py-2 sm:px-4">
        <span className={`flex min-w-0 items-center gap-2 font-medium ${VISUAL_TEXT}`}>{title}</span>
        {aside ? <span className={`shrink-0 ${VISUAL_SMALL}`}>{aside}</span> : null}
      </div>
      {children}
    </div>
  )
}
