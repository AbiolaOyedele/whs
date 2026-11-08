import AnimatedGradient from '@/components/ui/animated-gradient'

/**
 * The lime fluid gradient filling a panel: the same animation as the site
 * background, for cards and heroes that need a coloured field behind them.
 * `seed` turns the pattern so neighbouring panels do not look identical.
 */
export function FluidPanel({ seed = 0, className = '' }: { seed?: number; className?: string }) {
  return (
    <div aria-hidden="true" className={`absolute inset-0 bg-charcoal ${className}`}>
      <AnimatedGradient preset="hero" overrides={{ rotation: -50 + ((seed * 37) % 90) }} className="absolute inset-0" />
    </div>
  )
}
