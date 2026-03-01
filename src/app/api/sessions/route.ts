import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { createSession, getSession, listSessions } from "@/lib/db/queries";
import { getProblemById, getRandomProblem } from "@/lib/agent/question-bank";
import { parseJobDescription } from "@/lib/agent/jd-parser";
import type { InterviewLevel } from "@/types";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { goal, level, jd, problemId } = body as {
      goal: string;
      level: InterviewLevel;
      jd?: string;
      problemId?: string;
    };

    if (!goal || !level) {
      return NextResponse.json(
        { error: "goal and level are required" },
        { status: 400 }
      );
    }

    // Select a problem
    let selectedProblem;
    if (problemId) {
      selectedProblem = getProblemById(problemId);
    }

    if (!selectedProblem) {
      // If JD provided, match problems to JD focus areas
      if (jd) {
        const analysis = parseJobDescription(jd);
        if (analysis.relevantProblemIds.length > 0) {
          selectedProblem = getProblemById(analysis.relevantProblemIds[0]);
        }
      }
      // Fallback to random problem appropriate for the level
      if (!selectedProblem) {
        selectedProblem = getRandomProblem(level);
      }
    }

    const id = nanoid(12);
    const session = createSession({
      id,
      topic: selectedProblem.title,
      level,
      goal,
      jd,
    });

    return NextResponse.json({
      ...session,
      problem: selectedProblem,
    });
  } catch (error) {
    console.error("Failed to create session:", error);
    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (id) {
      const session = getSession(id);
      if (!session) {
        return NextResponse.json(
          { error: "Session not found" },
          { status: 404 }
        );
      }
      return NextResponse.json(session);
    }

    const allSessions = listSessions();
    return NextResponse.json(allSessions);
  } catch (error) {
    console.error("Failed to fetch sessions:", error);
    return NextResponse.json(
      { error: "Failed to fetch sessions" },
      { status: 500 }
    );
  }
}
