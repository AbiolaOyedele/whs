import type { ReactNode } from 'react'
import { Label } from '@v2/components/ui/Label'

interface CapabilitySectionProps {
  label: string
  children: ReactNode
}

/**
 * One block of a "What we build" page: the label on the left on a wide
 * screen (above on a narrow one), the content in the wider column beside it.
 */
export function CapabilitySection({ label, children }: CapabilitySectionProps) {
  return (
    <section className="section-spacing grid gap-x-gutter gap-y-fluid-md md:grid-cols-12">
      <div className="md:col-span-4">
        <Label>{label}</Label>
      </div>
      <div className="min-w-0 md:col-span-8">{children}</div>
    </section>
  )
}
