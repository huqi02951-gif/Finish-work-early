---
name: components
description: "Skill for the Components area of Finish-work-early. 12 symbols across 4 files."
---

# Components

12 symbols | 4 files | Cohesion: 88%

## When to Use

- Working with code in `components/`
- Understanding how saveLocalPost work
- Modifying components-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `components/ScenarioCenter.tsx` | SensitiveCommModule, BusinessGuideModule, SkillCard, ScenarioCenter, handleTabChange |
| `components/ProductScenePage.tsx` | useCopy, copy, CustomerTab, ReviewTab, ProductScenePage |
| `lib/localDB.ts` | saveLocalPost |
| `components/Feedback.tsx` | handleSubmit |

## Entry Points

Start here when exploring this area:

- **`saveLocalPost`** (Function) — `lib/localDB.ts:128`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `saveLocalPost` | Function | `lib/localDB.ts` | 128 |
| `SensitiveCommModule` | Function | `components/ScenarioCenter.tsx` | 20 |
| `BusinessGuideModule` | Function | `components/ScenarioCenter.tsx` | 91 |
| `SkillCard` | Function | `components/ScenarioCenter.tsx` | 183 |
| `ScenarioCenter` | Function | `components/ScenarioCenter.tsx` | 222 |
| `handleTabChange` | Function | `components/ScenarioCenter.tsx` | 227 |
| `useCopy` | Function | `components/ProductScenePage.tsx` | 23 |
| `copy` | Function | `components/ProductScenePage.tsx` | 25 |
| `CustomerTab` | Function | `components/ProductScenePage.tsx` | 35 |
| `ReviewTab` | Function | `components/ProductScenePage.tsx` | 188 |
| `ProductScenePage` | Function | `components/ProductScenePage.tsx` | 357 |
| `handleSubmit` | Function | `components/Feedback.tsx` | 38 |

## Execution Flows

| Flow | Type | Steps |
|------|------|-------|
| `ProductScenePage → UseCopy` | intra_community | 3 |
| `ProductScenePage → Copy` | intra_community | 3 |

## Connected Areas

| Area | Connections |
|------|-------------|
| Community | 3 calls |

## How to Explore

1. `gitnexus_context({name: "saveLocalPost"})` — see callers and callees
2. `gitnexus_query({query: "components"})` — find related execution flows
3. Read key files listed above for implementation details
