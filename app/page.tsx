"use client";

import { useEffect, useRef, useState } from "react";
import { experimental_useObject as useObject } from "@ai-sdk/react";

import { AxisSection } from "@/components/axis-section";
import { ClaimInput } from "@/components/claim-input";
import { FinalQuestion } from "@/components/final-question";
import { ReadingSchema } from "@/lib/schema";

type Verification = "pending" | "verified" | "unverified";

type AxisKey = "epistemological" | "mastery" | "jurisdictional";

const AXES: { key: AxisKey; numeral: string; title: string }[] = [
  { key: "epistemological", numeral: "I", title: "The Epistemological Axis" },
  { key: "mastery", numeral: "II", title: "The Mastery Pipeline" },
  { key: "jurisdictional", numeral: "III", title: "The Jurisdictional Move" },
];

async function verify(text: string): Promise<boolean> {
  const res = await fetch("/api/verify", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) return false;
  const data = (await res.json()) as { verified: boolean };
  return data.verified;
}

export default function Page() {
  const [claim, setClaim] = useState("");
  const [hasPressed, setHasPressed] = useState(false);
  const [verifications, setVerifications] = useState<
    Record<AxisKey, Verification>
  >({
    epistemological: "pending",
    mastery: "pending",
    jurisdictional: "pending",
  });
  const verifiedFor = useRef<Record<AxisKey, string | null>>({
    epistemological: null,
    mastery: null,
    jurisdictional: null,
  });

  const { object, submit, isLoading, error } = useObject({
    api: "/api/press",
    schema: ReadingSchema,
  });

  // Once streaming is done, verify each axis's quote against the corpus.
  useEffect(() => {
    if (isLoading || !object) return;
    AXES.forEach(({ key }) => {
      const q = object[key]?.quote;
      const text = q?.text;
      if (!text) {
        if (verifiedFor.current[key] !== "__none__") {
          verifiedFor.current[key] = "__none__";
          setVerifications((v) => ({ ...v, [key]: "verified" }));
        }
        return;
      }
      if (verifiedFor.current[key] === text) return;
      verifiedFor.current[key] = text;
      setVerifications((v) => ({ ...v, [key]: "pending" }));
      verify(text).then((ok) => {
        setVerifications((v) => ({
          ...v,
          [key]: ok ? "verified" : "unverified",
        }));
      });
    });
  }, [isLoading, object]);

  function handlePress() {
    if (claim.trim().length === 0) return;
    setHasPressed(true);
    setVerifications({
      epistemological: "pending",
      mastery: "pending",
      jurisdictional: "pending",
    });
    verifiedFor.current = {
      epistemological: null,
      mastery: null,
      jurisdictional: null,
    };
    submit({ claim: claim.trim() });
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
              prose={object?.[key]?.prose}
              quote={object?.[key]?.quote ?? null}
              verification={verifications[key]}
            />
          ))}

          <div className="flex items-baseline gap-4 border-t border-neutral-200 pt-16">
            <span className="roman-numeral text-2xl text-ink">IV.</span>
            <h2 className="small-caps text-base text-neutral-700">
              A Question Yisu Might Ask in Response
            </h2>
          </div>
          <FinalQuestion question={object?.question} />

          {!isLoading && object?.question ? (
            <button
              type="button"
              onClick={() => {
                setHasPressed(false);
                setClaim("");
              }}
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
