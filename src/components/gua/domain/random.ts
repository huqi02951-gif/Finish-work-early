import type { CastMethod, LineValue } from './types'

const UINT32_RANGE = 0x1_0000_0000

export function randomInt(maxExclusive: number): number {
  if (!Number.isSafeInteger(maxExclusive) || maxExclusive <= 0 || maxExclusive > UINT32_RANGE) {
    throw new RangeError('maxExclusive 必须是 1 到 2^32 之间的正整数')
  }

  const sample = new Uint32Array(1)
  const limit = Math.floor(UINT32_RANGE / maxExclusive) * maxExclusive
  let value: number

  do {
    crypto.getRandomValues(sample)
    value = sample[0]
  } while (value >= limit)

  return value % maxExclusive
}

export function castYarrowLine(): LineValue {
  const value = randomInt(16)
  if (value === 0) return 6
  if (value <= 5) return 7
  if (value <= 12) return 8
  return 9
}

export function castCoinLine(): LineValue {
  let total = 0
  for (let coin = 0; coin < 3; coin += 1) {
    total += randomInt(2) === 1 ? 3 : 2
  }
  return total as LineValue
}

export function castOneLine(method: CastMethod): LineValue {
  return method === 'yarrow' ? castYarrowLine() : castCoinLine()
}
