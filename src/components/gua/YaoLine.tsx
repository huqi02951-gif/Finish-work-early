import { isChanging, lineToBit } from './domain/cast-engine'
import type { LineValue } from './domain/types'

interface YaoLineProps {
  label: string
  line?: LineValue
  isNewest?: boolean
}

export function YaoLine({ label, line, isNewest = false }: YaoLineProps) {
  const isYang = line === undefined ? false : lineToBit(line) === 1
  const changing = line === undefined ? false : isChanging(line)

  return (
    <div
      className={`yao-row${line === undefined ? ' yao-row--empty' : ''}${isNewest ? ' yao-row--new' : ''}${changing ? ' yao-row--changing' : ''}`}
      aria-label={line === undefined ? `${label}尚未生成` : `${label}${isYang ? '阳爻' : '阴爻'}${changing ? '，动爻' : ''}`}
    >
      <span className="yao-row__label">{label}</span>
      <span className={`yao-line yao-line--${isYang ? 'yang' : 'yin'}`} aria-hidden="true">
        <span />
        {!isYang && <span />}
      </span>
      <span className="yao-row__marker">{changing ? '动' : ''}</span>
    </div>
  )
}
