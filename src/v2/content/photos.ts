/**
 * Photography for the v2 site, saved in public/images/stock from Pexels
 * (free to use, no attribution required). The Pexels id is kept so a photo
 * can be traced back to its source page: https://www.pexels.com/photo/<id>/.
 */

export interface Photo {
  src: string
  alt: string
  pexelsId: number
}

/** An image for a card tile: a photo filling it, or a product logo centred on it. */
export interface CardImage {
  src: string
  alt: string
  fit: 'cover' | 'logo'
}

function photo(file: string, pexelsId: number, alt: string): Photo {
  return { src: `/images/stock/${file}.jpg`, alt, pexelsId }
}

export const PHOTOS = {
  insightAgencyLagos: photo('insight-agency-lagos', 30688593, 'A small team talking in an office in Lagos.'),
  insightEcommerceCost: photo('insight-ecommerce-cost', 7552313, 'A business owner on a tablet, surrounded by packed orders.'),
  insightWebsiteChecklist: photo('insight-website-checklist', 6149781, 'A man smiling as he types on his laptop.'),
  insightWebsiteCost: photo('insight-website-cost', 10375986, 'A woman writing notes beside her laptop.'),
  insightWebsiteStructure: photo('insight-website-structure', 7710081, 'A man planning with sticky notes on a board.'),
  insightWebsiteVsApp: photo('insight-website-vs-app', 8067771, 'A woman on a phone call while working on her laptop.'),
  serviceSiteBuild: photo('service-site-build', 6773646, 'A man working on his laptop at a desk.'),
  service72Hours: photo('service-72-hours', 10375901, 'A woman smiling at her laptop, phone in hand.'),
  serviceWebApps: photo('service-web-apps', 6584936, 'A man using an app on his phone.'),
  serviceDashboards: photo('service-dashboards', 6930581, 'A man reviewing work on his laptop in an office.'),
  startQuote: photo('start-quote', 1181228, 'A woman working on her laptop.'),
  startInsights: photo('start-insights', 7382376, 'A woman reading on her laptop on a sofa.'),
  startDiscoveryCall: photo('start-discovery-call', 6976313, 'A woman waving on a video call.'),
  aboutTeam1: photo('about-team-1', 3869649, 'Colleagues talking through an idea in an office.'),
  aboutTeam2: photo('about-team-2', 9301197, 'Four men working through a project around a laptop.'),
  aboutTeam3: photo('about-team-3', 30677714, 'A team meeting around a table in an office in Lagos.'),
} as const satisfies Record<string, Photo>

/** A photo as a card tile image. */
export function coverImage(item: Photo): CardImage {
  return { src: item.src, alt: item.alt, fit: 'cover' }
}

/** A product logo (public/work-logos) as a card tile image. */
export function logoImage(file: string, name: string): CardImage {
  return { src: `/work-logos/${file}`, alt: `${name} logo`, fit: 'logo' }
}
