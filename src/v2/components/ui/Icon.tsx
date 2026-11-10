import { createElement } from 'react'
import { ICON_NODES } from './icon-nodes'
import type { SVGProps } from 'react'

/** Stroke icons on a 24 grid; colour follows the text. */
export type IconName = keyof typeof ICON_NODES

interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  name: IconName
}

export function Icon({ name, className = 'size-6', ...rest }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
      {...rest}
    >
      {ICON_NODES[name].map(([tag, attrs], index) => createElement(tag, { key: index, ...attrs }))}
    </svg>
  )
}

/** Four dots on the menu toggle; the toggle turns them 45° while the menu is open. */
export function MenuIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 11 11" width={11} height={11} aria-hidden="true" className={className} fill="currentColor">
      <rect width="4" height="4" rx="2" />
      <rect width="4" height="4" x="7" rx="2" />
      <rect width="4" height="4" y="7" rx="2" />
      <rect width="4" height="4" x="7" y="7" rx="2" />
    </svg>
  )
}

/** Arrow used in dropdown rows: the head slides in on hover. */
export function DropdownArrow({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 26 26" aria-hidden="true" className={className}>
      <path d="M7 13h12M14 8l5 5-5 5" />
    </svg>
  )
}

