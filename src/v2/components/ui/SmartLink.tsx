'use client'

import Link from 'next/link'
import { forwardRef, type AnchorHTMLAttributes, type MouseEvent } from 'react'
import { usePageTransition } from '@v2/components/layout/TransitionProvider'

type SmartLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }

function isInternal(href: string): boolean {
  return href.startsWith('/') && !href.startsWith('//')
}

/**
 * A link that fades the page out before an internal route change. External
 * links, new-tab clicks and in-page anchors behave as plain links.
 */
export const SmartLink = forwardRef<HTMLAnchorElement, SmartLinkProps>(function SmartLink(
  { href, onClick, children, ...rest },
  ref,
) {
  const { navigate } = usePageTransition()

  if (!isInternal(href)) {
    const external = href.startsWith('http')
    return (
      <a
        ref={ref}
        href={href}
        onClick={onClick}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        {...rest}
      >
        {children}
      </a>
    )
  }

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event)
    if (event.defaultPrevented) return
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    event.preventDefault()
    navigate(href)
  }

  // next/link rejects explicitly-undefined handlers under exactOptionalPropertyTypes.
  const defined = Object.fromEntries(Object.entries(rest).filter(([, value]) => value !== undefined))

  return (
    <Link ref={ref} href={href} onClick={handleClick} {...defined}>
      {children}
    </Link>
  )
})
