'use client'

import type { ReactNode } from 'react'
import { SmartLink } from '@v2/components/ui/SmartLink'

export type ButtonVariant = 'pink' | 'navy' | 'slate' | 'glass' | 'light' | 'white'

/**
 * Resting surface, the colour the hover circle floods with, and the label
 * colour once flooded. Same pairings as the main site's flow buttons: lime
 * floods to ink, ink floods to lime, light surfaces flood to ink.
 */
const VARIANTS: Record<ButtonVariant, { base: string; circle: string; hoverText: string }> = {
  pink: { base: 'bg-pink-500 text-charcoal', circle: 'bg-charcoal', hoverText: 'hover:text-white' },
  navy: { base: 'bg-navy-900 text-white', circle: 'bg-pink-500', hoverText: 'hover:text-charcoal' },
  slate: { base: 'bg-slate-200 text-navy-900', circle: 'bg-charcoal', hoverText: 'hover:text-white' },
  glass: { base: 'bg-charcoal/35 backdrop-blur-lg text-white', circle: 'bg-white', hoverText: 'hover:text-charcoal' },
  light: { base: 'bg-slate-50 slate:bg-white text-navy-900', circle: 'bg-charcoal', hoverText: 'hover:text-white' },
  white: { base: 'bg-white text-navy-900', circle: 'bg-charcoal', hoverText: 'hover:text-white' },
}

/* The main site's flow interaction (src/components/ui/flow-button.tsx): the
   pill squares off, a circle floods from the centre and arrows slide across. */
const BASE =
  'button group relative isolate inline-flex items-center justify-center gap-2 overflow-hidden font-sans font-medium ' +
  'rounded-[100px] transition-all duration-[600ms] ease-[cubic-bezier(0.23,1,0.32,1)] hover:rounded-[12px] active:scale-[0.97] ' +
  'md:min-h-13.5 md:px-7 max-md:min-h-11 max-md:px-5'

function FlowArrow({ className }: { className: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  )
}

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
 * The site's one button, with the main site's flow hover: the pill squares
 * off, a circle floods it from the centre and an arrow slides in. On a touch
 * screen there is no hover, so it simply works as a button.
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
  const look = VARIANTS[variant]
  const classes = `${BASE} ${look.base} ${look.hoverText} ${className}`
  // Wide buttons keep the label centred: arrows travelling across a full-width
  // button read as unrelated to it (same rule as the main site).
  const arrows = !/(^|\s)w-full(\s|$)/.test(className)

  const inner = (
    <>
      {arrows && (
        <FlowArrow className="absolute left-[-25%] z-[9] size-4 transition-all duration-[800ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:left-4" />
      )}
      <span
        className={`relative z-[1] inline-flex items-center gap-2 leading-none transition-all duration-[800ms] ease-out ${
          arrows ? 'group-hover:translate-x-3' : 'group-hover:scale-[1.045]'
        }`}
      >
        {label}
        {trailing}
      </span>
      <span
        aria-hidden="true"
        className={`absolute top-1/2 left-1/2 aspect-square w-[135%] -translate-x-1/2 -translate-y-1/2 scale-0 rounded-full opacity-0 transition-[transform,opacity] duration-[800ms] ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:scale-100 group-hover:opacity-100 ${look.circle}`}
      />
      {arrows && (
        <FlowArrow className="absolute right-4 z-[9] size-4 opacity-0 transition-all duration-[800ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:right-[-25%]" />
      )}
    </>
  )

  if (href) {
    return (
      <SmartLink href={href} className={classes} onClick={onClick} {...dataAttributes}>
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
      {...dataAttributes}
    >
      {inner}
    </button>
  )
}
