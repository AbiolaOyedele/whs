'use client'

import { Button } from '@v2/components/ui/Button'
import { Icon } from '@v2/components/ui/Icon'
import { SmartLink } from '@v2/components/ui/SmartLink'
import { NOT_FOUND_PAGE } from '@v2/content/not-found'

/**
 * Shown at any address the site does not have: a way home, and the main
 * pages one tap away so a dead link still leads somewhere useful.
 */
export function NotFoundPage() {
  return (
    <div className="flex min-h-svh flex-col justify-center pt-safe-header pb-fluid-4xl text-white">
      <div className="container flex flex-col gap-fluid-lg pt-fluid-lg">
        <div className="flex max-w-3xl flex-col gap-7.5">
          <h1 className="text-heading-xl">{NOT_FOUND_PAGE.title}</h1>
          <p className="text-body-md anim-transform-opacity -delay-1 max-w-120">{NOT_FOUND_PAGE.lead}</p>
          <div className="anim-transform-opacity -delay-2">
            <Button label={NOT_FOUND_PAGE.home} href="/" className="min-h-15!" />
          </div>
        </div>

        <nav aria-label={NOT_FOUND_PAGE.linksTitle} className="anim-transform-opacity -delay-3">
          <ul className="grid border-t border-white/25 sm:grid-cols-2 sm:gap-x-8 lg:grid-cols-3">
            {NOT_FOUND_PAGE.links.map((link) => (
              <li key={link.href} className="border-b border-white/25">
                <SmartLink
                  href={link.href}
                  className="group flex min-h-16 items-center justify-between gap-4 py-4 text-heading-xs"
                >
                  {link.label}
                  <Icon
                    name="arrowRight"
                    className="size-6 shrink-0 text-pink-500 transition-transform duration-300 group-hover:translate-x-1 group-focus-visible:translate-x-1"
                  />
                </SmartLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  )
}
