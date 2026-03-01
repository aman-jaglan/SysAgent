export type InterviewLevel = "junior" | "mid" | "senior";

export type InterviewPhase =
  | "setup"
  | "requirements"
  | "high_level"
  | "deep_dive"
  | "wrap_up";

export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: number;
}

export interface Session {
  id: string;
  topic: string;
  level: InterviewLevel;
  goal: string;
  jd?: string;
  startedAt: number;
  endedAt?: number;
  summary?: string;
  scores?: SessionScore;
}

export interface SessionScore {
  requirement_gathering: number;
  high_level_design: number;
  api_design: number;
  data_model: number;
  scalability: number;
  reliability: number;
  communication: number;
  tradeoff_analysis: number;
  overall: number;
}

export const SCORE_DIMENSIONS = [
  "requirement_gathering",
  "high_level_design",
  "api_design",
  "data_model",
  "scalability",
  "reliability",
  "communication",
  "tradeoff_analysis",
] as const;

export type ScoreDimension = (typeof SCORE_DIMENSIONS)[number];

export interface SystemDesignProblem {
  id: string;
  title: string;
  category: "classic" | "infrastructure" | "ml";
  difficulty: InterviewLevel[];
  description: string;
  keyComponents: string[];
  followUpQuestions: string[];
  commonMistakes: string[];
  tags: string[];
}

export interface JDAnalysis {
  roleLevel: InterviewLevel;
  focusAreas: string[];
  relevantProblemIds: string[];
  keyTechnologies: string[];
}

export interface ContextWindow {
  systemPrompt: string;
  userProfile: string;
  rollingSummary: string;
  recentMessages: Message[];
  canvasContext: string;
}

export interface InterviewState {
  phase: InterviewPhase;
  problemId: string;
  level: InterviewLevel;
  startedAt: number;
  phaseStartedAt: number;
  requirementsCovered: string[];
  componentsIdentified: string[];
  deepDiveTopics: string[];
  currentDeepDiveTopic?: string;
}

export type Provider = "openai" | "anthropic" | "google";

export interface ProviderConfig {
  provider: Provider;
  model: string;
  apiKey: string;
}
