"use client";

import { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
} from "react-resizable-panels";
import { AgentPanel } from "@/components/session/agent-panel";
import { SessionTimer } from "@/components/session/session-timer";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import type { InterviewLevel } from "@/types";

const ExcalidrawEditor = dynamic(
  () =>
    import("@/components/canvas/excalidraw-editor").then(
      (m) => m.ExcalidrawEditor
    ),
  { ssr: false, loading: () => <div className="h-full w-full bg-[var(--color-muted)] animate-pulse" /> }
);

interface SessionMessage {
  role: "user" | "assistant";
  content: string;
}

interface SessionData {
  goal: string;
  level: InterviewLevel;
  jd?: string;
}

export default function SessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [messages, setMessages] = useState<SessionMessage[]>([]);
  const [startTime] = useState(Date.now());
  const [, setExcalidrawApi] = useState<ExcalidrawImperativeAPI | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem(`session-${id}`);
    if (stored) {
      const data = JSON.parse(stored) as SessionData;
      setSessionData(data);
      setMessages([
        {
          role: "assistant",
          content: `Welcome! I'll be your system design interviewer today. I see you're preparing at the ${data.level} level. ${data.goal ? `Your focus: "${data.goal}". ` : ""}Let me pick a relevant problem for you. Ready to begin?`,
        },
      ]);
    } else {
      setMessages([
        {
          role: "assistant",
          content:
            "Welcome! Let's practice system design. What topic would you like to work on?",
        },
      ]);
    }
  }, [id]);

  const handleSendMessage = useCallback((content: string) => {
    setMessages((prev) => [...prev, { role: "user", content }]);
    // TODO: Wire up to API in Wave 2
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I hear you. Let me think about that... (API integration coming in Wave 2)",
        },
      ]);
    }, 1000);
  }, []);

  function handleEndSession() {
    if (confirm("End this interview session?")) {
      router.push("/dashboard");
    }
  }

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--color-border)] bg-[var(--color-background)]">
        <div className="flex items-center gap-4">
          <SessionTimer startTime={startTime} />
          {sessionData && (
            <span className="text-xs text-[var(--color-muted-foreground)] bg-[var(--color-muted)] px-2 py-1 rounded">
              {sessionData.level.toUpperCase()}
            </span>
          )}
        </div>
        <button
          onClick={handleEndSession}
          className="text-sm px-3 py-1.5 rounded-lg border border-[var(--color-danger)]/30 text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10 transition-colors"
        >
          End Session
        </button>
      </div>

      {/* Split pane */}
      <PanelGroup direction="horizontal" className="flex-1">
        <Panel defaultSize={60} minSize={30}>
          <ExcalidrawEditor onApiReady={setExcalidrawApi} />
        </Panel>
        <PanelResizeHandle className="w-1.5 bg-[var(--color-border)] hover:bg-[var(--color-primary)]/50 transition-colors cursor-col-resize" />
        <Panel defaultSize={40} minSize={25}>
          <AgentPanel messages={messages} onSendMessage={handleSendMessage} />
        </Panel>
      </PanelGroup>
    </div>
  );
}
