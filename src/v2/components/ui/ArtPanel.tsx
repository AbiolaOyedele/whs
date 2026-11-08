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
        backgroundColor: '#070906',
        backgroundImage: [
          `radial-gradient(60% 45% at ${glowX}% ${glowY}%, rgb(190 252 101 / 0.55), transparent 70%)`,
          `repeating-linear-gradient(${angle}deg, transparent 0 14%, rgb(155 224 58 / 0.22) 14% 15%, transparent 15% 24%, rgb(255 255 255 / 0.18) 24% 24.4%, transparent 24.4% 34%)`,
          `linear-gradient(${angle - 20}deg, #0b0f07 0%, #2c3d14 45%, #10160a 70%, #040503 100%)`,
        ].join(','),
      }}
    />
  )
}
