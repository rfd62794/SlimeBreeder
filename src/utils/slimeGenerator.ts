import { computeBaseValue } from './economics'
import type { Slime, SlimeColor, SlimeShape } from '../types'

const COLORS: SlimeColor[] = ['Red', 'Blue', 'Green']
const SHAPES: SlimeShape[] = ['Blob', 'Spiked', 'Elongated']

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

export function generateSlime(): Slime {
  const color = pick(COLORS)
  const shape = pick(SHAPES)
  const colorTier = 1
  const shapeTier = 1
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
