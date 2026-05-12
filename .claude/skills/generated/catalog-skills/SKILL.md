---
name: catalog-skills
description: "Skill for the Catalog-skills area of Finish-work-early. 11 symbols across 3 files."
---

# Catalog-skills

11 symbols | 3 files | Cohesion: 100%

## When to Use

- Working with code in `backend/`
- Understanding how validatePayload, createSkill, updateSkill work
- Modifying catalog-skills-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `backend/src/catalog-skills/catalog-skills.service.ts` | validatePayload, createSkill, updateSkill, listPublicSkills, getPublicSkill (+1) |
| `backend/src/catalog-skills/admin-skills.controller.ts` | createSkill, updateSkill, getSkills |
| `backend/src/catalog-skills/public-skills.controller.ts` | getSkills, getSkill |

## Entry Points

Start here when exploring this area:

- **`validatePayload`** (Method) — `backend/src/catalog-skills/catalog-skills.service.ts:20`
- **`createSkill`** (Method) — `backend/src/catalog-skills/catalog-skills.service.ts:123`
- **`updateSkill`** (Method) — `backend/src/catalog-skills/catalog-skills.service.ts:140`
- **`createSkill`** (Method) — `backend/src/catalog-skills/admin-skills.controller.ts:19`
- **`updateSkill`** (Method) — `backend/src/catalog-skills/admin-skills.controller.ts:24`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `validatePayload` | Method | `backend/src/catalog-skills/catalog-skills.service.ts` | 20 |
| `createSkill` | Method | `backend/src/catalog-skills/catalog-skills.service.ts` | 123 |
| `updateSkill` | Method | `backend/src/catalog-skills/catalog-skills.service.ts` | 140 |
| `createSkill` | Method | `backend/src/catalog-skills/admin-skills.controller.ts` | 19 |
| `updateSkill` | Method | `backend/src/catalog-skills/admin-skills.controller.ts` | 24 |
| `getSkills` | Method | `backend/src/catalog-skills/public-skills.controller.ts` | 8 |
| `listPublicSkills` | Method | `backend/src/catalog-skills/catalog-skills.service.ts` | 54 |
| `getSkill` | Method | `backend/src/catalog-skills/public-skills.controller.ts` | 13 |
| `getPublicSkill` | Method | `backend/src/catalog-skills/catalog-skills.service.ts` | 80 |
| `listAdminSkills` | Method | `backend/src/catalog-skills/catalog-skills.service.ts` | 102 |
| `getSkills` | Method | `backend/src/catalog-skills/admin-skills.controller.ts` | 14 |

## Execution Flows

| Flow | Type | Steps |
|------|------|-------|
| `CreateSkill → ValidatePayload` | intra_community | 3 |
| `UpdateSkill → ValidatePayload` | intra_community | 3 |

## How to Explore

1. `gitnexus_context({name: "validatePayload"})` — see callers and callees
2. `gitnexus_query({query: "catalog-skills"})` — find related execution flows
3. Read key files listed above for implementation details
