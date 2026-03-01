# SysAgent

An open-source AI-powered system design interview coach. Practice with an agent that talks, sees your whiteboard, and behaves like a real interviewer.

> Stop paying $200/session for human mock interviews. SysAgent costs $0.50-$5 per session using your own API key.

## Quick Start

```bash
pnpm add -g sysagent
sysagent
```

Or clone and run:

```bash
git clone https://github.com/aman-jaglan/SysAgent.git
cd SysAgent
cp .env.example .env.local  # add your API key
pnpm install
pnpm dev
```

Browser opens. Pick what to practice. Start interviewing.

## Features

- **Voice conversation** with your AI interviewer (browser-based, free)
- **Excalidraw whiteboard** the agent can see and comment on
- **Adapts to your level** junior, mid, or senior
- **Paste a job description** and get targeted practice
- **Progress tracking** across sessions with scoring on 8 dimensions
- **2-hour sessions** without losing context
- **Any LLM provider** OpenAI, Anthropic, Google, DeepSeek, xAI

## Supported Providers

| Provider | Models | Setup |
|---|---|---|
| Anthropic | Claude Opus 4.6, Sonnet 4.6, Haiku 4.5 | `ANTHROPIC_API_KEY` |
| OpenAI | GPT-5, GPT-5 Mini, GPT-4.1 | `OPENAI_API_KEY` |
| Google | Gemini 2.5 Pro, Gemini 2.5 Flash | `GOOGLE_AI_API_KEY` |
| DeepSeek | DeepSeek R1, V3 | `DEEPSEEK_API_KEY` |
| xAI | Grok | `XAI_API_KEY` |

## How It Works

1. You tell the agent what you want to practice and your level
2. Agent picks a relevant system design problem
3. You draw on the whiteboard, talk through your design
4. Agent asks follow-up questions, challenges your decisions
5. At the end, you get scored across 8 dimensions
6. Track your progress over multiple sessions

## Tech Stack

- Next.js 15, TypeScript, Tailwind CSS
- Vercel AI SDK (multi-provider LLM support)
- Excalidraw (whiteboard)
- SQLite + Drizzle ORM (local progress tracking)
- Web Speech API (voice, free)

## License

MIT
