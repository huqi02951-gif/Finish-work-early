---
name: cluster-17
description: "Skill for the Cluster_17 area of Finish-work-early. 8 symbols across 1 files."
---

# Cluster_17

8 symbols | 1 files | Cohesion: 95%

## When to Use

- Working with code in `lib/`
- Understanding how todayKey, readRecords, writeRecords work
- Modifying cluster_17-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `lib/earnLossStore.ts` | todayKey, readRecords, writeRecords, getLastOvertimeRecord, append (+3) |

## Entry Points

Start here when exploring this area:

- **`todayKey`** (Function) — `lib/earnLossStore.ts:44`
- **`readRecords`** (Function) — `lib/earnLossStore.ts:48`
- **`writeRecords`** (Function) — `lib/earnLossStore.ts:58`
- **`getLastOvertimeRecord`** (Function) — `lib/earnLossStore.ts:66`
- **`append`** (Method) — `lib/earnLossStore.ts:118`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `todayKey` | Function | `lib/earnLossStore.ts` | 44 |
| `readRecords` | Function | `lib/earnLossStore.ts` | 48 |
| `writeRecords` | Function | `lib/earnLossStore.ts` | 58 |
| `getLastOvertimeRecord` | Function | `lib/earnLossStore.ts` | 66 |
| `append` | Method | `lib/earnLossStore.ts` | 118 |
| `recordOvertimeLoss` | Method | `lib/earnLossStore.ts` | 130 |
| `getToday` | Method | `lib/earnLossStore.ts` | 155 |
| `clearToday` | Method | `lib/earnLossStore.ts` | 188 |

## Execution Flows

| Flow | Type | Steps |
|------|------|-------|
| `OnCustom → TodayKey` | cross_community | 5 |
| `OnStorage → TodayKey` | cross_community | 5 |
| `RecordOvertimeLoss → TodayKey` | intra_community | 4 |

## How to Explore

1. `gitnexus_context({name: "todayKey"})` — see callers and callees
2. `gitnexus_query({query: "cluster_17"})` — find related execution flows
3. Read key files listed above for implementation details
