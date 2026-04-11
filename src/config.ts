export const HATCH_DURATION_MS = 30_000
export const PEN_UPGRADE_COST = 20
export const DISPLAY_SLOT_COUNT = 2
export const DISPLAY_BASE_RATE = 0.5 // gold per second per colorTier x shapeTier

/**
 * Weighted rarity table for tier selection.
 * Weights are relative (they need not sum to 100).
 * Designer knob: adjust weights here to change drop rates.
 * Current targets: T1=60%, T2=30%, T3=10%
 */
export const TIER_WEIGHTS: { tier: number; weight: number }[] = [
  { tier: 1, weight: 60 },
  { tier: 2, weight: 30 },
  { tier: 3, weight: 10 },
]
