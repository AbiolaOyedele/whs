import { MapCard } from '@v2/components/features/feature-cards/MapCard'
import type { FeatureVisual as FeatureVisualData } from '@v2/content/use-cases'
import { BatchesCard } from './BatchesCard'
import { CostChartCard } from './CostChartCard'
import { CubesCard } from './CubesCard'
import { FlowCard } from './FlowCard'
import { TemplateCarouselCard } from './TemplateCarouselCard'
import { WordmarkCarouselCard } from './WordmarkCarouselCard'

interface FeatureVisualProps {
  visual: FeatureVisualData
}

/** The animated picture at the top of a feature card, chosen by kind. */
export function FeatureVisual({ visual }: FeatureVisualProps) {
  switch (visual.kind) {
    case 'flow':
      return <FlowCard hub={visual.hub} sources={visual.sources} sideLabel={visual.sideLabel} artSeed={visual.artSeed} />
    case 'cubes':
      return <CubesCard />
    case 'map':
      return <MapCard leftChip={visual.leftChip} rightChip={visual.rightChip} points={visual.points} />
    case 'wordmarks':
      return <WordmarkCarouselCard names={visual.names} artSeed={visual.artSeed} />
    case 'templates':
      return <TemplateCarouselCard items={visual.items} />
    case 'batches':
      return <BatchesCard tabs={visual.tabs} artSeed={visual.artSeed} />
    case 'chart':
      return <CostChartCard tabs={visual.tabs} yLabel={visual.yLabel} xLabel={visual.xLabel} artSeed={visual.artSeed} />
  }
}
