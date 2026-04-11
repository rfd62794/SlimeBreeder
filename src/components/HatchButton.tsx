import { useGameStore } from '../store/gameStore'
import { IncubationProgress } from './IncubationProgress'

export function HatchButton() {
  const startHatch = useGameStore((s) => s.startHatch)
  const slimes = useGameStore((s) => s.slimes)
  const penCapacity = useGameStore((s) => s.penCapacity)
  const hatchStartedAt = useGameStore((s) => s.hatchStartedAt)
  const isFull = slimes.length >= penCapacity

  if (hatchStartedAt !== null) {
    return <IncubationProgress />
  }

  return (
    <section className="bg-surface-container-high p-6 flex flex-col items-center">
      <button
        onClick={startHatch}
        disabled={isFull}
        className={`w-full font-headline font-black text-lg py-5 uppercase tracking-[0.2em] transition-none ${
          isFull
            ? 'bg-surface-container-highest text-on-surface-variant cursor-not-allowed'
            : 'bg-primary-container text-on-primary-container'
        }`}
      >
        {isFull ? 'CONTAINMENT_FULL' : 'INITIATE_INCUBATION'}
      </button>
      {isFull && (
        <p className="text-[10px] font-label text-outline-variant uppercase tracking-widest mt-2">
          Expand capacity to hatch additional specimens.
        </p>
      )}
    </section>
  )
}
