---
name: cluster-18
description: "Skill for the Cluster_18 area of Finish-work-early. 8 symbols across 1 files."
---

# Cluster_18

8 symbols | 1 files | Cohesion: 93%

## When to Use

- Working with code in `lib/`
- Understanding how summarize, emit, onCustom work
- Modifying cluster_18-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `lib/earnLossStore.ts` | summarize, getTodaySummary, getTodayEarnTotal, getTodayLossTotal, getTodayOvertimeLossTotal (+3) |

## Entry Points

Start here when exploring this area:

- **`summarize`** (Function) — `lib/earnLossStore.ts:77`
- **`emit`** (Function) — `lib/earnLossStore.ts:177`
- **`onCustom`** (Function) — `lib/earnLossStore.ts:178`
- **`onStorage`** (Function) — `lib/earnLossStore.ts:179`
- **`getTodaySummary`** (Method) — `lib/earnLossStore.ts:159`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `summarize` | Function | `lib/earnLossStore.ts` | 77 |
| `emit` | Function | `lib/earnLossStore.ts` | 177 |
| `onCustom` | Function | `lib/earnLossStore.ts` | 178 |
| `onStorage` | Function | `lib/earnLossStore.ts` | 179 |
| `getTodaySummary` | Method | `lib/earnLossStore.ts` | 159 |
| `getTodayEarnTotal` | Method | `lib/earnLossStore.ts` | 163 |
| `getTodayLossTotal` | Method | `lib/earnLossStore.ts` | 167 |
| `getTodayOvertimeLossTotal` | Method | `lib/earnLossStore.ts` | 172 |

## Execution Flows

| Flow | Type | Steps |
|------|------|-------|
| `OnCustom → TodayKey` | cross_community | 5 |
| `OnStorage → TodayKey` | cross_community | 5 |
| `OnCustom → Summarize` | intra_community | 4 |
| `OnStorage → Summarize` | intra_community | 4 |

## Connected Areas

| Area | Connections |
|------|-------------|
| Cluster_17 | 1 calls |

## How to Explore

1. `gitnexus_context({name: "summarize"})` — see callers and callees
2. `gitnexus_query({query: "cluster_18"})` — find related execution flows
3. Read key files listed above for implementation details
