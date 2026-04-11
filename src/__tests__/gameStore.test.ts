import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useGameStore } from '../store/gameStore'
import { DISPLAY_BASE_RATE } from '../config'

vi.mock('../db/db', () => ({
  db: {
    gameState: {
      put: vi.fn().mockResolvedValue(undefined),
      get: vi.fn().mockResolvedValue(null),
    },
  },
}))

beforeEach(() => {
  useGameStore.setState({
    gold: 50,
    penCapacity: 5,
    slimes: [],
    hatchStartedAt: null,
    displaySlots: [null, null],
  })
})

// ── Incubation ────────────────────────────────────────────────────

describe('startHatch', () => {
  it('sets hatchStartedAt to a number', () => {
    useGameStore.getState().startHatch()
    expect(typeof useGameStore.getState().hatchStartedAt).toBe('number')
  })

  it('is a no-op when pen is full', () => {
    useGameStore.setState({ penCapacity: 2 })
    const { startHatch, resolveHatch } = useGameStore.getState()
    startHatch()
    resolveHatch()
    startHatch()
    resolveHatch()
    // pen is now full — third startHatch should be blocked
    startHatch()
    expect(useGameStore.getState().slimes).toHaveLength(2)
    expect(useGameStore.getState().hatchStartedAt).toBeNull()
  })

  it('is a no-op when incubation is already in progress', () => {
    useGameStore.getState().startHatch()
    const first = useGameStore.getState().hatchStartedAt
    useGameStore.getState().startHatch()
    expect(useGameStore.getState().hatchStartedAt).toBe(first)
  })
})

describe('resolveHatch', () => {
  it('adds a slime and clears hatchStartedAt', () => {
    useGameStore.getState().startHatch()
    useGameStore.getState().resolveHatch()
    expect(useGameStore.getState().slimes).toHaveLength(1)
    expect(useGameStore.getState().hatchStartedAt).toBeNull()
  })
})

describe('loadGame — incubation', () => {
  it('auto-resolves an expired hatchStartedAt', async () => {
    const { db } = await import('../db/db')
    const expiredAt = Date.now() - 60_000 // 60s ago — well past 30s
    vi.mocked(db.gameState.get).mockResolvedValueOnce({
      id: 1,
      gold: 50,
      penCapacity: 5,
      slimes: [],
      hatchStartedAt: expiredAt,
      displaySlots: [null, null],
    })
    await useGameStore.getState().loadGame()
    expect(useGameStore.getState().slimes).toHaveLength(1)
    expect(useGameStore.getState().hatchStartedAt).toBeNull()
  })

  it('preserves an active hatchStartedAt without resolving', async () => {
    const { db } = await import('../db/db')
    const activeAt = Date.now() - 5_000 // only 5s in — still incubating
    vi.mocked(db.gameState.get).mockResolvedValueOnce({
      id: 1,
      gold: 50,
      penCapacity: 5,
      slimes: [],
      hatchStartedAt: activeAt,
      displaySlots: [null, null],
    })
    await useGameStore.getState().loadGame()
    expect(useGameStore.getState().slimes).toHaveLength(0)
    expect(useGameStore.getState().hatchStartedAt).toBe(activeAt)
  })
})

// ── Sell / upgrade (existing, preserved) ─────────────────────────

describe('sellSlime', () => {
  it('removes slime and adds its value to Gold', () => {
    useGameStore.getState().startHatch()
    useGameStore.getState().resolveHatch()
    const slime = useGameStore.getState().slimes[0]
    const goldBefore = useGameStore.getState().gold
    useGameStore.getState().sellSlime(slime.id)
    expect(useGameStore.getState().slimes).toHaveLength(0)
    expect(useGameStore.getState().gold).toBe(goldBefore + slime.actualValue)
  })
})

describe('buyPenUpgrade', () => {
  it('increases penCapacity by 1 and deducts gold', () => {
    useGameStore.setState({ gold: 50 })
    useGameStore.getState().buyPenUpgrade()
    expect(useGameStore.getState().penCapacity).toBe(6)
    expect(useGameStore.getState().gold).toBe(30)
  })

  it('does not buy when gold < cost', () => {
    useGameStore.setState({ gold: 10 })
    useGameStore.getState().buyPenUpgrade()
    expect(useGameStore.getState().penCapacity).toBe(5)
    expect(useGameStore.getState().gold).toBe(10)
  })
})

// ── Display Rooms ─────────────────────────────────────────────────

describe('assignToDisplay', () => {
  it('removes slime from slimes[]', () => {
    useGameStore.getState().startHatch()
    useGameStore.getState().resolveHatch()
    const slime = useGameStore.getState().slimes[0]
    useGameStore.getState().assignToDisplay(slime.id, 0)
    expect(useGameStore.getState().slimes).toHaveLength(0)
  })

  it('puts slime in correct slot index', () => {
    useGameStore.getState().startHatch()
    useGameStore.getState().resolveHatch()
    const slime = useGameStore.getState().slimes[0]
    useGameStore.getState().assignToDisplay(slime.id, 1)
    expect(useGameStore.getState().displaySlots[1]?.slimeId).toBe(slime.id)
    expect(useGameStore.getState().displaySlots[0]).toBeNull()
  })

  it('is a no-op when target slot is already occupied', () => {
    // Hatch two slimes
    useGameStore.getState().startHatch()
    useGameStore.getState().resolveHatch()
    useGameStore.getState().startHatch()
    useGameStore.getState().resolveHatch()
    const [first, second] = useGameStore.getState().slimes
    useGameStore.getState().assignToDisplay(first.id, 0)
    const existingSlotId = useGameStore.getState().displaySlots[0]?.slimeId
    useGameStore.getState().assignToDisplay(second.id, 0) // occupied slot
    expect(useGameStore.getState().displaySlots[0]?.slimeId).toBe(existingSlotId)
    expect(useGameStore.getState().slimes).toHaveLength(1) // second slime still in pen
  })
})

describe('unassignFromDisplay', () => {
  it('puts slime back in slimes[] with variance 0', () => {
    useGameStore.getState().startHatch()
    useGameStore.getState().resolveHatch()
    const slime = useGameStore.getState().slimes[0]
    useGameStore.getState().assignToDisplay(slime.id, 0)
    useGameStore.getState().unassignFromDisplay(0)
    const restored = useGameStore.getState().slimes[0]
    expect(restored.id).toBe(slime.id)
    expect(restored.variance).toBe(0)
    expect(useGameStore.getState().displaySlots[0]).toBeNull()
  })
})

describe('loadGame — display rooms', () => {
  it('computes and adds elapsed display gold on load', async () => {
    const { db } = await import('../db/db')
    const assignedAt = Date.now() - 100_000 // 100 seconds ago
    vi.mocked(db.gameState.get).mockResolvedValueOnce({
      id: 1,
      gold: 50,
      penCapacity: 5,
      slimes: [],
      hatchStartedAt: null,
      displaySlots: [
        {
          slimeId: 'test-slime',
          assignedAt,
          slimeData: {
            id: 'test-slime',
            color: 'Green',
            shape: 'Blob',
            colorTier: 1,
            shapeTier: 1,
            actualValue: 10,
            createdAt: assignedAt,
          },
        },
        null,
      ],
    })
    await useGameStore.getState().loadGame()
    const expectedGold = 50 + 100 * (1 * 1 * DISPLAY_BASE_RATE)
    expect(useGameStore.getState().gold).toBeCloseTo(expectedGold, 0)
  })
})
