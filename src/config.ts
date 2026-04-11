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

/** Gold cost to add a new incubation tank slot (Roost from GDD §4.4). */
export const TANK_UPGRADE_COST = 50

/** Probability (0–1) that one trait tier mutates +1 after breeding. */
export const BREED_MUTATION_CHANCE = 0.15

/** Probability (0–1) that each trait inherits from the host vs. donor. */
export const BREED_HOST_WEIGHT = 0.60
