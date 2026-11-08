import { SmartLink } from '@v2/components/ui/SmartLink'
import { FORM_COPY } from '@v2/content/forms'

interface FormSubmitProps {
  label: string
}

/** The pink submit button (only the colour changes on hover) and the privacy line under it. */
export function FormSubmit({ label }: FormSubmitProps) {
  return (
    <div>
      <button
        type="submit"
        className="button inline-flex items-center justify-center gap-2 rounded-sm bg-pink-500 text-charcoal transition-colors hover:bg-pink-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-500 disabled:cursor-not-allowed disabled:opacity-50 max-md:min-h-11 max-md:px-3.5 md:min-h-13.5 md:px-5"
      >
        <span className="text-label inline-block leading-none">{label}</span>
      </button>
      <p className="text-body-sm mt-4 text-navy-500 [&_a]:underline">
        {FORM_COPY.privacyLead} <SmartLink href="/privacy">{FORM_COPY.privacyLink}</SmartLink>.
      </p>
    </div>
  )
}
