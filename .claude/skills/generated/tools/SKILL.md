---
name: tools
description: "Skill for the Tools area of Finish-work-early. 182 symbols across 20 files."
---

# Tools

182 symbols | 20 files | Cohesion: 83%

## When to Use

- Working with code in `components/`
- Understanding how ToMyselfSpace, useToast, readLocalNumber work
- Modifying tools-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `components/tools/UnderInvoiceWorkflow.tsx` | formatWan, formatRate, finalBillWan, finalDepositWan, generateQuotaReservationEmail (+71) |
| `components/tools/CDUnfreezeTool.tsx` | parseYuanNumber, xmlEscape, formatCnDate, safeFilePart, downloadText (+21) |
| `components/tools/ToMyselfSpace.tsx` | loadNum, formatTime, SalaryMonitor, FocusTimer, FoodSelector (+16) |
| `components/tools/ChecklistGenerator.tsx` | updateField, updateBreakthroughReason, fieldClass, renderFieldError, renderBooleanSelect (+10) |
| `components/tools/AcceptanceCalculator.tsx` | AcceptanceCalculator, fmt, fmtWanValue, fmtPercent, toChineseUpper (+3) |
| `components/tools/BusinessGuide.tsx` | BusinessGuide, toggleSection, getDefaultSelectedId, getActiveContent, SidebarItem (+1) |
| `components/tools/FeeDiscountTool.tsx` | FeeDiscountTool, removeCompany, handleCompanyChange, toggleItem, downloadExcel (+1) |
| `lib/localSignals.ts` | readLocalNumber, writeLocalNumber, incrementLocalNumber, onStorage |
| `components/tools/BatchBillingTool.tsx` | BatchBillingTool, removeItem, updateItem |
| `src/pages/community/CommunityThread.tsx` | CommunityThreadPage, load, handleReply |

## Entry Points

Start here when exploring this area:

- **`ToMyselfSpace`** (Function) — `components/tools/ToMyselfSpace.tsx:1029`
- **`useToast`** (Function) — `src/components/common/Toast.tsx:60`
- **`readLocalNumber`** (Function) — `lib/localSignals.ts:14`
- **`writeLocalNumber`** (Function) — `lib/localSignals.ts:20`
- **`incrementLocalNumber`** (Function) — `lib/localSignals.ts:26`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `ToMyselfSpace` | Function | `components/tools/ToMyselfSpace.tsx` | 1029 |
| `useToast` | Function | `src/components/common/Toast.tsx` | 60 |
| `readLocalNumber` | Function | `lib/localSignals.ts` | 14 |
| `writeLocalNumber` | Function | `lib/localSignals.ts` | 20 |
| `incrementLocalNumber` | Function | `lib/localSignals.ts` | 26 |
| `onStorage` | Function | `lib/localSignals.ts` | 42 |
| `saveArtifact` | Function | `lib/localDB.ts` | 102 |
| `handleSave` | Function | `components/shared/ActionBar.tsx` | 118 |
| `getProductWorkspace` | Function | `content/productConfig.ts` | 182 |
| `sanitizeDataForProduct` | Function | `components/tools/checklist-generator/logic.ts` | 973 |
| `loadNum` | Function | `components/tools/ToMyselfSpace.tsx` | 70 |
| `formatTime` | Function | `components/tools/ToMyselfSpace.tsx` | 77 |
| `SalaryMonitor` | Function | `components/tools/ToMyselfSpace.tsx` | 118 |
| `FocusTimer` | Function | `components/tools/ToMyselfSpace.tsx` | 383 |
| `FoodSelector` | Function | `components/tools/ToMyselfSpace.tsx` | 729 |
| `EarnedTodayBadge` | Function | `components/tools/ToMyselfSpace.tsx` | 827 |
| `PaidPoopModule` | Function | `components/tools/ToMyselfSpace.tsx` | 850 |
| `TouchFishModule` | Function | `components/tools/ToMyselfSpace.tsx` | 917 |
| `CoffeeModule` | Function | `components/tools/ToMyselfSpace.tsx` | 973 |
| `BatchBillingTool` | Function | `components/tools/BatchBillingTool.tsx` | 26 |

## Execution Flows

| Flow | Type | Steps |
|------|------|-------|
| `ToMyselfSpace → TodayKey` | cross_community | 5 |
| `ToMyselfSpace → GetAuthSession` | cross_community | 5 |
| `ToMyselfSpace → WriteLocalNumber` | cross_community | 5 |
| `HandleTouchFish → LoadPetOsResources` | cross_community | 5 |
| `HandleDrinkCoffee → LoadPetOsResources` | cross_community | 5 |
| `ToMyselfSpace → ReadLocalNumber` | cross_community | 4 |
| `AcceptanceCalculator → Cn` | cross_community | 4 |
| `HandleTouchFish → BuildDefaultIdentity` | cross_community | 4 |
| `HandleTouchFish → BuildDefaultCooldown` | cross_community | 4 |
| `HandleDrinkCoffee → BuildDefaultIdentity` | cross_community | 4 |

## Connected Areas

| Area | Connections |
|------|-------------|
| Community | 24 calls |
| Cluster_3 | 2 calls |
| Pet | 2 calls |
| Pages | 1 calls |
| Checklist-generator | 1 calls |
| Services | 1 calls |

## How to Explore

1. `gitnexus_context({name: "ToMyselfSpace"})` — see callers and callees
2. `gitnexus_query({query: "tools"})` — find related execution flows
3. Read key files listed above for implementation details
