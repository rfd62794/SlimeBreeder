import { useGameStore } from '../store/gameStore'
import { COLOR_CHIP_CLASSES, SHAPE_DESIGNATIONS, COLOR_DESIGNATIONS } from '../types'
import { SlimeVisual } from './SlimeVisual'
import type { Slime } from '../types'

interface Props {
  onSelect: (slime: Slime) => void
  onClose: () => void
  excludeIds?: string[]  // slimes to hide (e.g. already selected in the other breed slot)
  title?: string
}

export function SlimePicker({ onSelect, onClose, excludeIds = [], title = 'SELECT_SPECIMEN' }: Props) {
  const slimes = useGameStore((s) => s.slimes).filter((s) => !excludeIds.includes(s.id))

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 flex items-end justify-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-surface-container-high pb-8"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-[10px] font-label text-on-surface-variant uppercase tracking-widest p-4 border-b border-outline-variant/20">
          {title}
        </p>

        {slimes.length === 0 ? (
          <p className="text-[11px] font-label text-on-surface-variant/50 uppercase tracking-widest p-6 text-center">
            No specimens available.
          </p>
        ) : (
          <ul className="divide-y divide-outline-variant/10">
            {slimes.map((slime) => (
              <li key={slime.id}>
                <button
                  onClick={() => { onSelect(slime); onClose() }}
                  className="w-full flex items-center gap-3 p-3 hover:bg-surface-container-highest transition-none text-left"
                >
                  <SlimeVisual color={slime.color} shape={slime.shape} size={40} />
                  <div className="flex-grow">
                    <span
                      className={`text-[10px] font-label font-bold uppercase px-2 py-0.5 ${COLOR_CHIP_CLASSES[slime.color]}`}
                    >
                      {COLOR_DESIGNATIONS[slime.color]}
                    </span>
                    <p className="text-[10px] text-on-surface-variant uppercase tracking-wider mt-1">
                      {SHAPE_DESIGNATIONS[slime.shape]}
                    </p>
                  </div>
                  <span className="text-sm font-headline font-bold text-primary">
                    {slime.actualValue}G
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
