import { useId } from 'react'
import type { SlimeColor, SlimeShape } from '../types'

const SHAPE_PATHS: Record<SlimeShape, string> = {
  Blob: 'M50,15 C70,12 88,28 90,50 C92,72 75,88 50,88 C25,88 10,72 10,50 C10,28 30,18 50,15Z',
  Spiked: 'M50,10 L58,38 L88,38 L64,56 L72,84 L50,68 L28,84 L36,56 L12,38 L42,38Z',
  Elongated:
    'M50,8 C65,8 80,22 80,45 C80,65 68,82 55,90 C52,92 48,92 45,90 C32,82 20,65 20,45 C20,22 35,8 50,8Z',
}

const GRADIENT_CONFIG: Record<SlimeColor, { light: string; dark: string; glow: string }> = {
  Green: { light: '#a0ffa0', dark: '#003907', glow: 'rgba(0,255,65,0.4)' },
  Blue: { light: '#9ef0ff', dark: '#001f24', glow: 'rgba(0,227,253,0.4)' },
  Red: { light: '#ff9090', dark: '#3c0700', glow: 'rgba(255,65,54,0.4)' },
}

// Highlight ellipse position varies per shape
const HIGHLIGHT: Record<SlimeShape, { cx: number; cy: number }> = {
  Blob: { cx: 38, cy: 32 },
  Spiked: { cx: 40, cy: 35 },
  Elongated: { cx: 39, cy: 27 },
}

// Gradient focal point varies — Elongated is taller so the light source sits higher
const GRAD_FOCAL: Record<SlimeShape, { cy: string; r: string }> = {
  Blob: { cy: '33%', r: '65%' },
  Spiked: { cy: '33%', r: '65%' },
  Elongated: { cy: '28%', r: '60%' },
}

interface SlimeVisualProps {
  color: SlimeColor
  shape: SlimeShape
  size?: number
}

export function SlimeVisual({ color, shape, size = 80 }: SlimeVisualProps) {
  const uid = useId()
  const gradId = `${uid}-grad`
  const g = GRADIENT_CONFIG[color]
  const hl = HIGHLIGHT[shape]
  const focal = GRAD_FOCAL[shape]

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
      <defs>
        <radialGradient id={gradId} cx="38%" cy={focal.cy} r={focal.r}>
          <stop offset="0%" stopColor={g.light} />
          <stop offset="100%" stopColor={g.dark} />
        </radialGradient>
      </defs>

      {/* Body */}
      <path
        d={SHAPE_PATHS[shape]}
        fill={`url(#${gradId})`}
        style={{ filter: `drop-shadow(0 0 10px ${g.glow})` }}
      />

      {/* Spiked: soft inner mass */}
      {shape === 'Spiked' && (
        <circle cx={50} cy={52} r={14} fill={`${g.light}30`} data-core="" />
      )}

      {/* Elongated: drip accent at base */}
      {shape === 'Elongated' && (
        <path
          d="M50,85 C50,85 48,90 50,94 C52,90 50,85 50,85Z"
          fill={g.light}
          opacity={0.7}
          data-drip=""
        />
      )}

      {/* Highlight — gives depth illusion */}
      <ellipse
        cx={hl.cx}
        cy={hl.cy}
        rx={9}
        ry={5}
        fill="rgba(255,255,255,0.18)"
        transform={`rotate(-15,${hl.cx},${hl.cy})`}
      />
    </svg>
  )
}
