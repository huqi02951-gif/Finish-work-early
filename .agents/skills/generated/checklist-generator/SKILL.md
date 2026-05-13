---
name: checklist-generator
description: "Skill for the Checklist-generator area of Finish-work-early. 41 symbols across 2 files."
---

# Checklist-generator

41 symbols | 2 files | Cohesion: 77%

## When to Use

- Working with code in `components/`
- Understanding how validateGeneratorData, buildCreditPlanWordDoc, buildChecklistArtifacts work
- Modifying checklist-generator-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `components/tools/checklist-generator/logic.ts` | overrideOr, normalizeRating, formatPercent, buildBreakthroughSuffix, buildMissing (+32) |
| `components/tools/ChecklistGenerator.tsx` | handleDownloadChecklist, handleDownloadCreditPlan, handleDownloadAll, artifacts |

## Entry Points

Start here when exploring this area:

- **`validateGeneratorData`** (Function) — `components/tools/checklist-generator/logic.ts:996`
- **`buildCreditPlanWordDoc`** (Function) — `components/tools/checklist-generator/logic.ts:1220`
- **`buildChecklistArtifacts`** (Function) — `components/tools/checklist-generator/logic.ts:939`
- **`buildChecklistWordDoc`** (Function) — `components/tools/checklist-generator/logic.ts:1163`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `validateGeneratorData` | Function | `components/tools/checklist-generator/logic.ts` | 996 |
| `buildCreditPlanWordDoc` | Function | `components/tools/checklist-generator/logic.ts` | 1220 |
| `buildChecklistArtifacts` | Function | `components/tools/checklist-generator/logic.ts` | 939 |
| `buildChecklistWordDoc` | Function | `components/tools/checklist-generator/logic.ts` | 1163 |
| `overrideOr` | Function | `components/tools/checklist-generator/logic.ts` | 304 |
| `normalizeRating` | Function | `components/tools/checklist-generator/logic.ts` | 309 |
| `formatPercent` | Function | `components/tools/checklist-generator/logic.ts` | 332 |
| `buildBreakthroughSuffix` | Function | `components/tools/checklist-generator/logic.ts` | 337 |
| `buildMissing` | Function | `components/tools/checklist-generator/logic.ts` | 342 |
| `buildPass` | Function | `components/tools/checklist-generator/logic.ts` | 346 |
| `buildFail` | Function | `components/tools/checklist-generator/logic.ts` | 350 |
| `requireChoice` | Function | `components/tools/checklist-generator/logic.ts` | 354 |
| `parseDateInput` | Function | `components/tools/checklist-generator/logic.ts` | 361 |
| `formatChineseDate` | Function | `components/tools/checklist-generator/logic.ts` | 375 |
| `yearsBetween` | Function | `components/tools/checklist-generator/logic.ts` | 388 |
| `parseTermMonths` | Function | `components/tools/checklist-generator/logic.ts` | 395 |
| `evaluateAccessRow` | Function | `components/tools/checklist-generator/logic.ts` | 424 |
| `evaluateSpecialRow` | Function | `components/tools/checklist-generator/logic.ts` | 520 |
| `evaluateOver300Row` | Function | `components/tools/checklist-generator/logic.ts` | 626 |
| `evaluateSchemeRow` | Function | `components/tools/checklist-generator/logic.ts` | 732 |

## Execution Flows

| Flow | Type | Steps |
|------|------|-------|
| `HandleDownloadCreditPlan → BuildPass` | cross_community | 6 |
| `HandleDownloadCreditPlan → NormalizeRating` | cross_community | 6 |
| `HandleDownloadAll → ParseAmount` | cross_community | 5 |
| `HandleDownloadAll → PrimaryCreditAmountText` | cross_community | 5 |
| `HandleDownloadChecklist → ParseAmount` | cross_community | 5 |
| `HandleDownloadChecklist → PrimaryCreditAmountText` | cross_community | 5 |
| `HandleDownloadCreditPlan → ParseAmount` | cross_community | 5 |
| `HandleDownloadCreditPlan → PrimaryCreditAmountText` | cross_community | 5 |
| `BuildChecklistWordDoc → BuildPass` | cross_community | 5 |
| `BuildChecklistWordDoc → NormalizeRating` | cross_community | 5 |

## How to Explore

1. `gitnexus_context({name: "validateGeneratorData"})` — see callers and callees
2. `gitnexus_query({query: "checklist-generator"})` — find related execution flows
3. Read key files listed above for implementation details
