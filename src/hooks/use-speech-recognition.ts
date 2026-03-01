"use client";

import { useState, useRef, useCallback, useEffect } from "react";

interface UseSpeechRecognitionOptions {
  onResult?: (transcript: string) => void;
  onInterim?: (transcript: string) => void;
  language?: string;
  continuous?: boolean;
}

interface SpeechRecognitionState {
  isListening: boolean;
  isSupported: boolean;
  interimTranscript: string;
  error: string | null;
}

export function useSpeechRecognition({
  onResult,
  onInterim,
  language = "en-US",
  continuous = true,
}: UseSpeechRecognitionOptions = {}) {
  const [state, setState] = useState<SpeechRecognitionState>({
    isListening: false,
    isSupported: false,
    interimTranscript: "",
    error: null,
  });

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const onResultRef = useRef(onResult);
  const onInterimRef = useRef(onInterim);

  // Keep callbacks fresh
  onResultRef.current = onResult;
  onInterimRef.current = onInterim;

  // Check for browser support
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    setState((prev) => ({ ...prev, isSupported: !!SpeechRecognition }));
  }, []);

  const start = useCallback(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setState((prev) => ({
        ...prev,
        error: "Speech recognition not supported in this browser",
      }));
      return;
    }

    // Stop existing instance
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = continuous;
    recognition.interimResults = true;
    recognition.lang = language;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setState((prev) => ({
        ...prev,
        isListening: true,
        error: null,
        interimTranscript: "",
      }));
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = "";
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      if (interimTranscript) {
        setState((prev) => ({ ...prev, interimTranscript }));
        onInterimRef.current?.(interimTranscript);
      }

      if (finalTranscript) {
        setState((prev) => ({ ...prev, interimTranscript: "" }));
        onResultRef.current?.(finalTranscript.trim());
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      // "no-speech" and "aborted" are not real errors
      if (event.error === "no-speech" || event.error === "aborted") return;

      setState((prev) => ({
        ...prev,
        isListening: false,
        error: `Speech recognition error: ${event.error}`,
      }));
    };

    recognition.onend = () => {
      setState((prev) => ({
        ...prev,
        isListening: false,
        interimTranscript: "",
      }));

      // Auto-restart if continuous mode and not manually stopped
      if (continuous && recognitionRef.current === recognition) {
        try {
          recognition.start();
        } catch {
          // Already started or stopped
        }
      }
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch {
      setState((prev) => ({
        ...prev,
        error: "Failed to start speech recognition",
      }));
    }
  }, [continuous, language]);

  const stop = useCallback(() => {
    if (recognitionRef.current) {
      const recognition = recognitionRef.current;
      recognitionRef.current = null; // Prevent auto-restart
      recognition.stop();
    }
    setState((prev) => ({
      ...prev,
      isListening: false,
      interimTranscript: "",
    }));
  }, []);

  const toggle = useCallback(() => {
    if (state.isListening) {
      stop();
    } else {
      start();
    }
  }, [state.isListening, start, stop]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
    };
  }, []);

  return {
    ...state,
    start,
    stop,
    toggle,
  };
}

// Type declarations are in src/types/speech.d.ts
