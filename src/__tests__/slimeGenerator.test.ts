import { describe, it, expect, vi, afterEach } from 'vitest'
import { generateSlime } from '../utils/slimeGenerator'

const COLORS = ['Red', 'Blue', 'Green']
const SHAPES = ['Blob', 'Spiked', 'Elongated']

afterEach(() => {
  vi.restoreAllMocks()
})

describe('generateSlime', () => {
  it('returns a slime with valid color', () => {
    const slime = generateSlime()
    expect(COLORS).toContain(slime.color)
  })

  it('returns a slime with valid shape', () => {
    const slime = generateSlime()
    expect(SHAPES).toContain(slime.shape)
  })

  it('colorTier and shapeTier are each 1, 2, or 3', () => {
    for (let i = 0; i < 50; i++) {
      const slime = generateSlime()
      expect([1, 2, 3]).toContain(slime.colorTier)
      expect([1, 2, 3]).toContain(slime.shapeTier)
    }
  })

  it('actualValue is positive and scales with tier', () => {
    for (let i = 0; i < 50; i++) {
      const slime = generateSlime()
      expect(slime.actualValue).toBeGreaterThanOrEqual(1)
    }
  })

  it('generates a unique id each call', () => {
    const ids = new Set(Array.from({ length: 50 }, () => generateSlime().id))
    expect(ids.size).toBe(50)
  })
})

describe('pickTier boundary values', () => {
  it('Math.random()=0.0 -> tier 1 (r lands in first bucket)', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.0)
    const slime = generateSlime()
    expect(slime.colorTier).toBe(1)
    expect(slime.shapeTier).toBe(1)
  })

  it('Math.random()=0.65 -> tier 2 (r lands in second bucket)', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.65)
    const slime = generateSlime()
    expect(slime.colorTier).toBe(2)
    expect(slime.shapeTier).toBe(2)
  })

  it('Math.random()=0.95 -> tier 3 (r lands in third bucket)', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.95)
    const slime = generateSlime()
    expect(slime.colorTier).toBe(3)
    expect(slime.shapeTier).toBe(3)
  })
})
