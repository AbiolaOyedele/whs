import { LogoMark } from '@v2/components/ui/LogoMark'

/**
 * The first-load intro: the "whs." mark on ink, its letters rising in and the
 * lime dot popping in (loader.css), then the screen slides up off the page.
 */
export function InitialLoader() {
  return (
    <div className="c-initial-loader" aria-hidden="true">
      <LogoMark className="c-initial-loader_mark" />
    </div>
  )
}
