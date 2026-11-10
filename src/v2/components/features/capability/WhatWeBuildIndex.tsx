import { Icon } from '@v2/components/ui/Icon'
import { SmartLink } from '@v2/components/ui/SmartLink'
import { SplitTitle } from '@v2/components/ui/SplitTitle'
import { CAPABILITIES, capabilityHref } from '@v2/content/capabilities'

/**
 * /what-we-build: every "What we build" page as a card, its name and the one
 * line from its page description, two to a row on wider screens. The whole
 * card is the link.
 */
export function WhatWeBuildIndex() {
  return (
    <div className="slate rounded-b-4xl bg-white pt-safe-header pb-fluid-3xl">
      <div className="container pt-fluid-lg">
        <SplitTitle as="h1" className="text-heading-xl mb-6 max-w-[14ch]">
          What we build
        </SplitTitle>
        <p className="text-body-lg mb-fluid-xl max-w-150 text-pretty">
          From a one-page website to jobs that run on their own. Each page says what it is, who it is for and what you get.
        </p>
        <ul className="gap-gutter grid md:grid-cols-2">
          {CAPABILITIES.map((capability) => (
            <li key={capability.slug}>
              <SmartLink
                href={capabilityHref(capability.slug)}
                className="group bg-pink-100 flex h-full flex-col justify-between gap-6 rounded-lg p-6 md:p-8"
              >
                <span className="flex flex-col gap-3">
                  <span className="text-heading-xs text-navy-900">{capability.label}</span>
                  <span className="text-body-md text-navy-900 text-pretty">{capability.meta.description}</span>
                </span>
                <span className="text-body-md text-navy-900 inline-flex items-center gap-2 font-medium">
                  Read more
                  <Icon
                    name="arrowRight"
                    className="size-5 transition-transform duration-200 ease-in-out group-focus-visible:translate-x-1 group-hover:translate-x-1"
                  />
                </span>
              </SmartLink>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
