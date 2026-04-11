import { useGameStore } from '../store/gameStore'
import { IncubationProgress } from './IncubationProgress'
import { SlimeVisual } from './SlimeVisual'
import type { BreedTankSlot } from '../db/db'
import type { SlimeColor, SlimeShape } from '../types'

interface Props {
  tankIndex: number
  onBreedClick: () => void  // scrolls to BreedingPanel; does not start a breed
}

export function TankCard({ tankIndex, onBreedClick }: Props) {
  const slot = useGameStore((s) => s.tanks[tankIndex])
  const startHatch = useGameStore((s) => s.startHatch)
  const resolveHatch = useGameStore((s) => s.resolveHatch)
  const resolveBreed = useGameStore((s) => s.resolveBreed)
  const slimes = useGameStore((s) => s.slimes)
  const penCapacity = useGameStore((s) => s.penCapacity)
  const isFull = slimes.length >= penCapacity

  // ── Empty slot ────────────────────────────────────────────────
  if (slot === null) {
    return (
      <div className="bg-surface-container border border-outline-variant/20 p-3 flex items-center gap-2">
        <span className="text-[10px] font-label text-on-surface-variant uppercase tracking-widest flex-grow">
          TANK_{tankIndex + 1} — IDLE
        </span>
        <button
          onClick={() => startHatch(tankIndex)}
          disabled={isFull}
          className="text-[11px] font-label py-2 px-4 uppercase tracking-widest bg-primary-container text-on-primary-container disabled:opacity-40 disabled:cursor-not-allowed"
        >
          HATCH
        </button>
        <button
          onClick={onBreedClick}
          className="text-[11px] font-label py-2 px-4 uppercase tracking-widest bg-surface-container-highest text-primary"
        >
          BREED
        </button>
      </div>
    )
  }

  // ── Hatch in progress ─────────────────────────────────────────
  if (slot.type === 'hatch') {
    return (
      <IncubationProgress
        startedAt={slot.startedAt}
        onComplete={() => resolveHatch(tankIndex)}
        label={`TANK_${tankIndex + 1} — HATCH_IN_PROGRESS`}
      />
    )
  }

  // ── Breed in progress ─────────────────────────────────────────
  const breedSlot = slot as BreedTankSlot
  return (
    <div className="bg-surface-container-high border border-outline-variant/20">
      <div className="flex items-center gap-3 p-3 pb-0">
        <SlimeVisual
          color={breedSlot.donorSnapshot.color as SlimeColor}
          shape={breedSlot.donorSnapshot.shape as SlimeShape}
          size={32}
        />
        <span className="text-on-surface-variant text-xs font-headline">×</span>
        <HostVisual hostId={breedSlot.hostId} />
        <span className="ml-auto text-[10px] font-label text-on-surface-variant uppercase tracking-widest">
          TANK_{tankIndex + 1}
        </span>
      </div>
      <IncubationProgress
        startedAt={breedSlot.startedAt}
        onComplete={() => resolveBreed(tankIndex)}
        label="BREED_IN_PROGRESS"
      />
    </div>
  )
}

/** Looks up the host slime by id from the live store for its visual. */
function HostVisual({ hostId }: { hostId: string }) {
  const host = useGameStore((s) => s.slimes.find((sl) => sl.id === hostId))
  if (!host) return null
  return <SlimeVisual color={host.color} shape={host.shape} size={32} />
}
