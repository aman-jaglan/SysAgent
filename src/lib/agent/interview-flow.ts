import type { InterviewLevel, InterviewPhase, InterviewState } from "@/types";

export function createInterviewState(
  problemId: string,
  level: InterviewLevel
): InterviewState {
  const now = Date.now();
  return {
    phase: "setup",
    problemId,
    level,
    startedAt: now,
    phaseStartedAt: now,
    requirementsCovered: [],
    componentsIdentified: [],
    deepDiveTopics: [],
  };
}

interface TransitionResult {
  should: boolean;
  nextPhase?: InterviewPhase;
  reason?: string;
}

export function shouldTransition(
  state: InterviewState,
  messageCount: number,
  elapsedMinutes: number
): TransitionResult {
  const phaseMinutes =
    (Date.now() - state.phaseStartedAt) / (1000 * 60);

  switch (state.phase) {
    case "setup":
      if (messageCount >= 2) {
        return {
          should: true,
          nextPhase: "requirements",
          reason: "Problem presented, moving to requirements gathering",
        };
      }
      return { should: false };

    case "requirements":
      if (messageCount >= 8 || phaseMinutes >= 8) {
        return {
          should: true,
          nextPhase: "high_level",
          reason: "Sufficient requirements gathered",
        };
      }
      return { should: false };

    case "high_level":
      if (messageCount >= 14 || phaseMinutes >= 15) {
        return {
          should: true,
          nextPhase: "deep_dive",
          reason: "High-level design established, ready for deep dive",
        };
      }
      return { should: false };

    case "deep_dive":
      if (messageCount >= 24 || phaseMinutes >= 20 || elapsedMinutes >= 50) {
        return {
          should: true,
          nextPhase: "wrap_up",
          reason: "Sufficient depth explored",
        };
      }
      return { should: false };

    case "wrap_up":
      return { should: false };
  }
}

export function transitionPhase(
  state: InterviewState,
  nextPhase: InterviewPhase
): InterviewState {
  return {
    ...state,
    phase: nextPhase,
    phaseStartedAt: Date.now(),
  };
}

export function getPhasePrompt(state: InterviewState): string {
  const phaseName = state.phase.replace("_", " ").toUpperCase();
  const phaseMinutes = Math.floor(
    (Date.now() - state.phaseStartedAt) / (1000 * 60)
  );

  let prompt = `\n\n[PHASE: ${phaseName} | ${phaseMinutes} min in this phase]`;

  switch (state.phase) {
    case "setup":
      prompt += "\nPresent the problem now. Be concise and clear.";
      break;
    case "requirements":
      if (state.requirementsCovered.length > 0) {
        prompt += `\nRequirements discussed so far: ${state.requirementsCovered.join(", ")}`;
      }
      prompt +=
        "\nEncourage them to ask more questions if they haven't covered key areas.";
      break;
    case "high_level":
      if (state.componentsIdentified.length > 0) {
        prompt += `\nComponents identified: ${state.componentsIdentified.join(", ")}`;
      }
      prompt += "\nAsk them to walk through the data flow.";
      break;
    case "deep_dive":
      if (state.currentDeepDiveTopic) {
        prompt += `\nCurrently diving deep on: ${state.currentDeepDiveTopic}`;
      }
      if (state.deepDiveTopics.length > 0) {
        prompt += `\nTopics already explored: ${state.deepDiveTopics.join(", ")}`;
      }
      break;
    case "wrap_up":
      prompt +=
        "\nSummarize the session, give specific feedback, and suggest next steps.";
      break;
  }

  return prompt;
}
