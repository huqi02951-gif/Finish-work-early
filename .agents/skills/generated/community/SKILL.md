---
name: community
description: "Skill for the Community area of Finish-work-early. 89 symbols across 29 files."
---

# Community

89 symbols | 29 files | Cohesion: 76%

## When to Use

- Working with code in `src/`
- Understanding how cn, useDebounce, buildSimpleDocx work
- Modifying community-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `src/pages/community/PantryPage.tsx` | formatRemain, formatTime, PantryPage, MobileSectionTabs, RadarMetric (+22) |
| `components/shared/ActionBar.tsx` | CopyButton, ExportDocxButton, SaveHistoryButton, HistoryPanel, ActionBar |
| `lib/exportDocx.ts` | buildSimpleDocx, buildSensitiveCommDocx, buildRateOfferDocx, buildAcceptanceDocx |
| `components/tools/SensitiveCommAssistant.tsx` | SensitiveCommAssistant, handleBasicChange, handleScenarioChange, renderScenarioInputs |
| `src/pages/community/CommunityTopic.tsx` | CommunityTopicPage, load, handleReply, formatRelativeTime |
| `src/pages/community/BBS.tsx` | BBSPage, load, formatExpiry, handleSubmit |
| `components/tools/RateOfferTool.tsx` | RateOfferTool, handleIncomePlanToggle, copyToClipboard |
| `components/tools/NewsTypesettingAssistant.tsx` | NewsTypesettingAssistant, removeImage, copyToClipboard |
| `src/pages/community/PantryThreadPage.tsx` | PantryThreadPage, loadThread, formatRelativeTime |
| `lib/utils.ts` | cn, useDebounce |

## Entry Points

Start here when exploring this area:

- **`cn`** (Function) — `lib/utils.ts:4`
- **`useDebounce`** (Function) — `lib/utils.ts:12`
- **`buildSimpleDocx`** (Function) — `lib/exportDocx.ts:22`
- **`buildSensitiveCommDocx`** (Function) — `lib/exportDocx.ts:121`
- **`buildRateOfferDocx`** (Function) — `lib/exportDocx.ts:145`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `cn` | Function | `lib/utils.ts` | 4 |
| `useDebounce` | Function | `lib/utils.ts` | 12 |
| `buildSimpleDocx` | Function | `lib/exportDocx.ts` | 22 |
| `buildSensitiveCommDocx` | Function | `lib/exportDocx.ts` | 121 |
| `buildRateOfferDocx` | Function | `lib/exportDocx.ts` | 145 |
| `buildAcceptanceDocx` | Function | `lib/exportDocx.ts` | 163 |
| `CopyButton` | Function | `components/shared/ActionBar.tsx` | 19 |
| `ExportDocxButton` | Function | `components/shared/ActionBar.tsx` | 71 |
| `SaveHistoryButton` | Function | `components/shared/ActionBar.tsx` | 115 |
| `HistoryPanel` | Function | `components/shared/ActionBar.tsx` | 149 |
| `ActionBar` | Function | `components/shared/ActionBar.tsx` | 238 |
| `computeStatus` | Function | `src/types/gossip.ts` | 42 |
| `formatCountdown` | Function | `src/types/gossip.ts` | 67 |
| `UserManual` | Function | `components/UserManual.tsx` | 114 |
| `UsageInstructions` | Function | `components/UsageInstructions.tsx` | 31 |
| `MaterialChecklistCenter` | Function | `components/MaterialChecklistCenter.tsx` | 48 |
| `copyToClipboard` | Function | `components/MaterialChecklistCenter.tsx` | 145 |
| `Feedback` | Function | `components/Feedback.tsx` | 10 |
| `Publish` | Function | `src/pages/Publish.tsx` | 9 |
| `AnimatedInt` | Function | `src/pages/Profile.tsx` | 39 |

## Execution Flows

| Flow | Type | Steps |
|------|------|-------|
| `Publish → GetAuthSession` | cross_community | 5 |
| `Publish → RadarScore` | intra_community | 5 |
| `PantryPage → GetAuthSession` | cross_community | 4 |
| `PantryPage → RadarScore` | cross_community | 4 |
| `AcceptanceCalculator → Cn` | cross_community | 4 |
| `RateOfferTool → Cn` | intra_community | 4 |
| `SensitiveCommAssistant → Cn` | intra_community | 4 |
| `React → GetAuthSession` | cross_community | 4 |
| `React → RadarScore` | intra_community | 4 |
| `Bookmark → GetAuthSession` | cross_community | 4 |

## Connected Areas

| Area | Connections |
|------|-------------|
| Tools | 5 calls |
| Pages | 3 calls |

## How to Explore

1. `gitnexus_context({name: "cn"})` — see callers and callees
2. `gitnexus_query({query: "community"})` — find related execution flows
3. Read key files listed above for implementation details
