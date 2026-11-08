import { clamp, type Ease, ease as eases } from './math'

interface TweenOptions {
  from?: number
  to: number
  duration: number
  delay?: number
  ease?: Ease
  onStart?: () => void
  onComplete?: () => void
}

interface Tween {
  target: Record<string, number>
  key: string
  from: number
  to: number
  duration: number
  delay: number
  elapsed: number
  ease: Ease
  started: boolean
  onStart: (() => void) | undefined
  onComplete: (() => void) | undefined
}

/**
 * A tiny tween runner driven by the canvas clock, so tweens pause with the
 * render loop and never run while the tab is hidden.
 */
export class Tweens {
  private list: Tween[] = []

  /** Animates `target[key]`, replacing any tween already running on it. */
  to<T extends object>(target: T, key: keyof T & string, options: TweenOptions): void {
    const record = target as unknown as Record<string, number>
    this.kill(target, key)
    const from = options.from ?? record[key] ?? 0
    if (options.from !== undefined) record[key] = options.from
    this.list.push({
      target: record,
      key,
      from,
      to: options.to,
      duration: Math.max(0.0001, options.duration),
      delay: options.delay ?? 0,
      elapsed: 0,
      ease: options.ease ?? eases.power2Out,
      started: false,
      onStart: options.onStart,
      onComplete: options.onComplete,
    })
  }

  kill<T extends object>(target: T, key?: keyof T & string): void {
    const record = target as unknown as Record<string, number>
    this.list = this.list.filter((tween) => tween.target !== record || (key !== undefined && tween.key !== key))
  }

  get active(): boolean {
    return this.list.length > 0
  }

  update(delta: number): void {
    if (this.list.length === 0) return
    const finished: Tween[] = []
    for (const tween of this.list) {
      tween.elapsed += delta
      const local = tween.elapsed - tween.delay
      if (local < 0) continue
      if (!tween.started) {
        tween.started = true
        tween.from = tween.target[tween.key] ?? tween.from
        tween.onStart?.()
      }
      const t = clamp(local / tween.duration, 0, 1)
      tween.target[tween.key] = tween.from + (tween.to - tween.from) * tween.ease(t)
      if (t >= 1) finished.push(tween)
    }
    if (finished.length === 0) return
    this.list = this.list.filter((tween) => !finished.includes(tween))
    for (const tween of finished) tween.onComplete?.()
  }

  clear(): void {
    this.list = []
  }
}
