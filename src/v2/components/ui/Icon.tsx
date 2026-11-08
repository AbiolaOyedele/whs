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

const SOCIAL_PATHS = {
  X: 'M3 3h4.5l4.2 5.9L16.8 3H20l-6.8 7.9L21 21h-4.5l-4.6-6.4L6.3 21H3l7.4-8.6z',
  Instagram:
    'M7 3h10a4 4 0 014 4v10a4 4 0 01-4 4H7a4 4 0 01-4-4V7a4 4 0 014-4zm5 5a4 4 0 100 8 4 4 0 000-8zm5.5-1.5a1 1 0 100 2 1 1 0 000-2z',
  TikTok: 'M14 3h3a4 4 0 004 4v3a7 7 0 01-4-1.3V15a6 6 0 11-6-6v3a3 3 0 103 3z',
  WhatsApp:
    'M12 3a9 9 0 00-7.8 13.5L3 21l4.6-1.2A9 9 0 1012 3zm-3 5c.3 0 .6 0 .8.5l.8 1.9c.1.3 0 .5-.2.7l-.6.7c.6 1.2 1.6 2.2 2.8 2.8l.7-.7c.2-.2.4-.3.7-.2l1.9.8c.4.2.5.5.5.8 0 1.3-1.2 2-2.4 2C10 16.8 7 13.8 7 10.6 7 9.4 7.7 8 9 8z',
} as const

export type SocialName = keyof typeof SOCIAL_PATHS

export function SocialIcon({ name, className = 'size-[22px]' }: { name: SocialName; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d={SOCIAL_PATHS[name]} />
    </svg>
  )
}
