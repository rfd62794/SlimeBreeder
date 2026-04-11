import { useEffect, useState } from 'react'
import { useGameStore } from '../store/gameStore'
import { HATCH_DURATION_MS } from '../config'

export function IncubationProgress() {
  const hatchStartedAt = useGameStore((s) => s.hatchStartedAt)
  const resolveHatch = useGameStore((s) => s.resolveHatch)
  const [pct, setPct] = useState(0)
  const [secsLeft, setSecsLeft] = useState(Math.ceil(HATCH_DURATION_MS / 1000))

  useEffect(() => {
    const id = setInterval(() => {
      const elapsed = Date.now() - (hatchStartedAt ?? Date.now())
      const p = Math.min(elapsed / HATCH_DURATION_MS, 1)
      setPct(p)
      setSecsLeft(Math.max(0, Math.ceil((HATCH_DURATION_MS - elapsed) / 1000)))
      if (p >= 1) {
        clearInterval(id) // stop the ticker before resolving — prevents multi-fire before re-render
        resolveHatch()    // resolveHatch() also guards hatchStartedAt !== null, so double-call is safe
      }
    }, 100)
    return () => clearInterval(id)
  }, [hatchStartedAt, resolveHatch])

  return (
    <section className="bg-surface-container-high p-6">
      <p className="text-[10px] font-label text-on-surface-variant uppercase tracking-widest mb-2">
        INCUBATING_EGG — {secsLeft}s
      </p>
      <div className="w-full bg-surface-container-highest h-5">
        <div
          className="h-full bg-primary-container"
          style={{ width: `${(pct * 100).toFixed(1)}%` }}
        />
      </div>
    </section>
  )
}
