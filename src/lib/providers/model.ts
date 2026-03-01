import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";
import { google } from "@ai-sdk/google";
import type { Provider } from "@/types";

const PROVIDER_MODELS: Record<Provider, string[]> = {
  openai: ["gpt-5", "gpt-5-mini", "gpt-4.1", "gpt-4o"],
  anthropic: ["claude-sonnet-4-6", "claude-haiku-4-5", "claude-opus-4-6"],
  google: ["gemini-2.5-flash", "gemini-2.5-pro"],
};

export function getModel(provider: Provider, modelId: string) {
  switch (provider) {
    case "openai":
      return openai(modelId);
    case "anthropic":
      return anthropic(modelId);
    case "google":
      return google(modelId);
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}

export function getAvailableModels(provider: Provider): string[] {
  return PROVIDER_MODELS[provider] ?? [];
}

export function getDefaultModel(provider: Provider): string {
  const models = getAvailableModels(provider);
  return models[0];
}

export function getAllProviders(): Provider[] {
  return Object.keys(PROVIDER_MODELS) as Provider[];
}
