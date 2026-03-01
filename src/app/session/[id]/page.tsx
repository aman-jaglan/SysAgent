"use client";

import { useState, useEffect, useCallback, useRef, use } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  Panel,
  Group as PanelGroup,
  Separator as PanelResizeHandle,
} from "react-resizable-panels";
import { AgentPanel } from "@/components/session/agent-panel";
import { SessionTimer } from "@/components/session/session-timer";
import { useCanvasVision } from "@/hooks/use-canvas-vision";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import type { InterviewLevel } from "@/types";

const ExcalidrawEditor = dynamic(
  () =>
    import("@/components/canvas/excalidraw-editor").then(
      (m) => m.ExcalidrawEditor
    ),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full bg-[var(--color-muted)] animate-pulse" />
    ),
  }
);

interface SessionMessage {
  role: "user" | "assistant";
  content: string;
}

interface SessionConfig {
  goal: string;
  level: InterviewLevel;
  jd?: string;
  problemId?: string;
  problemTitle?: string;
}

export default function SessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [sessionConfig, setSessionConfig] = useState<SessionConfig | null>(
    null
  );
  const [messages, setMessages] = useState<SessionMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [startTime] = useState(Date.now());
  const [currentPhase, setCurrentPhase] = useState("setup");
  const [excalidrawApi, setExcalidrawApi] =
    useState<ExcalidrawImperativeAPI | null>(null);
  const initialized = useRef(false);

  const { lastDescription: canvasDescription, captureNow } = useCanvasVision({
    sessionId: id,
    excalidrawApi,
  });

  // Initialize session — create via API and get the first interviewer message
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const stored = sessionStorage.getItem(`session-${id}`);
    if (!stored) {
      setMessages([
        {
          role: "assistant",
          content:
            "Session not found. Please start a new session from the home page.",
        },
      ]);
      return;
    }

    const data = JSON.parse(stored) as SessionConfig;
    setSessionConfig(data);

    // Create the session via API
    fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        goal: data.goal,
        level: data.level,
        jd: data.jd,
        problemId: data.problemId,
      }),
    })
      .then((res) => res.json())
      .then((session) => {
        // Store the problem info for chat API calls
        const config: SessionConfig = {
          ...data,
          problemId: session.problem?.id || data.problemId,
          problemTitle: session.problem?.title,
        };
        setSessionConfig(config);
        sessionStorage.setItem(`session-${id}`, JSON.stringify(config));

        // Send initial empty message to trigger the interviewer's opening
        sendMessage("", config);
      })
      .catch(() => {
        // Fallback: show a welcome message without API
        setMessages([
          {
            role: "assistant",
            content: `Welcome! I'll be your system design interviewer today. Please make sure you've configured your API key in Settings, then refresh this page.`,
          },
        ]);
      });
  }, [id]);

  const sendMessage = useCallback(
    async (content: string, config?: SessionConfig) => {
      const activeConfig = config || sessionConfig;
      if (!activeConfig) return;

      // Add user message to UI (skip for empty initial message)
      if (content) {
        setMessages((prev) => [...prev, { role: "user", content }]);
      }

      setIsLoading(true);

      // Capture canvas before sending message for fresh context
      await captureNow();

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: id,
            message: content,
            problemId: activeConfig.problemId,
            level: activeConfig.level,
            goal: activeConfig.goal,
            jd: activeConfig.jd,
            canvasDescription,
          }),
        });

        if (!res.ok) {
          const error = await res.json();
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: `Error: ${error.error || "Something went wrong. Check your API key in Settings."}`,
            },
          ]);
          setIsLoading(false);
          return;
        }

        // Update phase from headers
        const phase = res.headers.get("X-Session-Phase");
        if (phase) setCurrentPhase(phase);

        // Stream the response
        const reader = res.body?.getReader();
        if (!reader) {
          setIsLoading(false);
          return;
        }

        const decoder = new TextDecoder();
        let assistantContent = "";

        // Add empty assistant message that we'll stream into
        setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          assistantContent += chunk;

          // Update the last message with streamed content
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = {
              role: "assistant",
              content: assistantContent,
            };
            return updated;
          });
        }
      } catch (error) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "Connection error. Please check your internet and API key configuration.",
          },
        ]);
      }

      setIsLoading(false);
    },
    [id, sessionConfig]
  );

  const handleSendMessage = useCallback(
    (content: string) => {
      if (isLoading) return;
      sendMessage(content);
    },
    [isLoading, sendMessage]
  );

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
          {sessionConfig && (
            <span className="text-xs text-[var(--color-muted-foreground)] bg-[var(--color-muted)] px-2 py-1 rounded">
              {sessionConfig.level.toUpperCase()}
            </span>
          )}
          <span className="text-xs text-[var(--color-muted-foreground)]">
            Phase: {currentPhase.replace("_", " ")}
          </span>
        </div>
        <button
          onClick={handleEndSession}
          className="text-sm px-3 py-1.5 rounded-lg border border-[var(--color-danger)]/30 text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10 transition-colors"
        >
          End Session
        </button>
      </div>

      {/* Split pane */}
      <PanelGroup orientation="horizontal" className="flex-1">
        <Panel defaultSize={60} minSize={30}>
          <ExcalidrawEditor onApiReady={setExcalidrawApi} />
        </Panel>
        <PanelResizeHandle className="w-1.5 bg-[var(--color-border)] hover:bg-[var(--color-primary)]/50 transition-colors cursor-col-resize" />
        <Panel defaultSize={40} minSize={25}>
          <AgentPanel
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
          />
        </Panel>
      </PanelGroup>
    </div>
  );
}
