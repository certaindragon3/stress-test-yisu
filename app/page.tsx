"use client";

import { useEffect, useRef, useState } from "react";

import { AxisSection } from "@/components/axis-section";
import { ClaimInput } from "@/components/claim-input";
import { FinalQuestion } from "@/components/final-question";
import {
  createPendingVerifications,
  mergeReading,
  type PartialReading,
  type PressStreamEvent,
  type VerificationMap,
} from "@/lib/press-stream";

type StreamError = Error | null;

const AXES = [
  { key: "epistemological", numeral: "I", title: "The Epistemological Axis" },
  { key: "mastery", numeral: "II", title: "The Mastery Pipeline" },
  { key: "jurisdictional", numeral: "III", title: "The Jurisdictional Move" },
] as const;

function toError(message: string): Error {
  return new Error(message || "The instrument failed to respond.");
}

function parseEvents(buffer: string): {
  rest: string;
  events: PressStreamEvent[];
} {
  const events: PressStreamEvent[] = [];
  let cursor = 0;

  while (true) {
    const newlineIndex = buffer.indexOf("\n", cursor);
    if (newlineIndex < 0) {
      return { rest: buffer.slice(cursor), events };
    }

    const line = buffer.slice(cursor, newlineIndex).trim();
    cursor = newlineIndex + 1;
    if (!line) continue;
    events.push(JSON.parse(line) as PressStreamEvent);
  }
}

export default function Page() {
  const [claim, setClaim] = useState("");
  const [hasPressed, setHasPressed] = useState(false);
  const [reading, setReading] = useState<PartialReading>({});
  const [verifications, setVerifications] = useState<VerificationMap>(
    createPendingVerifications(),
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<StreamError>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  function resetStreamState() {
    abortRef.current?.abort();
    abortRef.current = null;
    setReading({});
    setVerifications(createPendingVerifications());
    setError(null);
    setIsLoading(false);
  }

  async function streamPress(nextClaim: string) {
    const controller = new AbortController();
    abortRef.current = controller;
    setIsLoading(true);

    try {
      const res = await fetch("/api/press", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ claim: nextClaim }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        throw toError(`The instrument failed to respond. ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let finished = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parsed = parseEvents(buffer);
        buffer = parsed.rest;

        for (const event of parsed.events) {
          if (event.type === "error") {
            throw toError(event.message);
          }

          setReading((current) => mergeReading(current, event.reading));
          setVerifications(event.verifications);

          if (event.type === "finish") {
            finished = true;
            setIsLoading(false);
          }
        }
      }

      buffer += decoder.decode();
      const parsed = parseEvents(buffer);
      for (const event of parsed.events) {
        if (event.type === "error") {
          throw toError(event.message);
        }
        setReading((current) => mergeReading(current, event.reading));
        setVerifications(event.verifications);
        if (event.type === "finish") {
          finished = true;
        }
      }

      if (!finished && !controller.signal.aborted) {
        setIsLoading(false);
      }
    } catch (streamError) {
      if (controller.signal.aborted) return;
      setError(
        streamError instanceof Error
          ? streamError
          : toError("The instrument failed to respond."),
      );
      setIsLoading(false);
    } finally {
      if (abortRef.current === controller) {
        abortRef.current = null;
      }
    }
  }

  function handlePress() {
    const nextClaim = claim.trim();
    if (nextClaim.length === 0) return;

    setHasPressed(true);
    resetStreamState();
    void streamPress(nextClaim);
  }

  function handlePressAgain() {
    resetStreamState();
    setHasPressed(false);
    setClaim("");
  }

  return (
    <main className="mx-auto min-h-svh max-w-2xl px-6 py-16 md:py-24">
      <header className="mb-16">
        <p className="small-caps text-xs text-neutral-500">
          A thinking instrument, after Yisu Zhou
        </p>
        <h1 className="mt-2 text-3xl font-medium text-ink md:text-4xl">
          The AI Discourse Stress-Tester
        </h1>
      </header>

      <ClaimInput
        claim={claim}
        onClaimChange={setClaim}
        onPress={handlePress}
        isLoading={isLoading}
      />

      {error ? (
        <p className="mt-12 text-sm text-red-700">
          The instrument failed to respond. {error.message}
        </p>
      ) : null}

      {hasPressed ? (
        <div className="mt-16 border-t border-neutral-200">
          {AXES.map(({ key, numeral, title }) => (
            <AxisSection
              key={key}
              numeral={numeral}
              title={title}
              prose={reading[key]?.prose}
              quote={reading[key]?.quote ?? null}
              verification={verifications[key]}
            />
          ))}

          <div className="flex items-baseline gap-4 border-t border-neutral-200 pt-16">
            <span className="roman-numeral text-2xl text-ink">IV.</span>
            <h2 className="small-caps text-base text-neutral-700">
              A Question Yisu Might Ask in Response
            </h2>
          </div>
          <FinalQuestion question={reading.question} />

          {!isLoading && reading.question ? (
            <button
              type="button"
              onClick={handlePressAgain}
              className="small-caps text-xs text-neutral-500 hover:text-ink"
            >
              Press again ↑
            </button>
          ) : null}
        </div>
      ) : null}
    </main>
  );
}
