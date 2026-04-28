# MediVerse Memory Bank

A short, layered set of project-state files. Any new chat session reads these
first to get oriented in ~3 minutes without re-reading the entire codebase.

## Files (most-stable → most-volatile)

| File | What it captures | How often it changes |
|------|------------------|----------------------|
| `projectbrief.md` | Vision, scope, non-goals, success criteria. Anchors everything else. | Rarely — only when scope shifts |
| `productContext.md` | Roles, user flows, key product rules, UX decisions. | When product decisions change |
| `systemPatterns.md` | Architecture style, cross-cutting patterns, conventions. | When patterns evolve |
| `techContext.md` | Versions, local setup, ports, env vars, gotchas, commands. | When tooling/deps change |
| `activeContext.md` | What's being worked on right now, recent changes, next step. | **After every phase / major change** |
| `progress.md` | Phase-by-phase status, working endpoints, test count. | **After every phase / major change** |

## Golden rules

1. **No duplication.** The detailed canon lives in `docs/ARCHITECTURE.md` and
   `docs/WORKFLOWS.md`. The memory bank summarizes and **links** to them.
2. **Ground every claim** in something that actually exists or is decided.
   Speculation belongs in `activeContext.md` clearly marked as such, never in
   the stable files.
3. **Update `activeContext.md` and `progress.md` at the end of each phase**,
   before the chat ends. Otherwise the next session starts blind.
4. Keep each file under ~250 lines. If it's growing, the detail belongs in
   `docs/`.

## How agents use it

A Cursor rule at `.cursor/rules/memory-bank.mdc` is `alwaysApply: true`, so
every new chat in this repo loads the memory bank automatically. The rule also
instructs the agent to update `activeContext.md` and `progress.md` after
significant work.
