import { generateText } from "ai";
import { getModel } from "@/lib/providers/model";
import type { Provider } from "@/types";

export async function POST(req: Request) {
  try {
    const { provider, model, apiKey } = (await req.json()) as {
      provider: Provider;
      model: string;
      apiKey: string;
    };

    if (!provider || !model || !apiKey) {
      return Response.json(
        { valid: false, error: "provider, model, and apiKey are required" },
        { status: 400 }
      );
    }

    // Set the API key temporarily
    const envKey =
      provider === "openai"
        ? "OPENAI_API_KEY"
        : provider === "anthropic"
          ? "ANTHROPIC_API_KEY"
          : "GOOGLE_GENERATIVE_AI_API_KEY";
    process.env[envKey] = apiKey;

    // Test with a minimal request
    const result = await generateText({
      model: getModel(provider, model),
      messages: [{ role: "user", content: "Say OK" }],
      maxOutputTokens: 5,
    });

    return Response.json({
      valid: true,
      response: result.text.slice(0, 20),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    // Parse common API errors
    let userMessage = "Invalid API key or configuration";
    if (message.includes("401") || message.includes("Unauthorized")) {
      userMessage = "Invalid API key. Please check and try again.";
    } else if (message.includes("403") || message.includes("Forbidden")) {
      userMessage = "API key does not have access to this model.";
    } else if (message.includes("404") || message.includes("not found")) {
      userMessage = `Model "${(await req.json().catch(() => ({}))).model}" not found. Try a different model.`;
    } else if (message.includes("429") || message.includes("rate limit")) {
      userMessage = "Rate limited. Your API key is valid but wait a moment.";
    } else if (message.includes("quota") || message.includes("billing")) {
      userMessage = "API quota exceeded. Check your billing settings.";
    }

    return Response.json(
      { valid: false, error: userMessage },
      { status: 200 } // Return 200 so client can read error
    );
  }
}
