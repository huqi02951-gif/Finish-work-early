---
name: cluster-135
description: "Skill for the Cluster_135 area of Finish-work-early. 6 symbols across 1 files."
---

# Cluster_135

6 symbols | 1 files | Cohesion: 100%

## When to Use

- Working with code in `src/`
- Understanding how LoadingState work
- Modifying cluster_135-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `src/components/common/LoadingState.tsx` | SkeletonBlock, SkeletonList, SkeletonCard, SkeletonThread, SkeletonRows (+1) |

## Entry Points

Start here when exploring this area:

- **`LoadingState`** (Function) — `src/components/common/LoadingState.tsx:64`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `LoadingState` | Function | `src/components/common/LoadingState.tsx` | 64 |
| `SkeletonBlock` | Function | `src/components/common/LoadingState.tsx` | 14 |
| `SkeletonList` | Function | `src/components/common/LoadingState.tsx` | 21 |
| `SkeletonCard` | Function | `src/components/common/LoadingState.tsx` | 40 |
| `SkeletonThread` | Function | `src/components/common/LoadingState.tsx` | 49 |
| `SkeletonRows` | Function | `src/components/common/LoadingState.tsx` | 56 |

## Execution Flows

| Flow | Type | Steps |
|------|------|-------|
| `LoadingState → SkeletonBlock` | intra_community | 4 |

## How to Explore

1. `gitnexus_context({name: "LoadingState"})` — see callers and callees
2. `gitnexus_query({query: "cluster_135"})` — find related execution flows
3. Read key files listed above for implementation details
