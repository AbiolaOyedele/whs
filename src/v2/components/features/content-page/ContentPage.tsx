import type { ReactNode } from 'react'
import { SmartLink } from '@v2/components/ui/SmartLink'

interface ContentPageProps {
  /** Small line above the title. */
  label: string
  title: string
  intro: string
  /** Extra pieces under the intro (tags, a button). */
  heroExtra?: ReactNode
  /** A link back up a level, shown above the label. */
  back?: { label: string; href: string }
  children: ReactNode
}

/**
 * The pale sheet used by the pages carried over from the original site
 * (careers, a role, the Freelance Hub): label, title and intro across the top,
 * then the page's sections. Same panel, type and rounded foot as the legal and
 * form pages.
 */
export function ContentPage({ label, title, intro, heroExtra, back, children }: ContentPageProps) {
  return (
    <div className="slate rounded-b-4xl bg-slate-50 pt-safe-header pb-fluid-4xl text-navy-900">
      <div className="container pt-fluid-lg">
        <header className="grid gap-x-gutter gap-y-6 md:grid-cols-12">
          <div className="min-w-0 md:col-span-8">
            {back ? (
              <SmartLink
                href={back.href}
                className="text-label -ml-1 mb-4 inline-flex min-h-11 items-center gap-2 px-1 text-navy-500 transition-colors hover:text-navy-900"
              >
                <svg className="size-3.5" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M10 3 5 8l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {back.label}
              </SmartLink>
            ) : null}
            <p className="text-label text-navy-500">{label}</p>
            <h1 className="text-heading-lg anim-transform-opacity mt-4 text-balance">{title}</h1>
          </div>
          <div className="min-w-0 md:col-span-4 md:self-end">
            <p className="text-body-lg anim-transform-opacity -delay-1 text-balance">{intro}</p>
            {heroExtra ? <div className="anim-transform-opacity -delay-2 mt-6">{heroExtra}</div> : null}
          </div>
        </header>
        <div className="flex flex-col gap-fluid-3xl pt-fluid-3xl">{children}</div>
      </div>
    </div>
  )
}

interface PageSectionProps {
  title: string
  id?: string
  /** A sentence under the title. */
  lead?: string
  children: ReactNode
}

/** One titled block on a ContentPage. */
export function PageSection({ title, id, lead, children }: PageSectionProps) {
  const headingId = `${id ?? title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-title`
  return (
    <section id={id} aria-labelledby={headingId} className="scroll-mt-safe-header">
      <h2 id={headingId} className="text-heading-sm text-balance">
        {title}
      </h2>
      {lead ? <p className="text-body-md mt-3 max-w-160 text-navy-500">{lead}</p> : null}
      <div className="mt-fluid-lg">{children}</div>
    </section>
  )
}
