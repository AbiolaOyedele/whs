import { site } from '@v2/config/site'
import { FOOTER_COLUMNS, LEGAL_LINKS, LIVE_SOCIALS } from '@v2/content/navigation'
import { Button } from '@v2/components/ui/Button'
import { SocialIcon } from '@v2/components/ui/Icon'
import { SmartLink } from '@v2/components/ui/SmartLink'
import { CookiePreferencesButton } from '@v2/components/layout/CookieBanner'

/**
 * The dark footer. It tucks under the last panel's rounded corners and lets
 * the 3D background show through; the canvas listens for it coming on screen.
 */
export function Footer() {
  return (
    <footer
      className="dark transition-fade relative -mt-(--radius-xl) pt-(--radius-xl) text-white"
      data-background-canvas-inview=""
      data-scroll=""
      data-scroll-event-progress="footerScrollProgress"
    >
      <div className="transition-blur relative">
        <div className="z-above relative container flex flex-col max-md:gap-12 max-md:pt-7 md:gap-30 md:pt-10">
          <div className="grid max-md:gap-10 md:grid-cols-2 md:gap-gutter">
            <div>
              <ul className="flex gap-4">
                {LIVE_SOCIALS.map((social) => (
                  <li key={social.label}>
                    <a href={social.href} className="inline-flex min-h-11 min-w-11 items-center justify-start">
                      <span className="sr-only">{social.label}</span>
                      <SocialIcon name={social.label} />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid grid-cols-2 gap-x-gutter max-md:gap-y-32.5 md:gap-y-50">
              {FOOTER_COLUMNS.map((column) => (
                <div key={column.title}>
                  <h2 className="text-body-sm mb-5 opacity-65">{column.title}</h2>
                  <ul className="flex flex-col gap-2">
                    {column.links.map((link) => (
                      <li key={link.href}>
                        <SmartLink href={link.href} className="text-body-sm relative after:absolute after:inset-x-0 after:-inset-y-3.5 after:content-[''] md:after:hidden hover:underline">
                          {link.label}
                        </SmartLink>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <div className="col-span-2 flex flex-col gap-6">
                <p className="text-heading-sm max-w-180 text-balance">
                  Tell us what is eating your hours. We will show you what a system built for it looks like.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button label="Get in touch" variant="pink" href={site.signUpUrl} />
                  <Button label="Request a quote" variant="glass" href={site.signInUrl} />
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-gutter border-t border-white/20 py-7.5 max-md:grid-cols-2 max-md:grid-rows-[1fr_auto] max-md:items-end max-md:gap-y-2 md:grid-cols-12">
            <div className="flex max-md:col-start-1 md:order-2 md:col-span-10 md:justify-end">
              <ul className="flex max-md:flex-col max-md:gap-2 md:gap-6">
                {LEGAL_LINKS.map((link) => (
                  <li key={link.href}>
                    <SmartLink href={link.href} className="text-label relative after:absolute after:inset-x-0 after:-inset-y-3.5 after:content-[''] md:after:hidden hover:underline">
                      {link.label}
                    </SmartLink>
                  </li>
                ))}
                <li>
                  <CookiePreferencesButton />
                </li>
              </ul>
            </div>
            <div className="text-body-md max-md:col-start-2 max-md:row-start-1 max-md:text-right md:order-1 md:col-span-2">
              {new Date().getFullYear()} © {site.name}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
