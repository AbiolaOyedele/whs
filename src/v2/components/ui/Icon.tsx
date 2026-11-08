import type { SVGProps } from 'react'

/** Stroke icons on a 24 grid; colour follows the text. */
const STROKE = {
  arrowRight: 'M5 12h14M13 6l6 6-6 6',
  arrowLeft: 'M19 12H5M11 6l-6 6 6 6',
  external: 'M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1h5',
  download: 'M12 4v12M7 11l5 5 5-5M5 20h14',
  plus: 'M12 5v14M5 12h14',
  shirt: 'M8 4L3 7l2 4 2-1v10h10V10l2 1 2-4-5-3a4 4 0 01-8 0z',
  sparkle: 'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z',
  home: 'M4 11l8-7 8 7M6 10v10h12V10',
  calendar: 'M4 6h16v14H4zM4 10h16M8 3v4M16 3v4',
  mail: 'M4 6h16v12H4zM4 7l8 6 8-6',
  shield: 'M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z M9 12l2 2 4-4',
  lock: 'M5 11h14v10H5zM8 11V7a4 4 0 018 0v4',
  box: 'M12 3l8 4.5v9L12 21l-8-4.5v-9zM4 7.5l8 4.5 8-4.5M12 12v9',
  globe: 'M12 21a9 9 0 100-18 9 9 0 000 18zM3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18',
  bag: 'M5 8h14l-1 12H6zM9 8V6a3 3 0 016 0v2',
  truck: 'M3 6h11v10H3zM14 9h4l3 3.5V16h-7M7 20a2 2 0 100-4 2 2 0 000 4zM17 20a2 2 0 100-4 2 2 0 000 4z',
  bank: 'M3 9.5L12 4l9 5.5M4 20h16M6 10v7M10 10v7M14 10v7M18 10v7',
  qr: 'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h2v2h-2zM18 14h2v2h-2zM14 18h2v2h-2zM18 18h2v2h-2z',
  chart: 'M4 20V4M4 20h16M8 16l4-5 3 3 5-7',
  phone: 'M7 3h10v18H7zM11 18h2',
} as const

export type IconName = keyof typeof STROKE

interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  name: IconName
}

export function Icon({ name, className = 'size-6', ...rest }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
      {...rest}
    >
      <path d={STROKE[name]} />
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
