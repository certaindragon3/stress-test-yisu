import { normalize } from "./verify";

export const AXIS_KEYS = [
  "epistemological",
  "mastery",
  "jurisdictional",
] as const;

export type AxisKey = (typeof AXIS_KEYS)[number];

export type Verification = "pending" | "verified" | "unverified";

export type PartialQuote = {
  text?: string;
  source?: string;
};

export type PartialAxis = {
  prose?: string;
  quote?: PartialQuote | null;
};

export type PartialReading = {
  epistemological?: PartialAxis;
  mastery?: PartialAxis;
  jurisdictional?: PartialAxis;
  question?: string;
};

export type VerificationMap = Record<AxisKey, Verification>;

export type PressStreamEvent =
  | {
      type: "partial" | "finish";
      reading: PartialReading;
      verifications: VerificationMap;
    }
  | {
      type: "error";
      message: string;
    };

export function createPendingVerifications(): VerificationMap {
  return {
    epistemological: "pending",
    mastery: "pending",
    jurisdictional: "pending",
  };
}

export function mergeReading(
  base: PartialReading | null | undefined,
  incoming: PartialReading | null | undefined,
): PartialReading {
  const merged: PartialReading = {
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

export function deriveVerifications(
  reading: PartialReading,
  normalizedCorpus: string,
  isFinal: boolean,
): VerificationMap {
  const verifications = createPendingVerifications();

  for (const key of AXIS_KEYS) {
    const quote = reading[key]?.quote;
    if (quote === null) {
      verifications[key] = isFinal ? "verified" : "pending";
      continue;
    }

    if (!quote?.text || !quote.source) {
      verifications[key] = "pending";
      continue;
    }

    verifications[key] = normalizedCorpus.includes(normalize(quote.text))
      ? "verified"
      : isFinal
        ? "unverified"
        : "pending";
  }

  return verifications;
}
