---
name: tool-data
description: "Skill for the Tool-data area of Finish-work-early. 18 symbols across 4 files."
---

# Tool-data

18 symbols | 4 files | Cohesion: 100%

## When to Use

- Working with code in `backend/`
- Understanding how getOne, remove, getOne work
- Modifying tool-data-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `backend/src/tool-data/draft.service.ts` | getOne, remove, upsert, requireText, requireJsonValue (+1) |
| `backend/src/tool-data/artifact.service.ts` | create, requireText, requireContent, listMine, remove |
| `backend/src/tool-data/draft.controller.ts` | getOne, remove, upsert, listMine |
| `backend/src/tool-data/artifact.controller.ts` | create, listMine, remove |

## Entry Points

Start here when exploring this area:

- **`getOne`** (Method) — `backend/src/tool-data/draft.service.ts:25`
- **`remove`** (Method) — `backend/src/tool-data/draft.service.ts:76`
- **`getOne`** (Method) — `backend/src/tool-data/draft.controller.ts:16`
- **`remove`** (Method) — `backend/src/tool-data/draft.controller.ts:36`
- **`upsert`** (Method) — `backend/src/tool-data/draft.service.ts:41`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `getOne` | Method | `backend/src/tool-data/draft.service.ts` | 25 |
| `remove` | Method | `backend/src/tool-data/draft.service.ts` | 76 |
| `getOne` | Method | `backend/src/tool-data/draft.controller.ts` | 16 |
| `remove` | Method | `backend/src/tool-data/draft.controller.ts` | 36 |
| `upsert` | Method | `backend/src/tool-data/draft.service.ts` | 41 |
| `requireText` | Method | `backend/src/tool-data/draft.service.ts` | 89 |
| `requireJsonValue` | Method | `backend/src/tool-data/draft.service.ts` | 100 |
| `upsert` | Method | `backend/src/tool-data/draft.controller.ts` | 22 |
| `create` | Method | `backend/src/tool-data/artifact.service.ts` | 29 |
| `requireText` | Method | `backend/src/tool-data/artifact.service.ts` | 70 |
| `requireContent` | Method | `backend/src/tool-data/artifact.service.ts` | 81 |
| `create` | Method | `backend/src/tool-data/artifact.controller.ts` | 24 |
| `listMine` | Method | `backend/src/tool-data/draft.service.ts` | 14 |
| `listMine` | Method | `backend/src/tool-data/draft.controller.ts` | 10 |
| `listMine` | Method | `backend/src/tool-data/artifact.service.ts` | 15 |
| `listMine` | Method | `backend/src/tool-data/artifact.controller.ts` | 10 |
| `remove` | Method | `backend/src/tool-data/artifact.service.ts` | 46 |
| `remove` | Method | `backend/src/tool-data/artifact.controller.ts` | 39 |

## Execution Flows

| Flow | Type | Steps |
|------|------|-------|
| `Upsert → RequireText` | intra_community | 3 |
| `Upsert → RequireJsonValue` | intra_community | 3 |
| `Remove → GetOne` | intra_community | 3 |
| `Create → RequireText` | intra_community | 3 |
| `Create → RequireContent` | intra_community | 3 |

## How to Explore

1. `gitnexus_context({name: "getOne"})` — see callers and callees
2. `gitnexus_query({query: "tool-data"})` — find related execution flows
3. Read key files listed above for implementation details
