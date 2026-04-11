import { describe, it, expect } from 'vitest'
import { computeBaseValue } from '../utils/economics'

describe('computeBaseValue', () => {
  it('returns 10 for two tier-1 traits with 0 variance', () => {
    expect(computeBaseValue(1, 1, 0)).toBe(10)
  })

  it('applies positive variance', () => {
    expect(computeBaseValue(1, 1, 0.1)).toBe(11)
  })

  it('applies negative variance', () => {
    expect(computeBaseValue(1, 1, -0.1)).toBe(9)
  })

  it('scales with higher tiers', () => {
    expect(computeBaseValue(2, 2, 0)).toBe(20)
  })

  it('never returns less than 1', () => {
    expect(computeBaseValue(1, 1, -0.99)).toBeGreaterThanOrEqual(1)
  })
})
