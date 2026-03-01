"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { nanoid } from "nanoid";
import type { InterviewLevel } from "@/types";

const LEVELS: { id: InterviewLevel; title: string; description: string }[] = [
  {
    id: "junior",
    title: "Junior",
    description: "Getting started with system design. Guided experience with helpful nudges.",
  },
  {
    id: "mid",
    title: "Mid-Level",
    description: "Comfortable with basics. Balanced challenge with follow-up questions.",
  },
  {
    id: "senior",
    title: "Senior",
    description: "Deep expertise expected. Rigorous probing on tradeoffs and edge cases.",
  },
];

export default function Home() {
  const router = useRouter();
  const [goal, setGoal] = useState("");
  const [level, setLevel] = useState<InterviewLevel>("mid");
  const [jd, setJd] = useState("");
  const [starting, setStarting] = useState(false);

  function handleStart() {
    if (!goal.trim()) return;
    setStarting(true);
    const sessionId = nanoid(12);
    sessionStorage.setItem(
      `session-${sessionId}`,
      JSON.stringify({ goal, level, jd: jd || undefined })
    );
    router.push(`/session/${sessionId}`);
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-bold tracking-tight">
            Practice System Design Interviews
          </h1>
          <p className="text-lg text-[var(--color-muted-foreground)]">
            AI interviewer that talks, sees your whiteboard, and adapts to your level.
            Bring your own API key — costs $0.50-$5 per session.
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-[var(--color-muted-foreground)] mb-2">
              What do you want to prepare for?
            </label>
            <textarea
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="I'm preparing for a Senior Backend Engineer role at Stripe. Focus on payment systems, distributed transactions, and event-driven architecture..."
              rows={3}
              className="w-full px-4 py-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-muted)]/50 text-[var(--color-foreground)] placeholder-[var(--color-muted-foreground)]/60 focus:outline-none focus:border-[var(--color-primary)] resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-muted-foreground)] mb-3">
              Interview Level
            </label>
            <div className="grid grid-cols-3 gap-3">
              {LEVELS.map((l) => (
                <button
                  key={l.id}
                  onClick={() => setLevel(l.id)}
                  className={`p-4 rounded-lg border text-left transition-all ${
                    level === l.id
                      ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10"
                      : "border-[var(--color-border)] bg-[var(--color-muted)]/30 hover:border-[var(--color-muted-foreground)]/40"
                  }`}
                >
                  <div className="font-medium text-sm mb-1">{l.title}</div>
                  <div className="text-xs text-[var(--color-muted-foreground)] leading-relaxed">
                    {l.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-muted-foreground)] mb-2">
              Paste a job description{" "}
              <span className="text-[var(--color-muted-foreground)]/60">(optional)</span>
            </label>
            <textarea
              value={jd}
              onChange={(e) => setJd(e.target.value)}
              placeholder="Paste the job description here and the AI will focus on relevant topics..."
              rows={3}
              className="w-full px-4 py-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-muted)]/50 text-[var(--color-foreground)] placeholder-[var(--color-muted-foreground)]/60 focus:outline-none focus:border-[var(--color-primary)] resize-none"
            />
          </div>

          <button
            onClick={handleStart}
            disabled={!goal.trim() || starting}
            className="w-full py-3 rounded-lg bg-[var(--color-primary)] hover:bg-[var(--color-accent)] disabled:opacity-40 disabled:cursor-not-allowed font-medium text-white transition-colors text-lg"
          >
            {starting ? "Starting..." : "Start Interview"}
          </button>
        </div>
      </div>
    </div>
  );
}
