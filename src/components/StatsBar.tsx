import { useGameStore } from '../store/gameStore'

export function StatsBar() {
  const gold = useGameStore((s) => s.gold)
  const slimes = useGameStore((s) => s.slimes)
  const penCapacity = useGameStore((s) => s.penCapacity)

  return (
    <section className="grid grid-cols-2 gap-0">
      <div className="bg-surface p-4 border-l-4 border-primary-container toxic-glow">
        <p className="text-on-surface-variant text-[10px] font-label uppercase tracking-widest mb-1">
          Current_Liquidity
        </p>
        <h2 className="text-xl font-headline font-black text-primary leading-none tracking-tight">
          GOLD_RESERVES: {gold}G
        </h2>
      </div>
      <div className="bg-surface p-4 border-l-4 border-secondary-container">
        <p className="text-on-surface-variant text-[10px] font-label uppercase tracking-widest mb-1">
          Structural_Integrity
        </p>
        <h2 className="text-xl font-headline font-black text-secondary leading-none tracking-tight">
          CONTAINMENT: {slimes.length}/{penCapacity}
        </h2>
      </div>
    </section>
  )
}
