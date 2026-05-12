---
name: cluster-19
description: "Skill for the Cluster_19 area of Finish-work-early. 9 symbols across 1 files."
---

# Cluster_19

9 symbols | 1 files | Cohesion: 100%

## When to Use

- Working with code in `lib/`
- Understanding how getCommunitySummary, listCommunityEntries, getCommunityThread work
- Modifying cluster_19-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `lib/community.ts` | authFetch, mapPostToEntry, getCommunitySummary, listCommunityEntries, getCommunityThread (+4) |

## Entry Points

Start here when exploring this area:

- **`getCommunitySummary`** (Function) — `lib/community.ts:94`
- **`listCommunityEntries`** (Function) — `lib/community.ts:138`
- **`getCommunityThread`** (Function) — `lib/community.ts:150`
- **`createCommunityThread`** (Function) — `lib/community.ts:173`
- **`createCommunityReply`** (Function) — `lib/community.ts:195`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `getCommunitySummary` | Function | `lib/community.ts` | 94 |
| `listCommunityEntries` | Function | `lib/community.ts` | 138 |
| `getCommunityThread` | Function | `lib/community.ts` | 150 |
| `createCommunityThread` | Function | `lib/community.ts` | 173 |
| `createCommunityReply` | Function | `lib/community.ts` | 195 |
| `promoteCommunityThreadToTopic` | Function | `lib/community.ts` | 207 |
| `createSelfGossipThread` | Function | `lib/community.ts` | 215 |
| `authFetch` | Function | `lib/community.ts` | 49 |
| `mapPostToEntry` | Function | `lib/community.ts` | 67 |

## How to Explore

1. `gitnexus_context({name: "getCommunitySummary"})` — see callers and callees
2. `gitnexus_query({query: "cluster_19"})` — find related execution flows
3. Read key files listed above for implementation details
