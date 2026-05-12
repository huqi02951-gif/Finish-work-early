<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **Finish-work-early** (3982 symbols, 8473 relationships, 252 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> If any GitNexus tool warns the index is stale, run `npx gitnexus analyze` in terminal first.

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `gitnexus_impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `gitnexus_detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `gitnexus_query({query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `gitnexus_context({name: "symbolName"})`.

## Never Do

- NEVER edit a function, class, or method without first running `gitnexus_impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `gitnexus_rename` which understands the call graph.
- NEVER commit changes without running `gitnexus_detect_changes()` to check affected scope.

## Resources

| Resource | Use for |
|----------|---------|
| `gitnexus://repo/Finish-work-early/context` | Codebase overview, check index freshness |
| `gitnexus://repo/Finish-work-early/clusters` | All functional areas |
| `gitnexus://repo/Finish-work-early/processes` | All execution flows |
| `gitnexus://repo/Finish-work-early/process/{name}` | Step-by-step execution trace |

## CLI

| Task | Read this skill file |
|------|---------------------|
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/gitnexus/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.claude/skills/gitnexus/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.claude/skills/gitnexus/gitnexus-cli/SKILL.md` |
| Work in the Tools area (182 symbols) | `.claude/skills/generated/tools/SKILL.md` |
| Work in the Pantry area (94 symbols) | `.claude/skills/generated/pantry/SKILL.md` |
| Work in the Community area (89 symbols) | `.claude/skills/generated/community/SKILL.md` |
| Work in the Services area (78 symbols) | `.claude/skills/generated/services/SKILL.md` |
| Work in the Pages area (58 symbols) | `.claude/skills/generated/pages/SKILL.md` |
| Work in the Forum area (52 symbols) | `.claude/skills/generated/forum/SKILL.md` |
| Work in the Checklist-generator area (41 symbols) | `.claude/skills/generated/checklist-generator/SKILL.md` |
| Work in the Pet area (34 symbols) | `.claude/skills/generated/pet/SKILL.md` |
| Work in the Auth area (21 symbols) | `.claude/skills/generated/auth/SKILL.md` |
| Work in the Tool-data area (18 symbols) | `.claude/skills/generated/tool-data/SKILL.md` |
| Work in the Prisma area (14 symbols) | `.claude/skills/generated/prisma/SKILL.md` |
| Work in the Page-configs area (13 symbols) | `.claude/skills/generated/page-configs/SKILL.md` |
| Work in the Catalog-products area (13 symbols) | `.claude/skills/generated/catalog-products/SKILL.md` |
| Work in the Components area (12 symbols) | `.claude/skills/generated/components/SKILL.md` |
| Work in the Catalog-skills area (11 symbols) | `.claude/skills/generated/catalog-skills/SKILL.md` |
| Work in the Customer-context area (10 symbols) | `.claude/skills/generated/customer-context/SKILL.md` |
| Work in the Cluster_19 area (9 symbols) | `.claude/skills/generated/cluster-19/SKILL.md` |
| Work in the Cluster_17 area (8 symbols) | `.claude/skills/generated/cluster-17/SKILL.md` |
| Work in the Cluster_18 area (8 symbols) | `.claude/skills/generated/cluster-18/SKILL.md` |
| Work in the Cluster_135 area (6 symbols) | `.claude/skills/generated/cluster-135/SKILL.md` |

<!-- gitnexus:end -->
