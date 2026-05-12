---
name: forum
description: "Skill for the Forum area of Finish-work-early. 52 symbols across 5 files."
---

# Forum

52 symbols | 5 files | Cohesion: 85%

## When to Use

- Working with code in `backend/`
- Understanding how createPost, updatePost, deletePost work
- Modifying forum-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `backend/src/forum/forum.service.ts` | getPublicPostDetail, createPost, updateOwnPost, deleteOwnPost, reviewPost (+30) |
| `backend/src/forum/admin-forum.controller.ts` | reviewPost, pinPost, lockComments, createPost, updatePost (+2) |
| `backend/src/forum/user-forum.controller.ts` | createPost, updatePost, deletePost, createComment, getMyPosts |
| `backend/src/forum/public-forum.controller.ts` | getPostDetail, getPosts, getComments, getBoards |
| `backend/src/users/users.controller.ts` | getMyPosts |

## Entry Points

Start here when exploring this area:

- **`createPost`** (Method) — `backend/src/forum/user-forum.controller.ts:10`
- **`updatePost`** (Method) — `backend/src/forum/user-forum.controller.ts:16`
- **`deletePost`** (Method) — `backend/src/forum/user-forum.controller.ts:22`
- **`getPostDetail`** (Method) — `backend/src/forum/public-forum.controller.ts:38`
- **`getPublicPostDetail`** (Method) — `backend/src/forum/forum.service.ts:128`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `createPost` | Method | `backend/src/forum/user-forum.controller.ts` | 10 |
| `updatePost` | Method | `backend/src/forum/user-forum.controller.ts` | 16 |
| `deletePost` | Method | `backend/src/forum/user-forum.controller.ts` | 22 |
| `getPostDetail` | Method | `backend/src/forum/public-forum.controller.ts` | 38 |
| `getPublicPostDetail` | Method | `backend/src/forum/forum.service.ts` | 128 |
| `createPost` | Method | `backend/src/forum/forum.service.ts` | 179 |
| `updateOwnPost` | Method | `backend/src/forum/forum.service.ts` | 219 |
| `deleteOwnPost` | Method | `backend/src/forum/forum.service.ts` | 273 |
| `reviewPost` | Method | `backend/src/forum/forum.service.ts` | 355 |
| `setPinned` | Method | `backend/src/forum/forum.service.ts` | 439 |
| `setCommentsLocked` | Method | `backend/src/forum/forum.service.ts` | 471 |
| `createAdminPost` | Method | `backend/src/forum/forum.service.ts` | 502 |
| `updateAdminPost` | Method | `backend/src/forum/forum.service.ts` | 541 |
| `buildPostWhere` | Method | `backend/src/forum/forum.service.ts` | 662 |
| `resolveBoardForCreate` | Method | `backend/src/forum/forum.service.ts` | 716 |
| `mapLegacyCategoryToBoardSlug` | Method | `backend/src/forum/forum.service.ts` | 729 |
| `requireBoard` | Method | `backend/src/forum/forum.service.ts` | 745 |
| `syncTags` | Method | `backend/src/forum/forum.service.ts` | 798 |
| `serializePostDetail` | Method | `backend/src/forum/forum.service.ts` | 879 |
| `requireText` | Method | `backend/src/forum/forum.service.ts` | 924 |

## Execution Flows

| Flow | Type | Steps |
|------|------|-------|
| `CreatePost → NormalizeOptionalText` | intra_community | 5 |
| `UpdatePost → NormalizeOptionalText` | intra_community | 4 |
| `DeletePost → SerializePostSummary` | cross_community | 4 |
| `PinPost → SerializePostSummary` | cross_community | 4 |
| `LockComments → SerializePostSummary` | cross_community | 4 |
| `CreatePost → NormalizeOptionalText` | intra_community | 4 |
| `UpdatePost → NormalizeOptionalText` | intra_community | 4 |
| `ListPosts → ParsePostType` | cross_community | 3 |
| `ListPosts → ParsePostStatus` | cross_community | 3 |
| `CreatePost → RequireText` | intra_community | 3 |

## How to Explore

1. `gitnexus_context({name: "createPost"})` — see callers and callees
2. `gitnexus_query({query: "forum"})` — find related execution flows
3. Read key files listed above for implementation details
