import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useGameStore } from '../store/gameStore'
import { DISPLAY_BASE_RATE, TANK_UPGRADE_COST } from '../config'

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
    tanks: [null],
    tankCount: 1,
    displaySlots: [null, null],
  })
})

// ── Incubation ────────────────────────────────────────────────────

describe('startHatch', () => {
  it('puts a hatch slot in tanks[0]', () => {
    useGameStore.getState().startHatch()
    const slot = useGameStore.getState().tanks[0]
    expect(slot?.type).toBe('hatch')
    expect(typeof (slot as any)?.startedAt).toBe('number')
  })

  it('is a no-op when pen is full', () => {
    useGameStore.setState({ penCapacity: 2 })
    const { startHatch, resolveHatch } = useGameStore.getState()
    startHatch(); resolveHatch(0)
    startHatch(); resolveHatch(0)
    startHatch() // pen full — third startHatch should be blocked
    expect(useGameStore.getState().slimes).toHaveLength(2)
    expect(useGameStore.getState().tanks[0]).toBeNull()
  })

  it('is a no-op when tank is already occupied', () => {
    useGameStore.getState().startHatch()
    const first = useGameStore.getState().tanks[0]
    useGameStore.getState().startHatch()
    expect(useGameStore.getState().tanks[0]).toBe(first)
  })
})

describe('resolveHatch', () => {
  it('adds a slime and clears tanks[0]', () => {
    useGameStore.getState().startHatch()
    useGameStore.getState().resolveHatch(0)
    expect(useGameStore.getState().slimes).toHaveLength(1)
    expect(useGameStore.getState().tanks[0]).toBeNull()
  })
})

describe('loadGame — incubation', () => {
  it('auto-resolves an expired hatch tank on load', async () => {
    const { db } = await import('../db/db')
    const expiredAt = Date.now() - 60_000
    vi.mocked(db.gameState.get).mockResolvedValueOnce({
      id: 1, gold: 50, penCapacity: 5, slimes: [],
      tanks: [{ type: 'hatch', startedAt: expiredAt }],
      tankCount: 1,
      displaySlots: [null, null],
    })
    await useGameStore.getState().loadGame()
    expect(useGameStore.getState().slimes).toHaveLength(1)
    expect(useGameStore.getState().tanks[0]).toBeNull()
  })

  it('preserves an active hatch tank without resolving', async () => {
    const { db } = await import('../db/db')
    const activeAt = Date.now() - 5_000
    vi.mocked(db.gameState.get).mockResolvedValueOnce({
      id: 1, gold: 50, penCapacity: 5, slimes: [],
      tanks: [{ type: 'hatch', startedAt: activeAt }],
      tankCount: 1,
      displaySlots: [null, null],
    })
    await useGameStore.getState().loadGame()
    expect(useGameStore.getState().slimes).toHaveLength(0)
    expect(useGameStore.getState().tanks[0]).toMatchObject({ type: 'hatch', startedAt: activeAt })
  })
})

// ── Sell / upgrade ────────────────────────────────────────────────

describe('sellSlime', () => {
  it('removes slime and adds its value to Gold', () => {
    useGameStore.getState().startHatch()
    useGameStore.getState().resolveHatch(0)
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
  })
})

describe('buyTankUpgrade', () => {
  it('adds a null slot to tanks and increments tankCount', () => {
    useGameStore.setState({ gold: 100 })
    useGameStore.getState().buyTankUpgrade()
    expect(useGameStore.getState().tankCount).toBe(2)
    expect(useGameStore.getState().tanks).toHaveLength(2)
    expect(useGameStore.getState().tanks[1]).toBeNull()
    expect(useGameStore.getState().gold).toBe(100 - TANK_UPGRADE_COST)
  })

  it('does not buy when gold < TANK_UPGRADE_COST', () => {
    useGameStore.setState({ gold: 30 })
    useGameStore.getState().buyTankUpgrade()
    expect(useGameStore.getState().tankCount).toBe(1)
  })
})

// ── Display Rooms ─────────────────────────────────────────────────

describe('assignToDisplay', () => {
  it('removes slime from slimes[]', () => {
    useGameStore.getState().startHatch()
    useGameStore.getState().resolveHatch(0)
    const slime = useGameStore.getState().slimes[0]
    useGameStore.getState().assignToDisplay(slime.id, 0)
    expect(useGameStore.getState().slimes).toHaveLength(0)
  })

  it('puts slime in correct slot index', () => {
    useGameStore.getState().startHatch()
    useGameStore.getState().resolveHatch(0)
    const slime = useGameStore.getState().slimes[0]
    useGameStore.getState().assignToDisplay(slime.id, 1)
    expect(useGameStore.getState().displaySlots[1]?.slimeId).toBe(slime.id)
    expect(useGameStore.getState().displaySlots[0]).toBeNull()
  })

  it('is a no-op when target slot is already occupied', () => {
    useGameStore.getState().startHatch(); useGameStore.getState().resolveHatch(0)
    useGameStore.getState().startHatch(); useGameStore.getState().resolveHatch(0)
    const [first, second] = useGameStore.getState().slimes
    useGameStore.getState().assignToDisplay(first.id, 0)
    const existingSlotId = useGameStore.getState().displaySlots[0]?.slimeId
    useGameStore.getState().assignToDisplay(second.id, 0)
    expect(useGameStore.getState().displaySlots[0]?.slimeId).toBe(existingSlotId)
    expect(useGameStore.getState().slimes).toHaveLength(1)
  })
})

describe('unassignFromDisplay', () => {
  it('puts slime back in slimes[] with original variance preserved', () => {
    useGameStore.getState().startHatch(); useGameStore.getState().resolveHatch(0)
    const slime = useGameStore.getState().slimes[0]
    useGameStore.getState().assignToDisplay(slime.id, 0)
    useGameStore.getState().unassignFromDisplay(0)
    const restored = useGameStore.getState().slimes[0]
    expect(restored.id).toBe(slime.id)
    expect(restored.variance).toBe(slime.variance)
    expect(useGameStore.getState().displaySlots[0]).toBeNull()
  })
})

describe('loadGame — display rooms', () => {
  it('computes and adds elapsed display gold on load', async () => {
    const { db } = await import('../db/db')
    const assignedAt = Date.now() - 100_000
    vi.mocked(db.gameState.get).mockResolvedValueOnce({
      id: 1, gold: 50, penCapacity: 5, slimes: [],
      tanks: [null], tankCount: 1,
      displaySlots: [
        {
          slimeId: 'test-slime', assignedAt,
          slimeData: { id: 'test-slime', color: 'Green', shape: 'Blob', colorTier: 1, shapeTier: 1, actualValue: 10, createdAt: assignedAt },
        },
        null,
      ],
    })
    await useGameStore.getState().loadGame()
    const expectedGold = 50 + 100 * (1 * 1 * DISPLAY_BASE_RATE)
    expect(useGameStore.getState().gold).toBeCloseTo(expectedGold, 0)
  })
})

// ── Breeding ──────────────────────────────────────────────────

describe('startBreed', () => {
  it('removes donor from slimes[] immediately', () => {
    // Hatch two slimes
    useGameStore.getState().startHatch(); useGameStore.getState().resolveHatch(0)
    useGameStore.getState().startHatch(); useGameStore.getState().resolveHatch(0)
    const [host, donor] = useGameStore.getState().slimes
    useGameStore.getState().startBreed(host.id, donor.id)
    expect(useGameStore.getState().slimes).toHaveLength(1)
    expect(useGameStore.getState().slimes[0].id).toBe(host.id)
  })

  it('occupies the first free tank as a breed slot with donorSnapshot', () => {
    useGameStore.getState().startHatch(); useGameStore.getState().resolveHatch(0)
    useGameStore.getState().startHatch(); useGameStore.getState().resolveHatch(0)
    const [host, donor] = useGameStore.getState().slimes
    useGameStore.getState().startBreed(host.id, donor.id)
    const tank = useGameStore.getState().tanks[0]
    expect(tank?.type).toBe('breed')
    expect((tank as any)?.hostId).toBe(host.id)
    expect((tank as any)?.donorSnapshot?.id).toBe(donor.id)
  })

  it('is a no-op when no free tank exists', () => {
    useGameStore.getState().startHatch(); useGameStore.getState().resolveHatch(0)
    useGameStore.getState().startHatch(); useGameStore.getState().resolveHatch(0)
    const [host, donor] = useGameStore.getState().slimes
    // occupy the only tank with a new hatch
    useGameStore.getState().startHatch()
    // now tank[0] is occupied by hatch, so startBreed should be blocked
    useGameStore.getState().startBreed(host.id, donor.id)
    // breed should be blocked — tank already has hatch
    expect(useGameStore.getState().tanks[0]?.type).toBe('hatch')
    expect(useGameStore.getState().slimes).toHaveLength(2)
  })
})

describe('resolveBreed', () => {
  it('adds offspring to slimes[] and clears the breed tank', () => {
    useGameStore.getState().startHatch(); useGameStore.getState().resolveHatch(0)
    useGameStore.getState().startHatch(); useGameStore.getState().resolveHatch(0)
    const [host, donor] = useGameStore.getState().slimes
    useGameStore.getState().startBreed(host.id, donor.id)
    useGameStore.getState().resolveBreed(0)
    // host stayed + offspring added = 2
    expect(useGameStore.getState().slimes).toHaveLength(2)
    expect(useGameStore.getState().tanks[0]).toBeNull()
  })
})

describe('loadGame — breed', () => {
  it('auto-resolves an expired breed tank on load', async () => {
    const { db } = await import('../db/db')
    const expiredAt = Date.now() - 60_000
    const hostSlime = {
      id: 'host-1', color: 'Green', shape: 'Blob',
      colorTier: 1, shapeTier: 1, actualValue: 10, createdAt: 1000,
    }
    const donorSnapshot = {
      id: 'donor-1', color: 'Red', shape: 'Spiked',
      colorTier: 1, shapeTier: 1, actualValue: 10, createdAt: 2000,
    }
    vi.mocked(db.gameState.get).mockResolvedValueOnce({
      id: 1, gold: 50, penCapacity: 5,
      slimes: [hostSlime],
      tanks: [{ type: 'breed', startedAt: expiredAt, hostId: 'host-1', hostSnapshot: hostSlime, donorSnapshot }],
      tankCount: 1,
      displaySlots: [null, null],
    })
    await useGameStore.getState().loadGame()
    // host still present + offspring added
    expect(useGameStore.getState().slimes).toHaveLength(2)
    expect(useGameStore.getState().tanks[0]).toBeNull()
  })
})
