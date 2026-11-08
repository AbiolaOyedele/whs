import type { SceneName } from '@v2/lib/canvas-events'
import { BeautyScene } from '../scenes/BeautyScene'
import { FashionScene } from '../scenes/FashionScene'
import { HomeScene } from '../scenes/HomeScene'
import { LivingScene } from '../scenes/LivingScene'
import { Stage, type StageOptions } from './Stage'
import type { BackgroundScene, StageContext } from './types'

function createScene(name: SceneName, ctx: StageContext): BackgroundScene {
  switch (name) {
    case 'fashion':
      return new FashionScene(ctx)
    case 'beauty':
      return new BeautyScene(ctx)
    case 'home-and-living':
      return new LivingScene(ctx)
    default:
      return new HomeScene(ctx)
  }
}

/** Entry point for the lazily loaded chunk: builds the stage with every scene available. */
export function startStage(options: Omit<StageOptions, 'createScene'>): Stage {
  return new Stage({ ...options, createScene })
}
