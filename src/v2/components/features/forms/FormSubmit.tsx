import { SmartLink } from '@v2/components/ui/SmartLink'
import { FORM_COPY } from '@v2/content/forms'

interface FormSubmitProps {
  label: string
  /** True while the form is sending: the button is locked and says so. */
  busy?: boolean
  /** Hides the privacy line, for small forms that sit beside one already. */
  privacyNote?: boolean
}

/** The pink submit button (only the colour changes on hover) and the privacy line under it. */
export function FormSubmit({ label, busy = false, privacyNote = true }: FormSubmitProps) {
  return (
    <div>
      <button
        type="submit"
        disabled={busy}
        aria-disabled={busy || undefined}
        className="button inline-flex items-center justify-center gap-2 rounded-sm bg-pink-500 text-charcoal transition-colors hover:bg-pink-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-500 disabled:cursor-wait disabled:opacity-60 max-md:min-h-11 max-md:px-3.5 md:min-h-13.5 md:px-5"
      >
        {busy ? (
          <svg className="size-4 shrink-0 animate-spin motion-reduce:animate-none" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2" />
            <path d="M14.5 8A6.5 6.5 0 0 0 8 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        ) : null}
        <span className="text-label inline-block leading-none">{busy ? FORM_COPY.sending : label}</span>
      </button>
      {privacyNote ? (
        <p className="text-body-sm mt-4 text-navy-500 [&_a]:underline">
          {FORM_COPY.privacyLead} <SmartLink href="/privacy">{FORM_COPY.privacyLink}</SmartLink>.
        </p>
      ) : null}
    </div>
  )
}
