# Artifacts — Project State Tracker

This file tracks the state of every piece of work in SysAgent.
All 3 waves are complete. The project is functional end-to-end.

## Status: ALL WAVES COMPLETE

---

## Wave 1 — Foundation (COMPLETE)

### Agent 1 — Foundation
- [x] Next.js 15, TypeScript, Tailwind, pnpm
- [x] Drizzle ORM + better-sqlite3
- [x] DB schema: settings, sessions, messages, snapshots, progress
- [x] CLI entry point (bin/cli.mjs)
- [x] Settings page: provider picker, API key, model selector
- [x] Provider abstraction (OpenAI, Anthropic, Google)
- [x] Shared TypeScript types

### Agent 2 — UI Core
- [x] App layout with resizable split panes
- [x] Excalidraw wrapper component
- [x] Canvas capture with change detection
- [x] Interview setup page (goal, level, JD)
- [x] Session page (canvas left, chat right)
- [x] Session timer, Dashboard page
- [x] Dark theme

### Agent 3 — Agent Brain
- [x] System prompt templates (junior/mid/senior)
- [x] Interview flow state machine (5 phases)
- [x] Question bank: 20 system design problems
- [x] JD parser: keyword-based focus extraction
- [x] Evaluator: 8-dimension scoring rubric
- [x] Context manager: rolling summary + recent buffer

---

## Wave 2 — Integration (COMPLETE)

### Agent 4 — Chat + Streaming
- [x] POST /api/chat with Vercel AI SDK streamText
- [x] POST /api/sessions for session creation with problem matching
- [x] Context manager integration for context window assembly
- [x] Phase transition detection + prompt injection
- [x] Message persistence to SQLite
- [x] Streaming UI with real-time text updates

### Agent 5 — Canvas Vision
- [x] useCanvasVision hook: periodic 30s capture
- [x] POST /api/canvas/describe: LLM vision for whiteboard
- [x] Snapshot storage in SQLite
- [x] Canvas description passed to chat for diagram-aware responses

### Agent 6 — Voice
- [x] useSpeechRecognition: continuous STT with interim results
- [x] useSpeechSynthesis: TTS with natural voice selection
- [x] Voice toggle + auto-read mode in agent panel
- [x] Graceful degradation for unsupported browsers

---

## Wave 3 — Polish (COMPLETE)

### Agent 7 — Scoring + Dashboard
- [x] POST /api/evaluate: LLM scoring with heuristic fallback
- [x] 8-dimension score persistence
- [x] Dashboard: stats overview, skill breakdown bars, session history
- [x] Color-coded scoring, total practice time tracking

### Agent 8 — Error Recovery
- [x] API key validation endpoint
- [x] ErrorBoundary component
- [x] ApiKeyBanner warning
- [x] Layout-level error protection

### Agent 9 — Packaging
- [x] README with full documentation
- [x] CLI polish with data directory creation
- [x] Cost estimates, project structure docs

---

## Merge Log
| Wave | Branches Merged | Date | Conflicts |
|------|----------------|------|-----------|
| Wave 1 | `feat/ui-core`, `feat/agent-brain` | 2026-02-28 | None |
| Wave 2 | `feat/chat-streaming`, `feat/canvas-vision`, `feat/voice` | 2026-02-28 | None |
| Wave 3 | `feat/scoring`, `feat/error-recovery`, `feat/packaging` | 2026-02-28 | None |
