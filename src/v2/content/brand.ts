import { site } from '@v2/config/site'

/** Copy for /brand-assets. There are no packaged files yet, so the button asks for them by email. */

export interface BrandHero {
  title: string
  intro: string
  contact: { label: string; href: string }
}

export const brandHero: BrandHero = {
  title: 'Brand assets',
  intro: `Use the ${site.name} logo when you show us in an article, a video or your own marketing. Keep it as it is: no new colours, shadows or stretching.`,
  contact: {
    label: 'Ask for brand files',
    href: `mailto:${site.supportEmail}?subject=${encodeURIComponent('Brand files')}`,
  },
}
