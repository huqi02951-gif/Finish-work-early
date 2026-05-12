---
name: catalog-products
description: "Skill for the Catalog-products area of Finish-work-early. 13 symbols across 3 files."
---

# Catalog-products

13 symbols | 3 files | Cohesion: 100%

## When to Use

- Working with code in `backend/`
- Understanding how validatePayload, createProduct, updateProduct work
- Modifying catalog-products-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `backend/src/catalog-products/catalog-products.service.ts` | validatePayload, createProduct, updateProduct, listPublicProducts, getPublicProduct (+2) |
| `backend/src/catalog-products/admin-products.controller.ts` | createProduct, updateProduct, getProducts, replaceProductSkills |
| `backend/src/catalog-products/public-products.controller.ts` | getProducts, getProduct |

## Entry Points

Start here when exploring this area:

- **`validatePayload`** (Method) — `backend/src/catalog-products/catalog-products.service.ts:20`
- **`createProduct`** (Method) — `backend/src/catalog-products/catalog-products.service.ts:126`
- **`updateProduct`** (Method) — `backend/src/catalog-products/catalog-products.service.ts:143`
- **`createProduct`** (Method) — `backend/src/catalog-products/admin-products.controller.ts:19`
- **`updateProduct`** (Method) — `backend/src/catalog-products/admin-products.controller.ts:24`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `validatePayload` | Method | `backend/src/catalog-products/catalog-products.service.ts` | 20 |
| `createProduct` | Method | `backend/src/catalog-products/catalog-products.service.ts` | 126 |
| `updateProduct` | Method | `backend/src/catalog-products/catalog-products.service.ts` | 143 |
| `createProduct` | Method | `backend/src/catalog-products/admin-products.controller.ts` | 19 |
| `updateProduct` | Method | `backend/src/catalog-products/admin-products.controller.ts` | 24 |
| `getProducts` | Method | `backend/src/catalog-products/public-products.controller.ts` | 8 |
| `listPublicProducts` | Method | `backend/src/catalog-products/catalog-products.service.ts` | 54 |
| `getProduct` | Method | `backend/src/catalog-products/public-products.controller.ts` | 13 |
| `getPublicProduct` | Method | `backend/src/catalog-products/catalog-products.service.ts` | 81 |
| `listAdminProducts` | Method | `backend/src/catalog-products/catalog-products.service.ts` | 105 |
| `getProducts` | Method | `backend/src/catalog-products/admin-products.controller.ts` | 14 |
| `replaceProductSkills` | Method | `backend/src/catalog-products/catalog-products.service.ts` | 167 |
| `replaceProductSkills` | Method | `backend/src/catalog-products/admin-products.controller.ts` | 29 |

## Execution Flows

| Flow | Type | Steps |
|------|------|-------|
| `CreateProduct → ValidatePayload` | intra_community | 3 |
| `UpdateProduct → ValidatePayload` | intra_community | 3 |

## How to Explore

1. `gitnexus_context({name: "validatePayload"})` — see callers and callees
2. `gitnexus_query({query: "catalog-products"})` — find related execution flows
3. Read key files listed above for implementation details
