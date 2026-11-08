import { LogoMark } from '@v2/components/ui/LogoMark'

/** Charcoal screen with the rocking logo mark, shown until the page is ready. */
export function InitialLoader() {
  return (
    <div className="c-initial-loader" aria-hidden="true">
      <LogoMark className="c-initial-loader_mark" />
    </div>
  )
}
