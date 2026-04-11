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

export interface PersistedGameState {
  id: number // always 1 — single-row save
  gold: number
  penCapacity: number
  slimes: PersistedSlime[]
}

class SlimeBreederDB extends Dexie {
  gameState!: Table<PersistedGameState>

  constructor() {
    super('SlimeBreederDB')
    this.version(1).stores({
      gameState: 'id',
    })
  }
}

export const db = new SlimeBreederDB()
