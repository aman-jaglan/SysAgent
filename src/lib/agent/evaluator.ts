import type {
  InterviewLevel,
  Message,
  ScoreDimension,
  SessionScore,
  SCORE_DIMENSIONS,
} from "@/types";

interface EvaluationContext {
  level: InterviewLevel;
  messages: Message[];
  problemId: string;
  canvasDescriptions: string[];
}

interface DimensionRubric {
  dimension: ScoreDimension;
  label: string;
  criteria: Record<InterviewLevel, string>;
  signals: {
    strong: string[];
    weak: string[];
  };
}

const RUBRICS: DimensionRubric[] = [
  {
    dimension: "requirement_gathering",
    label: "Requirement Gathering",
    criteria: {
      junior:
        "Asked at least 3 clarifying questions about users, scale, or features.",
      mid: "Covered functional requirements, non-functional requirements (latency, availability), and scoped the MVP.",
      senior:
        "Drove deep on SLAs, read/write ratios, consistency needs, data retention, and growth projections. Prioritized requirements clearly.",
    },
    signals: {
      strong: [
        "how many users",
        "read/write ratio",
        "consistency",
        "latency requirement",
        "SLA",
        "data retention",
        "peak traffic",
        "geographic distribution",
        "MVP",
        "prioritize",
      ],
      weak: [
        "let me just start designing",
        "I think we should build",
        "let me draw",
      ],
    },
  },
  {
    dimension: "high_level_design",
    label: "High-Level Design",
    criteria: {
      junior:
        "Identified basic client-server architecture with a database. Showed understanding of web request flow.",
      mid: "Drew clear component diagram with load balancer, application servers, database, and cache. Explained request flow end to end.",
      senior:
        "Comprehensive architecture with proper service boundaries, async processing where needed, and clear data flow. Justified each component.",
    },
    signals: {
      strong: [
        "load balancer",
        "application server",
        "database",
        "cache",
        "message queue",
        "CDN",
        "API gateway",
        "service",
        "microservice",
      ],
      weak: [
        "just one server",
        "single database",
        "no caching",
        "monolith only",
      ],
    },
  },
  {
    dimension: "api_design",
    label: "API Design",
    criteria: {
      junior:
        "Defined at least 2-3 basic endpoints with HTTP methods and rough request/response shapes.",
      mid: "Well-structured RESTful API with proper HTTP methods, status codes, pagination, and authentication considerations.",
      senior:
        "Complete API contract with versioning, rate limiting, idempotency, error handling, and backward compatibility strategy.",
    },
    signals: {
      strong: [
        "GET",
        "POST",
        "PUT",
        "DELETE",
        "endpoint",
        "REST",
        "pagination",
        "cursor",
        "rate limit",
        "idempotent",
        "versioning",
        "status code",
      ],
      weak: [
        "just send data",
        "call the server",
        "one endpoint for everything",
      ],
    },
  },
  {
    dimension: "data_model",
    label: "Data Model",
    criteria: {
      junior:
        "Identified main entities and basic relationships. Chose a database type with some reasoning.",
      mid: "Designed normalized schema with indexes for key queries. Discussed SQL vs NoSQL tradeoffs for the use case.",
      senior:
        "Optimized schema for access patterns. Discussed partitioning strategy, index design, denormalization tradeoffs, and data migration approach.",
    },
    signals: {
      strong: [
        "schema",
        "index",
        "primary key",
        "foreign key",
        "partition",
        "shard",
        "denormalize",
        "access pattern",
        "SQL",
        "NoSQL",
        "table",
        "column",
      ],
      weak: ["just store it", "put it in the database", "save the data"],
    },
  },
  {
    dimension: "scalability",
    label: "Scalability",
    criteria: {
      junior:
        "Acknowledged that the system needs to handle more users over time. Mentioned basic horizontal scaling.",
      mid: "Discussed horizontal scaling, database replication, caching strategies, and load balancing. Provided back-of-envelope calculations.",
      senior:
        "Detailed scaling strategy with sharding, partitioning, async processing, CDN, read replicas, connection pooling. Calculated throughput and storage needs.",
    },
    signals: {
      strong: [
        "horizontal scaling",
        "vertical scaling",
        "sharding",
        "replication",
        "read replica",
        "partition",
        "CDN",
        "back of envelope",
        "QPS",
        "throughput",
        "connection pool",
      ],
      weak: [
        "just add more servers",
        "it should scale",
        "cloud handles it",
      ],
    },
  },
  {
    dimension: "reliability",
    label: "Reliability & Fault Tolerance",
    criteria: {
      junior:
        "Recognized that servers can fail. Mentioned backups or redundancy at a basic level.",
      mid: "Discussed failure modes for key components. Covered retry logic, circuit breakers, health checks, and data backup strategy.",
      senior:
        "Comprehensive failure analysis: split-brain, cascading failures, graceful degradation, disaster recovery, RTO/RPO. Discussed monitoring and alerting.",
    },
    signals: {
      strong: [
        "failure mode",
        "retry",
        "circuit breaker",
        "health check",
        "failover",
        "replication",
        "backup",
        "graceful degradation",
        "monitoring",
        "alerting",
        "RTO",
        "RPO",
        "split-brain",
      ],
      weak: ["it won't fail", "cloud is reliable", "we don't need to worry"],
    },
  },
  {
    dimension: "communication",
    label: "Communication & Structure",
    criteria: {
      junior:
        "Explained their thinking out loud. Asked for feedback. Organized their approach somewhat.",
      mid: "Clear, structured approach. Walked through design methodically. Responded well to interviewer probes. Good use of the whiteboard.",
      senior:
        "Excellent communication. Led the conversation, anticipated follow-ups, structured the design session proactively. Drew clear, well-labeled diagrams.",
    },
    signals: {
      strong: [
        "let me think about",
        "the tradeoff here is",
        "I would start with",
        "let me walk you through",
        "first",
        "then",
        "alternatively",
        "the reason I chose",
        "does that make sense",
      ],
      weak: [
        "I don't know",
        "I'm not sure",
        "just use",
        "it depends",
        "whatever works",
      ],
    },
  },
  {
    dimension: "tradeoff_analysis",
    label: "Tradeoff Analysis",
    criteria: {
      junior:
        "Mentioned at least one tradeoff or alternative approach when prompted.",
      mid: "Proactively discussed tradeoffs for major decisions (SQL vs NoSQL, sync vs async, consistency vs availability). Justified choices.",
      senior:
        "Deep tradeoff analysis for every major decision. Discussed CAP theorem implications, cost-performance tradeoffs, operational complexity, and when they'd revisit decisions.",
    },
    signals: {
      strong: [
        "tradeoff",
        "trade-off",
        "alternatively",
        "pros and cons",
        "on the other hand",
        "CAP theorem",
        "consistency vs availability",
        "the downside is",
        "I chose X because",
        "compared to",
      ],
      weak: [
        "this is the best",
        "only way",
        "no alternatives",
        "obviously",
        "just use",
      ],
    },
  },
];

/**
 * Build the evaluation prompt that will be sent to the LLM for scoring.
 * The LLM does the actual evaluation — this function structures the request.
 */
export function buildEvaluationPrompt(context: EvaluationContext): string {
  const { level, messages, canvasDescriptions } = context;

  const conversationText = messages
    .filter((m) => m.role !== "system")
    .map((m) => `${m.role === "user" ? "CANDIDATE" : "INTERVIEWER"}: ${m.content}`)
    .join("\n\n");

  const canvasText =
    canvasDescriptions.length > 0
      ? `\n\nCANDIDATE'S WHITEBOARD (descriptions captured during session):\n${canvasDescriptions.join("\n---\n")}`
      : "";

  const rubricText = RUBRICS.map((r) => {
    const criteria = r.criteria[level];
    return `${r.dimension} (${r.label}):
  Expected for ${level} level: ${criteria}
  Strong signals: ${r.signals.strong.slice(0, 5).join(", ")}
  Weak signals: ${r.signals.weak.join(", ")}`;
  }).join("\n\n");

  return `You are evaluating a system design interview session. Score the candidate on each dimension from 1-10.

## Candidate Level: ${level.toUpperCase()}
Evaluate relative to what is expected at this level. A score of 7 means "meets expectations for this level."

## Scoring Rubric
${rubricText}

## Interview Transcript
${conversationText}
${canvasText}

## Instructions
For each of the 8 dimensions, provide:
1. A score from 1-10 (integer)
2. A brief explanation (1-2 sentences) of why you gave that score
3. One specific suggestion for improvement

Respond in this exact JSON format:
{
  "scores": {
    "requirement_gathering": { "score": <1-10>, "feedback": "<explanation>", "suggestion": "<improvement>" },
    "high_level_design": { "score": <1-10>, "feedback": "<explanation>", "suggestion": "<improvement>" },
    "api_design": { "score": <1-10>, "feedback": "<explanation>", "suggestion": "<improvement>" },
    "data_model": { "score": <1-10>, "feedback": "<explanation>", "suggestion": "<improvement>" },
    "scalability": { "score": <1-10>, "feedback": "<explanation>", "suggestion": "<improvement>" },
    "reliability": { "score": <1-10>, "feedback": "<explanation>", "suggestion": "<improvement>" },
    "communication": { "score": <1-10>, "feedback": "<explanation>", "suggestion": "<improvement>" },
    "tradeoff_analysis": { "score": <1-10>, "feedback": "<explanation>", "suggestion": "<improvement>" }
  },
  "overall_feedback": "<2-3 sentence overall assessment>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "areas_to_improve": ["<area 1>", "<area 2>"],
  "suggested_topics": ["<topic to practice next>"]
}`;
}

/**
 * Parse the LLM's evaluation response into a SessionScore.
 */
export function parseEvaluationResponse(response: string): {
  scores: SessionScore;
  feedback: Record<ScoreDimension, { feedback: string; suggestion: string }>;
  overallFeedback: string;
  strengths: string[];
  areasToImprove: string[];
  suggestedTopics: string[];
} | null {
  try {
    // Extract JSON from the response (handle markdown code blocks)
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]);

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

    const scores: Record<string, number> = {};
    const feedback: Record<string, { feedback: string; suggestion: string }> =
      {};

    for (const dim of dimensions) {
      const dimData = parsed.scores?.[dim];
      if (dimData) {
        scores[dim] = clampScore(dimData.score);
        feedback[dim] = {
          feedback: dimData.feedback || "",
          suggestion: dimData.suggestion || "",
        };
      } else {
        scores[dim] = 5;
        feedback[dim] = { feedback: "Not evaluated", suggestion: "" };
      }
    }

    // Calculate overall as weighted average
    const overall =
      Math.round(
        (Object.values(scores).reduce((a, b) => a + b, 0) /
          dimensions.length) *
          10
      ) / 10;

    return {
      scores: { ...scores, overall } as SessionScore,
      feedback: feedback as Record<
        ScoreDimension,
        { feedback: string; suggestion: string }
      >,
      overallFeedback: parsed.overall_feedback || "",
      strengths: parsed.strengths || [],
      areasToImprove: parsed.areas_to_improve || [],
      suggestedTopics: parsed.suggested_topics || [],
    };
  } catch {
    return null;
  }
}

/**
 * Quick heuristic scoring based on signal detection.
 * Used as a fallback if the LLM evaluation fails, and for
 * real-time phase transition hints during the session.
 */
export function quickScore(
  messages: Message[],
  level: InterviewLevel
): Partial<SessionScore> {
  const candidateMessages = messages
    .filter((m) => m.role === "user")
    .map((m) => m.content.toLowerCase());

  const allText = candidateMessages.join(" ");
  const scores: Partial<SessionScore> = {};

  for (const rubric of RUBRICS) {
    let strongCount = 0;
    let weakCount = 0;

    for (const signal of rubric.signals.strong) {
      if (allText.includes(signal.toLowerCase())) strongCount++;
    }
    for (const signal of rubric.signals.weak) {
      if (allText.includes(signal.toLowerCase())) weakCount++;
    }

    const maxStrong = rubric.signals.strong.length;
    const ratio = maxStrong > 0 ? strongCount / maxStrong : 0;
    const penalty = weakCount * 0.5;

    // Base score from signal detection
    let score = Math.round(3 + ratio * 6 - penalty);
    score = clampScore(score);

    scores[rubric.dimension] = score;
  }

  return scores;
}

/**
 * Identify weak areas across sessions for targeted practice.
 */
export function identifyWeakAreas(
  sessionScores: SessionScore[]
): ScoreDimension[] {
  if (sessionScores.length === 0) return [];

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

  const averages: Array<{ dim: ScoreDimension; avg: number }> = dimensions.map(
    (dim) => {
      const sum = sessionScores.reduce((acc, s) => acc + (s[dim] || 0), 0);
      return { dim, avg: sum / sessionScores.length };
    }
  );

  // Return dimensions below 6/10 average, sorted weakest first
  return averages
    .filter((a) => a.avg < 6)
    .sort((a, b) => a.avg - b.avg)
    .map((a) => a.dim);
}

function clampScore(score: number): number {
  return Math.max(1, Math.min(10, Math.round(score)));
}
