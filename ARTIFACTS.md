# Artifacts — Project State Tracker

This file tracks the state of every piece of work in SysAgent.
When context is lost or compacted, any agent (or the orchestrator) can read this file to understand exactly where the project stands.

## Current Wave: Wave 2 (Integration)

---

## Wave 1 — Foundation (COMPLETE)

### Agent 1 — Foundation (built on `main`)
**Status**: COMPLETE
**Branch**: `main` (built directly, no separate branch)
**Owner**: Orchestrator
**Scope**:
- [x] pnpm init, next.js 15, typescript, tailwind setup
- [x] Drizzle ORM + better-sqlite3 setup
- [x] DB schema: settings, sessions, messages, snapshots, progress
- [x] CLI entry point (bin/cli.mjs)
- [x] Settings page: provider picker, API key input, model selector
- [x] Provider abstraction: lib/providers/model.ts
- [x] .env.example with all provider options
- [x] Shared TypeScript types (src/types/index.ts)

**Commits**:
- `4d44135` feat(init): initialize next.js 15 project with typescript and tailwind
- `dd2f27e` feat(db): add drizzle schema and query helpers
- `c858fb2` feat(foundation): add providers, settings, types, and CLI

---

### Agent 2 — UI Core (`feat/ui-core`)
**Status**: COMPLETE (merged to main)
**Branch**: `feat/ui-core` → merged to `main`
**Owner**: Agent 2
**Scope**:
- [x] App layout with resizable split panes
- [x] Excalidraw wrapper component
- [x] Canvas capture: debounced exportToBlob + getSceneVersion
- [x] Interview setup page: goal input, level selector, JD paste
- [x] Session page layout: canvas left, agent panel right
- [x] Session timer component
- [x] Dashboard page: session history list
- [x] Basic global styles and dark theme

**Files**:
- `src/app/page.tsx` — interview setup with goal, level cards, JD input
- `src/app/session/[id]/page.tsx` — split pane: Excalidraw left, chat right
- `src/app/dashboard/page.tsx` — session history + stats
- `src/app/layout.tsx` — root layout with nav bar
- `src/app/globals.css` — dark theme variables, custom scrollbar
- `src/components/canvas/excalidraw-editor.tsx` — Excalidraw wrapper
- `src/components/canvas/canvas-capture.ts` — debounced blob export
- `src/components/session/agent-panel.tsx` — chat interface with messages
- `src/components/session/session-timer.tsx` — elapsed time display

---

### Agent 3 — Agent Brain (`feat/agent-brain`)
**Status**: COMPLETE (merged to main)
**Branch**: `feat/agent-brain` → merged to `main`
**Owner**: Agent 3
**Scope**:
- [x] System prompt templates for junior/mid/senior
- [x] Interview flow state machine (SETUP → REQUIREMENTS → HIGH_LEVEL → DEEP_DIVE → WRAP_UP)
- [x] Question bank: 20 system design problems (classic, infrastructure, ML)
- [x] JD parser: extract focus areas from job descriptions
- [x] Evaluator: score across 8 dimensions with LLM + heuristic fallback
- [x] Context manager: rolling summary + recent buffer for 2-hour sessions

**Files**:
- `src/lib/agent/system-prompt.ts` — buildSystemPrompt with level/phase behavior
- `src/lib/agent/interview-flow.ts` — state machine with phase transitions
- `src/lib/agent/question-bank.ts` — 20 problems with metadata + helpers
- `src/lib/agent/jd-parser.ts` — keyword-based JD analysis
- `src/lib/agent/evaluator.ts` — 8-dimension rubric, LLM eval prompt builder
- `src/lib/agent/context-manager.ts` — ContextManager class for long sessions

---

## Wave 2 — Integration (ACTIVE)

### Agent 4 — Chat + Streaming (`feat/chat-streaming`)
**Status**: NOT STARTED
**Branch**: `feat/chat-streaming`
**Scope**:
- [ ] POST /api/chat route with Vercel AI SDK streamText
- [ ] Wire AgentPanel to streaming API
- [ ] Integrate ContextManager for context window assembly
- [ ] Integrate InterviewFlow state machine for phase transitions
- [ ] Persist messages to SQLite via db/queries
- [ ] Session creation API (POST /api/sessions)
- [ ] Phase transition detection + prompt injection

**Key dependencies**: system-prompt.ts, interview-flow.ts, context-manager.ts, question-bank.ts, db/queries.ts

---

### Agent 5 — Canvas Vision (`feat/canvas-vision`)
**Status**: NOT STARTED
**Branch**: `feat/canvas-vision`
**Scope**:
- [ ] Canvas capture on interval (every 30s or on significant change)
- [ ] Send canvas PNG to LLM as image attachment
- [ ] Generate text description of whiteboard for context window
- [ ] Store snapshots in SQLite
- [ ] Wire canvas-capture.ts to session page

**Key dependencies**: canvas-capture.ts, excalidraw-editor.tsx, db/queries.ts

---

### Agent 6 — Voice (`feat/voice`)
**Status**: NOT STARTED
**Branch**: `feat/voice`
**Scope**:
- [ ] Web Speech API SpeechRecognition wrapper
- [ ] SpeechSynthesis wrapper for TTS
- [ ] Voice toggle UI in agent panel
- [ ] Auto-send transcribed speech as user message
- [ ] Read assistant responses aloud
- [ ] Fallback handling for unsupported browsers

---

## Wave 3 — Polish (BLOCKED on Wave 2)

### Agent 7 — Scoring + Dashboard (`feat/scoring`)
**Scope**: End-of-session evaluation, progress charts, historical scores

### Agent 8 — Error Recovery (`feat/error-recovery`)
**Scope**: API key validation, reconnection, graceful error states

### Agent 9 — Packaging (`feat/packaging`)
**Scope**: README, npm packaging, Docker support, CLI polish

---

## Merge Log
| Wave | Branches Merged | Date | Conflicts |
|------|----------------|------|-----------|
| Wave 1 | `feat/ui-core`, `feat/agent-brain` | 2026-02-28 | None (clean merge) |

---

## How to Use This File
1. Before starting work, read this file to understand the current state
2. After completing a milestone, check off the item and add to "Completed milestones"
3. After merging a wave, update the Merge Log
4. When a wave completes, update the next wave's status from BLOCKED to active
