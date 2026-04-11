import Dexie, { type Table } from 'dexie'

export interface PersistedSlime {
  id: string
  color: string
  shape: string
  colorTier: number
  shapeTier: number
  variance: number
  actualValue: number
  createdAt: number
}

export interface PersistedDisplaySlot {
  slimeId: string
  assignedAt: number
  slimeData: PersistedSlime
}

export interface HatchTankSlot {
  type: 'hatch'
  startedAt: number
}

export interface BreedTankSlot {
  type: 'breed'
  startedAt: number
  hostId: string
  hostSnapshot: PersistedSlime   // full host genetics captured at startBreed time;
                                  // host stays in pen but may be sold/displayed before resolve
  donorSnapshot: PersistedSlime  // full donor genetics captured at startBreed time;
                                  // donor is removed from pen immediately, so this snapshot
                                  // is the only source of truth at resolveBreed time
}

export type TankSlot = HatchTankSlot | BreedTankSlot

export interface PersistedGameState {
  id: number // always 1 — single-row save
  gold: number
  penCapacity: number
  slimes: PersistedSlime[]
  tanks: Array<TankSlot | null>  // length always equals tankCount; null = empty slot
  tankCount: number
  displaySlots: Array<PersistedDisplaySlot | null>
}

class SlimeBreederDB extends Dexie {
  gameState!: Table<PersistedGameState>

  constructor() {
    super('SlimeBreederDB')
    this.version(1).stores({ gameState: 'id' })
    this.version(2).stores({ gameState: 'id' }).upgrade((tx) =>
      tx
        .table('gameState')
        .toCollection()
        .modify((row) => {
          if (row.hatchStartedAt === undefined) row.hatchStartedAt = null
          if (row.displaySlots === undefined) row.displaySlots = [null, null]
        }),
    )
    this.version(3).stores({ gameState: 'id' }).upgrade((tx) =>
      tx
        .table('gameState')
        .toCollection()
        .modify((row) => {
          // Migrate hatchStartedAt (v2) → tanks[0] (v3)
          const slot: TankSlot | null =
            row.hatchStartedAt != null
              ? { type: 'hatch', startedAt: row.hatchStartedAt }
              : null
          row.tanks = [slot]
          row.tankCount = 1
          delete row.hatchStartedAt
        }),
    )
  }
}

export const db = new SlimeBreederDB()
