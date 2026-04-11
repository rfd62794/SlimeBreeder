import { describe, it, expect } from 'vitest'
import { generateSlime } from '../utils/slimeGenerator'

const COLORS = ['Red', 'Blue', 'Green']
const SHAPES = ['Blob', 'Spiked', 'Elongated']

describe('generateSlime', () => {
  it('returns a slime with valid color', () => {
    const slime = generateSlime()
    expect(COLORS).toContain(slime.color)
  })

  it('returns a slime with valid shape', () => {
    const slime = generateSlime()
    expect(SHAPES).toContain(slime.shape)
  })

  it('has tier 1 color and shape in MVP', () => {
    const slime = generateSlime()
    expect(slime.colorTier).toBe(1)
    expect(slime.shapeTier).toBe(1)
  })

  it('actualValue is between 9 and 11 (10 ± 10%)', () => {
    for (let i = 0; i < 100; i++) {
      const slime = generateSlime()
      expect(slime.actualValue).toBeGreaterThanOrEqual(9)
      expect(slime.actualValue).toBeLessThanOrEqual(11)
    }
  })

  it('generates a unique id each call', () => {
    const ids = new Set(Array.from({ length: 50 }, () => generateSlime().id))
    expect(ids.size).toBe(50)
  })
})
