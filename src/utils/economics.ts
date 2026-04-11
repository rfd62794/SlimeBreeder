/**
 * Compute the actual Gold value of a slime.
 * @param colorTier - Tier rank of the color trait (1 = Tier 1, 2 = Tier 2, etc.)
 * @param shapeTier - Tier rank of the shape trait
 * @param variance  - Random variance in range [-0.1, 0.1] applied as a multiplier
 */
export function computeBaseValue(
  colorTier: number,
  shapeTier: number,
  variance: number,
): number {
  const base = colorTier * 5 + shapeTier * 5
  const value = Math.round(base * (1 + variance))
  return Math.max(1, value)
}
