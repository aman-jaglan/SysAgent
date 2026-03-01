"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import { useSpeechSynthesis } from "@/hooks/use-speech-synthesis";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AgentPanelProps {
  messages: Message[];
  onSendMessage: (content: string) => void;
  isLoading?: boolean;
}

export function AgentPanel({
  messages,
  onSendMessage,
  isLoading = false,
}: AgentPanelProps) {
  const [input, setInput] = useState("");
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lastSpokenIndex = useRef(-1);

  const { isListening, isSupported: sttSupported, interimTranscript, toggle: toggleListening } =
    useSpeechRecognition({
      onResult: (transcript) => {
        if (voiceEnabled && transcript.trim()) {
          onSendMessage(transcript.trim());
        }
      },
    });

  const { isSpeaking, isSupported: ttsSupported, speak, stop: stopSpeaking } =
    useSpeechSynthesis();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-read assistant responses when voice is enabled
  useEffect(() => {
    if (!autoSpeak || !ttsSupported) return;
    const lastMessage = messages[messages.length - 1];
    if (
      lastMessage?.role === "assistant" &&
      messages.length - 1 > lastSpokenIndex.current &&
      !isLoading
    ) {
      lastSpokenIndex.current = messages.length - 1;
      speak(lastMessage.content);
    }
  }, [messages, autoSpeak, ttsSupported, speak, isLoading]);

  function handleSubmit() {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    onSendMessage(trimmed);
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  function handleVoiceToggle() {
    if (!sttSupported) return;

    if (voiceEnabled) {
      // Turning off voice mode
      setVoiceEnabled(false);
      setAutoSpeak(false);
      if (isListening) toggleListening();
      stopSpeaking();
    } else {
      // Turning on voice mode
      setVoiceEnabled(true);
      setAutoSpeak(true);
      toggleListening();
    }
  }

  return (
    <div className="flex flex-col h-full bg-[var(--color-background)]">
      {/* Voice controls */}
      {(sttSupported || ttsSupported) && (
        <div className="flex items-center gap-2 px-4 py-2 border-b border-[var(--color-border)]">
          <button
            onClick={handleVoiceToggle}
            className={`text-xs px-2.5 py-1 rounded-full transition-colors ${
              voiceEnabled
                ? "bg-[var(--color-primary)] text-white"
                : "bg-[var(--color-muted)] text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
            }`}
          >
            {voiceEnabled ? "Voice ON" : "Voice OFF"}
          </button>
          {voiceEnabled && (
            <>
              <button
                onClick={() => setAutoSpeak(!autoSpeak)}
                className={`text-xs px-2.5 py-1 rounded-full transition-colors ${
                  autoSpeak
                    ? "bg-emerald-600 text-white"
                    : "bg-[var(--color-muted)] text-[var(--color-muted-foreground)]"
                }`}
              >
                Auto-read {autoSpeak ? "ON" : "OFF"}
              </button>
              {isSpeaking && (
                <button
                  onClick={stopSpeaking}
                  className="text-xs px-2.5 py-1 rounded-full bg-red-600/20 text-red-400 hover:bg-red-600/30"
                >
                  Stop reading
                </button>
              )}
            </>
          )}
          {isListening && (
            <span className="flex items-center gap-1.5 text-xs text-red-400">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              Listening...
            </span>
          )}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-[var(--color-primary)] text-white rounded-br-md"
                  : "bg-[var(--color-muted)] text-[var(--color-foreground)] rounded-bl-md"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-[var(--color-muted)] px-4 py-2.5 rounded-2xl rounded-bl-md">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 bg-[var(--color-muted-foreground)] rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-[var(--color-muted-foreground)] rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-2 h-2 bg-[var(--color-muted-foreground)] rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}
        {interimTranscript && (
          <div className="flex justify-end">
            <div className="max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed bg-[var(--color-primary)]/40 text-white/70 rounded-br-md italic">
              {interimTranscript}...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-[var(--color-border)] p-4">
        <div className="flex gap-2 items-end">
          <button
            onClick={handleVoiceToggle}
            disabled={!sttSupported}
            className={`p-2.5 rounded-lg border transition-colors ${
              isListening
                ? "border-red-500 bg-red-500/20 text-red-400"
                : "border-[var(--color-border)] text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:border-[var(--color-muted-foreground)]"
            } ${!sttSupported ? "opacity-30 cursor-not-allowed" : ""}`}
            title={
              sttSupported
                ? isListening
                  ? "Stop listening"
                  : "Start voice input"
                : "Voice not supported in this browser"
            }
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" x2="12" y1="19" y2="22" />
            </svg>
          </button>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height =
                Math.min(e.target.scrollHeight, 120) + "px";
            }}
            onKeyDown={handleKeyDown}
            placeholder={
              isListening ? "Listening... speak now" : "Type your response..."
            }
            rows={1}
            className="flex-1 px-4 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-muted)]/50 text-[var(--color-foreground)] placeholder-[var(--color-muted-foreground)]/60 focus:outline-none focus:border-[var(--color-primary)] resize-none text-sm"
          />
          <button
            onClick={handleSubmit}
            disabled={!input.trim() || isLoading}
            className="p-2.5 rounded-lg bg-[var(--color-primary)] text-white hover:bg-[var(--color-accent)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m22 2-7 20-4-9-9-4Z" />
              <path d="M22 2 11 13" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
