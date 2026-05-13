---
name: auth
description: "Skill for the Auth area of Finish-work-early. 21 symbols across 8 files."
---

# Auth

21 symbols | 8 files | Cohesion: 100%

## When to Use

- Working with code in `backend/`
- Understanding how isDemoAuthEnabled, assertDemoAuthEnabled, useFactory work
- Modifying auth-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `backend/src/auth/auth.service.ts` | signToken, login, createOrLoginDemoSession, register |
| `backend/src/auth/auth.config.ts` | isDemoAuthEnabled, assertDemoAuthEnabled, getJwtSecret, getJwtSignOptions |
| `backend/src/auth/email-auth.service.ts` | generateCode, validateEmail, sendVerificationCode, verifyAndLogin |
| `backend/src/auth/auth.controller.ts` | login, createDemoSession, register |
| `backend/src/auth/email-auth.controller.ts` | sendCode, verify |
| `backend/src/auth/auth.guard.ts` | canActivate, extractTokenFromHeader |
| `backend/src/auth/email-auth.module.ts` | useFactory |
| `backend/src/auth/auth.module.ts` | useFactory |

## Entry Points

Start here when exploring this area:

- **`isDemoAuthEnabled`** (Function) — `backend/src/auth/auth.config.ts:22`
- **`assertDemoAuthEnabled`** (Function) — `backend/src/auth/auth.config.ts:32`
- **`useFactory`** (Function) — `backend/src/auth/email-auth.module.ts:9`
- **`useFactory`** (Function) — `backend/src/auth/auth.module.ts:13`
- **`getJwtSecret`** (Function) — `backend/src/auth/auth.config.ts:6`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `isDemoAuthEnabled` | Function | `backend/src/auth/auth.config.ts` | 22 |
| `assertDemoAuthEnabled` | Function | `backend/src/auth/auth.config.ts` | 32 |
| `useFactory` | Function | `backend/src/auth/email-auth.module.ts` | 9 |
| `useFactory` | Function | `backend/src/auth/auth.module.ts` | 13 |
| `getJwtSecret` | Function | `backend/src/auth/auth.config.ts` | 6 |
| `getJwtSignOptions` | Function | `backend/src/auth/auth.config.ts` | 16 |
| `signToken` | Method | `backend/src/auth/auth.service.ts` | 14 |
| `login` | Method | `backend/src/auth/auth.service.ts` | 51 |
| `createOrLoginDemoSession` | Method | `backend/src/auth/auth.service.ts` | 68 |
| `login` | Method | `backend/src/auth/auth.controller.ts` | 14 |
| `createDemoSession` | Method | `backend/src/auth/auth.controller.ts` | 19 |
| `generateCode` | Method | `backend/src/auth/email-auth.service.ts` | 31 |
| `validateEmail` | Method | `backend/src/auth/email-auth.service.ts` | 35 |
| `sendVerificationCode` | Method | `backend/src/auth/email-auth.service.ts` | 39 |
| `verifyAndLogin` | Method | `backend/src/auth/email-auth.service.ts` | 102 |
| `sendCode` | Method | `backend/src/auth/email-auth.controller.ts` | 8 |
| `verify` | Method | `backend/src/auth/email-auth.controller.ts` | 13 |
| `register` | Method | `backend/src/auth/auth.service.ts` | 22 |
| `register` | Method | `backend/src/auth/auth.controller.ts` | 9 |
| `canActivate` | Method | `backend/src/auth/auth.guard.ts` | 8 |

## Execution Flows

| Flow | Type | Steps |
|------|------|-------|
| `CreateOrLoginDemoSession → IsDemoAuthEnabled` | intra_community | 3 |
| `SendCode → ValidateEmail` | intra_community | 3 |
| `SendCode → GenerateCode` | intra_community | 3 |
| `Verify → ValidateEmail` | intra_community | 3 |

## How to Explore

1. `gitnexus_context({name: "isDemoAuthEnabled"})` — see callers and callees
2. `gitnexus_query({query: "auth"})` — find related execution flows
3. Read key files listed above for implementation details
