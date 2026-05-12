---
name: services
description: "Skill for the Services area of Finish-work-early. 78 symbols across 13 files."
---

# Services

78 symbols | 13 files | Cohesion: 89%

## When to Use

- Working with code in `src/`
- Understanding how getFeed, getPostDetail, createPost work
- Modifying services-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `src/services/pantryApi.ts` | requestJson, getFeed, getPostDetail, createPost, createComment (+16) |
| `src/services/forumApi.ts` | mapRole, mapUser, mapBoard, mapStatus, mapPost (+14) |
| `src/services/contentApi.ts` | requestJson, mapProduct, buildQuery, getPageConfig, getSkills (+5) |
| `src/services/api.ts` | ensureDemoSession, getCurrentUser, getDemoClientKey, mapBackendRole, mapBackendUser (+5) |
| `src/services/authService.ts` | getAuthSession, isAuthenticated, isDemoSession, getBestUser, clearAuthSession (+1) |
| `components/SkillsLibrary.tsx` | getSkillCardCopy, SkillsLibrary, list |
| `src/pages/Home.tsx` | Home, ApexWordmark |
| `src/components/layout/AppLayout.tsx` | AppLayout, handleLogout |
| `src/pages/Workspace.tsx` | getWorkspaceCloudToken |
| `src/pages/Publish.tsx` | handleSubmit |

## Entry Points

Start here when exploring this area:

- **`getFeed`** (Function) — `src/services/pantryApi.ts:182`
- **`getPostDetail`** (Function) — `src/services/pantryApi.ts:183`
- **`createPost`** (Function) — `src/services/pantryApi.ts:184`
- **`createComment`** (Function) — `src/services/pantryApi.ts:192`
- **`listComments`** (Function) — `src/services/pantryApi.ts:194`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `getFeed` | Function | `src/services/pantryApi.ts` | 182 |
| `getPostDetail` | Function | `src/services/pantryApi.ts` | 183 |
| `createPost` | Function | `src/services/pantryApi.ts` | 184 |
| `createComment` | Function | `src/services/pantryApi.ts` | 192 |
| `listComments` | Function | `src/services/pantryApi.ts` | 194 |
| `react` | Function | `src/services/pantryApi.ts` | 195 |
| `bookmark` | Function | `src/services/pantryApi.ts` | 197 |
| `updateCoffeeProfile` | Function | `src/services/pantryApi.ts` | 199 |
| `report` | Function | `src/services/pantryApi.ts` | 201 |
| `listListings` | Function | `src/services/pantryApi.ts` | 203 |
| `createListing` | Function | `src/services/pantryApi.ts` | 204 |
| `createOrder` | Function | `src/services/pantryApi.ts` | 213 |
| `listMyOrders` | Function | `src/services/pantryApi.ts` | 215 |
| `updateOrderStatus` | Function | `src/services/pantryApi.ts` | 222 |
| `listNotifications` | Function | `src/services/pantryApi.ts` | 224 |
| `markNotificationRead` | Function | `src/services/pantryApi.ts` | 225 |
| `listConversations` | Function | `src/services/pantryApi.ts` | 227 |
| `createConversation` | Function | `src/services/pantryApi.ts` | 228 |
| `getMessages` | Function | `src/services/pantryApi.ts` | 230 |
| `sendMessage` | Function | `src/services/pantryApi.ts` | 231 |

## Execution Flows

| Flow | Type | Steps |
|------|------|-------|
| `WorkspacePage → GetAuthSession` | cross_community | 5 |
| `ToMyselfSpace → GetAuthSession` | cross_community | 5 |
| `Messages → GetAuthSession` | cross_community | 5 |
| `Publish → GetAuthSession` | cross_community | 5 |
| `PantryPage → GetAuthSession` | cross_community | 4 |
| `CreatePost → MapRole` | intra_community | 4 |
| `UpdatePost → MapRole` | intra_community | 4 |
| `DeletePost → MapRole` | intra_community | 4 |
| `CreateComment → MapRole` | intra_community | 4 |
| `React → GetAuthSession` | cross_community | 4 |

## Connected Areas

| Area | Connections |
|------|-------------|
| Community | 3 calls |
| Pages | 2 calls |
| Tools | 1 calls |

## How to Explore

1. `gitnexus_context({name: "getFeed"})` — see callers and callees
2. `gitnexus_query({query: "services"})` — find related execution flows
3. Read key files listed above for implementation details
