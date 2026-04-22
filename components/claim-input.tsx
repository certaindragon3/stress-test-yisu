"use client"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

const EXAMPLE_CLAIMS = [
  "Prompting is the new literacy.",
  "AI tutors will replace TAs within five years.",
  "Kids shouldn't learn to code — leave it up to AI.",
  "The essay is dead.",
  "Within ten years, AI will replace many doctors and teachers.",
]

export function ClaimInput({
  claim,
  onClaimChange,
  onPress,
  isLoading,
  isPressActive,
}: {
  claim: string
  onClaimChange: (next: string) => void
  onPress: () => void
  isLoading: boolean
  isPressActive: boolean
}) {
  const isBusy = isLoading || isPressActive

  return (
    <div className="space-y-6">
      <Textarea
        value={claim}
        onChange={(e) => onClaimChange(e.target.value)}
        placeholder="Paste a claim about AI and education."
        rows={4}
        data-busy={isBusy}
        className="motion-claim-textarea resize-none rounded-none border-neutral-300 bg-white px-4 py-3 text-lg leading-relaxed text-neutral-900 shadow-none focus-visible:border-ink focus-visible:ring-0 data-[busy=true]:border-ink data-[busy=true]:bg-ink-wash/60 data-[busy=true]:text-ink md:text-lg"
        disabled={isLoading}
      />

      <div className="flex flex-wrap gap-2">
        {EXAMPLE_CLAIMS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => onClaimChange(c)}
            aria-pressed={claim === c}
            data-active={claim === c}
            data-busy={isBusy}
            disabled={isLoading}
            className="motion-chip border border-neutral-300 bg-white px-3 py-1 text-sm text-neutral-600 italic hover:border-ink hover:text-ink disabled:opacity-50 data-[active=true]:border-ink data-[active=true]:bg-ink-wash data-[active=true]:text-ink"
          >
            {c}
          </button>
        ))}
      </div>

      <div className="flex justify-end">
        <Button
          onClick={onPress}
          disabled={isLoading || claim.trim().length === 0}
          data-busy={isBusy}
          className="motion-press-button h-11 rounded-none bg-ink px-6 text-base text-white shadow-none hover:bg-ink-hover active:translate-y-px active:scale-[0.992] data-[busy=true]:bg-ink-hover"
        >
          Press
        </Button>
      </div>
    </div>
  )
}
