import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { SlimeVisual } from '../components/SlimeVisual'
import type { SlimeColor, SlimeShape } from '../types'

const COLORS: SlimeColor[] = ['Green', 'Blue', 'Red']
const SHAPES: SlimeShape[] = ['Blob', 'Spiked', 'Elongated']

describe('SlimeVisual', () => {
  it.each(
    COLORS.flatMap((c) => SHAPES.map((s) => [c, s] as [SlimeColor, SlimeShape])),
  )('renders %s %s without throwing', (color, shape) => {
    const { container } = render(<SlimeVisual color={color} shape={shape} />)
    expect(container.querySelector('svg')).not.toBeNull()
  })

  it('two same-variant instances have different gradient ids', () => {
    const { container } = render(
      <>
        <SlimeVisual color="Green" shape="Blob" />
        <SlimeVisual color="Green" shape="Blob" />
      </>,
    )
    const gradients = container.querySelectorAll('radialGradient')
    expect(gradients).toHaveLength(2)
    const [id1, id2] = Array.from(gradients).map((g) => g.id)
    expect(id1).not.toBe(id2)
  })

  it('Elongated renders a drip element', () => {
    const { container } = render(<SlimeVisual color="Blue" shape="Elongated" />)
    expect(container.querySelector('[data-drip]')).not.toBeNull()
  })

  it('Spiked renders an inner core circle', () => {
    const { container } = render(<SlimeVisual color="Red" shape="Spiked" />)
    expect(container.querySelector('[data-core]')).not.toBeNull()
  })
})
