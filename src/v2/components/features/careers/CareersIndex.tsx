import { SmartLink } from '@v2/components/ui/SmartLink'
import { CAREERS_PAGE, ROLES, rolePath } from '@v2/content/careers'
import { CallToAction } from '@v2/components/features/content-page/CallToAction'
import { ContentPage, PageSection } from '@v2/components/features/content-page/ContentPage'
import { NumberedGrid } from '@v2/components/features/content-page/NumberedGrid'
import { Tag } from '@v2/components/features/content-page/Tag'
import { Icon } from '@v2/components/ui/Icon'

/** /careers: how the team works, the open roles, and where to go if none fit. */
export function CareersIndex() {
  return (
    <ContentPage title={CAREERS_PAGE.title} intro={CAREERS_PAGE.intro}>
      <PageSection title={CAREERS_PAGE.rulesTitle}>
        <NumberedGrid items={CAREERS_PAGE.rules} columns={4} numbered={false} />
      </PageSection>

      <PageSection title={CAREERS_PAGE.openTitle} id="open-positions">
        {ROLES.length === 0 ? (
          <p className="text-body-md text-navy-500">{CAREERS_PAGE.none}</p>
        ) : (
          <ul className="flex flex-col gap-4">
            {ROLES.map((role) => (
              <li
                key={role.slug}
                className="group relative flex flex-col gap-6 rounded-lg bg-white p-fluid-md transition-shadow focus-within:shadow-[0_12px_30px_-12px_rgb(19_19_20/0.25)] hover:shadow-[0_12px_30px_-12px_rgb(19_19_20/0.25)] md:flex-row md:items-start md:justify-between md:p-fluid-lg"
              >
                <div className="min-w-0">
                  <h3 className="text-heading-xs text-balance">
                    <SmartLink
                      href={rolePath(role.slug)}
                      className="after:absolute after:inset-0 after:rounded-lg after:content-[''] focus-visible:outline-none"
                    >
                      {role.title}
                    </SmartLink>
                  </h3>
                  <p className="text-body-md mt-3 max-w-160 text-navy-500">{role.summary}</p>
                  <ul className="mt-5 flex flex-wrap gap-2" aria-label="Role details">
                    <li>
                      <Tag>{role.level}</Tag>
                    </li>
                    <li>
                      <Tag>{role.location}</Tag>
                    </li>
                  </ul>
                </div>
                <span
                  aria-hidden="true"
                  className="text-label inline-flex min-h-11 shrink-0 items-center gap-2 self-start rounded-[100px] bg-slate-50 px-5 leading-none text-navy-900 transition-colors group-focus-within:bg-pink-500 group-hover:bg-pink-500"
                >
                  {CAREERS_PAGE.viewRole}
                  <Icon name="arrowRight" strokeWidth={2} className="size-3.5" />
                </span>
                {/* The card's focus ring: drawn on the card, since the link's own box is the whole card. */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 rounded-lg outline-2 outline-offset-2 outline-transparent group-has-[a:focus-visible]:outline-navy-500"
                />
              </li>
            ))}
          </ul>
        )}
      </PageSection>

      <CallToAction
        title={CAREERS_PAGE.cta.title}
        body={CAREERS_PAGE.cta.body}
        primary={CAREERS_PAGE.cta.primary}
        secondary={CAREERS_PAGE.cta.secondary}
      />
    </ContentPage>
  )
}
