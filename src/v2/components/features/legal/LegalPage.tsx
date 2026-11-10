import type { LegalDocument } from '@v2/content/legal'
import { formatPostDate } from '@v2/content/blog'
import { RichContent } from '@v2/components/features/blog/RichContent'

interface LegalPageProps {
  document: LegalDocument
}

/**
 * A policy page in the reference's two-column layout: the title, date and
 * opening words stick on the left while the body scrolls on the right.
 * On a phone they stack.
 */
export function LegalPage({ document }: LegalPageProps) {
  return (
    <div className="slate rounded-b-4xl bg-white pt-safe-header pb-fluid-4xl">
      <div className="container pt-fluid-lg">
        <div className="grid gap-x-gutter gap-y-fluid-2xl md:grid-cols-12">
          <div className="min-w-0 md:col-start-1 md:col-end-6">
            <div className="flex flex-col gap-fluid-lg md:sticky md:top-safe-header">
              <h1 className="text-heading-lg">{document.title}</h1>
              <p className="text-label text-navy-900">
                Last updated <time dateTime={document.updated}>{formatPostDate(document.updated)}</time>
              </p>
              <RichContent blocks={document.intro} />
            </div>
          </div>
          <div className="min-w-0 md:col-start-7 md:col-end-13">
            <RichContent blocks={document.body} />
          </div>
        </div>
      </div>
    </div>
  )
}
