import type { InterviewLevel, JDAnalysis } from "@/types";
import { getAllProblems } from "./question-bank";

const LEVEL_KEYWORDS: Record<InterviewLevel, string[]> = {
  junior: [
    "junior",
    "entry level",
    "entry-level",
    "new grad",
    "associate",
    "0-2 years",
    "1-2 years",
    "0-3 years",
    "early career",
    "sde i",
    "sde 1",
    "l3",
    "ic1",
    "ic2",
  ],
  mid: [
    "mid level",
    "mid-level",
    "intermediate",
    "2-5 years",
    "3-5 years",
    "2-4 years",
    "sde ii",
    "sde 2",
    "l4",
    "ic3",
    "software engineer ii",
  ],
  senior: [
    "senior",
    "staff",
    "principal",
    "lead",
    "architect",
    "5+ years",
    "7+ years",
    "10+ years",
    "l5",
    "l6",
    "l7",
    "ic4",
    "ic5",
    "sde iii",
    "sde 3",
    "tech lead",
    "distinguished",
  ],
};

const TECH_KEYWORDS: Record<string, string[]> = {
  distributed_systems: [
    "distributed",
    "microservices",
    "service-oriented",
    "event-driven",
    "message queue",
    "kafka",
    "rabbitmq",
    "grpc",
    "service mesh",
  ],
  databases: [
    "sql",
    "nosql",
    "postgresql",
    "mysql",
    "mongodb",
    "dynamodb",
    "cassandra",
    "redis",
    "elasticsearch",
    "database design",
    "data modeling",
  ],
  cloud: [
    "aws",
    "gcp",
    "azure",
    "cloud",
    "kubernetes",
    "docker",
    "terraform",
    "serverless",
    "lambda",
    "ec2",
    "s3",
  ],
  streaming: [
    "real-time",
    "realtime",
    "streaming",
    "websocket",
    "event streaming",
    "pub/sub",
    "sse",
    "live",
  ],
  ml_infra: [
    "machine learning",
    "ml infrastructure",
    "feature store",
    "model serving",
    "recommendation",
    "ranking",
    "ml pipeline",
    "training pipeline",
  ],
  api_design: [
    "api design",
    "rest",
    "graphql",
    "api gateway",
    "rate limiting",
    "authentication",
    "oauth",
  ],
  storage: [
    "blob storage",
    "cdn",
    "caching",
    "content delivery",
    "object storage",
    "file storage",
  ],
  search: [
    "search",
    "full-text search",
    "autocomplete",
    "indexing",
    "search engine",
    "lucene",
    "solr",
  ],
  reliability: [
    "reliability",
    "fault tolerance",
    "high availability",
    "disaster recovery",
    "sre",
    "monitoring",
    "observability",
    "alerting",
  ],
  scalability: [
    "scalability",
    "high traffic",
    "load balancing",
    "horizontal scaling",
    "sharding",
    "partitioning",
    "throughput",
  ],
};

const FOCUS_TAG_MAP: Record<string, string[]> = {
  distributed_systems: ["distributed-systems", "consistency", "messaging"],
  databases: ["database", "storage", "data-modeling"],
  cloud: ["cloud", "infrastructure", "deployment"],
  streaming: ["real-time", "streaming", "websocket"],
  ml_infra: ["ml", "ranking", "recommendations"],
  api_design: ["api-design", "rate-limiting", "authentication"],
  storage: ["storage", "cdn", "caching"],
  search: ["search", "indexing", "autocomplete"],
  reliability: ["fault-tolerance", "monitoring", "high-availability"],
  scalability: ["scalability", "load-balancing", "sharding"],
};

export function parseJobDescription(jd: string): JDAnalysis {
  const lowerJD = jd.toLowerCase();

  const roleLevel = detectLevel(lowerJD);
  const techAreas = detectTechAreas(lowerJD);
  const focusAreas = techAreas.flatMap(
    (area) => FOCUS_TAG_MAP[area] || []
  );
  const keyTechnologies = extractTechnologies(lowerJD);
  const relevantProblemIds = matchProblems(focusAreas, roleLevel);

  return {
    roleLevel,
    focusAreas: [...new Set(focusAreas)],
    relevantProblemIds,
    keyTechnologies,
  };
}

function detectLevel(text: string): InterviewLevel {
  const scores: Record<InterviewLevel, number> = {
    junior: 0,
    mid: 0,
    senior: 0,
  };

  for (const [level, keywords] of Object.entries(LEVEL_KEYWORDS)) {
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        scores[level as InterviewLevel] += 1;
      }
    }
  }

  // Check for years of experience patterns
  const yearsMatch = text.match(/(\d+)\+?\s*years?/);
  if (yearsMatch) {
    const years = parseInt(yearsMatch[1], 10);
    if (years <= 2) scores.junior += 2;
    else if (years <= 5) scores.mid += 2;
    else scores.senior += 2;
  }

  if (scores.senior > 0 && scores.senior >= scores.mid) return "senior";
  if (scores.mid > 0 && scores.mid > scores.junior) return "mid";
  if (scores.junior > 0) return "junior";

  // Default to mid if no clear signal
  return "mid";
}

function detectTechAreas(text: string): string[] {
  const detected: Array<{ area: string; count: number }> = [];

  for (const [area, keywords] of Object.entries(TECH_KEYWORDS)) {
    let count = 0;
    for (const keyword of keywords) {
      if (text.includes(keyword)) count++;
    }
    if (count > 0) {
      detected.push({ area, count });
    }
  }

  // Sort by relevance (match count) and return top areas
  detected.sort((a, b) => b.count - a.count);
  return detected.slice(0, 5).map((d) => d.area);
}

function extractTechnologies(text: string): string[] {
  const techTerms = [
    "kubernetes",
    "docker",
    "kafka",
    "redis",
    "postgresql",
    "mysql",
    "mongodb",
    "dynamodb",
    "cassandra",
    "elasticsearch",
    "graphql",
    "grpc",
    "react",
    "node.js",
    "python",
    "java",
    "go",
    "rust",
    "typescript",
    "aws",
    "gcp",
    "azure",
    "terraform",
    "prometheus",
    "grafana",
    "datadog",
    "spark",
    "flink",
    "airflow",
    "rabbitmq",
    "nginx",
    "envoy",
  ];

  return techTerms.filter((tech) => text.includes(tech));
}

function matchProblems(focusTags: string[], level: InterviewLevel): string[] {
  const problems = getAllProblems();
  const scored: Array<{ id: string; score: number }> = [];

  for (const problem of problems) {
    // Must be appropriate for the candidate's level
    if (!problem.difficulty.includes(level)) continue;

    let score = 0;
    for (const tag of problem.tags) {
      if (focusTags.includes(tag)) score += 2;
    }

    // Boost problems that match focus areas
    if (score > 0) {
      scored.push({ id: problem.id, score });
    }
  }

  scored.sort((a, b) => b.score - a.score);

  // Return top 5 matches, or all problems for that level if no matches
  if (scored.length === 0) {
    return problems
      .filter((p) => p.difficulty.includes(level))
      .slice(0, 5)
      .map((p) => p.id);
  }

  return scored.slice(0, 5).map((s) => s.id);
}
