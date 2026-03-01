import { generateText } from "ai";
import { nanoid } from "nanoid";
import { getModel } from "@/lib/providers/model";
import {
  getSetting,
  getMessages,
  getSession,
  getSnapshots,
  updateSession,
  addProgress,
} from "@/lib/db/queries";
import {
  buildEvaluationPrompt,
  parseEvaluationResponse,
  quickScore,
} from "@/lib/agent/evaluator";
import type { InterviewLevel, Message, Provider, ScoreDimension } from "@/types";

export async function POST(req: Request) {
  try {
    const { sessionId } = (await req.json()) as { sessionId: string };

    if (!sessionId) {
      return Response.json(
        { error: "sessionId is required" },
        { status: 400 }
      );
    }

    const session = getSession(sessionId);
    if (!session) {
      return Response.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    const provider = (getSetting("provider") as Provider) || "openai";
    const model = getSetting("model") || "gpt-5-mini";
    const apiKey = getSetting("apiKey");

    const dbMessages = getMessages(sessionId);
    const messages: Message[] = dbMessages.map((m) => ({
      id: m.id,
      role: m.role as Message["role"],
      content: m.content,
      createdAt: m.createdAt,
    }));

    const snapshots = getSnapshots(sessionId);
    const canvasDescriptions = snapshots
      .map((s) => s.description)
      .filter(Boolean) as string[];

    // Try LLM evaluation first, fall back to heuristic
    let evaluationResult;

    if (apiKey && messages.length >= 4) {
      const envKey =
        provider === "openai"
          ? "OPENAI_API_KEY"
          : provider === "anthropic"
            ? "ANTHROPIC_API_KEY"
            : "GOOGLE_GENERATIVE_AI_API_KEY";
      process.env[envKey] = apiKey;

      const evalPrompt = buildEvaluationPrompt({
        level: session.level as InterviewLevel,
        messages,
        problemId: session.topic,
        canvasDescriptions,
      });

      try {
        const result = await generateText({
          model: getModel(provider, model),
          messages: [{ role: "user", content: evalPrompt }],
        });

        evaluationResult = parseEvaluationResponse(result.text);
      } catch (error) {
        console.error("LLM evaluation failed, using heuristic:", error);
      }
    }

    // Fallback to heuristic scoring
    if (!evaluationResult) {
      const heuristicScores = quickScore(
        messages,
        session.level as InterviewLevel
      );

      const scores = {
        requirement_gathering: heuristicScores.requirement_gathering || 5,
        high_level_design: heuristicScores.high_level_design || 5,
        api_design: heuristicScores.api_design || 5,
        data_model: heuristicScores.data_model || 5,
        scalability: heuristicScores.scalability || 5,
        reliability: heuristicScores.reliability || 5,
        communication: heuristicScores.communication || 5,
        tradeoff_analysis: heuristicScores.tradeoff_analysis || 5,
        overall: 5,
      };

      const dimValues = Object.values(scores).filter((_, i) => i < 8);
      scores.overall =
        Math.round((dimValues.reduce((a, b) => a + b, 0) / 8) * 10) / 10;

      evaluationResult = {
        scores,
        feedback: {} as Record<
          ScoreDimension,
          { feedback: string; suggestion: string }
        >,
        overallFeedback:
          "Session evaluated using heuristic analysis. For detailed feedback, ensure your API key is configured.",
        strengths: [],
        areasToImprove: [],
        suggestedTopics: [],
      };
    }

    // Save scores to session
    updateSession(sessionId, {
      endedAt: Date.now(),
      scores: JSON.stringify(evaluationResult.scores),
      summary: evaluationResult.overallFeedback,
    });

    // Save individual dimension scores to progress table
    const dimensions: ScoreDimension[] = [
      "requirement_gathering",
      "high_level_design",
      "api_design",
      "data_model",
      "scalability",
      "reliability",
      "communication",
      "tradeoff_analysis",
    ];

    for (const dim of dimensions) {
      const feedback = evaluationResult.feedback[dim];
      addProgress({
        id: nanoid(12),
        sessionId,
        dimension: dim,
        score: evaluationResult.scores[dim],
        feedback: feedback
          ? `${feedback.feedback} Suggestion: ${feedback.suggestion}`
          : undefined,
      });
    }

    return Response.json({
      scores: evaluationResult.scores,
      feedback: evaluationResult.feedback,
      overallFeedback: evaluationResult.overallFeedback,
      strengths: evaluationResult.strengths,
      areasToImprove: evaluationResult.areasToImprove,
      suggestedTopics: evaluationResult.suggestedTopics,
    });
  } catch (error) {
    console.error("Evaluation error:", error);
    return Response.json(
      {
        error: "Failed to evaluate session",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
