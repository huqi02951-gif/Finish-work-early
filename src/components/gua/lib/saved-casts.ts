import type { CastResultViewModel, SavedCast } from '../domain/types'

const STORAGE_KEY = 'apex-suan-gua:saved-casts:v1'

export const MAX_SAVED_CASTS = 100

function writeSavedCasts(casts: SavedCast[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(casts))
  } catch {
    throw new Error('卦匣暂时无法使用，请检查浏览器存储设置')
  }
}

export function loadSavedCasts(): SavedCast[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed as SavedCast[] : []
  } catch {
    return []
  }
}

export function saveCast(result: CastResultViewModel): SavedCast[] {
  const current = loadSavedCasts()
  if (current.some(({ cast }) => cast.id === result.record.id)) return current

  const saved: SavedCast = {
    cast: result.record,
    base_hexagram: result.baseHexagram,
    ...(result.changedHexagram ? { changed_hexagram: result.changedHexagram } : {}),
    weather: result.weather,
    saved_at: new Date().toISOString(),
  }
  const next = [saved, ...current].slice(0, MAX_SAVED_CASTS)
  writeSavedCasts(next)
  return next
}

export function deleteSavedCast(id: string): SavedCast[] {
  const next = loadSavedCasts().filter(({ cast }) => cast.id !== id)
  writeSavedCasts(next)
  return next
}
