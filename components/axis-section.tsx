import { QuoteBlock } from "@/components/quote-block";

type Verification = "pending" | "verified" | "unverified";

export function AxisSection({
  numeral,
  title,
  prose,
  quote,
  verification,
}: {
  numeral: string;
  title: string;
  prose: string | undefined;
  quote: { text?: string; source?: string } | null | undefined;
  verification: Verification;
}) {
  return (
    <section className="py-16">
      <header className="mb-8 flex items-baseline gap-4">
        <span className="roman-numeral text-2xl text-ink">{numeral}.</span>
        <h2 className="small-caps text-base text-neutral-700">{title}</h2>
      </header>
      <p className="text-xl leading-relaxed text-neutral-900">
        {prose ?? "\u00A0"}
      </p>
      {quote?.text && quote?.source ? (
        <QuoteBlock
          text={quote.text}
          source={quote.source}
          verification={verification}
        />
      ) : null}
    </section>
  );
}
