import { useEffect, useState } from 'react'
import { useGameStore } from '../store/gameStore'
import { DISPLAY_BASE_RATE } from '../config'
import { COLOR_CHIP_CLASSES, SHAPE_DESIGNATIONS } from '../types'
import { SlimeVisual } from './SlimeVisual'
import { DisplaySlotPicker } from './DisplaySlotPicker'

function slotGoldPerSec(colorTier: number, shapeTier: number) {
  return colorTier * shapeTier * DISPLAY_BASE_RATE
}

export function DisplayRooms() {
  const displaySlots = useGameStore((s) => s.displaySlots)
  const unassignFromDisplay = useGameStore((s) => s.unassignFromDisplay)
  const [pickerSlot, setPickerSlot] = useState<number | null>(null)

  // Live gold ticker — reads fresh state each tick to avoid stale closure
  useEffect(() => {
    const id = setInterval(() => {
      const state = useGameStore.getState()
      const earned = state.displaySlots.reduce((acc, slot) => {
        if (!slot) return acc
        return acc + slotGoldPerSec(slot.slime.colorTier, slot.slime.shapeTier)
      }, 0)
      if (earned > 0) {
        useGameStore.setState((s) => ({ gold: s.gold + earned }))
      }
    }, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <>
      <section className="bg-surface-container p-4">
        <p className="text-[10px] font-label text-on-surface-variant uppercase tracking-widest mb-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-[14px]">museum</span>
          DISPLAY_CHAMBER
        </p>

        <div className="grid grid-cols-2 gap-2">
          {displaySlots.map((slot, i) => (
            <div
              key={i}
              className="bg-surface-container-high border border-outline-variant/20 flex flex-col items-center p-3 gap-2 min-h-[120px] justify-center"
            >
              {slot ? (
                <>
                  <SlimeVisual color={slot.slime.color} shape={slot.slime.shape} size={48} />
                  <span
                    className={`text-[9px] font-label font-bold uppercase px-2 py-0.5 ${COLOR_CHIP_CLASSES[slot.slime.color]}`}
                  >
                    {SHAPE_DESIGNATIONS[slot.slime.shape]}
                  </span>
                  <span className="text-[10px] font-label text-on-surface-variant uppercase">
                    +{slotGoldPerSec(slot.slime.colorTier, slot.slime.shapeTier).toFixed(1)}G/s
                  </span>
                  <button
                    onClick={() => unassignFromDisplay(i)}
                    className="text-[9px] font-label uppercase tracking-widest text-on-surface-variant/60 hover:text-on-surface transition-none"
                  >
                    RETRIEVE
                  </button>
                </>
              ) : (
                <>
                  <span className="text-[10px] font-label text-on-surface-variant/30 uppercase tracking-widest">
                    SLOT_{i + 1}_EMPTY
                  </span>
                  <button
                    onClick={() => setPickerSlot(i)}
                    className="text-[10px] font-label uppercase tracking-widest bg-surface-container-highest text-on-surface px-3 py-1.5 hover:bg-surface-bright transition-none"
                  >
                    ASSIGN
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      </section>

      {pickerSlot !== null && (
        <DisplaySlotPicker slotIndex={pickerSlot} onClose={() => setPickerSlot(null)} />
      )}
    </>
  )
}
