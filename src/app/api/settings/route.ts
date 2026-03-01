import { NextResponse } from "next/server";
import { getSetting, setSetting } from "@/lib/db/queries";

export async function GET() {
  try {
    const provider = getSetting("provider");
    const model = getSetting("model");
    const hasApiKey = !!getSetting("api_key");

    return NextResponse.json({
      provider: provider ?? null,
      model: model ?? null,
      hasApiKey,
    });
  } catch {
    return NextResponse.json(
      { provider: null, model: null, hasApiKey: false },
      { status: 200 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { provider, model, apiKey } = body;

    if (provider) setSetting("provider", provider);
    if (model) setSetting("model", model);
    if (apiKey) {
      setSetting("api_key", apiKey);

      // Set the environment variable for the AI SDK providers
      switch (provider) {
        case "openai":
          process.env.OPENAI_API_KEY = apiKey;
          break;
        case "anthropic":
          process.env.ANTHROPIC_API_KEY = apiKey;
          break;
        case "google":
          process.env.GOOGLE_GENERATIVE_AI_API_KEY = apiKey;
          break;
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to save settings" },
      { status: 500 }
    );
  }
}
