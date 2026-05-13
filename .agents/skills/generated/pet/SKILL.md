---
name: pet
description: "Skill for the Pet area of Finish-work-early. 34 symbols across 8 files."
---

# Pet

34 symbols | 8 files | Cohesion: 72%

## When to Use

- Working with code in `lib/`
- Understanding how getCardMoodTint, subscribePetState, subscribeLocalNumber work
- Modifying pet-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `lib/petOs.ts` | subscribePetState, buildDefaultIdentity, buildDefaultState, buildDefaultCooldown, ensurePetOsRecords (+6) |
| `components/pet/PetOsMountSlot.tsx` | PetOsMountSlot, cardMoodTint, handleAdopt, handleToggleMute, unsubscribe (+3) |
| `components/pet/PetCompanion.tsx` | deriveStage, setPetCompanionHidden, PetCompanion, unsubscribe, schedule (+1) |
| `lib/petOsState.ts` | getCardMoodTint, derivePetPosture, getCardPosture |
| `lib/petOsContent.ts` | loadPetOsResources, pickPetLine, getPetStatusSummary |
| `lib/localSignals.ts` | subscribeLocalNumber |
| `src/pages/Profile.tsx` | togglePetHidden |
| `components/pet/PetOsCard.tsx` | PetOsCard |

## Entry Points

Start here when exploring this area:

- **`getCardMoodTint`** (Function) — `lib/petOsState.ts:64`
- **`subscribePetState`** (Function) — `lib/petOs.ts:330`
- **`subscribeLocalNumber`** (Function) — `lib/localSignals.ts:30`
- **`PetOsCard`** (Function) — `components/pet/PetOsCard.tsx:83`
- **`setPetCompanionHidden`** (Function) — `components/pet/PetCompanion.tsx:82`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `getCardMoodTint` | Function | `lib/petOsState.ts` | 64 |
| `subscribePetState` | Function | `lib/petOs.ts` | 330 |
| `subscribeLocalNumber` | Function | `lib/localSignals.ts` | 30 |
| `PetOsCard` | Function | `components/pet/PetOsCard.tsx` | 83 |
| `setPetCompanionHidden` | Function | `components/pet/PetCompanion.tsx` | 82 |
| `loadPetOsResources` | Function | `lib/petOsContent.ts` | 8 |
| `getPetIdentitySnapshot` | Function | `lib/petOs.ts` | 158 |
| `enablePetCompanion` | Function | `lib/petOs.ts` | 163 |
| `setPetMuted` | Function | `lib/petOs.ts` | 313 |
| `derivePetPosture` | Function | `lib/petOsState.ts` | 2 |
| `pickPetLine` | Function | `lib/petOsContent.ts` | 24 |
| `dispatchPetEvent` | Function | `lib/petOs.ts` | 179 |
| `syncPetStatus` | Function | `lib/petOs.ts` | 284 |
| `getCardPosture` | Function | `lib/petOsState.ts` | 47 |
| `getPetStatusSummary` | Function | `lib/petOsContent.ts` | 41 |
| `togglePetHidden` | Function | `src/pages/Profile.tsx` | 131 |
| `PetOsMountSlot` | Function | `components/pet/PetOsMountSlot.tsx` | 16 |
| `cardMoodTint` | Function | `components/pet/PetOsMountSlot.tsx` | 110 |
| `deriveStage` | Function | `components/pet/PetCompanion.tsx` | 70 |
| `PetCompanion` | Function | `components/pet/PetCompanion.tsx` | 99 |

## Execution Flows

| Flow | Type | Steps |
|------|------|-------|
| `PetCompanion → LoadPetOsResources` | cross_community | 6 |
| `PetCompanion → BuildDefaultIdentity` | cross_community | 6 |
| `PetCompanion → BuildDefaultCooldown` | cross_community | 6 |
| `PetCompanion → DerivePetPosture` | cross_community | 5 |
| `PetCompanion → PickPetLine` | cross_community | 5 |
| `About → LoadPetOsResources` | cross_community | 5 |
| `About → BuildDefaultIdentity` | cross_community | 5 |
| `About → BuildDefaultCooldown` | cross_community | 5 |
| `PetOsMountSlot → BuildDefaultIdentity` | cross_community | 5 |
| `PetOsMountSlot → BuildDefaultCooldown` | cross_community | 5 |

## Connected Areas

| Area | Connections |
|------|-------------|
| Pages | 4 calls |
| Tools | 2 calls |
| Community | 2 calls |

## How to Explore

1. `gitnexus_context({name: "getCardMoodTint"})` — see callers and callees
2. `gitnexus_query({query: "pet"})` — find related execution flows
3. Read key files listed above for implementation details
