import { Output, streamText } from "ai";
import {
  createGoogleGenerativeAI,
  type GoogleLanguageModelOptions,
} from "@ai-sdk/google";

import {
  AXIS_KEYS,
  createPendingVerifications,
  type PartialReading,
  type PressStreamEvent,
  type VerificationMap,
} from "@/lib/press-stream";
import { resolveSource } from "@/lib/provenance";
import {
  selectCorpusForClaim,
  type QuoteCandidate,
} from "@/lib/retrieval";
import { ModelReadingSchema } from "@/lib/schema";
import { buildSystemPrompt } from "@/lib/system-prompt";
import { verifyQuote } from "@/lib/verify";

const DEFAULT_MODEL_ID = "gemini-2.5-flash";
const DEFAULT_MAX_OUTPUT_TOKENS = 900;
const DEFAULT_TEMPERATURE = 0;

const MODEL_ID = (process.env.GEMINI_MODEL_ID ?? DEFAULT_MODEL_ID).trim();
const THINKING_LEVEL = parseThinkingLevel(process.env.GEMINI_THINKING_LEVEL);

// OpenNext's Cloudflare adapter currently supports Next's Node.js runtime,
// not `runtime = "edge"`, so keep the route explicit.
export const runtime = "nodejs";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});
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
    "- The retrieved corpus contains inline anchors like <quote id=\"q12\">...</quote>.",
    "- For each axis, select exactly one quoteId from those anchors, or set quote to null.",
    "- Do not generate quote text or source labels yourself. The caller will hydrate the exact quote and source from the quoteId you choose.",
    "- When the retrieved corpus honestly supports it, prefer different essay titles across the three axis quotes rather than repeating the same essay.",
    "- If no anchored sentence fits honestly, set quote to null rather than forcing a weak citation.",
  ].join("\n");
}

type PartialModelQuote = {
  quoteId?: string;
};

type PartialModelAxis = {
  prose?: string;
  quote?: PartialModelQuote | null;
};

type PartialModelReading = {
  epistemological?: PartialModelAxis;
  mastery?: PartialModelAxis;
  jurisdictional?: PartialModelAxis;
  question?: string;
};

function mergeModelReading(
  base: PartialModelReading | null | undefined,
  incoming: PartialModelReading | null | undefined,
): PartialModelReading {
  const merged: PartialModelReading = {
    ...(base ?? {}),
  };

  for (const key of AXIS_KEYS) {
    const nextAxis = incoming?.[key];
    if (nextAxis === undefined) continue;

    const previousAxis = merged[key];
    const nextQuote =
      nextAxis.quote === undefined
        ? previousAxis?.quote
        : nextAxis.quote === null
          ? null
          : {
              ...(previousAxis?.quote && previousAxis.quote !== null
                ? previousAxis.quote
                : {}),
              ...nextAxis.quote,
            };

    merged[key] = {
      ...(previousAxis ?? {}),
      ...nextAxis,
      quote: nextQuote,
    };
  }

  if (incoming?.question !== undefined) {
    merged.question = incoming.question;
  }

  return merged;
}

function hydrateReading(
  reading: PartialModelReading,
  quotes: Record<string, QuoteCandidate>,
  isFinal: boolean,
): {
  reading: PartialReading;
  verifications: VerificationMap;
} {
  const hydrated: PartialReading = {};
  const verifications = createPendingVerifications();

  for (const key of AXIS_KEYS) {
    const modelAxis = reading[key];
    if (!modelAxis) {
      if (isFinal) {
        verifications[key] = "unverified";
      }
      continue;
    }

    const axis: PartialReading[typeof key] = {};
    if (modelAxis.prose !== undefined) {
      axis.prose = modelAxis.prose;
    }

    const quote = modelAxis.quote;
    if (quote === null) {
      axis.quote = null;
      verifications[key] = isFinal ? "verified" : "pending";
      hydrated[key] = axis;
      continue;
    }

    if (quote === undefined) {
      if (isFinal) {
        axis.quote = null;
        verifications[key] = "unverified";
      }
      if (Object.keys(axis).length > 0) {
        hydrated[key] = axis;
      }
      continue;
    }

    const candidate = quote.quoteId ? quotes[quote.quoteId] : undefined;
    if (!candidate) {
      if (isFinal) {
        axis.quote = null;
        verifications[key] = "unverified";
      }
      if (Object.keys(axis).length > 0) {
        hydrated[key] = axis;
      }
      continue;
    }

    const resolved = resolveSource(candidate.source);
    const verified = resolved ? verifyQuote(candidate.text, resolved.body) : false;
    verifications[key] = verified ? "verified" : isFinal ? "unverified" : "pending";
    axis.quote =
      verifications[key] === "unverified"
        ? null
        : {
            text: candidate.text,
            source: candidate.source,
          };
    hydrated[key] = axis;
  }

  if (reading.question !== undefined) {
    hydrated.question = reading.question;
  }

  return {
    reading: hydrated,
    verifications,
  };
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
    output: Output.object({ schema: ModelReadingSchema }),
    system: buildSystemPrompt(selection.corpus),
    prompt: buildCallerPrompt(trimmed),
    maxOutputTokens: MAX_OUTPUT_TOKENS,
    temperature: TEMPERATURE,
    providerOptions,
    onError({ error }) {
      streamError = error;
    },
  });

  let latestModelReading: PartialModelReading = {};

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const partial of result.partialOutputStream) {
          latestModelReading = mergeModelReading(
            latestModelReading,
            partial as PartialModelReading,
          );
          const hydrated = hydrateReading(
            latestModelReading,
            selection.quotes,
            false,
          );
          controller.enqueue(
            encodeEvent({
              type: "partial",
              reading: hydrated.reading,
              verifications: hydrated.verifications,
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

        latestModelReading = mergeModelReading(
          latestModelReading,
          (await result.output) as PartialModelReading,
        );
        const hydrated = hydrateReading(
          latestModelReading,
          selection.quotes,
          true,
        );
        controller.enqueue(
          encodeEvent({
            type: "finish",
            reading: hydrated.reading,
            verifications: hydrated.verifications,
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
