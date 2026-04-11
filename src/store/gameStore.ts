import { create } from 'zustand'
import { db } from '../db/db'
import { generateSlime } from '../utils/slimeGenerator'
import type { Slime, DisplaySlot } from '../types'
import type { TankSlot } from '../db/db'
import { breedSlimes } from '../utils/breedSlimes'
import {
  PEN_UPGRADE_COST,
  HATCH_DURATION_MS,
  DISPLAY_SLOT_COUNT,
  DISPLAY_BASE_RATE,
  TANK_UPGRADE_COST,
} from '../config'

interface GameState {
  gold: number
  penCapacity: number
  slimes: Slime[]
  tanks: Array<TankSlot | null>
  tankCount: number
  displaySlots: Array<DisplaySlot | null>

  startHatch: (tankIndex?: number) => void
  resolveHatch: (tankIndex: number) => void
  startBreed: (hostId: string, donorId: string) => void
  resolveBreed: (tankIndex: number) => void
  sellSlime: (id: string) => void
  buyPenUpgrade: () => void
  buyTankUpgrade: () => void
  assignToDisplay: (slimeId: string, slotIndex: number) => void
  unassignFromDisplay: (slotIndex: number) => void
  tickDisplayGold: () => void
  loadGame: () => Promise<void>
}

async function persist(
  state: Pick<GameState, 'gold' | 'penCapacity' | 'slimes' | 'tanks' | 'tankCount' | 'displaySlots'>,
) {
  await db.gameState.put({
    id: 1,
    gold: state.gold,
    penCapacity: state.penCapacity,
    tanks: state.tanks,
    tankCount: state.tankCount,
    slimes: state.slimes.map((s) => ({
      id: s.id,
      color: s.color,
      shape: s.shape,
      colorTier: s.colorTier,
      shapeTier: s.shapeTier,
      variance: s.variance,
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
              variance: slot.slime.variance,
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
  tanks: [null],
  tankCount: 1,
  displaySlots: Array(DISPLAY_SLOT_COUNT).fill(null),

  startHatch(tankIndex?: number) {
    const { slimes, penCapacity, tanks } = get()
    if (slimes.length >= penCapacity) return
    const idx = tankIndex ?? tanks.findIndex((t) => t === null)
    if (idx === -1 || tanks[idx] !== null) return
    const newTanks = tanks.map((t, i): TankSlot | null =>
      i === idx ? { type: 'hatch', startedAt: Date.now() } : t,
    )
    const next = { ...get(), tanks: newTanks }
    set(next)
    persist(next)
  },

  resolveHatch(tankIndex: number) {
    const state = get()
    const slot = state.tanks[tankIndex]
    if (!slot || slot.type !== 'hatch') return // idempotent guard
    const newTanks = state.tanks.map((t, i): TankSlot | null => (i === tankIndex ? null : t))
    const next = {
      ...state,
      slimes: [...state.slimes, generateSlime()],
      tanks: newTanks,
    }
    set(next)
    persist(next)
  },

  startBreed(hostId: string, donorId: string) {
    const { slimes, tanks } = get()
    const host = slimes.find((s) => s.id === hostId)
    const donor = slimes.find((s) => s.id === donorId)
    if (!host || !donor) return
    const idx = tanks.findIndex((t) => t === null)
    if (idx === -1) return // no free tank
    const donorSnapshot = {
      id: donor.id,
      color: donor.color,
      shape: donor.shape,
      colorTier: donor.colorTier,
      shapeTier: donor.shapeTier,
      variance: donor.variance,
      actualValue: donor.actualValue,
      createdAt: donor.createdAt,
    }
    const newTanks = tanks.map((t, i): TankSlot | null =>
      i === idx ? { type: 'breed', startedAt: Date.now(), hostId, donorSnapshot } : t,
    )
    const next = {
      ...get(),
      slimes: slimes.filter((s) => s.id !== donorId), // donor consumed immediately
      tanks: newTanks,
    }
    set(next)
    persist(next)
  },

  resolveBreed(tankIndex: number) {
    const state = get()
    const slot = state.tanks[tankIndex]
    if (!slot || slot.type !== 'breed') return // idempotent guard
    const host = state.slimes.find((s) => s.id === slot.hostId)
    if (!host) return // host not found — guard against corrupt state
    const offspring = breedSlimes(host, slot.donorSnapshot)
    const newTanks = state.tanks.map((t, i): TankSlot | null => (i === tankIndex ? null : t))
    const next = {
      ...state,
      slimes: [...state.slimes, offspring],
      tanks: newTanks,
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

  buyTankUpgrade() {
    const { gold, tankCount, tanks } = get()
    if (gold < TANK_UPGRADE_COST) return
    const next = {
      ...get(),
      gold: gold - TANK_UPGRADE_COST,
      tankCount: tankCount + 1,
      tanks: [...tanks, null],
    }
    set(next)
    persist(next)
  },

  assignToDisplay(slimeId: string, slotIndex: number) {
    const { slimes, displaySlots } = get()
    if (displaySlots[slotIndex] !== null) return
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
    const restoredSlime: Slime = { ...slot.slime }
    const newSlots = displaySlots.map((s, i) => (i === slotIndex ? null : s))
    const next = { ...get(), slimes: [...slimes, restoredSlime], displaySlots: newSlots }
    set(next)
    persist(next)
  },

  tickDisplayGold() {
    const state = get()
    const earned = state.displaySlots.reduce((acc, slot) => {
      if (!slot) return acc
      return acc + slot.slime.colorTier * slot.slime.shapeTier * DISPLAY_BASE_RATE
    }, 0)
    if (earned > 0) {
      const next = { ...state, gold: state.gold + earned }
      set(next)
      persist(next)
    }
  },

  async loadGame() {
    const saved = await db.gameState.get(1)
    if (!saved) return

    const now = Date.now()
    let gold = saved.gold

    // Credit accumulated display room income (idle game style)
    const displaySlots: Array<DisplaySlot | null> = (
      saved.displaySlots ?? Array(DISPLAY_SLOT_COUNT).fill(null)
    ).map((slot) => {
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
          variance: slot.slimeData.variance ?? 0,
        },
      }
    })

    const tanks: Array<TankSlot | null> = saved.tanks ?? [null]
    const tankCount = saved.tankCount ?? 1

    set({
      gold: Math.floor(gold),
      penCapacity: saved.penCapacity,
      tanks,
      tankCount,
      displaySlots,
      slimes: saved.slimes.map((s) => ({
        ...s,
        color: s.color as import('../types').SlimeColor,
        shape: s.shape as import('../types').SlimeShape,
        variance: s.variance ?? 0,
      })),
    })

    // Auto-resolve any expired tanks
    tanks.forEach((slot, i) => {
      if (slot && now - slot.startedAt >= HATCH_DURATION_MS) {
        if (slot.type === 'hatch') get().resolveHatch(i)
        else if (slot.type === 'breed') get().resolveBreed(i)
      }
    })
  },
}))
