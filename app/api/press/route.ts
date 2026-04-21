import { streamObject } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

import { YISU_CORPUS } from "@/lib/corpus";
import { ReadingSchema } from "@/lib/schema";
import { buildSystemPrompt } from "@/lib/system-prompt";

const MODEL_ID = "gemini-3-flash-preview";

// OpenNext's Cloudflare adapter currently supports Next's Node.js runtime,
// not `runtime = "edge"`, so keep the route explicit.
export const runtime = "nodejs";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function POST(req: Request) {
  const { claim } = (await req.json()) as { claim?: string };
  const trimmed = (claim ?? "").trim();

  if (!trimmed) {
    return new Response("claim required", { status: 400 });
  }

  const result = streamObject({
    model: google(MODEL_ID),
    schema: ReadingSchema,
    system: buildSystemPrompt(YISU_CORPUS),
    prompt: `Press the following claim:\n\n${trimmed}`,
    temperature: 0.4,
  });

  return result.toTextStreamResponse();
}
