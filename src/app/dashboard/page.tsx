"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { SessionScore, ScoreDimension } from "@/types";

interface SessionData {
  id: string;
  topic: string;
  level: string;
  goal: string;
  startedAt: number;
  endedAt?: number;
  scores?: string;
  summary?: string;
}

const DIMENSION_LABELS: Record<ScoreDimension, string> = {
  requirement_gathering: "Requirements",
  high_level_design: "High-Level Design",
  api_design: "API Design",
  data_model: "Data Model",
  scalability: "Scalability",
  reliability: "Reliability",
  communication: "Communication",
  tradeoff_analysis: "Tradeoff Analysis",
};

export default function DashboardPage() {
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/sessions")
      .then((res) => res.json())
      .then((data) => {
        setSessions(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const completedSessions = sessions.filter((s) => s.endedAt && s.scores);
  const averageScore = computeAverageScore(completedSessions);
  const dimensionAverages = computeDimensionAverages(completedSessions);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center">
        <div className="text-[var(--color-muted-foreground)]">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Your Progress</h1>
          <Link
            href="/"
            className="px-4 py-2 rounded-lg bg-[var(--color-primary)] text-white text-sm hover:bg-[var(--color-accent)] transition-colors"
          >
            New Interview
          </Link>
        </div>

        {sessions.length === 0 ? (
          <div className="border border-[var(--color-border)] rounded-xl p-12 text-center">
            <h2 className="text-lg font-medium mb-2">No sessions yet</h2>
            <p className="text-[var(--color-muted-foreground)] mb-6">
              Start your first interview to track your progress across sessions.
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-2.5 rounded-lg bg-[var(--color-primary)] text-white hover:bg-[var(--color-accent)] transition-colors"
            >
              Start Practicing
            </Link>
          </div>
        ) : (
          <>
            {/* Stats overview */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="border border-[var(--color-border)] rounded-xl p-6">
                <h3 className="text-sm font-medium text-[var(--color-muted-foreground)] mb-2">
                  Sessions Completed
                </h3>
                <div className="text-3xl font-bold">
                  {completedSessions.length}
                </div>
              </div>
              <div className="border border-[var(--color-border)] rounded-xl p-6">
                <h3 className="text-sm font-medium text-[var(--color-muted-foreground)] mb-2">
                  Average Score
                </h3>
                <div className="text-3xl font-bold">
                  {averageScore ? `${averageScore}/10` : "—"}
                </div>
              </div>
              <div className="border border-[var(--color-border)] rounded-xl p-6">
                <h3 className="text-sm font-medium text-[var(--color-muted-foreground)] mb-2">
                  Total Practice Time
                </h3>
                <div className="text-3xl font-bold">
                  {formatTotalTime(sessions)}
                </div>
              </div>
            </div>

            {/* Dimension scores */}
            {dimensionAverages.length > 0 && (
              <div className="border border-[var(--color-border)] rounded-xl p-6 mb-8">
                <h2 className="text-lg font-medium mb-4">
                  Skills Breakdown
                </h2>
                <div className="space-y-3">
                  {dimensionAverages.map(({ dimension, avg }) => (
                    <div key={dimension} className="flex items-center gap-4">
                      <div className="w-40 text-sm text-[var(--color-muted-foreground)]">
                        {DIMENSION_LABELS[dimension]}
                      </div>
                      <div className="flex-1 h-3 bg-[var(--color-muted)] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${(avg / 10) * 100}%`,
                            backgroundColor: getScoreColor(avg),
                          }}
                        />
                      </div>
                      <div className="w-12 text-sm font-medium text-right">
                        {avg.toFixed(1)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Session history */}
            <div className="border border-[var(--color-border)] rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-[var(--color-border)]">
                <h2 className="text-lg font-medium">Session History</h2>
              </div>
              <div className="divide-y divide-[var(--color-border)]">
                {sessions.map((session) => {
                  const scores = session.scores
                    ? (JSON.parse(session.scores) as SessionScore)
                    : null;
                  const duration =
                    session.endedAt && session.startedAt
                      ? Math.round(
                          (session.endedAt - session.startedAt) / 60000
                        )
                      : null;

                  return (
                    <div key={session.id} className="px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-sm">
                            {session.topic}
                          </div>
                          <div className="text-xs text-[var(--color-muted-foreground)] mt-1">
                            {session.level.toUpperCase()} &middot;{" "}
                            {new Date(session.startedAt).toLocaleDateString()}
                            {duration ? ` \u00b7 ${duration} min` : ""}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {scores ? (
                            <div
                              className="text-lg font-bold"
                              style={{
                                color: getScoreColor(scores.overall),
                              }}
                            >
                              {scores.overall}/10
                            </div>
                          ) : (
                            <span className="text-xs text-[var(--color-muted-foreground)]">
                              In progress
                            </span>
                          )}
                        </div>
                      </div>
                      {session.summary && (
                        <p className="text-xs text-[var(--color-muted-foreground)] mt-2 line-clamp-2">
                          {session.summary}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function computeAverageScore(sessions: SessionData[]): number | null {
  const scored = sessions
    .map((s) => {
      if (!s.scores) return null;
      const parsed = JSON.parse(s.scores) as SessionScore;
      return parsed.overall;
    })
    .filter((s): s is number => s !== null);

  if (scored.length === 0) return null;
  return Math.round((scored.reduce((a, b) => a + b, 0) / scored.length) * 10) / 10;
}

function computeDimensionAverages(
  sessions: SessionData[]
): Array<{ dimension: ScoreDimension; avg: number }> {
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

  const scored = sessions
    .map((s) => (s.scores ? (JSON.parse(s.scores) as SessionScore) : null))
    .filter((s): s is SessionScore => s !== null);

  if (scored.length === 0) return [];

  return dimensions.map((dim) => {
    const sum = scored.reduce((acc, s) => acc + (s[dim] || 0), 0);
    return { dimension: dim, avg: Math.round((sum / scored.length) * 10) / 10 };
  });
}

function formatTotalTime(sessions: SessionData[]): string {
  const totalMs = sessions.reduce((acc, s) => {
    const end = s.endedAt || Date.now();
    return acc + (end - s.startedAt);
  }, 0);

  const hours = Math.floor(totalMs / 3600000);
  const minutes = Math.floor((totalMs % 3600000) / 60000);

  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function getScoreColor(score: number): string {
  if (score >= 8) return "#22c55e"; // green
  if (score >= 6) return "#eab308"; // yellow
  if (score >= 4) return "#f97316"; // orange
  return "#ef4444"; // red
}
