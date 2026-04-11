import Dexie, { type Table } from 'dexie'

export interface PersistedSlime {
  id: string
  color: string
  shape: string
  colorTier: number
  shapeTier: number
  actualValue: number
  createdAt: number
}

export interface PersistedDisplaySlot {
  slimeId: string
  assignedAt: number
  slimeData: PersistedSlime
}

export interface PersistedGameState {
  id: number // always 1 — single-row save
  gold: number
  penCapacity: number
  slimes: PersistedSlime[]
  hatchStartedAt: number | null
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
  }
}

export const db = new SlimeBreederDB()
