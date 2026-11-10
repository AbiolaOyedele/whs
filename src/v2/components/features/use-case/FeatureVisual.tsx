import { MapCard } from '@v2/components/features/feature-cards/MapCard'
import type { FeatureVisual as FeatureVisualData } from '@v2/content/use-cases'
import { AutomationCard } from './AutomationCard'
import { ChecklistCard } from './ChecklistCard'
import { CmsEditCard } from './CmsEditCard'
import { DashboardCard } from './DashboardCard'
import { HoursCard } from './HoursCard'
import { LocalCheckoutCard } from './LocalCheckoutCard'
import { ProcessCard } from './ProcessCard'
import { ProductCarouselCard } from './ProductCarouselCard'
import { WorkflowCard } from './WorkflowCard'

interface FeatureVisualProps {
  visual: FeatureVisualData
}

/** The illustration at the top of a feature card, chosen by kind: each one shows what its card says. */
export function FeatureVisual({ visual }: FeatureVisualProps) {
  switch (visual.kind) {
    case 'checklist':
      return <ChecklistCard address={visual.address} items={visual.items} artSeed={visual.artSeed} />
    case 'cms-edit':
      return <CmsEditCard artSeed={visual.artSeed} />
    case 'local-checkout':
      return <LocalCheckoutCard artSeed={visual.artSeed} />
    case 'products':
      return <ProductCarouselCard items={visual.items} artSeed={visual.artSeed} />
    case 'workflow':
      return <WorkflowCard artSeed={visual.artSeed} />
    case 'process':
      return <ProcessCard steps={visual.steps} artSeed={visual.artSeed} />
    case 'dashboard':
      return <DashboardCard artSeed={visual.artSeed} />
    case 'automation':
      return <AutomationCard runs={visual.runs} artSeed={visual.artSeed} />
    case 'hours':
      return (
        <HoursCard
          product={visual.product}
          logo={visual.logo}
          task={visual.task}
          before={visual.before}
          after={visual.after}
          returned={visual.returned}
          artSeed={visual.artSeed}
        />
      )
    case 'map':
      return <MapCard points={visual.points} />
  }
}
