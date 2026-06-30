import type { LineValue } from './domain/types'
import { YaoLine } from './YaoLine'

const DISPLAY_POSITIONS = [6, 5, 4, 3, 2, 1] as const
const POSITION_LABELS = ['初爻', '二爻', '三爻', '四爻', '五爻', '上爻'] as const

interface LineStackProps {
  lines: LineValue[]
}

export function LineStack({ lines }: LineStackProps) {
  return (
    <div className="line-stack" aria-label="六爻，从上爻到初爻显示">
      {DISPLAY_POSITIONS.map((position) => (
        <YaoLine
          key={position}
          label={POSITION_LABELS[position - 1]}
          line={lines[position - 1]}
          isNewest={position === lines.length}
        />
      ))}
      <p className="line-stack__hint">初爻起于下，依次向上成卦</p>
    </div>
  )
}
