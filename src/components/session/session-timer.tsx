"use client";

import { useState, useEffect } from "react";

interface SessionTimerProps {
  startTime: number;
}

export function SessionTimer({ startTime }: SessionTimerProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  const hours = Math.floor(elapsed / 3600);
  const minutes = Math.floor((elapsed % 3600) / 60);
  const seconds = elapsed % 60;

  const pad = (n: number) => n.toString().padStart(2, "0");

  const display = hours > 0
    ? `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
    : `${pad(minutes)}:${pad(seconds)}`;

  return (
    <span className="text-sm font-mono text-[var(--color-muted-foreground)]">
      {display}
    </span>
  );
}
