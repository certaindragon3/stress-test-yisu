"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const EXAMPLE_CLAIMS = [
  "Prompting is the new literacy.",
  "AI tutors will replace TAs within five years.",
  "Students who don't use AI will fall behind.",
  "The essay is dead.",
  "Teachers should ban AI to preserve learning.",
];

export function ClaimInput({
  claim,
  onClaimChange,
  onPress,
  isLoading,
}: {
  claim: string;
  onClaimChange: (next: string) => void;
  onPress: () => void;
  isLoading: boolean;
}) {
  return (
    <div className="space-y-6">
      <Textarea
        value={claim}
        onChange={(e) => onClaimChange(e.target.value)}
        placeholder="Paste a claim about AI and education."
        rows={4}
        className="resize-none border-neutral-300 bg-white px-4 py-3 text-lg leading-relaxed text-neutral-900 shadow-none focus-visible:border-ink focus-visible:ring-0 md:text-lg"
        disabled={isLoading}
      />

      <div className="flex flex-wrap gap-2">
        {EXAMPLE_CLAIMS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => onClaimChange(c)}
            disabled={isLoading}
            className="rounded-full border border-neutral-300 bg-white px-3 py-1 text-sm italic text-neutral-600 transition-colors hover:border-ink hover:text-ink disabled:opacity-50"
          >
            {c}
          </button>
        ))}
      </div>

      <div className="flex justify-end">
        <Button
          onClick={onPress}
          disabled={isLoading || claim.trim().length === 0}
          className="h-11 rounded-none bg-ink px-6 text-base text-white shadow-none hover:bg-ink-hover"
        >
          Press
        </Button>
      </div>
    </div>
  );
}
