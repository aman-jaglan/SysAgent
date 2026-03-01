import { streamText } from "ai";
import { nanoid } from "nanoid";
import { getModel } from "@/lib/providers/model";
import { getSetting } from "@/lib/db/queries";
import { addMessage, getMessages, getSession } from "@/lib/db/queries";
import { buildSystemPrompt } from "@/lib/agent/system-prompt";
import { getProblemById } from "@/lib/agent/question-bank";
import {
  createInterviewState,
  shouldTransition,
  transitionPhase,
  getPhasePrompt,
} from "@/lib/agent/interview-flow";
import { ContextManager, buildUserProfile } from "@/lib/agent/context-manager";
import type { InterviewLevel, InterviewPhase, Message, Provider } from "@/types";

// In-memory session state (per-server-process)
const sessionStates = new Map<
  string,
  {
    interviewState: ReturnType<typeof createInterviewState>;
    contextManager: ContextManager;
    messageCount: number;
  }
>();

function getOrCreateSessionState(
  sessionId: string,
  problemId: string,
  level: InterviewLevel,
  systemPrompt: string,
  userProfile: string
) {
  let state = sessionStates.get(sessionId);
  if (!state) {
    state = {
      interviewState: createInterviewState(problemId, level),
      contextManager: new ContextManager(systemPrompt, userProfile),
      messageCount: 0,
    };
    sessionStates.set(sessionId, state);
  }
  return state;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      sessionId,
      message,
      problemId,
      level,
      goal,
      jd,
      canvasDescription,
      previousSessionSummary,
      weakAreas,
    } = body as {
      sessionId: string;
      message: string;
      problemId: string;
      level: InterviewLevel;
      goal: string;
      jd?: string;
      canvasDescription?: string;
      previousSessionSummary?: string;
      weakAreas?: string[];
    };

    if (!sessionId || !problemId || !level) {
      return new Response(
        JSON.stringify({ error: "sessionId, problemId, and level are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Get provider config
    const provider = (getSetting("provider") as Provider) || "openai";
    const model = getSetting("model") || "gpt-5-mini";
    const apiKey = getSetting("api_key");

    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: "No API key configured. Please set one in Settings.",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Set the API key in the environment
    const envKey =
      provider === "openai"
        ? "OPENAI_API_KEY"
        : provider === "anthropic"
          ? "ANTHROPIC_API_KEY"
          : "GOOGLE_GENERATIVE_AI_API_KEY";
    process.env[envKey] = apiKey;

    // Get the problem details
    const problem = getProblemById(problemId);
    if (!problem) {
      return new Response(
        JSON.stringify({ error: "Problem not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Build user profile
    const userProfile = buildUserProfile({ level, goal, jd, weakAreas });

    // Get or create session state
    const state = getOrCreateSessionState(
      sessionId,
      problemId,
      level,
      "", // will be set below
      userProfile
    );

    // Check for phase transitions
    const elapsedMinutes = state.contextManager.getElapsedMinutes(
      state.interviewState.startedAt
    );
    const transition = shouldTransition(
      state.interviewState,
      state.messageCount,
      elapsedMinutes
    );

    if (transition.should && transition.nextPhase) {
      state.interviewState = transitionPhase(
        state.interviewState,
        transition.nextPhase
      );
    }

    // Build system prompt with current phase
    const systemPrompt = buildSystemPrompt({
      level,
      goal,
      jd,
      phase: state.interviewState.phase,
      problemTitle: problem.title,
      problemDescription: problem.description,
      canvasDescription,
      weakAreas,
      previousSessionSummary,
    });

    // Update context manager
    state.contextManager = new ContextManager(systemPrompt, userProfile);

    // Load existing messages from DB into context
    const existingMessages = getMessages(sessionId);
    for (const msg of existingMessages) {
      state.contextManager.addMessage({
        id: msg.id,
        role: msg.role as Message["role"],
        content: msg.content,
        createdAt: msg.createdAt,
      });
    }

    // Add the new user message
    if (message) {
      const userMsg: Message = {
        id: nanoid(12),
        role: "user",
        content: message,
        createdAt: Date.now(),
      };
      state.contextManager.addMessage(userMsg);
      state.messageCount++;

      // Persist user message
      addMessage({
        id: userMsg.id,
        sessionId,
        role: "user",
        content: message,
      });
    }

    // Build the messages array for the LLM
    const llmMessages = state.contextManager.buildMessages();

    // Add phase prompt as additional system context
    const phasePrompt = getPhasePrompt(state.interviewState);
    if (llmMessages.length > 0 && llmMessages[0].role === "system") {
      llmMessages[0].content += phasePrompt;
    }

    // Stream the response
    const result = streamText({
      model: getModel(provider, model),
      messages: llmMessages,
    });

    // Collect the full response for persistence
    const assistantMsgId = nanoid(12);
    let fullResponse = "";

    const originalStream = result.textStream;

    // Create a transform that captures the response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of originalStream) {
            fullResponse += chunk;
            controller.enqueue(encoder.encode(chunk));
          }
          controller.close();

          // Persist assistant message after stream completes
          if (fullResponse) {
            addMessage({
              id: assistantMsgId,
              sessionId,
              role: "assistant",
              content: fullResponse,
            });
            state.messageCount++;

            // Add to context manager
            state.contextManager.addMessage({
              id: assistantMsgId,
              role: "assistant",
              content: fullResponse,
              createdAt: Date.now(),
            });

            // Track requirements and components from conversation
            updateInterviewTracking(state, message, fullResponse);
          }
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Session-Phase": state.interviewState.phase,
        "X-Message-Count": String(state.messageCount),
        ...(transition.should && transition.nextPhase
          ? {
              "X-Phase-Transition": transition.nextPhase,
              "X-Transition-Reason": transition.reason || "",
            }
          : {}),
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to generate response",
        details: error instanceof Error ? error.message : String(error),
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

/**
 * Track what the candidate discusses for phase-aware prompting.
 */
function updateInterviewTracking(
  state: ReturnType<typeof getOrCreateSessionState>,
  userMessage: string,
  assistantResponse: string
) {
  const lower = userMessage?.toLowerCase() || "";
  const interviewState = state.interviewState;

  // Track requirements discussed
  const requirementSignals = [
    "users",
    "scale",
    "latency",
    "availability",
    "consistency",
    "throughput",
    "storage",
    "bandwidth",
    "read/write",
    "SLA",
    "regions",
    "data retention",
  ];

  for (const signal of requirementSignals) {
    if (
      lower.includes(signal.toLowerCase()) &&
      !interviewState.requirementsCovered.includes(signal)
    ) {
      interviewState.requirementsCovered.push(signal);
    }
  }

  // Track components identified
  const componentSignals = [
    "load balancer",
    "database",
    "cache",
    "message queue",
    "CDN",
    "API gateway",
    "application server",
    "web server",
    "object storage",
    "search",
    "notification",
    "scheduler",
  ];

  for (const signal of componentSignals) {
    if (
      lower.includes(signal.toLowerCase()) &&
      !interviewState.componentsIdentified.includes(signal)
    ) {
      interviewState.componentsIdentified.push(signal);
    }
  }
}
