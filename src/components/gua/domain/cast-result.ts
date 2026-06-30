import { HEXAGRAMS } from '../data/hexagrams'
import { resolveTrigram } from './cast-engine'
import type { CastRecord, CastResultViewModel, HexagramRecord, LineValue } from './types'

const POSITION_NAMES = ['', '初', '二', '三', '四', '五', '上'] as const

export function getLineLabel(value: LineValue, position: number): string {
  if (!Number.isInteger(position) || position < 1 || position > 6) {
    throw new RangeError('爻位必须在 1 到 6 之间')
  }

  const numeral = value === 7 || value === 9 ? '九' : '六'
  if (position === 1) return `初${numeral}`
  if (position === 6) return `上${numeral}`
  return `${numeral}${POSITION_NAMES[position]}`
}

function findHexagram(id: number): HexagramRecord {
  const hexagram = HEXAGRAMS.find((candidate) => candidate.id === id)
  if (!hexagram) throw new Error('卦象未成，资料库未能匹配')
  return hexagram
}

export function getCastResult(record: CastRecord): CastResultViewModel {
  const baseHexagram = findHexagram(record.base_hexagram_id)
  const changedHexagram = record.changed_hexagram_id === null
    ? null
    : findHexagram(record.changed_hexagram_id)
  const changingLineLabels = record.changing_lines.map((position) => (
    getLineLabel(record.line_values[position - 1], position)
  ))
  const keywords = baseHexagram.keywords.slice(0, 3).join('、')
  const hasChanging = record.changing_lines.length > 0
  const hasChanged = changedHexagram !== null

  const weather = hasChanging && hasChanged
    ? `动爻已现，"${baseHexagram.name}"将化为"${changedHexagram!.name}"。"${keywords}"之象，宜顺势而为；仅作今日气象参考，不构成现实决策。`
    : hasChanging
      ? `此卦有动爻，"${keywords}"之象，变化正在酝酿中；仅作今日气象参考，不构成现实决策。`
      : hasChanged
        ? `变卦已现，"${changedHexagram!.name}"为终局。"${keywords}"之象，宜从容观察；仅作今日气象参考，不构成现实决策。`
        : `这是一个"${keywords}"之象。此卦无动，主象稳定，宜静心观局；仅作今日气象参考，不构成现实决策。`
  return {
    record,
    baseHexagram,
    changedHexagram,
    upperTrigram: resolveTrigram(baseHexagram.upper_binary),
    lowerTrigram: resolveTrigram(baseHexagram.lower_binary),
    changingLineLabels,
    weather,
  }
}
