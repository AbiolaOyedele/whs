import type { IconName } from '@v2/components/ui/Icon'
import { site } from '@v2/config/site'

/**
 * /outside-nigeria: how a project runs for a business outside Nigeria. Our
 * clients so far are in Nigeria, so this page says so and sets out the steps
 * we follow rather than claiming work we have not done. Every step matches
 * how a project runs at home (src/v2/content/pricing.ts, home-upper.ts).
 */

export interface OutsideStep {
  icon: IconName
  title: string
  body: string
}

export const OUTSIDE_NIGERIA = {
  meta: {
    title: 'Working with clients outside Nigeria',
    description: `${site.name} is based in Lagos and open to building websites, apps and tools for businesses outside Nigeria. Here is how a project runs across time zones.`,
  },
  title: 'Working with clients outside Nigeria',
  intro:
    'We are based in Lagos, and our clients so far are in Nigeria. We are open to working with businesses anywhere, and the way we work already runs over calls and messages. This is how a project runs if you are outside Nigeria.',
  steps: [
    {
      icon: 'phoneCall',
      title: 'A call at a time that suits you',
      body: 'We are on West Africa Time (UTC+1). We book the discovery call over Zoom or Google Meet at a time that works for both of us, and we keep in touch on WhatsApp or email in between.',
    },
    {
      icon: 'fileText',
      title: 'A written plan and one price',
      body: 'After the call you get a written proposal: what we will build, what we will not, and one price. The currency and how you pay are agreed in that proposal, and half is paid to start.',
    },
    {
      icon: 'eye',
      title: 'You see it before we build it',
      body: 'You approve the design before any code is written. You get full access to everything we build, wherever you are.',
    },
    {
      icon: 'shield',
      title: 'Your rules, written down',
      body: 'If your business has rules about where data is kept or how it is handled, tell us on the call. We write what is needed into the proposal, so nothing is assumed.',
    },
  ] satisfies OutsideStep[],
  primary: { label: 'Book a call', href: '/contact' },
  secondary: { label: 'Chat on WhatsApp', href: site.whatsapp.url },
} as const
