import type { ReactNode } from 'react'
import { site } from '@v2/config/site'

interface FormPageProps {
  title: string
  /** The intro sentence; the support email link is added after it. */
  lead: string
  children: ReactNode
}

/**
 * The pale panel shared by /contact and /book-demo: title and a short intro
 * with our email on the left, the form on the right.
 */
export function FormPage({ title, lead, children }: FormPageProps) {
  return (
    <section className="slate bg-slate-50 pt-safe-header pb-fluid-4xl">
      <div className="container pt-fluid-lg">
        <div className="grid gap-gutter md:grid-cols-12">
          <div className="md:col-span-3">
            <h1 className="text-heading-md mb-4 text-navy-900">{title}</h1>
            <div className="wysiwyg wysiwyg-navy">
              <p>
                {lead} <a href={`mailto:${site.supportEmail}`}>{site.supportEmail}</a>.
              </p>
            </div>
          </div>
          <div className="max-md:mt-12.5 md:col-span-7 md:col-start-5">{children}</div>
        </div>
      </div>
    </section>
  )
}
