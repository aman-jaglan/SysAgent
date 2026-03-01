# CLAUDE.md - Project Rules for All Agents

## Project: SysAgent
An open-source AI system design interview coach. Users provide their own LLM API key, run locally, practice system design with a voice + whiteboard AI interviewer.

## Commit Rules
- NEVER include "Co-Authored-By" in any commit message
- Use conventional commits: `feat(scope): message`, `fix(scope): message`, `chore(scope): message`
- Keep commits small and atomic — one logical change per commit
- Commit messages should be clear and descriptive
- Commit frequently — every meaningful piece of work gets its own commit

## Tech Stack (DO NOT deviate)
- **Runtime**: Node.js + TypeScript (strict mode)
- **Framework**: Next.js 15 (App Router)
- **Package Manager**: pnpm (NOT npm, NOT yarn)
- **Styling**: Tailwind CSS v4
- **LLM**: Vercel AI SDK with @ai-sdk/openai, @ai-sdk/anthropic, @ai-sdk/google
- **Whiteboard**: @excalidraw/excalidraw
- **Database**: SQLite via better-sqlite3 + Drizzle ORM
- **Voice**: Browser Web Speech API (SpeechRecognition + SpeechSynthesis)

## Code Conventions
- Use `src/` directory for all source code
- Use path aliases: `@/` maps to `src/`
- Prefer named exports over default exports
- Use Zod for runtime validation
- No `any` types — use `unknown` and narrow
- Functional components only, no class components
- Use server components by default, `"use client"` only when needed
- File naming: kebab-case for files, PascalCase for components

## Project Structure
```
src/
  app/           # Next.js app router pages and API routes
  components/    # React components organized by feature
  lib/           # Core logic (providers, agent, canvas, db)
  types/         # Shared TypeScript types
bin/             # CLI entry point
data/            # SQLite database (gitignored)
drizzle/         # Database migrations
artifacts/       # Agent work tracking (see ARTIFACTS.md)
```

## Key Design Decisions
- No authentication — single user, local tool
- No cloud services required — everything runs locally
- Users bring their own API keys for LLM providers
- Browser Web Speech API for voice (free, no API key needed)
- SQLite for all persistence (sessions, progress, settings)
- Vercel AI SDK handles multi-provider abstraction (NOT LiteLLM)

## Agent Behavior
- Each agent works on its own feature branch
- Read ARTIFACTS.md before starting work to understand current state
- Update your agent's artifact file when completing milestones
- Never modify files outside your assigned scope without coordination
- If you encounter a dependency on another agent's work, stub it with a TODO comment
- Run `pnpm typecheck` before committing if tsconfig exists
- Run `pnpm lint` before committing if eslint is configured
