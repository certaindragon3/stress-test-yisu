import { Output, streamText } from "ai";
import {
  createGoogleGenerativeAI,
  type GoogleLanguageModelOptions,
} from "@ai-sdk/google";

import {
  deriveVerifications,
  mergeReading,
  type PartialReading,
  type PressStreamEvent,
} from "@/lib/press-stream";
import { selectCorpusForClaim } from "@/lib/retrieval";
import { ReadingSchema } from "@/lib/schema";
import { buildSystemPrompt } from "@/lib/system-prompt";
import { YISU_CORPUS } from "@/lib/corpus";
import { normalize } from "@/lib/verify";

const DEFAULT_MODEL_ID = "gemini-2.5-flash";
const DEFAULT_MAX_OUTPUT_TOKENS = 900;
const DEFAULT_TEMPERATURE = 0.4;

const MODEL_ID = (process.env.GEMINI_MODEL_ID ?? DEFAULT_MODEL_ID).trim();
const THINKING_LEVEL = parseThinkingLevel(process.env.GEMINI_THINKING_LEVEL);

// OpenNext's Cloudflare adapter currently supports Next's Node.js runtime,
// not `runtime = "edge"`, so keep the route explicit.
export const runtime = "nodejs";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});
const NORMALIZED_YISU_CORPUS = normalize(YISU_CORPUS);
const MAX_OUTPUT_TOKENS = parsePositiveInt(
  process.env.GEMINI_MAX_OUTPUT_TOKENS,
  DEFAULT_MAX_OUTPUT_TOKENS,
);
const THINKING_BUDGET = parseNonNegativeInt(process.env.GEMINI_THINKING_BUDGET);
const TEMPERATURE = parseTemperature(
  process.env.GEMINI_TEMPERATURE,
  DEFAULT_TEMPERATURE,
);

function parsePositiveInt(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function parseNonNegativeInt(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

function parseTemperature(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

function parseThinkingLevel(
  value: string | undefined,
): "minimal" | "low" | "medium" | "high" | undefined {
  if (
    value === "minimal" ||
    value === "low" ||
    value === "medium" ||
    value === "high"
  ) {
    return value;
  }
  return undefined;
}

function isGemini3FlashModel(modelId: string): boolean {
  return (
    modelId === "gemini-flash-latest" ||
    modelId === "gemini-flash-lite-latest" ||
    /gemini-3(\.1)?-flash/.test(modelId)
  );
}

function isGemini31ProModel(modelId: string): boolean {
  return modelId.startsWith("gemini-3.1-pro");
}

function isGemini3ProModel(modelId: string): boolean {
  return modelId.startsWith("gemini-3-pro");
}

function googleProviderOptions():
  | {
      google: GoogleLanguageModelOptions;
    }
  | undefined {
  const googleOptions: GoogleLanguageModelOptions = {};
  const tier = process.env.GEMINI_SERVICE_TIER;

  if (tier === "standard" || tier === "flex" || tier === "priority") {
    googleOptions.serviceTier = tier;
  }

  if (MODEL_ID.startsWith("gemini-2.5")) {
    googleOptions.thinkingConfig = {
      thinkingBudget: THINKING_BUDGET ?? 0,
    };
  } else if (isGemini31ProModel(MODEL_ID)) {
    googleOptions.thinkingConfig = {
      thinkingLevel:
        THINKING_LEVEL === "medium" || THINKING_LEVEL === "high"
          ? THINKING_LEVEL
          : "low",
    };
  } else if (isGemini3ProModel(MODEL_ID)) {
    googleOptions.thinkingConfig = {
      thinkingLevel: THINKING_LEVEL === "high" ? "high" : "low",
    };
  } else if (isGemini3FlashModel(MODEL_ID)) {
    googleOptions.thinkingConfig = {
      thinkingLevel: THINKING_LEVEL ?? "minimal",
    };
  }

  return Object.keys(googleOptions).length === 0 ? undefined : { google: googleOptions };
}

function encodeEvent(event: PressStreamEvent): Uint8Array {
  return new TextEncoder().encode(`${JSON.stringify(event)}\n`);
}

function errorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  return "The instrument failed to respond.";
}

function buildCallerPrompt(claim: string): string {
  return [
    "Press the following claim:",
    "",
    claim,
    "",
    "Caller constraints:",
    "- Quotations are checked mechanically against the retrieved corpus. Copy exact substrings only; if exact wording is uncertain, set quote to null.",
    "- When the retrieved corpus honestly supports it, prefer different essay titles across the three axis quotes rather than repeating the same essay.",
    "- If breadth and exactness conflict, preserve exactness and set quote to null rather than invent breadth.",
  ].join("\n");
}

export async function POST(req: Request) {
  const { claim } = (await req.json()) as { claim?: string };
  const trimmed = (claim ?? "").trim();

  if (!trimmed) {
    return new Response("claim required", { status: 400 });
  }

  const selection = selectCorpusForClaim(trimmed);
  const providerOptions = googleProviderOptions();
  let streamError: unknown = null;
  const result = streamText({
    model: google(MODEL_ID),
    output: Output.object({ schema: ReadingSchema }),
    system: buildSystemPrompt(selection.corpus),
    prompt: buildCallerPrompt(trimmed),
    maxOutputTokens: MAX_OUTPUT_TOKENS,
    temperature: TEMPERATURE,
    providerOptions,
    onError({ error }) {
      streamError = error;
    },
  });

  let latestReading: PartialReading = {};

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const partial of result.partialOutputStream) {
          latestReading = mergeReading(latestReading, partial as PartialReading);
          controller.enqueue(
            encodeEvent({
              type: "partial",
              reading: latestReading,
              verifications: deriveVerifications(
                latestReading,
                NORMALIZED_YISU_CORPUS,
                false,
              ),
            }),
          );
        }

        if (streamError) {
          controller.enqueue(
            encodeEvent({
              type: "error",
              message: errorMessage(streamError),
            }),
          );
          controller.close();
          return;
        }

        latestReading = mergeReading(
          latestReading,
          (await result.output) as PartialReading,
        );
        controller.enqueue(
          encodeEvent({
            type: "finish",
            reading: latestReading,
            verifications: deriveVerifications(
              latestReading,
              NORMALIZED_YISU_CORPUS,
              true,
            ),
          }),
        );
        controller.close();
      } catch (error) {
        controller.enqueue(
          encodeEvent({
            type: "error",
            message: errorMessage(error),
          }),
        );
        controller.close();
      }
    },
  });

  const effectiveThinkingConfig = providerOptions?.google.thinkingConfig;

  return new Response(stream, {
    headers: {
      "content-type": "application/x-ndjson; charset=utf-8",
      "x-yisu-context-chars": String(selection.charCount),
      "x-yisu-context-excerpts": String(selection.excerptCount),
      "x-yisu-context-sources": String(selection.sourceCount),
      "x-yisu-context-mode": selection.mode,
      "x-yisu-model-id": MODEL_ID,
      "x-yisu-max-output-tokens": String(MAX_OUTPUT_TOKENS),
      "x-yisu-temperature": String(TEMPERATURE),
      "x-yisu-thinking-level":
        effectiveThinkingConfig?.thinkingLevel ?? "",
      "x-yisu-thinking-budget":
        effectiveThinkingConfig?.thinkingBudget === undefined
          ? ""
          : String(effectiveThinkingConfig.thinkingBudget),
    },
  });
}
