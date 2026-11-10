import type { ReactNode } from 'react'
import { site } from '@v2/config/site'

interface FormPageProps {
  title: string
  /** The intro sentence; the support email link is added after it. */
  lead: string
  /** Also offer the studio's WhatsApp after the email. */
  whatsapp?: boolean
  /** Optional extra copy under the intro, in the left column. */
  aside?: ReactNode
  children: ReactNode
}

/**
 * The pale panel shared by the form pages (/contact, /request-a-quote, the
 * job application): title and a short intro with our email on the left, the
 * form on the right. On a phone they stack.
 */
export function FormPage({ title, lead, whatsapp = false, aside, children }: FormPageProps) {
  return (
    <section className="slate rounded-b-4xl bg-white pt-safe-header pb-fluid-4xl">
      <div className="container pt-fluid-lg">
        <div className="grid gap-gutter md:grid-cols-12 md:grid-rows-[auto_1fr]">
          <div className="min-w-0 md:col-span-4 md:row-start-1 lg:col-span-3">
            <h1 className="text-heading-md mb-4 text-balance text-navy-900">{title}</h1>
            <div className="wysiwyg wysiwyg-navy">
              <p>
                {lead} <a href={`mailto:${site.supportEmail}`}>{site.supportEmail}</a>
                {whatsapp ? (
                  <>
                    , or message us on WhatsApp at{' '}
                    <a href={site.whatsapp.url} target="_blank" rel="noopener noreferrer">
                      {site.whatsapp.display}
                    </a>
                  </>
                ) : null}
                .
              </p>
            </div>
          </div>
          <div className="min-w-0 max-md:mt-12.5 md:col-span-8 md:row-span-2 md:row-start-1 lg:col-span-7 lg:col-start-5">
            {children}
          </div>
          {/* After the form on a phone, so the form is not pushed below the fold; under the intro from tablet up. */}
          {aside ? (
            <div className="min-w-0 max-md:mt-fluid-lg md:col-span-4 md:col-start-1 md:row-start-2 lg:col-span-3">{aside}</div>
          ) : null}
        </div>
      </div>
    </section>
  )
}
