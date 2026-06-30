import type { TrigramRecord } from '../domain/types'

export const TRIGRAMS: TrigramRecord[] = [
  { name: '乾', symbol: '☰', binary_bottom_to_top: '111', nature: '天', virtue: '健', meaning: '刚健、创造、主动、领导、权威、开端', shadow: '过刚、亢进、压迫、冒进' },
  { name: '兑', symbol: '☱', binary_bottom_to_top: '110', nature: '泽', virtue: '悦', meaning: '喜悦、沟通、口舌、交换、谈判、表达', shadow: '言过、轻浮、口舌、取悦过度' },
  { name: '离', symbol: '☲', binary_bottom_to_top: '101', nature: '火', virtue: '丽', meaning: '光明、显现、依附、文明、文书、名声', shadow: '虚火、外显过度、依附不稳' },
  { name: '震', symbol: '☳', binary_bottom_to_top: '100', nature: '雷', virtue: '动', meaning: '启动、震动、突发、行动、惊醒', shadow: '惊惧、躁动、冒失、冲动' },
  { name: '巽', symbol: '☴', binary_bottom_to_top: '011', nature: '风', virtue: '入', meaning: '渗透、进入、沟通、文书、谋划、柔进', shadow: '犹疑、软弱、反复、无主见' },
  { name: '坎', symbol: '☵', binary_bottom_to_top: '010', nature: '水', virtue: '险', meaning: '风险、险陷、流动、隐忧、智慧、规则缝隙', shadow: '陷落、反复、暗险、恐惧' },
  { name: '艮', symbol: '☶', binary_bottom_to_top: '001', nature: '山', virtue: '止', meaning: '停止、边界、阻隔、稳定、守住', shadow: '停滞、僵硬、固执、卡死' },
  { name: '坤', symbol: '☷', binary_bottom_to_top: '000', nature: '地', virtue: '顺', meaning: '承载、包容、执行、资源、稳定、厚德', shadow: '被动、无边界、迟缓、依赖' },
]

export const TRIGRAM_BY_BINARY = new Map(
  TRIGRAMS.map((trigram) => [trigram.binary_bottom_to_top, trigram]),
)
