import { generateText } from "ai";
import { nanoid } from "nanoid";
import { getModel } from "@/lib/providers/model";
import { getSetting, addSnapshot } from "@/lib/db/queries";
import type { Provider } from "@/types";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const imageFile = formData.get("image") as File | null;
    const sessionId = formData.get("sessionId") as string;

    if (!imageFile || !sessionId) {
      return Response.json(
        { error: "image and sessionId are required" },
        { status: 400 }
      );
    }

    const provider = (getSetting("provider") as Provider) || "openai";
    const model = getSetting("model") || "gpt-5-mini";
    const apiKey = getSetting("api_key");

    if (!apiKey) {
      return Response.json(
        { error: "No API key configured" },
        { status: 400 }
      );
    }

    // Set the API key
    const envKey =
      provider === "openai"
        ? "OPENAI_API_KEY"
        : provider === "anthropic"
          ? "ANTHROPIC_API_KEY"
          : "GOOGLE_GENERATIVE_AI_API_KEY";
    process.env[envKey] = apiKey;

    // Convert image to base64
    const buffer = Buffer.from(await imageFile.arrayBuffer());
    const base64 = buffer.toString("base64");

    // Generate description using vision
    const result = await generateText({
      model: getModel(provider, model),
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              image: `data:image/png;base64,${base64}`,
            },
            {
              type: "text",
              text: `Describe this system design whiteboard diagram in 2-3 sentences. Focus on:
1. What components are drawn (servers, databases, caches, queues, etc.)
2. How they are connected (arrows, data flow)
3. Any labels or text visible

Be concise and factual. This description will be used as context for an interviewer AI. Example: "The diagram shows a client connecting to an API gateway, which routes to two microservices. Service A connects to a PostgreSQL database, and Service B connects to Redis cache and a Kafka message queue."`,
            },
          ],
        },
      ],
    });

    const description = result.text;

    // Store snapshot
    addSnapshot({
      id: nanoid(12),
      sessionId,
      imageBlob: buffer,
      description,
    });

    return Response.json({ description });
  } catch (error) {
    console.error("Canvas describe error:", error);
    return Response.json(
      {
        error: "Failed to describe canvas",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
