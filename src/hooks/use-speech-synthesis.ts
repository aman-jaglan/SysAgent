"use client";

import { useState, useRef, useCallback, useEffect } from "react";

interface UseSpeechSynthesisOptions {
  voice?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
}

interface SpeechSynthesisState {
  isSpeaking: boolean;
  isSupported: boolean;
  availableVoices: SpeechSynthesisVoice[];
}

export function useSpeechSynthesis({
  voice: preferredVoice,
  rate = 1.05,
  pitch = 1.0,
  volume = 1.0,
}: UseSpeechSynthesisOptions = {}) {
  const [state, setState] = useState<SpeechSynthesisState>({
    isSpeaking: false,
    isSupported: false,
    availableVoices: [],
  });

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Load voices
  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    setState((prev) => ({ ...prev, isSupported: true }));

    function loadVoices() {
      const voices = window.speechSynthesis.getVoices();
      setState((prev) => ({ ...prev, availableVoices: voices }));
    }

    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);

    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
    };
  }, []);

  const speak = useCallback(
    (text: string) => {
      if (!window.speechSynthesis) return;

      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = rate;
      utterance.pitch = pitch;
      utterance.volume = volume;

      // Find the preferred voice
      if (preferredVoice) {
        const voice = state.availableVoices.find(
          (v) =>
            v.name.includes(preferredVoice) ||
            v.lang.startsWith(preferredVoice)
        );
        if (voice) utterance.voice = voice;
      } else {
        // Default to a natural-sounding English voice
        const englishVoices = state.availableVoices.filter((v) =>
          v.lang.startsWith("en")
        );
        const preferred =
          englishVoices.find(
            (v) =>
              v.name.includes("Samantha") ||
              v.name.includes("Google") ||
              v.name.includes("Natural")
          ) || englishVoices[0];
        if (preferred) utterance.voice = preferred;
      }

      utterance.onstart = () => {
        setState((prev) => ({ ...prev, isSpeaking: true }));
      };

      utterance.onend = () => {
        setState((prev) => ({ ...prev, isSpeaking: false }));
      };

      utterance.onerror = () => {
        setState((prev) => ({ ...prev, isSpeaking: false }));
      };

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    },
    [rate, pitch, volume, preferredVoice, state.availableVoices]
  );

  const stop = useCallback(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setState((prev) => ({ ...prev, isSpeaking: false }));
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return {
    ...state,
    speak,
    stop,
  };
}
