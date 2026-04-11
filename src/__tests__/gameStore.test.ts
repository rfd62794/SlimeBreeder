import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useGameStore } from '../store/gameStore'

vi.mock('../db/db', () => ({
  db: {
    gameState: {
      put: vi.fn().mockResolvedValue(undefined),
      get: vi.fn().mockResolvedValue(null),
    },
  },
}))

beforeEach(() => {
  useGameStore.setState({ gold: 50, penCapacity: 5, slimes: [] })
})

describe('hatchSlime', () => {
  it('adds a slime to inventory', () => {
    useGameStore.getState().hatchSlime()
    expect(useGameStore.getState().slimes).toHaveLength(1)
  })

  it('does not hatch when inventory is full', () => {
    const { hatchSlime } = useGameStore.getState()
    for (let i = 0; i < 5; i++) hatchSlime()
    hatchSlime()
    expect(useGameStore.getState().slimes).toHaveLength(5)
  })
})

describe('sellSlime', () => {
  it('removes slime and adds its value to Gold', () => {
    useGameStore.getState().hatchSlime()
    const slime = useGameStore.getState().slimes[0]
    const goldBefore = useGameStore.getState().gold

    useGameStore.getState().sellSlime(slime.id)

    expect(useGameStore.getState().slimes).toHaveLength(0)
    expect(useGameStore.getState().gold).toBe(goldBefore + slime.actualValue)
  })
})

describe('buyPenUpgrade', () => {
  it('increases penCapacity by 1 and deducts 20 Gold', () => {
    useGameStore.setState({ gold: 50 })
    useGameStore.getState().buyPenUpgrade()
    expect(useGameStore.getState().penCapacity).toBe(6)
    expect(useGameStore.getState().gold).toBe(30)
  })

  it('does not buy when Gold < 20', () => {
    useGameStore.setState({ gold: 10 })
    useGameStore.getState().buyPenUpgrade()
    expect(useGameStore.getState().penCapacity).toBe(5)
    expect(useGameStore.getState().gold).toBe(10)
  })
})
