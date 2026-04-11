import { TIER_WEIGHTS } from '../config'
import { computeBaseValue } from './economics'
import type { Slime, SlimeColor, SlimeShape } from '../types'

const COLORS: SlimeColor[] = ['Red', 'Blue', 'Green']
const SHAPES: SlimeShape[] = ['Blob', 'Spiked', 'Elongated']

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

/**
 * Weighted random tier selection using TIER_WEIGHTS from config.
 * Weights are relative (need not sum to any specific value).
 */
function pickTier(): number {
  const total = TIER_WEIGHTS.reduce((sum, w) => sum + w.weight, 0)
  let r = Math.random() * total
  for (const { tier, weight } of TIER_WEIGHTS) {
    r -= weight
    if (r <= 0) return tier
  }
  // Fallback: floating-point edge case guard
  return TIER_WEIGHTS[TIER_WEIGHTS.length - 1].tier
}

export function generateSlime(): Slime {
  const color = pick(COLORS)
  const shape = pick(SHAPES)
  const colorTier = pickTier()
  const shapeTier = pickTier()
  // variance in [-0.1, 0.1]
  const variance = parseFloat((Math.random() * 0.2 - 0.1).toFixed(2))
  const actualValue = computeBaseValue(colorTier, shapeTier, variance)

  return {
    id: crypto.randomUUID(),
    color,
    shape,
    colorTier,
    shapeTier,
    variance,
    actualValue,
    createdAt: Date.now(),
  }
}
