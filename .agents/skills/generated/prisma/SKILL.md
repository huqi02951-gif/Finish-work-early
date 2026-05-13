---
name: prisma
description: "Skill for the Prisma area of Finish-work-early. 14 symbols across 1 files."
---

# Prisma

14 symbols | 1 files | Cohesion: 100%

## When to Use

- Working with code in `backend/`
- Understanding how toJsonValue, slugifyTag, seedAdmin work
- Modifying prisma-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `backend/prisma/seed.js` | toJsonValue, slugifyTag, seedAdmin, seedForumBoards, seedForumTags (+9) |

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `toJsonValue` | Function | `backend/prisma/seed.js` | 24 |
| `slugifyTag` | Function | `backend/prisma/seed.js` | 35 |
| `seedAdmin` | Function | `backend/prisma/seed.js` | 42 |
| `seedForumBoards` | Function | `backend/prisma/seed.js` | 64 |
| `seedForumTags` | Function | `backend/prisma/seed.js` | 164 |
| `syncPostTags` | Function | `backend/prisma/seed.js` | 198 |
| `seedForumOfficialPosts` | Function | `backend/prisma/seed.js` | 235 |
| `seedForumSamplePosts` | Function | `backend/prisma/seed.js` | 329 |
| `seedBBSPosts` | Function | `backend/prisma/seed.js` | 462 |
| `seedPageConfigs` | Function | `backend/prisma/seed.js` | 530 |
| `seedSkills` | Function | `backend/prisma/seed.js` | 570 |
| `seedProducts` | Function | `backend/prisma/seed.js` | 602 |
| `seedProductSkillRelations` | Function | `backend/prisma/seed.js` | 630 |
| `main` | Function | `backend/prisma/seed.js` | 684 |

## Execution Flows

| Flow | Type | Steps |
|------|------|-------|
| `Main → ToJsonValue` | intra_community | 3 |

## How to Explore

1. `gitnexus_context({name: "toJsonValue"})` — see callers and callees
2. `gitnexus_query({query: "prisma"})` — find related execution flows
3. Read key files listed above for implementation details
