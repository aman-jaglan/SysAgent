# Artifacts — Project State Tracker

This file tracks the state of every piece of work in SysAgent.
When context is lost or compacted, any agent (or the orchestrator) can read this file to understand exactly where the project stands.

## Current Wave: Wave 1 (Foundation)

### Agent 1 — Foundation (`feat/foundation`)
**Status**: NOT STARTED
**Branch**: `feat/foundation`
**Owner**: Agent 1
**Scope**:
- [ ] pnpm init, next.js 15, typescript, tailwind setup
- [ ] Drizzle ORM + better-sqlite3 setup
- [ ] DB schema: settings, sessions, messages, snapshots, progress
- [ ] DB migrations
- [ ] CLI entry point (bin/cli.ts)
- [ ] Settings page: provider picker, API key input, model selector
- [ ] Provider abstraction: lib/providers/model.ts
- [ ] .env.example with all provider options

**Files owned**:
- `package.json`, `tsconfig.json`, `tailwind.config.ts`, `next.config.ts`
- `src/lib/db/*`
- `src/lib/providers/*`
- `src/app/settings/*`
- `bin/cli.ts`
- `.env.example`
- `drizzle/*`

**Completed milestones**: (none yet)

---

### Agent 2 — UI Core (`feat/ui-core`)
**Status**: NOT STARTED
**Branch**: `feat/ui-core`
**Owner**: Agent 2
**Scope**:
- [ ] App layout with resizable split panes
- [ ] Excalidraw wrapper component
- [ ] Canvas capture: debounced exportToBlob + getSceneVersion
- [ ] Interview setup page: goal input, level selector, JD paste
- [ ] Session page layout: canvas left, agent panel right
- [ ] Session timer component
- [ ] Dashboard page: session history list
- [ ] Basic global styles and theme

**Files owned**:
- `src/app/page.tsx` (interview setup)
- `src/app/session/[id]/page.tsx`
- `src/app/dashboard/page.tsx`
- `src/app/layout.tsx`
- `src/components/canvas/*`
- `src/components/session/*`
- `src/components/dashboard/*`

**Completed milestones**: (none yet)

---

### Agent 3 — Agent Brain (`feat/agent-brain`)
**Status**: NOT STARTED
**Branch**: `feat/agent-brain`
**Owner**: Agent 3
**Scope**:
- [ ] System prompt templates for junior/mid/senior
- [ ] Interview flow state machine (SETUP → REQUIREMENTS → HIGH_LEVEL → DEEP_DIVE → WRAP_UP)
- [ ] Question bank: 20+ system design problems
- [ ] JD parser: extract focus areas from job descriptions
- [ ] Evaluator: score across 8 dimensions
- [ ] Context manager: summary + recent buffer structure

**Files owned**:
- `src/lib/agent/system-prompt.ts`
- `src/lib/agent/interview-flow.ts`
- `src/lib/agent/question-bank.ts`
- `src/lib/agent/jd-parser.ts`
- `src/lib/agent/evaluator.ts`
- `src/lib/agent/context-manager.ts`
- `src/types/index.ts`

**Completed milestones**: (none yet)

---

## Wave 2 — Integration (BLOCKED on Wave 1)

### Agent 4 — Chat + Streaming (`feat/chat-streaming`)
### Agent 5 — Canvas Vision (`feat/canvas-vision`)
### Agent 6 — Voice (`feat/voice`)

## Wave 3 — Polish (BLOCKED on Wave 2)

### Agent 7 — Scoring + Dashboard (`feat/scoring`)
### Agent 8 — Error Recovery (`feat/error-recovery`)
### Agent 9 — Packaging (`feat/packaging`)

---

## Merge Log
| Wave | Branches Merged | Date | Conflicts |
|------|----------------|------|-----------|
| (none yet) | | | |

---

## How to Use This File
1. Before starting work, read this file to understand the current state
2. After completing a milestone, check off the item and add to "Completed milestones"
3. After merging a wave, update the Merge Log
4. When a wave completes, update the next wave's status from BLOCKED to active
