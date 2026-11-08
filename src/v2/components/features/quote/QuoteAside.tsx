import { QUOTE_PAGE } from '@v2/content/forms'

/**
 * The left column of /request-a-quote under the intro: the two email
 * addresses for anyone who would rather write, and what happens after they
 * send. Carried over from the original Request a quote page.
 */
export function QuoteAside() {
  return (
    <div className="flex flex-col gap-fluid-lg text-navy-900">
      <div>
        <h2 className="text-label text-navy-500">{QUOTE_PAGE.emailTitle}</h2>
        <ul className="mt-3 flex flex-col gap-1">
          {QUOTE_PAGE.emails.map((email) => (
            <li key={email.address} className="text-body-md">
              <a href={`mailto:${email.address}`} className="inline-flex min-h-11 items-center underline underline-offset-4">
                {email.address}
              </a>
              <span className="text-navy-500"> for {email.note}</span>
            </li>
          ))}
        </ul>
        <p className="text-body-sm mt-3 text-navy-500">{QUOTE_PAGE.rfp}</p>
      </div>
      <div className="border-t border-slate-300 pt-fluid-md">
        <h2 className="text-label text-navy-500">{QUOTE_PAGE.nextTitle}</h2>
        <ol className="mt-4 flex flex-col gap-4">
          {QUOTE_PAGE.next.map((step, index) => (
            <li key={step.title} className="text-body-md flex gap-3">
              <span className="text-label mt-0.5 shrink-0 text-navy-500 tabular-nums" aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>
              <span>
                <span className="font-medium">{step.title}</span> <span className="text-navy-500">{step.body}</span>
              </span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}
