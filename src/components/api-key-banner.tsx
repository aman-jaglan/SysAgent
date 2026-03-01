"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export function ApiKeyBanner() {
  const [hasKey, setHasKey] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        setHasKey(!!data.apiKey);
      })
      .catch(() => setHasKey(false));
  }, []);

  if (hasKey !== false) return null;

  return (
    <div className="bg-amber-900/30 border border-amber-600/30 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2 text-sm text-amber-200">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
        <span>
          No API key configured. Add one in Settings to start interviewing.
        </span>
      </div>
      <Link
        href="/settings"
        className="text-sm px-3 py-1 rounded bg-amber-600 text-white hover:bg-amber-500 transition-colors"
      >
        Go to Settings
      </Link>
    </div>
  );
}
