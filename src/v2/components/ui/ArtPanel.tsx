/**
 * Stand-in artwork for the reference site's rendered 3D stills: layered
 * magenta light streaks on near-black. `seed` varies the angle and glow so
 * neighbouring cards differ. Replaced by the brand's own imagery in the reskin.
 */
export function ArtPanel({ seed = 0, className = '' }: { seed?: number; className?: string }) {
  const angle = 115 + ((seed * 37) % 60)
  const glowX = 20 + ((seed * 53) % 60)
  const glowY = 30 + ((seed * 29) % 50)
  return (
    <div
      aria-hidden="true"
      className={`absolute inset-0 ${className}`}
      style={{
        backgroundColor: '#0b0610',
        backgroundImage: [
          `radial-gradient(60% 45% at ${glowX}% ${glowY}%, rgb(255 72 139 / 0.55), transparent 70%)`,
          `repeating-linear-gradient(${angle}deg, transparent 0 14%, rgb(227 58 219 / 0.22) 14% 15%, transparent 15% 24%, rgb(255 255 255 / 0.18) 24% 24.4%, transparent 24.4% 34%)`,
          `linear-gradient(${angle - 20}deg, #12040f 0%, #4a0d36 45%, #1a0614 70%, #050205 100%)`,
        ].join(','),
      }}
    />
  )
}
