---
name: pantry
description: "Skill for the Pantry area of Finish-work-early. 94 symbols across 3 files."
---

# Pantry

94 symbols | 3 files | Cohesion: 78%

## When to Use

- Working with code in `backend/`
- Understanding how serializedPosts, serializedListings, createOrder work
- Modifying pantry-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `backend/src/pantry/pantry.service.ts` | createOrder, listMyOrders, updateOrderStatus, serializeOrder, parseOrderStatus (+54) |
| `backend/src/pantry/pantry.controller.ts` | createOrder, listMyOrders, updateOrderStatus, createComment, listComments (+19) |
| `backend/src/pantry/pantry.gateway.ts` | handleConnection, authenticate, emitOrder, emitOrderTo, emitNotification (+6) |

## Entry Points

Start here when exploring this area:

- **`serializedPosts`** (Function) — `backend/src/pantry/pantry.service.ts:126`
- **`serializedListings`** (Function) — `backend/src/pantry/pantry.service.ts:127`
- **`createOrder`** (Method) — `backend/src/pantry/pantry.service.ts:358`
- **`listMyOrders`** (Method) — `backend/src/pantry/pantry.service.ts:389`
- **`updateOrderStatus`** (Method) — `backend/src/pantry/pantry.service.ts:404`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `serializedPosts` | Function | `backend/src/pantry/pantry.service.ts` | 126 |
| `serializedListings` | Function | `backend/src/pantry/pantry.service.ts` | 127 |
| `createOrder` | Method | `backend/src/pantry/pantry.service.ts` | 358 |
| `listMyOrders` | Method | `backend/src/pantry/pantry.service.ts` | 389 |
| `updateOrderStatus` | Method | `backend/src/pantry/pantry.service.ts` | 404 |
| `serializeOrder` | Method | `backend/src/pantry/pantry.service.ts` | 886 |
| `parseOrderStatus` | Method | `backend/src/pantry/pantry.service.ts` | 1009 |
| `emitOrderSnapshots` | Method | `backend/src/pantry/pantry.service.ts` | 1015 |
| `notifyOrderLifecycle` | Method | `backend/src/pantry/pantry.service.ts` | 1020 |
| `createNotification` | Method | `backend/src/pantry/pantry.service.ts` | 1062 |
| `assertOrderTransition` | Method | `backend/src/pantry/pantry.service.ts` | 1086 |
| `handleConnection` | Method | `backend/src/pantry/pantry.gateway.ts` | 30 |
| `authenticate` | Method | `backend/src/pantry/pantry.gateway.ts` | 42 |
| `emitOrder` | Method | `backend/src/pantry/pantry.gateway.ts` | 101 |
| `emitOrderTo` | Method | `backend/src/pantry/pantry.gateway.ts` | 107 |
| `emitNotification` | Method | `backend/src/pantry/pantry.gateway.ts` | 111 |
| `extractToken` | Method | `backend/src/pantry/pantry.gateway.ts` | 119 |
| `userRoom` | Method | `backend/src/pantry/pantry.gateway.ts` | 127 |
| `createOrder` | Method | `backend/src/pantry/pantry.controller.ts` | 71 |
| `listMyOrders` | Method | `backend/src/pantry/pantry.controller.ts` | 76 |

## Execution Flows

| Flow | Type | Steps |
|------|------|-------|
| `CreateOrder → UserRoom` | intra_community | 6 |
| `CreateComment → NormalizeText` | cross_community | 5 |
| `Report → NormalizeText` | intra_community | 5 |
| `CreateOrder → NormalizeText` | cross_community | 5 |
| `CreateOrder → AssertSafeCommunityText` | cross_community | 5 |
| `CreateConversation → NormalizeText` | cross_community | 5 |
| `CreateConversation → AssertSafeCommunityText` | cross_community | 5 |
| `SendMessage → NormalizeText` | cross_community | 5 |
| `SendMessage → UserRoom` | cross_community | 5 |
| `CreatePost → EnsureIdentity` | cross_community | 4 |

## How to Explore

1. `gitnexus_context({name: "serializedPosts"})` — see callers and callees
2. `gitnexus_query({query: "pantry"})` — find related execution flows
3. Read key files listed above for implementation details
