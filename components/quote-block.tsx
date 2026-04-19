type Verification = "pending" | "verified" | "unverified";

export function QuoteBlock({
  text,
  source,
  verification,
}: {
  text: string;
  source: string;
  verification: Verification;
}) {
  if (verification === "unverified") {
    return (
      <p className="small-caps mt-6 text-xs text-neutral-400">
        unverified — not rendered
      </p>
    );
  }

  if (verification === "pending") {
    return null;
  }

  return (
    <figure className="mt-8 border-l-2 border-ink pl-6">
      <blockquote className="text-xl italic leading-relaxed text-neutral-800">
        {text}
      </blockquote>
      <figcaption className="mt-3 flex items-baseline gap-3 text-sm text-neutral-500">
        <span>— {source}</span>
        <span className="small-caps text-[10px] text-ink">✓ verified</span>
      </figcaption>
    </figure>
  );
}
