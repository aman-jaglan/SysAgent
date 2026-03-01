# Agent 2 Brief — UI Core

## Branch: `feat/ui-core`
## Status: IN PROGRESS

## Your Mission
Build the complete UI layer: app layout, Excalidraw whiteboard integration, interview setup page, session page, and dashboard skeleton. When you're done, a user can open the app, fill out what they want to practice, and see a split-pane view with Excalidraw on the left and a chat/agent panel on the right.

## Technical Skills You Need

### Excalidraw Integration with Next.js 15
```bash
pnpm add @excalidraw/excalidraw
```

**CRITICAL: Excalidraw CANNOT be server-rendered.** Use this two-file pattern:

File 1 — Client wrapper:
```tsx
"use client";
import { Excalidraw } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import { useState } from "react";

export function ExcalidrawEditor() {
  const [api, setApi] = useState<ExcalidrawImperativeAPI | null>(null);
  return (
    <div style={{ height: "100%", width: "100%" }}>
      <Excalidraw excalidrawAPI={(api) => setApi(api)} />
    </div>
  );
}
```

File 2 — Page (dynamic import with ssr: false):
```tsx
import dynamic from "next/dynamic";
const ExcalidrawEditor = dynamic(
  () => import("@/components/canvas/excalidraw-editor").then(m => m.ExcalidrawEditor),
  { ssr: false }
);
```

### React 18 Compatibility
Excalidraw 0.18.0 has issues with React 19. If Next.js 15 defaults to React 19, you may need to pin React 18:
```json
{ "react": "^18.3.0", "react-dom": "^18.3.0" }
```
Or install with `--legacy-peer-deps`. Test and document whichever works.

### Canvas State Capture (for AI vision later)
```ts
import { exportToBlob, getSceneVersion } from "@excalidraw/excalidraw";

// Check if scene actually changed:
const version = getSceneVersion(api.getSceneElements());

// Export to PNG blob:
const blob = await exportToBlob({
  elements: api.getSceneElements(),
  appState: api.getAppState(),
  files: api.getFiles(),
  mimeType: "image/png",
});
```

### Resizable Split Panes
Use a simple CSS-based approach or a lightweight library. The layout should be:
- Left pane: Excalidraw canvas (resizable, default ~65% width)
- Right pane: Agent panel with chat messages + controls

### Interview Setup Form
The home page should have:
- Textarea: "What do you want to prepare for?" (free text prompt)
- Level selector: Junior / Mid / Senior (radio buttons or segmented control)
- Textarea: "Or paste a job description" (optional)
- "Start Interview" button → creates session, navigates to /session/[id]

## Deliverables

- [ ] App layout (src/app/layout.tsx) with global styles, dark/light theme
- [ ] Home page (src/app/page.tsx) — interview setup form
  - Goal/prompt textarea
  - Level selector (junior/mid/senior)
  - JD paste textarea (optional)
  - Start Interview button
- [ ] Session page (src/app/session/[id]/page.tsx)
  - Resizable split pane layout
  - Left: Excalidraw canvas
  - Right: Agent panel (message list + input area + voice controls placeholder)
  - Session timer (counts up from start)
  - End Session button
- [ ] Excalidraw wrapper component (src/components/canvas/excalidraw-editor.tsx)
  - Client component with "use client"
  - Captures excalidrawAPI handle
  - Exposes API via ref or context
- [ ] Canvas capture utility (src/components/canvas/canvas-capture.ts)
  - Debounced exportToBlob (2s debounce)
  - getSceneVersion tracking to avoid redundant exports
  - Returns PNG blob when canvas changes
- [ ] Dashboard page (src/app/dashboard/page.tsx)
  - Session history list (empty state with message for now)
  - Placeholder for progress charts
- [ ] Session components:
  - AgentPanel (message list + input)
  - SessionTimer
  - InterviewSetup form

## Files You Own
- src/app/page.tsx (interview setup)
- src/app/session/[id]/page.tsx
- src/app/dashboard/page.tsx
- src/app/layout.tsx
- src/components/canvas/* (excalidraw-editor.tsx, canvas-capture.ts)
- src/components/session/* (agent-panel.tsx, session-timer.tsx, interview-setup.tsx)
- src/components/dashboard/* (session-history.tsx)

## Important Notes
- DO NOT create database queries or API routes — Agent 1 handles DB, Agent 4 handles API routes
- For any data fetching, create placeholder functions with TODO comments
- The agent panel should accept messages as props — don't wire up real LLM calls
- Focus on layout, components, and user interaction patterns

## Commit Convention
No "Co-Authored-By" ever. Use:
```
feat(layout): add split-pane app layout with resizable panels
feat(canvas): integrate excalidraw with api handle capture
feat(session): add session page with canvas and agent panel
feat(setup): add interview setup form with level selector
feat(dashboard): add session history page skeleton
```
