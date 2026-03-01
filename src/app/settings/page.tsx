"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const PROVIDERS = [
  {
    id: "openai" as const,
    name: "OpenAI",
    models: ["gpt-5", "gpt-5-mini", "gpt-4.1", "gpt-4o"],
    envKey: "OPENAI_API_KEY",
  },
  {
    id: "anthropic" as const,
    name: "Anthropic",
    models: ["claude-sonnet-4-6", "claude-haiku-4-5", "claude-opus-4-6"],
    envKey: "ANTHROPIC_API_KEY",
  },
  {
    id: "google" as const,
    name: "Google",
    models: ["gemini-2.5-flash", "gemini-2.5-pro"],
    envKey: "GOOGLE_GENERATIVE_AI_API_KEY",
  },
];

export default function SettingsPage() {
  const router = useRouter();
  const [provider, setProvider] = useState("openai");
  const [model, setModel] = useState("gpt-5");
  const [apiKey, setApiKey] = useState("");
  const [hasExistingKey, setHasExistingKey] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data.provider) setProvider(data.provider);
        if (data.model) setModel(data.model);
        setHasExistingKey(data.hasApiKey);
      })
      .catch(() => {});
  }, []);

  const selectedProvider = PROVIDERS.find((p) => p.id === provider);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider,
          model,
          ...(apiKey ? { apiKey } : {}),
        }),
      });
      setSaved(true);
      setHasExistingKey(true);
      setApiKey("");
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-8">
      <div className="max-w-xl mx-auto">
        <button
          onClick={() => router.push("/")}
          className="text-zinc-400 hover:text-zinc-200 mb-6 block"
        >
          &larr; Back
        </button>

        <h1 className="text-2xl font-bold mb-8">Settings</h1>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              Provider
            </label>
            <div className="grid grid-cols-3 gap-3">
              {PROVIDERS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setProvider(p.id);
                    setModel(p.models[0]);
                  }}
                  className={`px-4 py-3 rounded-lg border text-sm font-medium transition-colors ${
                    provider === p.id
                      ? "border-blue-500 bg-blue-500/10 text-blue-400"
                      : "border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-zinc-500"
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              Model
            </label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-zinc-700 bg-zinc-900 text-zinc-100 focus:outline-none focus:border-blue-500"
            >
              {selectedProvider?.models.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              API Key
              {hasExistingKey && (
                <span className="ml-2 text-green-400 text-xs">
                  (key saved)
                </span>
              )}
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={
                hasExistingKey
                  ? "Enter new key to update"
                  : `Paste your ${selectedProvider?.envKey}`
              }
              className="w-full px-4 py-3 rounded-lg border border-zinc-700 bg-zinc-900 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full px-4 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 font-medium transition-colors"
          >
            {saving ? "Saving..." : saved ? "Saved!" : "Save Settings"}
          </button>
        </div>
      </div>
    </div>
  );
}
