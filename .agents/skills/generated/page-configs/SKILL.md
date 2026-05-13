---
name: page-configs
description: "Skill for the Page-configs area of Finish-work-early. 13 symbols across 3 files."
---

# Page-configs

13 symbols | 3 files | Cohesion: 92%

## When to Use

- Working with code in `backend/`
- Understanding how validateConfig, upsertConfig, updateConfig work
- Modifying page-configs-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `backend/src/page-configs/page-configs.service.ts` | isRecord, assertString, assertStringArray, validateHomePageConfig, validateSkillsLibraryPageConfig (+5) |
| `backend/src/page-configs/admin-configs.controller.ts` | updateConfig, getConfig |
| `backend/src/page-configs/public-configs.controller.ts` | getConfig |

## Entry Points

Start here when exploring this area:

- **`validateConfig`** (Method) — `backend/src/page-configs/page-configs.service.ts:83`
- **`upsertConfig`** (Method) — `backend/src/page-configs/page-configs.service.ts:132`
- **`updateConfig`** (Method) — `backend/src/page-configs/admin-configs.controller.ts:19`
- **`getConfig`** (Method) — `backend/src/page-configs/public-configs.controller.ts:8`
- **`assertPageKey`** (Method) — `backend/src/page-configs/page-configs.service.ts:76`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `validateConfig` | Method | `backend/src/page-configs/page-configs.service.ts` | 83 |
| `upsertConfig` | Method | `backend/src/page-configs/page-configs.service.ts` | 132 |
| `updateConfig` | Method | `backend/src/page-configs/admin-configs.controller.ts` | 19 |
| `getConfig` | Method | `backend/src/page-configs/public-configs.controller.ts` | 8 |
| `assertPageKey` | Method | `backend/src/page-configs/page-configs.service.ts` | 76 |
| `getPublicConfig` | Method | `backend/src/page-configs/page-configs.service.ts` | 91 |
| `getAdminConfig` | Method | `backend/src/page-configs/page-configs.service.ts` | 107 |
| `getConfig` | Method | `backend/src/page-configs/admin-configs.controller.ts` | 14 |
| `isRecord` | Function | `backend/src/page-configs/page-configs.service.ts` | 7 |
| `assertString` | Function | `backend/src/page-configs/page-configs.service.ts` | 11 |
| `assertStringArray` | Function | `backend/src/page-configs/page-configs.service.ts` | 17 |
| `validateHomePageConfig` | Function | `backend/src/page-configs/page-configs.service.ts` | 23 |
| `validateSkillsLibraryPageConfig` | Function | `backend/src/page-configs/page-configs.service.ts` | 54 |

## Execution Flows

| Flow | Type | Steps |
|------|------|-------|
| `UpdateConfig → IsRecord` | intra_community | 5 |
| `UpdateConfig → AssertString` | intra_community | 5 |
| `UpdateConfig → AssertStringArray` | intra_community | 5 |
| `UpdateConfig → AssertPageKey` | cross_community | 3 |

## How to Explore

1. `gitnexus_context({name: "validateConfig"})` — see callers and callees
2. `gitnexus_query({query: "page-configs"})` — find related execution flows
3. Read key files listed above for implementation details
