import { Button } from '@v2/components/ui/Button'

interface CallToActionProps {
  title: string
  body: string
  primary: { label: string; href: string }
  secondary?: { label: string; href: string }
}

/** The closing panel on a content page: one line of copy and where to go next. */
export function CallToAction({ title, body, primary, secondary }: CallToActionProps) {
  return (
    <section className="rounded-lg bg-slate-100 p-fluid-md md:p-fluid-lg" aria-labelledby="page-cta-title">
      <h2 className="text-heading-xs text-balance" id="page-cta-title">
        {title}
      </h2>
      <p className="text-body-md mt-3 max-w-160 text-navy-500">{body}</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button label={primary.label} href={primary.href} />
        {secondary ? <Button label={secondary.label} href={secondary.href} variant="white" /> : null}
      </div>
    </section>
  )
}
