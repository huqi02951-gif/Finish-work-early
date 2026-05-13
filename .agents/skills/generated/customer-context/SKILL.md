---
name: customer-context
description: "Skill for the Customer-context area of Finish-work-early. 10 symbols across 3 files."
---

# Customer-context

10 symbols | 3 files | Cohesion: 100%

## When to Use

- Working with code in `backend/`
- Understanding how create, update, remove work
- Modifying customer-context-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `backend/src/customer-context/customer-context.service.ts` | create, update, remove, normalizeOptionalText, listMine |
| `backend/src/customer-context/customer-context.controller.ts` | createContext, updateContext, deleteContext, getMyContexts |
| `backend/src/audit-log/audit-log.service.ts` | record |

## Entry Points

Start here when exploring this area:

- **`create`** (Method) — `backend/src/customer-context/customer-context.service.ts:41`
- **`update`** (Method) — `backend/src/customer-context/customer-context.service.ts:75`
- **`remove`** (Method) — `backend/src/customer-context/customer-context.service.ts:114`
- **`normalizeOptionalText`** (Method) — `backend/src/customer-context/customer-context.service.ts:145`
- **`createContext`** (Method) — `backend/src/customer-context/customer-context.controller.ts:16`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `create` | Method | `backend/src/customer-context/customer-context.service.ts` | 41 |
| `update` | Method | `backend/src/customer-context/customer-context.service.ts` | 75 |
| `remove` | Method | `backend/src/customer-context/customer-context.service.ts` | 114 |
| `normalizeOptionalText` | Method | `backend/src/customer-context/customer-context.service.ts` | 145 |
| `createContext` | Method | `backend/src/customer-context/customer-context.controller.ts` | 16 |
| `updateContext` | Method | `backend/src/customer-context/customer-context.controller.ts` | 34 |
| `deleteContext` | Method | `backend/src/customer-context/customer-context.controller.ts` | 53 |
| `record` | Method | `backend/src/audit-log/audit-log.service.ts` | 48 |
| `listMine` | Method | `backend/src/customer-context/customer-context.service.ts` | 22 |
| `getMyContexts` | Method | `backend/src/customer-context/customer-context.controller.ts` | 10 |

## Execution Flows

| Flow | Type | Steps |
|------|------|-------|
| `CreateContext → NormalizeOptionalText` | intra_community | 3 |
| `UpdateContext → NormalizeOptionalText` | intra_community | 3 |
| `DeleteContext → Record` | intra_community | 3 |

## How to Explore

1. `gitnexus_context({name: "create"})` — see callers and callees
2. `gitnexus_query({query: "customer-context"})` — find related execution flows
3. Read key files listed above for implementation details
