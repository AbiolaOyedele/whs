/**
 * Card grids always show an even number of cards, so no card sits alone on
 * its row: an odd list loses its last item. A single card is left as it is.
 */
export function evenCards<T>(items: readonly T[]): T[] {
  if (items.length <= 1) return [...items]
  return items.slice(0, items.length - (items.length % 2))
}
