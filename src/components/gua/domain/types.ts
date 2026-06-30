export type TrigramName = '乾' | '兑' | '离' | '震' | '巽' | '坎' | '艮' | '坤'

export type LineValue = 6 | 7 | 8 | 9
export type CastMethod = 'yarrow' | 'coins'

export type GameState =
  | 'idle'
  | 'casting'
  | 'line_1_done'
  | 'line_2_done'
  | 'line_3_done'
  | 'line_4_done'
  | 'line_5_done'
  | 'line_6_done'
  | 'revealing'
  | 'result'
  | 'saved'
  | 'error'

export interface TrigramRecord {
  name: TrigramName
  symbol: string
  binary_bottom_to_top: string
  nature: string
  virtue: string
  meaning: string
  shadow: string
}

export interface HexagramRecord {
  id: number
  name: string
  unicode: string
  upper_trigram: TrigramName
  lower_trigram: TrigramName
  upper_image: string
  lower_image: string
  upper_binary: string
  lower_binary: string
  binary_bottom_to_top: string
  whole_image: string
  keywords: string[]
}

export interface CastSession {
  id: string
  method: CastMethod
  line_values: LineValue[]
  created_at: string
}

export interface CastResolutionRecord {
  line_values: LineValue[]
  base_bits: (0 | 1)[]
  changed_bits: (0 | 1)[]
  base_hexagram_id: number
  changing_lines: number[]
  changed_hexagram_id: number | null
  special_rule: '用九' | '用六' | null
}

export interface CastRecord extends CastResolutionRecord {
  id: string
  method: CastMethod
  created_at: string
}

export interface CastResolution {
  record: CastResolutionRecord
  baseHexagram: HexagramRecord
  changedHexagram: HexagramRecord | null
}

export interface CastResultViewModel {
  record: CastRecord
  baseHexagram: HexagramRecord
  changedHexagram: HexagramRecord | null
  upperTrigram: TrigramRecord
  lowerTrigram: TrigramRecord
  changingLineLabels: string[]
  weather: string
}

export interface SavedCast {
  cast: CastRecord
  base_hexagram: HexagramRecord
  changed_hexagram?: HexagramRecord
  weather: string
  saved_at: string
}
