/**
 * Private lookup: Gold contribution per trait tier.
 * T1+T1 = 10G, T2+T2 = 44G, T3+T3 = 190G (at 0 variance).
 * Lives here rather than config.ts because this is a formula constant,
 * not a designer tuning knob.
 */
const TIER_VALUE: Record<number, number> = { 1: 5, 2: 22, 3: 95 }

/**
 * Compute the actual Gold value of a slime.
 * @param colorTier - Tier rank of the color trait (1-3)
 * @param shapeTier - Tier rank of the shape trait (1-3)
 * @param variance  - Random variance in [-0.1, 0.1] applied as a multiplier
 */
export function computeBaseValue(
  colorTier: number,
  shapeTier: number,
  variance: number,
): number {
  const base = TIER_VALUE[colorTier] + TIER_VALUE[shapeTier]
  return Math.max(1, Math.round(base * (1 + variance)))
}
