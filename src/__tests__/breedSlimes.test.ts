import { describe, it, expect, vi, afterEach } from 'vitest'
import { breedSlimes } from '../utils/breedSlimes'
import type { Slime } from '../types'
import type { PersistedSlime } from '../db/db'

// Fixed test fixtures
const host: Slime = {
  id: 'host-1',
  color: 'Green',
  shape: 'Blob',
  colorTier: 2,
  shapeTier: 1,
  variance: 0,
  actualValue: 27,
  createdAt: 1000,
}

const donor: PersistedSlime = {
  id: 'donor-1',
  color: 'Red',
  shape: 'Spiked',
  colorTier: 1,
  shapeTier: 3,
  actualValue: 100,
  createdAt: 2000,
}

afterEach(() => vi.restoreAllMocks())

// Mock call sequence helper:
// breedSlimes calls Math.random() in this order:
//   1. colorFromHost (< 0.60 → host)
//   2. shapeFromHost (< 0.60 → host)
//   3. mutationFires (< 0.15 → fires)
//   4. whichTrait    (only if mutation fired — * 2, floor → 0=color 1=shape)
//   5. variance      (* 0.2 - 0.1)

describe('breedSlimes — host/donor inheritance', () => {
  it('inherits color and shape from host when random=0.5 (< 0.60, no mutation)', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5)
    // call1: 0.5 < 0.60 → host color (Green T2)
    // call2: 0.5 < 0.60 → host shape (Blob T1)
    // call3: 0.5 < 0.15? NO → no mutation
    // call4: skipped
    // call5: variance = 0.5*0.2 - 0.1 = 0.0
    const offspring = breedSlimes(host, donor)
    expect(offspring.color).toBe('Green')
    expect(offspring.colorTier).toBe(2)
    expect(offspring.shape).toBe('Blob')
    expect(offspring.shapeTier).toBe(1)
  })

  it('inherits color and shape from donor when random=0.65 (>= 0.60, no mutation)', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.65)
    // call1: 0.65 < 0.60? NO → donor color (Red T1)
    // call2: 0.65 < 0.60? NO → donor shape (Spiked T3)
    // call3: 0.65 < 0.15? NO → no mutation
    const offspring = breedSlimes(host, donor)
    expect(offspring.color).toBe('Red')
    expect(offspring.colorTier).toBe(1)
    expect(offspring.shape).toBe('Spiked')
    expect(offspring.shapeTier).toBe(3)
  })
})

describe('breedSlimes — mutation', () => {
  it('mutation on color bumps colorTier +1 (host color inherited, then mutated)', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.0)
    // call1: 0.0 < 0.60 → host color (Green T2)
    // call2: 0.0 < 0.60 → host shape (Blob T1)
    // call3: 0.0 < 0.15 → mutation fires!
    // call4: floor(0.0 * 2) = 0 → mutate color
    // result: colorTier 2 + 1 = 3
    const offspring = breedSlimes(host, donor)
    expect(offspring.color).toBe('Green')     // label unchanged
    expect(offspring.colorTier).toBe(3)       // T2 → T3 via mutation
    expect(offspring.shapeTier).toBe(1)       // host shape, no mutation
  })

  it('mutation on shape bumps shapeTier +1', () => {
    vi.spyOn(Math, 'random')
      .mockReturnValueOnce(0.5)   // colorFromHost: TRUE (host Green T2)
      .mockReturnValueOnce(0.5)   // shapeFromHost: TRUE (host Blob T1)
      .mockReturnValueOnce(0.05)  // mutationFires: 0.05 < 0.15 → YES
      .mockReturnValueOnce(0.5)   // whichTrait: floor(0.5*2)=1 → shape
      .mockReturnValueOnce(0.0)   // variance
    const offspring = breedSlimes(host, donor)
    expect(offspring.shape).toBe('Blob')    // label unchanged
    expect(offspring.shapeTier).toBe(2)     // T1 → T2 via mutation
    expect(offspring.colorTier).toBe(2)     // host, no mutation
  })

  it('mutation caps tier at 3', () => {
    const t3Host: Slime = { ...host, colorTier: 3 }
    vi.spyOn(Math, 'random').mockReturnValue(0.0)
    // mutation fires on color, but T3 is already max
    const offspring = breedSlimes(t3Host, donor)
    expect(offspring.colorTier).toBe(3) // stays 3, not 4
  })

  it('no mutation when random=0.5 (0.5 >= 0.15)', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5)
    const offspring = breedSlimes(host, donor)
    // host T2 color, no mutation → stays T2
    expect(offspring.colorTier).toBe(2)
    expect(offspring.shapeTier).toBe(1)
  })
})

describe('breedSlimes — offspring metadata', () => {
  it('generates a unique id different from both parents', () => {
    const o1 = breedSlimes(host, donor)
    const o2 = breedSlimes(host, donor)
    expect(o1.id).not.toBe(host.id)
    expect(o1.id).not.toBe(donor.id)
    expect(o1.id).not.toBe(o2.id)
  })

  it('actualValue is positive', () => {
    for (let i = 0; i < 20; i++) {
      const offspring = breedSlimes(host, donor)
      expect(offspring.actualValue).toBeGreaterThanOrEqual(1)
    }
  })

  it('variance is stored on offspring', () => {
    vi.spyOn(Math, 'random')
      .mockReturnValueOnce(0.5)  // colorFromHost
      .mockReturnValueOnce(0.5)  // shapeFromHost
      .mockReturnValueOnce(0.5)  // no mutation
      .mockReturnValueOnce(0.0)  // variance roll: 0.0*0.2-0.1 = -0.1
    const offspring = breedSlimes(host, donor)
    expect(offspring.variance).toBeCloseTo(-0.1, 2)
  })
})
