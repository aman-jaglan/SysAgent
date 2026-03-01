# Agent 1 Brief — Foundation

## Branch: `feat/foundation`
## Status: IN PROGRESS

## Your Mission
Set up the entire project skeleton: Next.js 15, TypeScript, Tailwind v4, SQLite database with Drizzle ORM, provider abstraction for LLM APIs, settings page, and CLI entry point.

When you're done, another developer should be able to clone the repo, run `pnpm install && pnpm dev`, and see a working Next.js app with a settings page where they can configure their LLM provider and API key.

## Technical Skills You Need

### Next.js 15 Setup (pnpm)
```bash
pnpm create next-app@latest . --yes
# This gives: TypeScript, ESLint, Tailwind CSS v4, App Router, Turbopack
```

### Tailwind CSS v4 (NOT v3)
- No `tailwind.config.js` — configuration is in CSS
- `postcss.config.mjs`:
```js
const config = { plugins: { "@tailwindcss/postcss": {} } };
export default config;
```
- `globals.css`: `@import "tailwindcss";`
- Theme customization uses `@theme { }` blocks in CSS

### Drizzle ORM + SQLite
```bash
pnpm add drizzle-orm better-sqlite3
pnpm add -D drizzle-kit @types/better-sqlite3
```
- `drizzle.config.ts`:
```ts
import { defineConfig } from 'drizzle-kit';
export default defineConfig({
  out: './drizzle',
  schema: './src/lib/db/schema.ts',
  dialect: 'sqlite',
  dbCredentials: { url: './data/sysagent.db' },
});
```
- Schema uses: `sqliteTable()`, `t.int()`, `t.text()`, `t.blob()`, `t.real()`
- Connection: `import { drizzle } from 'drizzle-orm/better-sqlite3';`

### Vercel AI SDK (multi-provider)
```bash
pnpm add ai @ai-sdk/openai @ai-sdk/anthropic @ai-sdk/google @ai-sdk/react
```
- Environment variables auto-read: OPENAI_API_KEY, ANTHROPIC_API_KEY, GOOGLE_GENERATIVE_AI_API_KEY
- Provider usage:
```ts
import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { google } from '@ai-sdk/google';
// model = openai('gpt-5') or anthropic('claude-sonnet-4-6') or google('gemini-2.5-flash')
```

### CLI Entry Point
```bash
pnpm add open
```
- `bin/cli.ts`: starts next dev server, uses `open` package to launch browser
- `package.json` needs `"bin": { "sysagent": "./bin/cli.mjs" }`

## Deliverables (check off as you complete)

- [ ] Next.js 15 project initialized with pnpm
- [ ] TypeScript strict mode enabled
- [ ] Tailwind CSS v4 configured
- [ ] Directory structure: src/app, src/lib, src/components, src/types, bin, data, drizzle
- [ ] Drizzle ORM + better-sqlite3 installed and configured
- [ ] Database schema created:
  - settings (key TEXT PK, value TEXT)
  - sessions (id, topic, level, goal, jd, started_at, ended_at, summary, scores)
  - messages (id, session_id FK, role, content, created_at)
  - snapshots (id, session_id FK, image_blob, description, created_at)
  - progress (id, session_id FK, dimension, score, feedback, created_at)
- [ ] Database initialization helper (auto-creates data/ dir and runs migrations)
- [ ] Provider abstraction: src/lib/providers/model.ts
  - getModel(provider, modelId) → returns AI SDK model instance
  - Supports: openai, anthropic, google
- [ ] Settings page at /settings
  - Provider dropdown (OpenAI, Anthropic, Google, DeepSeek, xAI)
  - API key input (masked)
  - Model selector (populated based on provider)
  - Save to SQLite settings table
- [ ] .env.example with all provider API key options
- [ ] CLI entry point: bin/cli.ts
- [ ] data/ directory with .gitkeep (db files gitignored)
- [ ] Package.json scripts: dev, build, start, db:generate, db:migrate

## Files You Own
- package.json, tsconfig.json, next.config.ts, postcss.config.mjs
- drizzle.config.ts
- src/lib/db/* (schema.ts, index.ts, queries.ts)
- src/lib/providers/* (model.ts)
- src/app/settings/* (page.tsx)
- bin/cli.ts
- .env.example
- drizzle/*
- data/.gitkeep

## Commit Convention
No "Co-Authored-By" ever. Use:
```
feat(db): add drizzle schema for sessions and messages
feat(providers): add multi-provider model abstraction
feat(settings): add provider configuration page
feat(cli): add sysagent binary entry point
```
