# Agent 3 Brief — Agent Brain

## Branch: `feat/agent-brain`
## Status: IN PROGRESS

## Your Mission
Build the intelligence layer: system prompts that make the AI behave like a real interviewer, an interview flow state machine, a curated question bank of 20+ system design problems, a JD parser, a session evaluator, and the context management system for 2-hour sessions.

This is the MOST IMPORTANT part of the project. The quality of the system prompts and interview flow directly determines whether SysAgent is better than a human interviewer.

## What Makes a Great System Design Interviewer

A great interviewer:
1. Starts with an open-ended problem, lets the candidate drive
2. Asks clarifying questions when the candidate makes assumptions
3. Pushes back on weak decisions: "Why SQL and not NoSQL here?"
4. Adapts depth based on seniority — guides juniors, grills seniors
5. References the candidate's diagram: "I see you have X, but what about Y?"
6. Knows when to move the conversation forward vs. when to deep dive
7. Evaluates structured thinking, not just correctness
8. Gives actionable feedback at the end

## Deliverables

### 1. System Prompts (src/lib/agent/system-prompt.ts)
Create prompt templates for each level:

**Junior Level Prompt Behavior:**
- Guide more, challenge less
- Suggest areas to think about when candidate is stuck
- Focus on: can they identify basic components? do they understand client-server?
- Prompt structures like: "Good start. Have you thought about how [X] would work?"

**Mid Level Prompt Behavior:**
- Balanced guidance and challenge
- Expect them to drive the conversation
- Focus on: scalability, database choices, caching, API design
- Prompt structures like: "Interesting choice. What are the tradeoffs compared to [alternative]?"

**Senior Level Prompt Behavior:**
- Minimal guidance, maximum challenge
- Expect deep expertise on tradeoffs
- Focus on: failure modes, consistency models, distributed systems edge cases
- Prompt structures like: "Walk me through what happens when [failure scenario]"
- Ask about operational concerns: monitoring, deployment, cost

The system prompt should include:
- The interviewer persona (professional, encouraging but rigorous)
- The user's stated goal and level
- Parsed JD focus areas (if JD was provided)
- Current interview phase (requirements, high-level, deep dive, etc.)
- Instructions for how to handle the Excalidraw context (when provided)
- Weak areas from previous sessions (when available)
- Rules: don't give answers directly, guide through questions, reference the diagram

### 2. Interview Flow State Machine (src/lib/agent/interview-flow.ts)
```
States: SETUP → REQUIREMENTS → HIGH_LEVEL → DEEP_DIVE → WRAP_UP

SETUP:
  - Agent presents the problem
  - Transitions to REQUIREMENTS when candidate starts asking questions

REQUIREMENTS (5-8 min):
  - Candidate asks clarifying questions
  - Agent answers like a PM would (scope, users, scale)
  - Track: did they ask about scale? read/write ratio? users? SLAs?
  - Transition to HIGH_LEVEL when candidate says "let me start designing"
    or after sufficient requirements gathered

HIGH_LEVEL (10-15 min):
  - Candidate draws major components on Excalidraw
  - Agent watches and asks "walk me through the flow"
  - Track: did they identify all major components?
  - Transition to DEEP_DIVE after basic architecture is drawn

DEEP_DIVE (15-20 min):
  - Agent picks the weakest/most interesting component
  - Probes: database schema, API design, caching strategy, etc.
  - Can do multiple deep dives on different components
  - Transition to WRAP_UP when time is appropriate or depth is sufficient

WRAP_UP (5 min):
  - Agent summarizes what was covered
  - Highlights strengths and areas for improvement
  - Scores the session
```

Export a function that builds the phase-specific prompt injection given the current state.

### 3. Question Bank (src/lib/agent/question-bank.ts)
Create 20+ system design problems, categorized:

**Classic System Design:**
- Design a URL shortener (junior-friendly)
- Design Twitter/X feed
- Design a chat system (WhatsApp/Slack)
- Design a notification system
- Design a rate limiter
- Design a web crawler
- Design YouTube/video streaming
- Design Uber/ride sharing
- Design an e-commerce platform
- Design a search autocomplete

**Infrastructure & Backend:**
- Design a distributed cache
- Design a task queue / job scheduler
- Design a logging & monitoring system
- Design an API gateway
- Design a CDN

**ML System Design:**
- Design a recommendation system
- Design a content moderation pipeline
- Design a search ranking system
- Design a fraud detection system
- Design a real-time feature store

Each problem should include:
- `id`, `title`, `category`, `difficulty` (junior/mid/senior)
- `description` (1-2 sentence problem statement for the candidate)
- `key_components` (what a good design should include)
- `follow_up_questions` (probing questions for deep dive)
- `common_mistakes` (what candidates typically miss)
- `tags` (for matching against JD keywords)

### 4. JD Parser (src/lib/agent/jd-parser.ts)
A function that takes a raw job description text and extracts:
- `role_level`: junior/mid/senior (from title and requirements)
- `focus_areas`: list of technical areas mentioned (databases, distributed systems, ML, etc.)
- `relevant_problems`: IDs from the question bank that match the JD
- `key_technologies`: specific tech mentioned (Kafka, Redis, PostgreSQL, etc.)

This can be a simple keyword extraction — doesn't need LLM for parsing. Use regex and keyword matching against the question bank tags.

### 5. Evaluator (src/lib/agent/evaluator.ts)
A function that takes the session transcript and produces scores.

Scoring dimensions (1-10 each):
```typescript
interface SessionScore {
  requirement_gathering: number;  // Did they ask the right questions?
  high_level_design: number;      // Reasonable architecture?
  api_design: number;             // Clean interfaces?
  data_model: number;             // Appropriate schema choices?
  scalability: number;            // Horizontal scaling, caching, CDN?
  reliability: number;            // Failure handling, redundancy?
  communication: number;          // Structured thinking, clear explanation?
  tradeoff_analysis: number;      // Justified decisions?
  overall: number;                // Weighted average
}
```

The evaluator should return a prompt that asks the LLM to score the session, with clear rubrics for each dimension.

### 6. Context Manager (src/lib/agent/context-manager.ts)
Manages the context window for 2-hour sessions:

```typescript
interface ContextWindow {
  systemPrompt: string;           // Pinned, ~3K tokens
  userProfile: string;            // From past sessions, ~1K tokens
  rollingSummary: string;         // Compressed older conversation, ~3-5K tokens
  recentMessages: Message[];      // Last 10-12 exchanges, ~15K tokens
  canvasContext: string;          // Latest diagram description, ~1-2K tokens
}
```

Functions:
- `buildContext(session, messages, canvasDescription)` → assembled prompt
- `shouldSummarize(messages)` → true when buffer exceeds threshold
- `generateSummaryPrompt(oldMessages, existingSummary)` → prompt to compress
- `getRecentMessages(messages, limit)` → last N exchanges

## Files You Own
- src/lib/agent/system-prompt.ts
- src/lib/agent/interview-flow.ts
- src/lib/agent/question-bank.ts
- src/lib/agent/jd-parser.ts
- src/lib/agent/evaluator.ts
- src/lib/agent/context-manager.ts
- src/types/index.ts (shared types: Session, Message, Score, InterviewPhase, etc.)

## Important Notes
- DO NOT import from database or provider modules — those are Agent 1's domain
- Define clean TypeScript interfaces that other agents will implement against
- The types file (src/types/index.ts) is critical — other agents depend on it
- Focus on the QUALITY of prompts and interview logic, not on wiring things up
- Every system prompt should be tested by reading it and asking "would this make a good interviewer?"

## Commit Convention
No "Co-Authored-By" ever. Use:
```
feat(prompts): add system prompt templates for junior/mid/senior
feat(flow): add interview state machine with phase transitions
feat(questions): add 20+ system design problems with metadata
feat(jd): add job description parser with keyword extraction
feat(eval): add session evaluator with 8-dimension scoring
feat(context): add context manager for 2-hour sessions
feat(types): add shared TypeScript interfaces
```
