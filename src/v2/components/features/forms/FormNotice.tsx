import { site } from '@v2/config/site'
import { FORM_COPY } from '@v2/content/forms'
import { Icon } from '@v2/components/ui/Icon'

interface FormNoticeProps {
  /** The server's reason, in plain English. */
  message: string
}

/**
 * Shown above the submit button when the server turned a submission down or
 * could not be reached. Announced straight away; the visitor's answers stay.
 */
export function FormNotice({ message }: FormNoticeProps) {
  return (
    <div role="alert" className="anim-fade-slide-in flex items-start gap-3 rounded-sm bg-white p-4 text-navy-900 outline outline-red">
      <Icon name="circleAlert" strokeWidth={1.6} className="mt-0.5 size-5 shrink-0 text-red" />
      <p className="text-body-md [&_a]:underline">
        <strong className="font-medium">{FORM_COPY.errorLead}</strong> {message} If it keeps happening, email{' '}
        <a href={`mailto:${site.supportEmail}`}>{site.supportEmail}</a>.
      </p>
    </div>
  )
}
