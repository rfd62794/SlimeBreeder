import { useGameStore } from '../store/gameStore'
import { COLOR_CHIP_CLASSES, SHAPE_DESIGNATIONS } from '../types'
import { SlimeVisual } from './SlimeVisual'
import type { Slime } from '../types'

interface Props {
  slime: Slime
}

export function SlimeCard({ slime }: Props) {
  const sellSlime = useGameStore((s) => s.sellSlime)

  return (
    <div className="bg-surface border-t-2 border-outline-variant/30 flex flex-col group">
      {/* Slime visual area */}
      <div className="h-24 flex items-center justify-center bg-surface-container-lowest relative">
        <SlimeVisual color={slime.color} shape={slime.shape} size={80} />
        <span
          className={`absolute top-2 right-2 px-2 py-0.5 text-[10px] font-label font-bold uppercase ${COLOR_CHIP_CLASSES[slime.color]}`}
        >
          {SHAPE_DESIGNATIONS[slime.shape]}
        </span>
      </div>

      {/* Card data */}
      <div className="p-3 flex items-center justify-between gap-2">
        <div>
          <span className="text-[10px] font-label text-on-surface-variant uppercase block">
            Unit_Value
          </span>
          <span className="text-xl font-headline font-bold text-primary">
            {slime.actualValue}G
          </span>
        </div>
        <button
          onClick={() => sellSlime(slime.id)}
          className="bg-surface-container-highest text-primary font-label text-[11px] py-2 px-4 hover:bg-surface-bright transition-none uppercase tracking-widest"
        >
          LIQUIDATE
        </button>
      </div>
    </div>
  )
}
