import { HEXAGRAM_BY_BITS } from '../data/hexagrams'
import { TRIGRAM_BY_BINARY } from '../data/trigrams'
import type { CastResolution, HexagramRecord, LineValue, TrigramRecord } from './types'

export function lineToBit(value: LineValue): 0 | 1 {
  return value === 6 || value === 8 ? 0 : 1
}

export function isChanging(value: LineValue): boolean {
  return value === 6 || value === 9
}

export function changeLine(value: LineValue): 0 | 1 {
  const bit = lineToBit(value)
  return isChanging(value) ? (bit === 1 ? 0 : 1) : bit
}

export function getBaseBits(lines: LineValue[]): (0 | 1)[] {
  return lines.map(lineToBit)
}

export function getChangedBits(lines: LineValue[]): (0 | 1)[] {
  return lines.map(changeLine)
}

export function getChangingLinePositions(lines: LineValue[]): number[] {
  return lines.flatMap((value, index) => (isChanging(value) ? [index + 1] : []))
}

export function resolveHexagramByBits(bits: (0 | 1)[]): HexagramRecord {
  if (bits.length !== 6) throw new Error('一卦必须恰有六爻')

  const hexagram = HEXAGRAM_BY_BITS.get(bits.join(''))
  if (!hexagram) throw new Error('卦象未成，资料库未能匹配')
  return hexagram
}

export function resolveTrigram(binaryBottomToTop: string): TrigramRecord {
  const trigram = TRIGRAM_BY_BINARY.get(binaryBottomToTop)
  if (!trigram) throw new Error('卦象未成，资料库未能匹配')
  return trigram
}

export function resolveCast(lines: LineValue[]): CastResolution {
  if (lines.length !== 6) throw new Error('一卦必须恰有六爻')

  const baseBits = getBaseBits(lines)
  const baseHexagram = resolveHexagramByBits(baseBits)
  const changingLines = getChangingLinePositions(lines)
  const changedBits = getChangedBits(lines)
  const changedHexagram = changingLines.length > 0
    ? resolveHexagramByBits(changedBits)
    : null
  const specialRule = lines.every((line) => line === 9)
    ? '用九'
    : lines.every((line) => line === 6)
      ? '用六'
      : null

  return {
    record: {
      line_values: [...lines],
      base_bits: baseBits,
      changed_bits: changedBits,
      base_hexagram_id: baseHexagram.id,
      changing_lines: changingLines,
      changed_hexagram_id: changedHexagram?.id ?? null,
      special_rule: specialRule,
    },
    baseHexagram,
    changedHexagram,
  }
}
