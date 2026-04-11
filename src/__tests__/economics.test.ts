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

  it('scales with higher tiers: T2/T2 = 44', () => {
    expect(computeBaseValue(2, 2, 0)).toBe(44)
  })

  it('scales with higher tiers: T3/T3 = 190', () => {
    expect(computeBaseValue(3, 3, 0)).toBe(190)
  })

  it('never returns less than 1', () => {
    expect(computeBaseValue(1, 1, -0.99)).toBeGreaterThanOrEqual(1)
  })
})
