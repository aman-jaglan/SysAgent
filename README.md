# SysAgent

AI-powered system design interview coach. Practice with an interviewer that talks, sees your whiteboard, and adapts to your level.

**Bring your own API key. No signup. No cloud. Runs locally.**

> Stop paying $200/session for human mock interviews. SysAgent costs $0.50-$5 per session using your own API key.

## Quick Start

```bash
git clone https://github.com/aman-jaglan/SysAgent.git
cd SysAgent
pnpm install
pnpm dev
```

Open http://localhost:3000, go to **Settings**, add your API key, and start practicing.

## Features

- **Real-time voice conversations** — speak naturally using your browser's built-in speech recognition (free, no API needed for voice)
- **Whiteboard awareness** — draw on the integrated Excalidraw canvas and the AI sees and references your diagrams
- **Adaptive difficulty** — junior, mid-level, and senior modes with different questioning depth
- **Phase-based interviews** — structured flow from requirements gathering through deep dives, just like real interviews
- **20 system design problems** — URL shortener, Twitter feed, chat systems, distributed cache, recommendation engines, and more
- **8-dimension scoring** — get scored on requirements, high-level design, API design, data model, scalability, reliability, communication, and tradeoff analysis
- **Cross-session progress tracking** — see your improvement over time with skill breakdown charts
- **Job description matching** — paste a JD and get problems tailored to the role
- **Multi-provider support** — works with OpenAI, Anthropic, and Google AI
- **2-hour sessions** without losing context (rolling summary + recent buffer)

## Supported Models

| Provider | Models | Setup |
|----------|--------|-------|
| OpenAI | GPT-5, GPT-5 Mini, GPT-4.1, GPT-4o | `OPENAI_API_KEY` |
| Anthropic | Claude Sonnet 4.6, Claude Haiku 4.5, Claude Opus 4.6 | `ANTHROPIC_API_KEY` |
| Google | Gemini 2.5 Flash, Gemini 2.5 Pro | `GOOGLE_GENERATIVE_AI_API_KEY` |

## How It Works

1. **Setup** — choose your interview level, describe your preparation goal, optionally paste a job description
2. **Requirements** — the AI presents a problem and you ask clarifying questions (like a real interview)
3. **High-Level Design** — sketch your architecture on the whiteboard while discussing with the AI
4. **Deep Dive** — the AI probes specific components, database schemas, failure modes, and scaling strategies
5. **Wrap Up** — get detailed feedback with scores across 8 dimensions and suggestions for improvement

The AI acts like a Staff Engineer interviewer — it asks one question at a time, uses the Socratic method, references your specific diagrams, and never gives you the answer.

## Requirements

- Node.js 18+
- pnpm (`npm install -g pnpm` if you don't have it)
- An API key from OpenAI, Anthropic, or Google AI

## Tech Stack

- **Next.js 15** — React framework with App Router
- **Vercel AI SDK 6** — multi-provider streaming
- **Excalidraw** — collaborative whiteboard
- **Web Speech API** — free browser-native STT/TTS
- **SQLite + Drizzle ORM** — local persistence, zero config
- **Tailwind CSS** — dark theme UI

## Project Structure

```
src/
├── app/                    # Next.js pages and API routes
│   ├── api/chat/           # Streaming chat endpoint
│   ├── api/canvas/         # Whiteboard vision endpoint
│   ├── api/evaluate/       # Session scoring endpoint
│   ├── api/sessions/       # Session CRUD
│   ├── api/settings/       # Provider config + validation
│   ├── dashboard/          # Progress tracking page
│   ├── session/[id]/       # Interview session page
│   └── settings/           # API key configuration
├── components/
│   ├── canvas/             # Excalidraw wrapper + capture
│   ├── session/            # Chat panel + timer
│   ├── error-boundary.tsx  # Error handling
│   └── api-key-banner.tsx  # Setup reminder
├── hooks/
│   ├── use-canvas-vision.ts    # Periodic whiteboard capture
│   ├── use-speech-recognition.ts # Browser STT
│   └── use-speech-synthesis.ts   # Browser TTS
├── lib/
│   ├── agent/              # Interview AI brain
│   │   ├── system-prompt.ts    # Dynamic prompt builder
│   │   ├── interview-flow.ts   # Phase state machine
│   │   ├── question-bank.ts    # 20 problems
│   │   ├── jd-parser.ts        # Job description analyzer
│   │   ├── evaluator.ts        # 8-dimension scoring
│   │   └── context-manager.ts  # Long session context
│   ├── db/                 # SQLite database layer
│   └── providers/          # Multi-provider model abstraction
└── types/                  # Shared TypeScript types
```

## Cost Estimate

Voice is free (browser-native). LLM costs depend on your provider and model:

| Model | Estimated Cost per Session |
|-------|---------------------------|
| GPT-5 Mini / Claude Haiku | $0.10 - $0.50 |
| GPT-5 / Claude Sonnet | $0.50 - $2.00 |
| Claude Opus / Gemini Pro | $2.00 - $5.00 |

Sessions typically use 10K-50K tokens depending on length and whether canvas vision is active.

## Contributing

Contributions welcome! This project uses:
- `pnpm` for package management
- Conventional commits (`feat:`, `fix:`, `docs:`)
- TypeScript strict mode

## License

MIT
