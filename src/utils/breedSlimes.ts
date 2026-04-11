import { BREED_HOST_WEIGHT, BREED_MUTATION_CHANCE, TIER_WEIGHTS } from '../config'
import { computeBaseValue } from './economics'
import type { Slime, SlimeColor, SlimeShape } from '../types'
import type { PersistedSlime } from '../db/db'

/** Trait dimensions available for inheritance and mutation. Add 'pattern' | 'accessory' here later. */
const BREED_TRAITS = ['color', 'shape'] as const
type BreedTrait = (typeof BREED_TRAITS)[number]

const MAX_TIER = Math.max(...TIER_WEIGHTS.map((w) => w.tier))

/**
 * Produce a genetically-derived offspring from two parent slimes.
 * @param host   - The surviving parent (stays in pen after breed)
 * @param donor  - The consumed parent (snapshot stored on BreedTankSlot)
 *
 * Inheritance: each trait dimension independently rolls 60/40 host vs donor.
 * Mutation: 15% chance that ONE randomly-selected trait tier bumps +1 (capped at MAX_TIER).
 */
export function breedSlimes(host: Slime, donor: PersistedSlime): Slime {
  // Per-trait inheritance: 60% host, 40% donor
  const colorFromHost = Math.random() < BREED_HOST_WEIGHT
  const shapeFromHost = Math.random() < BREED_HOST_WEIGHT

  let color: SlimeColor = (colorFromHost ? host.color : donor.color) as SlimeColor
  let colorTier = colorFromHost ? host.colorTier : donor.colorTier
  let shape: SlimeShape = (shapeFromHost ? host.shape : donor.shape) as SlimeShape
  let shapeTier = shapeFromHost ? host.shapeTier : donor.shapeTier

  // 15% mutation: pick one trait dimension, bump its tier +1 (capped at MAX_TIER)
  if (Math.random() < BREED_MUTATION_CHANCE) {
    const mutatedTrait: BreedTrait = BREED_TRAITS[Math.floor(Math.random() * BREED_TRAITS.length)]
    if (mutatedTrait === 'color') colorTier = Math.min(colorTier + 1, MAX_TIER)
    else shapeTier = Math.min(shapeTier + 1, MAX_TIER)
  }

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
