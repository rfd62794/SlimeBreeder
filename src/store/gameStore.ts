import { create } from 'zustand'
import { db } from '../db/db'
import { generateSlime } from '../utils/slimeGenerator'
import type { Slime } from '../types'

export const PEN_UPGRADE_COST = 20

interface GameState {
  gold: number
  penCapacity: number
  slimes: Slime[]

  hatchSlime: () => void
  sellSlime: (id: string) => void
  buyPenUpgrade: () => void
  loadGame: () => Promise<void>
}

async function persist(state: Pick<GameState, 'gold' | 'penCapacity' | 'slimes'>) {
  await db.gameState.put({
    id: 1,
    gold: state.gold,
    penCapacity: state.penCapacity,
    slimes: state.slimes.map((s) => ({
      id: s.id,
      color: s.color,
      shape: s.shape,
      colorTier: s.colorTier,
      shapeTier: s.shapeTier,
      actualValue: s.actualValue,
      createdAt: s.createdAt,
    })),
  })
}

export const useGameStore = create<GameState>((set, get) => ({
  gold: 50,
  penCapacity: 5,
  slimes: [],

  hatchSlime() {
    const { slimes, penCapacity } = get()
    if (slimes.length >= penCapacity) return

    const next = { gold: get().gold, penCapacity, slimes: [...slimes, generateSlime()] }
    set(next)
    persist(next)
  },

  sellSlime(id: string) {
    const { slimes, gold } = get()
    const slime = slimes.find((s) => s.id === id)
    if (!slime) return

    const next = { gold: gold + slime.actualValue, penCapacity: get().penCapacity, slimes: slimes.filter((s) => s.id !== id) }
    set(next)
    persist(next)
  },

  buyPenUpgrade() {
    const { gold, penCapacity } = get()
    if (gold < PEN_UPGRADE_COST) return

    const next = { gold: gold - PEN_UPGRADE_COST, penCapacity: penCapacity + 1, slimes: get().slimes }
    set(next)
    persist(next)
  },

  async loadGame() {
    const saved = await db.gameState.get(1)
    if (!saved) return
    set({
      gold: saved.gold,
      penCapacity: saved.penCapacity,
      slimes: saved.slimes.map((s) => ({
        ...s,
        color: s.color as import('../types').SlimeColor,
        shape: s.shape as import('../types').SlimeShape,
        variance: 0,
      })),
    })
  },
}))
