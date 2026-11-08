import { Button } from '@v2/components/ui/Button'
import { ROLE_PAGE, applyPath, type Role } from '@v2/content/careers'
import { ContentPage, PageSection } from '@v2/components/features/content-page/ContentPage'
import { Tag } from '@v2/components/features/content-page/Tag'

interface RolePageProps {
  role: Role
}

/** One open role: what it is, what we need, what helps, and the way to apply. */
export function RolePage({ role }: RolePageProps) {
  return (
    <ContentPage
      label="Careers"
      title={role.title}
      intro={role.summary}
      back={ROLE_PAGE.back}
      heroExtra={
        <div className="flex flex-col items-start gap-6">
          <ul className="flex flex-wrap gap-2" aria-label="Role details">
            <li>
              <Tag>{role.level}</Tag>
            </li>
            <li>
              <Tag>{role.location}</Tag>
            </li>
          </ul>
          <Button label={ROLE_PAGE.apply} href={applyPath(role.slug)} />
        </div>
      }
    >
      <div className="grid gap-x-gutter gap-y-fluid-2xl md:grid-cols-2">
        <PageSection title={ROLE_PAGE.needTitle} id="what-we-need">
          <ul className="flex flex-col gap-4">
            {role.requirements.map((item) => (
              <li key={item} className="text-body-md flex gap-3 border-t border-slate-300 pt-4">
                <span aria-hidden="true" className="mt-2.5 size-1.5 shrink-0 rounded-full bg-navy-900" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </PageSection>
        <PageSection title={ROLE_PAGE.niceTitle} id="nice-to-have">
          <ul className="flex flex-wrap gap-2">
            {role.niceToHave.map((item) => (
              <li key={item}>
                <Tag>{item}</Tag>
              </li>
            ))}
          </ul>
        </PageSection>
      </div>
      <div className="border-t border-slate-300 pt-fluid-lg">
        <Button label={ROLE_PAGE.applyAgain} href={applyPath(role.slug)} variant="navy" />
      </div>
    </ContentPage>
  )
}
