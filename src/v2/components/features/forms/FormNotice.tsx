import { site } from '@v2/config/site'
import { FORM_COPY } from '@v2/content/forms'

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
      <svg className="mt-0.5 size-5 shrink-0 text-red" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.4" />
        <path d="M8 4.5v4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        <circle cx="8" cy="11.4" r="0.9" fill="currentColor" />
      </svg>
      <p className="text-body-md [&_a]:underline">
        <strong className="font-medium">{FORM_COPY.errorLead}</strong> {message} If it keeps happening, email{' '}
        <a href={`mailto:${site.supportEmail}`}>{site.supportEmail}</a>.
      </p>
    </div>
  )
}
