import { site } from '@v2/config/site'
import { FORM_COPY } from '@v2/content/forms'

/** Shown when a form passes its checks: this site has no backend yet, so we point to email instead. */
export function NotConnectedNotice() {
  return (
    <p role="status" className="text-body-md anim-fade-slide-in text-navy-900 [&_a]:underline">
      {FORM_COPY.notConnectedLead} <a href={`mailto:${site.supportEmail}`}>{site.supportEmail}</a>{' '}
      {FORM_COPY.notConnectedTail}
    </p>
  )
}
