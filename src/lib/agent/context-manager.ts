import type { ContextWindow, Message } from "@/types";

const MAX_RECENT_MESSAGES = 12;
const SUMMARY_TRIGGER_COUNT = 20;
const MAX_CONTEXT_CHARS = 80_000; // ~20K tokens, leaves room for system prompt

interface ContextManagerState {
  systemPrompt: string;
  userProfile: string;
  rollingSummary: string;
  allMessages: Message[];
  canvasContext: string;
}

/**
 * Manages the context window for long-running interview sessions (up to 2 hours).
 *
 * Strategy:
 * - System prompt: always pinned at the top (never compressed)
 * - User profile: level, goal, JD summary (always included)
 * - Rolling summary: compressed version of older conversation turns
 * - Recent messages: last N messages kept verbatim for coherent conversation
 * - Canvas context: latest whiteboard description
 *
 * When the context grows too large, older messages get compressed into the
 * rolling summary. This keeps the active context under the token limit
 * while preserving the full conversation arc.
 */
export class ContextManager {
  private state: ContextManagerState;
  private summaryVersion: number = 0;

  constructor(systemPrompt: string, userProfile: string) {
    this.state = {
      systemPrompt,
      userProfile,
      rollingSummary: "",
      allMessages: [],
      canvasContext: "",
    };
  }

  /**
   * Add a new message and check if compression is needed.
   */
  addMessage(message: Message): void {
    this.state.allMessages.push(message);

    if (this.shouldCompress()) {
      this.compress();
    }
  }

  /**
   * Update the canvas context with the latest whiteboard description.
   */
  updateCanvas(description: string): void {
    this.state.canvasContext = description;
  }

  /**
   * Update the rolling summary (called after LLM summarization).
   */
  updateSummary(summary: string): void {
    this.state.rollingSummary = summary;
    this.summaryVersion++;
  }

  /**
   * Build the context window to send to the LLM.
   * Returns structured context that fits within token limits.
   */
  buildContextWindow(): ContextWindow {
    const recentMessages = this.getRecentMessages();

    return {
      systemPrompt: this.state.systemPrompt,
      userProfile: this.state.userProfile,
      rollingSummary: this.state.rollingSummary,
      recentMessages,
      canvasContext: this.state.canvasContext,
    };
  }

  /**
   * Assemble the full message array for the LLM API call.
   */
  buildMessages(): Array<{ role: "system" | "user" | "assistant"; content: string }> {
    const ctx = this.buildContextWindow();
    const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [];

    // System prompt always first
    let systemContent = ctx.systemPrompt;

    if (ctx.userProfile) {
      systemContent += `\n\n## Candidate Profile\n${ctx.userProfile}`;
    }

    if (ctx.rollingSummary) {
      systemContent += `\n\n## Conversation So Far (Summary)\n${ctx.rollingSummary}`;
    }

    if (ctx.canvasContext) {
      systemContent += `\n\n## Current Whiteboard State\n${ctx.canvasContext}`;
    }

    messages.push({ role: "system", content: systemContent });

    // Recent messages as conversation history
    for (const msg of ctx.recentMessages) {
      if (msg.role === "user" || msg.role === "assistant") {
        messages.push({ role: msg.role, content: msg.content });
      }
    }

    return messages;
  }

  /**
   * Build the summarization prompt for compressing older messages.
   * This prompt is sent to the LLM to generate a new rolling summary.
   */
  buildSummarizationPrompt(): string {
    const messagesToSummarize = this.getMessagesToCompress();

    const conversationChunk = messagesToSummarize
      .map(
        (m) =>
          `${m.role === "user" ? "CANDIDATE" : m.role === "assistant" ? "INTERVIEWER" : "SYSTEM"}: ${m.content}`
      )
      .join("\n\n");

    const existingSummary = this.state.rollingSummary
      ? `Previous summary:\n${this.state.rollingSummary}\n\n`
      : "";

    return `${existingSummary}New conversation to incorporate:
${conversationChunk}

Produce an updated summary that captures:
1. Key requirements discussed and decisions made
2. Components the candidate has designed so far
3. Important tradeoffs mentioned
4. Any areas where the candidate struggled or excelled
5. Current state of the design discussion

Keep the summary concise (under 500 words). Focus on information the interviewer needs to ask good follow-up questions. Do not include verbatim quotes.`;
  }

  /**
   * Check if the context needs compression.
   */
  shouldCompress(): boolean {
    // Compress when we have more messages than the recent buffer
    if (this.state.allMessages.length > SUMMARY_TRIGGER_COUNT) {
      return true;
    }

    // Also compress if total character count is getting large
    const totalChars = this.estimateContextSize();
    return totalChars > MAX_CONTEXT_CHARS;
  }

  /**
   * Get all messages (for persistence/export).
   */
  getAllMessages(): Message[] {
    return [...this.state.allMessages];
  }

  /**
   * Get the current rolling summary.
   */
  getSummary(): string {
    return this.state.rollingSummary;
  }

  /**
   * Get message count for phase transition decisions.
   */
  getMessageCount(): number {
    return this.state.allMessages.length;
  }

  /**
   * Get elapsed minutes since a given start time.
   */
  getElapsedMinutes(startedAt: number): number {
    return (Date.now() - startedAt) / (1000 * 60);
  }

  // --- Private helpers ---

  private getRecentMessages(): Message[] {
    return this.state.allMessages.slice(-MAX_RECENT_MESSAGES);
  }

  private getMessagesToCompress(): Message[] {
    // Everything except the most recent messages
    const cutoff = this.state.allMessages.length - MAX_RECENT_MESSAGES;
    if (cutoff <= 0) return [];
    return this.state.allMessages.slice(0, cutoff);
  }

  private compress(): void {
    // Mark older messages for summarization.
    // Actual summarization happens asynchronously via the LLM —
    // the caller should use buildSummarizationPrompt() and then
    // call updateSummary() with the result.
    //
    // After summarization, we can trim the allMessages array:
    const cutoff = this.state.allMessages.length - MAX_RECENT_MESSAGES;
    if (cutoff > 0 && this.state.rollingSummary) {
      // Only trim after we have a summary that covers these messages
      this.state.allMessages = this.state.allMessages.slice(cutoff);
    }
  }

  private estimateContextSize(): number {
    let size = this.state.systemPrompt.length;
    size += this.state.userProfile.length;
    size += this.state.rollingSummary.length;
    size += this.state.canvasContext.length;

    for (const msg of this.state.allMessages) {
      size += msg.content.length;
    }

    return size;
  }
}

/**
 * Build a user profile string from session configuration.
 */
export function buildUserProfile(config: {
  level: string;
  goal: string;
  jd?: string;
  weakAreas?: string[];
}): string {
  let profile = `Level: ${config.level}\nGoal: ${config.goal}`;

  if (config.jd) {
    profile += `\nJob Description Focus: ${config.jd.slice(0, 300)}`;
  }

  if (config.weakAreas && config.weakAreas.length > 0) {
    profile += `\nAreas to improve (from previous sessions): ${config.weakAreas.join(", ")}`;
  }

  return profile;
}
