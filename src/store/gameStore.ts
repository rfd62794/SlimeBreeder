import { create } from 'zustand'
import { db } from '../db/db'
import { generateSlime } from '../utils/slimeGenerator'
import type { Slime, DisplaySlot } from '../types'
import { PEN_UPGRADE_COST, HATCH_DURATION_MS, DISPLAY_SLOT_COUNT, DISPLAY_BASE_RATE } from '../config'

interface GameState {
  gold: number
  penCapacity: number
  slimes: Slime[]
  hatchStartedAt: number | null
  displaySlots: Array<DisplaySlot | null>

  startHatch: () => void
  resolveHatch: () => void
  sellSlime: (id: string) => void
  buyPenUpgrade: () => void
  assignToDisplay: (slimeId: string, slotIndex: number) => void
  unassignFromDisplay: (slotIndex: number) => void
  loadGame: () => Promise<void>
}

async function persist(state: Pick<GameState, 'gold' | 'penCapacity' | 'slimes' | 'hatchStartedAt' | 'displaySlots'>) {
  await db.gameState.put({
    id: 1,
    gold: state.gold,
    penCapacity: state.penCapacity,
    hatchStartedAt: state.hatchStartedAt,
    slimes: state.slimes.map((s) => ({
      id: s.id,
      color: s.color,
      shape: s.shape,
      colorTier: s.colorTier,
      shapeTier: s.shapeTier,
      actualValue: s.actualValue,
      createdAt: s.createdAt,
    })),
    displaySlots: state.displaySlots.map((slot) =>
      slot
        ? {
            slimeId: slot.slimeId,
            assignedAt: slot.assignedAt,
            slimeData: {
              id: slot.slime.id,
              color: slot.slime.color,
              shape: slot.slime.shape,
              colorTier: slot.slime.colorTier,
              shapeTier: slot.slime.shapeTier,
              actualValue: slot.slime.actualValue,
              createdAt: slot.slime.createdAt,
            },
          }
        : null,
    ),
  })
}

export const useGameStore = create<GameState>((set, get) => ({
  gold: 50,
  penCapacity: 5,
  slimes: [],
  hatchStartedAt: null,
  displaySlots: Array(DISPLAY_SLOT_COUNT).fill(null),

  startHatch() {
    const { slimes, penCapacity, hatchStartedAt } = get()
    if (slimes.length >= penCapacity) return
    if (hatchStartedAt !== null) return
    const next = { ...get(), hatchStartedAt: Date.now() }
    set(next)
    persist(next)
  },

  resolveHatch() {
    const state = get()
    if (state.hatchStartedAt === null) return // guard: idempotent — safe to call multiple times
    const next = {
      ...state,
      slimes: [...state.slimes, generateSlime()],
      hatchStartedAt: null,
    }
    set(next)
    persist(next)
  },

  sellSlime(id: string) {
    const { slimes, gold } = get()
    const slime = slimes.find((s) => s.id === id)
    if (!slime) return
    const next = { ...get(), gold: gold + slime.actualValue, slimes: slimes.filter((s) => s.id !== id) }
    set(next)
    persist(next)
  },

  buyPenUpgrade() {
    const { gold, penCapacity } = get()
    if (gold < PEN_UPGRADE_COST) return
    const next = { ...get(), gold: gold - PEN_UPGRADE_COST, penCapacity: penCapacity + 1 }
    set(next)
    persist(next)
  },

  assignToDisplay(slimeId: string, slotIndex: number) {
    const { slimes, displaySlots } = get()
    if (displaySlots[slotIndex] !== null) return // guard: slot already occupied
    const slime = slimes.find((s) => s.id === slimeId)
    if (!slime) return
    const newSlots = displaySlots.map((s, i) =>
      i === slotIndex ? { slimeId, assignedAt: Date.now(), slime } : s,
    )
    const next = {
      ...get(),
      slimes: slimes.filter((s) => s.id !== slimeId),
      displaySlots: newSlots,
    }
    set(next)
    persist(next)
  },

  unassignFromDisplay(slotIndex: number) {
    const { displaySlots, slimes } = get()
    const slot = displaySlots[slotIndex]
    if (!slot) return
    const restoredSlime: Slime = { ...slot.slime, variance: 0 }
    const newSlots = displaySlots.map((s, i) => (i === slotIndex ? null : s))
    const next = { ...get(), slimes: [...slimes, restoredSlime], displaySlots: newSlots }
    set(next)
    persist(next)
  },

  async loadGame() {
    const saved = await db.gameState.get(1)
    if (!saved) return

    const now = Date.now()
    let gold = saved.gold

    // Credit accumulated display room income (idle game style)
    const displaySlots: Array<DisplaySlot | null> = (saved.displaySlots ?? Array(DISPLAY_SLOT_COUNT).fill(null)).map(
      (slot) => {
        if (!slot) return null
        const elapsedSec = (now - slot.assignedAt) / 1000
        const rate = slot.slimeData.colorTier * slot.slimeData.shapeTier * DISPLAY_BASE_RATE
        gold += elapsedSec * rate
        return {
          slimeId: slot.slimeId,
          assignedAt: slot.assignedAt,
          slime: {
            ...slot.slimeData,
            color: slot.slimeData.color as import('../types').SlimeColor,
            shape: slot.slimeData.shape as import('../types').SlimeShape,
            variance: 0,
          },
        }
      },
    )

    const baseState: Omit<GameState, 'startHatch' | 'resolveHatch' | 'sellSlime' | 'buyPenUpgrade' | 'assignToDisplay' | 'unassignFromDisplay' | 'loadGame'> = {
      gold: Math.floor(gold),
      penCapacity: saved.penCapacity,
      hatchStartedAt: saved.hatchStartedAt ?? null,
      displaySlots,
      slimes: saved.slimes.map((s) => ({
        ...s,
        color: s.color as import('../types').SlimeColor,
        shape: s.shape as import('../types').SlimeShape,
        variance: 0,
      })),
    }

    set(baseState)

    // Auto-resolve an expired incubation
    if (baseState.hatchStartedAt !== null && now - baseState.hatchStartedAt >= HATCH_DURATION_MS) {
      get().resolveHatch()
    }
  },
}))
