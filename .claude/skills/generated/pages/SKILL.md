---
name: pages
description: "Skill for the Pages area of Finish-work-early. 58 symbols across 12 files."
---

# Pages

58 symbols | 12 files | Cohesion: 80%

## When to Use

- Working with code in `src/`
- Understanding how fmt, getHolidayToday, getDayMode work
- Modifying pages-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `src/pages/Workspace.tsx` | dedupeArtifacts, dedupeDrafts, sortArtifacts, sortDrafts, pickToolDataSource (+18) |
| `src/pages/Profile.tsx` | AnimatedAmount, Profile, EarnTile, FactCard, RowLink (+4) |
| `src/pages/Messages.tsx` | Messages, loadAll, send, updateOrder, markRead |
| `src/pages/Feed.tsx` | Feed, fetchPosts, copyText, handleShare, toggleLike |
| `lib/holidays.ts` | fmt, getHolidayToday, getDayMode |
| `components/pet/PetCompanion.tsx` | getPetCompanionHidden, onStorage, bootstrap |
| `src/pages/About.tsx` | About, BeliefCard, ActionCard |
| `src/services/pantryApi.ts` | requireToken, connectPantrySocket |
| `lib/petOs.ts` | getPetStateSnapshot, initializePetOsSession |
| `src/services/authService.ts` | getBestToken |

## Entry Points

Start here when exploring this area:

- **`fmt`** (Function) — `lib/holidays.ts:23`
- **`getHolidayToday`** (Function) — `lib/holidays.ts:30`
- **`getDayMode`** (Function) — `lib/holidays.ts:39`
- **`getPetCompanionHidden`** (Function) — `components/pet/PetCompanion.tsx:90`
- **`connectPantrySocket`** (Function) — `src/services/pantryApi.ts:235`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `fmt` | Function | `lib/holidays.ts` | 23 |
| `getHolidayToday` | Function | `lib/holidays.ts` | 30 |
| `getDayMode` | Function | `lib/holidays.ts` | 39 |
| `getPetCompanionHidden` | Function | `components/pet/PetCompanion.tsx` | 90 |
| `connectPantrySocket` | Function | `src/services/pantryApi.ts` | 235 |
| `getBestToken` | Function | `src/services/authService.ts` | 65 |
| `getPetStateSnapshot` | Function | `lib/petOs.ts` | 153 |
| `initializePetOsSession` | Function | `lib/petOs.ts` | 252 |
| `useCustomer` | Function | `lib/CustomerContext.tsx` | 43 |
| `AnimatedAmount` | Function | `src/pages/Profile.tsx` | 30 |
| `Profile` | Function | `src/pages/Profile.tsx` | 58 |
| `EarnTile` | Function | `src/pages/Profile.tsx` | 516 |
| `FactCard` | Function | `src/pages/Profile.tsx` | 551 |
| `RowLink` | Function | `src/pages/Profile.tsx` | 558 |
| `RowButton` | Function | `src/pages/Profile.tsx` | 571 |
| `Divider` | Function | `src/pages/Profile.tsx` | 594 |
| `onStorage` | Function | `components/pet/PetCompanion.tsx` | 149 |
| `dedupeArtifacts` | Function | `src/pages/Workspace.tsx` | 207 |
| `dedupeDrafts` | Function | `src/pages/Workspace.tsx` | 222 |
| `sortArtifacts` | Function | `src/pages/Workspace.tsx` | 237 |

## Execution Flows

| Flow | Type | Steps |
|------|------|-------|
| `PetCompanion → LoadPetOsResources` | cross_community | 6 |
| `PetCompanion → BuildDefaultIdentity` | cross_community | 6 |
| `PetCompanion → BuildDefaultCooldown` | cross_community | 6 |
| `WorkspacePage → GetAuthSession` | cross_community | 5 |
| `ToMyselfSpace → GetAuthSession` | cross_community | 5 |
| `Messages → GetAuthSession` | cross_community | 5 |
| `PetCompanion → DerivePetPosture` | cross_community | 5 |
| `PetCompanion → PickPetLine` | cross_community | 5 |
| `About → LoadPetOsResources` | cross_community | 5 |
| `About → BuildDefaultIdentity` | cross_community | 5 |

## Connected Areas

| Area | Connections |
|------|-------------|
| Community | 6 calls |
| Pet | 5 calls |
| Services | 4 calls |
| Tools | 3 calls |

## How to Explore

1. `gitnexus_context({name: "fmt"})` — see callers and callees
2. `gitnexus_query({query: "pages"})` — find related execution flows
3. Read key files listed above for implementation details
