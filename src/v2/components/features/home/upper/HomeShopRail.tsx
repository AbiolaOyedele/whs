import { Rail } from '@v2/components/ui/Rail'
import { SmartLink } from '@v2/components/ui/SmartLink'
import { site } from '@v2/config/site'
import { demoShops } from '@v2/content/home-upper'

/** Products live at <slug>.<root domain>; the root is the site's host without "app.". */
const ROOT_DOMAIN = new URL(site.appUrl).hostname.replace(/^app\./, '')

/**
 * A thin line, then the names of products WildHands built drifting left in an endless row
 * that speeds up while the page scrolls.
 */
export function HomeShopRail() {
  return (
    <div data-hero-hold-hide="">
      <div className="container">
        <div className="animated-line" />
      </div>
      <Rail className="my-fluid-2xl" direction={-1} velocity={0.5} itemCount={demoShops.length}>
        {demoShops.map((shop) => (
          <div key={shop.slug} className="relative flex h-11 w-25 items-center justify-center sm:h-13 sm:w-34">
            <SmartLink
              href={`https://${shop.slug}.${ROOT_DOMAIN}`}
              className="absolute inset-0 flex items-center justify-center font-secondary text-[24px] leading-none font-light tracking-[-0.04em] text-white sm:text-[30px]"
              aria-label={`${shop.slug}, built by WildHands: ${shop.template}`}
            >
              {shop.slug}
            </SmartLink>
          </div>
        ))}
      </Rail>
    </div>
  )
}
