"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import { captureCanvas, resetCaptureState } from "@/components/canvas/canvas-capture";

const CAPTURE_INTERVAL_MS = 30_000; // 30 seconds
const MIN_ELEMENTS_FOR_CAPTURE = 2;

interface UseCanvasVisionOptions {
  sessionId: string;
  excalidrawApi: ExcalidrawImperativeAPI | null;
  enabled?: boolean;
}

interface CanvasVisionState {
  lastDescription: string;
  captureCount: number;
  isCapturing: boolean;
}

export function useCanvasVision({
  sessionId,
  excalidrawApi,
  enabled = true,
}: UseCanvasVisionOptions) {
  const [state, setState] = useState<CanvasVisionState>({
    lastDescription: "",
    captureCount: 0,
    isCapturing: false,
  });
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastCaptureRef = useRef<number>(0);

  const captureAndDescribe = useCallback(async () => {
    if (!excalidrawApi || state.isCapturing) return;

    // Check if there are enough elements to be meaningful
    const elements = excalidrawApi.getSceneElements();
    if (elements.length < MIN_ELEMENTS_FOR_CAPTURE) return;

    // Rate limit: don't capture more than once per 15 seconds
    const now = Date.now();
    if (now - lastCaptureRef.current < 15_000) return;

    setState((prev) => ({ ...prev, isCapturing: true }));

    try {
      const blob = await captureCanvas(excalidrawApi);
      if (!blob) {
        setState((prev) => ({ ...prev, isCapturing: false }));
        return; // No changes since last capture
      }

      lastCaptureRef.current = now;

      // Send to vision API for description
      const formData = new FormData();
      formData.append("image", blob, "canvas.png");
      formData.append("sessionId", sessionId);

      const res = await fetch("/api/canvas/describe", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setState((prev) => ({
          lastDescription: data.description || prev.lastDescription,
          captureCount: prev.captureCount + 1,
          isCapturing: false,
        }));
      } else {
        setState((prev) => ({ ...prev, isCapturing: false }));
      }
    } catch {
      setState((prev) => ({ ...prev, isCapturing: false }));
    }
  }, [excalidrawApi, sessionId, state.isCapturing]);

  // Set up periodic capture
  useEffect(() => {
    if (!enabled || !excalidrawApi) return;

    intervalRef.current = setInterval(captureAndDescribe, CAPTURE_INTERVAL_MS);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, excalidrawApi, captureAndDescribe]);

  // Reset on unmount
  useEffect(() => {
    return () => {
      resetCaptureState();
    };
  }, []);

  // Manual trigger for immediate capture (e.g., before sending a message)
  const captureNow = useCallback(() => {
    return captureAndDescribe();
  }, [captureAndDescribe]);

  return {
    lastDescription: state.lastDescription,
    captureCount: state.captureCount,
    isCapturing: state.isCapturing,
    captureNow,
  };
}
