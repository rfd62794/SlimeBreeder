import { useGameStore } from '../store/gameStore'
import { IncubationProgress } from './IncubationProgress'
import type { HatchTankSlot } from '../db/db'

export function HatchButton() {
  const startHatch = useGameStore((s) => s.startHatch)
  const resolveHatch = useGameStore((s) => s.resolveHatch)
  const slimes = useGameStore((s) => s.slimes)
  const penCapacity = useGameStore((s) => s.penCapacity)
  const tanks = useGameStore((s) => s.tanks)

  const isFull = slimes.length >= penCapacity
  const allOccupied = tanks.every((t) => t !== null)

  // Show the first active hatch tank in CHAMBER (breed tanks shown in MUTATE)
  const activeHatchIndex = tanks.findIndex((t) => t !== null && t.type === 'hatch')

  if (activeHatchIndex !== -1) {
    const slot = tanks[activeHatchIndex] as HatchTankSlot
    return (
      <IncubationProgress
        startedAt={slot.startedAt}
        onComplete={() => resolveHatch(activeHatchIndex)}
      />
    )
  }

  return (
    <section className="bg-surface-container-high p-6 flex flex-col items-center">
      <button
        onClick={() => startHatch()}
        disabled={isFull || allOccupied}
        className={`w-full font-headline font-black text-lg py-5 uppercase tracking-[0.2em] transition-none ${
          isFull || allOccupied
            ? 'bg-surface-container-highest text-on-surface-variant cursor-not-allowed'
            : 'bg-primary-container text-on-primary-container'
        }`}
      >
        {isFull
          ? 'CONTAINMENT_FULL'
          : allOccupied
            ? 'ALL_TANKS_OCCUPIED'
            : 'INITIATE_INCUBATION'}
      </button>
      {isFull && (
        <p className="text-[10px] font-label text-outline-variant uppercase tracking-widest mt-2">
          Expand capacity to hatch additional specimens.
        </p>
      )}
    </section>
  )
}
