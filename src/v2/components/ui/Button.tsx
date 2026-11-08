'use client'

import { useRef, type ReactNode } from 'react'
import { SmartLink } from '@v2/components/ui/SmartLink'
import { ScrambleText, type ScrambleHandle } from '@v2/components/ui/ScrambleText'

export type ButtonVariant = 'pink' | 'navy' | 'slate' | 'glass' | 'light' | 'white'

/** Resting fill, text colour, and the fill that grows in from 90% on hover. */
const VARIANTS: Record<ButtonVariant, { base: string; hover: string }> = {
  pink: { base: 'bg-pink-500 text-charcoal', hover: 'bg-pink-600' },
  navy: { base: 'bg-navy-500 text-white', hover: 'bg-navy-900' },
  slate: { base: 'bg-slate-200 slate:bg-slate-200 text-navy-900', hover: 'bg-slate-400 slate:bg-slate-400' },
  glass: { base: 'bg-charcoal/35 backdrop-blur-lg text-white', hover: 'bg-charcoal/50' },
  light: { base: 'bg-slate-50 slate:bg-white text-navy-900', hover: 'bg-slate-100 slate:bg-slate-300' },
  white: { base: 'bg-white text-navy-900', hover: 'bg-slate-100' },
}

const BASE =
  'button group relative isolate inline-flex items-center justify-center gap-2 overflow-hidden rounded-sm md:min-h-13.5 md:px-5 max-md:min-h-11 max-md:px-3.5'

interface ButtonProps {
  label: string
  variant?: ButtonVariant
  href?: string
  onClick?: () => void
  type?: 'button' | 'submit'
  className?: string
  /** Shown after the label, e.g. an external-link arrow. */
  trailing?: ReactNode
  ariaExpanded?: boolean
  dataAttributes?: Record<`data-${string}`, string>
}

/**
 * The site's one button. On hover a darker fill scales up behind the label
 * and the label scrambles; on a touch screen only the fill changes.
 */
export function Button({
  label,
  variant = 'pink',
  href,
  onClick,
  type = 'button',
  className = '',
  trailing,
  ariaExpanded,
  dataAttributes,
}: ButtonProps) {
  const scramble = useRef<ScrambleHandle>(null)
  const look = VARIANTS[variant]
  const classes = `${BASE} ${look.base} ${className}`
  // Wide buttons grow their fill from 95% across, narrow ones from 90%.
  const fillStart = /(^|\s)w-full(\s|$)/.test(className) ? '[transform:scale3d(0.95,0.7,1)]' : '[transform:scale3d(0.9,0.7,1)]'

  const inner = (
    <>
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 -z-10 rounded-[inherit] opacity-0 transition-[transform,opacity] duration-200 ease-(--ease) ${fillStart} group-hover:opacity-100 group-hover:[transform:scale3d(1,1,1)] group-disabled:opacity-0 ${look.hover}`}
      />
      <ScrambleText ref={scramble} className="text-label z-2 inline-block leading-none">
        {label}
      </ScrambleText>
      {trailing}
    </>
  )

  const hover = {
    onMouseEnter: () => scramble.current?.scramble(),
    onMouseLeave: () => scramble.current?.reset(),
  }

  if (href) {
    return (
      <SmartLink href={href} className={classes} onClick={onClick} {...hover} {...dataAttributes}>
        {inner}
      </SmartLink>
    )
  }

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      aria-expanded={ariaExpanded}
      {...hover}
      {...dataAttributes}
    >
      {inner}
    </button>
  )
}
