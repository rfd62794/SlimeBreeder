export type SlimeColor = 'Red' | 'Blue' | 'Green'
export type SlimeShape = 'Blob' | 'Spiked' | 'Elongated'

// Corporate display names shown in UI chips
export const COLOR_DESIGNATIONS: Record<SlimeColor, string> = {
  Red: 'CHROMATIC_RED',
  Blue: 'CHROMATIC_BLUE',
  Green: 'CHROMATIC_GRN',
}

export const SHAPE_DESIGNATIONS: Record<SlimeShape, string> = {
  Blob: 'SPHEROID_v1',
  Spiked: 'CONICAL_v2',
  Elongated: 'ELONGATED_v3',
}

// Tailwind classes for the shape chip — mirrors Stitch's chip color logic:
// Green slimes → primary-container (neon green), Blue → secondary-container (cyan), Red → error-container (red)
export const COLOR_CHIP_CLASSES: Record<SlimeColor, string> = {
  Green: 'bg-primary-container text-on-primary-container',
  Blue: 'bg-secondary-container text-on-secondary-container',
  Red: 'bg-error-container text-on-error-container',
}

// Dark tinted background for the card image placeholder area
export const COLOR_BG_CLASSES: Record<SlimeColor, string> = {
  Green: 'bg-emerald-900/20',
  Blue: 'bg-blue-950/20',
  Red: 'bg-red-950/20',
}

// Glow color for the placeholder area (CSS inline style)
export const COLOR_GLOW: Record<SlimeColor, string> = {
  Green: 'rgba(0, 255, 65, 0.08)',
  Blue: 'rgba(0, 227, 253, 0.08)',
  Red: 'rgba(147, 0, 10, 0.08)',
}

export interface Slime {
  id: string
  color: SlimeColor
  shape: SlimeShape
  colorTier: number
  shapeTier: number
  variance: number
  actualValue: number
  createdAt: number
}
